import GithubListAllPRs from "../base";

export default class GithubListAllOrgPRs extends GithubListAllPRs {
  static description = "List all PRs of all repositories under an organization.";

  user = false;

  static args = [
    {
      name: "username",
      description: "The username of the organization to list all repository PRs of.",
      required: true,
    },
  ];
}
