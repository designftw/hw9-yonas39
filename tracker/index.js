import Backend from "https://madata.dev/src/index.js";

let $$ = (selector, container = document) =>
  Array.from(container.querySelectorAll(selector));
let $ = (selector, container = document) => container.querySelector(selector);

const backend = Backend.from(
  "https://github.com/designftw/hw9-yonas39/blob/master/tracker/data.json"
  // "https://github.com/designftw/hw9-yonas39/tree/master/tracker/data.json"
);

// Added constants for loginButton, logoutButton, and addEntryButton
const loginButton = document.querySelector("#login_button");
const logooutButton = document.querySelector("#logout_button");
const saveButton = document.querySelector("#save_button");
const addEntryButton = document.querySelector("#add_entry_button");
const removeAllButton = document.querySelector("#remove_all_button");

///////////////////////////////////////////////////////////////
/////////////////////ShowLoading//////////////////////
///////////////////////////////////////////////////////////////

// Added showLoading function for displaying loading spinner
async function showLoading(callback) {
  const loadingElement = document.getElementById("loading");
  const buttons = $$("button");

  // Show the loading spinner
  loadingElement.classList.remove("hidden");

  // Disable buttons
  buttons.forEach((button) => (button.disabled = true));

  try {
    await callback();
  } finally {
    // Hide the loading spinner
    loadingElement.classList.add("hidden");

    // Enable buttons
    buttons.forEach((button) => (button.disabled = false));
  }
}

///////////////////////////////////////////////////////////////
/////////////////////LogIN / LogOut Start//////////////////////
///////////////////////////////////////////////////////////////

// Attached event listner for login adn logout buttons
loginButton.addEventListener("click", async () => {
  showLoading(async () => {
    await backend.login();
  });
});

logooutButton.addEventListener("click", () => {
  showLoading(async () => {
    backend.logout();
  });
});

// Changed event listeners to mv-login and mv-logout (as per madata.dev documentation)
backend.addEventListener("mv-login", async () => {
  document.getElementById("app").classList.add("logged-in");
  document.getElementById("username").textContent = backend.user.username;
  document.getElementById("logout_button").hidden = false;
  document.getElementById("login_button").hidden = true;

  // Fetch the stored data upon successful login
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
  document.getElementById("username").textContent = "";

  // remove all entries when logged out
  const entries = $$(".entry");
  entries.forEach((entry) => entry.remove());
});

///////////////////////////////////////////////////////////////
/////////////////////LogIN / LogOut End////////////////////////
///////////////////////////////////////////////////////////////

// ############################################################
// ##################### Modify save ##########################
// ############################################################

// Modified saveButton event listner to store data to data.json using madata
// saveButton.addEventListener("click", async (e) => {
//   showLoading(async () => {
//     await backend.store(getData());
//   });
// });
saveButton.addEventListener("click", async (e) => {
  showLoading(async () => {
    // Store the data and then clear the UI
    await backend.store(getData());
    const entries = $$(".entry");
    entries.forEach((entry) => entry.remove());

    // Fetch the updated data and display it in the UI
    const storedData = await backend.load();
    if (storedData) {
      for (let entry of storedData) {
        addEntry(entry);
      }
    }
  });
});

// ############################################################
// ##################### Modify End ##########################
// ############################################################

addEntryButton.addEventListener("click", (event) => {
  // Set current date and time as default
  let currentISODate = new Date().toISOString().substring(0, 19); // drop ms and timezone
  addEntry({ datetime: currentISODate });
});

removeAllButton.addEventListener("click", () => {
  const entries = $$(".entry");
  entries.forEach((entry) => entry.remove());
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
  let entry = document.getElementById("entry_template").content.cloneNode(true);

  for (let prop in data) {
    setFormElement(prop, data[prop], entry);
  }

  // remove a row when the X button is clicked
  const removeOneButton = entry.querySelector("#remove_one_button");
  removeOneButton.addEventListener("click", () => {
    removeOneButton.closest(".entry").remove();
  });

  addEntryButton.after(entry);
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

addEntry({ datetime: new Date().toISOString().substring(0, 19) });
