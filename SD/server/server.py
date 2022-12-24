#!/usr/bin/python3
import json
import math 
import os #for getting the current file path
import sys
import threading
from typing import List #multithreading and locking
import uuid #identifying the tasks
import requests # interacting with replicate servers
import mimetypes # identifying files
import time # waiting a certain amount of time
import base64 #for decoding images sent back from the Canvas.
from io import BytesIO #for b64 encoding operations.

from PIL import Image # for image editing
from http.client import NOT_FOUND, OK, BAD_REQUEST
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
taskPoolIDS=[]
if len(sys.argv)>1:
    serverPort=int(sys.argv[1])
else:
    serverPort=8080
hostName = "localhost"
#nessicary headers for working with the api
headers={"x-csrftoken":"rfU9sNVa303QtGhGx9jq1AemDXfoTxpV","origin":"https://replicate.com","referer":"https://replicate.com/stability-ai/stable-diffusion-inpainting","cookie":"csrftoken=rfU9sNVa303QtGhGx9jq1AemDXfoTxpV; replicate_anonymous_id=c3ab5d5e-283f-4233-8518-0d36df9e572c"}
# output data
outs={}
outsLock=threading.Lock()
imgwidth=0
imgheight=0
# upload an image to replicate's server
def upload_image(path):
    cont=bytes()
    with open(path,"rb") as f:
        cont=f.read()
        
    name=os.path.split(path)[1] #what the name of the file is
    content_type=mimetypes.guess_type(name)[0] #mime type
        
    api_url = "https://replicate.com/api/upload/"+name.replace(" ","_") #get the api url
    res=requests.post(api_url,params={"content_type":content_type},headers=headers) #post the file type
    #returns a serving url, where the content is served, and a upload url, where you upload the image.

    serving_url=res.json()["serving_url"]  #get them
    upload_url=res.json()["upload_url"]
    #upload the image
    requests.put(upload_url,data=cont,headers={"content-type":content_type})
 # type: ignore    
    return serving_url
def do_image(mask_path,image_path,prompt,uuidp,num_outputs=1,guidence_scale=5,prompt_strength=0.8,num_inference_steps=50):        
    #upload both the mask and the image itself
    mask_url=upload_image(mask_path)
    image_url=upload_image(image_path)
    #set up the data    
    jsondata={"inputs":{"prompt":prompt,"num_outputs":num_outputs,"guidance_scale":guidence_scale,"prompt_strength":prompt_strength,"num_inference_steps":num_inference_steps,"image":image_url,"mask":mask_url}}
    #set up the prediction
    pred=requests.post("https://replicate.com/api/models/stability-ai/stable-diffusion-inpainting/versions/e5a34f913de0adc560d20e002c45ad43a80031b62caacc3d84010c6b6a64870c/predictions",headers=headers,json=jsondata)
    #get the task uuid
    task_uuid=pred.json()["uuid"]
    
    while True:
        #get the status
        resp=requests.get("https://replicate.com/api/models/stability-ai/stable-diffusion-inpainting/versions/e5a34f913de0adc560d20e002c45ad43a80031b62caacc3d84010c6b6a64870c/predictions/"+task_uuid,headers=headers)
        #if the status is equal to 'succeeded',
        if resp.json()["prediction"]["status"]=="succeeded":
            #acquire the lock
            outsLock.acquire()
            #set the output variables.
            outs[uuidp]=resp.json()["prediction"]["output"]
            #release the lock
            outsLock.release() 
            #exit
            break
        #otherwise, wait 2 seconds
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
#utility Task class
class Task:
    
    def __init__(self,thread:threading.Thread):
        self.uuid=uuid.uuid4().hex
        self.thread=thread
    def isactive(self):
        return self.thread.is_alive()
threads:List[Task]=[]
myimages:List[List[bytes]]=[]
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
        else:
            self.send_response(NOT_FOUND)
       
        self.send_header("Access-Control-Allow-Origin","*")
        self.end_headers()
       
        if self.path.startswith("/lookup"):
            self.run_lookup()
                    
        elif self.path=="/inprogress":
            self.wfile.write(bytes(json.dumps(outs),"utf-8"))
        elif self.path.startswith("/delete/"):
            self.run_delete()    
        elif self.path.startswith('/imggrid'):
            self.run_grid()
    def run_grid(self):
        x=int(self.path.split("/")[2])
        y=int(self.path.split("/")[3])
        self.wfile.write(myimages[x][y])
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
        else:
            self.send_response(NOT_FOUND)
            
        self.send_header("Access-Control-Allow-Origin","*")
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
    def run_log(self):
        content_length=int(self.headers["content-length"])
        body=self.rfile.read(content_length)
        with open("./body.txt","wb") as f:
            f.write(body)
    def run_splitimages(self):
        global myimages
        content_length=int(self.headers["content-length"])
        body=self.rfile.read(content_length)
        bodyjson=json.loads(body)
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
                # print((oldone["x"],oldone["y"],oldone["x"]+oldone["width"],oldone["y"]+oldone["height"]))
                cropped=image.crop((oldone["x"],oldone["y"],oldone["x"]+oldone["width"],oldone["y"]+oldone["height"]))
                im_file=BytesIO()
                cropped.save(im_file,format="png")
                im_bytes=im_file.getvalue()
                # im_b64="data:image:/png;base64,"+base64.b64encode(im_bytes).decode("utf-8")
                
                temp.append(im_bytes)
            images.append(temp)
        myimages=images
        # encoded=json.dumps(images).encode("utf-8")
        # print(len(encoded))
        # self.wfile.write(encoded)
        self.wfile.write(b"OK")

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
        t=threading.Thread(target=do_image,args=("./mask.png","./image.png",prompt,uuid_new),kwargs=l)
        t.start()
                        
        ts=Task(t)
        ts.uuid=uuid_new
        threads.append(ts)
            
        taskPoolIDS.append(ts.uuid)
        
        self.wfile.write(bytes(ts.uuid,"utf-8"))
        # print(ts.uuid)
                
if __name__ == "__main__":        
    webServer = ThreadingHTTPServer((hostName, serverPort), ReqHandler)
    print("Server started http://%s:%s" % (hostName, serverPort))
    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
