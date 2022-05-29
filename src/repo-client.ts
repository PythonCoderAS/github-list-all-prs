import { Octokit } from "@octokit/rest";
import GithubWatchAllRepos from "./base";
import chalk = require("chalk");
import capitalize = require("lodash.capitalize");

/**
 * Parameters to pass to {@link RepoClient}.
 */
export interface RepoClientConstructorOptions {
  username: string;
  token: string | null;
  isUser: boolean;
  /**
   * Direct pass-through since these flags are specific to user/organization mode
   */
  flags?: { collaborator?: boolean; [key: string]: any }; // We need [key: string]: any to stop TS errors.
  command: GithubWatchAllRepos;
  private: boolean;
  open: boolean;
  closed: boolean;
  author?: string;
  label?: string;
  perRepoLimit?: number;
  totalLimit?: number;
}

/**
 * An interface for expected return data from Octokit repository listing methods.
 */
export interface RepoData {
  name: string;
  owner: { login: string };
  private: boolean;
}

/**
 * An interface for expected return data from Octokit pull request listing methods.
 */
export interface PRData {
  user: { name?: string | null } | null;
  labels: { name?: string }[];
  state: string;
  number: number;
  title: string;
}

/**
 * A class to make it easier to work with the octokit library. This stores the username and token for future use.
 */
export class RepoClient {
  username: string;
  octokit: Octokit;
  isUser: boolean;
  collaborator: boolean;
  command: GithubWatchAllRepos;
  privateRepos: boolean;
  open: boolean;
  closed: boolean;
  author?: string;
  label?: string;
  perRepoLimit?: number;
  totalLimit?: number;

  constructor(params: RepoClientConstructorOptions) {
    this.username = params.username;
    this.octokit = new Octokit({
      auth: params.token ?? undefined,
      userAgent: "github-list-all-prs",
    });
    this.isUser = params.isUser;
    this.collaborator = params.flags?.collaborator ?? false;
    this.command = params.command;
    this.privateRepos = params.private;
    this.open = params.open;
    this.closed = params.closed;
    this.author = params.author;
    this.label = params.label;
    this.perRepoLimit = params.perRepoLimit;
    this.totalLimit = params.totalLimit;
  }

  /**
   * Get a list of repositories for the user/org.
   * We only care about the name and owner attributes so there's no point in specifying any other properties.
   * @returns A list of repositories.
   */
  async getRepos(): Promise<RepoData[]> {
    if (this.isUser) {
      return this.octokit.paginate(this.octokit.repos.listForUser, {
        username: this.username,
        // eslint-disable-next-line camelcase -- Octokit API
        per_page: 100,
        type: this.collaborator ? "all" : "owner",
      });
    }

    return this.octokit.paginate(this.octokit.repos.listForOrg, {
      org: this.username,
      // eslint-disable-next-line camelcase -- Octokit API
      per_page: 100,
      type: "all",
    });
  }

  private getState(): "all" | "open" | "closed" {
    if (this.open && this.closed) {
      return "all";
    }

    if (this.open) {
      return "open";
    }

    return "closed";
  }

  async getPRs(repo: RepoData): Promise<PRData[]> {
    let prs: PRData[] = await this.octokit.paginate(this.octokit.pulls.list, {
      owner: repo.owner.login,
      repo: repo.name,
      // eslint-disable-next-line camelcase -- Octokit API
      per_page: 100,
      state: this.getState(),
      direction: "asc",
    });

    if (this.author) {
      prs = prs.filter((pr) => pr.user && pr.user.name === this.author);
    }

    if (this.label) {
      prs = prs.filter((pr) =>
        pr.labels.some((label) => label.name === this.label)
      );
    }

    return prs;
  }

  /**
   * Print the heading for a new repository.
   * @param repo The repository to print the heading for.
   * @param prs The list of PRs for the repository.
   * @param totalPRsDisplayed The number of PRs shown already for other repositories. This is useful due to {@link RepoClient.totalLimit}.
   * @return No return value.
   */
  public printRepoHeading(
    repo: RepoData,
    prs: PRData[],
    totalPRsDisplayed: number
  ): void {
    let heading = chalk.bold(`${repo.owner.login}/${repo.name}`);
    let displayablePRs = prs.length;
    if (this.perRepoLimit && displayablePRs > this.perRepoLimit) {
      displayablePRs = this.perRepoLimit;
    }

    if (
      this.totalLimit &&
      totalPRsDisplayed + displayablePRs > this.totalLimit
    ) {
      displayablePRs = this.totalLimit - totalPRsDisplayed;
    }

    heading +=
      displayablePRs === prs.length
        ? ` (${prs.length})`
        : ` (${displayablePRs}/${prs.length})`;
    console.log(chalk.underline(heading));
  }

  public printPR(repo: RepoData, pr: PRData): void {
    const consoleWidth: number = process.stdout.columns || 80;
    let outputString = `[${capitalize(pr.state)}] https://github.com/${
      repo.owner.login
    }/${repo.name}/pull/${pr.number}: `;
    const remainingLength = consoleWidth - outputString.length;
    const titleToShow =
      pr.title.length > remainingLength
        ? `${pr.title.slice(0, Math.max(0, remainingLength - 3))}...`
        : pr.title;
    outputString += titleToShow;
    return console.log(outputString);
  }

  async main(): Promise<void> {
    let repos: RepoData[];
    repos = await this.getRepos();
    if (!this.privateRepos) {
      repos = repos.filter((repo) => !repo.private);
    }

    console.log(
      `Listing PRs from ${repos.length} repositories. This may take a while.`
    );
    const allPRs = await Promise.all(repos.map((repo) => this.getPRs(repo)));
    let globalCount = 0;
    // eslint-disable-next-line unicorn/no-for-loop -- Broken for TypeScript
    for (let i = 0; i < repos.length; i++) {
      let perRepoCount = 0;
      const repo: RepoData = repos[i];
      const prs: PRData[] = allPRs[i];
      if (prs.length === 0) {
        continue;
      }

      this.printRepoHeading(repo, prs, globalCount);
      for (const pr of prs) {
        this.printPR(repo, pr);
        perRepoCount++;
        globalCount++;
        if (this.totalLimit && globalCount >= this.totalLimit) {
          return;
        }

        if (this.perRepoLimit && perRepoCount >= this.perRepoLimit) {
          return;
        }
      }

      console.log("");
    }
  }
}
