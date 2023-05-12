"use strict";

//config
const STUB_PATH = {
  BOX_CONTENT: "box-content",
  GG_TRANS_CONTENT: "box-gg-trans",
  WORD_DETAIL_CONTENT: "box-word-detail",
  WORD_PHONETIC_CONTENT: "box-word-phonetic",
  SUGGEST_CONTENT: "box-suggests",
};

/// helper
const removeVietnameseTones = (str) => {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
  str = str.replace(/\u02C6|\u0306|\u031B/g, "");
  return str;
};

const getSelectionText = () => {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
    text = document.selection.createRange().text;
  }

  text = text
    .trim()
    .replaceAll(/(\s)\s+/g, "$1")
    .toLowerCase();

  // TODO handle translate multiple languages
  if (true) {
    return removeVietnameseTones(text);
  }

  return text;
};

const textToNode = (html) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  return document.body.firstChild;
};

const make = (nodeName) => {
  const node = document.createElement(nodeName);
  node.setAttribute("data-disabled-mousedown", "voca-ext");
  return node;
};

const selectText = (nodeId) => {
  const node = document.getElementById(nodeId);

  if (document.body.createTextRange) {
    const range = document.body.createTextRange();
    range.moveToElementText(node);
    range.select();
  } else if (window.getSelection) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    console.warn("Could not select text in node: Unsupported browser.");
  }
};

const getUser = () => JSON.parse(localStorage.getItem("voca_userinfo") || null);

// ui content | api

const getContent = async (fileName) =>
  fetch(chrome.runtime.getURL(`/resources/${fileName}.stub.html`))
    .then((res) => res.text())
    .then((txt) => txt);

