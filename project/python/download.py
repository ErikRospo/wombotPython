import requests


def download(url,out):
    with open(out,"wt") as file:
        res=requests.get(url)
        file.write(res.text)



# if __name__=="__main__":
#     _url = "https://prod-wombo-paint.s3.amazonaws.com/exports/24702408-32b8-495d-9aa1-6e2832aef02d/blank_tradingcard.jpg?AWSAccessKeyId=AKIAWGXQXQ6WCOB7PP5J&Signature=aOP95XuWLzEtzqXMpGOv4gbIzJQ%3D&Expires=1666294904"
#     download(_url,"result.jpg")