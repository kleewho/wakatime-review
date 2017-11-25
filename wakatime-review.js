function trackTime(keyValue) {
  const {domain, owner, project} = readDomainOwnerAndProject();
  const branch = readBranch();
  const entity = "bitbucket.org";
  let havenOnlyScrolledInCurrentInterval = false;
  console.log(`key: ${keyValue.key}`);

  function scrollHandler() {
    havenOnlyScrolledInCurrentInterval = true;
    console.log("scrolling");
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
    console.log("heartbeat sent");
  };

  function clickHandler() {
    let payload = preparePayload(entity, "app", project, branch, true);
    sendHeartbeat(payload);
    havenOnlyScrolledInCurrentInterval = false;
  }

  console.log(`Branch: ${branch}`);
  console.log(`Owner: ${owner}`);
  console.log(`Project: ${project}`);
  console.log(`Time of reload ${(new Date).getTime()/1000}`);
  let payload = preparePayload("bitbucket.org", "domain", project, branch);
  console.log(payload);
  sendHeartbeat(payload);
  window.onscroll = scrollHandler;
  document.onclick = clickHandler;
};

function keyNotProvided(error) {
  console.log(error);
}

let key = browser.storage.local.get("key");
key.then(trackTime, keyNotProvided);
