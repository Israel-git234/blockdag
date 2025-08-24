const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying SafeHaven contracts to BlockDAG...");

  const deployAndLog = async (name) => {
    const Factory = await ethers.getContractFactory(name);
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    const tx = contract.deploymentTransaction();
    console.log(`✅ ${name} deployed:`, address, "tx:", tx?.hash);
    return { name, address, txHash: tx?.hash };
  };

  const results = {};
  const artifacts = [
    "AssistanceCenterRegistry",
    "EmergencyAlert",
    "CounselorMarketplace",
  ];

  for (const name of artifacts) {
    const { address, txHash } = await deployAndLog(name);
    results[name] = { address, txHash };
  }

  const outDir = path.join(__dirname, "..", "..", "deployments");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "safehaven-deployment.json");
  fs.writeFileSync(outPath, JSON.stringify({
    network: process.env.HARDHAT_NETWORK || "blockdag",
    timestamp: new Date().toISOString(),
    ...results,
  }, null, 2));
  console.log("💾 Deployment saved:", outPath);

  console.log("\nAdd these to your .env.local:");
  console.log(`NEXT_PUBLIC_ASSISTANCE_REGISTRY_ADDRESS=${results.AssistanceCenterRegistry.address}`);
  console.log(`NEXT_PUBLIC_EMERGENCY_ALERT_ADDRESS=${results.EmergencyAlert.address}`);
  console.log(`NEXT_PUBLIC_COUNSELOR_MARKETPLACE_ADDRESS=${results.CounselorMarketplace.address}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
