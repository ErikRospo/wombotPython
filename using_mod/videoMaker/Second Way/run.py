#!/usr/bin/python3
import os, time,json
import time_estimator
import datetime
et,mat,mit=time_estimator.calculate_expected_time()
exhours=int((et)/3600)
exminutes=int(((et)%3600)/60)
exseconds=int(((et)%3600)%60)
tlq=not json.load(open("settings.json","r"))["tlq"]
if tlq:
    print(f"expected time: {exhours}h {exminutes}m {exseconds}s")
    print(f"et: {et} etm:{et/60} eth:{et/3600}")
st=time.time()
excomp=datetime.datetime.fromtimestamp(time.time()+et).strftime('%Y-%m-%d %I:%M:%S %p')
excompmi=datetime.datetime.fromtimestamp(time.time()+mit).strftime('%Y-%m-%d %I:%M:%S %p')
excompma=datetime.datetime.fromtimestamp(time.time()+mat).strftime('%Y-%m-%d %I:%M:%S %p')
if tlq:
    print(f"expected completion:       {excomp}")
    print(f"overestimated completion:  {excompma}")
    print(f"underestimated completion: {excompmi}")

start=time.time()
res=os.system("node main.js")
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
    if tlq:
        print("Time taken for main.js: "+str(hours)+" hours "+str(minutes)+" minutes "+str(seconds)+" seconds")
        print("Time taken for main.js: "+str(end-start)+" seconds")
        print("Time taken for main.js: "+str((end-start)/60)+" minutes")

    if res1==0:
        mvhours=int((end_make_video-start_make_video)/3600)
        mvminutes=int(((end_make_video-start_make_video)%3600)/60)
        mvseconds=int(((end_make_video-start_make_video)%3600)%60)
        if tlq:
            print("Time taken for make_video.py: "+str(mvhours)+" hours "+str(mvminutes)+" minutes "+str(mvseconds)+" seconds")
            print("Time taken for make_video.py: "+str(end_make_video-start_make_video)+" seconds")
            print("Time taken for make_video.py: "+str((end_make_video-start_make_video)/60)+" minutes")
        tts=(end_make_video-start_make_video)+(end-start)
        tthours=int(tts/3600)
        ttminutes=int((tts%3600)/60)
        ttseconds=int((tts%3600)%60)
        if tlq:
            print("Total time taken: "+str(tthours)+" hours "+str(ttminutes)+" minutes "+str(ttseconds)+" seconds")
            print("Total time taken: "+str(tts)+" seconds")
            print("Total time taken: "+str(tts/60)+" minutes")
        terr=time.time()-st+et
        miterr=time.time()-st+mit
        materr=time.time()-st+mat
        terrhours=int(terr/3600)
        terrminutes=int((terr%3600)/60)
        terrseconds=int((terr%3600)%60)
        miterrhours=int(miterr/3600)
        miterrminutes=int((miterr%3600)/60)
        miterrseconds=int((miterr%3600)%60)
        materrhours=int(materr/3600)
        materrminutes=int((materr%3600)/60)
        materrseconds=int((materr%3600)%60)
        if tlq:
            print("Time error (Actual):  "+str(terrhours)+" hours "+str(terrminutes)+" minutes "+str(terrseconds)+" seconds")
            print("Time error (Maximum): "+str(miterrhours)+" hours "+str(miterrminutes)+" minutes "+str(miterrseconds)+" seconds")
            print("Time error (Minumim): "+str(materrhours)+" hours "+str(materrminutes)+" minutes "+str(materrseconds)+" seconds")
        with open("./benchmarks.csv","at") as f:
            TimeSeconds = end-start
            TimeSecondsMKV=end_make_video-start_make_video
            TotalTime=TimeSeconds+TimeSecondsMKV
            csvLine = str(lines)+','+str(TimeSeconds)+','+str(TimeSecondsMKV)+','+str(et)+","+str(TotalTime-et)+","+str(TotalTime)+"\n"
            f.write(csvLine)
    else:
        print("Error in make_video.py")
        with open("./benchmarks.csv","at") as f:
            f.write(str(lines)+','+str(end-start)+',err,err,err,'+str((end-start))+"\n")
elif res==2:
    print("Canceled")
else:
    print("Error in main.js " +str(res))
