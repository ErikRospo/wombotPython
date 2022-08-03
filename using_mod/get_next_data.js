//@ts-check
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const https = require("https");
/**
 * @param {string | import("url").URL | https.RequestOptions} url
 * @param {fs.PathLike} out
 */
function _download(url, out) {
  return new Promise((resolve, reject) => {
    let file = fs.createWriteStream(out);
    https.get(url, req => {
      req.pipe(file);
      req.on("end", () => setTimeout(() => resolve(out), 250));
      req.on("error", err => reject(err));
    });
  });
}
function update_styles_json(path_to_stylesjson) {
  let styles_json_path = "";
  if (!path_to_stylesjson) {
    styles_json_path = "./js/styles.json";
  } else {
    styles_json_path = path_to_stylesjson;
  }
  styles_json_path = path.resolve(styles_json_path);
  const styles_html_url = "https://app.wombo.art/";

  const styles_html_path = path.resolve("./styles.html");
  console.log(styles_html_path);
  console.log(
    `Downloading styles.html from ${styles_html_url} to ${styles_html_path}`
  );
  _download(styles_html_url, styles_html_path)
    .then(() => {
      console.log(`Downloaded styles.html to ${styles_html_path}`);
      console.log("Reading styles.html");
      const styles_html = fs.readFileSync(styles_html_path);
      console.log("Read styles.html");
      console.log("Parsing styles.html");
      const dom = new JSDOM(styles_html);
      console.log("Parsed styles.html");
      console.log("Finding styles");
      if (dom.window.document.querySelector("#__NEXT_DATA__")) {
        console.log("Found styles");
        console.log("Getting styles");
        //@ts-expect-error
        const next_data_json = dom.window.document.querySelector(
          "#__NEXT_DATA__"
        ).textContent;
        console.log("Parsing styles");
        //@ts-expect-error
        const next_data = JSON.parse(next_data_json);
        console.log("Parsed styles");
        /** @type {Object}*/
        let styles_json = next_data.props.pageProps.artStyles;
        // console.log(styles_json)
        let styles_json_filtered = {};
        console.log("Filtering styles");
        styles_json.forEach(style => {
          if (style.name) {
            styles_json_filtered[style.name] = style.id;
          }
        });
        console.log("Filtered styles");
        console.log("Sorting styles");
        const styles_json_sorted = Object.keys(styles_json_filtered)
          .sort()
          .reduce((obj, key) => {
            obj[key] = styles_json_filtered[key];
            return obj;
          }, {});
        console.log("Sorted styles");
        console.log("Writing styles");
        fs.writeFileSync(styles_json_path, JSON.stringify(styles_json_sorted));
        console.log("Wrote " + styles_json_path);
      } else {
        console.error("Could not find styles");
      }
    })
    .catch(err => {
      console.error(err);
    });
}
function update_styles_js(
  path_to_stylesjson,
  path_to_stylesjs,
  redownload = false
) {
  if (!path_to_stylesjson) {
    path_to_stylesjson = "./js/styles.json";
  }
  if (!path_to_stylesjs) {
    path_to_stylesjs = "./js/styles.js";
  }
  path_to_stylesjson = path.resolve(path_to_stylesjson);
  path_to_stylesjs = path.resolve(path_to_stylesjs);
  if (redownload) {
    update_styles_json(path_to_stylesjson);
  }

  const styles_json = JSON.parse(
    fs.readFileSync(path_to_stylesjson).toString()
  );
  let styles_js = "let styles = new Map();\n";
  for (let style in styles_json) {
    styles_js += `styles.set(${styles_json[style]}, '${style}');\n`;
  }
  styles_js +=
    "let steps = new Map();\nsteps.set(1, 23);\nsteps.set(2, 21);\nsteps.set(3, 23);\nsteps.set(4, 23);\nsteps.set(5, 19);\nsteps.set(6, 20);\nsteps.set(7, 21);\nsteps.set(8, 21);\nsteps.set(9, 21);\nsteps.set(10, 20);\nsteps.set(11, 20);\nsteps.set(12, 32);\nsteps.set(13, 20);\nsteps.set(14, 20);\nsteps.set(15, 20);\nsteps.set(16, 20);\nsteps.set(17, 19);\nsteps.set(18, 19);\nsteps.set(19, 20);\nsteps.set(20, 20);\nsteps.set(21, 20);\nsteps.set(22, 20);\nsteps.set(23, 20);\nsteps.set(24, 19);\nsteps.set(25, 19);\nsteps.set(26, 19);\nsteps.set(27, 19);\nsteps.set(28, 19);".replace(';',';\n');
  styles_js += "\nmodule.exports = styles;\nmodule.exports.steps = steps;";
  fs.writeFileSync(path_to_stylesjs, styles_js);
}
function cleanup_styles_update(path_to_stylesjson, path_to_stylesjs) {
    if (!path_to_stylesjson) {
        path_to_stylesjson = "./js/styles.json";
    }
    if (!path_to_stylesjs) {
        path_to_stylesjs = "./js/styles.js";
    }
    fs.unlinkSync(path_to_stylesjson);
    fs.unlinkSync( path.resolve("./styles.html"));
}        
function update_all(path_to_stylesjson, path_to_stylesjs,cleanup = false) {
  update_styles_json(path_to_stylesjson);
  update_styles_js(path_to_stylesjson, path_to_stylesjs);
  if (cleanup) {
    cleanup_styles_update(path_to_stylesjson, path_to_stylesjs);
  }
}
module.exports.update_styles_json = update_styles_json;
module.exports.update_styles_js = update_styles_js;
module.exports.update_all = update_all;
module.exports.cleanup_styles = cleanup_styles_update;