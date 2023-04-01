import threading
import sys
import os
import trace
class thread_with_trace(threading.Thread):
  def __init__(self, *args, **keywords):
    threading.Thread.__init__(self, *args, **keywords)
    self.killed = False

  def start(self):
    self.__run_backup = self.run
    self.run = self.__run
    threading.Thread.start(self)

  def __run(self):
    sys.settrace(self.globaltrace)
    self.__run_backup()
    self.run = self.__run_backup

  def globaltrace(self, frame, event, arg):
    if event == 'call':
      return self.localtrace
    else:
      return None

  def localtrace(self, frame, event, arg):
    if self.killed:
      if event == 'line':
        raise SystemExit()
    return self.localtrace

  def kill(self):
    self.killed = True
def npmserver():
    print("npm server starting")
    os.system("cd app; npm run dev")
def pythonserver():
    print("python server starting")
    os.system("cd server; python3 server.py")
t1=thread_with_trace(target=npmserver)
t2=thread_with_trace(target=pythonserver)
t1.start()
t2.start()
try:
    while True:
        a=input()
        if a=="a":
            t1.kill()
            t1=thread_with_trace(target=npmserver)
            t1.start()
        elif a=="s":
            t2.kill()
            
            t2=thread_with_trace(target=pythonserver)
            t2.start()
        elif a=="e":
            t1.kill()
            t2.kill()
            break
except Exception:
    t1.kill()
    t2.kill()
sys.exit()
