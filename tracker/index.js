import Backend from "https://madata.dev/src/index.js";

let $$ = (selector, container = document) =>
  Array.from(container.querySelectorAll(selector));
let $ = (selector, container = document) => container.querySelector(selector);

const backend = Backend.from(
  "https://github.com/designftw/hw9-yonas39/tree/master/tracker/data.json"
);
const loginButton = document.querySelector("#login_button");
const logooutButton = document.querySelector("#logout_button");
const saveButton = document.querySelector("#save_button");

///////////////////////////////////////////////////////////////
/////////////////////LogIN / LogOut Start//////////////////////
///////////////////////////////////////////////////////////////

loginButton.addEventListener("click", async () => {
  await backend.login();
});
logooutButton.addEventListener("click", () => {
  backend.logout();
});
backend.addEventListener("mv-login", async () => {
  document.getElementById("app").classList.add("logged-in");
  // document.getElementById("user_avatar").src = backend.user.avatar;
  document.getElementById("username").textContent = backend.user.username;
  document.getElementById("logout_button").hidden = false;
  document.getElementById("login_button").hidden = true;
  // appFieldset.disabled = false;
  const storeData = await backend.load();
  if (storedData) {
    for (let entry of storeData) {
      addEntry(entry);
    }
  }
});
backend.addEventListener("mv-logout", () => {
  document.getElementById("app").classList.remove("logged-in");
  document.getElementById("login_button").hidden = false;
  document.getElementById("logout_button").hidden = true;
  document.getElementById("username").hidden = true;
  // appFieldset.disabled = true;
});
///////////////////////////////////////////////////////////////
/////////////////////LogIN / LogOut End////////////////////////
///////////////////////////////////////////////////////////////

// ############################################################
// ##################### Modify save ##########################
// ############################################################
// save_button.addEventListener("click", (event) => {
//   let dataToSave = $$(".entry > form").map((form) => {
//     let data = new FormData(form);
//     return Object.fromEntries(data.entries());
//   });

//   data.innerHTML = JSON.stringify(dataToSave, null, "\t");
// });
saveButton.addEventListener("click", async (e) => {
  await backend.store(getData());
});
// ############################################################
// ##################### Modify End ##########################
// ############################################################

add_entry_button.addEventListener("click", (event) => {
  // Set current date and time as default
  let currentISODate = new Date().toISOString().substring(0, 19); // drop ms and timezone
  addEntry({ datetime: currentISODate });
});

// ###############################################
// ##################Get data start####################
// ###############################################

function getData() {
  return $$(".entry > form").map((form) => {
    let data = new FormData(form);
    return Object.fromEntries(data.entries());
  });
}
// ###############################################
// ##################Get data end#####################
// ###############################################

function addEntry(data) {
  let entry = entry_template.content.cloneNode(true);

  for (let prop in data) {
    setFormElement(prop, data[prop], entry);
  }

  // Add new entry after "Add entry" button
  add_entry_button.after(entry);
}

function setFormElement(name, value, container) {
  let elements = $$(`[name="${name}"]`, container);

  for (let element of elements) {
    // only radios will have more than one, but can't hurt
    if (element.type === "checkbox") {
      element.checked = value;
    }
    if (element.type === "radio") {
      element.checked = element.value === value;
    } else {
      element.value = value;
    }
  }
}
