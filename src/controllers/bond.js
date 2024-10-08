require("dotenv").config();
const fs = require("fs");
const { Web3 } = require("web3");
const { readDb, writeDb } = require('./tempdb');
const path = require('path');
const network = process.env.ETHEREUM_NETWORK;
const connectContract = () => {
    console.log('poath', path.resolve("./", "DBToken.json"))
    const { abi, bytecode } = JSON.parse(fs.readFileSync(path.resolve("./", "DBToken.json")));
    const network = process.env.ETHEREUM_NETWORK;
    const web3 = new Web3(
        new Web3.providers.HttpProvider(
            `https://${network}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
            { timeout: 10e3 }
        ),
    );
    // Creating a signing account from a private key
    const signer = web3.eth.accounts.privateKeyToAccount(
        '0x' + process.env.SIGNER_PRIVATE_KEY,
    );
    web3.eth.accounts.wallet.add(signer);

    // Using the signing account to deploy the contract
    const contract = new web3.eth.Contract(abi);
    contract.options.data = bytecode;
    return { contract, bytecode, signer, web3 };
};
const BondController = {
    registerBond: async (req, res) => {
        const { name, symbol, supply } = req.body;
        if (!name || !symbol || !supply) {
            return res.status(500).json({ message: "Expected fields are not passed correctly." });
        }
        /*
        const { abi, bytecode } = JSON.parse(fs.readFileSync("DBToken.json"));
        const network = process.env.ETHEREUM_NETWORK;
        const web3 = new Web3(
            new Web3.providers.HttpProvider(
                `https://${network}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
                { timeout: 10e3 }
            ),
        );
        // Creating a signing account from a private key
        const signer = web3.eth.accounts.privateKeyToAccount(
            '0x' + process.env.SIGNER_PRIVATE_KEY,
        );
        web3.eth.accounts.wallet.add(signer);

        // Using the signing account to deploy the contract
        const contract = new web3.eth.Contract(abi);
        contract.options.data = bytecode;
        */
        const { contract, bytecode, signer } = connectContract();
        const deployTx = contract.deploy({
            data: bytecode,
            arguments: [name, symbol, supply]
        });
        let txHash = null;
        let txnUrl = null;
        const deployedContract = await deployTx
            .send({
                from: signer.address,
                gas: 3000000 //await deployTx.estimateGas(),
            })
            .once("transactionHash", (txhash) => {
                txHash = txhash;
                txnUrl = `https://${network}.etherscan.io/tx/${txhash}`;
                console.log(`Mining deployment transaction ...`);
                console.log(txnUrl);
            });
        const message = {
            contractAddress: deployedContract.options.address,
            txHash,
            txnUrl
        }
        writeDb({ name, symbol, supply, ...message });
        res.status(201).json(message);
    },
    transferBond: async (req, res) => {
        const { address, amount } = req.body;
        if (!address || !amount) {
            return res.status(500).json({ message: "Expected fields are not passed correctly." });
        }

        try {
            const { contract, web3, signer } = connectContract();
            const privateKey = '0x' + process.env.SIGNER_PRIVATE_KEY;

            const data = contract.methods
                .transferToken(address, amount)
                .encodeABI();
            const tx = {
                from: signer.address,
                data,
                to: "0x6560112FE83cD1EDb5A54c458D5a6D92e1FD3070",
                gasPrice: await web3.eth.getGasPrice(),
                gas: 3000000 //await deployTx.estimateGas(),
            }
            await web3.eth.accounts
                .signTransaction({ ...tx, data }, privateKey)
                .then((signed) => {
                    web3.eth
                        .sendSignedTransaction(signed.rawTransaction)
                        .then((response) => {
                            console.log(response);
                            res.status(201);
                            res.json({
                                message: `Successful transfer of ${amount} tokens from ${from} to ${to}`,
                                transactionHash: response.transactionHash,
                                blockNumber: response.blockNumber,
                                // swapid: response.data,
                                // resp: response
                            })
                        })
                        .catch((err) => {
                            res.status(400).json({ message: err.message });
                        });
                })
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
        res.json("Bond Transfer was successfully.")
    }

};

module.exports = { BondController };
