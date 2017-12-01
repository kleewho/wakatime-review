const bitbucket = {
    readBranch: () => document.querySelector("#id_source_group .branch a").textContent,
    readDomainOwnerAndProject: (url) => {
        const regexp = /http[s]?:\/\/([a-zA-Z0-9]*\.[a-z]*)\/(\w*)\/([\w-]*).*/g;
        const matched = regexp.exec(url);
        const domain = matched[1];
        const owner = matched[2];
        const project = matched[3];
        return {owner: owner,
                project: project};
    }
};

const stash = {
    readBranch: () => {
        console.log('stash readBranch');
    },
    readDomainOwnerAndProject: (url) => {
        console.log('stash readDomainOwnerAndProject');
        return {
            owner: 'stash',
            project: 'project'
        };
    }
};

const funcFactory = (url) => {
    let siteParser;

    const parsedUrl = new URL(url);
    if (parsedUrl.host.includes('stash')) {
        siteParser = stash;
    } else if (parsedUrl.host.includes('bitbucket')) {
        siteParser = bitbucket;
    }

    return siteParser.readDomainOwnerAndProject, siteParser.readBranch;
};

function trackTime(keyPromise) {
    // TODO: read branch
    // TODO: readDomainOwnerAndProject
    // TODO: preparePayload accept editor

    const url = window.location.href;
    console.log(url);
    const {readDomainOwnerAndProject, readBranch} = funcFactory(url);

  const {domain, owner, project} = readDomainOwnerAndProject(url);
  const branch = readBranch();
  const entity = "bitbucket.org";  // TODO
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

  // function readDomainOwnerAndProject() {
  //   const url = window.location.href;
  //   const regexp = /http[s]?:\/\/([a-zA-Z0-9]*\.[a-z]*)\/(\w*)\/([\w-]*).*/g;
  //   const matched = regexp.exec(url);
  //   const domain = matched[1];
  //   const owner = matched[2];
  //   const project = matched[3];
  //   return {owner: owner,
  //           project: project};
  // }

  // function readBranch() {
  //   return document.querySelector("#id_source_group .branch a").textContent;
  // }

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
    xhr.open("POST", `https://wakatime.com/api/v1/users/current/heartbeats?api_key\=${keyPromise.key}`);
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
