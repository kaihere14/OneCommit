chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  const url = changeInfo.url;
  if (url && url.startsWith("http://localhost:3000/auth/success")) {
    const token = new URL(url).searchParams.get("token");
    if (token) {
      chrome.storage.local.set({ token }, () => {
        chrome.tabs.remove(tabId);
      });
    }
  }
});
