

chrome.runtime.onMessage.addListener(
  ({ method, data }, sender, sendResponse) => {
    switch (method) {
      case "login":
        if (sender.url === "https://vocanote.netlify.app/auth/login/extension") {
          chrome.storage.local.set({ userinfo: data });
          sendResponse({ status: "success" });
        }
        break;
    }

    return true;
  }
);

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.hasOwnProperty("userinfo")) {
    chrome.tabs.onActivated.addListener((tabId) => {
      const userinfo = JSON.parse(changes.userinfo.newValue);
      chrome.tabs.sendMessage(tabId, {
        method: "voca_update_userinfo",
        data: {
          email: userinfo?.email || "",
          displayName: userinfo?.displayName || "",
          photoURL: userinfo?.photoURL || "",
        },
      });
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, { status }, tab) => {
  if (status === "complete") {
    chrome.storage.local.get(["userinfo"]).then((result) => {
      if (result.hasOwnProperty("userinfo")) {
        const userinfo = JSON.parse(result.userinfo);
        chrome.tabs.sendMessage(tabId, {
          method: "voca_update_userinfo",
          data: {
            email: userinfo?.email || "",
            displayName: userinfo?.displayName || "",
            photoURL: userinfo?.photoURL || "",
          },
        });
      }
    });
  }
});
