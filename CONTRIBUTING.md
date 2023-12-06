# Contributing to Oculr

We warmly welcome any community contributions to this repository. As a contributor here are some helpful guidelines.

## Code of Conduct

Help us ensure a welcoming and inspiring community. Please read our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Found a bug?

If you've discovered a bug you can [submit an issue](https://github.com/progressive-insurance/oculr-ngx/issues), or skip straight to [creating a pull request](#submitting-a-pr).

## Missing feature?

We can't wait to hear about your new ideas. Please consider the size of the feature you're proposing before taking your next steps.

**Small** - You can [submit an issue](https://github.com/progressive-insurance/oculr-ngx/issues), or just [create a pull request](#submitting-a-pr).

**Large** - Please [detail an issue](https://github.com/progressive-insurance/oculr-ngx/issues) so that it can be discussed. This gives us a chance to make sure we can coordinate the changes and helps ensure the easiest path forward for your changes.

## Submitting a PR

1. It's always good to double check existing PRs to avoid duplicating effort.

1. Please sign our [CLA](#signing-the-cla) before creating a PR. This is required for us to accept your changes.

1. [Fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) the repo.

1. Clone the newly forked repo under your account.
    ```console
    git clone https://github.com/your-account/oculr-ngx.git
    ```

1. Create a new branch for your changes.
    ```console
    git checkout -b your-new-branch-name
    ```

1. Make your changes, including any related testing and documentation. See our [coding standards](#coding-standards) for more details.

1. Run the full test suite.
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

1. Push your branch to GitHub
    ```console
    git push -u origin your-new-branch-name
    ```

1. In GitHub [create a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) to `oculr:main`.

1. Respond to feedback provided on the PR.

## Coding standards

- We recommend using the following extensions to help ensure a quick PR.
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- All changes must have at least one unit test
- All changes that change the public API must have documentation

## Signing the CLA

Before we can accept your contribution, we require that you sign our Contributor License Agreement (CLA). The process is automated via our pull request flow. Upon submitting your PR, our GitHub bot will determine whether or not you've previously signed our CLA. If you have not, it will provide a link for you to review. Once you have, you have two choices: 

1. Accept the agreement by directing a comment to our bot - `@progressive-open-source I accept`. Your answer will be recorded and your PR can move forward. You won't have to repeat the process for future submissions unless the agreement has been updated.
1. Reject the agreement by directing a comment to our bot - `@progressive-open-source I reject`. Your answer will be recorded and your PR will be blocked from moving forward. You can always accept the agreement later if you change your mind.
