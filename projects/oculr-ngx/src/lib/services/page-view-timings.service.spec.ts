/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { ApplicationRef } from '@angular/core';
import {
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  Router,
} from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import type { Mock } from 'vitest';
import { PageViewTimingsService } from './page-view-timings.service';
import { DispatchService } from './dispatch.service';
import { AnalyticEventType } from '../models/analytic-event-type.enum';

describe('PageViewTimingsService', () => {
    let service: PageViewTimingsService;
    let routerEvents: Subject<Event>;
    let isStable: BehaviorSubject<boolean>;
    let dispatch: Mock;
    let nowSpy: Mock<() => number>;

    beforeEach(() => {
        // Fake only the timer functions so Date.now() can be controlled
        // independently of the 200 ms stability debounce clock.
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
        nowSpy = vi.spyOn(Date, 'now');
        routerEvents = new Subject<Event>();
        isStable = new BehaviorSubject(false);
        dispatch = vi.fn();

        const appRef = { isStable: isStable.asObservable() } as unknown as ApplicationRef;
        const router = { events: routerEvents.asObservable() } as unknown as Router;
        const dispatchService = { trackPageView: dispatch } as unknown as DispatchService;
        service = new PageViewTimingsService(appRef, router, dispatchService);
    });

    afterEach(() => {
        service.ngOnDestroy();
        routerEvents.complete();
        isStable.complete();
        nowSpy.mockRestore();
        vi.useRealTimers();
    });

    describe('when a matched navigation completes', () => {
        it('emits exactly once after the stability debounce with the correct elapsed duration', () => {
            nowSpy.mockReturnValue(1000);
            routerEvents.next(new NavigationStart(1, '/a'));
            nowSpy.mockReturnValue(1050);
            routerEvents.next(new NavigationEnd(1, '/a', '/a'));

            // The app becomes stable; the 200 ms debounce must elapse first.
            isStable.next(true);
            nowSpy.mockReturnValue(1350);
            vi.advanceTimersByTime(200);

            expect(dispatch).toHaveBeenCalledTimes(1);
            expect(dispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    label: 'Page View Timings',
                    value: '350',
                    duration: 350,
                    eventType: AnalyticEventType.PAGE_VIEW_EVENT,
                }),
            );
        });

        it('does not emit before the stability debounce has elapsed', () => {
            nowSpy.mockReturnValue(1000);
            routerEvents.next(new NavigationStart(1, '/a'));
            nowSpy.mockReturnValue(1050);
            routerEvents.next(new NavigationEnd(1, '/a', '/a'));

            isStable.next(true);
            vi.advanceTimersByTime(199);
            expect(dispatch).not.toHaveBeenCalled();

            nowSpy.mockReturnValue(1350);
            vi.advanceTimersByTime(1);
            expect(dispatch).toHaveBeenCalledTimes(1);
        });
    });

    describe('when a newer navigation supersedes a pending measurement', () => {
        it('cancels an earlier stability wait on a new start even before the new navigation ends', () => {
            nowSpy.mockReturnValue(1000);
            routerEvents.next(new NavigationStart(1, '/a'));
            nowSpy.mockReturnValue(1050);
            routerEvents.next(new NavigationEnd(1, '/a', '/a'));

            // A new start cancels A's pending wait; B has not ended yet.
            nowSpy.mockReturnValue(1100);
            routerEvents.next(new NavigationStart(2, '/b'));

            isStable.next(true);
            vi.advanceTimersByTime(200);
            expect(dispatch).not.toHaveBeenCalled();
        });

        it('emits only the latest navigation measurement for rapid A/B navigation', () => {
            nowSpy.mockReturnValue(1000);
            routerEvents.next(new NavigationStart(1, '/a'));
            nowSpy.mockReturnValue(1050);
            routerEvents.next(new NavigationEnd(1, '/a', '/a'));

            nowSpy.mockReturnValue(1100);
            routerEvents.next(new NavigationStart(2, '/b'));
            nowSpy.mockReturnValue(1150);
            routerEvents.next(new NavigationEnd(2, '/b', '/b'));

            isStable.next(true);
            nowSpy.mockReturnValue(1350);
            vi.advanceTimersByTime(200);

            // Only B is measured (1350 - 1100 = 250); A's subscriber is cancelled.
            expect(dispatch).toHaveBeenCalledTimes(1);
            expect(dispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    label: 'Page View Timings',
                    value: '250',
                    duration: 250,
                    eventType: AnalyticEventType.PAGE_VIEW_EVENT,
                }),
            );
        });
    });

    describe('when a navigation does not complete successfully', () => {
        it('emits nothing for an unmatched NavigationEnd', () => {
            nowSpy.mockReturnValue(1000);
            routerEvents.next(new NavigationEnd(99, '/x', '/x'));

            isStable.next(true);
            vi.advanceTimersByTime(200);
            expect(dispatch).not.toHaveBeenCalled();
        });

        it('emits nothing for a cancelled navigation', () => {
            nowSpy.mockReturnValue(1000);
            routerEvents.next(new NavigationStart(1, '/a'));
            routerEvents.next(new NavigationCancel(1, '/a', 'cancelled', 0));

            isStable.next(true);
            vi.advanceTimersByTime(200);
            expect(dispatch).not.toHaveBeenCalled();
        });

        it('emits nothing for an errored navigation', () => {
            nowSpy.mockReturnValue(1000);
            routerEvents.next(new NavigationStart(1, '/a'));
            routerEvents.next(new NavigationError(1, '/a', new Error('failed')));

            isStable.next(true);
            vi.advanceTimersByTime(200);
            expect(dispatch).not.toHaveBeenCalled();
        });

        it('emits nothing for a skipped navigation', () => {
            nowSpy.mockReturnValue(1000);
            routerEvents.next(new NavigationStart(1, '/a'));
            routerEvents.next(new NavigationSkipped(1, '/a', 'skipped', 0));

            isStable.next(true);
            vi.advanceTimersByTime(200);
            expect(dispatch).not.toHaveBeenCalled();
        });
    });

    describe('when stability is interrupted', () => {
        it('lets a false stability emission interrupt a pending true debounce and finish on later sustained stability', () => {
            isStable.next(true);
            nowSpy.mockReturnValue(1000);
            routerEvents.next(new NavigationStart(1, '/a'));
            nowSpy.mockReturnValue(1050);
            routerEvents.next(new NavigationEnd(1, '/a', '/a'));

            // A false emission interrupts the pending true debounce.
            isStable.next(false);
            vi.advanceTimersByTime(200);
            expect(dispatch).not.toHaveBeenCalled();

            // Later sustained stability finishes the active measurement.
            isStable.next(true);
            nowSpy.mockReturnValue(1500);
            vi.advanceTimersByTime(200);
            expect(dispatch).toHaveBeenCalledTimes(1);
            expect(dispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    label: 'Page View Timings',
                    value: '500',
                    duration: 500,
                    eventType: AnalyticEventType.PAGE_VIEW_EVENT,
                }),
            );
        });
    });

    describe('when the service is destroyed', () => {
        it('cancels pending work and prevents later dispatch', () => {
            nowSpy.mockReturnValue(1000);
            routerEvents.next(new NavigationStart(1, '/a'));
            nowSpy.mockReturnValue(1050);
            routerEvents.next(new NavigationEnd(1, '/a', '/a'));

            service.ngOnDestroy();

            isStable.next(true);
            vi.advanceTimersByTime(200);
            expect(dispatch).not.toHaveBeenCalled();

            // Router events are no longer observed after destruction.
            nowSpy.mockReturnValue(1200);
            routerEvents.next(new NavigationStart(2, '/b'));
            nowSpy.mockReturnValue(1250);
            routerEvents.next(new NavigationEnd(2, '/b', '/b'));
            isStable.next(true);
            vi.advanceTimersByTime(200);
            expect(dispatch).not.toHaveBeenCalled();
        });
    });
});