const getVocabularyExists = async (userEmail, ids) =>
  fetch(
    `https://famous-sorbet-043f80.netlify.app/api/word/ids?user=${userEmail}&ids=${JSON.stringify(
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

const translate = async (text) => {
  const ggTransUrl = "https://translate.googleapis.com/translate_a/single";

  const queryString = new URLSearchParams({
    client: "dict-chrome-ex",
    sl: "en",
    tl: "vi",
    hl: "en-US",
    dt: "t",
    // dt:'bd',
    dj: "1",
    source: "bubble",
    q: text,
  });

  return fetch(`${ggTransUrl}?${queryString}`)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }

      return Promise.resolve(null);
    })
    .then(({ sentences }) => {
      if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
        return null;
      }

      return sentences.reduce(
        (preValue, currentValue) => {
          return {
            originTxt: `${preValue.originTxt} ${currentValue.orig}`
              .replaceAll(/\s\s+/g, " ")
              .trim(),
            transTxt: `${preValue.transTxt} ${currentValue.trans}`
              .replaceAll(/\s\s+/g, " ")
              .trim(),
          };
        },
        { originTxt: "", transTxt: "" }
      );
    });
};

const fetchInfo = async (text) => {
  const apiUrl =
    "https://mochien3.1-api.mochidemy.com/v3.1/words/dictionary-english";
  const queryString = new URLSearchParams({
    key: text,
    search_positions: "first_search",
    // user_token: '',
    // uuid: '',
  });
  return fetch(`${apiUrl}?${queryString}`, {
    headers: {
      privatekey: "M0ch1M0ch1_En_$ecret_k3y",
    },
  })
    .then((res) => {
      return res.clone().json();
    })
    .then(({ data }) => {
      const { suggests, vi, ids } = data;
      return {
        ids,
        search: text,
        suggests,
        data: vi.map(
          ({
            audio_uk,
            audio_us,
            phonetic_uk,
            phonetic_us,
            position,
            detail,
            content,
          }) => ({
            content,
            audio_uk,
            audio_us,
            ipa_uk: phonetic_uk,
            ipa_us: phonetic_us,
            type: position,
            detail: detail.map(({ id, en_sentence, trans, vi_sentence }) => ({
              id,
              en_sentence,
              trans,
              vi_sentence,
            })),
          })
        ),
      };
    });
};

// display | render
const show = async (text) => {
  const boxHtml = await getContent(STUB_PATH.BOX_CONTENT);
  const box = textToNode(boxHtml);

  const userinfoElm = box.querySelector("#voca-userinfo");

  document.body.append(box);
  renderUser(userinfoElm);

  const contentElm = box.querySelector(
    '#voca-box-arround-content [data-content="voca-js-content"]'
  );

  if (text.length >= 30) {
    renderTranslate(contentElm, text);

    return;
  }

  renderWordsOrSuggests(contentElm, text);
};

const renderUser = (box) => {
  const user = getUser();

  const img = make("img");
  img.className = "user-avatar";
  img.src =
    user?.photoURL || chrome.runtime.getURL("/assets/images/empty_user.png");
  img.alt = user?.displayName || "User";

  const text = make("span");
  text.className = "user-display-name";
  text.innerHTML = user?.displayName || "Đăng nhập";

  const link = make("a");
  link.className = "ex-text-userinfo";
  link.href = user?.email
    ? "https://famous-sorbet-043f80.netlify.app/user"
    : "https://famous-sorbet-043f80.netlify.app/auth/login/extension";
  link.target = "_blank";

  link.append(text);
  link.append(img);

  box.classList.remove("loading");
  box.append(link);
};

const renderTranslate = async (box, text) => {
  if (!box) {
    return;
  }

  const translateData = await translate(text);

  renderTranslateContent(box, translateData);
};

const renderTranslateContent = async (box, data) => {
  const stub = await getContent(STUB_PATH.GG_TRANS_CONTENT);
  const node = textToNode(stub);

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
    const originElm = make("div");
    originElm.className =
      "box_content_voca_extension-scroll voca-sentences-origin";
    originElm.innerHTML = `<span data-disabled-mousedown="voca-ext">${originTxt}</span>`;
    const transElm = make("div");
    transElm.className =
      "box_content_voca_extension-scroll voca-sentences-trans";
    transElm.innerHTML = `<span data-disabled-mousedown="voca-ext">${transTxt}</span>`;

    sentencesListNode.append(originElm);
    sentencesListNode.append(transElm);
  }

  box.append(node);
  box.classList.remove("loading");
};

const renderWordsOrSuggests = async (box, text) => {
  if (!box) {
    return;
  }
  const responseData = await fetchInfo(text);

  if (!responseData) {
    renderEmpty(box);
    box.classList.remove("loading");
    return;
  }

  const { data, suggests, ids } = responseData;

  if (Array.isArray(data) && data.length > 0) {
    renderWordContent(box, data, ids);
    return;
  }

  if (Array.isArray(suggests) && suggests.length > 0) {
    renderSuggestContent(box, suggests);
    return;
  }

  renderEmpty(box);
  box.classList.remove("loading");
};

const renderWordContent = async (box, data, ids) => {
  const wordDetailStub = await getContent(STUB_PATH.WORD_DETAIL_CONTENT);
  const wordPhoneticStub = await getContent(STUB_PATH.WORD_PHONETIC_CONTENT);

  const wrapper = make("div");
  wrapper.classList.add("voca-word-list");

  data.forEach(
    ({ audio_uk, audio_us, content, ipa_uk, ipa_us, type, detail }) => {
      const wordPhonetics = getWordPhoneticWrapper();

      if (ipa_uk) {
        const phoneticBrENode = getPhoneticNode(
          wordPhoneticStub,
          "BrE",
          audio_uk,
          "#2F80ED",
          ipa_uk
        );
        wordPhonetics.append(phoneticBrENode);
      }
      if (ipa_us) {
        const phoneticNAmENode = getPhoneticNode(
          wordPhoneticStub,
          "NAmE",
          audio_us,
          "#EB5757",
          ipa_us
        );
        wordPhonetics.append(phoneticNAmENode);
      }

      const wordDetail = getWordDetailWrapper();
      detail.forEach((wordDetailItem) => {
        const detailNode = getWordDetailNode(
          wordDetailStub,
          type,
          wordDetailItem,
          content,
          ipa_us ?? null,
          audio_us ?? null
        );
        wordDetail.append(detailNode);
      });

      const wordItemNode = getWordWrapper(content, wordPhonetics, wordDetail);

      wrapper.append(wordItemNode);
    }
  );

  box.append(wrapper);
  box.classList.remove("loading");

  renderSaveWordBtns(wrapper, ids);
};

const renderSaveWordBtns = async (wrapper, ids) => {
  const user = getUser();

  if (!user) {
    return;
  }

  // add btns
  const saveWordBtns = wrapper.querySelectorAll(".voca-word-action-btns");

  if (saveWordBtns.length === 0) {
    return;
  }

  const existVocabularyIds = await getVocabularyExists(user.email, ids);

  saveWordBtns.forEach((saveWordBtn) => {
    const btnSave = saveWordBtn.querySelector(".voca-word-action-btn");
    const { saveWordData, wordId } = btnSave.dataset;

    if (existVocabularyIds.includes(wordId)) {
      btnSave.classList.add("voca-save-word-has-saved");
      btnSave.querySelector('.voca-word-action-btn-label').innerText = 'Đã lưu'
      return;
    }

    btnSave.classList.add("voca-save-word");
    btnSave.onclick = () => {
      if (btnSave.classList.contains('disabled')  || !btnSave.classList.contains('voca-save-word')) {
        return
      }

      btnSave.classList.add('loading')
      btnSave.classList.add('disabled')
      fetch(
        `https://famous-sorbet-043f80.netlify.app/api/word?q=${saveWordData}`
      ).then((res) => {
        if (res.ok) {
          btnSave.classList.remove('voca-save-word')
          btnSave.classList.add('voca-save-word-has-saved')
          btnSave.querySelector('.voca-word-action-btn-label').innerText = 'Đã lưu'
        }
      }).finally(() => {
        btnSave.classList.remove('loading')
      });
    };
  });
};

