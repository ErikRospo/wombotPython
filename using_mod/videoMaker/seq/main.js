const sequential = require("./sequential.js");
const fs = require("fs");
const mkdirp = require("mkdirp");
const sample = "../lyrics_sample.txt";
const download = require("./download.js");
const path = require("path");
const imagepixels = require("image-pixels");
samples_array = fs.readFileSync(sample).toString().split("\n");
const style = 15;
(async function() {
  const sarl = samples_array.length;
  sequential.generate_from_array(samples_array, style, 15).then(async ff => {
    let res = ff;
    let dir = path.resolve("./generated/result" + Date.now());
    mkdirp(dir);

    // fs.writeFileSync(dir + "/result.txt",JSON.stringify(res,null,4));
    // fs.writeFileSync(dir + "/result.txt", JSON.stringify(res, null, 2));
    let image_paths = [];
    let dir_paths = [];

    for (let i = 0; i < res.length; i++) {
      await mkdirp(dir + "/" + i);
      dir_paths.push(path.resolve(dir + "/" + i));

      download(res[i].url, dir + "/" + i + "/0.jpg");
      image_paths.push(path.resolve(dir + "/" + i + "/0.jpg"));
    }
    // we want to interpolate between the images
    // by first generating based off of the just the first image
    //than, based off of a weighted average of the first and second image, about (0.1/0.9)
    //than, based off of a weighted average of the first and second image, about (0.2/0.8)
    //etc...
    //than, based off of a weighted average of the first and second image, about (0.9/0.1)
    //finally, based off of the second image
    //this will give us a smooth (ish) transition between the images
    // we then do this for each image pair in our sequence
    //once we have all of these images, we can make a video out of them
    //we can also make a video out of the original images, if we want
    function mix(first, second, weight) {
      return first * weight + second * (1 - weight);
    }
    for (let i = 0; i < res.length - 1; i++) {
      let first = imagepixels(image_paths[i]);
      let second = imagepixels(image_paths[i + 1]);
      fs.mkdirSync(dir_paths[i], { recursive: true });

      for (let j = 1; j < 10; j++) {
        let weight = j / 10;
        let new_image = [];
        for (let k = 0; k < first.length; k++) {
          new_image.push(mix(first[k], second[k], weight));
        }

        try {
          fs.writeFileSync(
            dir_paths[i] + "/" + j + ".jpg",
            Buffer.from(new_image)
          );
        } catch (e) {
          // console.log(e)

          fs.writeFileSync(
            dir_paths[i] + "/" + j + ".jpg",
            Buffer.from(new_image)
          );
        }
      }
    }
  });
})();
