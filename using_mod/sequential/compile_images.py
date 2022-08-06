from PIL import Image
import tqdm
import json

file_path="./settings.json"
with open(file_path,"rt") as f:
    settings = json.loads(f)

iterations=settings['iterations']
style_iterations=settings['style_iterations']
fp='./generated/'+settings['file_folder']
image_list=[]
for i in tqdm.trange(iterations):
    path=fp+str(i)+"/final.jpg"
    image_list.append(Image.open(path))

final_image=image_list[0]
final_image.save(fp+"final.gif","GIF",save_all=True,append_images=image_list[1:],duration=100,loop=0,optimize=True)