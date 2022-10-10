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
            if n=="[STOP]":
                break
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
