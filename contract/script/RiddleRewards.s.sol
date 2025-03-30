// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {Test, console} from "forge-std/Test.sol";
import {RiddleRewards} from "../src/RiddleRewards.sol";

contract DeployRiddleRewards is Script {
    function run() external returns (RiddleRewards) {
        vm.startBroadcast();

        RiddleRewards riddleRewards = new RiddleRewards();
        console.log("RiddleRewards deployed at:", address(riddleRewards));

        vm.stopBroadcast();

        return riddleRewards;
    }
}
