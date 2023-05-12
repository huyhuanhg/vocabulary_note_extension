class BoxLoginOrUser extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  async render() {
    const user = await this.#getUser();
    const userInfoNode = this.#parseUserInfoNode(user);
    this.classList.remove("loading");
    this.innerHTML = "";
    this.append(userInfoNode);
  }

  #getUser() {
    return chrome.storage.local.get(["userinfo"]).then((result) => {
      if (result.hasOwnProperty("userinfo")) {
        const { email, displayName, photoURL } = JSON.parse(result.userinfo);
        return { email, displayName, photoURL };
      }

      return null;
    });
  }

  #parseUserInfoNode(user) {
    const img = document.createElement("img");
    img.className = "user-avatar";
    img.src = user?.photoURL || "./assets/images/empty_user.png";
    img.alt = user?.displayName || "User";

    const text = document.createElement("span");
    text.className = "user-display-name";
    text.innerHTML = user?.displayName || "Đăng nhập";

    const link = document.createElement("a");
    link.className = "ex-text-userinfo";
    link.href = user?.email
      ? "https://famous-sorbet-043f80.netlify.app/user"
      : "https://famous-sorbet-043f80.netlify.app/auth/login/extension";
    link.target = "_blank";

    link.append(text);
    link.append(img);

    return link;
  }
}

customElements.define("box-login-or-user", BoxLoginOrUser);
