const params = new URLSearchParams(location.search);
const returnTo = params.get("returnTo");
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-form").addEventListener("submit", login);
  document.getElementById("toggle-password").addEventListener("click", () => {
    const input = document.getElementById("password");
    input.type = input.type === "password" ? "text" : "password";
    document.getElementById("toggle-password").textContent = input.type === "password" ? "Show" : "Hide";
  });
  document.getElementById("forgot-button").addEventListener("click", forgotPassword);
});
async function login(event) {
  event.preventDefault();
  const button = document.getElementById("login-button"), message = document.getElementById("form-message");
  const values = Object.fromEntries(new FormData(event.currentTarget));
  message.textContent = "";
  message.className = "form-message";
  if (!values.email.trim() || !values.password) return show("Enter your email and password.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) return show("Enter a valid email address.");
  button.disabled = true;
  button.textContent = "Logging in…";
  try {
    const response = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, returnTo }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not log in.");
    location.href = safeReturnTo(returnTo) || "dashboard.html";
  } catch (error) {
    show(error.message);
  }
  finally {
    button.disabled = false;
    button.textContent = "Log in";
  }
  function show(text) {
    message.textContent = text;
    message.classList.add("error");
  }
}
async function forgotPassword() {
  const message = document.getElementById("form-message");
  const response = await fetch("/api/forgot-password", { method: "POST" });
  const data = await response.json();
  message.textContent = data.message;
  message.className = "form-message";
}
function safeReturnTo(value) {
  if (!value || value.includes("://") || value.startsWith("//")) return null;
  const allowed = ["dashboard.html", "apply.html"];
  return allowed.includes(value.split("?")[0]) ? value : null;
}
