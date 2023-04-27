window.addEventListener('storage', (e) => {
  chrome.runtime.sendMessage(
    undefined,
    { userinfo: e.newValue },
    (response) => {
      if (response.status === 'success') {
        window.close()
      }
    }
  )
});
