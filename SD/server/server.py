#!/usr/bin/python3
import json
import os #for getting the current file path
import sys
import threading #multithreading and locking
from typing import List, Union
import uuid #identifying the tasks
import requests # interacting with replicate servers
import mimetypes # identifying files
import time # waiting a certain amount of time
import base64 #for decoding images sent back from the Canvas.
from io import BytesIO #for b64 encoding operations.
import numpy as np
from PIL import Image # for image editing
from urllib import parse
from http.client import NOT_FOUND, OK, BAD_REQUEST
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
taskPoolIDS=[]
#ImageFile.LOAD_TRUNCATED_IMAGES = True # this is a bandaid solution, we need to know why the images are being truncated in the first place.
if len(sys.argv)>1:
    serverPort=int(sys.argv[1])
else:
    serverPort=8080
hostName = "localhost"
this_url="http://%s:%s"%(hostName,serverPort)
#requisite headers for working with the api
headers={"x-csrftoken":"rfU9sNVa303QtGhGx9jq1AemDXfoTxpV","origin":"https://replicate.com","referer":"https://replicate.com/stability-ai/stable-diffusion-inpainting","cookie":"csrftoken=rfU9sNVa303QtGhGx9jq1AemDXfoTxpV; replicate_anonymous_id="+uuid.uuid4().hex}
# output data
outs={}
outsLock=threading.Lock()
imgwidth=0
imgheight=0
class Task:
    uuid:str
    thread:threading.Thread
    width:int
    height:int
    iwidth:int
    iheight:int
    x:int
    y:int
    def __init__(self,thread:threading.Thread):
        self.uuid=uuid.uuid4().hex
        self.thread=thread
    def isactive(self):
        return self.thread.is_alive()
croplock=threading.Lock()
return_values={}
rvlock=threading.Lock()
inprogresslock=threading.Lock()


threads:List[Task]=[]
threadslock=threading.Lock()

myimages:List[List[bytes]]=[]
def updateImage():
    newThreads:List[Task]=[]
    threadslock.acquire()
    global threads

    for n in threads:
        if not n.isactive():
            inprogresslock.acquire()
            with open("./outfile.jpg","wb") as f:
                unpr=outs.get(n.uuid)
                if unpr:
                    f.write(requests.get(unpr[0]).content)
                
            i=Image.open("./outfile.jpg")
            
            i=i.resize((n.width*3,n.height*3))
            i.save("./outfile_resized.jpg")
            i=i.crop((n.width,n.height,n.width*2,n.height*2))
            i.save("./outfile_cropped.jpg")
            print(n.uuid+" cropped and saved.")
            icurrent:Image.Image=Image.open("./current.jpg")
            # print(hash(icurrent.tobytes()))
            icurrent=icurrent.resize((n.iwidth,n.iheight))
            icurrent.paste(i,(n.x,n.y))
            # print(hash(icurrent.tobytes()))
            icurrent.save("./current.jpg")
            # outs.pop(n.uuid)
            print(n.uuid+" done")
            inprogresslock.release()
        else:
            newThreads.append(n)

    threads=newThreads
    threadslock.release()
    
def checkObjects():
    global threads
    while True:
        if len(threads)>0:
            updateImage()        
        time.sleep(4)
    
checkthread=threading.Thread(target=checkObjects,name="CheckObjects")
checkthread.start()


def upload_file(path:str):
    cont=bytes()
    with open(path,"rb") as f:
        cont=f.read()
 
    name=os.path.split(path)[1] #what the name of the file is
    content_type=mimetypes.guess_type(name)[0] #mime type
    if type(content_type)==type(None):
        content_type="image/png"
    api_url = "https://replicate.com/api/upload/"+name.replace(" ","_") #get the api url
    res=requests.post(api_url,params={"content_type":content_type},headers=headers) #post the file type
    #returns a serving url, where the content is served (after being uploaded),
    serving_url=res.json()["serving_url"]  
    #and a upload url, where you upload the image.
    upload_url=res.json()["upload_url"]

    #upload the image
    requests.put(upload_url,data=cont,headers={"content-type":content_type})
    return serving_url
