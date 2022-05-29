import { Command, Flags } from "@oclif/core";
import "dotenv/config";
import { RepoClient } from "./repo-client";

export default abstract class GithubListAllPRs extends Command {
  /**
   * Whether the command is running for a user or organization account. If the account is a personal user account,
   * the flag is set to `true`. If the account is an organization account, the flag is set to `false`.
   */
  abstract user: boolean;

  static flags = {
    version: Flags.version({ char: "v" }),
    help: Flags.help({ char: "h" }),
    token: Flags.string({
      char: "t",
      description: "Github personal access token to use.",
    }),
    "no-private": Flags.boolean({
      description: "Do not list PRs of private repositories.",
    }),
  };

  static args = [
    {
      name: "username",
      description: "The username of the user/organization to list all PRs of.",
      required: true,
    },
  ];

  /**
   * Get the token from the flags or from the environment.
   * @param flags The flags object from the oclif parser.
   * @return The token.
   * @protected
   */
  protected getToken(flags: { token?: string }): string {
    if (flags.token) {
      return flags.token;
    }

    if (process.env.GITHUB_TOKEN) {
      return process.env.GITHUB_TOKEN;
    }

    this.error(
      "You must provide a personal access token with the --token flag or set the GITHUB_TOKEN environment variable."
    );
  }

  /**
   * Get the state and ensure there are no duplicates.
   * @param flags The flags object from the oclif parser.
   * @return The state.
   * @protected
   */
  protected getState(flags: {
    open?: boolean;
    closed?: boolean;
    all?: boolean;
  }): {open: boolean, closed: boolean} {
    let openExists = flags.open !== undefined;
    const closedExists = flags.closed !== undefined;
    const allExists = flags.all !== undefined;
    if (
      [openExists, closedExists, allExists].filter((x) => x).length > 1
    ) {
      this.error(
        "You must only provide one of --open, --closed, or --all."
      );
    } else if (!openExists && !closedExists && !allExists) {
      openExists = true;
    }

    if (allExists){
      return {
        open: true,
        closed: true,
      };
    } else if (openExists) {
      return {
        open: true,
        closed: false,
      };
    } else {
      return {
        open: false,
        closed: true,
      };
    }
  }

  async run(obj: typeof GithubListAllPRs = GithubListAllPRs) {
    const { args, flags } = await this.parse(obj);
    const token = this.getToken(flags);
    const {open, closed} = this.getState(flags)
    const client = new RepoClient({
      isUser: this.user,
      username: args.username,
      token,
      flags,
      command: this,
      private: !flags["no-private"],
      open,
      closed
    });
    await client.main();
  }
}
