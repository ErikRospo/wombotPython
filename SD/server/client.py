import requests,numpy as np
from PIL import Image
url="http://localhost:8080"
print("posting to "+url+"/crop")
o="https://i.imgur.com/NuUoA9Z.jpeg"
resp=requests.post(url+"/crop",json={'image': o, 'pos_original': {'x': 400, 'y': 250}, 'pos_px': {'x': 450, 'y': 250}, 'pos_nx': {'x': 350, 'y': 250}, 'pos_py': {'x': 400, 'y': 300}, 'pos_ny': {'x': 400, 'y': 200}, 'current': {'w': 1536, 'h': 763}, 'grid': {'w': 50, 'h': 50}})
print("posted to "+url+"/crop")

resp2=requests.get(url+"/image")
with open("./tests/orig.jpg","wb") as f:
    f.write(requests.get(o).content)
with open("./tests/new.jpg","wb") as f:
    f.write(resp2.content)
bf=Image.open("./tests/orig.jpg")
af=Image.open("./tests/new.jpg")
before_array=np.asarray(bf,dtype=np.int8)
after_array=np.asarray(af,dtype=np.int8)
diff_array=abs(before_array-after_array)

Image.fromarray(diff_array.astype(np.uint8),mode="RGB").save("./tests/diff.jpg")