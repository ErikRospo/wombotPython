import requests
import time
identify_url = "https://identitytoolkit.googleapis.com/v1/accounts:signUp"

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
        
        querystring = {"key":identify_secret_key}

        payload = "{key:'"+identify_secret_key+"'}"
        headers = {"Content-Type": "application/json"}
        response = requests.request("POST", identify_url, data=payload, headers=headers, params=querystring)
        # print(response)
        res=response.json()
        identify_cache=res["idToken"]
        identify_timeout=time.time_ns()+1000*int(res["expiresIn"])-30000
        return identify_cache
    else:
        return identify_cache
if __name__=="__main__":
    print(identify())