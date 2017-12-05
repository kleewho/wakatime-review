const bitbucket = {
    readBranch: () => document.querySelector("#id_source_group .branch a").textContent,
    readDomainOwnerAndProject: () => {
        const url = window.location.href;
        const regexp = /http[s]?:\/\/([a-zA-Z0-9]*\.[a-z]*)\/(\w*)\/([\w-]*).*/g;
        const matched = regexp.exec(url);
        const domain = matched[1];
        const owner = matched[2];
        const project = matched[3];
        return {
            domain: domain,
            owner: owner,
            project: project
        };
    },
    // site support function
    siteMatch: (url) => {
        const parsedUrl = new URL(url);
        return parsedUrl.host == 'bitbucket.org';
    }
};


const stash = {
    readBranch: () => document.querySelector('div.pull-request-branches').textContent,
    readDomainOwnerAndProject: () => {

        let grabAfter = (array, after) => {
            return array[array.lastIndexOf(after) + 1];
        };

        const url = new URL(window.location.href);
        // example of URL to parse
        // https://stash.clearcode.cc/projects/CCADS/repos/backend/pull-requests/137/commits
        const splitUrl = url.pathname.split('/');
        return {
            domain: url.host,
            owner: grabAfter(splitUrl, 'projects'),
            project: grabAfter(splitUrl, 'repos')
        };
    },
    siteMatch: (url) => {
        const parsedUrl = new URL(url);
        return parsedUrl.host.includes('stash');
    }
};


const supportedSites = [bitbucket, stash];


const funcFactory = () => {
    let siteParser;
    const parsedUrl = new URL(window.location.href);

    if (parsedUrl.host.includes('stash')) {
        siteParser = stash;
    } else if (parsedUrl.host.includes('bitbucket')) {
        siteParser = bitbucket;
    }

    return {
        foundMatch: foundMatch,
        readDomainOwnerAndProject: siteParser.readDomainOwnerAndProject,
        readBranch: siteParser.readBranch
    };
};


function trackTime(keyPromise) {
    const {
        readDomainOwnerAndProject,
        readBranch
    } = funcFactory();
    const {
        entity,
        owner,
        project
    } = readDomainOwnerAndProject();
    const branch = readBranch();
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

    function preparePayload(entity, type, project, branch, is_write) {
        return {
            entity: entity,
            type: type,
            time: new Date().getTime() / 1000,
            project: project,
            branch: branch,
            is_write: is_write,
            editor: entity
        };
    }

    function sendHeartbeat(payload) {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", `https://wakatime.com/api/v1/users/current/heartbeats?api_key\=${keyPromise.key}`);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(payload));
    }

    function clickHandler() {
        let payload = preparePayload(entity, "app", project, branch, true);
        sendHeartbeat(payload);
        havenOnlyScrolledInCurrentInterval = false;
    }

    window.onscroll = scrollHandler;
    document.onclick = clickHandler;
}


function keyNotProvided(error) {
    console.log("You should first configure this plugin by providing wakatime key");
}


const isSiteSupported = (url) => {
    return supportedSites.some((el, index, array) => {
        el.siteMatch(url);
    });
};


if (isSiteSupported(window.location.href)) {
    let key = browser.storage.local.get("key");
    key.then(trackTime, keyNotProvided);
}
