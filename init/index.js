const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main()
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Traveoo");
}

const initDB = async () => {
  await Listing.deleteMany({});
   initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: '678c9880fb38887ae47e4d66', // Ensure this ID is valid
  }));



  await Listing.insertMany(initData.data);
  console.log("Data initialized successfully.");
};

initDB();
