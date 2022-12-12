# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## idea
To achieve inpainting, we can just use the existing implementation. For outpainting, we could scale down part of the image, then generate the new one with the scaled down part, then split the new one up into 4 parts, and inpaint those. then we could merge it all back down to one image.

alternatively, after splitting it, we could mask out a grid of pixels. e.g.
xxxxxxxxxxxx
xoxoxoxoxoxo
xxxxxxxxxxxx
xoxoxoxoxoxo
xxxxxxxxxxxx
xoxoxoxoxoxo
xxxxxxxxxxxx
xoxoxoxoxoxo
then, inpaint.
x= masked
o= image
^^ not sure how SD will react.

we could scale up the image by 2x on all sides.
then, split it up into 4 images.

then, because each tile is the same size as the original image, we can inpaint between it, to get a super-resolution effect.


Possibly allow for multiple tiles to be generated simultaiously, if they do not share any edges.
This seems like it would be a huge pain to implement, and is not a big priority.

The other thing is saving large images.
After a certain point, we should split them up.
However, I'm not sure if the images we will generate will ever get that big. 
We can cross that bridge when we get to it.


We could do the actual requests to the `replicate.ai` server on the python `server.py`. this might be easier than doing it on the frontend.









## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
