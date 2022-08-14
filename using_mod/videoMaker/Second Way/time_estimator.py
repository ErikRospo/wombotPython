import csv
import json



settings=json.load(open("./settings.json","rt"))
current_data=list(csv.reader(open("benchmarks.csv","rt").readlines()))
with open(settings['samplePath']) as f:
    numPrompts=len(f.readlines())
# print(numPrompts)
numIterations=numPrompts*settings['times']
cd=[]
for n in range(1,len(current_data)):
    cd.append((1/(float(current_data[n][0])-numPrompts)**2)*float(current_data[n][-1]))
cda=(sum(cd)*numIterations)/len(cd)
cda*=2
print(cda)