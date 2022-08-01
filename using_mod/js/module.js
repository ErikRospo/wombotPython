//@ts-check
// const SegfaultHandler = require('segfault-handler');
// SegfaultHandler.registerHandler('crash.log');
const task = require("./index");
const styles = require("./styles");
const steps = require("./steps");
const { Image } = require("image-js");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { createImageData } = require("canvas");
const md5 = require("crypto").createHash("sha256");
const True = true;
const False = false;
const final = True;
const inter = False;
const quiet = False;
/**
 * 
 * @param {string} prompt 
 * @param {number} style 
 * @param {string} prefix 
 * @returns 
 */
async function generate(prompt, style, prefix) {
  function handler(data, prefix) {
    switch (data.state) {
      case "authenticated":
        if (!quiet) console.log(`${prefix}Authenticated, allocating a task...`);
        break;
      case "allocated":
        if (!quiet)
          console.log(`${prefix}Allocated, submitting the prompt and style...`);
        break;
      case "submitted":
        if (!quiet) console.log(`${prefix}Submitted! Waiting on results...`);
        break;
      case "progress":
        let current = data.task.photo_url_list.length;
        let max = steps.get(style) + 1;
        if (!quiet)
          console.log(
            `${prefix}Submitted! Waiting on results... (${current}/${max})`
          );
        break;
      case "generated":
        if (!quiet)
          console.log(
            `${prefix}Results are in, downloading the final image...`
          );
        break;
      case "downloaded":
        if (!quiet) console.log(`${prefix}Downloaded!`);
        break;
    }
  }

  let res = await task(prompt, style, data => handler(data, prefix), {
    final,
    inter
  });
  // if (!quiet && final)
  // console.log(`${prefix}Your results have been downloaded to the following files:`);
  // else if (!quiet)
  // console.log(`${prefix}Task finished, the results are available at the following addresses:`);

  // for (let inter of res.inter)
  // console.log(inter);

  // if (final) console.log(res.path);
  // else console.log(res.url);
  return res;
}

// (async () => {
//     let prompt = argc._[0];
//     let style = +argc._[1] || 3;
//     if (!quiet)
//         console.log(`Prompt: \`${prompt}\`, Style: \`${styles.get(style)}\``);

//     for (let n = 0; n < +argc.times; n++) {
//         const prefix = argc.times == 1 ? `` : `${n+1}: `;
//         if (argc.noasync) await generate(prompt, style, prefix);
//         else generate(prompt, style, prefix);
//     }
// })();
/**
 * 
 * @param {String[]} prompts 
 * @param {Number[]} styles 
 * @returns {Promise[]} the responses from generation
 */
function generate_from_array_sync(prompts, styles) {
  let responses = [];
  for (let n = 0; n < prompts.length; n++) {
    let x = generate(prompts[n], styles[n] | 3, `${n + 1}/${prompts.length} `);
    responses.push(x);
  }
  return responses;
}

/**
 * 
 * @param {String[]} prompts 
 * @param {Number[]} styles 
 * @returns {Promise<Object[]>} 
 */
async function generate_from_array_async(prompts, styles) {
  let responses = [];
  for (let n = 0; n < prompts.length; n++) {
    let x = await generate(
      prompts[n],
      styles[n] | 3,
      `${n + 1}/${prompts.length} `
    );
    responses.push(x);
  }
  return responses;
}
/**
 * 
 * @param {String[]} prompts 
 * @param {Number[]} styles 
 * @param {Number} width 
 * @param {Number} height 
 */
