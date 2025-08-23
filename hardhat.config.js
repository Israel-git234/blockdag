require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337
    },
    blockdag_testnet: {
      url: "https://rpc-stage.devdomian123.com",
      accounts: ["0x7e839cd976b5710a255fa3785ec14215d51ba5c803608609442a6c07a6a81975"],
      chainId: 24171
    }
  }
};
