const express = require("express");
const { checkDelivery } = require("../controllers/delivery");

const router = express.Router();

// Public route - no authentication required
router.post("/check", checkDelivery);

module.exports = router;
