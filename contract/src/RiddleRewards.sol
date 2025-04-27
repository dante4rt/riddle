// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

/**
 * @title RiddleRewards Contract
 * @author Muhammad Ramadhani
 * @notice Manages a reward pool for a riddle game or similar activity.
 * Allows an owner to mark users as eligible, and eligible users can claim
 * a specified reward amount, subject to a cooldown period and available funds.
 * @dev Implements basic reward distribution, funding, eligibility management,
 * cooldown mechanism, and security measures like owner control and reentrancy guards.
 */
contract RiddleRewards {
    /// @notice The address of the contract deployer, who has administrative privileges (e.g., marking winners, updating cooldown).
    address public immutable owner;
    /// @notice The total amount of ETH currently available in the contract's reward pool.
    uint256 public rewardPool;
    /// @notice The number of blocks a user must wait after claiming a reward before they can potentially claim again (if marked eligible again). Default: 7200 blocks (~24 hours).
    uint256 public claimCooldownBlocks = 7200; // ~24 hours assuming ~12s block time

    /// @notice Stores the block number when each user last successfully claimed a reward. Zero indicates the user has never claimed.
    mapping(address => uint256) public lastClaimBlock;
    /// @notice Tracks if a user has been marked as eligible to claim a reward by the owner. This is reset to false after a successful claim.
    mapping(address => bool) public eligibleToClaim;

    /// @dev Reentrancy guard flag. True indicates the contract is not currently executing a function protected by the nonReentrant modifier.
    bool private _notEntered;

    /// @notice Emitted when a user successfully claims a reward from the pool.
    /// @param user The address of the user who claimed the reward.
    /// @param rewardAmount The amount of ETH claimed.
    event RewardClaimed(address indexed user, uint256 rewardAmount);

    /// @notice Emitted when the reward pool receives funds, either via `fundPool` or the `receive` fallback.
    /// @param funder The address that sent the funds.
    /// @param amount The amount of ETH received.
    event Funded(address indexed funder, uint256 amount);

    /// @notice Emitted when the owner updates the claim cooldown period.
    /// @param newCooldownBlocks The new cooldown period in blocks.
    event CooldownUpdated(uint256 newCooldownBlocks);

    /// @notice Emitted when the owner successfully marks a user as eligible to claim a reward.
    /// @param user The address of the user marked as eligible.
    event MarkedAsWinner(address indexed user);

    /// @notice Modifier restricting function execution only to the contract owner.
    /// @dev Reverts the transaction if the caller (`msg.sender`) is not the `owner`.
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    /// @notice Modifier preventing reentrant calls to functions it protects.
    /// @dev Uses a boolean flag (`_notEntered`) to ensure a function cannot be called again while it's still executing.
    modifier nonReentrant() {
        require(_notEntered, "Reentrant call");
        _notEntered = false;
        _;
        _notEntered = true;
    }

    /**
     * @notice Sets the contract deployer (`msg.sender`) as the immutable owner upon deployment.
     * @dev Initializes the reentrancy guard flag `_notEntered` to true.
     */
    constructor() {
        owner = msg.sender;
        _notEntered = true;
    }

    /**
     * @notice Allows anyone to send ETH to the contract to increase the reward pool.
     * @dev Accepts incoming ETH (`msg.value`), adds it to `rewardPool`, and emits a `Funded` event.
     */
    function fundPool() public payable {
        rewardPool += msg.value;
        emit Funded(msg.sender, msg.value);
    }

    /**
     * @notice Allows the contract owner to mark a specific user address as eligible to claim a reward.
     * @dev Sets the `eligibleToClaim` mapping entry for the specified user to true. Emits `MarkedAsWinner`.
     * @param user The address of the user to mark as eligible for claiming a reward.
     */
    function markAsWinner(address user) external onlyOwner {
        eligibleToClaim[user] = true;
        emit MarkedAsWinner(user);
    }

    /**
     * @notice Allows a user previously marked as eligible to claim a specified reward amount.
     * @dev Checks for eligibility, ensures the requested amount is valid and available, verifies the cooldown period has passed since the last claim (if any),
     * updates the reward pool, records the claim block, resets eligibility, emits `RewardClaimed`, and transfers the ETH.
     * @dev Protected against reentrancy attacks using the `nonReentrant` modifier.
     * @param rewardAmount The amount of ETH the user wishes to claim. Must be greater than 0 and not exceed the current `rewardPool`.
     */
    function claimReward(uint256 rewardAmount) external nonReentrant {
        require(eligibleToClaim[msg.sender], "Not eligible to claim");
        require(rewardAmount > 0, "Invalid reward amount");
        require(rewardPool >= rewardAmount, "Not enough reward pool");

        uint256 lastClaimed = lastClaimBlock[msg.sender];

        // Cooldown check only applies if the user has claimed before (lastClaimed > 0)
        if (lastClaimed != 0) {
            require(block.number >= lastClaimed + claimCooldownBlocks, "Wait for cooldown");
        }

        // State updates before external call
        rewardPool -= rewardAmount;
        lastClaimBlock[msg.sender] = block.number;
        eligibleToClaim[msg.sender] = false; // User must be marked eligible again for future claims

        emit RewardClaimed(msg.sender, rewardAmount);

        // Transfer ETH
        (bool success,) = payable(msg.sender).call{value: rewardAmount}("");
        require(success, "ETH transfer failed");
    }

    /**
     * @notice Allows the contract owner to change the required waiting period (in blocks) between claims for users.
     * @dev Updates the `claimCooldownBlocks` state variable and emits `CooldownUpdated`.
     * @param newCooldownBlocks The new cooldown duration in number of blocks.
     */
    function updateClaimCooldown(uint256 newCooldownBlocks) external onlyOwner {
        claimCooldownBlocks = newCooldownBlocks;
        emit CooldownUpdated(newCooldownBlocks);
    }

    /**
     * @notice Allows the owner to withdraw all ETH currently held by the contract.
     * @dev This is an emergency function. It sets the `rewardPool` state variable to 0 (though the actual transfer empties the balance)
     * and transfers the entire contract ETH balance to the owner. Protected against reentrancy.
     * @dev Emits a `Funded` event with zero amount to potentially signal pool depletion, though the primary purpose is withdrawal.
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        rewardPool = 0; // Reflects the intention, though balance dictates transferred amount

        // Emitting Funded with 0 might be misleading, consider a dedicated Withdraw event if needed.
        // For now, keeping user's original event logic.
        emit Funded(address(0), 0); // Signals pool change, although context is withdrawal

        (bool success,) = payable(owner).call{value: balance}("");
        require(success, "ETH withdrawal failed");
    }

    /**
     * @notice Fallback function to accept direct ETH transfers to the contract.
     * @dev Any ETH sent directly to the contract address (without specific function data) will be added to the reward pool via `fundPool()`.
     */
    receive() external payable {
        fundPool();
    }
}
