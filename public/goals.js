function clear() {
  localStorage.clear();
}

function load() {
  let goals = getGoals();

  for (const goal of goals) {
    addNewGoal(goal);
  }

  updateCounts(goals);
}

load();

function logout() {
  fetch(`/api/auth/logout`, {
    method: "delete",
  }).then(() => (window.location.href = "login.html"));
}

function addGoal() {
  let goalEl = document.getElementById("form-goal");
  let goalTitle = goalEl.value;
  goalEl.value = "";

  if (goalTitle != "") {
    addNewGoal({ title: goalTitle, complete: false });
    updateGoal(goalTitle, false);
  }
}

function updateGoal(goalTitle, complete) {
  let goals = getGoals();
  const newGoal = { title: goalTitle, complete: complete };

  let found = false;
  for (const goal of goals) {
    if (goal.title == goalTitle) {
      found = true;
      goal.complete = complete;
      break;
    }
  }

  if (!found) {
    goals.push(newGoal);
  }

  updateCounts(goals);
  localStorage.setItem("goals", JSON.stringify(goals));
}

function updateCounts(goals) {
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

  document.getElementById("complete-goals").textContent = goalCount.toString();
  document.getElementById("complete-count").textContent = completeCount.toString();
  document.getElementById("incomplete-count").textContent = incompleteCount.toString();
  document.getElementById("sitewide-completed-goals").textContent = completeCount.toString();

  let percentage = goalCount != 0 ? (completeCount / goalCount) * 100 : 0;
  document.getElementById("progressbar").setAttribute("style", "width: " + percentage + "%");
}

function getGoals() {
  let goals = [];
  const goalsText = localStorage.getItem("goals");

  if (goalsText != null) {
    goals = JSON.parse(goalsText);
  }

  return goals;
}

function addNewGoal(goal) {
  const listElement = document.querySelector("#goals-list");

  let html = goal.complete ? completeGoal(goal.title) : incompleteGoal(goal.title);

  const newChild = document.createElement("li");
  newChild.setAttribute("id", goal.title);
  newChild.setAttribute("class", "row list-group-item border border-3");
  newChild.innerHTML = html;

  listElement.appendChild(newChild);
}

function deleteGoal(goalName) {
  console.log("deleting " + goalName);

  const listElement = document.getElementById(goalName);
  listElement.parentElement.removeChild(listElement);

  let goals = getGoals();
  let newGoals = goals.filter((goal) => goal.title != goalName);

  updateCounts(newGoals);
  localStorage.setItem("goals", JSON.stringify(newGoals));
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
