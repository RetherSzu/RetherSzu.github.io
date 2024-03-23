---
layout: post
title: Hack The Box - Photom lockdown
date: 2024-03-23 16:38 +0100
image:
  path: /assets/img/posts/photon-lockdown/photon-lockdown-card.png
  alt: Photon Lockdow card
categories: [Hack The Box, Hardware]
---

# Challenge description:

We've located the adversary's location and must now secure access to their Optical Network Terminal to disable their internet connection. Fortunately, we've obtained a copy of the device's firmware, which is suspected to contain hardcoded credentials. Can you extract the password from it?

# Enumeration

Upon decompressing the folder, we encounter three files:

- `fwu_ver`: An ASCII text file containing the firmware version number.
- `he_ver`: The purpose and content of this file need further investigation.
- `rootfs`: This is a Squashfs filesystem file. Squashfs is a compressed, read-only file format. We can decompress it using the `unsquashfs` command.

To decompress the filesystem, we utilize the `unsquashfs` command as follows:

```bash
┌──(rether㉿rether)-[~/…/challenges/hardware/photon-lockdown/ONT]
└─$ sudo unsquashfs rootfs
Parallel unsquashfs: Using 8 processors
865 inodes (620 blocks) to write

[=========================================================================================================================================================================================================================|] 1485/1485 100%

created 440 files
created 45 directories
created 187 symlinks
created 238 devices
created 0 fifos
created 0 sockets
created 0 hardlinks
```

The `unsquashfs` command generates a directory named `squashfs-root`, where it extracts the contents of the `rootfs` file. Navigating into this directory reveals the following structure:

```bash
┌──(rether㉿rether)-[~/…/hardware/photon-lockdown/ONT/squashfs-root]
└─$ ls
bin  config  dev  etc  home  image  lib  mnt  overlay  proc  run  sbin  sys  tmp  usr  var
```

This directory structure is characteristic of a Linux-based operating system. To search for the password, we explore the `etc` configuration directory:

```bash
┌──(rether㉿rether)-[~/…/hardware/photon-lockdown/ONT/squashfs-root]
└─$ ls etc
config                 default          fstab       inittab    modules-load.d                omci_ignore_mib_tbl.conf  ppp         ramfs.img     resolv.conf            runomci.sh  services              smb.conf      wscd.conf
config_default_hs.xml  dhclient-script  group       insdrv.sh  multiap.conf                  omci_mib.cfg              profile     rc_boot_dsp   rtk_tr142.sh           runsdk.sh   setprmt_reject        TZ
config_default.xml     dnsmasq.conf     inetd.conf  irf        omci_custom_opt.conf          orf                       protocols   rc_log_dsp    run_customized_sdk.sh  samba       shells                version
cups                   ethertypes       init.d      mdev.conf  omci_ignore_mib_tbl_10g.conf  passwd                    radvd.conf  rc_reset_dsp  runoam.sh              scripts     simplecfgservice.xml  version_info
```

By examining the `config_default.xml`, we discover the FLAG:

```bash
┌──(rether㉿rether)-[~/…/hardware/photon-lockdown/ONT/squashfs-root]
└─$ cat etc/config_default.xml | grep 'HTB'
<Value Name="SUSER_PASSWORD" Value="HTB{*****************}"/>
```

This challenge, while straightforward, demonstrates the process of exploring a compressed filesystem to uncover sensitive information.

![Card of pwned Photon Lockdown](/assets/img/posts/photon-lockdown/photon-lockdown-pwned-card.png){: width="972" height="589" }

