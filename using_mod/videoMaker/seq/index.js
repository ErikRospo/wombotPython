/* eslint-disable no-constant-condition */
const Rest = require("./rest.js");
const identify = require("./identify.js");
const download = require("./download.js");
const mkdirp = require("mkdirp");
const path = require("path");
let paintRest = new Rest("paint.api.wombo.ai", 100);
let imagePaintRest = new Rest("app.wombo.art", 100);
/**
 * @param {string} prompt
 * @param {number} style
 * @param {function} updateFn
 * @param {object} settings
 * @param {object} inputImage
 * @param {string} photoDownloads
 * @param {string} _prefix
 * @returns {object} task
 */
module.exports = async function task(
    prompt,
    style,
    updateFn = () => {},
    settings = {},
    inputImageArg = {},
    photoDownloads = "",
    _prefix = ""
) {
    let {
        final = true,
        inter = false,
        downloadDir = "./generated/"
    } = settings;
    let {
        inputImage = false,
        mediaSuffix = null,
        imageWeight = "HIGH"
    } = inputImageArg;
    if (final || inter) mkdirp(downloadDir);
    let id;
    let prefix = _prefix;
    console.log(`${prefix} Started`);
    try {
        id = await identify();
    } catch (err) {
        console.error(err);
        throw new Error(
            `Error while sending prompt:\n${
                err.toFriendly ? err.toFriendly() : err.toString()
            }`
        );
    }
    let mediastoreid;
    if (inputImage) {
        imagePaintRest.customHeaders = {
            "Authorization": "bearer " + id,
            "Origin": "https://app.wombo.art",
            "Referer": "https://app.wombo.art/",
            "Cache-control": "no-cache",
            "Sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
            "Pragma": "no-cache",
            "Accept": "*/*",
            "Accept-encoding": "gzip, deflate, br",
            "Accept-language": "en-US,en;q=0.9",
            "Aontent-type": "text/plain;charset=UTF-8"
        };
        let created = Date.now();
        let expire = Date.now() + 960000;

        // image_paint_rest.handle_cookies(`_dd_s=rum=1;id=323368bd-45a7-4b9d-acf2-89cd59a16777;created=${created};expire=${expire}`)
        imagePaintRest.cookies[
            "_dd_s"
        ] = `rum=1&id=323368bd-45a7-4b9d-acf2-89cd59a16777&created=${created}&expire=${expire}`;
        // image_paint_rest.cookies['expires']=String(expire);
        // image_paint_rest.cookies['created']=String(created);
        // image_paint_rest.cookies['id']='323368bd-45a7-4b9d-acf2-89cd59a16777';
        let paintRestPayload = `{"image":"${inputImage}","media_suffix":"${mediaSuffix}","num_uploads":1}`;
        // task = await paint_rest.options("/api/tasks/", "POST")
        // .then(() => paint_rest.post("/api/tasks/", {premium: false}));
        let res = await imagePaintRest.post(
            "/api/mediastore",
            paintRestPayload
        );
        mediastoreid = res.mediastore_uid;
    }
    paintRest.customHeaders = {
        Authorization: "bearer " + id,
        Origin: "https://app.wombo.art",
        Referer: "https://app.wombo.art/"
    };

    updateFn({
        state: "authenticated",
        id
    });

    let task;
    try {
        task = await paintRest
            .options("/api/tasks/", "POST")
            .then(() => paintRest.post("/api/tasks/", { premium: false }));
    } catch (errorVal) {
        if (errorVal.detail == "User has been rate-limited") {
            console.log("User has been rate-limited, retrying in 2 seconds");
            while (true) {
                try {
                    task = await paintRest
                        .options("/api/tasks/", "POST")
                        .then(() =>
                            paintRest.post("/api/tasks/", { premium: false })
                        );
                    break;
                } catch (err) {
                    if (err.detail == "User has been rate-limited") {
                        console.log(
                            "User has been rate-limited, retrying in 2 seconds"
                        );
                        await new Promise((resolve) =>
                            setTimeout(resolve, 2000)
                        );
                    } else {
                        throw err;
                    }
                }
            }
        } else {
            console.error(errorVal);
            // throw new Error(`Error while allocating a new task:\n${err.toFriendly ? err.toFriendly() : err.toString()}`);
        }
    }
    let taskPath;

    try {
        taskPath = "/api/tasks/" + task.id;
    } catch (err) {
        if (typeof err == TypeError) {
            return await task(
                prompt,
                style,
                updateFn,
                settings,
                inputImage,
                photoDownloads
            );
        }
    }
    updateFn({
        state: "allocated",
        id,
        task
    });
    let inputObject = {
        // eslint-disable-next-line camelcase
        input_spec: {
            // eslint-disable-next-line camelcase
            display_freq: 10,
            prompt,
            style: +style
        }
    };
    if (inputImage) {
        // eslint-disable-next-line camelcase
        inputObject.input_spec.input_image = {
            // eslint-disable-next-line camelcase
            weight: imageWeight,
            // eslint-disable-next-line camelcase
            mediastore_id: mediastoreid
        };
    }

    try {
        task = await paintRest
            .options(taskPath, "PUT")
            .then(() => paintRest.put(taskPath, inputObject));
    } catch (err) {
        console.log("Retrying in 2 seconds");
        while (true) {
            try {
                task = await paintRest
                    .options(taskPath, "PUT")
                    .then(() => paintRest.put(taskPath, inputObject));
                break;
            } catch (errorValue) {
                if (errorValue.detail == "User has been rate-limited") {
                    console.log("Rate limited, retrying in 2 seconds");
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                } else {
                    throw errorValue;
                }
            }
        }
    }

    updateFn({
        state: "submitted",
        id,
        task
    });

    let interDownloads = [];
    let interPaths = [];
    let interFinished = [];
    try {
        while (!task && task["result"] != null) {
            try {
                task = await paintRest.get(taskPath, "GET");
            } catch (err) {
                console.log("Rate limited, retrying");
                while (true) {
                    try {
                        task = await paintRest.get(taskPath, "GET");
                        break;
                    } catch (errorValue) {
                        if (errorValue.detail == "User has been rate-limited") {
                            console.log("Rate limited, retrying in 2 seconds");
                            await new Promise((resolve) =>
                                setTimeout(resolve, 2000)
                            );
                        } else {
                            throw errorValue;
                        }
                    }
                }
            }

            // if (task.state === "pending") console.warn("Warning: task is pending");
            if (inter) {
                await mkdirp(`${downloadDir}/${photoDownloads}/`);
                for (let n = 0; n < task.photo_url_list.length; n++) {
                    if (
                        interDownloads[n] ||
                        /\/final\.je?pg/i.exec(task.photo_url_list[n])
                    )
                        continue;

                    interPaths[n] = path.join(
                        downloadDir,
                        `${photoDownloads}/${n}.jpg`
                    );

                    interDownloads[n] = download(
                        task.photo_url_list[n],
                        interPaths[n]
                    ).then(() => {
                        return (interFinished[n] = interPaths[n]);
                    });
                }
            }

            updateFn({
                state: "progress",
                id,
                task,
                inter: interFinished
            });
            await new Promise((res) => setTimeout(res, 1000));
        }
    } catch (e) {
        console.log(prefix);
        console.log(e);
    }
    console.log(task);
    try {
        updateFn({
            state: "generated",
            id,
            task,
            url: task.result.final,
            inter: interFinished
        });
    } catch (e) {
        console.log(prefix + " Error:" + e);
    }
    let downloadPath;
    if (inter) {
        downloadPath = path.join(downloadDir, `${photoDownloads}/final.jpg`);
    }
    try {
        if (final) await download(task.result.final, downloadPath);
        if (inter) await Promise.all(interDownloads);
    } catch (err) {
        console.log(prefix);
        console.error(err);
        throw new Error(
            `Error while downloading results:\n${
                err.toFriendly ? err.toFriendly() : err.toString()
            }`
        );
    }
    console.assert(task.result != null, `${prefix} task result is none:`);
    updateFn({
        state: "downloaded",
        id,
        task,
        url: task.result.final,
        path: final ? downloadPath : null,
        inter: interFinished
    });

    return {
        state: "downloaded",
        id,
        task,
        url: task.result.final,
        path: final ? downloadPath : null,
        inter: interFinished
    };
};

module.exports.styles = require("./styles.js");
module.exports.download = require("./download.js");

// Make `node .` a shorthand for `node cli.js`
if (require.main === module) {
    require("./sequential.jstial.js");
}
