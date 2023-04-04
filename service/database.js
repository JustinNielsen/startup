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

async function addGoal(username, goalTitle) {
  const goal = {
    username: username,
    title: goalTitle,
    complete: false,
  };

  await goalsCollection.insertOne(goal);
}

async function updateGoal(username, goalTitle, complete) {
  const filter = { username: username, title: goalTitle };
  const update = { $set: { complete: complete } };

  if (complete) {
    incrementCompleteGoalCount();
  }

  await goalsCollection.updateOne(filter, update);

  return await getGoalsByUser(username);
}

async function removeGoal(username, goalTitle) {
  await goalsCollection.deleteOne({ username: username, title: goalTitle });

  return await getGoalsByUser(username);
}

function getGoalsByUser(username) {
  const cursor = goalsCollection.find({ username: username });

  return cursor.toArray();
}

function getGoal(username, goalTitle) {
  return goalsCollection.findOne({ username: username, title: goalTitle });
}

async function getCompleteGoalCount() {
  completeCount = await siteCollection.findOne({ key: "CompleteGoalCount" });

  if (completeCount) {
    return completeCount;
  } else {
    const goalCount = { key: "CompleteGoalCount", value: 0 };
    siteCollection.insertOne(goalCount);
    return JSON.stringify(goalCount);
  }
}

async function incrementCompleteGoalCount() {
  currentCount = await siteCollection.findOne({ key: "CompleteGoalCount" });

  if (currentCount) {
    newCount = currentCount.value + 1;
    await siteCollection.updateOne({ key: "CompleteGoalCount" }, { $set: { value: newCount } });
  } else {
    const goalCount = { key: "CompleteGoalCount", value: 1 };
    await siteCollection.insertOne(goalCount);
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
  getGoal,
  getCompleteGoalCount,
  incrementCompleteGoalCount,
};
