X='Done!'
W='photo_url_list'
V=True
U='id'
T=int
S=str
M='next_data.json'
H=open
G='generated_photo_keys'
A=print
import json as D,os,requests as E,tqdm as I
from time import sleep
from bs4 import BeautifulSoup as N
def J(prompt,style):
	c='https://paint.wombo.ai/';b='https://paint.wombo.ai';a='Referer';Z='Origin';Y='Authorization';C='AIzaSyDCvp5MTJLUdtBYEKYWXJrlLzu1zuKM6Xw';L='https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+C;M='{"key":"'+C+'"}';N=E.post(L,data=M,headers={'Content-Type':'application/json'});O=N.json()['idToken'];F='bearer '+O;P='https://paint.api.wombo.ai/api/tasks';Q={Y:F,Z:b,a:c};H=E.post(P,headers=Q,data=D.dumps({'display_frequency':1}));J=H.json()[U];K=H.json()['result'];R='https://paint.api.wombo.ai/api/tasks/'+J;W={Y:F,Z:b,a:c};X='{"input_spec": {"prompt": "'+prompt+'","style": '+S(style)+'}}';A=I.tqdm(total=21)
	while not K:
		sleep(3);B=E.put(R,data=X,headers=W)
		try:A.update(T(B.json()[G][-1].split('/')[-1].split('.')[0])-A.n)
		except IndexError:pass
		if'generated/'+J+'/19.jpg'in B.json()[G]:K=V;A.update(21-A.n)
	A.close();return B.json()
def O():
	B=E.get('https://app.wombo.art/').text;C='#__NEXT_DATA__';F=N(B,'html.parser');A=F.select(C)[0].contents;A=D.loads(A[0])
	with H(M,'w')as G:D.dump(A,G)
def P():
	try:C=D.load(H(M))
	except FileNotFoundError:O();C=D.load(H(M))
	F=C['props']['pageProps']['artStyles'];E=[]
	for B in F:E.append((B[U],B['name'],B['premium'],B['model_type']))
	A('Available styles:')
	for B in E:A(B[0],':',B[1],'(',B[3],')')
	A('\nUsage:');A('python3 main.py <prompt> <style> [--download-all]');A('\nExample:');A('python3 main.py "Hello" 1')
def K(url,filename):
	A=filename;os.makedirs(os.path.dirname(A),exist_ok=V)
	with H(A,'wb')as B:C=E.get(url);B.write(C.content)
	return A
import argparse as Q
F=Q.ArgumentParser()
F.add_argument('prompt',type=S)
F.add_argument('style',type=T)
F.add_argument('--download-all',action='store_true',default=False)
F.print_help=P
B=F.parse_args()
if B.download_all:
	C=J(B.prompt,B.style);A('Downloading all images...')
	for L in I.trange(len(C[G])):K(C[W][L],C[G][L])
	A(X)
else:A('Generating image...');A('Prompt:',B.prompt);A('Style:',B.style);C=J(B.prompt,B.style);A('Downloading image...');R=C[W][-1],C[G][-1];K(*R);A(X)