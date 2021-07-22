const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./.env" });

const createCheckoutSession = require("./api/checkout");

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

app.get("/", (req, res) => {
  res.json({
    message: "Hello World!",
  });
});

app.post("/create-checkout-session", createCheckoutSession);

app.listen(port, () => console.log(`Server running on port :${port}`));
