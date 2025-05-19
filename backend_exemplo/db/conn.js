require('dotenv').config(); // load .env variables

const mongoose = require('mongoose');
mongoose.set("strictQuery", true);
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Conectou ao Mongoose");
}

main().catch((err) => console.log(err));

module.exports = mongoose;
