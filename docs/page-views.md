[API](./README.md) > [Page Views](./README.md#page-views)

# Page Views

## Description

A page view event is useful in tracking a user's path through your application. These events need to be manually dispatched by your client. A couple of [approaches](#implementation) are illustrated below.

## Event types

### PageViewEvent

A `PageViewEvent` is used to represent a user's visit to a page in your application.

| Event property | Description                                                                                                                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id             | A string identifier that defaults to the current route stored in the Angular router.                                                                                                                                                |
| activatedRoute | An `ActivatedRouteSnapshot` [object](https://angular.io/api/router/ActivatedRouteSnapshot) you can use to override the current value in the Angular router. This is useful when events are misrepresented due to navigation timing. |
| scopes         | An array of custom objects used to store the data you care about.                                                                                                                                                                   |
| eventType      | Always set to a value of 'PAGE_VIEW_EVENT'.                                                                                                                                                                                         |
| location       | The current location found in the Angular router when the call was made.                                                                                                                                                            |

## Implementation

There are two common approaches for tracking page views in your application.

### Using the Angular router

We can take advantage of the observability of the Angular router by dispatching a page view event whenever a `NavigationEnd` router event is detected.

```typescript
export class AnalyticsService {
  constructor(
    private router: Router,
    private eventDispatch: EventDispatchService,
  ) {}

  init(): void {
    this.router.events
      .pipe(
        filter((event: Event) => event instanceof NavigationEnd),
        tap((event: Event) => {
          this.eventDispatch.trackPageView();
        })
      )
      .subscribe();
  }
```

### Manually dispatching

You may find instances where this approach doesn't cover you. You may want to track a page that isn't handled by the router (i.e. modals). In these cases, you can manually dispatch a page view event.

```typescript
export class HomeComponent implements OnInit {
  constructor(private eventDispatch: EventDispatchService) {}

  ngOnInit(): void {
    this.eventDispatch.trackPageView();
  }
```

### Including custom data

In either of the above scenarios, you may want to customize the event being dispatched. You can do by passing a [PageViewEvent](#pageviewevent) into the `trackPageView` method.

```typescript
this.eventDispatch.trackPageView({ id: 'my new id' });
```
