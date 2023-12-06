class BoxResult extends HTMLElement {
  constructor() {
    super();
    this.#init();
  }

  #registerEventListener() {
    this.addEventListener(
      "render",
      (event) => {
        const { detail } = event;
        if (!detail || !Object.prototype.hasOwnProperty.call(detail, "type")) {
          return;
        }

        this.#render(detail);
      },
      false
    );
  }

  #init() {
    this.#registerEventListener();
  }

  #render({ type, res, keyword }) {
    this.innerHTML = "";
    if (type === "translate") {
      return this.#renderTranslate(res, keyword);
    }

    if (type === "vocabularies") {
      return this.#renderVocabularies(res, keyword);
    }
  }

  #renderTranslate(data) {
    if (!data) {
      this.#renderEmpty();
      return;
    }

    const stub = `
    <div id="voca_dom_gg_search">
      <div class="voca-sentences-list" data-content="voca-js-content"></div>
    </div>`;
    const node = this.#textToNode(stub);

    const sentencesListNode = node.querySelector(
      '[data-content="voca-js-content"]'
    );

    if (
      !data ||
      !data.hasOwnProperty("originTxt") ||
      !data.hasOwnProperty("transTxt")
    ) {
      renderEmpty(sentencesListNode);
    } else {
      const { originTxt, transTxt } = data;
      const originElm = document.createElement("div");
      originElm.className =
        "box_content_voca_extension-scroll voca-sentences-origin";
      originElm.innerHTML = `<span>${originTxt}</span>`;
      const transElm = document.createElement("div");
      transElm.className =
        "box_content_voca_extension-scroll voca-sentences-trans";
      transElm.innerHTML = `<span>${transTxt}</span>`;

      sentencesListNode.append(originElm);
      sentencesListNode.append(transElm);
    }
    this.append(node);
  }

  #renderVocabularies(data, keyword) {
    if (!data) {
      this.#renderEmpty();
      return;
    }

    const { data: vocaData, suggests, ids } = data;

    if (Array.isArray(vocaData) && vocaData.length > 0) {
      this.#renderVocabularyContent(vocaData, ids);
      return;
    }

    if (Array.isArray(suggests) && suggests.length > 0) {
      this.#renderSuggestContent(suggests, keyword);
      return;
    }

    this.#renderEmpty();
  }

  #renderEmpty() {
    const emptyElm = document.createElement("div");
    emptyElm.className = "voca-empty";
    emptyElm.innerHTML = `<span>Không thể hiện thị</span>`;
    this.append(emptyElm);
  }

  #renderSuggestContent(suggests, keyword) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("voca-suggest-wrapper");

    const msgElm = document.createElement("p");
    msgElm.innerHTML = "Có phải bạn đang tìm từ này?";
    msgElm.classList.add("voca-suggest-msg-vn");

    wrapper.append(msgElm);

    suggests.forEach((suggest, index) => {
      const suggestElm = document.createElement("p");
      suggestElm.classList.add("voca-suggest-word");
      suggestElm.setAttribute("value", suggest);
      suggestElm.id = `voca-suggest-word-${index}`;
      suggestElm.innerHTML = suggest;
      suggestElm.onclick = () => {
        // box.innerHTML = "";
        // box.classList.add("loading");
        // renderWordsOrSuggests(box, suggest);
      };

      wrapper.append(suggestElm);
    });

    const trans = document.createElement("p");
    trans.innerHTML = `Dịch cụm từ: "<span class="highlight">${keyword}</span>"`;
    trans.classList.add("voca-suggest-trans");
    trans.onclick = () => {
      // box.innerHTML = "";
      // box.classList.add("loading");
      // renderTranslate(box, text);
    };
    wrapper.append(trans);

    this.append(wrapper);
  }

  #renderVocabularyContent(vocaData, ids) {
    const wordDetailStub = `
    <div class="voca-translate-detail-item">
      <div class="voca-detai-translate">
        <p class="voca-text-translate"></p>
        <div class="voca-word-action-btns">
          <button class="voca-word-action-btn">
            <svg width="15" height="16" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7 0.5C3.41023 0.5 0.5 3.41023 0.5 7C0.5 10.5898 3.41023 13.5 7 13.5C10.5898 13.5 13.5 10.5898 13.5 7C13.5 3.41023 10.5898 0.5 7 0.5ZM9.81745 5.90091C9.86933 5.84161 9.90883 5.77253 9.93362 5.69774C9.95841 5.62294 9.96799 5.54395 9.9618 5.4654C9.95561 5.38685 9.93377 5.31033 9.89757 5.24035C9.86137 5.17036 9.81154 5.10833 9.75101 5.05788C9.69047 5.00744 9.62047 4.96961 9.5451 4.94663C9.46974 4.92364 9.39054 4.91596 9.31216 4.92403C9.23378 4.93211 9.15781 4.95578 9.08871 4.99365C9.01962 5.03152 8.95879 5.08282 8.90982 5.14455L6.36891 8.19305L5.05414 6.87768C4.94269 6.77004 4.79342 6.71048 4.63849 6.71183C4.48356 6.71318 4.33535 6.77532 4.22579 6.88488C4.11623 6.99444 4.05408 7.14265 4.05274 7.29758C4.05139 7.45252 4.11095 7.60178 4.21859 7.71323L5.99132 9.48595C6.04938 9.54398 6.11889 9.58927 6.19543 9.61894C6.27196 9.64862 6.35384 9.66202 6.43584 9.65829C6.51784 9.65457 6.59817 9.6338 6.6717 9.59731C6.74523 9.56082 6.81035 9.50941 6.86291 9.44636L9.81745 5.90091Z"></path>
            </svg>
            <p class="voca-word-action-btn-label">Lưu từ</p>
          </button>
        </div>
      </div>
      <div class="voca-word-sentence"></div>
    </div>
  `;
    const wordPhoneticStub = `
    <div class="voca-ex-phonetic">
      <p class="voca-ex-text"></p>
      <div class="voca-ex-audio">
        <svg width="19" height="21" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg"
         >
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M14.2674 6.2553C14.2674 8.30126 13.626 10.2507 12.4549 11.8681C12.3141 12.0626 12.0436 12.1051 11.8508 11.963C11.6581 11.8208 11.616 11.5479 11.7568 11.3534C12.8207 9.88419 13.4029 8.11464 13.4029 6.2553C13.4029 4.42328 12.8377 2.6782 11.8027 1.22116C11.6636 1.02535 11.7082 0.752834 11.9022 0.612475C12.0962 0.472115 12.3663 0.517064 12.5054 0.71287C13.6448 2.31691 14.2674 4.23942 14.2674 6.2553ZM10.5798 10.6392C11.399 9.45814 11.8461 8.04602 11.8461 6.56633C11.8461 5.0722 11.3902 3.64709 10.5561 2.45945C10.4181 2.26288 10.1483 2.21646 9.95349 2.35576C9.7587 2.49506 9.7127 2.76733 9.85074 2.96389C10.5819 4.00507 10.9815 5.25416 10.9815 6.56633C10.9815 7.86583 10.5896 9.10356 9.87152 10.139C9.73463 10.3364 9.78222 10.6084 9.97782 10.7465C10.1734 10.8846 10.4429 10.8366 10.5798 10.6392ZM9.52483 6.5672C9.52483 7.54022 9.22583 8.46905 8.6784 9.24538C8.53998 9.44167 8.27008 9.48757 8.07557 9.34788C7.88105 9.2082 7.83558 8.93584 7.97399 8.73955C8.4181 8.10976 8.66029 7.35741 8.66029 6.5672C8.66029 5.76413 8.41012 5.00026 7.95249 4.36467C7.81216 4.16976 7.85497 3.89696 8.0481 3.75535C8.24124 3.61374 8.51157 3.65694 8.6519 3.85184C9.21598 4.63527 9.52483 5.57832 9.52483 6.5672ZM2.85523 4.729C4.05969 3.65496 5.96759 4.50993 5.96759 6.12371V6.80345C5.96759 8.41723 4.05969 9.2722 2.85523 8.19816V7.89529C2.58687 8.08612 2.25872 8.19833 1.90435 8.19833C0.997152 8.19833 0.261719 7.46289 0.261719 6.55569V6.37179C0.261719 5.46459 0.997152 4.72916 1.90435 4.72916C2.25872 4.72916 2.58687 4.84137 2.85523 5.0322V4.729Z"
           ></path>
        </svg>
      </div>
      <p style="margin-left:10px" class="voca-ex-phonetic-text"></p>
    </div>
    `;

    const wrapper = document.createElement("div");
    wrapper.classList.add("voca-word-list");

    vocaData.forEach(
      ({ audio_uk, audio_us, content, ipa_uk, ipa_us, type, detail }) => {
        const wordPhonetics = document.createElement("div");
        wordPhonetics.classList.add("voca-word-phonetic-list");

        if (ipa_uk) {
          const phoneticBrENode = this.#getPhoneticNode(
            wordPhoneticStub,
            "BrE",
            audio_uk,
            "#2F80ED",
            ipa_uk
          );
          wordPhonetics.append(phoneticBrENode);
        }
        if (ipa_us) {
          const phoneticNAmENode = this.#getPhoneticNode(
            wordPhoneticStub,
            "NAmE",
            audio_us,
            "#EB5757",
            ipa_us
          );
          wordPhonetics.append(phoneticNAmENode);
        }

        const wordDetail = document.createElement("div");
        wordDetail.classList.add("voca-word-detail-list");

        detail.forEach((wordDetailItem) => {
          const detailNode = this.#getWordDetailNode(
            wordDetailStub,
            type,
            wordDetailItem,
            content,
            ipa_us ?? null,
            audio_us ?? null
          );
          wordDetail.append(detailNode);
        });

        const wordItemNode = this.#getWordWrapper(
          content,
          wordPhonetics,
          wordDetail
        );

        wrapper.append(wordItemNode);
      }
    );

    this.append(wrapper);

    this.#renderSaveWordBtns(wrapper, ids);
  }

  #getPhoneticNode(wordPhoneticStub, title, audioUrl, iconColor, ipa) {
    const phoneticNode = this.#textToNode(wordPhoneticStub);
    phoneticNode.querySelector(".voca-ex-text").innerHTML = title;
    const audioElm = phoneticNode.querySelector(".voca-ex-audio");
    const audio = new Audio(audioUrl);
    audioElm.setAttribute("source", audioUrl);
    audioElm.onclick = () => audio.play();
    phoneticNode.querySelector("svg>path").setAttribute("fill", iconColor);
    phoneticNode.querySelector(".voca-ex-phonetic-text").innerHTML = ipa;

    return phoneticNode;
  }

  #textToNode(html) {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    return document.body.firstChild;
  }

  #getUser() {
    return JSON.parse(
      '{"email":"huyhuanhg@gmail.com","displayName":"Huy Huấn Hoàng","photoURL":"https://lh3.googleusercontent.com/a/AGNmyxZeHznjiil-R5jRuKx5PGFQy4duquKMRhz6ggda=s96-c"}'
    );
  }

  #getWordDetailNode = (
    wordDetailStub,
    type,
    data,
    content,
    ipa_us = null,
    audio_us = null
  ) => {
    const wordDetailNode = this.#textToNode(wordDetailStub);
    const user = this.#getUser();

    if (!user) {
      wordDetailNode.querySelector(".voca-word-action-btns")?.remove();
    } else {
      const btnSave = wordDetailNode.querySelector(".voca-word-action-btn");

      const saveData = {
        ...data,
        type,
        content,
        user: user.email,
        ipa_us,
        audio_us,
      };

      btnSave.dataset.saveWordData = JSON.stringify(saveData);
      btnSave.dataset.wordId = saveData.id;
    }

    wordDetailNode.querySelector(".voca-text-translate").innerHTML = `${
      data.trans
    } ${type ? `(${type})` : ""}`;
    wordDetailNode.querySelector(".voca-word-sentence").innerHTML =
      data.en_sentence;

    return wordDetailNode;
  }

  #getWordWrapper = (title, phoneticList, detailList) => {
    const wordTitle = document.createElement("p");
    wordTitle.classList.add("voca-text-title");
    wordTitle.innerHTML = title;

    const wrapper = document.createElement("div");
    wrapper.classList.add("voca-word-main");
    wrapper.append(wordTitle);
    wrapper.append(phoneticList);
    wrapper.append(detailList);

    return wrapper;
  }

  #renderSaveWordBtns = async (wrapper, ids) => {
    const user = this.#getUser();

    if (!user) {
      return;
    }

    // add btns
    const saveWordBtns = wrapper.querySelectorAll(".voca-word-action-btns");

    if (saveWordBtns.length === 0) {
      return;
    }

    const existVocabularyIds = await this.#getVocabularyExists(user.email, ids);

    saveWordBtns.forEach((saveWordBtn) => {
      const btnSave = saveWordBtn.querySelector(".voca-word-action-btn");
      const { saveWordData, wordId } = btnSave.dataset;

      if (existVocabularyIds.includes(wordId)) {
        btnSave.classList.add("voca-save-word-has-saved");
        btnSave.querySelector(".voca-word-action-btn-label").innerText =
          "Đã lưu";
        return;
      }

      btnSave.classList.add("voca-save-word");
      btnSave.onclick = () => {
        if (
          btnSave.classList.contains("disabled") ||
          !btnSave.classList.contains("voca-save-word")
        ) {
          return;
        }

        btnSave.classList.add("loading");
        btnSave.classList.add("disabled");
        fetch(`https://vocanote.netlify.app/api/word?q=${saveWordData}`)
          .then((res) => {
            if (res.ok) {
              btnSave.classList.remove("voca-save-word");
              btnSave.classList.add("voca-save-word-has-saved");
              btnSave.querySelector(".voca-word-action-btn-label").innerText =
                "Đã lưu";
            }
          })
          .finally(() => {
            btnSave.classList.remove("loading");
          });
      };
    });
  }

  async #getVocabularyExists(userEmail, ids) {
    return fetch(
      `https://vocanote.netlify.app/api/word/ids?user=${userEmail}&ids=${JSON.stringify(
        ids
      )}`
    )
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        return Promise.resolve({ data: { ids: [] } });
      })
      .then(({ data: { ids } }) => ids);
  }
}

customElements.define("box-result", BoxResult);
