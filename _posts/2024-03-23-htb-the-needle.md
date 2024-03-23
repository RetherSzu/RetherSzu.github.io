---
layout: post
title: Hack The Box - The needle
date: 2024-03-23 18:46 +0100
image:
    path: /assets/img/posts/the-needle/the-needle-card.png
    alt: The needle card
categories: [ Hack The Box, Hardware ]
---

# Challenge description

As a part of our SDLC process, we've got our firmware ready for security testing. Can you help us by performing a
security assessment?

# Introduction

In this exploration, we're delving into a firmware image to uncover login credentials, allowing us access to a specific
device. Initially, connecting to the device presents us with a login prompt, hinting that we need to find valid
credentials:

```bash
┌──(rether㉿rether)-[~/…/hardware/the-needle]
└─$ nc <host> <port>
ng-585215-hwtheneedle-fgl2p-696588f5ff-h8vvl login:
```

# Analyzing the Firmware Image:

The first step involves examining the firmware image we've obtained:

```bash
┌──(rether㉿rether)-[~/…/HTB/challenges/hardware/the-needle]
└─$ file firmware.bin 
firmware.bin: Linux kernel ARM boot executable zImage (big-endian)
```

The file is identified as an ARM boot executable, specifically a big-endian Linux kernel image. To dig deeper, we
use `binwalk` to extract its contents:

```bash
┌──(rether㉿rether)-[~/…/HTB/challenges/hardware/the-needle]
└─$ binwalk -e firmware.bin
```

Navigating the extracted contents, we stumbled upon a SquashFS filesystem:

```bash
┌──(rether㉿rether)-[~/…/challenges/hardware/the-needle/_firmware.bin.extracted]
└─$ ls    
3853.xz  3930  3930.xz  83948.squashfs  squashfs-root  squashfs-root-0
```

Within `squashfs-root`, we found a directory structure typical of Linux-based systems.

```bash
┌──(rether㉿rether)-[~/…/challenges/hardware/the-needle/_firmware.bin.extracted]
└─$ ls squashfs-root    
bin  dev  etc  lib  mnt  overlay  proc  rom  root  sbin  sys  tmp  usr  var  www
```

# Finding the Credentials:

To uncover the credentials, we search for the keyword `login` across all files within the extracted filesystem:

```bash
┌──(rether㉿rether)-[~/…/hardware/the-needle/_firmware.bin.extracted/squashfs-root]
└─$ grep -r "login" .
./lib/preinit/99_10_failsafe_login:failsafe_netlogin () {
./lib/preinit/99_10_failsafe_login:     ash --login
./lib/preinit/99_10_failsafe_login:     echo "Please reboot system when done with failsafe network logins"
./lib/preinit/99_10_failsafe_login:boot_hook_add failsafe failsafe_netlogin
grep: ./lib/libc.so: binary file matches
./lib/upgrade/common.sh:                                *procd*|*ash*|*init*|*watchdog*|*ssh*|*dropbear*|*telnet*|*login*|*hostapd*|*wpa_supplicant*|*nas*|*relayd*) : ;;
grep: ./sbin/rpcd: binary file matches
./usr/lib/lua/luci/model/cbi/admin_system/admin.lua:ra = s:option(Flag, "RootPasswordAuth", translate("Allow root logins with password"),
./usr/lib/lua/luci/model/cbi/admin_system/admin.lua:    translate("Allow the <em>root</em> user to login with password"))
./usr/lib/opkg/info/busybox.list:/bin/login
./usr/lib/opkg/info/base-files.list:/usr/libexec/login.sh
./usr/lib/opkg/info/base-files.list:/lib/preinit/99_10_failsafe_login
grep: ./usr/sbin/dropbear: binary file matches
grep: ./usr/sbin/pppd: binary file matches
./usr/libexec/login.sh:[ "$(uci get system.@system[0].ttylogin)" == 1 ] || exec /bin/ash --login
./usr/libexec/login.sh:exec /bin/login
./usr/share/rpcd/acl.d/unauthenticated.json:                                    "login"
grep: ./bin/busybox: binary file matches
./bin/config_generate:          set system.@system[-1].ttylogin='0'
grep: ./etc/ppp/chap-secrets: Permission denied
grep: ./etc/opkg/keys/792d9d9b39f180dc: Permission denied
grep: ./etc/shadow: Permission denied
./etc/scripts/telnetd.sh:       if [ -f "/usr/sbin/login" ]; then
./etc/scripts/telnetd.sh:               telnetd -l "/usr/sbin/login" -u Device_Admin:$sign      -i $lf &
./etc/profile:in order to prevent unauthorized SSH logins.
grep: ./etc/config/rpcd: Permission denied
grep: ./etc/config/uhttpd: Permission denied
./etc/inittab:::askconsole:/usr/libexec/login.sh
```

There is a lot of corresponding files.
But we can see that the file `etc/scripts/telnetd.sh` contains the following content:

```bash
#!/bin/sh
sign=`cat /etc/config/sign`
TELNETD=`rgdb
TELNETD=`rgdb -g /sys/telnetd`
if [ "$TELNETD" = "true" ]; then
        echo "Start telnetd ..." > /dev/console
        if [ -f "/usr/sbin/login" ]; then
                lf=`rgbd -i -g /runtime/layout/lanif`
                telnetd -l "/usr/sbin/login" -u Device_Admin:$sign      -i $lf &
        else
                telnetd &
        fi
fi 
```

The telnetd command is executed with the following parameters:

- `-l "/usr/sbin/login"`: The login command to execute
- `-u Device_Admin:$sign`: The username and password to use to log in

The username is `Device_Admin` and the password is the content of the file `etc/config/sign`.

Let's check the content of the file `etc/config/sign`:

```bash
┌──(rether㉿rether)-[~/…/hardware/the-needle/_firmware.bin.extracted/squashfs-root]
└─$ cat etc/config/sign
qS6-X/n]u>fVfAt!
```

# Get the flag

We've got the credentials to login into the device. Let's connect to the device and get the flag.

```bash
┌──(rether㉿rether)-[~/…/hardware/the-needle/_firmware.bin.extracted/squashfs-root]
└─$ nc 83.136.255.150 44141   
ng-585215-hwtheneedle-fgl2p-696588f5ff-h8vvl login: Device_Admin
Device_Admin
Password: qS6-X/n]u>fVfAt!

ng-585215-hwtheneedle-fgl2p-696588f5ff-h8vvl:~$ whoami  
whoami
Device_Admin
ng-585215-hwtheneedle-fgl2p-696588f5ff-h8vvl:~$ ls       
ls
flag.txt
ng-585215-hwtheneedle-fgl2p-696588f5ff-h8vvl:~$ cat flag.txt
cat flag.txt
HTB{************************}
```

![The needle pwned card](/assets/img/posts/the-needle/the-needle-pwned-card.png){: width="972" height="589" }