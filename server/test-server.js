const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Test server is running!",
    status: "OK"
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Test server is running on http://localhost:${port}`);
});
