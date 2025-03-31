// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

contract RiddleRewards {
    address public immutable owner;
    uint256 public rewardPool;
    uint256 public claimCooldownBlocks = 7200;

    mapping(address => uint256) public lastClaimBlock;

    bool private _notEntered;

    event RewardClaimed(address indexed user, uint256 rewardAmount);
    event Funded(address indexed funder, uint256 amount);
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

    function claimReward(uint256 rewardAmount) external nonReentrant {
        require(rewardAmount > 0, "Invalid reward amount");
        require(rewardPool >= rewardAmount, "Insufficient reward pool");

        uint256 lastClaimed = lastClaimBlock[msg.sender];
        if (lastClaimed != 0) {
            require(
                block.number >= lastClaimed + claimCooldownBlocks, "You can only claim once every 24 hours (approx)"
            );
        }

        rewardPool -= rewardAmount;
        lastClaimBlock[msg.sender] = block.number;

        emit RewardClaimed(msg.sender, rewardAmount);

        // slither-disable-next-line low-level-calls
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

        // slither-disable-next-line low-level-calls
        (bool success,) = payable(owner).call{value: balance}("");
        require(success, "ETH withdrawal failed");
    }

    receive() external payable {
        fundPool();
    }
}
