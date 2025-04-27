// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {RiddleRewards} from "../src/RiddleRewards.sol";

/**
 * @title Deployment Script for RiddleRewards Contract
 * @author Muhammad Ramadhani
 * @notice This script handles the deployment of the RiddleRewards contract using Foundry's scripting capabilities.
 * @dev Utilizes `vm.startBroadcast()` and `vm.stopBroadcast()` to submit the deployment transaction.
 * Logs the address of the newly deployed contract upon completion.
 */
contract DeployRiddleRewards is Script {
    /**
     * @notice Executes the deployment transaction for the RiddleRewards contract.
     * @dev This is the main entry point for the deployment script when run via `forge script`.
     * It creates a new instance of RiddleRewards within a broadcast transaction block.
     * @return riddleRewards The address of the newly deployed RiddleRewards contract instance.
     */
    function run() external returns (RiddleRewards) {
        vm.startBroadcast();

        RiddleRewards riddleRewards = new RiddleRewards();
        console.log("RiddleRewards deployed at:", address(riddleRewards));

        vm.stopBroadcast();

        return riddleRewards;
    }
}
