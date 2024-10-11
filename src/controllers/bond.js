require("dotenv").config();
const fs = require("fs");
const { Web3 } = require("web3");
const { readDb, writeDb } = require('./tempdb');
const path = require('path');
const {toTimeStamp} = require('../utils/timestamp');
const network = process.env.ETHEREUM_NETWORK;
const assets = require(path.resolve('./db',"bond.json"));
const connectContract = () => {
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
        const { name, symbol, supply, isin, description, issuerName, maturityDate, price, nominalValue, yieldPercent, scTemplateId } = req.body;
        // console.log('date', maturityDate, toTimeStamp(maturityDate))
        if (!name || !symbol || !supply) {
            return res.status(500).json({ message: "Expected fields are not passed correctly." });
        }

        const { contract, bytecode, signer } = connectContract();
        const deployTx = contract.deploy({
            data: bytecode,
            arguments: [name, symbol, supply, description, issuerName,Number(isin),Number(price * 100),Number(nominalValue * 100),toTimeStamp(maturityDate),Number(yieldPercent * 100)]
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
                console.log(`Mining deployment transaction ...${txnUrl}`);
            });
        const message = {
            contractAddress: deployedContract.options.address,
            txHash,
            txnUrl
        }
        const newData = { name, symbol, supply, isin, description, issuerName, maturityDate, price, nominalValue, yieldPercent, scTemplateId, ...message };
        writeDb(newData, 'bond.json');
        res.status(201).json({ ...newData });
    
       //  res.status(201).json({"name":"Demo Token DB","symbol":"DBCOIN2","supply":4000,"isin":"300100","description":"This is demo DB token","issuerName":"AB Holding Company","maturityDate":"2030-05-25","price":"50","nominalValue":"800002033","yieldPercent":"2","scTemplateId":0,"contractAddress":"0x4034A8bf548d7C4AF21f35666Ce24F97fe836bC4","txHash":"0x4ea1576116ffa9bfdc77f14cdc761e3a74f6326edbc4329b3e6504f422dc433d","txnUrl":"https://sepolia.etherscan.io/tx/0x4ea1576116ffa9bfdc77f14cdc761e3a74f6326edbc4329b3e6504f422dc433d"});
    },
    transferBond: async (req, res) => {
        const { address, amount, contract } = req.body;
        if (!address || !amount || !contract) {
            return res.status(500).json({ message: "Expected fields are not passed correctly." });
        }

        try {
            console.log('testing', amount, address);
            const { contract, web3, signer } = connectContract();
            const privateKey = '0x' + process.env.SIGNER_PRIVATE_KEY;
            console.log('------here-----', signer.address)
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
            console.log('-----try------')
            await web3.eth.accounts
                .signTransaction({ ...tx, data }, privateKey)
                .then((signed) => {
                    console.log('SIGNED', signed);
                    web3.eth
                        .sendSignedTransaction(signed.rawTransaction)
                        .then((response) => {
                            console.log('-----', response);
                            res.status(201).json({
                                message: `Successful transfer of ${amount} tokens to ${address}`,
                                transactionHash: response.transactionHash,
                                blockNumber: Number(response.blockNumber),
                                // swapid: response.data,
                                // resp: response
                            })
                        })
                        .catch((err) => {
                            console.log('----catch 1----', err.message)
                            res.status(400).json({ message: err.message });
                        });
                })
        } catch (error) {
            console.log('----catch 2----', error.message)
            res.status(400).json({ message: error.message });
        }
        // res.json("Bond Transfer was successful.")
    },
    listAllBond: async(req,res)=>{

    }

};

module.exports = { BondController };
