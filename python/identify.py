import requests
import time
identify_hostname = "identitytoolkit.googleapis.com"
identify_secret_key = "AIzaSyDCvp5MTJLUdtBYEKYWXJrlLzu1zuKM6Xw"

identify_cache=""
identify_timeout=0

def identify(key=""):
    global identify_secret_key 
    global identify_timeout
    if not key:
        if identify_secret_key:
            key=identify_secret_key
        else:
            raise Exception("No identify key provided and no secret.json found!")
    if time.time_ns()>identify_timeout:
        url="https://"+identify_hostname+"/v1/accounts/signup?key="+key
        print(url)
        res=requests.post("https://"+identify_hostname+"/v1/accounts:signup?key="+key,{key:key})
        print(res)
        # identify_cache=res.idToken
        # identify_timeout=time.time_ns()+1000*res.expiresIn-30000
    else:
        return identify_cache
if __name__=="__main__":
    print(identify())