# Explanation of Wombo.art video/image generation

## run.py
this is a wrapper for all functionality of the application. It gives an estimation of the durration that a given configuration will take, and runs both the actual image generation and the video maker.  

First, I'll show the code in full, then, I'll step through it
```python
#!/usr/bin/python3
import os, time,json
import time_estimator
et,mat,mit=time_estimator.calculate_expected_time()
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
```

This block of code is mostly imports  

```python
#!/usr/bin/python
import os, time, json
import time_estimator
```

The first line is telling linux (the OS) where to find python (the language)  
The second line is some modules that are part of python's standard library, that are included with most instalations.  
Line 3 is a time estimator library I wrote.


The next block is mostly utilizing the time estimator library to provide information to the user about how long it will take.
```python
et,mat,mit=time_estimator.calculate_expected_time()
exhours=int((et)/3600)
exminutes=int(((et)%3600)/60)
exseconds=int(((et)%3600)%60)
print(f"expected time: {exhours}h {exminutes}m {exseconds}s")
print(f"et: {et} etm:{et/60} eth:{et/3600}")
excomp=str(time.ctime(time.time()+et))
excompmi=str(time.ctime(time.time()+mit))
excompma=str(time.ctime(time.time()+mat))

```
`et` is the estimated time.  
`mit` is the minumum time it thinks it will take. this is one stddev away from `et`.  
`mat` is the maximum time it thinks it will take. like `mit`, this is one stddev away from `et`.  
most of the other code is converting the durration into actual times and dates.

The next block is where the vast majority of the time is spent
```python
start=time.time()
res=os.system("node main.js")
end=time.time()
```
The start and end just record when the program was started, and stopped.  
The second line is basically just saying to the operating system "hey, run this in the terminal", and it returns the status code of whatever was run.  
Counterintuitively, this status code is zero when it succeedes, and anything else means failure.   

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

The first line is checking the status code of the previous block, and making sure that the command succeded (remember, zero means success)  
The next two lines read the contents of `path.txt` into the variable sensibly named `path`. This file gets written to by some code in `main.js`, which got run in the previous block. This is a path that points to another file, which then tells the code where to find all the images (that were generated by `main.js`).  
The next few lines do just that, they get the data from that source, and then find all the paths that that file refrences, and then count up the number of them, and store that in the `lines` variable


The next lines make actually make the video
```python
    start_make_video=time.time()
    res1=os.system("python3 make_video.py")
    end_make_video=time.time()
```
This is fairly similar to what happened when runnning `main.js`, so I'll spare you the details  

The next lines are just a bunch of number fiddling to get seconds into hours, minutes, and seconds, and displaying them
```python
    hours=int((end-start)/3600)
    minutes=int(((end-start)%3600)/60)
    seconds=int(((end-start)%3600)%60)
    print("Time taken for main.js: "+str(hours)+" hours "+str(minutes)+" minutes "+str(seconds)+" seconds")
    print("Time taken for main.js: "+str(end-start)+" seconds")
    print("Time taken for main.js: "+str((end-start)/60)+" minutes")
```

The next few lines are pretty much the same as the last block, with one exception
```python
    if res1==0:
        mvhours=int((end_make_video-start_make_video)/3600)
        mvminutes=int(((end_make_video-start_make_video)%3600)/60)
        mvseconds=int(((end_make_video-start_make_video)%3600)%60)
        print("Time taken for make_video.py: "+str(mvhours)+" hours "+str(mvminutes)+" minutes "+str(mvseconds)+" seconds")
        print("Time taken for make_video.py: "+str(end_make_video-start_make_video)+" seconds")
        print("Time taken for make_video.py: "+str((end_make_video-start_make_video)/60)+" minutes")
```
The `if` statement at the top checks to make sure that the video making worked.
Note<sup><a href="#footnotes">1</a></sup>  

The next lines are mostly about saving timing data to a file
```python
        with open("./benchmarks.csv","at") as f:
            TimeSeconds = end-start
            TimeSecondsMKV=end_make_video-start_make_video
            TotalTime=TimeSeconds+TimeSecondsMKV
            csvLine = "\n"+str(lines)+','+str(TimeSeconds)+','+str(TimeSecondsMKV)+','+str(et)+","+str(TotalTime-et)+","+str(TotalTime)
            f.write(csvLine)
```
The first line opens up a file named `benchmarks.csv`. the `.csv` file is comma seperated values. also, note the second parameter of the `open` function: `at`. this means that it will *A*ppend (add) *T*ext to the file.  
The next 3 lines are just calculating some values so the next isn't insanely long.
Then, we write the data to the file that we opened

The final lines are just handling errors, if they occur
```python
    else:
        print("Error in make_video.py")
        with open("./benchmarks.csv","at") as f:
            f.write("\n"+str(lines)+','+str(end-start)+',err,err,err'+str((end-start)))
elif res==2:
    print("Canceled")
else:
    print("Error in main.js " +str(res))
```
The first `else` is for the making of the video. if instead of returning a `0`, it had instead returned a 1, or 2, it would print out that there was an error, and write to the timing file, just with `err` in place of anything that depends on how long the making of the video takes. 

The next line checks if the response of `main.js` was exactly 2. This is the error code of `^C`, or cancel. if it is, it just prints out `Canceled`  
Finaly, the 2 lines after that handle all other error codes. simply by just saying that there was an error, and what the error was.


# footnotes
[1]:If you were paying close attention, you may have noticed that the blocks were getting indented further and further. this is just how python does its control flow, and block/scope dictation.   