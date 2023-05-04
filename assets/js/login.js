window.addEventListener('storage', (e) => {
  chrome.runtime.sendMessage(
    undefined,
    {
      method: "login",
      data: e.newValue
    },
    (response) => {
      if (response.status === 'success') {
        window.close()
      }
    }
  )
});
