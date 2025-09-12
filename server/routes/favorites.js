const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  moveToFavorites,
} = require("../controllers/favorites");

// Get user's favorites
router.route("/").get(verifyToken, getFavorites);

// Add product to favorites
router.route("/add").post(verifyToken, addToFavorites);

// Remove product from favorites
router.route("/remove/:productId").delete(verifyToken, removeFromFavorites);

// Move from cart to favorites
router.route("/move-from-cart/:cartId").post(verifyToken, moveToFavorites);

module.exports = router;
