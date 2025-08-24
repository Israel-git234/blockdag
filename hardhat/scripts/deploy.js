const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Women's Empowerment Platform Smart Contracts...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy MedicalRecords contract
  console.log("\n📋 Deploying MedicalRecords contract...");
  const MedicalRecords = await hre.ethers.getContractFactory("MedicalRecords");
  const medicalRecords = await MedicalRecords.deploy();
  await medicalRecords.deployed();
  console.log("✅ MedicalRecords deployed to:", medicalRecords.address);

  // Deploy Microfinance contract
  console.log("\n💰 Deploying Microfinance contract...");
  const Microfinance = await hre.ethers.getContractFactory("Microfinance");
  const microfinance = await Microfinance.deploy();
  await microfinance.deployed();
  console.log("✅ Microfinance deployed to:", microfinance.address);

  // Verify contracts on Etherscan (if not on local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Verifying contracts on Etherscan...");
    
    try {
      await hre.run("verify:verify", {
        address: medicalRecords.address,
        constructorArguments: [],
      });
      console.log("✅ MedicalRecords verified on Etherscan");
    } catch (error) {
      console.log("❌ MedicalRecords verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: microfinance.address,
        constructorArguments: [],
      });
      console.log("✅ Microfinance verified on Etherscan");
    } catch (error) {
      console.log("❌ Microfinance verification failed:", error.message);
    }
  }

  // Print deployment summary
  console.log("\n🎉 Deployment Complete!");
  console.log("==================================");
  console.log("📋 MedicalRecords:", medicalRecords.address);
  console.log("💰 Microfinance:", microfinance.address);
  console.log("🌐 Network:", hre.network.name);
  console.log("👤 Deployer:", deployer.address);
  console.log("==================================");

  // Save deployment addresses to a file
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      MedicalRecords: medicalRecords.address,
      Microfinance: microfinance.address,
    },
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    `deployment-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n📄 Deployment info saved to deployment file");

  return {
    medicalRecords: medicalRecords.address,
    microfinance: microfinance.address,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
