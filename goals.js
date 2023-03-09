function incrementGoals() {
  let goalCount = localStorage.getItem("goalCount");

  if (goalCount == null) {
    localStorage.setItem("goalCount", 1);
  } else {
    localStorage.setItem("goalCount", goalCount + 1);
  }
}

function addGoal() {
  let goalEl = document.getElementById("form-goal");
  let goalTitle = goalEl.value;

  if (goalTitle != "") {
    addNewGoal(goalEl.value);
  }
}

function addNewGoal(goalName) {
  const listElement = document.querySelector("#goals-list");

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

  const newChild = document.createElement("li");
  newChild.setAttribute("id", goalName);
  newChild.setAttribute("class", "row list-group-item border border-3");
  newChild.innerHTML = html;

  listElement.appendChild(newChild);
}

function deleteGoal(goalName) {
  console.log("deleting " + goalName);

  const listElement = document.getElementById(goalName);
  listElement.parentElement.removeChild(listElement);
}
