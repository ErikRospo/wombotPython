const sequential = require("./sequential.js");
const fs = require("fs");
const mkdirp = require("mkdirp");
const sample = "../lyrics_sample.txt";
const download = require("./download.js");
const path = require("path");
const imagepixels = require("image-pixels");
let samplesArray = fs
    .readFileSync(sample)
    .toString()
    .replace("\r\n", "\n")
    .split("\n");
const style = 15;
(async function () {
    sequential.generateFromArray(samplesArray, style, 15).then(async (ff) => {
        let res = ff;
        let dir = path.resolve("./generated/result" + Date.now());
        mkdirp(dir);

        // fs.writeFileSync(dir + "/result.txt",JSON.stringify(res,null,4));
        // fs.writeFileSync(dir + "/result.txt", JSON.stringify(res, null, 2));
        let imagePaths = [];
        let dirPaths = [];

        for (let i = 0; i < res.length; i++) {
            await mkdirp(dir + "/" + i);
            dirPaths.push(path.resolve(dir + "/" + i));

            download(res[i].url, dir + "/" + i + "/0.jpg");
            imagePaths.push(path.resolve(dir + "/" + i + "/0.jpg"));
        }
        // we want to interpolate between the images
        // by first generating based off of the just the first image
        // than, based off of a weighted average of the first and second image, about (0.1/0.9)
        // than, based off of a weighted average of the first and second image, about (0.2/0.8)
        // etc...
        // than, based off of a weighted average of the first and second image, about (0.9/0.1)
        // finally, based off of the second image
        // this will give us a smooth (ish) transition between the images
        // we then do this for each image pair in our sequence
        // once we have all of these images, we can make a video out of them
        // we can also make a video out of the original images, if we want
        function mix(first, second, weight) {
            return first * weight + second * (1 - weight);
        }
        for (let i = 0; i < res.length - 1; i++) {
            let first = imagepixels(imagePaths[i]);
            let second = imagepixels(imagePaths[i + 1]);
            fs.mkdirSync(dirPaths[i], { recursive: true });

            for (let j = 1; j < 10; j++) {
                let weight = j / 10;
                let newImage = [];
                for (let k = 0; k < first.length; k++) {
                    newImage.push(mix(first[k], second[k], weight));
                }

                try {
                    fs.writeFileSync(
                        dirPaths[i] + "/" + j + ".jpg",
                        Buffer.from(newImage)
                    );
                } catch (e) {
                    // console.log(e)

                    fs.writeFileSync(
                        dirPaths[i] + "/" + j + ".jpg",
                        Buffer.from(newImage)
                    );
                }
            }
        }
    });
})();
