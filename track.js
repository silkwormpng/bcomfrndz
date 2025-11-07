// ===============================
// PDS Tracking + Unlock Script
// ===============================

// Replace with your deployed Google Apps Script Web App URL:
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx31jB7TbbMOkPQgiBLOe9a7uVT2tCM9zfNL5722mt5UeAxBifHbvfQLk_mw0oqGA8s/exec";

let startTime = Date.now();

// -------------------------------
// Check Access on Page Load
// -------------------------------
function checkAccess() {
  const name = localStorage.getItem('userName');
  const roll = localStorage.getItem('rollNumber');

  if (name && roll) {
    showWelcome(name, roll);
    document.querySelectorAll('.locked').forEach(sec => sec.style.display = 'block');
    const form = document.getElementById('lockedForm');
    if (form) form.style.display = 'none';
  }
}

// -------------------------------
// Unlock Access When Name + Roll Entered
// -------------------------------
function unlockAccess() {
  const name = document.getElementById('userName').value.trim();
  const roll = document.getElementById('rollNumber').value.trim();

  // Validation: name must not be empty, roll must be 5 digits and start with 500
  const rollPattern = /^500\d{2}$/;

  if (!name) {
    alert("Please enter your name.");
    return;
  }
  if (!rollPattern.test(roll)) {
    alert("Roll number must be 5 digits and start with 500 (e.g., 50012).");
    return;
  }

  // Save to localStorage
  localStorage.setItem('userName', name);
  localStorage.setItem('rollNumber', roll);

  // Unlock content
  document.querySelectorAll('.locked').forEach(sec => sec.style.display = 'block');
  const form = document.getElementById('lockedForm');
  if (form) form.style.display = 'none';

  // Show welcome banner
  showWelcome(name, roll);

  // Send initial access log
  sendAccessLog(name, roll, 0);

  alert(`Welcome ${name}! Your access has been unlocked.`);
}

// -------------------------------
// Show Personalized Welcome Banner
// -------------------------------
function showWelcome(name, roll) {
  let welcome = document.getElementById('welcomeBanner');
  if (!welcome) {
    welcome = document.createElement('div');
    welcome.id = 'welcomeBanner';
    welcome.style.cssText = `
      background: #f0f9ff;
      color: #0074D9;
      font-size: 18px;
      font-weight: 600;
      padding: 10px 15px;
      border-radius: 8px;
      margin-bottom: 15px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
    document.body.prepend(welcome);
  }
  welcome.innerHTML = `Welcome, ${name} (Roll No: ${roll})`;
}

// -------------------------------
// Send Access Log to Google Sheet
// -------------------------------
function sendAccessLog(name, roll, timeSpent = 0) {
  const data = new URLSearchParams();
  data.append("name", name);
  data.append("rollNumber", roll);
  data.append("page", window.location.pathname);
  data.append("timeSpent", timeSpent);

  fetch(WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data
  }).catch(err => console.error("Error sending data to Google Sheet:", err));
}

// -------------------------------
// Track Time on Page Exit
// -------------------------------
window.addEventListener("beforeunload", () => {
  const name = localStorage.getItem('userName') || "Guest";
  const roll = localStorage.getItem('rollNumber') || "Unknown";
  const timeSpent = Math.round((Date.now() - startTime) / 1000);
  sendAccessLog(name, roll, timeSpent);
});

// -------------------------------
// Auto-run check on load
// -------------------------------
window.addEventListener("load", checkAccess);

