const { Router } = require("express");
const { CustodyController } = require("../controllers/custody.js");

const router = new Router();
router.get("/api/v1/custody/wallets", CustodyController.listWallets);
router.get("/api/v1/custody/wallet/:id", CustodyController.getWallet);

module.exports = { router };
