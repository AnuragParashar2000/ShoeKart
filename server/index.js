require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectDatabase = require("./db/connect");
const errorHandlerMiddleware = require("./middleware/error");

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'http://localhost:5174', // Local development
    'http://localhost:5175', // Local development
    'https://shoe-3jh41fld6-anuragparashar2000s-projects.vercel.app', // Your deployed Vercel URL
    'https://shoe-iota-three.vercel.app', // Previous Vercel URL
    'https://shoe-ioqbmkeim-anuragparashar2000s-projects.vercel.app', // Previous Vercel URL
    'https://shoe-eo0pk44y0-anuragparashar2000s-projects.vercel.app', // Previous Vercel URL
    'https://shoe-pdqaeg5li-anuragparashar2000s-projects.vercel.app', // New Vercel URL
    'https://*.vercel.app' // Allow all Vercel preview deployments
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.static("./public"));

// import routes
const userRoute = require("./routes/user");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const paymentRoute = require("./routes/payments");
const adminRoute = require("./routes/admin");
const brandRoute = require("./routes/brands");
const categoryRoute = require("./routes/category");
const deliveryRoute = require("./routes/delivery");
const favoritesRoute = require("./routes/favorites");
const passwordResetRoute = require("./routes/passwordReset");
const { webhook } = require("./controllers/payments");
const { verifyToken, adminOnly } = require("./middleware/auth");

app.post("/webhook", express.raw({ type: "application/json" }), webhook);
app.use(express.json());

//using routes
app.get("/", (req, res) => {
  res.json({
    project: "ShopKart API",
    description:
      "This is an API for an shoes E-commerce application. It provides endpoints for managing products, orders, and users.",
    author: {
      name: "Sumil Suthar",
      portfolio: "http://sumilsuthar.me/",
    },
    version: "1.0.0",
  });
});
app.use("/api/v1/payment", verifyToken, paymentRoute);
app.use("/api/v1/orders", verifyToken, paymentRoute);
app.use("/api/v1/", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/cart", verifyToken, cartRoute);
app.use("/api/v1/favorites", verifyToken, favoritesRoute);
app.use("/api/v1/admin", adminOnly, adminRoute);
app.use("/api/v1/brands", adminOnly, brandRoute);
app.use("/api/v1/category", adminOnly, categoryRoute);
app.use("/api/v1/delivery", deliveryRoute);
app.use("/api/v1/password-reset", passwordResetRoute);

app.get("*", (req, res) => {
  //   res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
  res.json("404 Not Found");
});

// Middleware for Errors
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const StartServer = async () => {
  try {
    // Start server first
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

    // Try to connect to database in background
    setTimeout(async () => {
      try {
        await connectDatabase(process.env.MONGO_URI);
      } catch (dbError) {
        console.log("Database connection failed, but server is running:", dbError.message);
        console.log("Please install and start MongoDB to use full functionality");
      }
    }, 1000);
  } catch (error) {
    console.log(error);
  }
};

StartServer();
// Test comment for backend deployment - Fri Sep 12 23:13:58 IST 2025
// Test deployment with Railway token - Fri Sep 12 23:29:49 IST 2025
