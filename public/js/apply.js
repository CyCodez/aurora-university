let courses = [];
const money = value => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value));
document.addEventListener("DOMContentLoaded", async () => {
  const sessionResponse = await fetch("/api/me"), session = await sessionResponse.json();
  if (!session.loggedIn) return location.replace("login.html?returnTo=apply.html");
  document.getElementById("applicantName").value = session.user.fullName;
  document.getElementById("applicantEmail").value = session.user.email;
  await loadCourses();
  document.getElementById("courseId").addEventListener("change", updateFee);
  document.getElementById("review-button").addEventListener("click", reviewApplication);
  document.getElementById("application-form").addEventListener("submit", submitApplication);
  const params = new URLSearchParams(location.search);
  if (params.get("courseId")) { document.getElementById("courseId").value = params.get("courseId"); updateFee(); }
});
async function loadCourses() {
  const response = await fetch("/api/courses");
  courses = await response.json();
  const select = document.getElementById("courseId");
  select.replaceChildren();
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = "Choose a course";
  select.append(empty);
  courses.forEach(course => { const option = document.createElement("option"); option.value = course.id; option.textContent = `${course.name} — ${course.department}`; select.append(option); });
}
function selectedCourse() {
  return courses.find(course => course.id === Number(document.getElementById("courseId").value));
}
function updateFee() {
  const course = selectedCourse();
  document.getElementById("fee").textContent = course ? `Estimated fee: ${money(course.estimatedFee)}` : "Estimated fee: —";
  document.getElementById("submit-button").disabled = true;
}
function reviewApplication() {
  const name = document.getElementById("applicantName").value.trim(), email = document.getElementById("applicantEmail").value.trim();
  const age = Number(document.getElementById("age").value), course = selectedCourse(), statement = document.getElementById("statementText").value.trim();
  const message = document.getElementById("form-message");
  message.textContent = "";
  message.className = "form-message";
  if (name.length < 2) return show("Enter the applicant's full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return show("Enter a valid email address.");
  if (!Number.isInteger(age) || age < 16 || age > 100) return show("Age must be between 16 and 100.");
  if (!course) return show("Choose a valid course.");
  if (statement.length < 10) return show("Please write at least 10 characters for your statement.");
  const review = document.getElementById("review");
  review.classList.remove("hidden");
  review.replaceChildren();
  const title = document.createElement("h3");
  title.textContent = "Please check your details";
  const details = document.createElement("p");
  details.textContent = `${name} · ${email} · Age ${age} · ${course.name} · ${money(course.estimatedFee)}`;
  const note = document.createElement("p");
  note.textContent = statement;
  review.append(title, details, note);
  document.getElementById("submit-button").disabled = false;
  function show(text) {
    message.textContent = text;
    message.classList.add("error");
  }
}
async function submitApplication(event) {
  event.preventDefault();
  const button = document.getElementById("submit-button"), message = document.getElementById("form-message");
  if (button.disabled) return;
  button.disabled = true;
  button.textContent = "Submitting…";
  const body = {
    applicantName: document.getElementById("applicantName").value.trim(),
    applicantEmail: document.getElementById("applicantEmail").value.trim(),
    age: document.getElementById("age").value,
    courseId: document.getElementById("courseId").value,
    statementText: document.getElementById("statementText").value.trim()
  };
  try {
    const response = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not submit.");
    message.className = "form-message success";
    message.textContent = `${data.message} Reference: ${data.referenceCode}`;
    setTimeout(() => location.href = "dashboard.html", 1800);
  } catch (error) {
    message.className = "form-message error";
    message.textContent = error.message;
    button.disabled = false;
  }
  finally {
    button.textContent = "Submit application";
  }
}
