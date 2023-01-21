import requests,numpy as np
from PIL import Image
import time
url="http://localhost:8080"
print("posting to "+url+"/crop")
o="https://i.imgur.com/NuUoA9Z.jpeg"
resp=requests.post(url+"/crop",json={'image': o, 'pos_original': {'x': 400, 'y': 250}, 'pos_px': {'x': 450, 'y': 250}, 'pos_nx': {'x': 350, 'y': 250}, 'pos_py': {'x': 400, 'y': 300}, 'pos_ny': {'x': 400, 'y': 200}, 'current': {'w': 1536, 'h': 763}, 'grid': {'w': 50, 'h': 50}})
print("posted to "+url+"/crop")
print("waiting until image is done")
uuid=resp.text
restext="T"
while restext=="T":
    time.sleep(2)
    r=requests.get(url+"/isactive",params={"uuid":uuid})
    restext=r.text
    if (restext=="T"):
        print("Not done yet, waiting 2 seconds")
    elif (restext=="F"):
        print("Done")
    elif (restext=="N"):
        print("Image task is somehow not found")
    else:
        print("This shouldn't happen")
print("done")
print("getting "+url+"/image")
resp2=requests.get(url+"/image")
print("got "+url+"/image")
print("saving original")
with open("./tests/orig.jpg","wb") as f:
    f.write(requests.get(o).content)
print("original saved")
print("saving new")
with open("./tests/new.jpg","wb") as f:
    f.write(resp2.content)
print("new saved")
print("opening images")
bf=Image.open("./tests/orig.jpg")
af=Image.open("./tests/new.jpg")
print("images opened")
print("converting to arrays")
before_array=np.asarray(bf,dtype=np.uint8)
after_array=np.asarray(af,dtype=np.uint8)
print("converted")
print("diffing")
diff_array=abs(before_array-after_array)
print("diffed")
print("saving")
Image.fromarray(diff_array.astype(np.uint8),mode="RGB").save("./tests/diff.jpg")
print("saved")