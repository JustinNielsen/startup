// Check if the user is already authenticated
(async () => {
  let authenticated = false;
  const username = localStorage.getItem("username");
  if (username) {
    const user = await getUser(username);
    authenticated = user?.authenticated;
  }

  if (authenticated) {
    window.location.href = "goals.html";
  }
})();

// Check if the user exists
async function getUser(username) {
  const response = await fetch(`/api/user/${username}`);
  if (response.status === 200) {
    return response.json();
  }

  return null;
}

async function login() {
  console.log("Login");
  loginOrRegister("/api/auth/login");
}

async function register() {
  console.log("Register");
  loginOrRegister("/api/auth/register");
}

async function loginOrRegister(endpoint) {
  const username = document.querySelector("#username")?.value;
  const password = document.querySelector("#password")?.value;

  const response = await fetch(endpoint, {
    method: "post",
    body: JSON.stringify({ username: username, password: password }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
  const body = await response.json();

  if (response?.status === 200) {
    localStorage.setItem("username", username);
    window.location.href = "goals.html";
  } else {
    const modalEl = document.querySelector("#msgModal");
    modalEl.querySelector(".modal-body").textContent = `⚠ Error: ${body.msg}`;
    const msgModal = new bootstrap.Modal(modalEl, {});
    msgModal.show();
  }
}
