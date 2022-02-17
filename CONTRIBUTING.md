# Contributing to Oculr

> ### **Please hold off on contributing**
>
> We're currently in the process of finalizing our Contributor License Agreement (CLA) and cannot legally accept contributions at this time. We are very close on completing our automated CLA workflow so please check back soon if you're looking to contribute.

We warmly welcome any community contributions to this repository. As a contributor here are some helpful guidelines.

## Code of Conduct

Help us ensure a welcoming and inspiring community. Please read our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Found a bug?

If you've discovered a bug you can [submit an issue](https://github.com/Progressive/oculr-ngx/issues), or skip straight to [creating a pull request](#submitting-a-pr).

## Missing feature?

We can't wait to hear about your new ideas. Please consider the size of the feature you're proposing before taking your next steps.

**Small** - You can [submit an issue](https://github.com/Progressive/oculr-ngx/issues), or just [create a pull request](#submitting-a-pr).

**Large** - Please [detail an issue](https://github.com/Progressive/oculr-ngx/issues) so that it can be discussed. This gives us a chance to make sure we can coordinate the changes and helps ensure the easiest path forward for your changes.

## Submitting a PR

1. It's always good to double check existing PRs to avoid duplicating effort.
2. Please sign our [CLA](#signing-the-cla) before creating a PR. This is required for us to accept your changes.
3. [Fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) the repo.
4. Clone the newly forked repo under your account.

```console
git clone https://github.com/your-account/oculr-ngx.git
```

5. Create a new branch for your changes.

```console
git checkout -b your-new-branch-name
```

1. Make your changes, including any related testing and documentation. See our [coding standards](#coding-standards) for more details.
2. Run the full test suite.

```console
npm run test
```

1. Commit your changes using a descriptive commit message following our message conventions. We use these commit messages when generating release notes.

```console
git add --all
git commit -m "<type>: <short summary>"
                  |           |
                  |           └─> present tense, lower case, and no period at end
                  |
                  └─> feature|fix|test|docs|refactor|ci

```

9. Push your branch to GitHub

```console
git push -u origin your-new-branch-name
```

10. In GitHub [create a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) to `oculr:main`
11. Respond to feedback provided on the PR.

## Coding standards

- We recommend using the following extensions to help ensure a quick PR.
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- All changes must have at least one unit test
- All changes that change the public API must have documentation

## Signing the CLA

Please sign our Contributor License Agreement (CLA) before sending pull requests. It is required for us to accept your changes.

TODO: create CLA process
