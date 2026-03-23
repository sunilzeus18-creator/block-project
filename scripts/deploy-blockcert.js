const { ethers } = require("hardhat");

async function main() {
  const BlockCertificate = await ethers.getContractFactory("BlockCertificate");
  const contract = await BlockCertificate.deploy();
  
  await contract.waitForDeployment();
  console.log("🪙 BlockCertificate Address:", await contract.getAddress());
  console.log("👨‍💼 Admin Address:", await contract.admin());
  console.log("✅ Ready for frontend!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
