import cv2
import numpy as np
import glob
from time import time_ns
import json

# file_path="./settings.json"
# with open(file_path,"rt") as f:
#     settings = json.loads(f.read())

# img_array = []
# for filename in glob.glob('./generated/'+settings['file_folder']+'/**/*.jpg', recursive=True):
    
#     img = cv2.imread(filename)
#     height, width, layers = img.shape
#     size = (width,height)
#     img_array.append(img)


# out = cv2.VideoWriter('./generated/'+settings["file_folder"]+'/final.mp4',cv2.VideoWriter_fourcc(*'mp4v'), 15, size)
 
# for i in range(len(img_array)):
#     out.write(img_array[i])
# out.release()
# with open(file_path,"wt") as f:
#     settings['file_folder']=str(time_ns())
#     f.write(json.dumps(settings,indent=4))
with open("path.txt") as f:
    path=f.read()
with open(path+"/allPaths.txt") as f:
    paths=f.read().splitlines()
imgArray = []
print("Starting")
for filename in paths:
    img=open(filename,"rb")
    imgArray.append(img.read())
out = cv2.VideoWriter(path+'/final.mp4',cv2.VideoWriter_fourcc(*'mp4v'), 15, [960,1568])

for i in range(len(imgArray)):
    out.write(imgArray[i])
out.release()
print("Done making video")