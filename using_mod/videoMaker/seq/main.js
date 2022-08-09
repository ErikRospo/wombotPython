const sequential = require("./sequential.js");
const fs = require("fs");
const mkdirp = require("mkdirp");
const sample = "../lyrics_sample.txt";
const download = require("./download.js");
const path = require("path");
const imagepixels = require("image-pixels");
const { exit } = require("process");
let samplesArray = fs
    .readFileSync(sample)
    .toString()
    .replace("\r\n", "\n")
    .split("\n")
    .slice(0, 3);
const style = 15;
(async function () {
    sequential.generateFromArray(samplesArray, style, 15).then(
        async (ff) => {
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
                await new Promise((res) => setTimeout(res, 1000));
                await download(res[i].url, dir + "/" + i + "/0.jpg");
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
            for (let i = 0; i < res.length; i++) {
                let first = await imagepixels(imagePaths[i]);
                let second;
                if (i != res.length - 1) {
                    second = await imagepixels(imagePaths[i + 1]);
                } else {
                    second = await imagepixels({
                        "source": new Float32Array( first.length,0),
                        "width": first.width,
                        "height": first.height
                    });
                }
                try {
                    fs.mkdirSync(dirPaths[i], { recursive: true });
                } catch {
                    console.log("mkdir failed");
                    exit(1);
                }
                for (let j = 1; j < 10; j++) {
                    let weight = j / 10;
                    let newImage = [];
                    
                    for (let k = 0; k < first.width*first.height; k++) {
                        // second[k] = second[k] || -2;
                        // first[k] = first[k] || -1;
                        newImage.push(mix(first[k], second[k], weight));
                    }
                    console.log(newImage);
                    fs.writeFileSync(
                        dirPaths[i] + "/" + j + ".jpg",
                        Buffer.from(newImage)
                    );
                }
            }
        },
        (e) => {
            console.log(e);
        }
    );
})();
