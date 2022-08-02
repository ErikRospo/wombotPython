//@ts-check
// const SegfaultHandler = require('segfault-handler');
// SegfaultHandler.registerHandler('crash.log');
const task = require("./index");
const styles = require("./styles");
const steps = require("./steps");
// const { Image } = require("image-js");
const pixels=require("image-pixels");
const pixel_output=require("image-output")
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
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
    const image_height=1568;
    const image_width=960;
    gen_images().then(
      value => {
        /**@type {Promise<Object[]>}*/
        console.log(value);
        let responses = value;
        let i = 0;
        GIMARRAY(responses).then(async image_array => {
 
          // console.log(image_array)
          // let total_width = image_array.flat().reduce((pvalue, currvalue) => {
          //   // console.log(pvalue,currvalue)
          //   return pvalue + parseInt(currvalue.width);
          // }, 0);
          // let total_height = image_array.flat().reduce((pvalue, currvalue) => {
          //   return pvalue + currvalue.height;
          // }, 0);
          let imwidth=1080;
          let imheight=720
          // let CIM = new Image(image_width,image_height);
          let total_pixel_value_count=image_array[1][0].length+image_array[0][1].length+image_array[1][1].length+image_array[0][0].length
          let img_buffer = new Int8Array(total_pixel_value_count);
          img_buffer.set(image_array[0][1]);
          img_buffer.set(image_array[1][1],image_array[0][1].length);
          img_buffer.set(image_array[0][0],image_array[0][1].length+image_array[1][1].length);
          img_buffer.set(image_array[1][0],image_array[0][1].length+image_array[1][1].length+image_array[0][0].length);
          img_buffer=downsample(img_buffer,image_width,image_height,imheight,imwidth);
          let CIM = pixels(img_buffer,{width:imwidth,height:imheight});
          pixel_output(CIM,{width:imwidth,height:imheight},`result/output${Date.now()}.png`);
          // let CIM=pixels(img_buffer,{width:image_width*image_array.length,height:image_height*image_array[0].length});
          // pixel_output(CIM,{width:image_width*image_array.length,height:image_height*image_array[0].length},'output.png');
          // let CIM = sharp(img_buffer, {raw: {'width': image_array.length*image_width, 'height': image_array.length[0]*image_height, 'channels': 3}});
          // CIM.png().toFile("./image.png");
          // CIM.png().toBuffer().then(buffer => {
          //   fs.writeFileSync("./image.png", buffer);
          // }, err => {
          //   console.log(err);
          // });
          
          
          // console.log(CIM)

          
          // let h5canv = CIM.getCanvas();
          // let ctx = h5canv.getContext("2d") || new CanvasRenderingContext2D();
          // for (let n = 0; n < width; n++) {
          //   for (let m = 0; m < height; m++) {
          //     let dataobj = image_array[m][n]["data"];
          //     // console.log(dataobj);
          //     // const imgd = createImageData(new Uint8ClampedArray(dataobj), image_width, image_height);
          //     // ctx.putImageData(imgd,x, y);
          //     CIM.toBuffer().then(buffer => {
          //       console.log(buffer);
          //     }
          //     );
          //   }
          // }
          // console.log(ctx.getImageData(0, 0, total_width, total_height));
          // const LIM=Image.fromCanvas(h5canv)
          // LIM.save(
          //   path.resolve(
          //     "./results/image" +
          //       md5.update(Date.now().toString(2)).digest("hex") +
          //       ".png"
          //   )
          // );
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
        {path:'generated/8b6d3218-fc26-4268-a9ca-e9ed4bfa53de-final.jpg' },
        {path:'generated/048d644e-040f-409a-9693-b6e714d4e5e0-final.jpg' },
        {path:'generated/17571e54-c3ea-4266-ba33-5f1c7ade9aa5-final.jpg' },
        {path:'generated/f0c7f07e-793d-41b0-a271-2e8f3d913936-final.jpg' }

      ];
    // }
      // for (let n = 0; n < prompts.length; n++) {
      //   await generate(
      //     prompts[n],
      //     styles[n],
      //     `${n + 1}/${prompts.length} `
      //   ).then(
      //     response_object => {
      //       responses.push(response_object);
      //     },
      //     error_object => {
      //       console.error(
      //         "there was an error during the generation of your image" +
      //           error_object.reason
      //       );
      //     }
      //   );
      // }
      // let end_time = Date.now();
      // let difference = end_time - start_time;
      // return responses;
    }
    
  }
  /**
   * 
   * @param {Promise<Object[]>} responses 
   * @returns {Promise<any[][]>}
   */
  async function GIMARRAY(responses) {
    const image_width=960;
    const image_height=1568;
    let image_array = [];
    for (let n = 0; n < width; n++) {
      let xarray = [];
      for (let m = 0; m < height; m++) {
        let path_str = responses[m*width+n].path;

        xarray.push(await pixels(path_str,{width:image_width,height:image_height}));
      }
      image_array.push(xarray);
    }
    return image_array;
  }
  /**
   * 
   * @param {Int8Array} image 
   * @param {number} starting_height
   * @param {number} starting_width
   * @param {number} end_width
   * @param {number} end_height
   * @returns {Int8Array}
  */
  function downsample(image,starting_height,starting_width,end_height,end_width){
    let image_array=new Int8Array(end_height*end_width*3);
    let sample_height=Math.floor(starting_height/end_height);
    let sample_width=Math.floor(starting_width/end_width);
    //take the average of the pixels
    for (let n = 0; n < end_height; n++) {
      for (let m = 0; m < end_width; m++) {
        let sum=[];
        for (let i = 0; i < sample_height; i++) {
          for (let j = 0; j < sample_width; j++) {
            sum[0]+=image[(n*sample_height+i)*starting_width*3+(m*sample_width+j)*3+0]*2;
            sum[1]+=image[(n*sample_height+i)*starting_width*3+(m*sample_width+j)*3+1]*2;
            sum[2]+=image[(n*sample_height+i)*starting_width*3+(m*sample_width+j)*3+2]*2;
          }
        }
        image_array[n*end_width*3+m*3+0]=Math.floor(sum[0]/((sample_height*sample_width)*3));
        image_array[n*end_width*3+m*3+1]=Math.floor(sum[1]/((sample_height*sample_width)*3));
        image_array[n*end_width*3+m*3+2]=Math.floor(sum[2]/((sample_height*sample_width)*3));
      }
    }
    return image_array;
  }
}

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
