const { Router } = require("express");
const { KYCController } = require("../controllers/whitelist.js");

const router = new Router();
router.get("/api/v1/whitelist/registrar", KYCController.whitelistRegistrar);
router.get("/api/v1/whitelist/issuer", KYCController.whitelistIssuer);
router.get("/api/v1/whitelist/investor", KYCController.whitelistInvestor);

module.exports = { router };
