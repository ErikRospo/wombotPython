import time
import os
import threading
cmd="python3 run.py"
c=0
wasError=False
tnum=5
def run_prog():
    res=os.system(cmd)
    if res!=0:
        global wasError
        wasError=True
        print("Error:"+str(res))
while not wasError:
    ts=[]
    for i in range(0,tnum):
        t=threading.Thread(target=run_prog)
        ts.append(t)
    for i in range(0,tnum):
        ts[i].start()
        time.sleep(2)
    for i in range(0,tnum):
        ts[i].join()
    c+=tnum

print("DONE")
print("Ran "+str(c)+" times")