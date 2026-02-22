const API = "https://onecommit.onrender.com/api/v1";

function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["token"], (result) => {
      resolve(result.token ?? null);
    });
  });
}

async function checkCommit(token) {
  const res = await fetch(`${API}/git/check-commit`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
  return res.json();
}

function hideAll() {
  document.getElementById("loading-section").style.display = "none";
  document.getElementById("login-section").style.display = "none";
  document.getElementById("success-content").style.display = "none";
  document.getElementById("pending-content").style.display = "none";
}

function showLoading() {
  hideAll();
  document.getElementById("loading-section").style.display = "flex";
}

function showLogin() {
  hideAll();
  document.getElementById("login-section").style.display = "flex";
}

function showSuccess(data) {
  hideAll();
  document.getElementById("success-content").style.display = "flex";
  document.getElementById("success-streak-count").textContent = data.streak;
}

function showPending(data) {
  hideAll();
  document.getElementById("pending-content").style.display = "flex";
  document.getElementById("pending-streak-count").textContent = data.streak;
  if (data.time) {
    document.querySelector(".pc-reminder").textContent =
      `⏰ Reminder set for ${data.time}`;
  }
}

function showMain(data) {
  if (data.hasCommitToday) {
    console.log(data.hasCommitToday);
    showSuccess(data);
  } else {
    showPending(data);
  }
}

document.getElementById("login-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: `${API}/auth/git-login` });
});

document.getElementById("sc-github-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://github.com" });
});

document.getElementById("pc-github-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://github.com" });
});

document.getElementById("pc-open-github-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://github.com" });
});

async function init() {
  const token = await getToken();
  if (!token) {
    showLogin();
    return;
  }
  showLoading();
  try {
    const data = await checkCommit(token);
    showMain(data);
  } catch {
    chrome.storage.local.remove("token");
    showLogin();
  }
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.token?.newValue) {
    init();
  }
});

init();
