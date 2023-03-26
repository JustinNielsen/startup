//const cookieParser = require("cookie-parser");
//const bcrypt = require("bcrypt");
const express = require("express");
const app = express();
//const DB = require("./database.js");
//const { PeerProxy } = require("./peerProxy.js");

const authCookieName = "token";

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());

//app.use(cookieParser());

app.use(express.static("public"));

var apiRouter = express.Router();
//app.use('/api', apiRouter);

//apiRouter.

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile("login.html", { root: "public" });
});

// setAuthCookie in the HTTP response
//   function setAuthCookie(res, authToken) {
//     res.cookie(authCookieName, authToken, {
//       secure: true,
//       httpOnly: true,
//       sameSite: 'strict',
//     });
//   }

const httpService = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
