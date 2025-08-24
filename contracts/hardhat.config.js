require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
	solidity: {
		compilers: [
			{
				version: "0.8.19",
				settings: { optimizer: { enabled: true, runs: 200 }, viaIR: true },
			},
			{
				version: "0.8.20",
				settings: { optimizer: { enabled: true, runs: 200 }, viaIR: true },
			},
		],
	},
	networks: {
		blockdag: {
			url: process.env.BLOCKDAG_RPC_URL || "https://rpc.primordial.bdagscan.com",
			accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
			chainId: Number(process.env.BLOCKDAG_CHAIN_ID || 1043),
			gasPrice: Number(process.env.BLOCKDAG_GAS_PRICE || 20000000000),
			gas: Number(process.env.BLOCKDAG_GAS || 8000000),
		},
		blockdag_testnet: {
			url: process.env.BLOCKDAG_TESTNET_RPC || "https://rpc.primordial.bdagscan.com",
			accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
			chainId: Number(process.env.BLOCKDAG_TESTNET_CHAIN_ID || 1043),
			gasPrice: Number(process.env.BLOCKDAG_TESTNET_GAS_PRICE || 10000000000),
		},
	},
	etherscan: {
		apiKey: { blockdag: process.env.BLOCKDAG_API_KEY || "" },
		customChains: [
			{
				network: "blockdag",
				chainId: Number(process.env.BLOCKDAG_CHAIN_ID || 20180424),
				urls: {
					apiURL: process.env.BLOCKDAG_EXPLORER_API || "https://api.blockdag.network/api",
					browserURL: process.env.BLOCKDAG_EXPLORER || "https://explorer.blockdag.network",
				},
			},
		],
	},
};


