import glob
import hashlib
import json
import os

a=glob.glob("./songs/*.lrc")

for n in range(len(a)):
    with open(a[n],"rt") as mf:
        fc=mf.read()
        with open("settings.json","rt") as f:
            s=json.load(f)
        with open("settings.json","wt") as f:
            s["samplePath"]=a[n]
            s["outPath"]=hashlib.md5(fc.encode()).hexdigest()
            print(json.dumps(s))
            json.dump(s,f,indent=4)
        res=os.system("python3 run.py")
        if res==2:
            break
        print(res)
