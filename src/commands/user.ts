import GithubListAllPRs from "../base";
import { Flags } from "@oclif/core";

export default class GithubListAllUserPRs extends GithubListAllPRs {
  static description =
    "List all PRs of all repositories under a personal user account.";

  user = true;

  static flags = {
    ...GithubListAllPRs.flags,
    collaborator: Flags.boolean({
      description:
        "List all PRs of all repositories that the user is a collaborator on (only usable if the specified user is the authenticated user).",
      default: false,
    }),
  };

  async run(): Promise<void> {
    return super.run(GithubListAllUserPRs);
  }

  static args = [
    {
      name: "username",
      description: "The username of the user to list all repository PRs of.",
      required: true,
    },
  ];
}
