import os
import csv
import time
import json
start_time=0
# os.system("node sequential.js")
end_time=128.22
print("Sequential: ", end_time-start_time)
csv_file=open("benchmarks.csv", "r", newline="")
json_file=open("settings.json", "r")
json_data=json.load(json_file)

reader=csv.reader(csv_file)
csv_file.close()
json_file.close()
csv_file2=open("benchmarks.csv", "w", newline="")
writer=csv.writer(csv_file2)
writer.writerows(reader)
csv_file2.close()
start_time_1=time.time()
os.system("python make_video.py")
end_time_1=time.time()
print("Python: ", end_time_1-start_time_1)