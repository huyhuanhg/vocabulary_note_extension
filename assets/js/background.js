chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    message.hasOwnProperty("userinfo") &&
    sender.url === "http://localhost:3000/extension/auth/login"
  ) {
    chrome.storage.local.set({ userinfo: message.userinfo });
    sendResponse({ status: "success" });
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.hasOwnProperty("userinfo")) {
    chrome.tabs.onActivated.addListener((tabId) => {
      const { email, displayName, photoURL } = JSON.parse(
        changes.userinfo.newValue
      );
      chrome.tabs.sendMessage(tabId, {
        method: "voca_update_userinfo",
        data: {
          email: email || "",
          displayName: displayName || "",
          photoURL: photoURL || "",
        },
      });
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, { status }, tab) => {
  if (status === "complete") {
    chrome.storage.local.get(["userinfo"]).then((result) => {
      if (result.hasOwnProperty("userinfo")) {
        const { email, displayName, photoURL } = JSON.parse(
          result.userinfo
        );
        chrome.tabs.sendMessage(tabId, {
          method: "voca_update_userinfo",
          data: {
            email: email || "",
            displayName: displayName || "",
            photoURL: photoURL || "",
          },
        });
      }
    });
  }
});
