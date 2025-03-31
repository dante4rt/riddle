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
    uint256 public constant REWARD_AMOUNT = 0.01 ether;
    uint256 public constant COOLDOWN_BLOCKS = 7200;
    bytes32 constant TEST_RIDDLE_HASH = keccak256(abi.encodePacked("test answer"));

    event RewardClaimed(address indexed user, uint256 challengeId, uint256 rewardAmount);
    event Funded(address indexed funder, uint256 amount);
    event ChallengeCreated(uint256 indexed challengeId, bytes32 riddleHash, uint256 rewardAmount);
    event CooldownUpdated(uint256 newCooldownBlocks);

    function setUp() public {
        vm.startPrank(owner);
        riddleRewards = new RiddleRewards();
        vm.deal(owner, 10 ether);
        riddleRewards.fundPool{value: INITIAL_FUND}();
        // Create two test challenges
        riddleRewards.createChallenge(TEST_RIDDLE_HASH, REWARD_AMOUNT);
        riddleRewards.createChallenge(TEST_RIDDLE_HASH, REWARD_AMOUNT);
        vm.stopPrank();

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

    function test_ClaimReward_Success() public {
        vm.deal(user1, 1 ether);
        vm.startPrank(user1);

        (uint256 lastClaimBlock,) = riddleRewards.getPlayerStats(user1);
        assertEq(lastClaimBlock, 0, "Initial lastClaimBlock should be 0");

        vm.expectEmit(true, true, false, true);
        emit RewardClaimed(user1, 0, REWARD_AMOUNT);
        riddleRewards.claimReward(0, "test answer");

        assertEq(riddleRewards.rewardPool(), INITIAL_FUND - REWARD_AMOUNT, "Reward pool not reduced");
        (lastClaimBlock,) = riddleRewards.getPlayerStats(user1);
        assertEq(lastClaimBlock, block.number, "Last claim block not updated");
        assertEq(user1.balance, 1 ether + REWARD_AMOUNT, "User1 balance not updated");

        vm.stopPrank();
    }

    function test_ClaimReward_Cooldown() public {
        vm.deal(user1, 1 ether);
        vm.startPrank(user1);

        // Claim first challenge
        riddleRewards.claimReward(0, "test answer");

        // Try to claim second challenge before cooldown
        vm.expectRevert("You can only claim once every 24 hours (approx)");
        riddleRewards.claimReward(1, "test answer");

        // Advance blocks past cooldown
        vm.roll(block.number + COOLDOWN_BLOCKS + 1);

        vm.expectEmit(true, true, false, true);
        emit RewardClaimed(user1, 1, REWARD_AMOUNT);
        riddleRewards.claimReward(1, "test answer");

        assertEq(
            riddleRewards.rewardPool(), INITIAL_FUND - 2 * REWARD_AMOUNT, "Reward pool not reduced after second claim"
        );
        assertEq(user1.balance, 1 ether + 2 * REWARD_AMOUNT, "User1 balance not updated after second claim");

        vm.stopPrank();
    }

    function test_ClaimReward_InsufficientFunds() public {
        // Drain the pool first
        vm.startPrank(owner);
        riddleRewards.emergencyWithdraw();
        riddleRewards.fundPool{value: REWARD_AMOUNT - 1}; // Fund with less than reward amount
        vm.stopPrank();

        vm.prank(user1);
        vm.expectRevert("Insufficient reward pool");
        riddleRewards.claimReward(0, "test answer");
    }

    function test_ClaimReward_WrongAnswer() public {
        vm.prank(user1);
        vm.expectRevert("Incorrect answer");
        riddleRewards.claimReward(0, "wrong answer");
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
        vm.expectRevert("Only owner can perform this action");
        riddleRewards.updateClaimCooldown(1000);
    }

    function test_EmergencyWithdraw() public {
        vm.startPrank(owner);
        uint256 initialOwnerBalance = owner.balance;

        riddleRewards.emergencyWithdraw();

        assertEq(riddleRewards.rewardPool(), 0, "Reward pool not zeroed");
        assertEq(owner.balance, initialOwnerBalance + INITIAL_FUND, "Owner balance not updated");

        vm.stopPrank();

        vm.prank(user1);
        vm.expectRevert("Only owner can perform this action");
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

    function test_CreateChallenge() public {
        vm.startPrank(owner);

        vm.expectEmit(true, true, true, true);
        emit ChallengeCreated(2, TEST_RIDDLE_HASH, REWARD_AMOUNT);
        riddleRewards.createChallenge(TEST_RIDDLE_HASH, REWARD_AMOUNT);

        assertEq(riddleRewards.challengeCount(), 3, "Challenge count not incremented");
        vm.stopPrank();
    }
}
