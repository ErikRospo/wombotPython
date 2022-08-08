const https = require("https");
const fs = require("fs");

module.exports = function download(url, out) {
    return new Promise((resolve, reject) => {
        // let file = fs.createWriteStream(out);
        https.get(url, (req) => {
            req.pipe(fs.createWriteStream(out,{'flags': 'w',encoding:"utf8"}));
            req.on("end", () => setTimeout(() => resolve(out), 250));
            req.on("error", (err) => reject(err));
        });
    });
}
