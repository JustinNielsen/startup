import { useState } from "react";
import "./login.css";

import { MessageDialog } from "./messageDialog";
import { AuthState } from "./authState";
import "bootstrap/dist/css/bootstrap.min.css";

export function Login(props) {
  const [userName, setUserName] = useState(props.userName);
  const [password, setPassword] = useState("");
  const [displayError, setDisplayError] = useState(null);

  async function login() {
    console.log("Login");
    loginOrRegister("/api/auth/login");
  }

  async function register() {
    console.log("Register");
    loginOrRegister("/api/auth/register");
  }

  async function loginOrRegister(endpoint) {
    const response = await fetch(endpoint, {
      method: "post",
      body: JSON.stringify({ username: userName, password: password }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const body = await response.json();

    if (response?.status === 200) {
      localStorage.setItem("username", userName);
      props.onAuthChange(userName, AuthState.Authenticated);
    } else {
      setDisplayError(`⚠ Error: ${body.msg}`);
    }
  }

  return (
    <div className="main container-fluid text-center">
      <>
        <div>
          <h1>Welcome</h1>
          <div className="input-group mb-3">
            <span className="input-group-text">@</span>
            <input
              className="form-control"
              type="text"
              id="username"
              onChange={(e) => setUserName(e.target.value)}
              placeholder="username"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text">🔒</span>
            <input
              className="form-control"
              type="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </div>
          <button type="button" className="loginButton btn btn-primary" onClick={() => login()}>
            Login
          </button>
          <button type="button" className="loginButton btn btn-primary" onClick={() => register()}>
            Register
          </button>
        </div>

        <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />
      </>
    </div>
  );
}
