#!/usr/bin/python3
import os, time,json
import time_estimator
et=round(time_estimator.calculate_expected_time(),3)
exhours=int((et)/3600)
exminutes=int(((et)%3600)/60)
exseconds=int(((et)%3600)%60)
print(f"expected time: {exhours}h {exminutes}m {exseconds}s")
print(f"et: {et} etm:{et/60} eth:{et/3600}")
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
            TimeSeconds = end-start
            TimeSecondsMKV=end_make_video-start_make_video
            TotalTime=TimeSeconds+TimeSecondsMKV
            csvLine = "\n"+str(lines)+','+str(TimeSeconds)+','+str(TimeSecondsMKV)+','+str(et)+","+str(TotalTime-et)+","+str(TotalTime)
            f.write(csvLine)
    else:
        print("Error in make_video.py")
        with open("./benchmarks.csv","at") as f:
            f.write("\n"+str(lines)+','+str(end-start)+',err,err,err'+str((end-start)))
elif res==2:
    print("Canceled")
else:
    print("Error in main.js " +str(res))