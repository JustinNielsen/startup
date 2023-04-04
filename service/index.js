const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const express = require("express");
const app = express();
const DB = require("./database.js");
const { PeerProxy } = require("./peerProxy.js");

const authCookieName = "token";

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());

app.use(cookieParser());

app.use(express.static("public"));

var apiRouter = express.Router();
app.use("/api", apiRouter);

// Create a new user and set the authtoken cookie
apiRouter.post("/auth/register", async (req, res) => {
  if (await DB.getUser(req.body.username)) {
    res.status(409).send({ msg: "Existing User" });
  } else {
    const user = await DB.registerUser(req.body.username, req.body.password);

    setAuthCookie(res, user.token);

    res.send({
      id: user._id,
    });
  }
});

apiRouter.post("/auth/login", async (req, res) => {
  const user = await DB.getUser(req.body.username);

  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      setAuthCookie(res, user.token);
      res.send({ id: user._id });
      return;
    }
  }

  res.status(401).send({ msg: "Unauthorized" });
});

// Delete the authtoken if stored in a cookie
apiRouter.delete("/auth/logout", (_req, res) => {
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// GetUser returns information about a user
apiRouter.get("/user/:username", async (req, res) => {
  const user = await DB.getUser(req.params.username);
  if (user) {
    const token = req?.cookies.token;
    res.send({ username: user.username, authenticated: token === user.token });
    return;
  }
  res.status(404).send({ msg: "Unknown" });
});

// secureApiRouter verifies credentials for endpoints
var secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use(async (req, res, next) => {
  const authtoken = req.cookies[authCookieName];
  const user = await DB.getUserByAuthtoken(authtoken);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: "Unauthorized" });
  }
});

// Get the goals of a user
apiRouter.get("/goals/:username", async (req, res) => {
  const goals = await DB.getGoalsByUser(req.params.username);
  res.send(goals);
});

// Add a goal for a user
apiRouter.post("/addGoal", async (req, res) => {
  if (await DB.getGoal(req.body.username, req.body.title)) {
    res.status(409).send({ msg: "Existing Goal" });
  } else {
    await DB.addGoal(req.body.username, req.body.title);
    const goals = await DB.getGoalsByUser(req.body.username);
    res.send(goals);
  }
});

// Update a goal
apiRouter.post("/updateGoal", async (req, res) => {
  const goals = await DB.updateGoal(req.body.username, req.body.title, req.body.complete);
  res.send(goals);
});

// Delete a goal
apiRouter.delete("/deleteGoal", async (req, res) => {
  const goals = await DB.removeGoal(req.body.username, req.body.title);
  res.send(goals);
});

apiRouter.post("/incrementComplete", async (_req, res) => {
  await DB.incrementCompleteGoals();
  const completeCount = await DB.getCompleteGoalCount();
  res.send(completeCount);
});

apiRouter.get("/completeCount", async (_req, res) => {
  const completeCount = await DB.getCompleteGoalCount();
  res.send(completeCount);
});

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile("index.html", { root: "public" });
});

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });
}

const httpService = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

new PeerProxy(httpService);
