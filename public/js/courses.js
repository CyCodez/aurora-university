let allCourses = [];
let compared = [];
const money = value => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value));
document.addEventListener("DOMContentLoaded", loadCourses);
async function loadCourses() {
  const message = document.getElementById("course-message");
  try {
    const response = await fetch("/api/courses");
    if (!response.ok) throw new Error("Could not load courses.");
    allCourses = await response.json();
    const departments = [...new Set(allCourses.map(course => course.department))];
    const select = document.getElementById("department");
    departments.forEach(department => {
      const option = document.createElement("option");
      option.value = department; option.textContent = department; select.appendChild(option);
    });
    document.getElementById("search").addEventListener("input", showCourses);
    select.addEventListener("change", showCourses);
    showCourses();
  } catch (error) {
    message.textContent = "Courses could not load. Check that the server and MongoDB database are running.";
  }
}
function showCourses() {
  const search = document.getElementById("search").value.toLowerCase().trim();
  const department = document.getElementById("department").value;
  const found = allCourses.filter(course => course.name.toLowerCase().includes(search) && (!department || course.department === department));
  const list = document.getElementById("course-list");
  const message = document.getElementById("course-message");
  list.replaceChildren();
  message.textContent = found.length ? `${found.length} course(s) found.` : "No courses match your search.";
  found.forEach(course => {
    const card = document.createElement("article");
    card.className = "card course-card";
    const title = document.createElement("h3"); title.textContent = course.name;
    const dept = document.createElement("p"); dept.className = "muted"; dept.textContent = course.department;
    const desc = document.createElement("p"); desc.textContent = course.description;
    const fee = document.createElement("p"); fee.className = "fee"; fee.textContent = money(course.estimatedFee);
    const actions = document.createElement("div"); actions.className = "card-actions";
    const apply = document.createElement("a"); apply.className = "button button-primary"; apply.textContent = "Apply for this course"; apply.href = `apply.html?courseId=${course.id}`;
    const compare = document.createElement("button"); compare.className = "button button-light"; compare.textContent = compared.includes(course.id) ? "Remove compare" : "Compare";
    compare.addEventListener("click", () => toggleCompare(course.id));
    actions.append(apply, compare); card.append(title, dept, desc, fee, actions); list.append(card);
  });
  showCompare();
}
function toggleCompare(id) {
  if (compared.includes(id)) compared = compared.filter(item => item !== id);
  else if (compared.length < 3) compared.push(id);
  else {
    alert("You can compare up to three courses at a time.");
    return;
  }
  showCourses();
}
function showCompare() {
  const box = document.getElementById("compare-box");
  const selected = allCourses.filter(course => compared.includes(course.id));
  if (!selected.length) {
    box.classList.add("hidden");
    box.replaceChildren();
    return;
  }
  box.classList.remove("hidden");
  box.innerHTML = "<h3>Course comparison</h3>";
  selected.forEach(course => {
    const p = document.createElement("p");
    p.textContent = `${course.name} — ${course.department} — ${money(course.estimatedFee)}`;
    box.append(p);
  });
}
