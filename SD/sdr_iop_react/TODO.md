# todo

## frontend
1. display current image.

2. have a working masking tool
    1. Implement basic image editing tools.
        [x] pencil
        [ ] fill
        [] etc
[ ] send commands to backend.
[x] allow loading images as a starting point.
[ ] allow just generating images with the SD api, without the inpainting/outpainting.
[ ] allow for customizing options for stable diffusion.
    [ ] negative prompts.
[ ] allow for infinite scrolling.
    [ ] either the actual image scrolling
    [ ] or serverside.
        [ ] this seems like it would be hard, inefficent, and just straight up a bad idea.
    [x] We may also be able to do a mix, where the image is split into chunks, on the backend and we can scroll around those on the frontend, and when we get far enough away, we switch chunks on the backend.
## backend
[x] recive commands.
[x] interact with filesystem
    [x] set up/figure out directory layout
    [x] save/load images
[x] interact with replicate servers.
    [x] SD inpainting.
        [x] upload mask
        [x] upload image
        [x] upload prompt
        [x] options
            [x] prompt
            [x] image
            [x] mask
            [x] prompt strength
            [x] outputs.
            [x] steps.
            [x] guidence scale
            [x] seed
        [x] wait for response.
    2. normal SD.
        1. upload image?
        2. upload prompt
        3. wait for response

[x] send completed images back to frontend.
    [-] Really long requests.
        1. -Not ideal
        2. -bad practice
        3. +easy to implement
    [x] Continuous pinging the server for updates.

        1. -requires more network activity
        2. +better practices
        3. +works in the real world.
        4. +may be easier to implement.
    [-] Web sockets
        1. -Harder to implement
        2. -requires more libraries
        3. -not familiar with
        4. -may not be able to cope with multiple requests at once.
        5. -may not be able to handle large files being transfered.
        6. +actualy designed for long term comunication
[x] parse input from frontend.
    [-] multipart form
        [-] prevent redirect/refresh, but continue request.
    [x] json object in request

### basic idea


POST to `https://replicate.com/api/models/stability-ai/stable-diffusion-inpainting/versions/e5a34f913de0adc560d20e002c45ad43a80031b62caacc3d84010c6b6a64870c/predictions`
with 
`{"inputs":{"prompt":"Face of a yellow cat, high resolution, sitting on a park bench","num_outputs":1,"guidance_scale":7.5,"prompt_strength":0.8,"num_inference_steps":25,"mask":"https://replicate.delivery/pbxt/HtGQBqO9MtVbPm0G0K43nsvvjBB0E0PaWOhuNRrRBBT4ttbf/mask.png","image":"https://replicate.delivery/pbxt/HtGQBfA5TrqFYZBf0UL18NTqHrzt8UiSIsAkUuMHtjvFDO6p/overture-creations-5sI6fQgYIuo.png"}}`

then we get the uuid by {}.uuid.
after that, we continiously GET `https://replicate.com/api/models/stability-ai/stable-diffusion-inpainting/versions/e5a34f913de0adc560d20e002c45ad43a80031b62caacc3d84010c6b6a64870c/predictions`+uuid


[GFG for uploading a file to a server](https://www.geeksforgeeks.org/how-to-add-file-uploads-function-to-a-webpage-in-html/), may not work for me, but worth a look.
