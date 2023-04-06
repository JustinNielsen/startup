import React from "react";

import "./App.css";
import { AuthState } from "./login/authState";
import { Login } from "./login/login";
import { Goals } from "./goals/goals";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [userName, setUserName] = React.useState(localStorage.getItem("username") || "");

  function logout() {
    fetch(`/api/auth/logout`, {
      method: "delete",
    }).then(() => onAuthChange(userName, AuthState.Unauthenticated));
  }

  // Asynchronously determine if the user is authenticated by calling the service
  const [authState, setAuthState] = React.useState(AuthState.Unknown);
  React.useEffect(() => {
    if (userName) {
      fetch(`/api/user/${userName}`)
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          }
        })
        .then((user) => {
          const state = user?.authenticated ? AuthState.Authenticated : AuthState.Unauthenticated;
          setAuthState(state);
        });
    } else {
      setAuthState(AuthState.Unauthenticated);
    }
  }, [userName]);

  return (
    <div className="body">
      <header className="overflow-hidden">
        <div className="sticky-top bg-dark text-light row px-3 justify-content-between">
          <h1 className="col-auto">Goals</h1>
          {authState === AuthState.Authenticated && (
            <div className="col-auto row">
              <form className="col-auto m-2" action="index.html">
                <button id="login" class="btn btn-primary" onClick={() => logout()}>
                  Logout
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {authState === AuthState.Authenticated && <Goals />}
      {authState === AuthState.Unauthenticated && (
        <Login
          className="login"
          userName={userName}
          onAuthChange={(userName, authState) => {
            setAuthState(authState);
            setUserName(userName);
          }}
        />
      )}

      <div className="container-fluid">
        <span className="text-reset">Author: Justin Nielsen</span>
        <a className="text-reset" href="https://github.com/JustinNielsen/startup">
          Github
        </a>
      </div>
    </div>
  );
}

export default App;
