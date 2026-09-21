/* 
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/ 
 
import { ApplicationRef, Injectable, OnDestroy } from '@angular/core';
import {
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  Router,
} from '@angular/router';
import { debounceTime, filter, take } from 'rxjs';
import { Subscription } from 'rxjs';
import { DispatchService } from './dispatch.service';
import { createAnalyticEvent } from '../models/create-analytic-event';
import { AnalyticEventType } from '../models/analytic-event-type.enum';
import { AnalyticEvent } from '../models/analytic-event.interface';

@Injectable({
  providedIn: 'root'
})
export class PageViewTimingsService implements OnDestroy {
  // The navigation currently being measured, correlated by its router id.
  private pendingNavigationId: number | null = null;
  private pendingStartTime: number | null = null;
  // Explicitly managed stability wait so a superseded measurement can be
  // cancelled on a new NavigationStart (not only on the next NavigationEnd).
  private stabilitySubscription: Subscription | null = null;
  private routerSubscription: Subscription;

  constructor(
    private appRef: ApplicationRef,
    private router: Router,
    private dispatchService: DispatchService,
  ) {
    this.routerSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.onNavigationStart(event);
      } else if (event instanceof NavigationEnd) {
        this.onNavigationEnd(event);
      } else if (
        event instanceof NavigationCancel ||
        event instanceof NavigationError ||
        event instanceof NavigationSkipped
      ) {
        this.onNavigationFailed(event.id);
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.cancelStabilityWait();
    this.pendingNavigationId = null;
    this.pendingStartTime = null;
  }

  // A newer navigation supersedes any pending measurement: cancel the active
  // stability wait and start a fresh measurement for the new navigation.
  private onNavigationStart(event: NavigationStart): void {
    this.cancelStabilityWait();
    this.pendingNavigationId = event.id;
    this.pendingStartTime = Date.now();
  }

  // Only measure a navigation whose start we observed (matched by id). An
  // unmatched end has no captured start time and emits nothing.
  private onNavigationEnd(event: NavigationEnd): void {
    if (event.id !== this.pendingNavigationId || this.pendingStartTime === null) {
      return;
    }
    this.beginStabilityWait();
  }

  // Terminal failure for the pending navigation: drop the measurement.
  private onNavigationFailed(navigationId: number): void {
    if (navigationId === this.pendingNavigationId) {
      this.cancelStabilityWait();
      this.pendingNavigationId = null;
      this.pendingStartTime = null;
    }
  }

  // Wait until the application has been stable for the debounce interval, then
  // dispatch the measured duration. The wait is cancellable and one-shot.
  private beginStabilityWait(): void {
    this.cancelStabilityWait();
    const startTime = this.pendingStartTime;
    this.stabilitySubscription = this.appRef.isStable
      .pipe(
        debounceTime(200),
        filter((stable: boolean) => stable),
        take(1),
      )
      .subscribe(() => {
        this.stabilitySubscription = null;
        this.pendingNavigationId = null;
        this.pendingStartTime = null;
        if (startTime !== null) {
          this.dispatchAnalyticsForPageViewTimings(
            'Page View Timings',
            Date.now() - startTime,
          );
        }
      });
  }

  private cancelStabilityWait(): void {
    if (this.stabilitySubscription) {
      this.stabilitySubscription.unsubscribe();
      this.stabilitySubscription = null;
    }
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
