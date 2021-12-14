[Walkthrough](./README.md)

# Tracking page views

## Per page

You can add page tracking per Angular component on their initialization. You will need to import Oculr's `EventDispatchService` and call its `trackPageView()` method during `ngOnInit()`.

```typescript
import { Component, OnInit } from '@angular/core';
import { EventDispatchService } from 'oculr-ngx';

@Component({
  selector: 'app-my',
  templateUrl: './my.component.html',
})
export class MyComponent implements OnInit {
  constructor(private eventDispatchService: EventDispatchService) {}

  ngOnInit(): void {
    this.eventDispatchService.trackPageView();
  }
}
```

## All pages

This approach works best if you're looking to only track a limited number of pages. If you would like to capture all page views you can take advantage of Angular's Router service in your `AppComponent`. Similarly to the per page approach, you will need to call the `trackPageView()` method, but you will do so as part of an observable pipe off of Angular's `Router` service.

```typescript
import { Component, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { EventDispatchService } from 'oculr-ngx';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private router: Router, private eventDispatchService: EventDispatchService) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event: Event) => event instanceof NavigationEnd),
        tap(() => this.eventDispatch.trackPageView())
      )
      .subscribe();
  }
}
```

Running your app with either setup will result in page view events being dispatched to your browser's console.

## Next steps

[< Previous: Getting started](02-tracking-pages.md) | [Walkthrough](README.md) | [Next: Track display events >]()

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/oculr-ngx/issues/new/choose) or [PR](https://github.com/Progressive/oculr-ngx/blob/main/CONTRIBUTING.md).
