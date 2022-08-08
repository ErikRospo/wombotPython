const https = require("https");
const RestError = (module.exports.RestError = class RestError extends Error {
    constructor(hostname, path, method, ...args) {
        super(...args);
        this.hostname = hostname;
        this.path = path;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RestError);
        }

        this.name = "RestError";
    }

    toFriendly() {
        return `RestError(hostname = "${this.hostname}", path = "${this.path}"): "${this.message}"`;
    }
});

const Rest = (module.exports = class Rest {
    constructor(hostname, delay = 250, cookiesEnabled = true) {
        this.hostname = hostname;

        this.agent = new https.Agent({
            keepAlive: true,
            maxsockets: 1
        });

        this.queue = [];

        this._delay = delay; // milliseconds
        this.delayHandle = null;

        this.cookies = {};
        this.cookiesEnabled = cookiesEnabled;

        this.customHeaders = {};
    }

    /**
        Processes the queue; will automatically clear itself once the queue is empty (does so after a delay, so no request will be sent that doesn't wait).
    **/
    scheduler() {
        if (this.queue.length) {
            this.queue.shift()();
        } else {
            if (this.delayHandle !== null) clearInterval(this.delayHandle);
            this.delayHandle = null;
        }
    }

    /**
        Adds an entry to the queue, if delay > 0. `f` will be called by `scheduler`.
        Otherwise, directly calls `f`.

        A Promise is returned, whose `resolve` and `reject` closures will be passed on to `f` once it is processed.
    **/
    enterQueue(f) {
        return new Promise((resolve, reject) => {
            if (this._delay > 0) {
                if (this.delayHandle === null)
                    this.delayHandle = setInterval(
                        this.scheduler.bind(this),
                        this._delay
                    );

                this.queue.push(() => {
                    f(resolve, reject);
                });
            } else {
                f(resolve, reject);
            }
        });
    }

    /**
        Handles a `Set-Cookie` header, if one is set.
        If `cookies_enabled` is set to false, does nothing.
        Writes the cookie to `cookies`.
    **/
    handleCookies(setters) {
        if (!setters) return;
        if (!this.cookiesEnabled) return;

        for (let cookieSetter of setters) {
            let [name, valueSetter] = cookieSetter.split("=");
            let [value] = valueSetter.split(";");
            this.cookies[name] = value;
        }
    }

    /**
        Returns the list of cookies in HTTP header format.
        If `cookies_enabled` is set to false, returns `""`.
    **/
    getCookies() {
        if (!this.cookiesEnabled) return "";
        return Object.entries(this.cookies)
            .map(([name, value]) => `${name}=${value}`)
            .join("; ");
    }

    /**
        Sends a POST request to the given `path`, containing `data` in JSON format as body.
        Returns a Promise that is resolved once the server has answered.
        The resolve value will containg the answer in JSON format.
    **/
    post(path, data, method = "POST", requestHeaders) {
        return this.enterQueue((resolve, reject) => {
            let postData = JSON.stringify(data);

            let options = {
                agent: this.agent,
                hostname: this.hostname,
                port: 443,
                path,
                method,
                headers: {
                    "Cookie": this.getCookies(),
                    "Content-Type": "application/json; charset=utf-8",
                    "Content-Length": Buffer.byteLength(postData),
                    ...this.customHeaders,
                    ...requestHeaders
                }
            };

            const req = https.request(options, (res) => {
                this.handleCookies(res.headers["set-cookie"]);
                let data = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    if (res.statusCode !== 200)
                        reject(new RestError(this.hostname, path, data));
                    else {
                        try {
                            resolve(JSON.parse(data));
                        } catch (err) {
                            resolve(data);
                        }
                    }
                });
                res.on("error", (err) => {
                    reject(new RestError(this.hostname, path, err));
                });
            });

            req.on("error", (err) => {
                reject(new RestError(this.hostname, path, err));
            });

            req.write(postData);
            req.end();
        });
    }

    /**
        Sends a GET request to the given `path`.
        Returns a Promise that is resolved once the server has answered.
        The resolve value will containg the answer in JSON format.
    **/
    get(path, method = "GET", requestHeaders = {}) {
        return this.enterQueue((resolve, reject) => {
            let options = {
                agent: this.agent,
                hostname: this.hostname,
                port: 443,
                path,
                method,
                headers: {
                    Cookie: this.getCookies(),
                    ...this.customHeaders,
                    ...requestHeaders
                }
            };

            const req = https.request(options, (res) => {
                this.handleCookies(res.headers["set-cookie"]);
                let data = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    if (res.statusCode !== 200)
                        reject(new RestError(this.hostname, path, data));
                    else {
                        try {
                            resolve(JSON.parse(data));
                        } catch (err) {
                            resolve(data);
                        }
                    }
                });
                res.on("error", (err) => {
                    reject(new RestError(this.hostname, path, err));
                });
            });

            req.on("error", (err) => {
                reject(new RestError(this.hostname, path, err));
            });

            req.end();
        });
    }

    put(path, data) {
        return this.post(path, data, "PUT");
    }

    options(path, requestMethod) {
        let requestHeaders;

        if (typeof requestMethod === "string") {
            requestHeaders = {
                "Access-Control-Request-Method": requestMethod
            };
        } else if (typeof requestMethod === "object") {
            requestHeaders = requestMethod;
        } else {
            requestHeaders = {};
        }

        return this.get(path, "OPTIONS", requestHeaders);
    }

    /**
        Defines the minimum amount of time between two requests to the server.
        Ignores the actual amount of time that the server takes to respond.
        Do note that `agora-quiz` requires the requests to be sent in a fashion that reflects a normal utilization of the website,
        so setting this to `0` is not recommended.
    **/
    get delay() {
        return this._delay;
    }

    set delay(value) {
        this._delay = value;
        if (this.delayHandle !== null) {
            if (value > 0) {
                clearInterval(this.delayHandle);
                this.delayHandle = setInterval(
                    this.scheduler.bind(this),
                    this._delay
                );
            } else {
                this.delayHandle = null;
                while (this.queue.length) this.scheduler();
            }
        }
    }
});

module.exports.get = function (hostname, path) {
    let rest = new Rest(hostname);

    return rest.get(path);
};

module.exports.post = function (hostname, path, data) {
    let rest = new Rest(hostname);

    return rest.post(path, data);
};
