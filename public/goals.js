// Clears the local storate of all goals and user
function clear() {
  localStorage.clear();
}

// Logs the current user out returning to the login page
function logout() {
  fetch(`/api/auth/logout`, {
    method: "delete",
  }).then(() => (window.location.href = "login.html"));
}

// Gets the most recent goals from the database and inserts html of the goals
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
}

load();

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

  document.getElementById("complete-goals").textContent = goalCount.toString();
  document.getElementById("complete-count").textContent = completeCount.toString();
  document.getElementById("incomplete-count").textContent = incompleteCount.toString();
  document.getElementById("sitewide-completed-goals").textContent = siteCompleteCount.value;

  let percentage = goalCount != 0 ? (completeCount / goalCount) * 100 : 0;
  document.getElementById("progressbar").setAttribute("style", "width: " + percentage + "%");
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
  let html =
    `<div class="row justify-content-between">
  <h3 class="col-auto">` +
    goalName +
    `</h3>
  <div class="col-auto">
    <input
      type="radio"
      class="btn-check"
      name="` +
    goalName +
    `"
      id="` +
    goalName +
    ` success"
      autocomplete="off"
      onclick="updateGoal('` +
    goalName +
    `', true)"
      checked
    />
    <label class="btn btn-outline-success" for="` +
    goalName +
    ` success">Complete</label>

    <input
      type="radio"
      class="btn-check"
      name="` +
    goalName +
    `"
      id="` +
    goalName +
    ` danger"
      autocomplete="off"
      onclick="updateGoal('` +
    goalName +
    `', false)"
    />
    <label class="btn btn-outline-danger" for="` +
    goalName +
    ` danger">Incomplete</label>

    <button class="btn" onclick="deleteGoal('` +
    goalName +
    `')"><i class="fa fa-trash"></i></button>
  </div>
  </div>`;

  return html;
}

function incompleteGoal(goalName) {
  let html =
    `<div class="row justify-content-between">
  <h3 class="col-auto">` +
    goalName +
    `</h3>
  <div class="col-auto">
    <input
      type="radio"
      class="btn-check"
      name="` +
    goalName +
    `"
      id="` +
    goalName +
    ` success"
      autocomplete="off"
      onclick="updateGoal('` +
    goalName +
    `', true)"
    />
    <label class="btn btn-outline-success" for="` +
    goalName +
    ` success">Complete</label>

    <input
      type="radio"
      class="btn-check"
      name="` +
    goalName +
    `"
      id="` +
    goalName +
    ` danger"
      autocomplete="off"
      onclick="updateGoal('` +
    goalName +
    `', false)"
      checked
    />
    <label class="btn btn-outline-danger" for="` +
    goalName +
    ` danger">Incomplete</label>

    <button class="btn" onclick="deleteGoal('` +
    goalName +
    `')"><i class="fa fa-trash"></i></button>
  </div>
  </div>`;

  return html;
}
