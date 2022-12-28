# todo

## frontend
[ ] display current image.

[ ] have a working masking tool
    [ ] Implement basic image editing tools.
        [x] pencil
        [-] fill
            [ ] Clientside
            [ ] Serverside
        [x] eraser
            [x] erases mask
            [x] erases to transparency
                [-] a kinda bad idea would be to send the mask to the server, have the server erase it, and send it back.
        [x] clear
[ ] send commands to backend.
[x] allow loading images as a starting point.
[ ] allow just generating images with the SD api, without the inpainting/outpainting.
[ ] allow for customizing options for stable diffusion.
    [ ] negative prompts.
[ ] allow for infinite scrolling.
    [ ] either the actual image scrolling
    [ ] or serverside.
        [ ] this seems like it would be hard, inefficent, and just straight up a bad idea.
    [ ] We may also be able to do a mix, where the image is split into chunks, on the backend and we can scroll around those on the frontend, and when we get far enough away, we switch chunks on the backend.
[ ] Actually prevent keystrokes in the keyhandler while typing in the `prompt` input box.
[ ] When we click the image with the `generate` tool, send something to the server to tell it to calculate the position, and generate the new one.

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
        * -Not ideal
        * -bad practice
        * +easy to implement
    [x] Continuous pinging the server for updates.

        * -requires more network activity
        * +better practices
        * +know that it works in the real world.
        * +may be easier to implement.
    [-] Web sockets
        * -Harder to implement
        * -requires more libraries
        * -not familiar with
        * -may not be able to cope with multiple requests at once.
        * -may not be able to handle large files being transfered.
        * +actualy designed for long term comunication
[x] parse input from frontend.
    [-] multipart form
        [-] prevent redirect/refresh, but continue request.
    [x] json object in request
[ ] replace image on frontend with new one after generating
    [ ] if it is initialy a url, GET it, and download it to local machine,
    [ ] then, whenever we get a request to say `/getimage`, we would get the image
    [ ] however, once generated, we could replace parts of the image with a new section.
