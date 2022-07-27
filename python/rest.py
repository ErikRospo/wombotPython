import https
class Rest:
    def __init__(self,hostname,delay=250,cookies_enabled=True):
        self.hostname=hostname
        self.agent=https.Agent(keepAlive=true, maxSockets=1)
        self.queue=[]
        self._delay=delay
        self.delay_handle=None
        self.cookies={}
        self.cookies_enabled=cookies_enabled
        self.custom_headers={}
    
    def scheduler(self):
        if (len(self.queue)>0):
            self.queue.pop()()
        else:
            if self.delay_handle!= None:
                pass
            self.delay_handle=None
    def enter_queue(f):
        pass
