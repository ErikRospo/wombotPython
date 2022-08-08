1. we have a UI that allows the user to input a list of song lyrics
2. then, we take those lyrics and feed them into the art generator.
    a. we may create ~6 different images, and then display them all in a grid
    b. then, the user can select one of the images, and that gets saved.
3. then, we create a bunch of new images, that interpolate between lyrics
    a. we create ~10 images, with starting images from lerping the pixel values of the two corresponding images
        1. also, between 0 and 5, we use the first lyric as the prompt, and then between 5 and 10, we use the second lyric as the prompt
    b. then, we save the images
4. then, we make a video out of the images.
    a. we can use cv2.VideoWriter to make a video out of the images, if we are using python
    b. or we could use some other library if we are using javascript
    
