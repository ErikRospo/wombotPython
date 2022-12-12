#!/usr/bin/python3
import base64
import json
import os
import random
import sys
import threading
from http.client import NO_CONTENT, NOT_FOUND, OK
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

if len(sys.argv)>1:
    serverPort=int(sys.argv[1])
else:
    serverPort=8080
hostName = "localhost"
current_file=()
more=None
MAX_TRASH_ITEMS=10
   
class ReqHandler(BaseHTTPRequestHandler):
    
    def do_GET(self):
        global current_file

        if self.path=="/new":
            self.send_response(OK)
            self.send_header("Content-type", "text/plain")
            self.send_header("Cache-control","no-store")
        
        self.send_header("Access-Control-Allow-Origin","*")

        self.end_headers()
        if self.path=="/new":
            self.wfile.write(b"Hello, world")
if __name__ == "__main__":        
    webServer = ThreadingHTTPServer((hostName, serverPort), ReqHandler)
    print("Server started http://%s:%s" % (hostName, serverPort))
    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
