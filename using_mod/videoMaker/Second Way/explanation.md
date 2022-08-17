# Explanation of Wombo.art video/image generation
[Back](https://erikrospo.github.io/wombotPython/)

## Table of contents
1. [Run.py](https://erikrospo.github.io/wombotPython/using_mod/videoMaker/Second%20Way/explanation#runpy)
2. [Time_estimator.py](https://erikrospo.github.io/wombotPython/using_mod/videoMaker/Second%20Way/explanation#time_estimatorpy)
3. [Main.js](https://erikrospo.github.io/wombotPython/using_mod/videoMaker/Second%20Way/explanation#mainjs)
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
print(f"expected time: {exhours}h {exminutes}m {exseconds}s")
print(f"et: {et} etm:{et/60} eth:{et/3600}")
st=time.time()
excomp=datetime.datetime.fromtimestamp(time.time()+et).strftime('%Y-%m-%d %I:%M:%S %p')
excompmi=datetime.datetime.fromtimestamp(time.time()+mit).strftime('%Y-%m-%d %I:%M:%S %p')
excompma=datetime.datetime.fromtimestamp(time.time()+mat).strftime('%Y-%m-%d %I:%M:%S %p')

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
        tts=(end_make_video-start_make_video)+(end-start)
        tthours=int(tts/3600)
        ttminutes=int((tts%3600)/60)
        ttseconds=int((tts%3600)%60)
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
        print("Time error (Actual):  "+str(terrhours)+" hours "+str(terrminutes)+" minutes "+str(terrseconds)+" seconds")
        print("Time error (Maximum): "+str(miterrhours)+" hours "+str(miterrminutes)+" minutes "+str(miterrseconds)+" seconds")
        print("Time error (Minumim): "+str(materrhours)+" hours "+str(materrminutes)+" minutes "+str(materrseconds)+" seconds")
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
print(f"expected time: {exhours}h {exminutes}m {exseconds}s")
print(f"et: {et} etm:{et/60} eth:{et/3600}")

excomp=datetime.datetime.fromtimestamp(time.time()+et).strftime('%Y-%m-%d %I:%M:%S %p')
excompmi=datetime.datetime.fromtimestamp(time.time()+mit).strftime('%Y-%m-%d %I:%M:%S %p')
excompma=datetime.datetime.fromtimestamp(time.time()+mat).strftime('%Y-%m-%d %I:%M:%S %p')

print(f"expected completion:       {excomp}")
print(f"overestimated completion:  {excompma}")
print(f"underestimated completion: {excompmi}")

```
`et` is the estimated time.  
`mit` is the minimum time it thinks it will take. this is one stddev away from `et`.  
`mat` is the maximum time it thinks it will take. like `mit`, this is one stddev away from `et`.  
most of the other code is converting the duration into actual times and dates.

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
Note [^1]
And the next few are also the same, just with the expected time to get by how much our guess was off by.
```python
      tts=(end_make_video-start_make_video)+(end-start)
        tthours=int(tts/3600)
        ttminutes=int((tts%3600)/60)
        ttseconds=int((tts%3600)%60)
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
            csvLine = "\n"+str(lines)+','+str(TimeSeconds)+','+str(TimeSecondsMKV)+','+str(et)+","+str(TotalTime-et)+","+str(TotalTime)
            f.write(csvLine)
```
The first line opens up a file named `benchmarks.csv`. the `.csv` file is comma separated values. also, note the second parameter of the `open` function: `at`. this means that it will *A*ppend (add) *T*ext to the file.  
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
Finally, the 2 lines after that handle all other error codes. simply by just saying that there was an error, and what the error was.

## time_estimator.py

This is a module that I wrote that predicts how long a given configuration will take to process, given previous data. 

Similar to the previous file, I'll show it in full, then go block by block, explaining what each part does.
```python
import csv
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
The first line essentially is JavaScript's way of declaring a function. `def` was Python's, if you don't remember, because I never told you. Then, we get the time when it starts on the next line, and after that, we get the *absolute* path of `./generated/` and the time together. The difference between **absolute** and **Relative** paths is that absolute paths go from the root of the file system (Think C:/path/to/file/here) while relative paths are from a specified starting directory (think path/to/file/here). we have to do this because JavaScript, and the `fs` module are kind of *interesting* when it comes to relative paths.  
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


# Footnotes
[^1]: If you were paying close attention, you may have noticed that the blocks were getting indented further and further. this is just how Python does its control flow, and block/scope dictation.   
[^2]: the reasoning behind having the limit be at 2 rather than one is that Windows computers use `\r\n`, as opposed to UNIX's `\n`. 
[^3]: Forgot to mention that I get the prompts from songs, as it can be kind of hard to think of original prompts sometimes.
