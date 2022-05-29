import { expect, test } from "@oclif/test";

describe("github-list-all-prs user", () => {
  test.command(["user"]).exit(2).it("runs user command without args");
  test
    .stdout()
    .command(["user", "PythonCoderAS"])
    .it("runs user command with PythonCoderAS user", (ctx) =>
      expect(ctx.stdout).to.contain(
        "[Open] https://github.com/PythonCoderAS/GithubAPIIntegrationTest/pull/1: Github API PR Test 1"
      )
    );
  test
    .stdout()
    .command(["user", "--open", "PythonCoderAS"])
    .it(
      "runs user command with PythonCoderAS user and explicit open mode",
      (ctx) =>
        expect(ctx.stdout).to.contain(
          "[Open] https://github.com/PythonCoderAS/GithubAPIIntegrationTest/pull/1: Github API PR Test 1"
        )
    );
  test
    .stdout()
    .command(["user", "--closed", "PythonCoderAS"])
    .it(
      "runs user command with PythonCoderAS user and explicit closed mode",
      (ctx) =>
        expect(ctx.stdout).to.contain(
          "[Closed] https://github.com/PythonCoderAS/GithubAPIIntegrationTest/pull/2: Github API PR Test 2"
        )
    );
  test
    .stdout()
    .command(["user", "--all", "PythonCoderAS"])
    .it(
      "runs user command with PythonCoderAS user and explicit all mode",
      (ctx) => {
        console.error(ctx.stdout);
        expect(ctx.stdout).to.contain(
          "[Open] https://github.com/PythonCoderAS/GithubAPIIntegrationTest/pull/1: Github API PR Test 1"
        );
        expect(ctx.stdout).to.contain(
          "[Closed] https://github.com/PythonCoderAS/GithubAPIIntegrationTest/pull/2: Github API PR Test 2"
        );
      }
    );
});
