import React from "react";

import { NavLink, Route, Routes } from "react-router-dom";
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
    }).then(() => {
      setAuthState(AuthState.Unauthenticated);
      setUserName(userName);
    });
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
      <header className="container-fluid">
        <nav className="navbar fixed-top bg-dark px-3">
          <h1 className="col-auto text-light">Goals</h1>
          <menu className="navbar-nav px-3">
            <li className="nav-item">
              <NavLink className="nav-link text-light" to="">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link text-light" to="about">
                About
              </NavLink>
            </li>
          </menu>
          {authState === AuthState.Authenticated && (
            <div className="col-auto row">
              <div className="col-auto m-2">
                <button id="login" className="btn btn-primary" onClick={() => logout()}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            authState === AuthState.Authenticated ? (
              <Goals />
            ) : (
              <Login
                className="login"
                userName={userName}
                onAuthChange={(userName, authState) => {
                  setAuthState(authState);
                  setUserName(userName);
                }}
              />
            )
          }
          exact
        />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <div className="container-fluid">
        <span className="text-reset">Author: Justin Nielsen </span>
        <a className="text-reset" href="https://github.com/JustinNielsen/startup">
          Github
        </a>
      </div>
    </div>
  );
}

function About() {
  return (
    <main className="container-fluid text-center">
      Goals is a simple application that helps you maintain and keep track of your life goals.
    </main>
  );
}

function NotFound() {
  return <main className="container-fluid text-center">404: Return to sender. Address unknown.</main>;
}

export default App;
