import requests

url = "https://identitytoolkit.googleapis.com/v1/accounts:signUp"

querystring = {"key":"AIzaSyDCvp5MTJLUdtBYEKYWXJrlLzu1zuKM6Xw"}

payload = "{key:'AIzaSyDCvp5MTJLUdtBYEKYWXJrlLzu1zuKM6Xw'}"
headers = {"Content-Type": "application/json"}

response = requests.request("POST", url, data=payload, headers=headers, params=querystring)

print(response.text)