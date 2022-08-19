import os
import matplotlib.pyplot as plt

import csv

fn="benchmarks.csv"
d=[]
with open(fn,"rt") as f:
    d=list(csv.reader(f.readlines()))

d=d[1:]
iterations=[int(t[0]) for t in d]
times=[float(t[-1]) for t in d]

fig,ax=plt.subplots()
ax.plot(iterations,times,"bo")
plt.xlabel("iterations")
plt.ylabel("times")
plt.title("iterations vs. times")
plt.savefig("plot.png")
