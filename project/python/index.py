import json
import re
import rest
import identify
import download
# sfrom os import path, mkdir
import os
true=True
false=False
paint_rest=rest.Rest("paint.api.wombo.ai",100)
def task(prompt,style,update_fn,settings):
    final, inter,identify_key,download_dir=settings
    if final!=true or final!=false:
        final=true
    if inter!=true or inter!=false:
        inter=false
    if not download_dir:
        download_dir="./generated/"
    if final or inter:
        os.makedirs(download_dir,exist_ok=True)
    id_=""
    try:
        id_=identify.identify(identify_key)
    except:
        raise Exception("Error while sending prompt\n")
    paint_rest.custom_headers={
        "Authorization":"bearer "+id_,
        "Origin": "https://app.wombo.art",
        "Referer": "https://app.wombo.art/",
    }    
    update_fn(state="authenticated",id=id_)
    
    task=""
    try:
        print("Sending prompt...")
        paint_rest.options("/api/tasks","POST")
        print("Not sent yet")
        task=paint_rest.post("/api/tasks",{"premium":false})
        print("Sent")
        print(task)
    except:
        raise Exception("Error while allocating a new task")
    
    task_path="/api/tasks"+task["id"]
    
    update_fn(status="allocated",id=id_,task=task)
    #TODO:Rest of stuff
    try:
        paint_rest.options(task_path,'PUT')
        task=paint_rest.put(task_path,json.loads("{input_spec: {display_freq: 10,prompt:{},style: {},}}".format(prompt,style))).json()
    except:
        raise Exception("error while sending prompt")
        
    update_fn(status="submitted",id=id_,task=task)
    
    inter_downloads=[]
    inter_paths=[]
    inter_finished=[]
    while (not task.result):
        try:
            task=paint_rest.get(task_path,method="GET")
        except:
            raise Exception ("error while fetching update")
        if (task.state=="pending"):
            print("warning, Task is pending")
        if (inter):
            for n in range(len(task.photo_url_list)):
                if inter_downloads[n] or re.compile("/\/final\.je?pg",re.I).match(task.photo_url_list[n]):
                    continue
                inter_paths[n]=os.path.join(download_dir,"{task.id}-{n}.jpg")
                inter_downloads[n]=download(task.photo_url-list[n],inter_paths[n])
                update_fn(state="progress",id=id_,task=task,inter=inter_finished)
    update_fn(state="generated",id=id_,task=task,url=task.result.final,inter=inter_finished)
    
    download_path=os.path.join(download_dir,"{task.id}-final.jpg")
    try:
        if (final):
            download(task.result.final,download_path)
        if (inter):
            for n in range(len(inter_downloads)):
                download(inter_downloads[n])
    except:
        raise Exception("Error while downloading results")
    
    update_fn(state="downloaded",id=id_,task=task,url=task.result.final,path=download_path,inter=inter_finished)
    return {"state":"downloaded",'id':id_,'task':task,'url':task.result.final,'path':download_path,'inter':inter_finished}