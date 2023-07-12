# github-autolink-rewrite

github-autolink-rewrite is a simple utility to rewrite your github autolinks after a Jira or similar migration.

## Autocomplete

The tool uses your github token to fetch a list of your organizations and repositories. This allows you to select one from the CLI. 


![Example Org Autocomplete](./images/orgs.png)

```text
? Which organization are we working with? ›
❯   alexbbt
    bell-towne-films
    file-in-the-hole
```

![Example Repo Autocomplete](./images/repos.png)

```text
? Which repository would you like to update? ›
❯   alexander.bell-towne.com
    app.bell-towne.com
    wedding.bell-towne.com
    blog.bell-towne.com
    video-portal
    www.bell-towne.com
    http.bell-towne.com
```


## Usage

Create a token on [github.com](https://github.com/settings/tokens) with repo read/write access. This is enough for our usage. Then run the tool and paste in the token. This token can be deleted as soon as the tool is finished running.

![Example Usage of Tool](./images/example.png)

#### Text example without color

```text
Welcome to the Github Autolink Rewrite tool!

I am going to ask you some questions to get to build the rewite plan.
Feel free to quit at any time. No changes will be made until you confirm the plan.

First we need a github access token so that we can access your account.
You can create one here: https://github.com/settings/tokens.
It should be a classic token with full repo access.
We will use this throughout the process to allow tab complete and
✔ What is your github acccess token? … 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
✔ Which organization are we working with? › alexbbt
✔ Which repository would you like to update? › www.bell-towne.com

Here are a few of the autolinks we found. What string would you like to replace?
For example: [https://jira.example.com/browse/XXX] => [https://https://example.atlassian.net/browse/XXX]
Here are the first few autolinks on this repo:
	https://jira.bell-towne.com/browse/BT-<num>
✔ What string should we find when replacing? … https://jira.bell-towne.com/browse/
✔ What string should we replace the above string with? … https://https://bell-towne.atlassian.net/browse/

Alright, we are ready to begin the rewrite process.
Please review the rewrite plan bellow. And choose your method.
Repo: 		alexbbt/www.bell-towne.com
Find: 		https://jira.bell-towne.com/browse/
Replace: 	https://https://bell-towne.atlassian.net/browse/
✔ Should we continue with the rewrite? … yes

Beginning Rewrite
Rewriting: https://jira.bell-towne.com/browse/BT-<num>
Rewrite Complete. Please verify on github: https://www.github.com/alexbbt/www.bell-towne.com/settings/key_links
```
