function login() {
  const username = document.querySelector("#username");
  const password = document.querySelector("#password");
  localStorage.setItem("username", username.value);
  localStorage.setItem("password", password.value);

  window.location.href = "goals.html";
}
