import { useState, useEffect } from "react";
import { MessageDialog } from "../login/messageDialog";
import { GoalEventNotifier } from "./goalNotifier";

import "bootstrap/dist/css/bootstrap.min.css";
import { Goal } from "./goal";

// Current Progress - Need to fix login and register buttons and get the model popping up on error
// Also need to implement this page specifically adding the javascript functions
// Websocket won't work in the development environment unless you make some changes for the development environment

export function Goals() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [completeCount, setCompleteCount] = useState(0);
  const [incompleteCount, setIncompleteCount] = useState(0);
  const [sitewideCount, setSitewideCount] = useState(0);
  const [joke, setJoke] = useState("");
  const [webMessage, setWebMessage] = useState("");
  const [displayError, setDisplayError] = useState(null);

  useEffect(() => {
    load();
    displayJoke();
  }, []);

  useEffect(() => {
    GoalEventNotifier.addHandler(handleEvent);

    return () => {
      GoalEventNotifier.removeHandler(handleEvent);
    };
  });

  function handleEvent(event) {
    setWebMessage(`${event.from} completed a goal`);
  }

  return (
    <>
      <main className="mt-3 mx-3">
        <div className="row mb-3 center" id="add-goal">
          <div className="col-auto">
            <input
              type="text"
              id="form-goal"
              className="form-control"
              onChange={(e) => setNewGoal(e.target.value)}
              value={newGoal}
              placeholder="New goal title"
            />
          </div>
          <button
            id="add-goal"
            className="col-auto btn btn-primary mr-2"
            onClick={() => {
              addGoal();
            }}
          >
            Add Goal
          </button>
        </div>
        <div className="container-fluid rounded">
          <ul className="list-group" id="goals-list">
            {goals}
          </ul>
        </div>
      </main>

      <footer className="row mx-1">
        <div className="container-fluid col-lg-3 mt-2">
          <div className="rounded bg-dark text-light text-center p-2">
            <h1>Goals Completed</h1>
            <div className="m-4 progress">
              <div
                className="progress bg-success"
                role="progressbar"
                id="progressbar"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="container-fluid col-lg-3 mt-2">
          <div className="rounded bg-dark text-light text-center p-2">
            <h1>
              Total Goals: <span id="total-goals">{goals.length}</span>
            </h1>
            <ul className="list-group">
              <li className="list-group-item">
                <h4>
                  Complete: <span id="complete-count">{completeCount}</span>
                </h4>
              </li>
              <li className="list-group-item">
                <h4>
                  Incomplete: <span id="incomplete-count">{incompleteCount}</span>
                </h4>
              </li>
            </ul>
          </div>
        </div>
        <div className="container-fluid col-lg-3 mt-2">
          <div className="rounded bg-dark text-light text-center p-2">
            <h1>Sitewide Completed Goals</h1>
            <ul className="list-group">
              <li className="list-group-item">
                <h1 id="sitewide-completed-goals">{sitewideCount}</h1>
                <p id="recent-complete">{webMessage}</p>
              </li>
            </ul>
          </div>
        </div>
        <div className="container-fluid col-lg-3 mt-2">
          <div className="rounded bg-dark text-light text-center p-2">
            <h1>Joke API</h1>
            <p id="joke">{joke}</p>
          </div>
        </div>
      </footer>

      <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />
    </>
  );

  async function load() {
    let goals = [];
    try {
      // Get the latest goals from service
      const username = localStorage.getItem("username");
      const response = await fetch(`/api/goals/${username}`);
      goals = await response.json();

      // Save the goals in case we go offline in the future
      localStorage.setItem("goals", JSON.stringify(goals));
    } catch {
      // If there was an error then just use the last saved goals
      const goalsText = localStorage.getItem("goals");
      if (goalsText) {
        goals = JSON.parse(goals);
      }
    }

    buildGoals(goals);

    updateCounts(goals);
  }

  async function addGoal() {
    const username = localStorage.getItem("username");
    const goal = { title: newGoal, username: username };

    if (newGoal != "") {
      const response = await fetch("api/addGoal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(goal),
      });

      const goals = await response.json();

      if (response?.status === 200) {
        localStorage.setItem("goals", goals);
        buildGoals(goals);
        updateCounts(goals);
      } else {
        setDisplayError(`⚠ Error: ${goals.msg}`);
      }
    }

    setNewGoal("");
  }

  async function updateGoal(goalTitle, complete) {
    const username = localStorage.getItem("username");

    if (complete) {
      GoalEventNotifier.broadcastEvent(username);
    }

    const response = await fetch("api/updateGoal", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: username, title: goalTitle, complete: complete }),
    });
    const goals = await response.json();

    updateCounts(goals);
    localStorage.setItem("goals", JSON.stringify(goals));
  }

  async function deleteGoal(goalTitle) {
    const username = localStorage.getItem("username");

    const response = await fetch("api/deleteGoal", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: username, title: goalTitle }),
    });
    const goals = await response.json();

    updateCounts(goals);
    localStorage.setItem("goals", JSON.stringify(goals));
    buildGoals(goals);
  }

  async function updateCounts(goals) {
    let goalCount = goals.length;
    let completeCount = 0;
    let incompleteCount = 0;

    for (const goal of goals) {
      if (goal.complete) {
        completeCount++;
      } else {
        incompleteCount++;
      }
    }

    const response = await fetch("api/completeCount");
    const siteCompleteCount = await response.json();

    setCompleteCount(completeCount);
    setIncompleteCount(incompleteCount);
    setSitewideCount(siteCompleteCount.value);

    let percentage = goalCount != 0 ? (completeCount / goalCount) * 100 : 0;
    setPercentage(percentage);
  }

  function buildGoals(jsGoals) {
    const builtGoals = [];

    for (const jsGoal of jsGoals) {
      builtGoals.push(
        <Goal goalName={jsGoal.title} complete={jsGoal.complete} updateGoal={updateGoal} deleteGoal={deleteGoal} />
      );
    }

    setGoals(builtGoals);
  }

  // API functionality

  function displayJoke() {
    const jokeEl = document.querySelector("#joke");

    fetch(
      "https://v2.jokeapi.dev/joke/Programming?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=single"
    )
      .then((response) => response.json())
      .then((data) => setJoke(data.joke));
  }
}
