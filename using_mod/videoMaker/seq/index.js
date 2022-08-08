const Rest = require("./rest.js");
const identify = require("./identify.js");
const download = require("./download.js");
const mkdirp = require("mkdirp");
const path = require("path");

let paint_rest = new Rest("paint.api.wombo.ai", 100);
let image_paint_rest = new Rest("app.wombo.art", 100);
/**
 * @param {string} prompt
 * @param {number} style
 * @param {function} handler
 * @param {object} settings
 * @param {object} inputImage
 * @param {string} photo_downloads
 */
module.exports = async function task(
  prompt,
  style,
  update_fn = () => {},
  settings = {},
  inputImage = {},
  photo_downloads = ""
) {
  let { final = true, inter = false, download_dir = "./generated/" } = settings;
  let {
    input_image = false,
    media_suffix = null,
    image_weight = "HIGH"
  } = inputImage;
  if (final || inter) mkdirp(download_dir);

  let id;
  try {
    id = await identify();
  } catch (err) {
    console.error(err);
    throw new Error(
      `Error while sending prompt:\n${err.toFriendly
        ? err.toFriendly()
        : err.toString()}`
    );
  }
  let mediastoreid;
  if (input_image) {
    image_paint_rest.custom_headers = {
      Authorization: "bearer " + id,
      Origin: "https://app.wombo.art",
      Referer: "https://app.wombo.art/",
      "Cache-control": "no-cache",
      "Sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
      Pragma: "no-cache",
      Accept: "*/*",
      "Accept-encoding": "gzip, deflate, br",
      "Accept-language": "en-US,en;q=0.9",
      "Aontent-type": "text/plain;charset=UTF-8"
    };
    let created = Date.now();
    let expire = Date.now() + 960000;

    // image_paint_rest.handle_cookies(`_dd_s=rum=1;id=323368bd-45a7-4b9d-acf2-89cd59a16777;created=${created};expire=${expire}`)
    image_paint_rest.cookies[
      "_dd_s"
    ] = `rum=1&id=323368bd-45a7-4b9d-acf2-89cd59a16777&created=${created}&expire=${expire}`;
    // image_paint_rest.cookies['expires']=String(expire);
    // image_paint_rest.cookies['created']=String(created);
    // image_paint_rest.cookies['id']='323368bd-45a7-4b9d-acf2-89cd59a16777';
    let paint_rest_payload = `{"image":"${input_image}","media_suffix":"${media_suffix}","num_uploads":1}`;
    //task = await paint_rest.options("/api/tasks/", "POST")
    //.then(() => paint_rest.post("/api/tasks/", {premium: false}));
    let res = await image_paint_rest.post(
      "/api/mediastore",
      paint_rest_payload
    );
    mediastoreid = res.mediastore_uid;
  }
  paint_rest.custom_headers = {
    Authorization: "bearer " + id,
    Origin: "https://app.wombo.art",
    Referer: "https://app.wombo.art/"
  };

  update_fn({
    state: "authenticated",
    id
  });

  let task;
  try {
    task = await paint_rest
      .options("/api/tasks/", "POST")
      .then(() => paint_rest.post("/api/tasks/", { premium: false }));
  } catch (err) {
    if (err.detail == "User has been rate-limited") {
      console.log("User has been rate-limited, retrying in 2 seconds");
      while (true) {
        try {
          task = await paint_rest
            .options("/api/tasks/", "POST")
            .then(() => paint_rest.post("/api/tasks/", { premium: false }));
          break;
        } catch (err) {
          if (err.detail == "User has been rate-limited") {
            console.log("User has been rate-limited, retrying in 2 seconds");
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            throw err;
          }
        }
      }
    } else {
      console.error(err);
      // throw new Error(`Error while allocating a new task:\n${err.toFriendly ? err.toFriendly() : err.toString()}`);
    }
  }
  let task_path;

  try {
    task_path = "/api/tasks/" + task.id;
  } catch (err) {
    if (typeof err == TypeError) {
      return await task(
        prompt,
        style,
        update_fn,
        settings,
        inputImage,
        photo_downloads
      );
    }
  }
  update_fn({
    state: "allocated",
    id,
    task
  });
  let input_object = {
    input_spec: {
      display_freq: 10,
      prompt,
      style: +style
    }
  };
  if (input_image) {
    input_object.input_spec.input_image = {
      weight: image_weight,
      mediastore_id: mediastoreid
    };
  }

  try {
    task = await paint_rest
      .options(task_path, "PUT")
      .then(() => paint_rest.put(task_path, input_object));
  } catch (err) {
    if (err.detail == "User has been rate-limited") {
      console.log("Rate limited, retrying in 2 seconds");
      while (true) {
        try {
          task = await paint_rest
            .options(task_path, "PUT")
            .then(() => paint_rest.put(task_path, input_object));
          break;
        } catch (err) {
          if (err.detail == "User has been rate-limited") {
            console.log("Rate limited, retrying in 2 seconds");
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            throw err;
          }
        }
      }
    } else if (err.detail == "") {
      console.log("Error while sending prompt. No response from server");
    } else {
      console.error(err);
    }
  }

  update_fn({
    state: "submitted",
    id,
    task
  });

  let inter_downloads = [];
  let inter_paths = [];
  let inter_finished = [];
  while (!task && (task.result!==undefined)&&(task['result']!==null)) {
    try {
      task = await paint_rest.get(task_path, "GET");
    } catch (err) {
      console.log("Rate limited, retrying");
      while (true) {
        try {
          task = await paint_rest.get(task_path, "GET");
          break;
        } catch (err) {
          if (err.detail == "User has been rate-limited") {
            console.log("Rate limited, retrying in 2 seconds");
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            throw err;
          }
        }
      }
      break;
    }

    // if (task.state === "pending") console.warn("Warning: task is pending");
    if (inter) {
      await mkdirp(`${download_dir}/${photo_downloads}/`);
      for (let n = 0; n < task.photo_url_list.length; n++) {
        if (
          inter_downloads[n] ||
          /\/final\.je?pg/i.exec(task.photo_url_list[n])
        )
          continue;

        inter_paths[n] = path.join(download_dir, `${photo_downloads}/${n}.jpg`);

        inter_downloads[n] = download(
          task.photo_url_list[n],
          inter_paths[n]
        ).then(() => {
          return (inter_finished[n] = inter_paths[n]);
        });
      }
    }

    update_fn({
      state: "progress",
      id,
      task,
      inter: inter_finished
    });
    await new Promise(res => setTimeout(res, 1000));
  }
  console.assert(task.result !== undefined, "Task result is undefined");
  console.assert(task.result !== null, "Task result is null");
  console.assert(task.result.final!==undefined, "Task result final is undefined");
  console.assert(task.result.final!==null, "Task result final is null");

  update_fn({
    state: "generated",
    id,
    task,
    url: task.result.final,
    inter: inter_finished
  });
  let download_path;
  if (inter) {
    download_path = path.join(download_dir, `${photo_downloads}/final.jpg`);
  }
  try {
    if (final) await download(task.result.final, download_path);
    if (inter) await Promise.all(inter_downloads);
  } catch (err) {
    console.error(err);
    throw new Error(
      `Error while downloading results:\n${err.toFriendly
        ? err.toFriendly()
        : err.toString()}`
    );
  }

  update_fn({
    state: "downloaded",
    id,
    task,
    url: task.result.final,
    path: final ? download_path : null,
    inter: inter_finished
  });

  return {
    state: "downloaded",
    id,
    task,
    url: task.result.final,
    path: final ? download_path : null,
    inter: inter_finished
  };
};

module.exports.styles = require("./styles.js");
module.exports.download = require("./download.js");

// Make `node .` a shorthand for `node cli.js`
if (require.main === module) {
  require("./sequential.jstial.js");
}
