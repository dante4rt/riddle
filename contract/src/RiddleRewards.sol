// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

contract RiddleRewards {
    address public immutable owner;
    uint256 public rewardPool;
    uint256 public claimCooldownBlocks = 7200;

    mapping(address => uint256) public lastClaimBlock;
    mapping(address => bool) public eligibleToClaim;

    bool private _notEntered;

    event RewardClaimed(address indexed user, uint256 rewardAmount);
    event Funded(address indexed funder, uint256 amount);
    event CooldownUpdated(uint256 newCooldownBlocks);
    event MarkedAsWinner(address indexed user);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier nonReentrant() {
        require(_notEntered, "Reentrant call");
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

    function markAsWinner(address user) external onlyOwner {
        eligibleToClaim[user] = true;
        emit MarkedAsWinner(user);
    }

    function claimReward(uint256 rewardAmount) external nonReentrant {
        require(eligibleToClaim[msg.sender], "Not eligible to claim");
        require(rewardAmount > 0, "Invalid reward amount");
        require(rewardPool >= rewardAmount, "Not enough reward pool");

        uint256 lastClaimed = lastClaimBlock[msg.sender];
        if (lastClaimed != 0) {
            require(block.number >= lastClaimed + claimCooldownBlocks, "Wait for cooldown");
        }

        rewardPool -= rewardAmount;
        lastClaimBlock[msg.sender] = block.number;
        eligibleToClaim[msg.sender] = false;

        emit RewardClaimed(msg.sender, rewardAmount);

        (bool success,) = payable(msg.sender).call{value: rewardAmount}("");
        require(success, "ETH transfer failed");
    }

    function updateClaimCooldown(uint256 newCooldownBlocks) external onlyOwner {
        claimCooldownBlocks = newCooldownBlocks;
        emit CooldownUpdated(newCooldownBlocks);
    }

    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        rewardPool = 0;
        emit Funded(address(0), 0);
        (bool success,) = payable(owner).call{value: balance}("");
        require(success, "ETH withdrawal failed");
    }

    receive() external payable {
        fundPool();
    }
}
