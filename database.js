const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const uuid = require("uuid");

const userName = process.env.MONGOUSER;
const password = process.env.MONGOPASSWORD;
const hostname = process.env.MONGOHOSTNAME;

if (!userName || !password || !hostname) {
  throw Error("Database not configured. Set environment variables");
}

const url = `mongodb+srv://${userName}:${password}@${hostname}`;

const client = new MongoClient(url);
const usersCollection = client.db("startup").collection("users");
const goalsCollection = client.db("startup").collection("goals");
const siteCollection = client.db("startup").collection("site");

function getUser(username) {
  return usersCollection.findOne({ username: username });
}

function getUserByAuthtoken(authtoken) {
  return usersCollection.findOne({ token: authtoken });
}

async function registerUser(username, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    username: username,
    password: passwordHash,
    token: uuid.v4(),
  };
  await usersCollection.insertOne(user);

  return user;
}

function addGoal(username, goalTitle) {
  const goal = {
    username: username,
    goal: goalTitle,
    complete: false,
  };

  goalsCollection.insertOne(goal);
}

function updateGoal(goalTitle, complete) {
  const filter = { goal: goalTitle };
  const update = { $set: { complete: complete } };

  goalsCollection.updateOne(filter, update);
}

function removeGoal(goalTitle) {
  goalsCollection.deleteOne({ goal: goalTitle });
}

function getGoalsByUser(username) {
  const cursor = goalsCollection.find({ username: username });

  return cursor.toArray;
}

function getCompleteGoalCount() {
  completeCount = siteCollection.findOne({ key: "CompleteGoalCount" });

  if (completeCount) {
    return completeCount.value;
  } else {
    const goalCount = { key: "CompleteGoalCount", value: 1 };
    siteCollection.insertOne(goalCount);
    return 1;
  }
}

function incrementCompleteGoalCount() {
  currentCount = siteCollection.findOne({ key: "CompleteGoalCount" });

  if (currentCount) {
    newCount = currentCount.value + 1;
    siteCollection.updateOne({ key: "CompleteGoalCount" }, { $set: { value: newCount } });
  } else {
    const goalCount = { key: "CompleteGoalCount", value: 1 };
    siteCollection.insertOne(goalCount);
  }
}

module.exports = {
  getUser,
  getUserByAuthtoken,
  registerUser,
  addGoal,
  updateGoal,
  removeGoal,
  getGoalsByUser,
  getCompleteGoalCount,
  incrementCompleteGoalCount,
};
