# Simple DAO Governance

This project consists of a simple DAO (Decentralized Autonomous Organization) smart contract and a frontend interface for interacting with the DAO.

## Technologies Used

- [Astro.js](https://astro.build/): A modern static site builder for faster websites
- [Hardhat](https://hardhat.org/): Ethereum development environment for professionals
- [ethers.js](https://docs.ethers.io/v5/): Complete Ethereum library and wallet implementation in JavaScript

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ayushh2k/simple-dao.git
cd simple-dao
```

### 2. Smart Contract Setup (dao-contracts)

Navigate to the dao-contracts folder and install dependencies:

```shellscript
cd dao-contracts
npm install
```

Compile the smart contracts:

```shellscript
npx hardhat compile
```

Start a local Hardhat node:

```shellscript
npx hardhat node
```

In a new terminal window, deploy the contract to the local network:

```shellscript
npx hardhat run scripts/deploy.js --network localhost
```

This will generate the ABI in `dao-contracts/artifacts/contracts/DAO.sol/DAO.json` and print the contract address in the terminal.

### 3. Frontend Setup (dao-frontend)

Navigate to the dao-frontend folder and install dependencies:

```shellscript
cd ../dao-frontend
npm install
```

Update the contract configuration:

1. Open `src/lib/contractConfig.ts`
2. Replace the `CONTRACT_ADDRESS` with the address printed in the terminal during contract deployment
3. Replace the `CONTRACT_ABI` with the ABI from `dao-contracts/artifacts/contracts/DAO.sol/DAO.json`


## Running the Project

Start the frontend development server:

```shellscript
npm run dev
```

The application should now be running at `http://localhost:5173`

## Additional Information

- Make sure to keep your Hardhat node running in a separate terminal window while using the application.
- If you make changes to the smart contract, remember to redeploy it and update the ABI and address in the frontend configuration.
- This project uses Astro.js for the frontend. Refer to the Astro.js documentation for more information on the project structure and development practices.
- Hardhat is used for smart contract development and local blockchain simulation.
- ethers.js is used to interact with the Ethereum blockchain and smart contracts from the frontend.

## Screenshots

![home](./assets/screenshots/homepage.png)
![sample-proposal](./assets/screenshots/sample-proposal.png)

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are correctly installed
2. Verify that the contract address and ABI in `lib/contractConfig.ts` are correct and up-to-date
3. Check that your local Hardhat node is running
4. Create an issue in the repository if you encounter any problems.