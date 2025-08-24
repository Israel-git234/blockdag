const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
	console.log("🚀 Deploying SistaCircle...");
	const [deployer] = await ethers.getSigners();
	console.log("📝 Deployer:", deployer.address);
	const balanceWei = await deployer.provider.getBalance(deployer.address);
	console.log("💰 Balance:", balanceWei.toString());

	const SistaCircle = await ethers.getContractFactory("SistaCircle");
	const sc = await SistaCircle.deploy();
	await sc.waitForDeployment();

	const address = await sc.getAddress();
	const txHash = sc.deploymentTransaction().hash;
	console.log("✅ Deployed at:", address);
	console.log("🔗 Tx:", txHash);

	const outDir = "./deployments";
	if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
	const info = {
		network: process.env.HARDHAT_NETWORK || "blockdag",
		contract: "SistaCircle",
		contractAddress: address,
		deployerAddress: deployer.address,
		transactionHash: txHash,
		timestamp: new Date().toISOString(),
	};
	fs.writeFileSync(`${outDir}/sistacircle-deployment.json`, JSON.stringify(info, null, 2));
	console.log("📄 Saved deployment under deployments/sistacircle-deployment.json");
}

main().catch((e) => {
	console.error("❌ Deployment failed:", e);
	process.exit(1);
});
