import json
from math import inf
import matplotlib.pyplot as plt
from scipy.interpolate import make_interp_spline, BSpline
import csv
import numpy as np

fn="benchmarks.csv"
d=[]
with open(fn,"rt") as f:
    d=list(csv.reader(f.readlines()))

d=d[1:]
iterations=[int(t[0]) for t in d]
times=[float(t[-1]) for t in d]

itmp=zip(iterations,times)
itmp=sorted(itmp,key=lambda x:x[0])
iterations,times=[list(x) for x in zip(*itmp)]
#group the data by iterations
siterationsu=sorted(list(set(iterations)))
# we want to split the data into groups, that are all the iterations that are the same

itmp1={}
for i in itmp:
    if i[0] not in itmp1:
        itmp1[i[0]]=[i[1]]
    else:
        itmp1[i[0]].append(i[1])

min_times={}
max_times={}
avg_times={}

for n in siterationsu:
    min_times[n]=min(itmp1[n])
    max_times[n]=max(itmp1[n])
    avg_times[n]=sum(itmp1[n])/len(itmp1[n])

min_time_list=[min_times[i] for i in siterationsu]
max_time_list=[max_times[i] for i in siterationsu]
avg_time_list=[avg_times[i] for i in siterationsu]


# interpolate the data
xnew = np.linspace(min(siterationsu), max(siterationsu), 100)
mintimespl = make_interp_spline(siterationsu,min_time_list  )
maxtimespl = make_interp_spline(siterationsu,  max_time_list)
avgtimespl = make_interp_spline(siterationsu,  avg_time_list)
mintime = mintimespl(xnew)
maxtime = maxtimespl(xnew)
avgtime = avgtimespl(xnew)


fig,ax=plt.subplots(2,4,figsize=(25,10))
ax[0][0].plot(iterations,times,"b.",label="data")
ax[1][0].plot(xnew,mintime,"c-",label="min_smooth")
ax[1][1].plot(xnew,maxtime,"m-",label="max_smooth")
ax[1][2].plot(xnew,avgtime,"y-",label="avg_smooth")
ax[1][3].plot(xnew,mintime,"c-",label="min_smooth")
ax[1][3].plot(xnew,maxtime,"m-",label="max_smooth")
ax[1][3].plot(xnew,avgtime,"y-",label="avg_smooth")
ax[1][3].plot(iterations,times,"b.",label="data")
ax[0][1].plot(siterationsu,min_time_list,"r-",label="min_data")
ax[0][2].plot(siterationsu,max_time_list,"g-",label="max_data")
ax[0][3].plot(siterationsu,avg_time_list,"b-",label="avg_data")
z=np.polyfit(iterations,times,1)
p=np.poly1d(z)
ax[0][0].plot(iterations,p(iterations),"r-",label="linear")
for i in range(2):
    for j in range(4):
        ax[i][j].set_xlabel("iterations")
        ax[i][j].set_ylabel("time")
        ax[i][j].legend()
plt.xlabel("iterations")
plt.ylabel("times")
plt.title("Benchmark")
plt.savefig("plot.png")
