# github-list-all-prs

List all PRs in all repositories belonging to an individual user/organization.

## Quickstart

```shell
npm install -g github-list-all-prs
GITHUB_TOKEN="<your-github-token>" github-list-all-prs user <user>
# Alternatively: GITHUB_TOKEN="<your-github-token>" github-list-all-prs organization <org>
```

## Features

### Tokens

Tokens need to be GitHub private access tokens with the `repo` scopes. If you do not want to list PRs for any private
repos, then the `public_repo` scope suffices. It is also possible to omit the token altogether, but it is highly
recommended to use a token because unauthenticated API requests have a very low ratelimit.

Tokens can either be given via the `--token` argument or via the `GITHUB_TOKEN` environment variable. Alternatively,
a `.env` file with `GITHUB_TOKEN=<token>` can also be created; see [dotenv](https://github.com/motdotla/dotenv) for more
information.

### User/Organization

There is one command for listing PRs for all repos of users and one command for listing PRs for all repos of
organizations. A user cannot be supplied to the organization command or vice versa, otherwise an NotFoundError will
occur.

#### User Mode: Collaborators

User mode contains an additional configuration option, `--collaborator` that works when the supplied user is the same
user that created the token the client is using. Specifying this option will cause the client to list PRs for all repos
of all repositories that the user is a collaborator on.

### PR Status

The client can show PRs in these states:

- `--open`: List all open PRs. This is the default operation.
- `--closed`: List all closed PRs.
- `--all`: List all PRs.

The states can be specified as a command line flag. Only one state may be specified at a time.

### Author Filter

The client can show PRs that have been authored by a specific user. Use the `--author=<username>` option to specify the
username of the PR author to filter by.

### Label Filter

The client can show PRs that have been labelled with a specific label. Use the `--label=<label>` option to specify the
label to filter by.

### Private Repos

Private repositories are included by default. In order to exclude them from the PR list, the `--no-private` option
can be supplied.

### Repo Limit

The number of PRs shown per repository can be limited using the `--repo-limit=<limit>` option. A limit of 0 is seen as
no limit.

### Global Limit

The number of PRs shown in total can be limited using the `--global-limit=<limit>` option. A limit of 0 is seen as no
limit.
