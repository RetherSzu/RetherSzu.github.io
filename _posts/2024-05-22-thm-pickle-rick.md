---
layout: post
title: THM - Pickle Rick
date: 2024-05-22 12:38 +0200
image:
    path: /assets/img/posts/thm-pickle-rick/pickle-rick-card.png
    alt: The Pickle rick card
categories: [ THM ]
---

## Introduction

In this detailed guide to the “THM - Pickle Rick” challenge, we explore network scanning with Nmap, uncover hidden web
directories and files, and utilize command execution for discovering secret ingredients.

## Enumeration

### Nmap

We initiated a network scan using Nmap and obtained the following results, revealing open ports and service versions:

```bash
┌──(rether㉿rether)-[~]
└─$ nmap -A 10.10.217.175    
Nmap scan report for 10.10.217.175
Host is up (0.075s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 0b:cb:40:78:76:04:13:1e:6d:87:6e:41:af:0c:7c:fe (RSA)
|   256 fb:9c:17:05:85:e1:d8:07:c9:ce:06:e8:a0:0e:53:cf (ECDSA)
|_  256 97:3f:50:20:a7:30:a9:12:1e:28:5a:28:56:3d:00:2f (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-title: Rick is sup4r cool
|_http-server-header: Apache/2.4.41 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

While examining the web page's source code, we discovered a hidden comment containing a username:

```html
<!--

    Note to self, remember username!

    Username: R1ckRul3s

-->
```

### Directory Enumeration with Gobuster

Using Gobuster, we identified several hidden directories and files:

```bash
┌──(rether㉿rether)-[~]
└─$ gobuster dir -u http://10.10.217.175/ -w /usr/share/seclists/Discovery/Web-Content/common.txt -x txt,zip,sql,html,php -t 60 -k -b 404,403
[...]
/index.html           (Status: 200) [Size: 1062]
/index.html           (Status: 200) [Size: 1062]
/login.php            (Status: 200) [Size: 882]
/portal.php           (Status: 302) [Size: 0] [--> /login.php]
/robots.txt           (Status: 200) [Size: 17]
[...]
```

The robots.txt file revealed Rick Sanchez's favorite phrase:

```bash
Wubbalubbadubdub
```

Using this phrase as a password, along with the username discovered on the index page, we successfully accessed the
portal page through the login page.

### Interacting with the Portal Page

![Portal page](/assets/img/posts/thm-pickle-rick/portal-page.png "Portal page")
_Portal page_

The portal page includes an input field that allows command execution on the server.

![Portal page id command](/assets/img/posts/thm-pickle-rick/portal-page-id-command.png "Portal page id command")

By using the `ls` command, we could view the directory contents

![Portal page ls command](/assets/img/posts/thm-pickle-rick/portal-page-ls-command.png "Portal page ls command")

Attempting to view the contents of `Sup3rS3cretPickl3Ingred.txt` with the command `cat Sup3rS3cretPickl3Ingred.txt`
resulted in an error message.

![Portal page cat command](/assets/img/posts/thm-pickle-rick/portal-page-cat-command.png "Portal page cat command")

The `cat` command was unavailable; however, we successfully used the `less` command to read the file's contents:

![Portal page less command](/assets/img/posts/thm-pickle-rick/portal-page-less-command.png "Portal page less command")

Delving deeper into the directories, we located the second ingredient in Rick's home directory:

![Portal page second ingredients](/assets/img/posts/thm-pickle-rick/portal-page-less-command-secon-ingredients.png "Portal page second ingredients")

The third ingredient should be located in the root directory.
To determine the permissions of the user, we executed `sudo -l`:

![Portal page sudo -l command](/assets/img/posts/thm-pickle-rick/portal-page-sudo-l-command.png "Portal page sudo -l command")

Given that the user `www-data` has unrestricted sudo access without requiring a password, we leveraged this privilege to
access the third ingredient from the root directory. The content of the root directory was as follows:

![Portal page root directory](/assets/img/posts/thm-pickle-rick/portal-page-root-directory.png "Portal page root directory")

We retrieved the third ingredient using the command `sudo less /root/3rd.txt`:

![Portal page third ingredient](/assets/img/posts/thm-pickle-rick/portal-page-third-ingredient.png "Portal page third ingredient")

So the ingredients are:

- mr. meeseek hair
- 1 jerry tear
- fleeb juice

## Conclusion

The THM Pickle Rick room provided an engaging and straightforward experience. The process of discovering hidden
ingredients was creatively designed, making the room both educational and enjoyable to solve.

![Pickle Rick banner](/assets/img/posts/thm-pickle-rick/pickle-rick-banner.png "Pickle Rick banner")
