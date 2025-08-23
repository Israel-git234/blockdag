// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EmpowerToken
 * @dev This is the ERC-20 token contract for the EmpowerHer platform.
 * The token is named EmpowerToken with the symbol EMW.
 * The contract owner has the exclusive right to mint new tokens.
 */
contract EmpowerToken is ERC20, Ownable {

    /**
     * @dev Constructor for the EmpowerToken contract.
     * Initializes the ERC-20 token with a name "EmpowerToken" and symbol "EMW".
     * The initial owner is set to the deployer of the contract.
     * @param initialOwner The address that will be the initial owner of the contract.
     */
    constructor(address initialOwner) ERC20("EmpowerToken", "EMW") Ownable(initialOwner) {
        // The Ownable constructor sets the deployer as the initial owner.
    }

    /**
     * @dev Creates new tokens and assigns them to a specified address.
     * This function can only be called by the contract owner.
     * This is crucial for controlling the token supply.
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint (in the smallest unit, e.g., wei).
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
