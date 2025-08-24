const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Women's Health Records contract to BlockDAG...");

  // Get the contract factory
  const WomenHealthRecords = await ethers.getContractFactory("WomenHealthRecords");
  
  // Deploy the contract
  console.log("📝 Deploying contract...");
  const womenHealthRecords = await WomenHealthRecords.deploy();
  
  // Wait for deployment to complete
  await womenHealthRecords.waitForDeployment();
  
  // Get the deployed contract address
  const contractAddress = await womenHealthRecords.getAddress();
  
  console.log("✅ Women's Health Records contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Deployer Address:", await womenHealthRecords.signer.getAddress());
  
  // Get deployment transaction details
  const deploymentTx = womenHealthRecords.deploymentTransaction();
  console.log("🔗 Transaction Hash:", deploymentTx?.hash);
  
  // Save deployment information
  const deploymentInfo = {
    network: "blockdag",
    contract: "WomenHealthRecords",
    contractAddress: contractAddress,
    deployerAddress: await womenHealthRecords.signer.getAddress(),
    transactionHash: deploymentTx?.hash,
    timestamp: new Date().toISOString(),
    description: "Secure, privacy-preserving medical records for women on BlockDAG",
    features: [
      "Encrypted medical records stored on IPFS",
      "On-chain access control and permissions",
      "Doctor verification system",
      "Patient privacy protection",
      "Emergency access revocation"
    ]
  };
  
  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, "..", "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentPath = path.join(deploymentsDir, "women-health-records-deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("💾 Deployment info saved to:", deploymentPath);
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Add contract address to your .env file:");
  console.log(`   NEXT_PUBLIC_WOMEN_HEALTH_RECORDS_ADDRESS=${contractAddress}`);
  console.log("2. Verify the contract on BlockDAG explorer");
  console.log("3. Test the contract functions");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
