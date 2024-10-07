const express = require('express');
require("dotenv").config();
const app = express();
const { Web3 } = require("web3");
const fs = require("fs");

app.get("/msg", (req, res, next) => {
    res.json({ "message": "Hello, Spencer!" });
});
app.post('/registerBond', async (req, res) => {

});
app.get("/deploy", async (req, res) => {
    const { abi, bytecode } = JSON.parse(fs.readFileSync("DBToken.json"));
    const network = process.env.ETHEREUM_NETWORK;
    const INFURA_API_KEY = process.env.INFURA_PROJECT_ID;
    console.log('API Key', network, INFURA_API_KEY);
    //  console.log('abi', abi)
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
    // const deployTx = contract.deploy("DB TEST COIN", "DBCOIN", 50000);
    const deployTx = contract.deploy({
        data: bytecode,
        arguments:["DB TEST COIN", "DBCOIN", 50000 * 10 ** 18]
    });
    
    // const gas = await deployTxn.estimateGas();
  /*  const signedTx = await web3.eth.accounts.signTransaction({
        data: deployTxn.encodeABI(),
        gas,
        from: signer.address
    }, '0x' + process.env.SIGNER_PRIVATE_KEY);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('--------', receipt.contractAddress);
    */
    //  console.log('deploy', deployTx);
    
    const deployedContract = await deployTx
        .send({
            from: signer.address,
            gas: 3000000 //await deployTx.estimateGas(),
        })
        .once("transactionHash", (txhash) => {
            console.log(`Mining deployment transaction ...`);
            console.log(`https://${network}.etherscan.io/tx/${txhash}`);
        });
    // The contract is now deployed on chain!
    console.log(`Contract deployed at ${deployedContract.options.address}`);
    // console.log('deployed', deployTx.address, deployTx);
   
    res.json({ "message": `Contract deployed` });
});
app.listen(3000, () => {
    console.log("Server running on port 3000");
});