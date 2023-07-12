const Github = require('./github');
const prompts = require('prompts');
const color = require("cli-color");

function exitError() {
  process.exit(1)
}

class GithubAutolinkRewrite {
  constructor(github, org, repo, find, replace) {
    this.github = github;
    this.org = org;
    this.repo = repo;
    this.find = find;
    this.replace = replace;
  }

  static async run() {
    console.log('');
    console.log(color.blueBright('Welcome to the Github Autolink Rewrite tool!'));
    console.log('');
    console.log('I am going to ask you some questions to get to build the rewite plan.');
    console.log('Feel free to quit at any time. No changes will be made until you confirm the plan.');
    console.log('');

    console.log('First we need a github access token so that we can access your account.');
    console.log('You can create one here: ' + color.green('https://github.com/settings/tokens') + '.')
    console.log('It should be a classic token with full repo access.')
    console.log('We will use this throughout the process to allow tab complete and ')

    const token = await this.promptToken();
    const github = new Github(token);

    const user = await github.user();
    const orgs = await github.orgs();
    const org = await this.promptOrg(user, orgs);
    const repo = await this.promptRepo(github, org);

    const autolinks = await github.autolinks(org, repo);
    const find = await this.promptFind(autolinks);
    const replace = await this.promptReplace();

    console.log();
    console.log(color.blueBright('Alright, we are ready to begin the rewrite process.'));
    console.log(color.blueBright('Please review the rewrite plan bellow.'));
    console.log(`Repo: \t\t${color.green(`${org}/${repo}`)}\nFind: \t\t${color.red(find)}\nReplace: \t${color.yellow(replace)}`);

    const { good } = await prompts({
      type: 'confirm',
      name: 'good',
      message: 'Should we continue with the rewrite?',
      initial: true
    });
    if (!good) {
      process.exit(1);
    }

    const rewrite = new GithubAutolinkRewrite(github, org, repo, find, replace);
    rewrite.execute();
  }

  static async promptToken() {
    const { token } = await prompts({
      type: 'text',
      name: 'token',
      message: 'What is your github acccess token?',
    }, {
      onCancel: exitError,
    });

    return token;
  }

  static async promptOrg(user, orgs) {
    const list = [user, ...orgs].sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    }).map(item => ({ title: item }));

    const response = await prompts({
      type: 'autocomplete',
      name: 'org',
      message: 'Which organization are we working with?',
      choices: list,
      initial: 0,
    }, {
      onCancel: exitError,
    });

    return response.org;
  }

  static async promptRepo(github, org) {
    const repos = await github.repos(org, '');

    const list = repos.sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    }).map(item => ({ title: item }));

    const response = await prompts({
      type: 'autocomplete',
      name: 'repo',
      message: 'Which repository would you like to update?',
      choices: list,
      suggest: github.suggestRepos(org),
      initial: 0,
    }, {
      onCancel: exitError,
    });

    return response.repo;
  }

  static async promptFind(autolinks) {
    console.log();
    console.log(color.blueBright('Here are a few of the autolinks we found. What string would you like to replace?'));
    console.log('For example: [https://jira.example.com/browse/XXX] => [https://https://example.atlassian.net/browse/XXX]');
    console.log('Here are the first few autolinks on this repo:')
    autolinks.slice(0, 5).forEach(link => console.log('\t' + link.url_template));

    const { find } = await prompts({
      type: 'text',
      name: 'find',
      message: 'What string should we find when replacing?',
    }, {
      onCancel: exitError,
    });

    return find;
  }

  static async promptReplace() {
    const { replace } = await prompts({
      type: 'text',
      name: 'replace',
      message: 'What string should we replace the above string with?',
    }, {
      onCancel: exitError,
    });

    return replace;
  }

  async execute() {
    console.log();
    console.log(color.yellow('Beginning Rewrite'));
    const autolinks = await this.github.autolinks(this.org, this.repo);

    for (const autolink of autolinks) {
      await this.processRewrite(autolink);
    }

    console.log(color.green(`Rewrite Complete. Please verify on github: https://www.github.com/${this.org}/${this.repo}/settings/key_links`))
  }

  async processRewrite(autolink) {
    console.log(`Rewriting: ${autolink.url_template}`);
    const updated = {
      ...autolink,
      url_template: autolink.url_template.replace(this.find, this.replace),
    }
    try {
      await this.github.deleteAutolink(this.org, this.repo, autolink.id);
    } catch (e) {
      console.log(color.red('Error deleting old Autolink. Please review manually to ensure integrity.'))
      console.error(e);
      process.exit(1);
    }

    try {
      await this.github.createAutolink(this.org, this.repo, updated);
    } catch (e) {
      console.log(color.red('Error creating new Autolink. Please review manually to ensure integrity.'))
      console.error(e);
      process.exit(1);
    }
  }
}

module.exports = GithubAutolinkRewrite;
