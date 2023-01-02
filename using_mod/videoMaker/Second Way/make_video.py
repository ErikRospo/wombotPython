import cv2
import json
import os.path as osp
with open("path.txt") as f:
    path=f.read()
json_data=open(path).read()
data = json.loads(json_data)['responses']
paths=[]
for i in range(len(data)):
    paths.append(data[str(i)]["path"])
imgArray = []
print("Starting reading")
for filename in paths:
    imgArray.append(cv2.imread(filename))
print("done reading")
print("writing video")
out = cv2.VideoWriter(osp.join(osp.dirname(path),"final.mp4"),cv2.VideoWriter_fourcc(*'mp4v'), 5, [960,1568])
for i in range(len(imgArray)):
    out.write(imgArray[i])
out.release()
print("Done making video")