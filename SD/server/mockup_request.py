import requests,os,mimetypes,time
headers={"x-csrftoken":"rfU9sNVa303QtGhGx9jq1AemDXfoTxpV","origin":"https://replicate.com","referer":"https://replicate.com/stability-ai/stable-diffusion-inpainting","cookie":"csrftoken=rfU9sNVa303QtGhGx9jq1AemDXfoTxpV; replicate_anonymous_id=c3ab5d5e-283f-4233-8518-0d36df9e572c"}

def upload_image(path):
    cont=bytes()
    with open(path,"rb") as f:
        cont=f.read()
    name=os.path.split(path)[1]
    content_type=mimetypes.guess_type(name)[0]
    api_url = "https://replicate.com/api/upload/"+name.replace(" ","_")
    res=requests.post(api_url,params={"content_type":content_type},headers=headers)
    serving_url=res.json()["serving_url"]
    upload_url=res.json()["upload_url"]
    resp=requests.put(upload_url,data=cont,headers={"content-type":content_type})
    return serving_url
def run(mask_path,image_path,prompt,num_outputs=1,guidence_scale=5,prompt_strength=0.8,num_inference_steps=50):        
    mask_url=upload_image(mask_path)
    image_url=upload_image(image_path)
    jsondata={"inputs":{"prompt":prompt,"num_outputs":num_outputs,"guidance_scale":guidence_scale,"prompt_strength":prompt_strength,"num_inference_steps":num_inference_steps,"image":image_url,"mask":mask_url}}
    pred=requests.post("https://replicate.com/api/models/stability-ai/stable-diffusion-inpainting/versions/e5a34f913de0adc560d20e002c45ad43a80031b62caacc3d84010c6b6a64870c/predictions",headers=headers,json=jsondata)
    task_uuid=pred.json()["uuid"]
    while True:
        resp=requests.get("https://replicate.com/api/models/stability-ai/stable-diffusion-inpainting/versions/e5a34f913de0adc560d20e002c45ad43a80031b62caacc3d84010c6b6a64870c/predictions/"+task_uuid,headers=headers)
        if resp.json()["prediction"]["status"]=="succeeded":
            return resp.json()["prediction"]["output"]
        time.sleep(2)
    # print("Done")