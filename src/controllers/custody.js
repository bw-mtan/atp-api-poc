require("dotenv").config();
const path = require("path");
const custody = require(path.resolve('./db', "custody.json"));

const CustodyController = {
    listWallets: async (req, res) => {
      /*  const web3 = new Web3(
            new Web3.providers.HttpProvider(
                `https://${network}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
                { timeout: 10e3 }
            ),
        );
        const wallet = await web3.eth.accounts.wallet.create(8);
        const newData = [];
        wallet.forEach((x, idx)=>{
            console.log(`wallet addr ${idx}`, x.address, x.privateKey);
            newData.push({
                userid: users[idx].userid,
                account: x.address,
                privateKey: x.privateKey
            })
        });
        console.log(newData);
        writeDb(newData, 'custody.json');*/
        await res.status(200).json(custody);
    },
    getWallet: async (req, res) => {
        await res.status(200).json('wallet retrieve');
    }
}
module.exports = { CustodyController };