// Handle tab switching
document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(content => content.classList.add("hidden"));

    button.classList.add("active");
    document.getElementById(button.dataset.tab).classList.remove("hidden");
  });
});

// Handle signup form submission
document.getElementById("signup-form").addEventListener("submit", function (e) {
  e.preventDefault();
  // Save user session (fake login)
  localStorage.setItem("isLoggedIn", "true");
  alert("Sign up successful! You can now access your dashboard.");
  showDashboardLinks();
});

// Show dashboard links if user is logged in
function showDashboardLinks() {
  if (localStorage.getItem("isLoggedIn") === "true") {
    document.getElementById("nav-links").classList.remove("hidden");
    document.getElementById("dashboard-btn").classList.remove("hidden");
  }
}

// Check login status on page load
window.addEventListener("DOMContentLoaded", showDashboardLinks);
