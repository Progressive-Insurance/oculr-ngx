/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import type { Mock } from 'vitest';
import { PageLoadPerformanceService } from './page-load-performance.service';
import { DispatchService } from './dispatch.service';
import { ConfigurationService } from './configuration.service';
import { Destinations } from '../models/destinations.enum';

let service: PageLoadPerformanceService;
let mockConfigService: ConfigurationService;
let mockDispatchService: DispatchService;

describe('PageLoadPerformanceService', () => {
    beforeEach(() => {
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
        mockDispatchService = {
            trackPageView: vi.fn(),
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

    describe('focus/unfocus logging', () => {
        beforeEach(() => {
            vi.spyOn(document, 'hasFocus').mockReturnValue(true);
            (window as any).pageLoadStartTime = 1000;
        });

        afterEach(() => {
            service.ngOnDestroy();
            vi.restoreAllMocks();
            delete (window as any).pageLoadStartTime;
        });

        it('reports a positive unfocused duration on window focus', () => {
            // Regression: the unfocused duration was computed as (blurred - focused),
            // which is always negative because focused is set to "now" before the
            // subtraction. It is now (focused - blurred).
            const dateNowSpy = vi.spyOn(Date, 'now');
            dateNowSpy.mockReturnValue(0);
            service.initialize(true);
            // The user blurred (left) at t=1000, then returned (focused) at t=5000.
            service.blurred = 1000;
            dateNowSpy.mockReturnValue(5000);
            window.dispatchEvent(new Event('focus'));

            const calls = (mockDispatchService.trackPageView as Mock).mock.calls;
            const unfocusedEvent = calls
                .map((c) => c[0])
                .find((e: any) => e.label === 'test - Unfocused Time');
            expect(unfocusedEvent?.value).toEqual('4000');
        });

        it('attaches focus/blur listeners without clobbering existing window handlers', () => {
            // Regression: the service previously assigned window.onblur/onfocus,
            // overwriting any handlers the host application had registered. It now
            // uses addEventListener.
            const existingBlur = vi.fn();
            window.onblur = existingBlur;
            const addListenerSpy = vi.spyOn(window, 'addEventListener');
            vi.spyOn(Date, 'now').mockReturnValue(0);

            service.initialize(true);

            expect(addListenerSpy).toHaveBeenCalledWith('blur', expect.any(Function));
            expect(addListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
            expect(window.onblur).toBe(existingBlur);
        });
    });

    // Cleanup to avoid test pollution
    afterEach(() => {
        delete (window as any).pageLoadStartTime;
    });
});
