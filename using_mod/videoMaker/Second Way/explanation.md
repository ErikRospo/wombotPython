# Explanation of Wombo.art video/image generation
[Back](https://erikrospo.github.io/wombotPython/)

## Table of contents
1. [Run.py](https://erikrospo.github.io/wombotPython/using_mod/videoMaker/Second%20Way/explanation#runpy)
2. [Multirun.py](https://erikrospo.github.io/wombotPython/using_mod/videoMaker/Second%20Way/explanation#multirunpy)
2. [Time_estimator.py](https://erikrospo.github.io/wombotPython/using_mod/videoMaker/Second%20Way/explanation#time_estimatorpy)
4. [Main.js](https://erikrospo.github.io/wombotPython/using_mod/videoMaker/Second%20Way/explanation#mainjs)
5. [Sequential.js](https://erikrospo.github.io/wombotPython/using_mod/videoMaker/Second%20Way/explanation#sequentialjs)
6. [Index.js](https://erikrospo.github.io/wombotPython/using_mod/videoMaker/Second%20Way/explanation#indexjs)

## run.py
this is a wrapper for all functionality of the application. It gives an estimation of the duration that a given configuration will take, and runs both the actual image generation and the video maker.  

First, I'll show the code in full, then, I'll step through it
```python
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

```

This block of code is mostly imports  

```python
#!/usr/bin/python
import os, time, json
import time_estimator
```

The first line is telling Linux (the OS) where to find Python (the language)  
The second line is some modules that are part of Python's standard library, that are included with most installations.  
Line 3 is a time estimator library I wrote.


The next block is mostly utilizing the time estimator library to provide information to the user about how long it will take.
```python
et,mat,mit=time_estimator.calculate_expected_time()
exhours=int((et)/3600)
exminutes=int(((et)%3600)/60)
exseconds=int(((et)%3600)%60)
st=time.time()
tlq=not json.load(open("settings.json","r"))["tlq"]
if tlq:
    print(f"expected time: {exhours}h {exminutes}m {exseconds}s")
    print(f"et: {et} etm:{et/60} eth:{et/3600}")

excomp=datetime.datetime.fromtimestamp(time.time()+et).strftime('%Y-%m-%d %I:%M:%S %p')
excompmi=datetime.datetime.fromtimestamp(time.time()+mit).strftime('%Y-%m-%d %I:%M:%S %p')
excompma=datetime.datetime.fromtimestamp(time.time()+mat).strftime('%Y-%m-%d %I:%M:%S %p')
if tlq:
    print(f"expected completion:       {excomp}")
    print(f"overestimated completion:  {excompma}")
    print(f"underestimated completion: {excompmi}")

```
`et` is the estimated time.  
`mit` is the minimum time it thinks it will take. this is one stddev away from `et`.  
`mat` is the maximum time it thinks it will take. like `mit`, this is one stddev away from `et`.  
most of the other code is converting the duration into actual times and dates.
We also declare `tlq`, which stands for **T**op **L**evel **Q**uiet. this silences most `print` statements
The next block is where the vast majority of the time is spent
```python
start=time.time()
res=os.system("node main.js")
end=time.time()
```
The start and end just record when the program was started, and stopped.  
The second line is basically just saying to the operating system "hey, run this in the terminal", and it returns the status code of whatever was run.  
We will get to what main.js does in a bit.   
Counter-intuitively, this status code is zero when it succeeds, and anything else means failure.   

The next block deals with the setup for making the video
```python
if res==0:
    with open("path.txt") as f:
        path=f.read()
    json_data=open(path).read()
    data = json.loads(json_data)['responses']
    paths=[]
    for i in range(len(data)):
        paths.append(data[str(i)]["path"])
    lines=len(paths)
```

The first line is checking the status code of the previous block, and making sure that the command succeeded (remember, zero means success)  
The next two lines read the contents of `path.txt` into the variable sensibly named `path`. This file gets written to by some code in `main.js`, which got run in the previous block. This is a path that points to another file, which then tells the code where to find all the images (that were generated by `main.js`).  
The next few lines do just that, they get the data from that source, and then find all the paths that that file references, and then count up the number of them, and store that in the `lines` variable


The next lines make actually make the video
```python
    start_make_video=time.time()
    res1=os.system("python3 make_video.py")
    end_make_video=time.time()
```
This is fairly similar to what happened when running `main.js`, so I'll spare you the details  

The next lines are just a bunch of number fiddling to get seconds into hours, minutes, and seconds, and displaying them
```python
    hours=int((end-start)/3600)
    minutes=int(((end-start)%3600)/60)
    seconds=int(((end-start)%3600)%60)
    if tlq:
        print("Time taken for main.js: "+str(hours)+" hours "+str(minutes)+" minutes "+str(seconds)+" seconds")
        print("Time taken for main.js: "+str(end-start)+" seconds")
        print("Time taken for main.js: "+str((end-start)/60)+" minutes")
```
again, we also silence the print statements if `tlq` is `true`

The next few lines are pretty much the same as the last block, with one exception
```python
    if res1==0:
        mvhours=int((end_make_video-start_make_video)/3600)
        mvminutes=int(((end_make_video-start_make_video)%3600)/60)
        mvseconds=int(((end_make_video-start_make_video)%3600)%60)
        if tlq:
            print("Time taken for make_video.py: "+str(mvhours)+" hours "+str(mvminutes)+" minutes "+str(mvseconds)+" seconds")
            print("Time taken for make_video.py: "+str(end_make_video-start_make_video)+" seconds")
            print("Time taken for make_video.py: "+str((end_make_video-start_make_video)/60)+" minutes")
```
The `if` statement at the top checks to make sure that the video making worked.
Note [^1]
And the next few are also the same, just with the expected time to get by how much our guess was off by.
```python
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
```
This is essentially the same as the last part, so I'll spare you the details  

The next lines are mostly about saving timing data to a file
```python
        with open("./benchmarks.csv","at") as f:
            TimeSeconds = end-start
            TimeSecondsMKV=end_make_video-start_make_video
            TotalTime=TimeSeconds+TimeSecondsMKV
            csvLine = "\n"+str(lines)+','+str(TimeSeconds)+','+str(TimeSecondsMKV)+','+str(et)+","+str(TotalTime-et)+","+str(TotalTime)+"\n"
            f.write(csvLine)
```
The first line opens up a file named `benchmarks.csv`. the `.csv` file is comma separated values. also, note the second parameter of the `open` function: `at`. this means that it will *A*ppend (add) *T*ext to the file.  
The next 3 lines are just calculating some values so the next isn't insanely long.
Then, we write the data to the file that we opened.

The final lines are just handling errors, if they occur
```python
    else:
        print("Error in make_video.py")
        with open("./benchmarks.csv","at") as f:
            f.write("\n"+str(lines)+','+str(end-start)+',err,err,err'+str((end-start))+"\n")
elif res==2:
    print("Canceled")
else:
    print("Error in main.js " +str(res))
```
The first `else` is for the making of the video. if instead of returning a `0`, it had instead returned a 1, or 2, it would print out that there was an error, and write to the timing file, just with `err` in place of anything that depends on how long the making of the video takes. 

The next line checks if the response of `main.js` was exactly 2. This is the error code of `^C`, or cancel. if it is, it just prints out `Canceled`  
Finally, the 2 lines after that handle all other error codes. simply by just saying that there was an error, and what the error was.

## multirun.py

So, `run.py` isn't actually the top level runner. This is, at least currently, the topmost level 
```python
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
                time.sleep(120)
            except KeyboardInterrupt:
                exit()
        for i in range(0,threads):
            ts[i].join()
        
        c+=threads
        print(f"{n}/{times}")
        print(f"{c}/{times*threads}")
        print(f"{c/(times*threads)*100}%")
    print("DONE")
```

This module is a bit complicated. Mostly due to it involving multi-threading. 
```python
import time
import os
import threading
```
Like the last one, we do some imports, in this case `time`, `os`, and `threading`.

We then set some variables up.
```python
cmd="python3 run.py"
c=0
wasError=False
tnum=8
```

```python
def run_prog():
    res=os.system(cmd)
    if res!=0:
        global wasError
        wasError=True
        print("Error:"+str(res))
```
In this part, we define a function, `run_prog`.  
We use `os.system` again. like i said, this tells the system to execute commands in the shell. in this case, we execute `cmd`, which is `"python3 run.py"`. This calls our `run.py` program. we also check if the response was nonzero. if it is, we change the variable `wasError` to True, and print out that there was an error.   
Next is the main thing, that actually gets run.
```python
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
 
```
we check if this is being run as the main program, and if it is, we store when it was started (in nanoseconds) in the `s` variable. then, we enter a `while` loop. what this does is repeat whatever is inside it for as long as the condition is true. in this case, the condition is that the `wasError` variable is `False`.  
```python
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
```
inside the loop, we declare a variable `ts`, and set it to an empty list. then, for `tnum` times, we create a thread with the `threading` module. A thread is another process that is a part of the parent process, which in this case is the `multirun.py` program. in this case, the new process is our `run_prog` function. Then, we put it on in the `ts` list. After we do that, we start all of the threads, and wait 120 seconds, or 2 minutes. this is to allow the processes plenty of time to finish up with their video making processes at the end, as that uses just one file for pointing the videoMaker to the correct path. This could be fixed, but that isn't my main concern right now. 
After we start all of the threads, and wait, we join them all together, this essentially waits until all of them are finished. Then, we increase `c` by the `tnum`. 


```python
    e=time.time_ns()
    dur_ns=e-s
    dur=dur_ns/10**9

    print("DONE")
    print("Ran "+str(c)+" times")
    exhours=int((dur)/3600)
    exminutes=int(((dur)%3600)/60)
    exseconds=int(((dur)%3600)%60)
    print(f"Over: {exhours}h {exminutes}m {exseconds}s")
```
Outside the loop, we set `e` to the time that we ended. then, we set `dur_ns` to the difference between `e` and `s`. this gives us our duration. however, because we used `time.time_ns`, this duration is in nanoseconds. so the next thing we need to do is to convert it back to seconds.  
After we do, we do some more fancy printing, and then finish up with the function. 

the next block is the function equivalent of the main part.
```python
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
                time.sleep(120)
            except KeyboardInterrupt:
                exit()
        for i in range(0,threads):
            ts[i].join()
        
        c+=threads
        print(f"{n}/{times}")
        print(f"{c}/{times*threads}")
        print(f"{c/(times*threads)*100}%")
    print("DONE")
```
We declare a function `run`, that takes in `threads` and `times`. we also set `c` equal to zero.
```python
def run(threads, times):
    c=0
```

```python
    for n in range(times):
        ts=[]
        for i in range(0,threads):
            t=threading.Thread(target=run_prog)
            t.daemon=True
            ts.append(t)
```
then, we enter a loop that will run `times` times, and then declare a list `ts`
we also declare `threads` threads, and add them all into the `ts` list. the main change from the previous one is that we set `t`'s `daemon` to true. I am not 100% sure what this does, but I think it will kill the threads if the main process is killed, instead of, and this will sound bad, having a child kill the parent, and leaving an orphaned child. really, programming has some ***interesting*** terms for things. recently, its shifted to `primary` and `secondary` processes, but `child` and `parent` are still used plenty.


```python
        for i in range(0,threads):
            try:
                ts[i].start()
                time.sleep(120)
            except KeyboardInterrupt:
                exit()
```
then, for each of the threads, try to start them, and if the user cancels it, we exit. for some reason, i didn't realize that `threading.Thead.daemon` would prevent it from leaving orphaned threads.

```python
        for i in range(0,threads):
            ts[i].join()
        
        c+=threads
        print(f"{n}/{times}")
        print(f"{c}/{times*threads}")
        print(f"{c/(times*threads)*100}%")
    print("DONE")
```
Like the last one, we join all of the threads, and then do some progress bar esque things, and after all `times` iterations, we print out `"DONE"`.


## time_estimator.py

This is a module that I wrote that predicts how long a given configuration will take to process, given previous data. 

Similar to the previous file, I'll show it in full, then go block by block, explaining what each part does.
```python
import csv
import datetime
import json
from math import sqrt
import time
from statistics import mean, stdev
def calculate_expected_time():
    settings=json.load(open("./settings.json","rt"))
    current_data=list(csv.reader(open("benchmarks.csv","rt").readlines()))
    with open(settings['samplePath']) as f:
        prompts=f.readlines()
        x=0
        for n in prompts:
            if len(n)>2 and "#" not in n and "[" not in n and "]" not in n:
                x+=1
        numPrompts=x
    numIterations=numPrompts*settings['times']
    current_data=current_data[1:]
    ys=[]
    xs=[]
    for n in range(len(current_data)):
        ys.append(float(current_data[n][-1]))
        xs.append(float(current_data[n][0]))

    r_upper_values=[]
    for n in range(len(current_data)):
        vx=xs[n]
        vy=ys[n]
        r_upper_values.append(((vx-mean(xs))*(vy-mean(ys))))
    r_upper=sum(r_upper_values)
    r_lower=sqrt(sum([(vx-mean(xs))**2 for vx in xs])*sum([(vy-mean(ys))**2 for vy in ys]))
    r=r_upper/r_lower
    b1=r*(stdev(ys)/stdev(xs))
    b0=mean(ys)-b1*mean(xs)
    ev=b0+b1*numIterations
    dev=stdev(ys)
    return ev,ev+dev,ev-dev
def calculate_expected_time_from_iterations(iterations):
    numIterations=iterations
    current_data=list(csv.reader(open("benchmarks.csv","rt").readlines()))
    current_data=current_data[1:]
    ys=[]
    xs=[]
    for n in range(len(current_data)):
        ys.append(float(current_data[n][-1]))
        xs.append(float(current_data[n][0]))

    r_upper_values=[]
    for n in range(len(current_data)):
        vx=xs[n]
        vy=ys[n]
        r_upper_values.append(((vx-mean(xs))*(vy-mean(ys))))
    r_upper=sum(r_upper_values)
    r_lower=sqrt(sum([(vx-mean(xs))**2 for vx in xs])*sum([(vy-mean(ys))**2 for vy in ys]))
    r=r_upper/r_lower
    b1=r*(stdev(ys)/stdev(xs))
    b0=mean(ys)-b1*mean(xs)
    ev=b0+b1*numIterations
    dev=stdev(ys)
    return ev,ev+dev,ev-dev
def print_fancy_time():
    et,mit,mat=calculate_expected_time()
    exhours=int((et)/3600)
    exminutes=int(((et)%3600)/60)
    exseconds=int(((et)%3600)%60)
    print(f"expected time: {exhours}h {exminutes}m {exseconds}s")
    print(f"et: {et} etm:{et/60} eth:{et/3600}")
    
    excomp=datetime.datetime.fromtimestamp(time.time()+et).strftime('%Y-%m-%d %I:%M:%S %p')
    excompmi=datetime.datetime.fromtimestamp(time.time()+mit).strftime('%Y-%m-%d %I:%M:%S %p')
    excompma=datetime.datetime.fromtimestamp(time.time()+mat).strftime('%Y-%m-%d %I:%M:%S %p')


    print(f"expected completion:       {excomp}")
    print(f"overestimated completion:  {excompma}")
    print(f"underestimated completion: {excompmi}")
def print_fancy_time_from_iterations(iterations):
    et,mit,mat=calculate_expected_time_from_iterations(iterations)
    exhours=int((et)/3600)
    exminutes=int(((et)%3600)/60)
    exseconds=int(((et)%3600)%60)
    print(f"expected time: {exhours}h {exminutes}m {exseconds}s")
    print(f"et: {et} etm:{et/60} eth:{et/3600}")
    
    excomp=datetime.datetime.fromtimestamp(time.time()+et).strftime('%Y-%m-%d %I:%M:%S %p')
    excompmi=datetime.datetime.fromtimestamp(time.time()+mit).strftime('%Y-%m-%d %I:%M:%S %p')
    excompma=datetime.datetime.fromtimestamp(time.time()+mat).strftime('%Y-%m-%d %I:%M:%S %p')


    print(f"expected completion:       {excomp}")
    print(f"overestimated completion:  {excompma}")
    print(f"underestimated completion: {excompmi}")

if __name__=="__main__":
    et,mat,mit=calculate_expected_time()
    exhours=int((et)/3600)
    exminutes=int(((et)%3600)/60)
    exseconds=int(((et)%3600)%60)
    print(f"expected time: {exhours}h {exminutes}m {exseconds}s")
    print(f"et: {et} etm:{et/60} eth:{et/3600}")
    
    excomp=datetime.datetime.fromtimestamp(time.time()+et).strftime('%Y-%m-%d %I:%M:%S %p')
    excompmi=datetime.datetime.fromtimestamp(time.time()+mit).strftime('%Y-%m-%d %I:%M:%S %p')
    excompma=datetime.datetime.fromtimestamp(time.time()+mat).strftime('%Y-%m-%d %I:%M:%S %p')


    print(f"expected completion:       {excomp}")
    print(f"overestimated completion:  {excompma}")
    print(f"underestimated completion: {excompmi}")

```

The first block is (like the previous one), imports 
```python
import csv
import json
from math import sqrt
import time
from statistics import mean, stdev
```
We get the comma separated values library (`csv`), the `json` library, the `sqrt` function from the `math` library, the `time` module, and the `mean` and `stdev` functions from the `statistics` module  


The next block is a bit different, both in content and structure from the previous file.  
```python 
def calculate_expected_time():
    settings=json.load(open("./settings.json","rt"))
    current_data=list(csv.reader(open("benchmarks.csv","rt").readlines()))
    with open(settings['samplePath']) as f:
        prompts=f.readlines()
        x=0
        for n in prompts:
            if len(n)>2 and "#" not in n and "[" not in n and "]" not in n:
                x+=1
```
The first line is defining a function that will be called `calculate_expected_time`. This is what gets called in `run.py`, to get the expected time.  
the second and third lines are opening the `settings.json` and the `benchmarks.csv` files, and reading them into the `settings` and `current_data` variables respectively.  
The next block opens a file that's path is defined in the `settings.json` file, from the key `samplePath`. this contains the prompts that will be fed into the generator. Then, we read the file (line by line) into the `prompts` variable, and define `x` to be zero.  
Then, for each prompt in the prompts, we check if its length is greater than 2, it doesn't have a `#`, and that it does not have a `[` nor a `]`. If all of those conditions are met, we increment x by one.  
Stepping through the conditions, we can get a better idea of what it is trying to exclude.
- Making sure that the length is greater than two ensures that no blank lines are included in the count.[^2]
- Making sure that it doesn't include a `#` means we can easily exclude lines, just by putting a `#` in them.
- The last two work in parallel, as most lyrics websites put a block of text denoting choruses, exits and more in square brackets. this filters those out.[^3]  

I could add more restrictions, or less, but i find that this strikes a balance between restrictiveness, and freedom.

The next block is a continuation of the last
```python
        numPrompts=x
    numIterations=numPrompts*settings['times']
    current_data=current_data[1:]
```
this, after going through all of the lines of text, and filtering them out, sets a variable named `numPrompts` to the number of valid prompts, that didn't get filtered out. then, it sets `numIterations` to the `numPrompts` times whatever is in the `times` key of `settings`.  
The next line sets `current_data` equal to whatever is in current_data, except the first line. this just excludes the header data, that would almost certainly cause some issues with further code.
 
the next block is getting some variable set up
```python
    ys=[]
    xs=[]
    for n in range(len(current_data)):
        ys.append(float(current_data[n][-1]))
        xs.append(float(current_data[n][0]))
```
we set `ys` and `xs` to empty arrays.
then, for each item in our `current_data`, we put the last item into `ys`, and the first item into `xs`. so, in the format that we save them in, `xs` ends up being the number of iterations, and `ys` is the time it took to do those iterations.

the next block is where most of the magic actually happens. this is where we calculate how long it will take to do a given number of iterations

```python
    r_upper_values=[]
    for n in range(len(current_data)):
        vx=xs[n]
        vy=ys[n]
        r_upper_values.append(((vx-mean(xs))*(vy-mean(ys))))
    r_upper=sum(r_upper_values)
    r_lower=sqrt(sum([(vx-mean(xs))**2 for vx in xs])*sum([(vy-mean(ys))**2 for vy in ys]))
    r=r_upper/r_lower
    b1=r*(stdev(ys)/stdev(xs))
    b0=mean(ys)-b1*mean(xs)
    ev=b0+b1*numIterations
    dev=stdev(ys)
```
And, as you might expect, it's kind of a mess. 
the first thing we do is declare an empty array called `r_upper_values`. then, for each item in our current data, we put the x value, minus the mean of all of the other values,times the y value, minus the mean of all of the other values.  
After that, we set `r_upper` equal to the sum of all those values.  
Then, we set `r_lower` to ...
The sqrt of the sum of `vx` minus mean of `xs` squared, for each value of `vx` in `xs`, squared, times the sum of `vy` minus the mean of `ys`, for each value of `vy` in `ys`, squared.  

Then, after that mess, we set `r` equal to `r_upper` over `r_lower`. 
Also, `r` isn't actually our slope, or our y intercept, that's just essentially how correlated our data is, and in what direction.  
So, `b1` is the `stdev` of `ys` over the `stdev` of `xs`, times `r`. This is the only time we use `r`.  
`b0` is the mean of `ys`, minus `b1` times the mean of `xs`
after all of this, we finally have our slope and y-intercept. so, we can just set `ev` equal to `b0+b1*numIterations`. this is our expected value.

We could just return that immediately, but instead, we calculate the `stdev` of our data, and return our expected value `ev`, an upper bound `ev+dev`, and a lower bound `ev-dev`.

The next block mostly the same as the last one, just that it doesn't load the iterations from the `settings.json` file, and instead loads it from a parameter of the function.  

```python
def calculate_expected_time_from_iterations(iterations):
    numIterations=iterations
    current_data=list(csv.reader(open("benchmarks.csv","rt").readlines()))
    current_data=current_data[1:]
    ys=[]
    xs=[]
    for n in range(len(current_data)):
        ys.append(float(current_data[n][-1]))
        xs.append(float(current_data[n][0]))

    r_upper_values=[]
    for n in range(len(current_data)):
        vx=xs[n]
        vy=ys[n]
        r_upper_values.append(((vx-mean(xs))*(vy-mean(ys))))
    r_upper=sum(r_upper_values)
    r_lower=sqrt(sum([(vx-mean(xs))**2 for vx in xs])*sum([(vy-mean(ys))**2 for vy in ys]))
    r=r_upper/r_lower
    b1=r*(stdev(ys)/stdev(xs))
    b0=mean(ys)-b1*mean(xs)
    ev=b0+b1*numIterations
    dev=stdev(ys)
    return ev,ev+dev,ev-dev
```

The next block is to print out the iterations in a fancier way. right now, we just print out the number of seconds that it will take to complete. However, we aren't really good at looking at a number of seconds, and determining how long that is.  
So, I made it so that it prints out some more information about how long it will take.


```python
def print_fancy_time():
    et,mit,mat=calculate_expected_time()
    exhours=int((et)/3600)
    exminutes=int(((et)%3600)/60)
    exseconds=int(((et)%3600)%60)
    print(f"expected time: {exhours}h {exminutes}m {exseconds}s")
    print(f"et: {et} etm:{et/60} eth:{et/3600}")
    
    excomp=datetime.datetime.fromtimestamp(time.time()+et).strftime('%Y-%m-%d %I:%M:%S %p')
    excompmi=datetime.datetime.fromtimestamp(time.time()+mit).strftime('%Y-%m-%d %I:%M:%S %p')
    excompma=datetime.datetime.fromtimestamp(time.time()+mat).strftime('%Y-%m-%d %I:%M:%S %p')


    print(f"expected completion:       {excomp}")
    print(f"overestimated completion:  {excompma}")
    print(f"underestimated completion: {excompmi}")
```
We declare a `print_fancy_time` function, and inside it, we calculate the expected time, minimum time, and maximum time. we assign them to the `et`, `mit`, and `mat` variables. We calculate the expected time in minutes, seconds, and hours, and print that out. we also print out *exactly* how long in hours, minutes, and seconds it will take.  

For brevity, I will only go over this once, as it is mostly the same for all three.  

We use the `et` as an offset of time from `time.time()`, which just returns the number of seconds since January 1st, 1970[^5]. We then convert that into Years, Months, Days, separated by "`-`", and then Hours, Minutes, Seconds, and then the time zone. `strftime` is **str**ing **f**ormat **time**.  
Again, like I said, it is essentially the same for the next two lines, but with different variables.  
After that, we just print out all of the variables.

The next block is mostly the same as the last.
```python
def print_fancy_time_from_iterations(iterations):
    et,mit,mat=calculate_expected_time_from_iterations(iterations)
    exhours=int((et)/3600)
    exminutes=int(((et)%3600)/60)
    exseconds=int(((et)%3600)%60)
    print(f"expected time: {exhours}h {exminutes}m {exseconds}s")
    print(f"et: {et} etm:{et/60} eth:{et/3600}")
    
    excomp=datetime.datetime.fromtimestamp(time.time()+et).strftime('%Y-%m-%d %I:%M:%S %p')
    excompmi=datetime.datetime.fromtimestamp(time.time()+mit).strftime('%Y-%m-%d %I:%M:%S %p')
    excompma=datetime.datetime.fromtimestamp(time.time()+mat).strftime('%Y-%m-%d %I:%M:%S %p')


    print(f"expected completion:       {excomp}")
    print(f"overestimated completion:  {excompma}")
    print(f"underestimated completion: {excompmi}")
```
In this case, instead of using the `settings.json`, and the `calculate_expected_time` function, we pass it in the `iterations`, and use the `calculate_expected_time_from_iterations` function. Everything is essentially the same, so I won't repeat myself. 

the final block is essentially what happens in `run.py`, but I'll go over it again.
```python
if __name__=="__main__":
    et,mat,mit=calculate_expected_time()
    exhours=int((et)/3600)
    exminutes=int(((et)%3600)/60)
    exseconds=int(((et)%3600)%60)
    print(f"expected time: {exhours}h {exminutes}m {exseconds}s")
    print(f"et: {et} etm:{et/60} eth:{et/3600}")
    excomp=str(time.ctime(time.time()+et))
    excompmi=str(time.ctime(time.time()+mit))
    excompma=str(time.ctime(time.time()+mat))
    print(f"expected completion:       {excomp}")
    print(f"overestimated completion:  {excompma}")
    print(f"underestimated completion: {excompmi}")
```
the first line checks if this is being run by itself, and is not being `import`ed by another module.
the next few lines get an estimation of the end time, and print it out.

So, as far as complexity, this one is not insane, but does have some significant math involved with it, such as linear forecasting.  
## main.js  
Again, like the last one, I'll show the code in full, then I'll step through it.
```js
#!/home/erik/.nvm/versions/node/v18.7.0/bin/node
const sequential = require("./sequential.js");
const fs = require("fs");
const path = require("path");
const settings=JSON.parse(fs.readFileSync("./settings.json", "utf8"));
let samplesArray = fs
    .readFileSync(settings.samplePath)
    .toString()
    .replace("\r\n", "\n")
    .split("\n")
    .filter((v) => {
        return v.length>2;
    }).filter((v) => {
        return (v.indexOf("#")===-1)&(v.indexOf("[")===-1)&(v.indexOf("]")===-1);
    });
if (settings.logPrompts) console.log(samplesArray);
const style = settings.style;

(async function() {
    let start=Date.now();
    let dir=path.resolve(`./generated/${Date.now()}`);
    fs.mkdirSync(dir, { recursive: true });
    sequential.generateLaggySequential(samplesArray,style,settings.times,settings.weighting,dir,false).then((v) => {
        // console.log(v);
        let end=Date.now();
        console.log(`Finished in ${(end-start)/1000} seconds`);
        let r={
            "responses":v,
            "settings":settings,
            "timeStart":start,
            "timeEnd":end,
            "timeTotal":end-start,
            "timeSeconds":(end-start)/1000,
            "timePerSample":(end-start)/v.length
        };
        fs.writeFileSync(`${dir}/final.json`,JSON.stringify(r));
        fs.writeFileSync("path.txt",path.resolve(`${dir}/final.json`));
    }).catch((err) => {
        console.log(err);
    }).finally(() => {
        console.log("Done");
    });
})();
```


So, the first part, like the Python ones, is imports, and telling the OS where to find the executable for this.
```js
#!/home/erik/.nvm/versions/node/v18.7.0/bin/node
const sequential = require("./sequential.js");
const fs = require("fs");
const path = require("path");
const settings=JSON.parse(fs.readFileSync("./settings.json", "utf8"));
```

however, this one looks a lot different than the previous two. this is because this is JavaScript, and the last few were Python. This is one thing that I didn't love doing, as it can be kind of confusing. We get the `sequential.js` module, that we wrote, as well as the builtin `fs` (file system) and `path` (file path) modules. we also get the settings from our `settings.json` file.  

the next few lines are essentially the same as what we did in Python to load in the prompts.
```js
let samplesArray = fs
    .readFileSync(settings.samplePath)
    .toString()
    .replace("\r\n", "\n")
    .split("\n")
    .filter((v) => {
        return v.length>2;
    }).filter((v) => {
        return (v.indexOf("#")===-1)&(v.indexOf("[")===-1)&(v.indexOf("]")===-1);
    });
```

The first line essentially declares a variable named `samplesArray`. We then read from a path, that is given from our `settings.json` file, that we have loaded in the previous block. we turn it into a string, as `fs.readFileSync` returns an array of bytes, so we have to convert that to a string. The next line is replacing `\r\n` with `\n` (Details[^2]). Then, we split the file on each newline, and filter for everything with a length greater than 2 (again, more details[^2]). Then, we filter for everything that doesn't have a `#`, a `[`, or a `]`. I talked about the reason for this in `time_estimator.py`, so I won't repeat myself.  

the next 2 lines aren't that exciting.
```js
if (settings.logPrompts) console.log(samplesArray);
const style = settings.style;
```
we log `samplesArray` if `logPrompts` from `settings` is `true`. We also set `style` to the corresponding value in `settings`  

However, the next few lines have a lot going on in them.
```js
(async function() {
    let start=Date.now();
    let dir=path.resolve(`./generated/${Date.now()}`);
    fs.mkdirSync(dir, { recursive: true });
```
The first line essentially is JavaScript's way of declaring a function. `def` was Python's, if you don't remember, because I never told you.
Then, we get the time when it starts on the next line, and after that, we get the *absolute* path of `./generated/` and the time together.
The difference between **absolute** and **Relative** paths is that absolute paths go from the root of the file system (Think C:/path/to/file/here) while relative paths are from a specified starting directory (think path/to/file/here). we have to do this because JavaScript, and the `fs` module are kind of *interesting* when it comes to relative paths.  
After that long tangent, the next line actually makes those directories, if they don't exist. the `{recursive:true}` means that if `generated/`+*time* doesn't exist, it will first create `generated`, then the *time* directory. However, if the `generated` directory does exist, it will just create the *time* directory. 


the next line is where most of the complexity and time is spent in this file. 
```js
    sequential.generateLaggySequential(samplesArray,style,settings.times,settings.weighting,dir,false).then((v) => {
```
from the `sequential` module, we call the function `generateLaggySequential`, with the arguments `samplesArray`, `style`, `settings.times`, `settings.weighting`, `dir`, and `false`. then, ***after that finishes***, we go on to the next lines. see, normally, JavaScript goes on to the next line as soon as possible, but in this case, we need the result of the function to continue, so we wait for it to finish.
I'll talk about what the arguments to the function *are* now, but I'll talk about what they *do* in the section for `sequential.js`. 
1. The `samplesArray` is the lyrics loaded from the prompt file. 
2. The `style` is loaded from the `settings.json` file.
3. The `settings.times` is also loaded from the `settings.json` file.
4. The `settings.weighting` is, as you might guess, also loaded from the `settings.json` file.
5. The `dir` is gotten from the absolute path of `./generated` and *time* together.
6. `false` is a language keyword.


the next lines are mostly for finishing up with the function. 
```js
        // console.log(v);
        let end=Date.now();
        console.log(`Finished in ${(end-start)/1000} seconds`);
        let r={
            "responses":v,
            "settings":settings,
            "timeStart":start,
            "timeEnd":end,
            "timeTotal":end-start,
            "timeSeconds":(end-start)/1000,
            "timePerSample":(end-start)/v.length
        };
```
The first line is a comment. This means that it won't actually be executed by JavaScript.  
The next line gets the endpoint of the function, and the line after that gets how long that took in total. Essentially, it takes the end time minus the start time, and because that is in milliseconds, divides it by 1000 to get the number in seconds. Then, it prints it out, with some formatting.

The next few lines declare an object with some info about how it was run. this includes the object that was returned by the `generateLaggySequential`, once it had finished, the settings that were used, the start and end times, the total time, the total time in seconds (remember, `end` and `start` are in milliseconds), and the time per sample.

the next few lines are writing the data out to a file, and handling errors and stuff.
```js
        fs.writeFileSync(`${dir}/final.json`,JSON.stringify(r));
        fs.writeFileSync("path.txt",path.resolve(`${dir}/final.json`));
    }).catch((err) => {
        console.log(err);
    }).finally(() => {
        console.log("Done");
    });
})();
```
The first line is writing the object we declared out to a file, as a string.   
The next line is writing the path to that file to a file called `path.txt`  
This means that we don't have to guess during the video making process which files to use, and in which order.   
Then, the next five lines are just handling errors, and outputting when we are done.  
The final line is executing the function we declared. this kind of function is known as a `IIFE` which stands for an **I**mmediately **I**nvoked **F**unction **E**xpression.



## Sequential.js
Moving on to `sequential.js`.
```js
/* eslint-disable no-constant-condition */
const { task } = require("./index.js");
const styles = require("./styles.js");
const fs = require("fs");
const settings=require("./settings.js");
const colors=require("./colors");

const quiet=settings.quiet||false;
const inter=settings.inter||false;
const final=true;
async function generate(
    prompt,
    style,
    prefix,
    inputImage = false,
    downloadDir = "./generated",
    iteration_ = 0
) {
    let waited=0;
    function handler(data, prefix) {
        switch (data.state) {
        case "authenticated":
            if (!quiet) colors.printGreen(`${prefix}Authenticated`);
            break;
        case "allocated":
            if (!quiet) colors.printBlue(`${prefix}Allocated`);
            break;
        case "submitted":
            if (!quiet) colors.printGreen(`${prefix}Submitted`);
            break;
        case "progress":
            // eslint-disable-next-line no-case-declarations
            let progress = data.task.photo_url_list.length;
            if (progress != 0) {
                if (!quiet)
                    colors.printYellow(
                        `${prefix}Submitted (${
                            data.task.photo_url_list.length
                        }/${styles.steps.get(style)})`
                    );
            } else {
                waited++;
                if (!quiet){ 
                    if (waited<10){
                        colors.printRed(`${prefix}Waiting ${waited}`);
                
                    } else {
                        colors.printAlert(`${prefix}Waiting ${waited}`);
                    
                    }
                }
            }
            break;
        case "generated":
            if (!quiet) colors.printGreen(`${prefix}Generated`);
            break;
        case "downloaded":
            if (!quiet) colors.printBlue(`${prefix}Downloaded`);
            break;
        }
    }

    let res = await task(
        prompt,
        style,
        (data) => handler(data, prefix),
        { final, inter, downloadDir },
        inputImage,
        iteration_,
        prefix
    );

    return res;
}
async function generateLaggySequential(
    prompts,
    style,
    times,
    weighting,
    directory = Date.now(),
    inputImage = false
) {
    
    let lastImage = {};
    if (inputImage) {
        lastImage = inputImage;
    }
    let images={};
    for (let n=0;n<prompts.length;n++) {
        let prompt=prompts[n];
        for (let i=0;i<times;i++){
            
            let imgID=(i+times*n);
            let imageIndex=Math.max(imgID-weighting,0);
            
            let prefix = `${imgID + 1}/${(times) * (prompts.length)}: `;
            let res=await generate(
                prompt,
                style,
                prefix,
                lastImage,
                `${directory}/${imgID}`
            );
            
            images[imgID]={
                "res":res,
                "imageIndex":imageIndex,
                "prompt":prompt,
                "style":style,
                "weighting":weighting,
                "directory":directory,
                "path":res.path
            };
            lastImage={
                // eslint-disable-next-line camelcase
                input_image:fs.readFileSync(images[imageIndex].path).toString("base64"),
                // eslint-disable-next-line camelcase
                media_suffix:"jpeg",
                // eslint-disable-next-line camelcase
                image_weight:"HIGH"
            };
        }
    }
    return images;
}

module.exports.generate = generate;
module.exports.generateLaggySequential = generateLaggySequential;
```

So, the first few lines, like the last, are imports.
```js
/* eslint-disable no-constant-condition */
const { task } = require("./index.js");
const styles = require("./styles.js");
const fs = require("fs");
const settings=require("./settings.js");
const colors=require("./colors");

```
We get the `task` function from `index.js`, the `styles` module from `style.js`, the `fs` module, which is a builtin, the `settings` module from the `settings.js`, and the `colors` module from `colors.js`.  
The comment at the top essentially tells `eslint` to not check for the rule `no-constant-condition`. `eslint` helps maintain code quality and conventions.  

The next few lines are getting settings from `settings`
```js
const quiet=settings.quiet||false;
const inter=settings.inter||false;
const final=true;
```
We get `quiet` from `settings.quiet`, or if that is not set, `false`. Similarly, we get `inter` from `settings.inter`, or if that isn't set, it defaults to `false`. However, we just set `final` to `true`, as it doesn't work otherwise.  

The next part is declaring a function
```js
async function generate(
    prompt,
    style,
    prefix,
    inputImage = false,
    downloadDir = "./generated",
    iteration_ = 0
) {
    let waited=0;

```

We declare a function, `generate`, with the arguments `prompt`, `style`, `prefix`, `inputImage`, that defaults to `false`, `downloadDir`, that defaults to `"./generated"`, and `iteration_`, that defaults to `0`
Also, near the bottom, we declare a variable called `waited`, and set it to `0`.

The next block is a large one.
```js
function handler(data, prefix) {
        switch (data.state) {
        case "authenticated":
            if (!quiet) colors.printGreen(`${prefix}Authenticated`);
            break;
        case "allocated":
            if (!quiet) colors.printBlue(`${prefix}Allocated`);
            break;
        case "submitted":
            if (!quiet) colors.printGreen(`${prefix}Submitted`);
            break;
        case "progress":
            // eslint-disable-next-line no-case-declarations
            let progress = data.task.photo_url_list.length;
            if (progress != 0) {
                if (!quiet)
                    colors.printYellow(
                        `${prefix}Submitted (${
                            data.task.photo_url_list.length
                        }/${styles.steps.get(style)})`
                    );
            } else {
                waited++;
                if (!quiet){ 
                    if (waited<10){
                        colors.printRed(`${prefix}Waiting ${waited}`);
                
                    } else {
                        colors.printAlert(`${prefix}Waiting ${waited}`);
                    
                    }
                }
            }
            break;
        case "generated":
            if (!quiet) colors.printGreen(`${prefix}Generated`);
            break;
        case "downloaded":
            if (!quiet) colors.printBlue(`${prefix}Downloaded`);
            break;
        }
    }
```

So, this block declares a function `handler`, that takes in two arguments, `data`, and `prefix`.  
Then, we jump into a `switch-case` statement. this is kind of like a slitter for the control flow. We jump to different places depending on `data.state`.  
For example, if it is `"authenticated"`, we jump to the first one, if it is `"allocated"`, we jump to the second one, and so on.  
For the most part, this is just printing out the state, with some extra things involved. In each case, we check if `quiet` is `true`. if it is, we don't print out anything. if it isn't, we print out the prefix, plus whatever status we have, in a given color.   
For the most part, i tried to make it so that green indicated good things, blue indicated neutral things, red indicated negative things, yellow slightly negative things, and red with yellow background things were really not going well.  
Is it a completely arbitrary decision?  
Absolutely.  
Does it work?  
Mostly. Kind of.

`Progress` is the only one that actually has any logic to it. It checks if there is no progress at all, and if there is, it increases `waited` by one, and then checks if `waited` is greater than ten. if it is, it prints out an alert, otherwise, it just prints out how many times its waited. if there has been progress, it prints it out, along with the number of steps in total that a given style has.  

Why don't we check if it has been stuck at any other percentage? Well, once it has gone above one, it usually completes in ~2-7 seconds. however, it can get stuck at zero for 5-10 seconds.  


```js
let res = await task(
        prompt,
        style,
        (data) => handler(data, prefix),
        { final, inter, downloadDir },
        inputImage,
        iteration_,
        prefix
    );
return res;
```
The next block is where a lot of time is spent. It actually calls the `task` function. It uses the `prompt`, and `style` arguments given.   
We also see it pass in a weird looking third argument. this is a function declaration that takes in `data`, and uses `handler` as the return value, passing in `prefix`, which was passed in to the `generate` function. it is kind of confusing, but that is just what JavaScript just loves doing.  
For the rest of the arguments, it isn't that crazy. The fourth one is just an object declaration, that packs `final`, `inter`, and `downloadDir` into one object.  
then, once it has finished (again, note the `await`), it returns the result `res`.


```js
async function generateLaggySequential(
    prompts,
    style,
    times,
    weighting,
    directory = Date.now(),
    inputImage = false
) {
```
This one takes in fairly similar arguments to `generate`, with the exception of `times` and `weighting`, so I won't repeat myself.

```js
    let lastImage = {};
    if (inputImage) {
        lastImage = inputImage;
    }
    let images={};
```
This is mostly just setup for future stuff.  
We declare a `lastImage` object, and if `inputImage` is `true`, we set `lastImage` to it.
We also set `images` to an empty object

The next part is why this can take so long.
```js
    for (let n=0;n<prompts.length;n++) {
        let prompt=prompts[n];
        for (let i=0;i<times;i++){
```
This is a `for-loop`. It starts by executing the first part in the parenthesis. it sets `n` equal to zero. Then, it runs everything inside the curly braces while the second condition is true. in this case, while `n` is less than the length of `prompts`. Finally, each loop through, it runs the code at the end. This increments `n` by one.  

Inside the loop, it sets `prompt` equal to the `n`th object of `prompts`.  Then, inside this, we enter another loop that runs `times` times. 


The next lines may be a bit hard to understand, but it is actually fairly simple.
```js
            let imgID=(i+times*n);
            let imageIndex=Math.max(imgID-weighting,0);
            
            let prefix = `${imgID + 1}/${(times) * (prompts.length)}: `;
```
First, it sets `imgID` equal to `i` plus `n` multiplied by `times`.  

The next line has the effect of clamping the result of `imgID` minus `weighting` to a positive number[^4]. Negative indices is unwanted behavior in this case, but can be useful in certain circumstances.  
Finally, we set `prefix` to the `imgID`, plus one, a `"/"`, and the total number that are to be generated in total, which is `times` multiplied by the length of `prompt`.

```js
            let res=await generate(
                prompt,
                style,
                prefix,
                lastImage,
                `${directory}/${imgID}`
            );
```
This calls the `generate` function we declared above. we pass in `prompt`, `style`, and the `prefix`, as well as the `lastImage`. we also pass in the directory that we will use, which is the `directory` plus `imgID`.


```js
            images[imgID]={
                "res":res,
                "imageIndex":imageIndex,
                "prompt":prompt,
                "style":style,
                "weighting":weighting,
                "directory":directory,
                "path":res.path
            };
```
This is essentially just setting the `imgID`th item of `images` to a kind of large object, with a bunch of information, like the response from the generation, the `imageIndex`, the `prompt`, the `style`, the `weighting`, the `directory`, and the `path`.  


```js
            lastImage={
                // eslint-disable-next-line camelcase
                input_image:fs.readFileSync(images[imageIndex].path).toString("base64"),
                // eslint-disable-next-line camelcase
                media_suffix:"jpeg",
                // eslint-disable-next-line camelcase
                image_weight:"HIGH"
            };
        }
    }
    return images;
}

```
this block just sets `lastImage` to an object. we get the `imageIndex`th object of `images`, and get that object's `path`. we then read from the path, and convert that to base64, which i will not be going over.
we also set the `media_suffix` to `"jpeg"` which is essentially the file format, and the `image_weight` to `"HIGH"`. we also finish the two loops.
Then, we return the `images` object, and finish up the function.


```js
module.exports.generate = generate;
module.exports.generateLaggySequential = generateLaggySequential;
```
this is how JavaScript does modules. you have to define the `generate` export to be `generate`, and `generateLaggySequential` export to be the function with the same name.

## index.js

this one is the main meat of how the program actually works, so as you might guess, it's long. really long.
```javascript
/* eslint-disable no-constant-condition */
const Rest = require("./rest.js");
const identify = require("./identify.js");
const download = require("./download.js");
const mkdirp = require("mkdirp");
const path = require("path");

let paintRest = new Rest("paint.api.wombo.ai", 100);
let imagePaintRest = new Rest("app.wombo.art", 100);

/**
 * @param {string} prompt
 * @param {number} style
 * @param {function} updateFn
 * @param {object} settings
 * @param {object} inputImage
 * @param {string} photoDownloads
 * @param {string} _prefix
 * @returns {object} task
 */
module.exports.task = async function runTask(
    prompt,
    style,
    // eslint-disable-next-line no-empty-function
    updateFn = () => {},
    settings = {},
    inputImageArg = {},
    _prefix = ""
) {
    let {
        final = true,
        inter = false,
        downloadDir = "./generated/"
    } = settings;
    let {
        inputImage = false,
        mediaSuffix = null,
        imageWeight = "HIGH"
    } = inputImageArg;
    let id;
    let prefix = _prefix;
    try {
        id = await identify();
    } catch (err) {
        console.error(err);
        throw new Error(
            `Error while sending prompt:\n${
                err.toFriendly ? err.toFriendly() : err.toString()
            }`
        );
    }
    let mediastoreid;
    if (inputImage) {
        imagePaintRest.customHeaders = {
            "Authorization": "bearer " + id,
            "Origin": "https://app.wombo.art",
            "Referer": "https://app.wombo.art/",
            "Cache-control": "no-cache",
            "Sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
            "Pragma": "no-cache",
            "Accept": "*/*",
            "Accept-encoding": "gzip, deflate, br",
            "Accept-language": "en-US,en;q=0.9",
            "Aontent-type": "text/plain;charset=UTF-8"
        };
        let created = Date.now();
        let expire = Date.now() + 960000;

        imagePaintRest.cookies[
            "_dd_s"
        ] = `rum=1&id=323368bd-45a7-4b9d-acf2-89cd59a16777&created=${created}&expire=${expire}`;
        let paintRestPayload = `{"image":"${inputImage}","media_suffix":"${mediaSuffix}","num_uploads":1}`;
        let res = await imagePaintRest.post(
            "/api/mediastore",
            paintRestPayload
        );
        mediastoreid = res.mediastore_uid;
    }
    paintRest.customHeaders = {
        Authorization: "bearer " + id,
        Origin: "https://app.wombo.art",
        Referer: "https://app.wombo.art/"
    };

    updateFn({
        state: "authenticated",
        id
    });
    
    let task;
    let taskPath;
    try {
        task = await paintRest
            .options("/api/tasks/", "POST")
            .then(() => paintRest.post("/api/tasks/", { premium: false }));
        taskPath = "/api/tasks/" + task.id;
    } catch (err) {
        if (typeof err == TypeError) {
            return await runTask(
                prompt,
                style,
                updateFn,
                settings,
                inputImage
            );
        }
    }
    
    updateFn({
        state: "allocated",
        id,
        task
    });
    
    let inputObject = {
        // eslint-disable-next-line camelcase
        input_spec: {
            // eslint-disable-next-line camelcase
            display_freq: 10,
            prompt,
            style: +style
        }
    };
    
    if (inputImage) {
        // eslint-disable-next-line camelcase
        inputObject.input_spec.input_image = {
            // eslint-disable-next-line camelcase
            weight: imageWeight,
            // eslint-disable-next-line camelcase
            mediastore_id: mediastoreid
        };
    }
    let ti=1000;
    while (!task){
        try {
            task = await paintRest
                .options(taskPath, "PUT")
                .then(() => paintRest.put(taskPath, inputObject)
                );
            updateFn({
                state: "submitted",
                id,
                task
            });
        } catch (error) {
            updateFn({
                state:"error",
                id,
                task,
                message:error.toFriendly(),
                times:ti
                
            });
            ti*=2;
            await new Promise((res) => setTimeout(res, ti));
        }
    }
    // eslint-disable-next-line no-undefined
    let interDownloads = [];
    let interPaths = [];
    let interFinished = [];
    while (!task.result) {
        try {
            task = await paintRest.get(taskPath, "GET");
        } catch (err) {
            console.log("Error while getting task");
            // try {
            //     task = await paintRest.get(taskPath, "GET");
            // } catch (errorValue) {
            //     console.log("Rate limited, retrying in 2 seconds");
            //     await new Promise((resolve) => setTimeout(resolve, 2000));
            // }
        }

        // if (task.state === "pending") console.warn("Warning: task is pending");
        if (inter) {
            await mkdirp(`${downloadDir}/`);
            for (let n = 0; n < task.photo_url_list.length; n++) {
                if (
                    interDownloads[n] ||
                        /\/final\.je?pg/i.exec(task.photo_url_list[n])
                )
                    continue;

                interPaths[n] = path.join(
                    downloadDir,
                    `${n}.jpg`
                );

                interDownloads[n] = download(
                    task.photo_url_list[n],
                    interPaths[n]
                ).then(() => {
                    return (interFinished[n] = interPaths[n]);
                });
            }
        }

        updateFn({
            state: "progress",
            id,
            task,
            inter: interFinished
        });
        await new Promise((res) => setTimeout(res, 1000));
    }
    updateFn({
        state: "generated",
        id,
        task,
        url: task.result.final,
        inter: interFinished
    });
    let downloadPath;
    if (!inter) {
        downloadPath = downloadDir+".jpg";
    }
    try {
        let downloaded=!final;
        while (!downloaded){
            await download(task.result.final, downloadPath).catch(() => {
                console.log("Error while downloading final image");
                downloaded=false;
            }).then(() => {
                downloaded=true;
                
            });
        }
        if (inter) await Promise.all(interDownloads);
    } catch (err) {
        console.log(prefix);
        console.error(err);
        throw new Error(
            `Error while downloading results:\n${
                err.toFriendly ? err.toFriendly() : err.toString()
            }`
        );
    }
    console.assert(task.result != null, `${prefix} task result is none:`);
    updateFn({
        state: "downloaded",
        id,
        task,
        url: task.result.final,
        path: final ? downloadPath : null,
        inter: interFinished
    });

    return {
        state: "downloaded",
        id,
        task,
        url: task.result.final,
        path: final ? downloadPath : null,
        inter: interFinished
    };
};

module.exports.styles = require("./styles.js");
module.exports.download = require("./download.js");
```
The first few lines aren't all that interesting. we get some modules, some that I've written, some that are built-ins.
```javascript
/* eslint-disable no-constant-condition */
const Rest = require("./rest.js");
const identify = require("./identify.js");
const download = require("./download.js");
const mkdirp = require("mkdirp");
const path = require("path");
```
we get `Rest.js`, `identify.js`, `download.js`, `mkdirp`, and `path`. the first three are the ones I have written, the others are built-ins, or installed from `npm`,  **N**ode **P**ackage **M**anager.  

Then we define both `paintRest`, and `imagePaintRest`. these are `Rest` Objects from the `Rest` library we `require`d above. 

Now, here is where the bulk of the program lies... 
After some more stuff, of course. 
 
```javascript
/**
 * @param {string} prompt
 * @param {number} style
 * @param {function} updateFn
 * @param {object} settings
 * @param {object} inputImage
 * @param {string} photoDownloads
 * @param {string} _prefix
 * @returns {object} task
 */
```
This is a `JSDoc` comment. Like any other comment, it isn't actually executed by `node`. however, it does help during development by telling the IDE[^6] what an object or function "*Looks*" like. i use looks hesitantly, as it doesn't really look like anything, but it shows what inputs, outputs, and attributes it has. 

```javascript
module.exports.task = async function runTask(
    prompt,
    style,
    // eslint-disable-next-line no-empty-function
    updateFn = () => {},
    settings = {},
    inputImageArg = {},
    _prefix = ""
) {
```
this is declaring a function, and sort of preemptively assigning it to the `module.exports`, so it will be exported. it takes in a prompt, a style, a update function, settings, an inputImage and a prefix. note how the argument's type lines up with the JSDoc comment's note. the prompt is a string, the style is a number, the function is a function, and so on.

```javascript
    let {
        final = true,
        inter = false,
        downloadDir = "./generated/"
    } = settings;
    let {
        inputImage = false,
        mediaSuffix = null,
        imageWeight = "HIGH"
    } = inputImageArg;
    let id;
    let prefix = _prefix;
```
this is essentially unpacking and declaring a bunch of stuff. we set `final`, `inter`, and `downloadDir` to their respective attributes in `settings`, which was passed in. a similar story with the `inputImageArg`. we also declare `id` and `prefix`, with `prefix` being set to `_prefix`. also, in the object unpacking, we provide defaults to all of the arguments, so if they aren't given, it has something to fall back on.  

```javascript
    try {
        id = await identify();
    } catch (err) {
        console.error(err);
        throw new Error(
            `Error while sending prompt:\n${
                err.toFriendly ? err.toFriendly() : err.toString()
            }`
        );
    }
```
this part gets an `id` from the `identify` function, that was gotten from the module of the same name. I will get to that soon. the `id` is necessary for basically everything.

The next part is long, and was also an absolute **PAIN** to get working.
```javascript
let mediastoreid;
    if (inputImage) {
        imagePaintRest.customHeaders = {
            "Authorization": "bearer " + id,
            "Origin": "https://app.wombo.art",
            "Referer": "https://app.wombo.art/",
            "Cache-control": "no-cache",
            "Sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
            "Pragma": "no-cache",
            "Accept": "*/*",
            "Accept-encoding": "gzip, deflate, br",
            "Accept-language": "en-US,en;q=0.9",
            "Aontent-type": "text/plain;charset=UTF-8"
        };
```
The first two lines aren't that bad. We declare a variable `mediastoreid`, and check if `inputImage` is truthy[^7].   

We also have a huge block that declares a bunch of headers. If you look closely, you might notice that the last one is `Aontent-type`. even if you know nothing about HTTP headers, you know that this is wrong. It is meant to be `Content-type`.  
I thought that this was intentional to prevent people like me doing things like what I am doing, but, due to the standard, you have to prefix any custom headers with `X-`. so that wasn't it. The website was sending the `Content-type` attribute, so that couldn't be it. that also removes the possibility that it simply wasn't sent, so there is that. in the end, it was stupid lucky of me to mistype it as I was changing to uppercase letters.

The next few lines were also a bit of a pain, but this time they were less so than the previous.
```javascript
        let created = Date.now();
        let expire = Date.now() + 960000;

        imagePaintRest.cookies[
            "_dd_s"
        ] = `rum=1&id=323368bd-45a7-4b9d-acf2-89cd59a16777&created=${created}&expire=${expire}`;
        let paintRestPayload = `{"image":"${inputImage}","media_suffix":"${mediaSuffix}","num_uploads":1}`;
        let res = await imagePaintRest.post(
            "/api/mediastore",
            paintRestPayload
        );
        mediastoreid = res.mediastore_uid;
    }
```
we get the current time, and a time 24 hours in the future (24\*60\*60). we also set some cookies up. cookies are temporary storage that are sent along with every request on a given site. 
we then also declare the payload, which is a textual representation of `json` data, which is interesting, given that `json` is a valid `Aontent-type`. Yes, i am still sour about that. we then post our image object, and get our `mediastoreid` out.

# Footnotes
[^1]: If you were paying close attention, you may have noticed that the blocks were getting indented further and further. this is just how Python does its control flow, and block/scope dictation.   
[^2]: The reasoning behind having the limit be at 2 rather than one is that Windows computers use `\r\n`, as opposed to UNIX's `\n`. 
[^3]: Forgot to mention that I get the prompts from songs, as it can be kind of hard to think of original prompts sometimes.
[^4]: This is fairly simple to reason through, but the maximum between zero and a negative number will always be zero, and the maximum of a positive number and zero will always be the positive number. if you pass in a zero, it will return zero. whether that zero is the constant or the other value is up to the implementation. 
[^5]:  This is known as the Unix epoch, and on many systems, it is essentially T=0, so this time comes up a lot.
[^6]: **I**ntegrated **D**evelopment **E**nvironment. It is a text editor with more features designed for developing things. 
[^7]: Anything that is truthy will evaluate to true in an "`if`" statement. however, it is not equal to `true`. 