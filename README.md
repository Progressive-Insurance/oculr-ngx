# oculr-ngx

An analytics library that makes collecting data in an Angular app simple.

![build workflow](https://github.com/Progressive/oculr-ngx/actions/workflows/build.yml/badge.svg) ![publish workflow](https://github.com/Progressive/oculr-ngx/actions/workflows/publish.yml/badge.svg)

## What does it do?

Oculr is an Angular library that helps you capture analytic events occuring in your app. The following features give you insight into what your users are doing in your app and how your app is handling data and errors in the background.

- [Page views](docs/page-views.md)
- [API calls](docs/http-interceptor.md)
- [Errors]()
- [Content display](docs/display-directive.md)
- [Button and link interactions](docs/click-directive.md)
- [Form control interactions](docs/change-directive.md)
- [Sensitive information control interactions]()

## How can it help?

Oculr helps you know what you don't know.

Are your users finding the content you want them to? Are they getting stuck on a page or question? Is your app making redundant calls to an API? Is a feature not working leading to a subpar experience? These are just some of the questions Oculr can help answer.

## Where does the data go?

Where you want it.

Oculr can point to any destination that you want to use for tracking analytic data. By default it comes with a couple [preconfigured options](docs/init-and-config.md#available-destinations) for HTTP APIs and the console. Oculr also features the ability to [shape the data](docs/init-and-config.md#using-your-own-custom-event-object) based on your needs before being sent to an API.

## Quick start

Install Oculr.

```node
npm install oculr-ngx --save
```

Configure Oculr during app initialization.

...

<!-- TODO: need details, may need to be pulled into another doc if too large -->

Check out our [walkthrough]() for more hands-on details to get the most out of Oculr.

## Documentation

- [Full API](docs/README.md)
- [Walkthrough]()
- [Configuration](docs/init-and-config.md)
- [Directives]()
- [Services]()

## Updates

- [Check out our improvements](CHANGELOG.md)
- [See our latest release](https://github.com/Progressive/oculr-ngx/releases/latest)

## Contributing

### Want to help?

We're excited about your interest in the project. Have an idea, want to contribute some code, found a bug, expand some documentation? Awesome! Check out our [contribution guide]() and then take a look at our [issues]() and [discussions](). We recommend issues that have been labeled as `help wanted` or `good first issue`.

### Local setup

Local setup and a quick few steps.

```node
git clone https://github.com/Progressive/oculr-ngx
cd oculr-ngx
npm install
npm run test
```

We recommend the following extensions to make the contribution process as seamless as possible.

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Code of conduct

Help us make this project open and inclusive. Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).
