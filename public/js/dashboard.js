const money = value => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value));
document.addEventListener("DOMContentLoaded", loadDashboard);
async function loadDashboard() {
  try {
    const response = await fetch("/api/dashboard");
    if (response.status === 401) return location.replace("login.html?returnTo=dashboard.html");
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not load dashboard.");
    document.getElementById("student-name").textContent = data.user.fullName;
    document.getElementById("student-email").textContent = data.user.email;
    document.getElementById("fullName").value = data.user.fullName;
    document.getElementById("phone").value = data.user.phone;
    document.getElementById("application-count").textContent = data.applications.length;
    document.getElementById("latest-status").textContent = data.applications[0]?.status || "None yet";
    const body = document.getElementById("applications-body");
    body.replaceChildren();
    if (!data.applications.length) {
      const row = document.createElement("tr"), cell = document.createElement("td");
      cell.colSpan = 5;
      cell.className = "empty";
      cell.textContent = "No applications yet. Choose a course to begin.";
      row.append(cell);
      body.append(row);
    }
    data.applications.forEach(app => {
      const row = document.createElement("tr");
      [app.referenceCode, app.courseName, money(app.estimatedFee)].forEach(value => { const cell = document.createElement("td"); cell.textContent = value; row.append(cell); });
      const statusCell = document.createElement("td"), badge = document.createElement("span");
      badge.className = "badge " + app.status.toLowerCase().replace(/\s+/g, "-"); badge.textContent = app.status; statusCell.append(badge); row.append(statusCell);
      const actionCell = document.createElement("td");
      if (app.status === "Submitted") {
        const button = document.createElement("button"); button.className = "button button-light"; button.textContent = "Cancel";
        button.addEventListener("click", () => cancelApplication(app.id)); actionCell.append(button);
      } else actionCell.textContent = "—";
      row.append(actionCell); body.append(row);
    });
  } catch (error) {
    showMessage(error.message, true);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("profile-form").addEventListener("submit", saveProfile);
  document.getElementById("logout-button").addEventListener("click", logout);
});
async function saveProfile(event) {
  event.preventDefault();
  const button = document.getElementById("save-button"), message = document.getElementById("profile-message");
  button.disabled = true;
  try {
    const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: document.getElementById("fullName").value, phone: document.getElementById("phone").value }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    message.textContent = data.message;
    document.getElementById("student-name").textContent = document.getElementById("fullName").value;
  } catch (error) {
    message.textContent = error.message || "Could not save profile.";
    message.classList.add("error");
  }
  finally {
    button.disabled = false;
  }
}
async function cancelApplication(id) {
  if (!confirm("Cancel this submitted application?")) return;
  const response = await fetch(`/api/applications/${id}/cancel`, { method: "POST" });
  const data = await response.json();
  showMessage(data.message, !response.ok);
  if (response.ok) loadDashboard();
}
async function logout() {
  await fetch("/api/logout", { method: "POST" });
  location.replace("index.html");
}
function showMessage(text, error = false) {
  const box = document.getElementById("page-message");
  box.textContent = text;
  box.classList.remove("hidden");
  if (error) box.classList.add("error");
  else box.classList.remove("error");
}
