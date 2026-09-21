/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { PageLoadPerformanceService } from './page-load-performance.service';
import { DispatchService } from './dispatch.service';
import { ConfigurationService } from './configuration.service';
import { Destinations } from '../models/destinations.enum';
import { AnalyticEventType } from '../models/analytic-event-type.enum';
import type { Mock } from 'vitest';

let service: PageLoadPerformanceService;
let mockConfigService: ConfigurationService;
let mockDispatchService: DispatchService;
let trackPageView: Mock;
let originalOnBlur: any;
let originalOnFocus: any;

describe('PageLoadPerformanceService', () => {
    beforeEach(() => {
        originalOnBlur = (window as any).onblur;
        originalOnFocus = (window as any).onfocus;
        mockConfigService = new ConfigurationService();
        mockConfigService.loadAppConfig({
            logHttpTraffic: false,
            destinations: [
                {
                    name: Destinations.Console,
                    sendCustomEvents: false,
                },
            ],
            applicationName: 'test'
        });
        trackPageView = vi.fn();
        mockDispatchService = {
            trackPageView,
        } as unknown as DispatchService;
        service = new PageLoadPerformanceService(mockDispatchService, mockConfigService);

    });

    describe('when the application becomes stable', () => {
        describe('if the window has a pageLoadStartTime time stamp', () => {
            beforeEach(() => {
                (window as any).pageLoadStartTime = 1000;
                vi.spyOn(Date, 'now').mockReturnValue(1500);
                service.initialize();
            });

            it('should dispatch a page load performance event', () => {
                expect(mockDispatchService.trackPageView).toHaveBeenCalled();
            });
        });
    });

    describe('if the window does not have a pageLoadStartTime time stamp', () => {
        beforeEach(() => {
            vi.spyOn(console, 'error');
            delete (window as any).pageLoadStartTime;
            service.initialize();
        });

        it('should not dispatch a page load performance event', () => {
            expect(mockDispatchService.trackPageView).not.toHaveBeenCalled();
        });

        it('should log an error to the console', () => {
            expect(console.error).toHaveBeenCalledWith('Error: PageLoadPerformanceService - No timestamp "pageLoadStartTime" found on window');
        });
    });

    // Dispatch real DOM events so the service's addEventListener-based
    // listeners are exercised the same way a browser would deliver them.
    const fireBlur = (): void => {
        window.dispatchEvent(new Event('blur'));
    };
    const fireFocus = (): void => {
        window.dispatchEvent(new Event('focus'));
    };

    describe('when focus/unfocus logging is enabled', () => {
        describe('when the window starts focused', () => {
            let nowSpy: Mock<() => number>;

            beforeEach(() => {
                (window as any).pageLoadStartTime = 1000;
                vi.spyOn(document, 'hasFocus').mockReturnValue(true);
                nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1000);
                service.initialize(true);
            });

            it('should emit the focused time when the window blurs', () => {
                nowSpy.mockReturnValue(2000);
                fireBlur();
                expect(mockDispatchService.trackPageView).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        label: 'test - Focused Time',
                        value: '1000',
                        eventType: AnalyticEventType.PAGE_VIEW_EVENT,
                    }),
                );
            });

            it('should emit the unfocused time when the window refocuses', () => {
                nowSpy.mockReturnValue(2000);
                fireBlur();
                nowSpy.mockReturnValue(3500);
                fireFocus();
                expect(mockDispatchService.trackPageView).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        label: 'test - Unfocused Time',
                        value: '1500',
                        eventType: AnalyticEventType.PAGE_VIEW_EVENT,
                    }),
                );
            });

            it('should calculate each interval from its own preceding transition across two cycles', () => {
                nowSpy.mockReturnValue(2000);
                fireBlur();
                expect(mockDispatchService.trackPageView).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        label: 'test - Focused Time',
                        value: '1000',
                        eventType: AnalyticEventType.PAGE_VIEW_EVENT,
                    }),
                );

                nowSpy.mockReturnValue(3000);
                fireFocus();
                expect(mockDispatchService.trackPageView).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        label: 'test - Unfocused Time',
                        value: '1000',
                        eventType: AnalyticEventType.PAGE_VIEW_EVENT,
                    }),
                );

                nowSpy.mockReturnValue(5000);
                fireBlur();
                expect(mockDispatchService.trackPageView).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        label: 'test - Focused Time',
                        value: '2000',
                        eventType: AnalyticEventType.PAGE_VIEW_EVENT,
                    }),
                );

                nowSpy.mockReturnValue(6000);
                fireFocus();
                expect(mockDispatchService.trackPageView).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        label: 'test - Unfocused Time',
                        value: '1000',
                        eventType: AnalyticEventType.PAGE_VIEW_EVENT,
                    }),
                );
            });
        });

        describe('when the window starts unfocused', () => {
            it('should emit the unfocused interval measured since initialization on the first focus', () => {
                (window as any).pageLoadStartTime = 1000;
                vi.spyOn(document, 'hasFocus').mockReturnValue(false);
                vi.spyOn(Date, 'now').mockReturnValue(1000);
                service.initialize(true);

                vi.spyOn(Date, 'now').mockReturnValue(2500);
                fireFocus();
                expect(mockDispatchService.trackPageView).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        label: 'test - Unfocused Time',
                        value: '1500',
                        eventType: AnalyticEventType.PAGE_VIEW_EVENT,
                    }),
                );
            });
        });

        describe('when the interval starts at a zero timestamp', () => {
            it('should retain the measured elapsed time', () => {
                vi.spyOn(console, 'error');
                (window as any).pageLoadStartTime = 0;
                vi.spyOn(document, 'hasFocus').mockReturnValue(true);
                vi.spyOn(Date, 'now').mockReturnValue(0);
                service.initialize(true);

                vi.spyOn(Date, 'now').mockReturnValue(1000);
                fireBlur();
                expect(mockDispatchService.trackPageView).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        label: 'test - Focused Time',
                        value: '1000',
                        eventType: AnalyticEventType.PAGE_VIEW_EVENT,
                    }),
                );
            });
        });
    });

    describe('when configuration is loaded after the service is constructed', () => {
        beforeEach(() => {
            // Rebuild the service against an unconfigured ConfigurationService so
            // the service is constructed before any application configuration loads.
            mockConfigService = new ConfigurationService();
            service = new PageLoadPerformanceService(mockDispatchService, mockConfigService);
        });

        it('should use the application name loaded after construction on the initial load event', () => {
            mockConfigService.loadAppConfig({
                logHttpTraffic: false,
                applicationName: 'First App',
            });
            (window as any).pageLoadStartTime = 1000;
            vi.spyOn(Date, 'now').mockReturnValue(1500);
            vi.spyOn(document, 'hasFocus').mockReturnValue(true);
            service.initialize();

            expect(mockDispatchService.trackPageView).toHaveBeenCalledWith(
                expect.objectContaining({
                    label: 'First App - Focused App Initialization Complete',
                    value: '500',
                    eventType: AnalyticEventType.PAGE_VIEW_EVENT,
                }),
            );
        });

        it('should use the application name loaded after construction on focus/blur events', () => {
            mockConfigService.loadAppConfig({
                logHttpTraffic: false,
                applicationName: 'First App',
            });
            (window as any).pageLoadStartTime = 1000;
            vi.spyOn(Date, 'now').mockReturnValue(1000);
            vi.spyOn(document, 'hasFocus').mockReturnValue(true);
            service.initialize(true);

            vi.spyOn(Date, 'now').mockReturnValue(2000);
            fireBlur();
            expect(mockDispatchService.trackPageView).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    label: 'First App - Focused Time',
                    value: '1000',
                    eventType: AnalyticEventType.PAGE_VIEW_EVENT,
                }),
            );
        });

        it('should use the most recent configuration on events after the configuration changes', () => {
            mockConfigService.loadAppConfig({
                logHttpTraffic: false,
                applicationName: 'First App',
            });
            (window as any).pageLoadStartTime = 1000;
            vi.spyOn(Date, 'now').mockReturnValue(1000);
            vi.spyOn(document, 'hasFocus').mockReturnValue(true);
            service.initialize(true);

            mockConfigService.loadAppConfig({
                logHttpTraffic: false,
                applicationName: 'Second App',
            });

            vi.spyOn(Date, 'now').mockReturnValue(2000);
            fireBlur();
            expect(mockDispatchService.trackPageView).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    label: 'Second App - Focused Time',
                    value: '1000',
                    eventType: AnalyticEventType.PAGE_VIEW_EVENT,
                }),
            );

            vi.spyOn(Date, 'now').mockReturnValue(3000);
            fireFocus();
            expect(mockDispatchService.trackPageView).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    label: 'Second App - Unfocused Time',
                    value: '1000',
                    eventType: AnalyticEventType.PAGE_VIEW_EVENT,
                }),
            );
        });

        it('should not dispatch a performance event when the configuration is updated alone', () => {
            mockConfigService.loadAppConfig({
                logHttpTraffic: false,
                applicationName: 'First App',
            });
            (window as any).pageLoadStartTime = 1000;
            vi.spyOn(Date, 'now').mockReturnValue(1000);
            vi.spyOn(document, 'hasFocus').mockReturnValue(true);
            service.initialize(true);
            trackPageView.mockClear();

            mockConfigService.loadAppConfig({
                logHttpTraffic: false,
                applicationName: 'Second App',
            });

            expect(mockDispatchService.trackPageView).not.toHaveBeenCalled();
        });

        it('should release the configuration subscription when the service is destroyed', () => {
            mockConfigService.loadAppConfig({
                logHttpTraffic: false,
                applicationName: 'First App',
            });
            (window as any).pageLoadStartTime = 1000;
            vi.spyOn(Date, 'now').mockReturnValue(1000);
            vi.spyOn(document, 'hasFocus').mockReturnValue(true);
            service.initialize(true);
            trackPageView.mockClear();

            service.ngOnDestroy();
            mockConfigService.loadAppConfig({
                logHttpTraffic: false,
                applicationName: 'Second App',
            });

            vi.spyOn(Date, 'now').mockReturnValue(2000);
            fireBlur();
            // Destruction tears the service down (subscription and listeners),
            // so a later configuration change cannot be observed on any event.
            expect(mockDispatchService.trackPageView).not.toHaveBeenCalled();
        });
    });

    describe('focus listener ownership and lifecycle', () => {
        beforeEach(() => {
            (window as any).pageLoadStartTime = 1000;
            vi.spyOn(document, 'hasFocus').mockReturnValue(true);
            vi.spyOn(Date, 'now').mockReturnValue(1000);
        });

        it('should preserve the application onfocus/onblur handlers after enabling', () => {
            const appBlur = vi.fn();
            const appFocus = vi.fn();
            window.onblur = appBlur;
            window.onfocus = appFocus;
            service.initialize(true);

            // The host handlers must remain intact (not overwritten by the service).
            expect(window.onblur).toBe(appBlur);
            expect(window.onfocus).toBe(appFocus);

            // The service still emits its own transition events.
            vi.spyOn(Date, 'now').mockReturnValue(2000);
            fireBlur();
            expect(mockDispatchService.trackPageView).toHaveBeenCalledWith(
                expect.objectContaining({ label: 'test - Focused Time' }),
            );
        });

        it('should emit one transition event per browser event after repeated enabling', () => {
            service.initialize(true);
            service.initialize(true);
            trackPageView.mockClear();

            vi.spyOn(Date, 'now').mockReturnValue(2000);
            fireBlur();
            expect(mockDispatchService.trackPageView).toHaveBeenCalledTimes(1);
            expect(mockDispatchService.trackPageView).toHaveBeenCalledWith(
                expect.objectContaining({ label: 'test - Focused Time' }),
            );
        });

        it('should stop transition events and preserve application handlers when disabled', () => {
            const appBlur = vi.fn();
            const appFocus = vi.fn();
            window.onblur = appBlur;
            window.onfocus = appFocus;
            service.initialize(true);
            trackPageView.mockClear();

            service.initialize(false);
            trackPageView.mockClear();
            vi.spyOn(Date, 'now').mockReturnValue(2000);
            fireBlur();
            fireFocus();

            expect(mockDispatchService.trackPageView).not.toHaveBeenCalled();
            expect(window.onblur).toBe(appBlur);
            expect(window.onfocus).toBe(appFocus);
        });

        it('should resume tracking with a fresh interval timestamp when re-enabled', () => {
            service.initialize(true);
            trackPageView.mockClear();

            vi.spyOn(Date, 'now').mockReturnValue(2000);
            fireBlur();
            trackPageView.mockClear();

            service.initialize(false);

            vi.spyOn(document, 'hasFocus').mockReturnValue(false);
            vi.spyOn(Date, 'now').mockReturnValue(5000);
            service.initialize(true);
            trackPageView.mockClear();

            vi.spyOn(Date, 'now').mockReturnValue(6000);
            fireFocus();
            expect(mockDispatchService.trackPageView).toHaveBeenCalledTimes(1);
            expect(mockDispatchService.trackPageView).toHaveBeenCalledWith(
                expect.objectContaining({
                    label: 'test - Unfocused Time',
                    value: '1000',
                }),
            );
        });

        it('should stop events on destruction and handle repeated disable/destroy harmlessly', () => {
            service.initialize(true);
            trackPageView.mockClear();

            service.ngOnDestroy();
            vi.spyOn(Date, 'now').mockReturnValue(2000);
            fireBlur();
            fireFocus();
            expect(mockDispatchService.trackPageView).not.toHaveBeenCalled();

            // Repeated disable/destroy must be harmless (no throw, no events).
            service.initialize(false);
            trackPageView.mockClear();
            service.ngOnDestroy();
            service.ngOnDestroy();
            fireBlur();
            fireFocus();
            expect(mockDispatchService.trackPageView).not.toHaveBeenCalled();
        });

        it('should install no transition listeners by default', () => {
            service.initialize();
            trackPageView.mockClear();

            vi.spyOn(Date, 'now').mockReturnValue(2000);
            fireBlur();
            fireFocus();
            expect(mockDispatchService.trackPageView).not.toHaveBeenCalled();
        });
    });

    // Cleanup to avoid test pollution
    afterEach(() => {
        service.ngOnDestroy();
        delete (window as any).pageLoadStartTime;
        (window as any).onblur = originalOnBlur;
        (window as any).onfocus = originalOnFocus;
        vi.restoreAllMocks();
    });
});
