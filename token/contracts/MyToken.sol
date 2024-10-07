// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(string memory _name, string memory _symbol ,uint256 initialSupply) ERC20(_name,  _symbol) {
        //"American Honda Company","US02665WDN83"
        _mint(msg.sender, initialSupply);
    }
}