import time
import os
import threading
cmd="python3 run.py"
c=0
wasError=False
tnum=8
def run_prog():
    res=os.system(cmd)
    if res!=0:
        global wasError
        wasError=True
        print("Error:"+str(res))
if __name__=="__main__":
    s=time.time_ns()
    while not wasError:
        ts=[]
        for i in range(0,tnum):
            t=threading.Thread(target=run_prog)
            ts.append(t)
        for i in range(0,tnum):
            ts[i].start()
            time.sleep(120)
        for i in range(0,tnum):
            ts[i].join()
        c+=tnum
    e=time.time_ns()
    dur_ns=e-s
    dur=dur_ns/10**9

    print("DONE")
    print("Ran "+str(c)+" times")
    exhours=int((dur)/3600)
    exminutes=int(((dur)%3600)/60)
    exseconds=int(((dur)%3600)%60)
    print(f"Over: {exhours}h {exminutes}m {exseconds}s")

def run(threads, times):
    c=0
    for n in range(times):
        ts=[]
        for i in range(0,threads):
            t=threading.Thread(target=run_prog)
            t.daemon=True
            ts.append(t)

        for i in range(0,threads):
            try:
                ts[i].start()
                time.sleep(8)
            except KeyboardInterrupt:
                exit()
        for i in range(0,threads):
            ts[i].join()
        
        c+=threads
        print(f"{n}/{times}")
        print(f"{c}/{times*threads}")
        print(f"{c/(times*threads)*100}%")
    print("DONE")