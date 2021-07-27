const stripeAPI = require("../stripe");

const calculateTotalAmount = (cartItems) => {
  return cartItems.reduce((total, item) => {
    total += item.quantity * item.price;
    return total;
  }, 0);
};

const paymentIntent = async (req, res) => {
  const { cartItems, description, shipping, receiptEmail } = req.body;
  let paymentIntent;
  try {
    paymentIntent = await stripeAPI.paymentIntents.create({
      amount: calculateTotalAmount(cartItems) * 100, // convert into cents
      currency: "usd",
      shipping,
      description,
      receipt_email: receiptEmail,
      payment_method_types: ["card"],
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res
      .status(400)
      .json({ error: "An error occurred, unable to create payment intent" });
  }
};

module.exports = paymentIntent;
