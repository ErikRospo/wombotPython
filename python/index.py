import rest
import identify
import download
from os import path, mkdir
true=True
false=False
paint_res=rest.Rest("paint.api.wombo.ai",100)
def task(prompt,style,update_fn,settings):
    final, inter,identify_key,download_dir=settings
    if final!=true or final!=false:
        final=true
    if inter!=true or inter!=false:
        inter=false
    if not download_dir:
        download_dir="./generated/"
    if final or inter:
        mkdir(download_dir)
    idenifier=""
    try:
        id=identify.identify(identify_key)
    except:
        raise Exception("Error while sending prompt\n")
    custom_headers={
        "Authorization":"bearer "+id,
        "Origin": "https://app.wombo.art",
        "Referer": "https://app.wombo.art/",
    }    
    update_fn(state="authenicated",id=id)
    
    task=""
    try:
        paint_rest.options("/api/tasks","POST")
        task=paint_res.post("/api/tasks",{premium:false}).json()
    except:
        raise Exception("Error while allocating a new task")
    
    task_path="/api/tasks"+task["id"]
    
    update_fn(status="allocated",id="id",task=task)
    #TODO:Rest of stuff