/* 
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/ 
 
import { ApplicationRef, Injectable } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { debounceTime, filter, take } from 'rxjs';
import { DispatchService } from './dispatch.service';
import { createAnalyticEvent } from '../models/create-analytic-event';
import { AnalyticEventType } from '../models/analytic-event-type.enum';
import { AnalyticEvent } from '../models/analytic-event.interface';

@Injectable({
  providedIn: 'root'
})
export class PageViewTimingsService {
  constructor(
    appRef: ApplicationRef,
    private router: Router,
    private dispatchService: DispatchService,
  ) {
    // if multiple navigation event instances can run at once may need to keep map with route as key and time as value
    // should not be possible per https://github.com/angular/angular/commit/b7baf632c0161692f15d13f718329ab54a0f938a
    let startTime: number = 0;
    const routeEnd$ = this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd),
    );
    const appStable$ = appRef.isStable.pipe(
      debounceTime(200),
      filter((stable: boolean) => stable),
    );
    this.router.events
      .pipe(filter((event: Event) => event instanceof NavigationStart))
      .subscribe(() => {
        startTime = Date.now();
      });

    routeEnd$
      .subscribe(() => {
        appStable$.pipe(take(1)).subscribe(() => {
          this.dispatchAnalyticsForPageViewTimings(
            'Page View Timings',
            Date.now() - startTime,
          );
        });
      });
  }
  private dispatchAnalyticsForPageViewTimings(
    label: string,
    duration: number,
  ): void {
    const event: AnalyticEvent = createAnalyticEvent({
        label,
        value: `${duration}`,
        duration: duration,
        eventType: AnalyticEventType.PAGE_VIEW_EVENT,
      });
    this.dispatchService.trackPageView(event);
  }
}
