const stripeAPI = require("../stripe");
const customerDataPath = "./data/customer.json";
const fs = require("fs");

const calculateTotalAmount = (cartItems) => {
  return cartItems.reduce((total, item) => {
    total += item.quantity * item.price;
    return total;
  }, 0);
};

const paymentIntent = async (req, res) => {
  const customerJson = fs.readFileSync(customerDataPath);
  const customerJsonObj = JSON.parse(customerJson);

  const { cartItems, description, shipping, receiptEmail } = req.body;
  const existingCustomer = customerJsonObj.find(
    ({ receipt_email }) => receiptEmail === receipt_email
  );

  let customerId = existingCustomer ? existingCustomer.customer_id : null;

  if (!customerId) {
    try {
      const customer = await stripeAPI.customers.create({
        name: shipping.name,
        address: {
          line1: shipping.address.line1, // required
          country: "NP", // required for payment from outside to business in India
          city: "Kathmandu",
        },
        email: receiptEmail,
      });

      customerId = customer.id;

      // stringify JSON Object
      var jsonContent = JSON.stringify([
        ...customerJsonObj,
        { customer_id: customer.id, receipt_email: customer.email },
      ]);

      fs.writeFileSync(customerDataPath, jsonContent, "utf8");
    } catch (err) {
      res
        .status(400)
        .json({ error: "An error occurred, unable to create customer" });
    }
  }

  let paymentIntent;
  try {
    paymentIntent = await stripeAPI.paymentIntents.create({
      customer: customerId,
      amount: calculateTotalAmount(cartItems) * 100, // convert into cents
      currency: "usd",
      shipping,
      description,
      receipt_email: receiptEmail,
      payment_method_types: ["card"],
    });
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log("Error : ", error);
    res
      .status(400)
      .json({ error: "An error occurred, unable to create payment intent" });
  }
};

module.exports = paymentIntent;
