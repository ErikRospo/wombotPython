import json
import os
from time import sleep
import requests
from bs4 import BeautifulSoup as Soup
import tqdm
# from soupselect import select
def main(prompt,style):
    identify_key="AIzaSyDCvp5MTJLUdtBYEKYWXJrlLzu1zuKM6Xw"
    identify_initial_auth_url="https://identitytoolkit.googleapis.com/v1/accounts:signUp?key="+identify_key
    identify_data='{"key":"'+identify_key+'"}'
    identify_response=requests.post(identify_initial_auth_url,data=identify_data,headers={"Content-Type":"application/json"})
    idToken=identify_response.json()["idToken"]
    authkey="bearer "+idToken
    task_id_url="https://paint.api.wombo.ai/api/tasks"
    task_id_headers={"Authorization":authkey,'Origin':'https://paint.wombo.ai','Referer':'https://paint.wombo.ai/'}
    task_id_response=requests.post(task_id_url,headers=task_id_headers,data=json.dumps({'display_frequency':1}))
    task_id=task_id_response.json()["id"]

    final=task_id_response.json()["result"]
    task_process_url="https://paint.api.wombo.ai/api/tasks/"+task_id
    task_process_headers={"Authorization":authkey,'Origin':'https://paint.wombo.ai','Referer':'https://paint.wombo.ai/'}
    task_process_data='{"input_spec": {"prompt": "'+prompt+'","style": '+str(style)+'}}'
    pbar=tqdm.tqdm(total=21)
    while not final:
        sleep(3)
        task_response=requests.put(task_process_url,data=task_process_data,headers=task_process_headers)
        try:
            pbar.update(int(task_response.json()['generated_photo_keys'][-1].split('/')[-1].split('.')[0])-pbar.n)
        except IndexError:
            pass
        if ('generated/'+task_id+'/19.jpg') in task_response.json()['generated_photo_keys']:
            final=True
            pbar.update(21-pbar.n)
    pbar.close()
    return task_response.json()
def get_next_data():
    wombo_content=requests.get('https://app.wombo.art/').text
    sel='#__NEXT_DATA__'
    soup=Soup(wombo_content,'html.parser')
    next_data=soup.select(sel)[0].contents
    next_data=json.loads(next_data[0])
    with open('next_data.json','w') as f:
        json.dump(next_data,f)
def print_help():
    try:
        next_data=json.load(open('next_data.json'))
    except FileNotFoundError:
        get_next_data()
        next_data=json.load(open('next_data.json'))
    styles=next_data['props']['pageProps']['artStyles']
    filtered_styles=[]
    for style in styles:
        filtered_styles.append((style['id'],style['name'],style['premium'],style['model_type']))
    print('Available styles:')
    for style in filtered_styles:
        print(style[0],':',style[1],'(',style[3],')')
    print('\nUsage:')
    print('python3 main.py <prompt> <style> [--download-all]')
    print('\nExample:')
    print('python3 main.py "Hello" 1')
def download(url,filename):
    os.makedirs(os.path.dirname(filename),exist_ok=True)
    with open(filename, 'wb') as f:
        response = requests.get(url)
        f.write(response.content)
    return filename
import argparse
parser=argparse.ArgumentParser()
parser.add_argument('prompt',type=str)
parser.add_argument('style',type=int)
parser.add_argument('--download-all',action='store_true',default=False)
parser.print_help=print_help
args=parser.parse_args()
if args.download_all:
    res=main(args.prompt,args.style)
    print('Downloading all images...')
    for n in tqdm.trange(len(res['generated_photo_keys'])):
        download(res['photo_url_list'][n],res['generated_photo_keys'][n])

    print('Done!')
else:
    print('Generating image...')
    print("Prompt:",args.prompt)
    print("Style:",args.style)
    res=main(args.prompt,args.style)
    print('Downloading image...')
    generated_photo_keys=res['photo_url_list'][-1],res['generated_photo_keys'][-1]
    download(*generated_photo_keys)
    print('Done!')