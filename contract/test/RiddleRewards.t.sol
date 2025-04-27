// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "forge-std/Test.sol";
import "../src/RiddleRewards.sol";

/**
 * @title Test Suite for RiddleRewards Contract
 * @author Muhammad Ramadhani
 * @notice Contains unit tests for the RiddleRewards smart contract using the Foundry framework.
 * @dev Sets up a test environment, deploys RiddleRewards, and executes various scenarios
 * to verify its functionality including funding, eligibility, claiming, cooldowns, owner controls, and edge cases.
 */
contract RiddleRewardsTest is Test {
    /// @notice Instance of the RiddleRewards contract being tested.
    RiddleRewards public riddleRewards;
    /// @notice Address designated as the owner for test scenarios.
    address payable public owner = payable(address(0x1));
    /// @notice Address representing a regular user in tests.
    address payable public user1 = payable(address(0x2));
    /// @notice Address representing another regular user in tests.
    address payable public user2 = payable(address(0x3));

    /// @notice Constant defining the initial ETH amount funded to the contract in setUp.
    uint256 public constant INITIAL_FUND = 1 ether;
    /// @notice Constant defining the standard reward amount used in claim tests.
    uint256 public constant REWARD_AMOUNT = 0.1 ether;
    /// @notice Constant mirroring the default cooldown blocks, used for verification.
    uint256 public constant COOLDOWN_BLOCKS = 7200;

    /// @notice Mirrors RiddleRewards.RewardClaimed event for emission testing.
    event RewardClaimed(address indexed user, uint256 rewardAmount);
    /// @notice Mirrors RiddleRewards.Funded event for emission testing.
    event Funded(address indexed funder, uint256 amount);
    /// @notice Mirrors RiddleRewards.CooldownUpdated event for emission testing.
    event CooldownUpdated(uint256 newCooldownBlocks);
    /// @notice Mirrors RiddleRewards.MarkedAsWinner event for emission testing.
    event MarkedAsWinner(address indexed user);

    /**
     * @notice Sets up the testing environment before each test function runs.
     * @dev Deploys a new RiddleRewards contract instance with `owner` as the deployer,
     * deals initial ETH balances to the owner, funds the contract with `INITIAL_FUND`,
     * and advances the block number slightly (to 1000) for testing purposes.
     */
    function setUp() public {
        vm.startPrank(owner);
        riddleRewards = new RiddleRewards();
        // Deal ETH to owner *before* funding the contract
        vm.deal(owner, 10 ether);
        // Fund the contract using a call with value
        (bool success,) = address(riddleRewards).call{value: INITIAL_FUND}("");
        assertTrue(success, "Initial funding failed");
        vm.stopPrank();

        // Advance blocks after setup
        vm.roll(1000); // Start tests at block 1000
    }

    /// @notice Tests if the reward pool can be funded correctly via the `fundPool` function and direct `receive`.
    /// @dev Verifies initial funding from setUp and checks pool balance after an additional funding call from `user1`. Checks event emission.
    function test_FundPool() public {
        uint256 initialPool = riddleRewards.rewardPool();
        assertEq(initialPool, INITIAL_FUND, "Initial pool incorrect");

        // Fund using fundPool function
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit Funded(user1, 0.5 ether);
        riddleRewards.fundPool{value: 0.5 ether}();

        assertEq(riddleRewards.rewardPool(), INITIAL_FUND + 0.5 ether, "Reward pool not updated after fundPool");
    }

    /// @notice Tests if the owner can successfully mark a user as eligible to claim.
    /// @dev Calls `markAsWinner` as owner and asserts the user's eligibility status and event emission.
    function test_MarkAsWinner_Success() public {
        vm.prank(owner);

        vm.expectEmit(true, false, false, true); // user is indexed
        emit MarkedAsWinner(user1);

        riddleRewards.markAsWinner(user1);

        assertTrue(riddleRewards.eligibleToClaim(user1), "User1 should be eligible to claim");
    }

    /// @notice Tests that a non-owner cannot mark a user as eligible to claim.
    /// @dev Calls `markAsWinner` as `user1` (non-owner) and expects the "Only owner" revert. Asserts user remains ineligible.
    function test_MarkAsWinner_NonOwner() public {
        vm.prank(user1);

        vm.expectRevert("Only owner");
        riddleRewards.markAsWinner(user1);

        assertFalse(riddleRewards.eligibleToClaim(user1), "User1 should not be eligible to claim");
    }

    /// @notice Tests the complete successful reward claiming process for an eligible user.
    /// @dev Marks `user1` eligible, deals ETH to `user1` for gas, then `user1` claims. Asserts pool reduction,
    ///      last claim block update, eligibility reset, claimant balance increase, and event emission.
    function test_ClaimReward_Success() public {
        // Arrange: Mark user1 as winner by owner
        vm.prank(owner);
        riddleRewards.markAsWinner(user1);

        // Arrange: Give user1 some ETH for gas (though test environment often handles this)
        vm.deal(user1, 1 ether);
        uint256 user1InitialBalance = user1.balance; // Balance before claim

        // Act: User1 claims reward
        vm.startPrank(user1);
        vm.expectEmit(true, false, false, true); // user is indexed
        emit RewardClaimed(user1, REWARD_AMOUNT);
        riddleRewards.claimReward(REWARD_AMOUNT);
        uint256 blockAfterClaim = block.number; // Claim happens in this block
        vm.stopPrank();

        // Assert
        assertEq(riddleRewards.rewardPool(), INITIAL_FUND - REWARD_AMOUNT, "Reward pool not reduced");
        assertEq(riddleRewards.lastClaimBlock(user1), blockAfterClaim, "Last claim block not updated correctly"); // Should be the block of the claim tx
        assertFalse(riddleRewards.eligibleToClaim(user1), "User1 should no longer be eligible");
        assertEq(user1.balance, user1InitialBalance + REWARD_AMOUNT, "User1 balance not updated correctly");
    }

    /// @notice Tests that a user who has not been marked eligible cannot claim a reward.
    /// @dev Calls `claimReward` as `user1` without prior marking, expects "Not eligible to claim" revert. Asserts pool and balance unchanged.
    function test_ClaimReward_NotEligible() public {
        vm.deal(user1, 1 ether); // Give some balance just in case
        uint256 user1InitialBalance = user1.balance;
        uint256 initialPool = riddleRewards.rewardPool();

        vm.prank(user1);
        vm.expectRevert("Not eligible to claim");
        riddleRewards.claimReward(REWARD_AMOUNT);

        // Assert state hasn't changed
        assertEq(riddleRewards.rewardPool(), initialPool, "Reward pool should not change");
        assertEq(user1.balance, user1InitialBalance, "User1 balance should not change");
    }

    /// @notice Tests that a claim fails if the requested amount exceeds the available reward pool.
    /// @dev Marks user1 eligible, then user1 attempts to claim more than `INITIAL_FUND`. Expects "Not enough reward pool" revert.
    function test_ClaimReward_InsufficientFunds() public {
        // Arrange: Mark user1 as winner
        vm.prank(owner);
        riddleRewards.markAsWinner(user1);

        // Act & Assert: User1 attempts to claim more than available
        vm.prank(user1);
        vm.expectRevert("Not enough reward pool");
        riddleRewards.claimReward(INITIAL_FUND + 1 wei); // Try to claim slightly more
    }

    /// @notice Tests that a claim fails if the requested amount is zero.
    /// @dev Marks user1 eligible, then user1 attempts to claim 0 ETH. Expects "Invalid reward amount" revert.
    function test_ClaimReward_InvalidAmount() public {
        // Arrange: Mark user1 as winner
        vm.prank(owner);
        riddleRewards.markAsWinner(user1);

        // Act & Assert: User1 attempts to claim 0
        vm.prank(user1);
        vm.expectRevert("Invalid reward amount");
        riddleRewards.claimReward(0);
    }

    /// @notice Tests that the owner can update the claim cooldown period and that non-owners cannot.
    /// @dev Owner calls `updateClaimCooldown` successfully, checks new value and event emission.
    ///      Then, `user1` attempts to call it and expects "Only owner" revert.
    function test_UpdateClaimCooldown() public {
        uint256 newCooldown = 14400;

        // Test successful update by owner
        vm.startPrank(owner);
        vm.expectEmit(false, false, false, true); // No indexed params
        emit CooldownUpdated(newCooldown);
        riddleRewards.updateClaimCooldown(newCooldown);
        assertEq(riddleRewards.claimCooldownBlocks(), newCooldown, "Cooldown not updated");
        vm.stopPrank();

        // Test revert for non-owner
        vm.prank(user1);
        vm.expectRevert("Only owner");
        riddleRewards.updateClaimCooldown(1000); // Try to change it back
    }

    /// @notice Tests the emergency withdrawal function by the owner.
    /// @dev Owner calls `emergencyWithdraw`. Asserts pool is zeroed, owner balance increases by the initial fund amount, and event emission.
    ///      Also tests that a non-owner cannot call this function.
    function test_EmergencyWithdraw() public {
        uint256 initialOwnerBalance = owner.balance; // Balance *after* initial funding in setUp

        // Test successful withdrawal by owner
        vm.startPrank(owner);
        vm.expectEmit(true, true, false, true); // Funder (address(0)) is indexed
        emit Funded(address(0), 0); // The event emitted by the function
        riddleRewards.emergencyWithdraw();

        assertEq(riddleRewards.rewardPool(), 0, "Reward pool not zeroed after withdrawal");
        assertEq(address(riddleRewards).balance, 0, "Contract balance not zero after withdrawal");
        // Owner gets back the INITIAL_FUND that was put in
        assertEq(owner.balance, initialOwnerBalance + INITIAL_FUND, "Owner balance not correctly restored");
        vm.stopPrank();

        // Test revert for non-owner
        vm.prank(user1);
        vm.expectRevert("Only owner");
        riddleRewards.emergencyWithdraw();
    }

    /// @notice Tests funding the pool by sending ETH directly to the contract address via the `receive` fallback function.
    /// @dev `user2` sends ETH directly. Asserts the pool balance increases correctly and the `Funded` event is emitted.
    function test_Receive() public {
        vm.deal(user2, 1 ether);
        uint256 amountToSend = 0.2 ether;
        uint256 initialPool = riddleRewards.rewardPool();

        vm.prank(user2);
        vm.expectEmit(true, true, false, true); // funder is indexed
        emit Funded(user2, amountToSend);
        (bool success,) = address(riddleRewards).call{value: amountToSend}("");
        assertTrue(success, "Receive fallback failed");

        assertEq(riddleRewards.rewardPool(), initialPool + amountToSend, "Reward pool not updated via receive");
    }

    /// @notice Verifies that the owner set in the constructor matches the expected owner address.
    /// @dev Checks the immutable `owner` variable set during deployment.
    function test_OwnerImmutable() public view {
        assertEq(riddleRewards.owner(), owner, "Owner not set correctly in constructor");
    }
}
