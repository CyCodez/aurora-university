async function getSession() {
  const response = await fetch("/api/me");
  return response.json();
}
async function showNav() {
  const nav = document.querySelector("[data-nav-links]");
  if (!nav) return;
  try {
    const data = await getSession();
    const loginLinks = nav.querySelectorAll("[data-guest]");
    const userLinks = nav.querySelectorAll("[data-user]");
    loginLinks.forEach(el => el.classList.toggle("hidden", data.loggedIn));
    userLinks.forEach(el => el.classList.toggle("hidden", !data.loggedIn));
    const name = nav.querySelector("[data-user-name]");
    if (name && data.user) name.textContent = data.user.fullName.split(" ")[0];
  } catch (error) {
    console.log("Could not check session", error);
  }
}
document.addEventListener("DOMContentLoaded", showNav);
