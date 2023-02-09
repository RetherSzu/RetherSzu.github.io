---
layout: post
title: Hackt The Box > Weak RSA
date: '2023-02-07 23:10:36 +0100'
image:
  path: /assets/img/posts/weak-rsa/weak-rsa.png
  alt: Weak RSA card
categories: [HackTheBox, Beginner Track]
tags: [Hack-The-Box-Easy]
---


```bash
0bytes> ./RsaCtfTool.py --publickey ./key.pub --private
-----BEGIN RSA PRIVATE KEY-----
...
tSQPCPf7ygoUKh1KYeqXMpTmhKjRos3xioTy23CZuOl3WIsLiRKSVYyqBc9d8rxj
...
-----END RSA PRIVATE KEY-----
```

> Command explained :
 - `RsaCtfTool.py` : RSA tool for ctf - uncipher data from weak public key and try to recover private key Automatic selection of best attack for the given public key
 - `--publickey` : public rsa key to crack
 - `--private` : display private rsa key if recovered
{: .prompt-info }


Copy RSA private key in a new file and decrypt message `flag.enc` with openssl 

```bash
openssl pkeyutl -in flag.enc -out output.txt -decrypt -inkey key.priv
```

> Command explained :
 - `openssl` : OpenSSL is a cryptography software library or toolkit that makes communication over computer networks more secure. The OpenSSL program is a command-line tool for using the various cryptography functions of OpenSSL’s crypto library from the shell. It is generally used for Transport Layer Securit (TSL) or Secure Socket Layer(SSL) protocols. OpenSSL is licensed under an apache-style license, which means that under some simple license conditions, one can use the toolkit for commercial or non-commercial purposes.
 - `pkeyutl` : The pkeyutl command can be used to perform low-level public key operations using any supported algorithm.
 - `-in` : This specifies the input filename to read data from or standard input if this option is not specified.
 - `-out` : Specifies the output filename to write to or standard output by default.
 - `-decrypt` : Decrypt the input data using a private key.
 - `-inkey` : The input key file, by default it should be a private key.
{: .prompt-info }

And then display the contents of the `output.txt` file.

```bash
cat output.txt 
HTB{...}
```