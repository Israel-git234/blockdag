const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
	console.log("🚀 Starting EmpowerHer deployment...");
	const [deployer] = await ethers.getSigners();
	console.log("📝 Deployer:", deployer.address);
	const balanceWei = await deployer.provider.getBalance(deployer.address);
	console.log("💰 Balance:", balanceWei.toString());

	const EmpowerHer = await ethers.getContractFactory("EmpowerHer");
	console.log("⏳ Deploying EmpowerHer...");
	const empowerher = await EmpowerHer.deploy();
	await empowerher.waitForDeployment();

	const address = await empowerher.getAddress();
	const txHash = empowerher.deploymentTransaction().hash;
	console.log("✅ Deployed at:", address);
	console.log("🔗 Tx:", txHash);

	console.log("💵 Adding initial ad revenue pool...");
	const initialRevenue = ethers.parseEther("1");
	const addTx = await empowerher.addAdRevenue({ value: initialRevenue });
	await addTx.wait();
	console.log("✅ Added 1 BDAG to ad revenue pool");

	const outDir = "./deployments";
	if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

	const deploymentInfo = {
		network: process.env.HARDHAT_NETWORK || "blockdag",
		contractAddress: address,
		deployerAddress: deployer.address,
		transactionHash: txHash,
		timestamp: new Date().toISOString(),
	};
	fs.writeFileSync(`${outDir}/blockdag-deployment.json`, JSON.stringify(deploymentInfo, null, 2));

	console.log("📄 Saved deployment under deployments/");
}

main().catch((e) => {
	console.error("❌ Deployment failed:", e);
	process.exit(1);
});


