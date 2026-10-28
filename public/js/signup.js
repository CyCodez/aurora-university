document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-toggle]").forEach(button => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.toggle);
      input.type = input.type === "password" ? "text" : "password";
      button.textContent = input.type === "password" ? "Show" : "Hide";
    });
  });
  document.getElementById("signup-form").addEventListener("submit", signup);
});
async function signup(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = document.getElementById("submit-button");
  const message = document.getElementById("form-message");
  const values = Object.fromEntries(new FormData(form));
  message.textContent = "";
  message.className = "form-message";
  if (values.fullName.trim().length < 2 || values.fullName.trim().length > 100) return show("Name must be between 2 and 100 characters.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) return show("Enter a valid email address.");
  if (!/^\+?[0-9][0-9\s-]{8,14}$/.test(values.phone.trim())) return show("Enter a valid phone number. Example: +234 801 234 5678");
  if (values.password.length < 8 || !/[A-Z]/.test(values.password) || !/[a-z]/.test(values.password) || !/[0-9]/.test(values.password) || !/[^A-Za-z0-9]/.test(values.password)) return show("Password needs uppercase, lowercase, a number, a special character and 8+ characters.");
  if (!values.confirmPassword) return show("Please confirm your password.");
  if (values.password !== values.confirmPassword) return show("Passwords do not match.");
  button.disabled = true;
  button.textContent = "Creating account…";
  try {
    const response = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not create account.");
    form.reset();
    message.textContent = data.message;
    message.classList.add("success");
    setTimeout(() => location.href = "login.html", 1200);
  } catch (error) {
    show(error.message);
  }
  finally {
    button.disabled = false;
    button.textContent = "Create account";
  }
  function show(text) {
    message.textContent = text;
    message.classList.add("error");
  }
}
