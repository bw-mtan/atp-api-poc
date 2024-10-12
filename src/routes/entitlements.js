const { Router } = require("express");
const { EntitlementController } = require("../controllers/entitlements.js");

const router = new Router();
router.get("/api/v1/entitlements/roles", EntitlementController.getRoles);
router.get("/api/v1/entitlements/users", EntitlementController.getUsers);

module.exports = { router };
