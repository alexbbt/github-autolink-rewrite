const {Octokit} = require("@octokit/core");
const debounce = require('debounce');

class Github {

  constructor(token) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  async user() {
    const user = await this.octokit.request('GET /user', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    return user.data.login
  }

  async orgs() {
    const orgs = await this.octokit.request('GET /user/orgs', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    return orgs.data.map(org => org.login)
  }

  suggestRepos(org) {
    const repos = debounce((...args) => this.repos(...args), 100, true);
    return async (input) => {
      return repos(org, input);
    }
  }

  async repos(org, query) {
    const repos = await this.octokit.request(`GET /search/repositories`, {
      q: `org:${org} ${query}`,
      sort: 'updated',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    return repos.data.items.map(repo => repo.name);
  }

  async autolinks(org, repo) {
    const response = await this.octokit.request(`GET /repos/${org}/${repo}/autolinks`, {
      owner: org,
      repo: repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return response.data;
  }

  async createAutolink(org, repo, autolink) {
    return this.octokit.request(`POST /repos/${org}/${repo}/autolinks`, {
      owner: org,
      repo: repo,
      key_prefix: autolink.key_prefix,
      url_template: autolink.url_template,
      is_alphanumeric: autolink.is_alphanumeric,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
  }

  async deleteAutolink(org, repo, autolink_id) {
    return this.octokit.request(`DELETE /repos/${org}/${repo}/autolinks/${autolink_id}`, {
      owner: org,
      repo: repo,
      autolink_id: autolink_id,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
  }

}

module.exports = Github
