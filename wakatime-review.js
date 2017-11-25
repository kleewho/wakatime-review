function trackTime(keyValue) {
  const {domain, owner, project} = readDomainOwnerAndProject();
  const branch = readBranch();
  const entity = "bitbucket.org";
  let havenOnlyScrolledInCurrentInterval = false;

  function scrollHandler() {
    havenOnlyScrolledInCurrentInterval = true;
  }

  window.setInterval(function() {
    if (havenOnlyScrolledInCurrentInterval) {
      sendHeartbeat(preparePayload(entity, "app", project, branch, false));
      havenOnlyScrolledInCurrentInterval = false;
    }
  }, 30000);

  function readDomainOwnerAndProject() {
    const url = window.location.href;
    const regexp = /http[s]?:\/\/([a-zA-Z0-9]*\.[a-z]*)\/(\w*)\/([\w-]*).*/g;
    const matched = regexp.exec(url);
    const domain = matched[1];
    const owner = matched[2];
    const project = matched[3];
    return {owner: owner,
            project: project};
  }

  function readBranch() {
    return document.querySelector("#id_source_group .branch a").textContent;
  }

  function preparePayload(entity, type, project, branch, is_write) {
    return {
      entity: entity,
      type: type,
      time: (new Date).getTime()/1000,
      project: project,
      branch: branch,
      is_write: is_write,
      editor: "bitbucket.org"
    };
  }


  function sendHeartbeat(payload) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", `https://wakatime.com/api/v1/users/current/heartbeats?api_key\=${keyValue}`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(payload));
  };

  function clickHandler() {
    let payload = preparePayload(entity, "app", project, branch, true);
    sendHeartbeat(payload);
    havenOnlyScrolledInCurrentInterval = false;
  }

  window.onscroll = scrollHandler;
  document.onclick = clickHandler;
};

function keyNotProvided(error) {
  console.log("You should first configure this plugin by providing wakatime key");
}

let key = browser.storage.local.get("key");
key.then(trackTime, keyNotProvided);
