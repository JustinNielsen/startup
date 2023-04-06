import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// Pass in goalName, complete, updateGoal, and deleteGoal
export function Goal(props) {
  return (
    <div class="row justify-content-between">
      <h3 class="col-auto">{props.goalName}</h3>
      <div class="col-auto">
        <input
          type="radio"
          class="btn-check"
          name={props.goalName}
          id={`${props.goalName} success`}
          autocomplete="off"
          onClick={() => updateGoal(props.goalName, true)}
          checked={props.complete}
        />
        <label class="btn btn-outline-success" for={`${props.goalName} success`}>
          Complete
        </label>

        <input
          type="radio"
          class="btn-check"
          name={props.goalName}
          id={`${props.goalName} danger`}
          autocomplete="off"
          onClick={() => props.updateGoal(props.goalName, true)}
          checked={!props.complete}
        />
        <label class="btn btn-outline-danger" for={`${props.goalName} danger`}>
          Incomplete
        </label>

        <button
          class="btn"
          onClick={() => {
            props.deleteGoal(props.goalName);
          }}
        >
          <i class="fa fa-trash"></i>
        </button>
      </div>
    </div>
  );
}
