const user = require("../models/user");
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const errorHandler = require("../utils/errorHandler");
const Product = require("../models/product");

// Get user's favorites
const getFavorites = asyncErrorHandler(async (req, res, next) => {
  const userObj = await user.findById(req.tokenId).populate({
    path: "favorites.productId",
    select: "name price brand image slug",
  });
  
  if (!userObj) {
    return next(new errorHandler("Invalid Token", 401));
  }
  
  return res.status(200).json({
    success: true,
    favorites: userObj.favorites,
  });
});

// Add product to favorites
const addToFavorites = asyncErrorHandler(async (req, res, next) => {
  const id = req.tokenId;
  const { productId } = req.body;
  
  const userObj = await user.findById(id);
  if (!userObj) {
    return next(new errorHandler("Invalid Token", 401));
  }

  const productObj = await Product.findById(productId);
  if (!productObj) {
    return next(new errorHandler("Invalid Product id", 404));
  }

  // Check if product is already in favorites
  const existingFavorite = userObj.favorites.find(
    (item) => String(item.productId) === String(productId)
  );
  
  if (existingFavorite) {
    return res.status(400).json({
      success: false,
      message: "Product is already in your favorites",
    });
  }

  userObj.favorites.push({ productId });
  await userObj.save();

  return res.status(200).json({
    success: true,
    message: "Product added to favorites successfully",
  });
});

// Remove product from favorites
const removeFromFavorites = asyncErrorHandler(async (req, res, next) => {
  const id = req.tokenId;
  const { productId } = req.params;
  
  const userObj = await user.findById(id);
  if (!userObj) {
    return next(new errorHandler("Invalid Token", 401));
  }

  const favoriteIndex = userObj.favorites.findIndex(
    (item) => String(item.productId) === String(productId)
  );
  
  if (favoriteIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Product not found in favorites",
    });
  }

  userObj.favorites.splice(favoriteIndex, 1);
  await userObj.save();

  return res.status(200).json({
    success: true,
    message: "Product removed from favorites successfully",
  });
});

// Add cart item to favorites (without removing from cart)
const moveToFavorites = asyncErrorHandler(async (req, res, next) => {
  const id = req.tokenId;
  const { cartId } = req.params;
  
  const userObj = await user.findById(id);
  if (!userObj) {
    return next(new errorHandler("Invalid Token", 401));
  }

  // Find the cart item
  const cartItemIndex = userObj.cart.items.findIndex(
    (item) => String(item._id) === String(cartId)
  );
  
  if (cartItemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Cart item not found",
    });
  }

  const cartItem = userObj.cart.items[cartItemIndex];
  
  // Check if product is already in favorites
  const existingFavorite = userObj.favorites.find(
    (item) => String(item.productId) === String(cartItem.productId)
  );
  
  if (existingFavorite) {
    return res.status(400).json({
      success: false,
      message: "Product is already in your favorites",
    });
  }

  // Add to favorites (keep in cart)
  userObj.favorites.push({ productId: cartItem.productId });
  await userObj.save();

  return res.status(200).json({
    success: true,
    message: "Product added to favorites successfully",
    cart: userObj.cart,
  });
});

module.exports = {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  moveToFavorites,
};
