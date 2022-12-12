# todo

## frontend
1. display current image.

2. have a working masking tool
    1. Implement basic image editing tools.
        1. pencil
        2. fill
        3. etc
3. send commands to backend.
4. allow loading images as a starting point.
5. allow just generating images with the SD api, without the inpainting/outpainting.
6. allow for customizing options for stable diffusion.
    1. negative prompts.
7. allow for infinite scrolling.
    1. either the actual image scrolling
    2. or serverside.
        1. this seems like it would be hard, inefficent, and just straight up a bad idea.
## backend
1. recive commands.
2. interact with filesystem
    1. set up/figure out directory layout
    2. save/load images
3. interact with replicate servers.
    1. SD inpainting.
        1. upload mask
        2. upload image
        3. upload prompt
        4. options
            1. prompt
            2. image
            3. mask
            4. prompt strength
            5. outputs.
            6. steps.
            7. guidence scale
            8. seed
        5. wait for response.
    2. normal SD.
        1. upload image?
        2. upload prompt
        3. wait for response
    
4. send completed images back to frontend.
    1. Really long requests.
        1. -Not ideal
        2. -bad practice
        3. +easy to implement
    2. Continuous pinging the server for updates.

        1. -requires more network activity
        2. +better practices
        3. +works in the real world.
        4. +may be easier to implement.
    3. Web sockets
        1. -Harder to implement
        2. -requires more libraries
        3. -not familiar with
        4. -may not be able to cope with multiple requests at once.
        5. -may not be able to handle large files being transfered.
        6. +actualy designed for long term comunication

### basic idea


POST to `https://replicate.com/api/models/stability-ai/stable-diffusion-inpainting/versions/e5a34f913de0adc560d20e002c45ad43a80031b62caacc3d84010c6b6a64870c/predictions`
with 
`{"inputs":{"prompt":"Face of a yellow cat, high resolution, sitting on a park bench","num_outputs":1,"guidance_scale":7.5,"prompt_strength":0.8,"num_inference_steps":25,"mask":"https://replicate.delivery/pbxt/HtGQBqO9MtVbPm0G0K43nsvvjBB0E0PaWOhuNRrRBBT4ttbf/mask.png","image":"https://replicate.delivery/pbxt/HtGQBfA5TrqFYZBf0UL18NTqHrzt8UiSIsAkUuMHtjvFDO6p/overture-creations-5sI6fQgYIuo.png"}}`

then we get the uuid by {}.uuid.
after that, we continiously GET `https://replicate.com/api/models/stability-ai/stable-diffusion-inpainting/versions/e5a34f913de0adc560d20e002c45ad43a80031b62caacc3d84010c6b6a64870c/predictions`+uuid