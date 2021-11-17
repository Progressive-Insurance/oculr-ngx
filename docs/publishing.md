# Publishing

## How to

There are just a few steps to follow when releasing a new version of the library.

1. Open your preferred terminal and navigate to the _oculr-ngx_ repo.
2. Sync your local _main_ branch with the latest changes.
   ```node
   git pull
   ```
3. Navigate to the _projects/oculr-ngx_ subdirectory.
   ```
   cd projects/oculr-ngx
   ```
4. Update the _package.json_ file with the desired version value. This can be done manually or by using the [npm version](https://docs.npmjs.com/cli/v7/commands/npm-version) command.
5. Create a tag commit.
   ```node
   npm run tag-release
   ```
6. Push this new commit and its tag to the server.
   ```node
   git push
   git push --tags
   ```
7. Open a browser, navigate to the [oculr-ngx](https://github.com/Progressive/oculr-ngx) repo and enter the _Releases_ section.
8. Switch to the _Tags_ view and click on your newly-created tag.
9. Click on the _Create release from tag_ button.
10. Enter a title that matches the tag name and click the _Auto-generate release notes_ button to populate the changes in the release. If this is a pre-release version, be sure to check the _This is a pre-release_ checkbox.
11. When you're completely satisfied, click on the _Publish release_ button.

## Verify

The creation of a new release will kickoff a GitHub action that will rebuild, test and publish the release. You can verify its success by navigating to the [ci publish](https://github.com/Progressive/oculr-ngx/actions/workflows/publish.yml) workflow under the Actions tab.

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/oculr-ngx/issues/new/choose) or [PR](https://github.com/Progressive/oculr-ngx/blob/main/CONTRIBUTING.md).