const getWordWrapper = (title, phoneticList, detailList) => {
  const wordTitle = make("p");
  wordTitle.classList.add("voca-text-title");
  wordTitle.innerHTML = title;

  const wrapper = make("div");
  wrapper.classList.add("voca-word-main");
  wrapper.append(wordTitle);
  wrapper.append(phoneticList);
  wrapper.append(detailList);
  return wrapper;
};

const getWordPhoneticWrapper = () => {
  const wrapper = make("div");
  wrapper.classList.add("voca-word-phonetic-list");

  return wrapper;
};

const getWordDetailWrapper = () => {
  const wrapper = make("div");
  wrapper.classList.add("voca-word-detail-list");

  return wrapper;
};

const getPhoneticNode = (wordPhoneticStub, title, audioUrl, iconColor, ipa) => {
  const phoneticNode = textToNode(wordPhoneticStub);
  phoneticNode.querySelector(".voca-ex-text").innerHTML = title;
  const audioElm = phoneticNode.querySelector(".voca-ex-audio");
  const audio = new Audio(audioUrl);
  audioElm.setAttribute("source", audioUrl);
  audioElm.onclick = () => audio.play();
  phoneticNode.querySelector("svg>path").setAttribute("fill", iconColor);
  phoneticNode.querySelector(".voca-ex-phonetic-text").innerHTML = ipa;

  return phoneticNode;
};

const getWordDetailNode = (
  wordDetailStub,
  type,
  data,
  content,
  ipa_us = null,
  audio_us = null
) => {
  const wordDetailNode = textToNode(wordDetailStub);
  const user = getUser();

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

  wordDetailNode.querySelector(
    ".voca-text-translate"
  ).innerHTML = `${data.trans} (${type})`;
  wordDetailNode.querySelector(".voca-word-sentence").innerHTML =
    data.en_sentence;

  return wordDetailNode;
};

const renderSuggestContent = async (box, data) => {
  const wrapper = make("div");
  wrapper.classList.add("voca-suggest-wrapper");

  const msgElm = make("p");
  msgElm.innerHTML = "Có phải bạn đang tìm từ này?";
  msgElm.classList.add("voca-suggest-msg-vn");

  wrapper.append(msgElm);

  data.forEach((suggest, index) => {
    const suggestElm = make("p");
    suggestElm.classList.add("voca-suggest-word");
    suggestElm.setAttribute("value", suggest);
    suggestElm.id = `voca-suggest-word-${index}`;
    suggestElm.innerHTML = suggest;
    suggestElm.onclick = () => {
      box.innerHTML = "";
      box.classList.add("loading");
      renderWordsOrSuggests(box, suggest);
    };

    wrapper.append(suggestElm);
  });

  box.append(wrapper);
  box.classList.remove("loading");
};

const renderEmpty = (box) => {
  const emptyElm = make("div");
  emptyElm.className = "voca-empty";
  emptyElm.innerHTML = `<span data-disabled-mousedown="voca-ext">Không thể hiện thị</span>`;
  box.append(emptyElm);
};

// action

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method === "voca_update_userinfo") {
    localStorage.setItem("voca_userinfo", JSON.stringify(request.data));
    sendResponse({ status: "success" });
  }
});

document.onmouseup = (e) => {
  const { dataset } = e.target;

  if (
    dataset.hasOwnProperty("disabledMousedown") &&
    dataset.disabledMousedown === "voca-ext"
  ) {
    return;
  }

  if (e.which !== 1) {
    return;
  }

  const select = getSelectionText();

  if (select.length > 1000) {
    return;
  }

  if (!select.match(/\w+/)) {
    return;
  }

  show(select);
};

document.onmousedown = (e) => {
  const { dataset } = e.target;

  if (
    dataset.hasOwnProperty("disabledMousedown") &&
    dataset.disabledMousedown === "voca-ext"
  ) {
    return;
  }

  document.querySelector("#box_content_voca_extension")?.remove();
};
