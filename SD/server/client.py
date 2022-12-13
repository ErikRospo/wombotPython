import requests,time
url="http://localhost:8080"
print("posting to "+url+"/new")
resp=requests.post(url+"/new",json={"prompt":"test","mask":"./image.jpg","image":"./mask.jpg"})
print("posted to "+url+"/new")
print(resp.text)
uuid=resp.text

sp2=requests.post(url+"/lookup/"+uuid)
print("posted to "+url+"/lookup/"+uuid)


    