import time_estimator,datetime,time
its=4000
et,mat,mit=time_estimator.calculate_expected_time_from_iterations(its)
exhours=int((et)/3600)
exminutes=int(((et)%3600)/60)
exseconds=int(((et)%3600)%60)
print(f"expected time: {exhours}h {exminutes}m {exseconds}s for {its}")
print(f"et: {et} etm:{et/60} eth:{et/3600}")

excomp=datetime.datetime.fromtimestamp(time.time()+et).strftime('%Y-%m-%d %I:%M:%S %p')
excompmi=datetime.datetime.fromtimestamp(time.time()+mit).strftime('%Y-%m-%d %I:%M:%S %p')
excompma=datetime.datetime.fromtimestamp(time.time()+mat).strftime('%Y-%m-%d %I:%M:%S %p')


print(f"expected completion:       {excomp}")
print(f"overestimated completion:  {excompma}")
print(f"underestimated completion: {excompmi}")

print(et,mat,mit)