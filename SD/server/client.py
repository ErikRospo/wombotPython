import requests,time
url="http://localhost:8080"
print("posting to "+url+"/new")
resp=requests.post(url+"/new",json={"prompt":"test","mask":"./image.jpg","image":"./mask.jpg"})
print("posted to "+url+"/new")
print(resp.text)
uuid=resp.text

sp2=requests.post(url+"/lookup/"+uuid)
print("posted to "+url+"/lookup/"+uuid)

print(sp2.text)
while True:
    print("getting "+url+"/lookup/"+uuid)
    
    sp2=requests.get(url+"/lookup/"+uuid)
    print("got "+url+"/lookup/"+uuid)

    print(sp2.text)
    if sp2.text!="TASK_IN_PROGRESS":
        break
    time.sleep(2)
print(sp2.text)
    