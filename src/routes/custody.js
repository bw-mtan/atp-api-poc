const { Router } = require("express");
const { CustodyController } = require("../controllers/custody.js");

const router = new Router();
router.get("/api/v1/custody/wallets", CustodyController.listWallets);
router.get("/api/v1/custody/wallet/:id", CustodyController.getWallet);
router.get("/api/v1/custody/wallet/role/:id", CustodyController.getWalletsByRole);
module.exports = { router };
