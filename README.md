# wombotPython
My most advanced offshoot of this project has been `videoMaker`. Availible at `./using_mod/videoMaker/Second Way/`  
[Pages](https://erikrospo.github.io/wombotPython/)  

The `project` directory is mainly focused on creating a baseline API that can be used in other projects.  
The `using_mod` directory contains projects that use the API.  
`using_mod/sequential` works by generating an image, then for the next image, it takes (for input) the one 2-6 behind it. This is meant to improve stability in the video quality. It also generates several images off the same prompt and style, again trying to increase the stability.


This also includes a (WIP) Stable diffusion UI.  
`SD/app/` includes a react app for the UI.  
`SD/server/` includes a server that runs on the user's computer, that interacts with the filesystem, and the servers responsible for actually generating the image.  





[![pages-build-deployment](https://github.com/ErikRospo/wombotPython/actions/workflows/pages/pages-build-deployment/badge.svg?branch=Working)](https://github.com/ErikRospo/wombotPython/actions/workflows/pages/pages-build-deployment)
