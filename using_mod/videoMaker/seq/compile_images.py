from time import time_ns
from PIL import Image
import json

file_path="./settings.json"
with open(file_path,"rt") as f:
    settings = json.loads(f.read())

iterations=settings['iterations']
style_iterations=settings['styleSteps']
fp='./generated/'+settings['file_folder']
image_list=[]
for i in range(iterations):
    path=fp+"/"+str(i)+"/final.jpg"
    image_list.append(Image.open(path))

final_image=image_list[0]
final_image.save(fp+"/final.gif","GIF",save_all=True,append_images=image_list[1:],duration=100,loop=0,optimize=True)

with open(file_path,"wt") as f:
    settings['file_folder']=str(time_ns())
    f.write(json.dumps(settings,indent=4))
    
    
    