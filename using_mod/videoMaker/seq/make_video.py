import cv2

with open("path.txt") as f:
    path=f.read()
with open(path+"/allPaths.txt") as f:
    paths=f.read().splitlines()
imgArray = []
print("Starting")
for filename in paths:
    imgArray.append(cv2.imread(filename))
    
out = cv2.VideoWriter(path+'/final.mp4',cv2.VideoWriter_fourcc(*'mp4v'), 15, [960,1568])

for i in range(len(imgArray)):
    out.write(imgArray[i])
out.release()
print("Done making video")