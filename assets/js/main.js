// const show = async (e, text) => {
//   const translateText = await trans(text);

//   if (!translateText) {
//     return;
//   }

//   const transWrapper = document.createElement("div");
//   transWrapper.id = "english_vocabulary";

//   const contentBox = document.createElement("div");
//   contentBox.id = "english_vocabulary__content";
//   contentBox.innerText = translateText.toLowerCase();

//   const icon = document.createElement("div");
//   icon.id = "english_vocabulary__icon";

//   icon.onclick = () => {
//     icon.classList.add("loading");
//     sync(text, translateText.toLowerCase())
//       .then(() => {
//         icon.classList.remove("loading");
//         icon.classList.add("success");
//       })
//       .catch((err) => {
//         icon.classList.remove("loading");
//         icon.classList.add("failure");
//       })
//       .finally(() => {
//         setTimeout(() => {
//           transWrapper.remove();
//         }, 1000);
//       });
//   };

//   transWrapper.append(contentBox);
//   transWrapper.append(icon);

//   transWrapper.style.left = `${e.clientX - 50}px`;

//   if (e.clientY < 100) {
//     transWrapper.style.top = `${e.clientY + 30}px`;
//   } else {
//     transWrapper.style.top = `${e.clientY - 40}px`;
//   }

//   document.body.append(transWrapper);
// };

// const hide = () => {
//   document.querySelector("#english_vocabulary")?.remove();
// };

// document.onmouseup = (e) => {
//   if (e.target.id.match(/^english_vocabulary/)) {
//     return;
//   }

//   if (e.which !== 1) {
//     return;
//   }

//   const select = getSelectionText();

//   if (select.length > 1000) {
//     return;
//   }

//   if (!select.match(/\w+/)) {
//     return;
//   }

//   show(e, select);
// };

// document.onmousedown = (e) => {
//   if (e.target.id.match(/^english_vocabulary/)) {
//     return;
//   }
//   hide();
// };

// const trans = async (text) => {
//   var headers = new Headers();
//   headers.append("Accept", "application/json");
//   var requestOptions = {
//     headers: headers,
//   };

//   return fetch(
//     `${TRANSLATE_BASEURL}/translate_a/single?client=gtx&sl=en&tl=vi&hl=en-US&dt=t&dj=1&q=${text}`,
//     requestOptions
//   )
//     .then((result) => result.json())
//     .then((data) => {
//       const lang = data.src;

//       if (lang !== "en") {
//         throw new Error("The text is not English!");
//       }

//       return data.sentences[0].trans;
//     })
//     .catch((e) => new Error("Translate failure!"));
// };

// const sync = async (en, vi) => {
//   const myHeaders = new Headers();
//   myHeaders.append("Accept", "application/json");
//   myHeaders.append("Content-Type", "application/json");

//   const primaryValue = md5(en)
//   const today = new Date()
//   const now = `${today.getDay()}/${today.getMonth()}/${today.getFullYear()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`

//   const raw = JSON.stringify({
//     Mean: vi,
//     Vocabulary: en,
//     Hash: primaryValue,
//     Created_At: now,
//     Updated_At: now,
//   });

//   var requestOptions = {
//     method: "PATCH",
//     headers: myHeaders,
//     body: raw,
//   };

//   return fetch(
//     `${FIREBASE_URL}/${FIREBASE_SHEET_ID}/${FIREBASE_TABLE_NAME}/${primaryValue}.json?auth=${FIREBASE_SECRET}`,
//     requestOptions
//   ).then((result) => {
//     if (!result.ok) {
//       throw new Error("Sync Failure!");
//     }

//     return Promise.resolve(result);
//   });
// };
