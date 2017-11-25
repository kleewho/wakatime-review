function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    key: document.querySelector("#key").value
  });
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#key").value = result.key || "";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get("key");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

