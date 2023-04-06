import "bootstrap/dist/css/bootstrap.min.css";
import { FaTrash } from "react-icons/fa";

// Pass in goalName, complete, updateGoal, and deleteGoal
export function Goal(props) {
  return (
    <li id={props.goalName} key={props.goalName} className="row list-group-item border border-3">
      <div className="row justify-content-between">
        <h3 className="col-auto">{props.goalName}</h3>
        <div className="col-auto">
          <input
            type="radio"
            className="btn-check"
            name={props.goalName}
            id={`${props.goalName} success`}
            autoComplete="off"
            onClick={() => props.updateGoal(props.goalName, true)}
            defaultChecked={props.complete}
          />
          <label className="btn btn-outline-success m-1" htmlFor={`${props.goalName} success`}>
            Complete
          </label>

          <input
            type="radio"
            className="btn-check"
            name={props.goalName}
            id={`${props.goalName} danger`}
            autoComplete="off"
            onClick={() => props.updateGoal(props.goalName, false)}
            defaultChecked={!props.complete}
          />
          <label className="btn btn-outline-danger m-1" htmlFor={`${props.goalName} danger`}>
            Incomplete
          </label>

          <button
            className="btn"
            onClick={() => {
              props.deleteGoal(props.goalName);
            }}
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </li>
  );
}
