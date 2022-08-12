#!/usr/bin/python
import os, time,json

start=time.time()
res=os.system("node main.js");
end=time.time()
if res==0:
    with open("path.txt") as f:
        path=f.read()
    json_data=open(path).read()
    data = json.loads(json_data)['responses']
    paths=[]
    for i in range(len(data)):
        paths.append(data[str(i)]["path"])
    lines=len(paths)
    start_make_video=time.time()
    res1=os.system("python3 make_video.py")
    end_make_video=time.time()
    hours=int((end-start)/3600)
    minutes=int(((end-start)%3600)/60)
    seconds=int(((end-start)%3600)%60)
    print("Time taken for main.js: "+str(hours)+" hours "+str(minutes)+" minutes "+str(seconds)+" seconds")
    print("Time taken for main.js: "+str(end-start)+" seconds")
    print("Time taken for main.js: "+str((end-start)/60)+" minutes")

    if res1==0:
        mvhours=int((end_make_video-start_make_video)/3600)
        mvminutes=int(((end_make_video-start_make_video)%3600)/60)
        mvseconds=int(((end_make_video-start_make_video)%3600)%60)
        print("Time taken for make_video.py: "+str(mvhours)+" hours "+str(mvminutes)+" minutes "+str(mvseconds)+" seconds")
        print("Time taken for make_video.py: "+str(end_make_video-start_make_video)+" seconds")
        print("Time taken for make_video.py: "+str((end_make_video-start_make_video)/60)+" minutes")

        with open("./benchmarks.csv","at") as f:
            f.write("\n"+str(lines)+','+str(end-start)+','+str(end_make_video-start_make_video)+','+str((end-start)+(end_make_video-start_make_video)))
    else:
        print("Error in make_video.py")
        with open("./benchmarks.csv","at") as f:
            f.write("\n"+str(lines)+','+str(end-start)+',err,'+str((end-start)))
else:
    print("Error in main.js")
    