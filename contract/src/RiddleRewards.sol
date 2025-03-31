// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

contract RiddleRewards {
    address public immutable owner;
    uint256 public rewardPool;
    uint256 public claimCooldownBlocks = 7200;
    uint256 public constant MAX_REWARD_AMOUNT = 0.01 ether;

    struct Challenge {
        bytes32 riddleHash;
        uint256 rewardAmount;
        bool isActive;
    }

    struct PlayerData {
        uint256 lastClaimBlock;
        uint256 totalClaimed;
        mapping(uint256 => bool) completedChallenges;
    }

    mapping(address => PlayerData) public players;
    mapping(uint256 => Challenge) public challenges;

    uint256 public challengeCount;
    bool private _notEntered;

    event RewardClaimed(address indexed user, uint256 challengeId, uint256 rewardAmount);
    event Funded(address indexed funder, uint256 amount);
    event ChallengeCreated(uint256 indexed challengeId, bytes32 riddleHash, uint256 rewardAmount);
    event ChallengeUpdated(uint256 indexed challengeId, bool isActive);
    event CooldownUpdated(uint256 newCooldownBlocks);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier nonReentrant() {
        require(_notEntered, "ReentrancyGuard: reentrant call");
        _notEntered = false;
        _;
        _notEntered = true;
    }

    constructor() {
        owner = msg.sender;
        _notEntered = true;
    }

    function fundPool() public payable {
        rewardPool += msg.value;
        emit Funded(msg.sender, msg.value);
    }

    function createChallenge(bytes32 riddleHash, uint256 rewardAmount) external onlyOwner {
        require(rewardAmount > 0 && rewardAmount <= MAX_REWARD_AMOUNT, "Invalid reward amount");

        uint256 challengeId = challengeCount;

        challenges[challengeId] = Challenge({riddleHash: riddleHash, rewardAmount: rewardAmount, isActive: true});

        challengeCount++;

        emit ChallengeCreated(challengeId, riddleHash, rewardAmount);
    }

    function updateChallenge(uint256 challengeId, bool isActive) external onlyOwner {
        require(challengeId < challengeCount, "Challenge does not exist");

        challenges[challengeId].isActive = isActive;

        emit ChallengeUpdated(challengeId, isActive);
    }

    function claimReward(uint256 challengeId, string calldata answer) external nonReentrant {
        require(challengeId < challengeCount, "Challenge does not exist");

        Challenge storage challenge = challenges[challengeId];
        require(challenge.isActive, "Challenge is not active");

        require(!players[msg.sender].completedChallenges[challengeId], "Already claimed this challenge");

        require(keccak256(abi.encodePacked(answer)) == challenge.riddleHash, "Incorrect answer");

        uint256 lastClaimed = players[msg.sender].lastClaimBlock;

        if (lastClaimed != 0) {
            require(
                block.number >= lastClaimed + claimCooldownBlocks, "You can only claim once every 24 hours (approx)"
            );
        }

        uint256 rewardAmount = challenge.rewardAmount;
        require(rewardPool >= rewardAmount, "Insufficient reward pool");

        players[msg.sender].lastClaimBlock = block.number;
        players[msg.sender].totalClaimed += rewardAmount;
        players[msg.sender].completedChallenges[challengeId] = true;

        rewardPool -= rewardAmount;

        emit RewardClaimed(msg.sender, challengeId, rewardAmount);

        // slither-disable-next-line low-level-calls
        (bool success,) = payable(msg.sender).call{value: rewardAmount}("");
        require(success, "ETH transfer failed");
    }

    function getPlayerStats(address player) external view returns (uint256 lastClaimBlock, uint256 totalClaimed) {
        return (players[player].lastClaimBlock, players[player].totalClaimed);
    }

    function hasCompletedChallenge(address player, uint256 challengeId) external view returns (bool) {
        return players[player].completedChallenges[challengeId];
    }

    function updateClaimCooldown(uint256 newCooldownBlocks) external onlyOwner {
        claimCooldownBlocks = newCooldownBlocks;
        emit CooldownUpdated(newCooldownBlocks);
    }

    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        rewardPool = 0;

        // slither-disable-next-line low-level-calls
        (bool success,) = payable(owner).call{value: balance}("");
        require(success, "ETH withdrawal failed");
    }

    receive() external payable {
        fundPool();
    }
}
