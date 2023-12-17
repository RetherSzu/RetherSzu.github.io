---
layout: post
title: htb remote
date: 2023-09-27 19:18 +0200
hidden: true
---

# Nmap

```bash
┌──(rether㉿rether)-[~]
└─$ nmap -A -sV -sC 10.10.10.180
Starting Nmap 7.94 ( https://nmap.org ) at 2023-09-27 19:35 CEST
Nmap scan report for 10.10.10.180
Host is up (0.021s latency).
Not shown: 993 closed tcp ports (conn-refused)
PORT     STATE SERVICE       VERSION
21/tcp   open  ftp           Microsoft ftpd
| ftp-syst:
|_  SYST: Windows_NT
|_ftp-anon: Anonymous FTP login allowed (FTP code 230)
80/tcp   open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Home - Acme Widgets
111/tcp  open  rpcbind       2-4 (RPC #100000)
| rpcinfo:
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/tcp6  rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  2,3,4        111/udp6  rpcbind
|   100003  2,3         2049/udp   nfs
|   100003  2,3         2049/udp6  nfs
|   100003  2,3,4       2049/tcp   nfs
|   100003  2,3,4       2049/tcp6  nfs
|   100005  1,2,3       2049/tcp   mountd
|   100005  1,2,3       2049/tcp6  mountd
|   100005  1,2,3       2049/udp   mountd
|   100005  1,2,3       2049/udp6  mountd
|   100021  1,2,3,4     2049/tcp   nlockmgr
|   100021  1,2,3,4     2049/tcp6  nlockmgr
|   100021  1,2,3,4     2049/udp   nlockmgr
|   100021  1,2,3,4     2049/udp6  nlockmgr
|   100024  1           2049/tcp   status
|   100024  1           2049/tcp6  status
|   100024  1           2049/udp   status
|_  100024  1           2049/udp6  status
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
2049/tcp open  nlockmgr      1-4 (RPC #100021)
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode:
|   3:1:1:
|_    Message signing enabled but not required
|_clock-skew: -1s
| smb2-time:
|   date: 2023-09-27T17:35:56
|_  start_date: N/A
```

## FTP - port 21

Based on the Nmap scan results, it appears that port 21/tcp is open, the FTP server allows anonymous FTP login, as indicated by the line "|\_ftp-anon: Anonymous FTP login allowed (FTP code 230)." This means that users can log in to the FTP server without providing a username or password, using anonymous FTP access. But when we access the FTP server, we don't find any files.

## HTTP - port 80

```bash
┌──(rether㉿rether)-[~]
└─$ gobuster dir --url=http://10.10.10.180/ --wordlist=/usr/share/wordlists/dirb/common.txt
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.10.180/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirb/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/about-us             (Status: 200) [Size: 5441]
/Blog                 (Status: 200) [Size: 5001]
/blog                 (Status: 200) [Size: 5001]
/contact              (Status: 200) [Size: 7880]
/Contact              (Status: 200) [Size: 7880]
/Home                 (Status: 200) [Size: 6703]
/home                 (Status: 200) [Size: 6703]
/install              (Status: 302) [Size: 126] [--> /umbraco/]
/intranet             (Status: 200) [Size: 3323]
/master               (Status: 500) [Size: 3420]
/people               (Status: 200) [Size: 6739]
/People               (Status: 200) [Size: 6739]
/person               (Status: 200) [Size: 2741]
/product              (Status: 500) [Size: 3420]
/products             (Status: 200) [Size: 5328]
/Products             (Status: 200) [Size: 5328]
/umbraco              (Status: 200) [Size: 4040]
Progress: 4614 / 4615 (99.98%)
===============================================================
Finished
===============================================================
```

