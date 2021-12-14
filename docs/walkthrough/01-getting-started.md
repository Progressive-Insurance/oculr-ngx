[Walkthrough](./README.md)

# Getting started

## Create an Angular app

Before you can use Oculr you will need to have a working Angular app.

```console
npm install -g @angular/cli
ng new my-app
cd my-app
ng serve
```

## Install Oculr

Now you will need to add Oculr and configure the library on app initialization. For now you're going to configure it to just output the analytic events to your browser's console. Later in the walkthrough you will go through setting up alternate configurations that send your data to an API.

```console
npm install oculr-ngx --save
```

## Import module

Import Oculr to your app's Angular `AppModule`.

```typescript
import { OculrAngularModule } from 'oculr-ngx';
```

Then add the `OculrAngularModule` to your `AppModule` metadata's imports array.

```typescript
@NgModule({
  imports: [OculrAngularModule.forRoot()],
})
export class AppModule {}
```

## Configure

Configure Oculr during app initialization in your `AppModule` metadata's providers array.

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

## Next steps

Now you're ready to start capturing analytic events. This base setup is required, but every feature past this is optional.

[Walkthrough](README.md) | [Next: Track page views >](02-tracking-pages.md)

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/oculr-ngx/issues/new/choose) or [PR](https://github.com/Progressive/oculr-ngx/blob/main/CONTRIBUTING.md).
