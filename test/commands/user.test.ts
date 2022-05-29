import { expect, test } from "@oclif/test";

describe("github-list-all-prs user", () => {
  test.command(["user"]).exit(2).it("runs user command without args");
  test
    .stdout()
    .command(["user", "octokat"])
    .it("runs user command with octokat user", (ctx) =>
      expect(ctx.stdout).to.contain("Watching 8 repositories")
    );
  test
    .stdout()
    .command(["user", "--watch", "octokat"])
    .it("runs user command with octokat user and explicit watch mode", (ctx) =>
      expect(ctx.stdout).to.contain("Watching 8 repositories")
    );
  test
    .stdout()
    .command(["user", "--ignore", "octokat"])
    .it("runs user command with octokat user and ignore mode", (ctx) =>
      expect(ctx.stdout).to.contain("Ignoring 8 repositories")
    );
  test
    .stdout()
    .command(["user", "--unwatch", "octokat"])
    .it(
      "runs user command with octokat user and explicit unwatch mode",
      (ctx) => expect(ctx.stdout).to.contain("Unwatching 8 repositories")
    );
});
