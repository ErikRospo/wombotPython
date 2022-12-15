import mockup_request,requests

resp=mockup_request.run("./mask.jpg","./image.jpg","The end of the world")
with open("out.jpg","wb") as f:
    f.write(requests.get(resp[0]).content)
print(resp)