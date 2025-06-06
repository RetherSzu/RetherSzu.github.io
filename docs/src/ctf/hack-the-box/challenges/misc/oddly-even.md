---
clayout: ctf
title: Oddly Even
date: 2025-01-04
image: /icon/hack-the-box/misc.svg
type: Hack The Box
ctf:
    - name: Oddly Even
      link: https://app.hackthebox.com/challenges/812
      pwned:
        - link: https://www.hackthebox.com/achievement/challenge/585215/812
          thumbnail: /ctf/hack-the-box/challenges/misc/oddly-even/pwned.png
---

## Challenge Description

The ghostly clock ticks strangely. Determine whether its chimes are even or odd to calm the restless spirits.

## Challenge Overview

This challenge is pretty simple we got a web page where we have a code editor. We need to create a script that will
return "even" or "odd" based on the input given.

![Oddly Even - Overview](/ctf/hack-the-box/challenges/misc/oddly-even/overview.png){style="display: block; margin: 0 auto"}

## Automation Script (python)

To resolve this challenge, we can create a simple python script that will return "even" or "odd" based on the input. We
also can use other languages like `C`, `C++` and `Rust`.

```python
# take in the number
n = int(input())

# calculate answer
if n % 2 == 0:
    answer = "even"
else:
    answer = "odd"

# print answer
print(answer)
```

After sumbitting the script, we will get the flag.