def do_image(mask_path,image_path,prompt,uuidp,num_outputs=1,guidence_scale=5,prompt_strength=0.8,num_inference_steps=50): 
    #upload both the mask and the image itself
    mask_url=upload_file(mask_path)
    image_url=upload_file(image_path)
    #set up the data 
    jsondata={"inputs":{"prompt":prompt,"num_outputs":num_outputs,"guidance_scale":guidence_scale,"prompt_strength":prompt_strength,"num_inference_steps":num_inference_steps,"image":image_url,"mask":mask_url}}
    #set up the prediction
    pred=requests.post("https://replicate.com/api/models/stability-ai/stable-diffusion-inpainting/versions/e5a34f913de0adc560d20e002c45ad43a80031b62caacc3d84010c6b6a64870c/predictions",headers=headers,json=jsondata)
    #get the task uuid
    task_uuid=pred.json()["uuid"]
    #print(pred.json()) 
    while True:
        #get the status
        resp=requests.get("https://replicate.com/api/models/stability-ai/stable-diffusion-inpainting/versions/e5a34f913de0adc560d20e002c45ad43a80031b62caacc3d84010c6b6a64870c/predictions/"+task_uuid,headers=headers)
        #if the request succeded
        if resp.json()["prediction"]["status"]=="succeeded":
            #acquire the lock (to avoid multithreading madness)
            outsLock.acquire()
            #set the output variables.
            
            outs[uuidp]=resp.json()["prediction"]["output"]
            #release the lock
            outsLock.release() 
            break
        #otherwise, wait 2 seconds, as to not overload the server.
        time.sleep(2)
def transparency_to_white(img):
    #modified from
 
    #https://stackoverflow.com/a/765829

    #get the pixel values
    pixdata = img.load()
    # get the size
    width, height = img.size
    # loop through the image
    for y in range(height):
        for x in range(width):
            #if the value is a transparent black, 
            if pixdata[x, y] == (0,0,0,0):
                # set it to an opaque black.
                pixdata[x, y] = (255, 255, 255, 255)

    return img

class ReqHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/lookup"):
            if self.path.split("/lookup/")[1] in taskPoolIDS:
 
                self.send_response(OK)
            else:
                self.send_response_only(BAD_REQUEST)
        elif self.path=="/inprogress":
 
            self.send_response(OK)
        elif self.path.startswith("/log"):
            self.send_response(OK)
        elif self.path.startswith("/delete/"):
            if self.path.split("/delete/")[1] in taskPoolIDS:
 
                self.send_response(OK)
            else:
                self.send_response_only(BAD_REQUEST)
        elif self.path.startswith("/imggrid"):
            self.send_response(OK)
            self.send_header("cache-control","no-store")
        elif self.path.startswith("/image"):
            self.send_response(OK)
            self.send_header("content-type","image/jpg")
        elif self.path.startswith("/isactive"):
            self.send_response(OK)
            
            
        else:
    
            self.send_response(NOT_FOUND)
 
        self.end_headers()
 
        if self.path.startswith("/lookup"):
            self.run_lookup()
 
        elif self.path=="/inprogress":
            self.wfile.write(bytes(json.dumps(outs),"utf-8"))
        elif self.path.startswith("/delete/"):
            self.run_delete() 
        elif self.path.startswith('/imggrid'):
            self.run_grid()
        elif self.path.startswith("/image"):
            self.run_image()
        elif self.path.startswith("/isactive"):
            self.run_isactive()
    def run_image(self):
        global rvlock
        global return_values
        updateImage()
        inprogresslock.acquire()
        with open("./current.jpg","rb") as f:
            b=f.read()
            self.wfile.write(b)
        inprogresslock.release()
        print("response done")
       
    def run_isactive(self):
        _,qs=self.path.split("?")
        _,qsb=qs.split("=")
        image_uuid=qsb            
        threadslock.acquire()
        found_flag=False
        for n in threads:
            if n.uuid ==image_uuid:
                isactive = n.isactive()
                if isactive:
                    self.wfile.write(b"T")
                else:
                    self.wfile.write(b"F")
                found_flag=True
                break
            
        threadslock.release()
        if (not found_flag):
            self.wfile.write(b"N")
    def run_grid(self):
        x=int(self.path.split("/")[2])
        y=int(self.path.split("/")[3])
        try:
            self.wfile.write(myimages[x][y])
        except IndexError:
            # a png image made out of a single white pixel.
            self.wfile.write(b"\x89PNG\r\n\x1a\n\0\0\0\rIHDR\0\0\0\x80\0\0\0\x02\b\x06\0\0\0\x90F\xd4\x18\0\0\0\x16IDATx\x01c\xf8\x0f\x05\f\xa3`D\x02&\x86Q0\xa2\x01\0\xd5\xe9\x07\xfb_\xd4D\xfe\0\0\0\0IEND\xaeB`\x82")
    def run_delete(self):
        if self.path.split("/delete/")[1] in taskPoolIDS:
            uuid_in=self.path.split("/delete/")[1]
            for n in range(len(threads)):
                if uuid_in==threads[n].uuid:
                    taskPoolIDS.remove(uuid_in)
                    threads.remove(threads[n])
                    break
    def run_lookup(self):
        if self.path.split("/lookup/")[1] in taskPoolIDS:
            uuid_in=self.path.split("/lookup/")[1]
            for n in range(len(threads)):
                if uuid_in==threads[n].uuid:
                    ind=n
                    if threads[ind].isactive():
                        self.wfile.write(b"TASK_IN_PROGRESS")
                    else:
                        dat=outs[uuid_in]
 
                        jd=bytes(json.dumps(dat),"utf-8")
 
                        self.wfile.write(jd)
                    break
    def do_POST(self):
        if self.path=="/new":
            self.send_response(OK)
        elif self.path=="/upload/mask":
            self.send_response(OK)
        elif self.path=="/upload/image":
            self.send_response(OK)
        elif self.path.startswith("/log"):
            self.send_response(OK)
        elif self.path.startswith("/splitimages"):
            self.send_response(OK)
        elif self.path.startswith("/stats"):
            self.send_response(OK)
        elif self.path.startswith("/crop"):
            self.send_response(OK)
            self.send_header("content-type","text/plain")
            self.send_header("content-length","32")
        else:
            self.send_response(NOT_FOUND)
 
        self.end_headers()
 
        if self.path=="/new":
            self.run_new()
                # self.wfile.write(returned_values[self.path.split("/lookup/")[1]].content)
 
 
            # json.loads(self.rfile.read().decode("utf-8")) 
        elif self.path.startswith("/log"):
            self.run_log() 
        elif self.path=="/upload/mask":
            self.run_upload_mask()
        elif self.path=="/upload/image":
            self.run_upload_image()
        elif self.path.startswith("/splitimages"):
            self.run_splitimages()
        elif self.path.startswith("/stats"):
            self.run_stats()
        elif self.path.startswith("/crop"):
            self.run_crop()

    def run_crop(self):
        bodyjson=self.read_bodyjson()
        print(bodyjson)
        imaget=bodyjson["image"]
        if imaget.startswith("http"):
            r=requests.get(imaget)
            exten = imaget.split(".")[-1].split("?")[0]
            croplock.acquire()

            with open("./temp2."+exten,"wb") as f:
                f.write(r.content)
            i=Image.open("./temp2."+exten)
            i.save("./current.jpg")
            #corruption happens after this.
            width=bodyjson["grid"]["w"]
            height=bodyjson["grid"]["h"]
            imagewidth=bodyjson['current']["w"]
            imageheight=bodyjson['current']["h"]
            names = ["pos_original","pos_nx","pos_ny","pos_px","pos_py"]
            coords=[(width,height),(width,0),(0,height),(2*width,height),(width,2*height)]
            curimage=Image.open("current.jpg")
            
            for n in names:
                x=bodyjson[n]["x"]
                y=bodyjson[n]["y"]
                cropped=curimage.resize((imagewidth,imageheight)).crop((x,y,x+width,y+height))
                cropped.save("./"+n+".jpg")
                cropped.close()
            ni=Image.new("RGBA",(width*3,height*3))
            for n in range(1,5):
                i_tmp=Image.open(names[n]+".jpg")
                ni.paste(i_tmp,coords[n])
                i_tmp.close()
            ni.save("./ni.png") 
            # the mask and image are created correctly.
            
            narray=np.array(ni)
            mask=np.zeros_like(narray)
            
            for n in range(len(narray)):
                for m in range(len(narray[n])):
                    if narray[n][m][3]==255:
                        mask[n][m]=[0,0,0,255]
                    else:
                        mask[n][m]=[255,255,255,255]
            maskimage=Image.fromarray(mask)            
            maskimage.save("mask_from_thing.png")
            croplock.release()
            print("done")
            uuid_new=uuid.uuid4().hex
            
            bodyjson["uuidp"]=uuid_new
            #todo 
            #1. change both images to actual file paths.
            #2. accept user input on the prompt.
            #3. actually get the image back to the user. DONE
            

            t=threading.Thread(target=do_image,args=("./mask_from_thing.png","./ni.png","Forest",uuid_new),name="do_image_mask")
            
            t.start()
            
            ts=Task(t)
            ts.width=width
            ts.height=height
            ts.x=bodyjson["pos_original"]["x"]
            ts.y=bodyjson["pos_original"]["y"]
            ts.iwidth=imagewidth
            ts.iheight=imageheight
            ts.uuid=uuid_new

            threads.append(ts)
        
            taskPoolIDS.append(uuid_new)
            self.wfile.write(ts.uuid.encode("utf-8"))
    def read_bodyjson(self):
        content_length=int(self.headers["content-length"])
        body=self.rfile.read(content_length)
        bodyjson=json.loads(body)
        return bodyjson
    def run_log(self):
        content_length=int(self.headers["content-length"])
        body=self.rfile.read(content_length)
        with open("./body.txt","wb") as f:
            f.write(body)
    def run_splitimages(self):
        global myimages
        bodyjson=self.read_bodyjson()
        # print(bodyjson)
        imagewidth=bodyjson["imagesWidth"]
        imageheight=bodyjson["imagesHeight"]
        width=bodyjson["width"]
        height=bodyjson["height"]
        endwidth=width//imagewidth
        endheight=height//imageheight
        image=bodyjson["image"]
        old=bodyjson["oldImage"]
        if image.startswith("http"):
            resp=requests.get(image)
            fn="temp."+image.split(".")[-1]
            with open(fn,"wb") as f:
                f.write(resp.content)
            image=Image.open(fn)
        else: 
            fn="temp."+image.split("/")[1].split(";")[0]
            image=image.removeprefix(b"\"data:image:/png;base64,")
            image=image.removesuffix(b"'")
            imgbytes=base64.b64decode(image + b'==')
 
            with open(fn,"wb") as f:
                f.write(imgbytes)
            image=Image.open(fn)
        images=[]
        for x in range(endwidth):
            temp=[]
            for y in range(endheight):
                oldone=old[x][y]
                cropped=image.crop((oldone["x"],oldone["y"],oldone["x"]+oldone["width"],oldone["y"]+oldone["height"]))
                im_file=BytesIO()
                cropped.save(im_file,format="png")
                im_bytes=im_file.getvalue()
 
                temp.append(im_bytes)
            images.append(temp)
        myimages=images

        self.wfile.write(b"OK")
    def run_stats(self):
        global myimages
        bodyjson=self.read_bodyjson()
        imagewidth=bodyjson["imagesWidth"]
        imageheight=bodyjson["imagesHeight"]
        width=bodyjson["width"]
        height=bodyjson["height"]
        endwidth=width//imagewidth
        endheight=height//imageheight
        print(imagewidth,imageheight,width,height,endwidth,endheight)

    def run_upload_mask(self):
        content_length=int(self.headers["content-length"])
        body=self.rfile.read(content_length)
        body=body.removeprefix(b"\"data:image/png;base64,")
        body=body.removesuffix(b'"')
        body_binary=base64.b64decode(body + b'==')
 
        with open("./mask.png","wb") as f:
            f.write(body_binary)
        img=Image.open("./mask.png")
        img=transparency_to_white(img)
 
        img=img.convert(mode="RGB")
        img.save("./mask.png")
        img.close()
    def run_upload_image(self):
        global imgwidth,imgheight
        content_length=int(self.headers["content-length"])
        body=self.rfile.read(content_length)
        body=body.removeprefix(b"\"data:image/png;base64,")
        body=body.removesuffix(b'"')
        body_binary=base64.b64decode(body + b'==')
        with open("./image.png","wb") as f:
            f.write(body_binary)
        img=Image.open("./image.png")
        img.close()
    def run_new(self):
        content_length=int(self.headers["content-length"])
        body=self.rfile.read(content_length).decode("utf-8")


            # print(body)
        #this is most of the code I'd need to get the options able to be customized.
        bodyjson=json.loads(body)
        # print(bodyjson)
        prompt=bodyjson["prompt"]
    
        l={"num_outputs":1,
               "guidence_scale":5,
               "prompt_strength":0.8,
               "num_inference_steps":50}
        try:
            l["num_outputs"]=bodyjson["num_outputs"]
        except:
            pass
        try:
            l["guidence_scale"]=bodyjson["guidence_scale"]
        except:
            pass
        try:
            l["promt_strength"]=bodyjson["promt_strength"]
        except:
            pass
        try:
            l["num_inference_steps"]=bodyjson["num_inference_steps"]
        except:
            pass
        uuid_new=uuid.uuid4().hex
        bodyjson["uuidp"]=uuid_new
        t=threading.Thread(target=do_image,args=("./mask.png","./image.png",prompt,uuid_new),kwargs=l,name="do_image")
        t.start()
 
        ts=Task(t)
        ts.uuid=uuid_new
        threads.append(ts)
 
        taskPoolIDS.append(ts.uuid)
 
        self.wfile.write(bytes(ts.uuid,"utf-8"))
        # print(ts.uuid)
    def do_OPTIONS(self):
        self.send_response(OK)
        self.end_headers()

    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin","*")
        self.send_header("Access-Control-Allow-Methods","POST")
        self.send_header("Access-Control-Allow-Methods","GET")
        return super().end_headers()        
if __name__ == "__main__": 
    webServer = ThreadingHTTPServer((hostName, serverPort), ReqHandler)
    print("Server started http://%s:%s" % (hostName, serverPort))
    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        
        pass
    for n in threading.enumerate():
        print(n.native_id)
    webServer.server_close()
    print("Server stopped.")
        
