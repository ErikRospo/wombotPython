import json,os
import time
import multirun
import time_estimator as te
sp="lyrics_sample"
initial_samples=open(sp+".txt","r").read().split("\n")
with open(sp+"old.txt","w") as f:
    f.write("\n".join(initial_samples))
initial_samples=[i for i in initial_samples if i!="" \
                                           and i!=" " \
                                           and i!="\n"\
                                           and i!="\r"\
                                           and i!="\r"\
                                           and "#" not in i \
                                           and "[" not in i \
                                           and "]" not in i]
initial_settings=json.load(open("settings.json","r"))
with open("settingsold.json","w") as f:       
    json.dump(initial_settings,f)
total_iterations=0
nmin=2
nmax=20
kmin=4
kmax=40
thread_its=4
for n in range(nmin,nmax):
    for k in range(kmin,kmax):
        total_iterations+=thread_its*(n*k)
print(total_iterations)
te.print_fancy_time_from_iterations(total_iterations)
for n in range(nmin,nmax):
    for k in range(kmin,kmax):
        with open("settings.json","rt") as f:
            settings=json.load(f)
        settings["times"]=k
        with open(sp+".txt","w") as f:
            f.write("\n".join(initial_samples[0:n]))
        with open("settings.json","wt") as f:
            json.dump(settings,f)
        g=multirun.run(10,thread_its)
        if g=="KBI":
            exit()
        os.system("rm -r generated/*")
with open(sp+"old.txt","r") as f:
    old_samples=f.read().split("\n")
with open(sp,"w") as f:
    f.write("\n".join(old_samples))
os.system("rm -r generated/*")

with open("settings.json","wt") as f:
    json.dump(initial_settings,f)
os.system("python3 plot.py")