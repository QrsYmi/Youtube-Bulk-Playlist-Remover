const btn = document.getElementById("go");
const statusEl = document.getElementById("status");
const setStatus = (t) => (statusEl.textContent = t);

btn.addEventListener("click", async () => {
  btn.disabled = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.url || !tab.url.startsWith("https://www.youtube.com/")) {
      setStatus("Opening YouTube…");
      await chrome.tabs.update(tab.id, { url: "https://www.youtube.com/feed/playlists" });
      await new Promise((resolve) => {
        const l = (id, info) => {
          if (id === tab.id && info.status === "complete") {
            chrome.tabs.onUpdated.removeListener(l);
            resolve();
          }
        };
        chrome.tabs.onUpdated.addListener(l);
      });
      await new Promise((r) => setTimeout(r, 1500));
    }
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, world: "MAIN", files: ["app.js"] });
    window.close();
  } catch (e) {
    setStatus("Error: " + e.message);
    btn.disabled = false;
  }
});
