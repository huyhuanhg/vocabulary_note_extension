class BoxInputSearch extends HTMLElement {
  prevKeyword = "";
  keywordState = "";

  constructor() {
    super();
    this.#registerEventListener()
    this.init();
  }

  #registerEventListener()
  {
    this.addEventListener('search', (event) => {
      const keyword = event.detail?.keyword
      const mode = event.detail?.mode

      if (!keyword) {
        return
      }

      this.onSearch(keyword, mode)
    }, false)
  }

  init() {
    const control = this.querySelector(".box_input_search-input");
    control.onchange = (e) => {
      this.keywordState = e.target.value;
    };

    control.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        if (!event.target.value || event.target.value === this.prevKeyword) {
          return;
        }

        this.onSearch(event.target.value);
      }
    });

    const submitBtn = this.querySelector(".box_input_search-submit");

    submitBtn.onclick = () => this.onSearch(this.keywordState);
  }

  onSearch(keyword, mode = null) {
    if (!keyword) {
      return;
    }

    const resultElm = document.querySelector("box-result");

    resultElm.classList.add("loading");

    this.handleSearch(keyword, mode)
      .then(detail => {
        this.prevKeyword = keyword

        resultElm.dispatchEvent(new CustomEvent('render', { detail }))
      })
      .finally(() => resultElm.classList.remove("loading"));
  }

  handleSearch(keyword, mode = null) {
    if (keyword.length > 30 || mode === 'trans') {
      return this.fetchTranslate(keyword).then((res) => {
        return {
          type: "translate",
          res,
          keyword
        };
      });
    }

    return this.fetchVocabularies(keyword).then((res) => {
      return {
        type: "vocabularies",
        res,
        keyword
      }
    });
  }

  fetchTranslate(keywords) {
    const ggTransUrl = "https://translate.googleapis.com/translate_a/single";

    const queryString = new URLSearchParams({
      client: "gtx", //"dict-chrome-ex",
      sl: "en",
      tl: "vi",
      hl: "en-US",
      dt: "t",
      // dt:'bd',
      dj: "1",
      source: "bubble",
      q: keywords,
    });

    return new Promise((resolve, reject) => {
      fetch(`${ggTransUrl}?${queryString}`)
        .then((res) => {
          if (res.ok) {
            return res.json();
          }

          return null;
        })
        .then(({ sentences }) => {
          if (
            !sentences ||
            !Array.isArray(sentences) ||
            sentences.length === 0
          ) {
            return resolve(null);
          }

          resolve(
            sentences.reduce(
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
            )
          );
        });
    });
  }

  fetchVocabularies(keyword) {
    const apiUrl =
      "https://mochien3.1-api.mochidemy.com/v3.1/words/dictionary-english";
    const queryString = new URLSearchParams({
      key: keyword,
      search_positions: "first_search",
      // user_token: '',
      // uuid: '',
    });

    return new Promise((resolve, reject) => {
      fetch(`${apiUrl}?${queryString}`, {
        headers: {
          privatekey: "M0ch1M0ch1_En_$ecret_k3y",
        },
      })
        .then((res) => {
          return res.clone().json();
        })
        .then(({ data }) => {
          const { suggests, vi, ids } = data;

          resolve({
            ids,
            search: keyword,
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
                detail: detail.map(
                  ({ id, en_sentence, trans, vi_sentence }) => ({
                    id,
                    en_sentence,
                    trans,
                    vi_sentence,
                  })
                ),
              })
            ),
          });
        });
    });
  }
}

customElements.define("box-input-search", BoxInputSearch);
