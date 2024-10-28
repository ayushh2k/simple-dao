const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    const DAO = await ethers.getContractFactory("DAO");
    const dao = await DAO.deploy();

    await dao.deployed();

    console.log("DAO deployed at:", dao.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });