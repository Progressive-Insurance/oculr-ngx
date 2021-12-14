# oculr-ngx

An analytics library that makes collecting data in an Angular app simple.

![build workflow](https://github.com/Progressive/oculr-ngx/actions/workflows/build.yml/badge.svg) ![publish workflow](https://github.com/Progressive/oculr-ngx/actions/workflows/publish.yml/badge.svg)

## What does it do?

Oculr is an Angular library that helps you capture analytic events occuring in your app. The following features give you insight into what your users are doing in your app and how your app is handling data and errors in the background.

- [Page views](docs/page-views.md)
- [API calls](docs/http-interceptor.md)
- [Errors](docs/app-error-event.md)
- [Content display](docs/display-directive.md)
- [Button and link interactions](docs/click-directive.md)
- [Form control interactions](docs/change-directive.md)
- [Sensitive information control interactions](docs/focus-directive.md)
- [General app events](docs/app-event.md)

## How can it help?

Oculr helps you know what you don't know.

Are your users finding the content you want them to? Are they getting stuck on a page or question? Is your app making redundant calls to an API? Is a feature not working leading to a subpar experience? These are just some of the questions Oculr can help answer.

## Where does the data go?

Where you want it.

Oculr can point to any destination that you want to use for tracking analytic data. By default it comes with a couple [preconfigured options](docs/init-and-config.md#available-destinations) for HTTP APIs and the console. Oculr also features the ability to [shape the data](docs/init-and-config.md#using-your-own-custom-event-object) based on your needs before being sent to an API.

## Quick start

Install Oculr.

```console
npm install oculr-ngx --save
```

Import Oculr to your app's Angular `AppModule`.

```typescript
import { OculrAngularModule } from 'oculr-ngx';

@NgModule({
  imports: [OculrAngularModule.forRoot()],
})
export class AppModule {}
```

Configure Oculr during app initialization in `AppModule`.

```typescript
import { ConfigurationService, Destinations } from 'oculr-ngx';

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [ConfigurationService],
      multi: true,
    },
  ],
})
export class AppModule {}

function initializeAppFactory(oculrConfigService: ConfigurationService): () => Observable<boolean> {
  oculrConfigService.loadAppConfig({
    destinations: [
      {
        name: Destinations.Console,
        sendCustomEvents: false,
      },
    ],
  });
  return () => of(true);
}
```

Then add the `oculrClick` directive to any button in your app.

```html
<button id="continue" oculrClick>Continue</button>
```

Run your app and you will see an analytic event get logged to your console when clicking the button.

Now that it's working you will likely want it to do more then log a single click to your console. Please check out our [walkthrough](docs/walkthrough/README.md) for more hands-on details to get the most out of Oculr.

## Documentation

- [Full API](docs/README.md)
- [Walkthrough](docs/walkthrough/README.md)
- [Configuration](docs/init-and-config.md)
- [Directives](docs/README.md#Directives)
- [Services](docs/README.md#Services)

## Updates

- [Check out our improvements](CHANGELOG.md)
- [See our latest release](https://github.com/Progressive/oculr-ngx/releases/latest)

## Contributing

### Want to help?

We're excited about your interest in the project. Have an idea, want to contribute some code, found a bug, expand some documentation? Awesome! Check out our [contribution guide](CONTRIBUTING.md) and then take a look at our [issues](https://github.com/Progressive/oculr-ngx/issues) and [discussions](https://github.com/Progressive/oculr-ngx/discussions). We recommend issues that have been labeled as `help wanted` or `good first issue`.

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
