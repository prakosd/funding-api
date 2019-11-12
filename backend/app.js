const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const sapCommitmentRoutes = require("./routes/sap-commitments");
const sapActualRoutes = require("./routes/sap-actuals");
const sapEasRoutes = require("./routes/sap-eas");
const sapRoutes = require("./routes/sap");
const sapPrToPoRoutes = require("./routes/sap-pr-to-po");

const app = express();
// mongod --dbpath="D:\Software Development\Funding Tracking System\data"
// npm run start:server
mongoose
  .connect( 'mongodb://localhost:27017/funding', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
    // "mongodb+srv://max:" +
    //   process.env.MONGO_ATLAS_PW +
    //   "@cluster0-ntrwp.mongodb.net/node-angular"
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

const apiWebPath = "/api/funding/web/";
app.use(apiWebPath + "sap/commitments", sapCommitmentRoutes);
app.use(apiWebPath + "sap/actuals", sapActualRoutes);
app.use(apiWebPath + "sap/eas", sapEasRoutes);
app.use(apiWebPath + "sap/prtopos", sapPrToPoRoutes);
app.use(apiWebPath + "sap", sapRoutes);

module.exports = app;