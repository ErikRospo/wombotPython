import csv
import json
from math import sqrt
from statistics import mean, stdev
def calculate_expected_time():
    settings=json.load(open("./settings.json","rt"))
    current_data=list(csv.reader(open("benchmarks.csv","rt").readlines()))
    with open(settings['samplePath']) as f:
        numPrompts=len(f.readlines())
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
    return ev