function generate_image_array(prompts, styles, width, height) {
  if (prompts.length === width * height && styles.length === prompts.length) {
    gen_images().then(
      value => {
        /**@type {Promise<Object[]>}*/
        console.log(value);
        let responses = value;
        let i = 0;
        GIMARRAY(responses).then(image_array => {
          let total_width = image_array.flat().reduce((pvalue, currvalue) => {
            // console.log(pvalue,currvalue)
            return pvalue + parseInt(currvalue.width);
          }, 0);
          let total_height = image_array.flat().reduce((pvalue, currvalue) => {
            return pvalue + currvalue.height;
          }, 0);
          let image_width = total_width / width;
          let image_height = total_height / height;
          let CIM = new Image(image_width,image_height);
          let h5canv = CIM.getCanvas();
          let ctx = h5canv.getContext("2d") || new CanvasRenderingContext2D();
          for (let n = 0; n < width; n++) {
            for (let m = 0; m < height; m++) {
              let x = n * image_width;
              let y = m * image_height;
              let dataobj = image_array[m][n]["data"];
              // console.log(dataobj);
              const imgd = createImageData(new Uint8ClampedArray(dataobj), image_width, image_height);
              ctx.putImageData(imgd,x, y);
            }
          }
          // console.log(ctx.getImageData(0, 0, total_width, total_height));
          const LIM=Image.fromCanvas(h5canv)
          LIM.save(
            path.resolve(
              "./results/image" +
                md5.update(Date.now().toString(2)).digest("hex") +
                ".png"
            )
          );
        });
      },
      err => {
        console.log(err);
      }
    );
    /**
     * 
     * @returns {Promise<Object>}
     */
    async function gen_images() {
      let responses = [];
      let start_time = Date.now();
      return [
        { task: { id: "2ee58f59-2de6-4dae-aa76-91137d8ea2cf" } },
        { task: { id: "294af029-f123-4cc6-a7b5-4132b4b0e179" } },
        { task: { id: "682785c0-fd38-4d91-8340-9e2f588d32bb" } },
        { task: { id: "9db5d433-e2d2-47b7-ad7c-04c5afc9fe77" } }
      ];
    }
    //   for (let n = 0; n < prompts.length; n++) {
    //     await generate(
    //       prompts[n],
    //       styles[n],
    //       `${n + 1}/${prompts.length} `
    //     ).then(
    //       response_object => {
    //         responses.push(response_object);
    //       },
    //       error_object => {
    //         console.error(
    //           "there was an error during the generation of your image" +
    //             error_object.reason
    //         );
    //       }
    //     );
    //   }
    //   let end_time = Date.now();
    //   let difference = end_time - start_time;
    //   return responses;
    // }
  }
  /**
   * 
   * @param {Promise<Object[]>} responses 
   * @returns {Promise<any[][]>}
   */
  async function GIMARRAY(responses) {
    let image_array = [];
    for (let n = 0; n < width; n++) {
      let xarray = [];
      for (let m = 0; m < height; m++) {
        let path_str = path.join(
          "./generated",
          responses[height * n + m].task.id + "-final.jpg"
        );
        await Image.load(path_str).then(value => {
          xarray.push(value);
        });
      }
      image_array.push(xarray);
    }
    return image_array;
  }
}
/**
 * 
 * @param {string} path 
 * @param {string} endpath 
 * @returns 
 */
async function execute(path, endpath) {
  let image = await Image.load(path);
  let grey = image
    .grey() // convert the image to greyscale.
    .resize({ width: 200 }) // resize the image, forcing a width of 200 pixels. The height is computed automatically to preserve the aspect ratio.
    .rotate(30); // rotate the image clockwise by 30 degrees.
  return grey.save(endpath);
}
// execute().catch(console.error);

// generate("Hello, this is a test", 13, "htiats ").then(
//   response_object => {
//     const photo_id = response_object.task.id;
//     const p = path.join("./generated", photo_id + "-final");
//     execute(p + ".jpg", p + ".png");
//     console.log(p);
//   },
//   error_object => {
//     console.error(
//       "there was an error during the generation of your image" +
//         error_object.reason
//     );
//   }
// );

generate_image_array(
  [
    "a blue sky, over a grassy field",
    "a smoky factory, under thick,grey fog",
    "an illiminated diamond, reflecting a rainbow in the background",
    "a grassy field, filled with people, watching a sporting event"
  ],
  [6, 28, 7, 7],
  2,
  2
);
