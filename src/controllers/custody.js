require("dotenv").config();
const path = require("path");
const custody = require(path.resolve('./db', "custody.json"));

const CustodyController = {
    listWallets: async (req, res) => {
        await res.status(200).json(custody);
    },
    getWallet: async (req, res) => {
        const { id } = req.params;
        const data = custody.filter(x => x.userid === id);
        return await res.status(200).json(data);
    }
}
module.exports = { CustodyController };