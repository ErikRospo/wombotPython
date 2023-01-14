from PIL import Image
import numpy as np
posx=450
posy=300
w=50
h=50
i=Image.open("./outfile.jpg")
print("opened")
print(hash(i.tobytes()))
i=i.resize((w*3,h*3))
print("resized")
print(hash(i.tobytes()))
i.save("./outfile_resized.jpg")
i=i.crop((w,h,w*2,h*2))
print("cropped")
print(hash(i.tobytes()))
i.save("./outfile_cropped.jpg")
print("saved")
print(hash(i.tobytes()))

icurrent:Image.Image=Image.open("./current.jpg")
print("current")
print(hash(icurrent.tobytes()))

# icurrent=icurrent.convert("RGBA")
print("converted")
print(hash(icurrent.tobytes()))
before_array=np.asarray(icurrent,dtype=np.uint8)
icurrent.paste(i,(posx,posy,posx+w,posy+h))
after_array=np.asarray(icurrent,dtype=np.uint8)
print("pasted")
print(hash(icurrent.tobytes()))
icurrent.save("./pasted.png")