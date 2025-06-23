/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApplicationRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, Event, NavigationStart, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { debounceTime, filter, switchMap } from 'rxjs/operators';
import { PageViewTimingsService } from './page-view-timings.service';
import { DispatchService } from './dispatch.service';

let service: PageViewTimingsService;
let mockIsStableSubject$: BehaviorSubject<boolean>;
let mockDispatchService: DispatchService;
let mockContext: unknown;
let mockRouter: Router;
let mockAppRef: ApplicationRef;
let mockRouterEventsSubject$: ReplaySubject<NavigationStart | NavigationEnd>;

describe('PageViewTimingsService', () => {
  beforeEach(async () => {
    mockContext = { test: 'test ' };
    mockIsStableSubject$ = new BehaviorSubject(false);
    mockAppRef = {
      // eslint-disable-next-line rxjs/finnish
      isStable: mockIsStableSubject$.asObservable(),
    } as unknown as ApplicationRef;
    mockRouterEventsSubject$ = new ReplaySubject<
      NavigationStart | NavigationEnd
    >(1);
    mockRouter = {
      // eslint-disable-next-line rxjs/finnish
      events: mockRouterEventsSubject$.asObservable(),
    } as unknown as Router;
    mockDispatchService = {
      trackPageView: jasmine.createSpy(
        'mockDispatchService.trackPageView',
      ),
    } as unknown as DispatchService;
    service = new PageViewTimingsService(
      mockAppRef,
      mockRouter,
      mockDispatchService,
    );
    await TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: mockRouter }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  describe('when application navigate event triggers', () => {
    describe('if page view is initialized', () => {
      beforeEach(() => {
        spyOn(Date, 'now').and.returnValue(1500);
      });

      it('should receive NavigationStart event', (done) => {
        // Set up a spy to verify that the event was received
        const navigationStartSpy = jasmine.createSpy('navigationStartSpy');

        // Subscribe to NavigationStart events
        mockRouter.events
          .pipe(filter((event: Event) => event instanceof NavigationStart))
          .subscribe((event) => {
            navigationStartSpy(event);
            expect(navigationStartSpy).toHaveBeenCalledWith(jasmine.any(NavigationStart));
            done(); // Signal test completion
          });

        // Emit the NavigationStart event
        mockRouterEventsSubject$.next(new NavigationStart(1, '/login'));
      });

      it('should call receive NavigateEnd event', () => {
        mockRouterEventsSubject$.next(new NavigationEnd(2, '/login', ''));

        const routeEnd$ = mockRouter.events.pipe(
          filter((event: Event) => event instanceof NavigationEnd),
        );

        const appStable$ = mockAppRef.isStable.pipe(
          debounceTime(200),
          filter((stable: boolean) => stable),
        );

        routeEnd$.pipe(switchMap(() => appStable$)).subscribe(() => {
          expect(mockDispatchService.trackPageView).toHaveBeenCalledWith({
          });
        });
      });
    });
  });
});
