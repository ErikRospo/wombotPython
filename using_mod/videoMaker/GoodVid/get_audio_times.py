import re
from pocketsphinx import AudioFile
import json
import tqdm
# Frames per Second
fps = 100
phrases=[]
for phrase in tqdm.tqdm(AudioFile(frate=fps,audio_file="./sacrifical.wav")):
    for s in tqdm.tqdm(phrase.seg()):
        # phrases.append([s.start_frame/fps,s.end_frame/fps,s.word])
        phrases.append(s)
#get the sentences
sentences=[]
in_sentance=False
current=[]
for n in tqdm.trange(len(phrases)):
    if phrases[n].word=="<s>":
        in_sentance=True
        current=[]
    elif phrases[n].word=="</s>":
        in_sentance=False
        sentences.append(current)
        current=[]
    else:
        p=phrases[n]
        current.append({"word":p.word,"start":p.start_frame,"end":p.end_frame})
# to convert into lyrics, we just write out the things
file=open("lyrics.json","wt")

json.dump(sentences,file,indent=4)
fn=""

sdjs=open("settings.json","+t")
# x=sdjs.readlines()
settings=json.load(sdjs)
settings['samplePath']=fn
json.dump(settings,sdjs)