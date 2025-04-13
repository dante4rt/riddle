// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "forge-std/Test.sol";
import "../src/RiddleRewards.sol";

contract RiddleRewardsTest is Test {
    RiddleRewards public riddleRewards;
    address payable public owner = payable(address(0x1));
    address payable public user1 = payable(address(0x2));
    address payable public user2 = payable(address(0x3));

    uint256 public constant INITIAL_FUND = 1 ether;
    uint256 public constant REWARD_AMOUNT = 0.1 ether;
    uint256 public constant COOLDOWN_BLOCKS = 7200;

    event RewardClaimed(address indexed user, uint256 rewardAmount);
    event Funded(address indexed funder, uint256 amount);
    event CooldownUpdated(uint256 newCooldownBlocks);
    event MarkedAsWinner(address indexed user);

    function setUp() public {
        vm.startPrank(owner);
        riddleRewards = new RiddleRewards();
        vm.deal(owner, 10 ether);
        vm.stopPrank();

        vm.prank(owner);
        (bool success,) = address(riddleRewards).call{value: INITIAL_FUND}("");
        assertTrue(success, "Initial funding failed");

        vm.roll(1000);
    }

    function test_FundPool() public {
        uint256 initialPool = riddleRewards.rewardPool();
        assertEq(initialPool, INITIAL_FUND, "Initial pool incorrect");

        vm.deal(user1, 1 ether);
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit Funded(user1, 0.5 ether);
        riddleRewards.fundPool{value: 0.5 ether}();

        assertEq(riddleRewards.rewardPool(), INITIAL_FUND + 0.5 ether, "Reward pool not updated");
    }

    function test_MarkAsWinner_Success() public {
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit MarkedAsWinner(user1);
        riddleRewards.markAsWinner(user1);

        assertTrue(riddleRewards.eligibleToClaim(user1), "User1 should be eligible to claim");
    }

    function test_MarkAsWinner_NonOwner() public {
        vm.prank(user1);
        vm.expectRevert("Only owner");
        riddleRewards.markAsWinner(user1);

        assertFalse(riddleRewards.eligibleToClaim(user1), "User1 should not be eligible to claim");
    }

    function test_ClaimReward_Success() public {
        vm.prank(owner);
        riddleRewards.markAsWinner(user1);

        vm.deal(user1, 1 ether);
        vm.startPrank(user1);

        assertEq(riddleRewards.lastClaimBlock(user1), 0, "Initial lastClaimBlock should be 0");

        vm.expectEmit(true, false, false, true);
        emit RewardClaimed(user1, REWARD_AMOUNT);
        riddleRewards.claimReward(REWARD_AMOUNT);

        assertEq(riddleRewards.rewardPool(), INITIAL_FUND - REWARD_AMOUNT, "Reward pool not reduced");
        assertEq(riddleRewards.lastClaimBlock(user1), block.number, "Last claim block not updated");
        assertFalse(riddleRewards.eligibleToClaim(user1), "User1 should no longer be eligible");
        assertEq(user1.balance, 1 ether + REWARD_AMOUNT, "User1 balance not updated");

        vm.stopPrank();
    }

    function test_ClaimReward_NotEligible() public {
        vm.prank(user1);
        vm.expectRevert("Not eligible to claim");
        riddleRewards.claimReward(REWARD_AMOUNT);

        assertEq(riddleRewards.rewardPool(), INITIAL_FUND, "Reward pool should not change");
        assertEq(user1.balance, 0, "User1 balance should not change");
    }

    function test_ClaimReward_InsufficientFunds() public {
        vm.prank(owner);
        riddleRewards.markAsWinner(user1);

        vm.prank(user1);
        vm.expectRevert("Not enough reward pool");
        riddleRewards.claimReward(INITIAL_FUND + 1 ether);
    }

    function test_ClaimReward_InvalidAmount() public {
        vm.prank(owner);
        riddleRewards.markAsWinner(user1);

        vm.prank(user1);
        vm.expectRevert("Invalid reward amount");
        riddleRewards.claimReward(0);
    }

    function test_UpdateClaimCooldown() public {
        vm.startPrank(owner);

        uint256 newCooldown = 14400;
        vm.expectEmit(false, false, false, true);
        emit CooldownUpdated(newCooldown);
        riddleRewards.updateClaimCooldown(newCooldown);

        assertEq(riddleRewards.claimCooldownBlocks(), newCooldown, "Cooldown not updated");

        vm.stopPrank();

        vm.prank(user1);
        vm.expectRevert("Only owner");
        riddleRewards.updateClaimCooldown(1000);
    }

    function test_EmergencyWithdraw() public {
        vm.startPrank(owner);
        uint256 initialOwnerBalance = owner.balance;

        vm.expectEmit(true, true, false, true);
        emit Funded(address(0), 0);
        riddleRewards.emergencyWithdraw();

        assertEq(riddleRewards.rewardPool(), 0, "Reward pool not zeroed");
        assertEq(owner.balance, initialOwnerBalance + INITIAL_FUND, "Owner balance not updated");

        vm.stopPrank();

        vm.prank(user1);
        vm.expectRevert("Only owner");
        riddleRewards.emergencyWithdraw();
    }

    function test_Receive() public {
        vm.deal(user2, 1 ether);
        vm.prank(user2);

        vm.expectEmit(true, true, false, true);
        emit Funded(user2, 0.2 ether);
        (bool success,) = address(riddleRewards).call{value: 0.2 ether}("");
        assertTrue(success, "Receive failed");

        assertEq(riddleRewards.rewardPool(), INITIAL_FUND + 0.2 ether, "Reward pool not updated via receive");
    }

    function test_OwnerImmutable() public view {
        assertEq(riddleRewards.owner(), owner, "Owner not set correctly");
    }
}
