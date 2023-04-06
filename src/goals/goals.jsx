import { useState } from "react";

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

  return (
    <>
      <main className="mt-3 mx-3">
        <div className="row mb-3 center" id="add-goal">
          <div className="col-auto">
            <input type="text" id="form-goal" className="form-control" placeholder="New goal title" />
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
                <p id="recent-complete"></p>
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

    displayAllGoals(goals);

    updateCounts(goals);

    configureWebSocket();

    displayJoke();
  }

  async function addGoal() {
    let goalEl = document.getElementById("form-goal");
    let goalTitle = goalEl.value;
    goalEl.value = "";

    const username = localStorage.getItem("username");
    const goal = { title: goalTitle, username: username };

    if (goalTitle != "") {
      const response = await fetch("api/addGoal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(goal),
      });

      const goals = await response.json();

      if (response?.status === 200) {
        localStorage.setItem("goals", goals);
        displayAllGoals(goals);
        updateCounts(goals);
      } else {
        const modalEl = document.querySelector("#msgModal");
        modalEl.querySelector(".modal-body").textContent = `⚠ Error: ${goals.msg}`;
        const msgModal = new bootstrap.Modal(modalEl, {});
        msgModal.show();
      }
    }
  }

  async function updateGoal(goalTitle, complete) {
    const username = localStorage.getItem("username");

    if (complete) {
      broadcastEvent(username);
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
    displayAllGoals(goals);
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

    // TODO - Make sure total count is getting updated, might need to use useState()
    setCompleteCount(completeCount);
    setIncompleteCount(incompleteCount);
    setSitewideCount(siteCompleteCount.value);

    let percentage = goalCount != 0 ? (completeCount / goalCount) * 100 : 0;
    setPercentage(percentage);
  }

  // Takes in a list of goals and displays all of them on the page deleting any that were previously there
  function displayAllGoals(goals) {
    const listElement = document.querySelector("#goals-list");
    listElement.innerHTML = "";

    for (const goal of goals) {
      displayGoal(goal);
    }
  }

  function displayGoal(goal) {
    const listElement = document.querySelector("#goals-list");

    let html = goal.complete ? completeGoal(goal.title) : incompleteGoal(goal.title);

    const newChild = document.createElement("li");
    newChild.setAttribute("id", goal.title);
    newChild.setAttribute("class", "row list-group-item border border-3");
    newChild.innerHTML = html;

    listElement.appendChild(newChild);
  }

  function completeGoal(goalName) {
    let goal = Goal(goalName, true, updateGoal, deleteGoal);
  }

  function incompleteGoal(goalName) {
    let goal = Goal(goalName, false, updateGoal, deleteGoal);
  }

  // Functionality for peer communication using WebSocket

  function configureWebSocket() {
    const protocol = window.location.protocol === "http:" ? "ws" : "wss";
    this.socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
    this.socket.onmessage = async (event) => {
      const msg = JSON.parse(await event.data.text());
      displayMsg(msg.from);
    };
  }

  function displayMsg(from) {
    const chatText = document.querySelector("#recent-complete");
    chatText.innerHTML = `<span class="player">${from}</span> completed a goal`;
  }

  function broadcastEvent(from) {
    const event = {
      from: from,
    };
    this.socket.send(JSON.stringify(event));
  }

  // API functionality

  function displayJoke() {
    const jokeEl = document.querySelector("#joke");

    fetch(
      "https://v2.jokeapi.dev/joke/Programming?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=single"
    )
      .then((response) => response.json())
      .then((data) => (jokeEl.innerHTML = data.joke));
  }
}
