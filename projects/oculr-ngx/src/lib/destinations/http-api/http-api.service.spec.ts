/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
 */

import { HttpHeaders, HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, EMPTY, defer, of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { AnalyticsEventBusService } from '../../services/analytics-event-bus.service';
import { ConfigurationService } from '../../services/configuration.service';
import { AnalyticsInterceptor } from '../../interceptors/analytics.interceptor';
import { Destinations } from '../../models/destinations.enum';
import { HttpApiService } from './http-api.service';

describe('HttpApiService', () => {
  let mockZone: any;
  let mockHttp: any;
  let mockEventBus: any;
  let mockConfiguration: any;

  let mockEvents: BehaviorSubject<any>;
  let mockCustomEvents: BehaviorSubject<any>;
  let mockConfig: BehaviorSubject<any>;
  let mockResponse: BehaviorSubject<any>;

  let service: HttpApiService;

  beforeEach(() => {
    mockEvents = new BehaviorSubject<any>(undefined);
    mockCustomEvents = new BehaviorSubject<any>(undefined);
    mockConfig = new BehaviorSubject<any>(undefined);
    mockResponse = new BehaviorSubject<any>(undefined);

    mockZone = { runOutsideAngular: (func: () => void) => func.apply(this) };
    mockHttp = { request: vi.fn().mockReturnValue(mockResponse) };
    mockEventBus = { customEvents$: mockCustomEvents, events$: mockEvents };
    mockConfiguration = { appConfig$: mockConfig };

    service = new HttpApiService(mockConfiguration, mockEventBus, mockZone, mockHttp);
  });

  describe('init', () => {
    let logSpy: Mock;

    beforeEach(() => {
      logSpy = vi.spyOn(service, 'log');
    });

    it('events should not be logged before a config is set', async () => {
      vi.useFakeTimers();
      service.init();

      const event = { id: 'id' };
      mockEvents.next(event);
      mockCustomEvents.next(event);
      await vi.runAllTimersAsync();

      expect(logSpy).not.toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('events should not be logged when there is no HttpApi destination', async () => {
      vi.useFakeTimers();
      service.init();

      mockConfig.next({ destinations: [{ name: Destinations.Console, sendCustomEvents: false }] });
      const event = { id: 'id' };
      mockEvents.next(event);
      mockCustomEvents.next(event);
      await vi.runAllTimersAsync();

      expect(logSpy).not.toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('events should be logged to the standard event bus when sendCustomEvents is false', async () => {
      vi.useFakeTimers();
      service.init();

      mockConfig.next({
        destinations: [{ name: Destinations.HttpApi, sendCustomEvents: false, method: 'POST', endpoint: 'blah.com' }],
      });
      const event = { id: 'event' };
      const customEvent = { id: 'custom' };
      mockEvents.next(event);
      mockCustomEvents.next(customEvent);
      await vi.runAllTimersAsync();

      expect(logSpy).toHaveBeenCalledWith(event);
      vi.useRealTimers();
    });

    it('events should be logged to the custom event bus when sendCustomEvents is true', async () => {
      vi.useFakeTimers();
      service.init();

      mockConfig.next({
        destinations: [{ name: Destinations.HttpApi, sendCustomEvents: true, method: 'POST', endpoint: 'blah.com' }],
      });
      const event = { id: 'event' };
      const customEvent = { id: 'custom' };
      mockEvents.next(event);
      mockCustomEvents.next(customEvent);
      await vi.runAllTimersAsync();

      expect(logSpy).toHaveBeenCalledWith(customEvent);
      vi.useRealTimers();
    });
  });

  describe('destination removal', () => {
    let logSpy: Mock;
    let warnSpy: Mock;

    beforeEach(() => {
      logSpy = vi.spyOn(service, 'log');
      warnSpy = vi.spyOn(console, 'warn');
    });

    afterEach(() => {
      logSpy.mockRestore();
      warnSpy.mockRestore();
    });

    const enableHttpApi = (overrides: Record<string, unknown> = {}) => {
      mockConfig.next({
        logHttpTraffic: true,
        destinations: [
          { name: Destinations.HttpApi, sendCustomEvents: false, method: 'POST', endpoint: '/telemetry', ...overrides },
        ],
      });
    };

    it('should stop sending events after the HttpApi destination is removed with an empty destinations array', async () => {
      vi.useFakeTimers();
      service.init();

      enableHttpApi();
      const event1 = { id: 'event1' };
      mockEvents.next(event1);
      await vi.runAllTimersAsync();
      expect(logSpy).toHaveBeenCalledWith(event1);

      const callsAfterEnable = logSpy.mock.calls.length;

      mockConfig.next({ logHttpTraffic: true, destinations: [] });
      const event2 = { id: 'event2' };
      mockEvents.next(event2);
      await vi.runAllTimersAsync();

      expect(logSpy).not.toHaveBeenCalledWith(event2);
      expect(logSpy.mock.calls.length).toEqual(callsAfterEnable);
      vi.useRealTimers();
    });

    it('should stop sending events after the destinations property is omitted', async () => {
      vi.useFakeTimers();
      service.init();

      enableHttpApi();
      const event1 = { id: 'event1' };
      mockEvents.next(event1);
      await vi.runAllTimersAsync();
      expect(logSpy).toHaveBeenCalledWith(event1);

      const callsAfterEnable = logSpy.mock.calls.length;

      mockConfig.next({ logHttpTraffic: true });
      const event2 = { id: 'event2' };
      mockEvents.next(event2);
      await vi.runAllTimersAsync();

      expect(logSpy).not.toHaveBeenCalledWith(event2);
      expect(logSpy.mock.calls.length).toEqual(callsAfterEnable);
      vi.useRealTimers();
    });

    it('should stop sending events and warn when replaced with a config missing an endpoint', async () => {
      vi.useFakeTimers();
      service.init();

      enableHttpApi();
      const event1 = { id: 'event1' };
      mockEvents.next(event1);
      await vi.runAllTimersAsync();
      expect(logSpy).toHaveBeenCalledWith(event1);

      const callsAfterEnable = logSpy.mock.calls.length;

      mockConfig.next({
        logHttpTraffic: true,
        destinations: [{ name: Destinations.HttpApi, sendCustomEvents: false, method: 'POST' }],
      });
      expect(warnSpy).toHaveBeenCalledWith('An endpoint is required to send events to this destination');

      const event2 = { id: 'event2' };
      mockEvents.next(event2);
      await vi.runAllTimersAsync();

      expect(logSpy).not.toHaveBeenCalledWith(event2);
      expect(logSpy.mock.calls.length).toEqual(callsAfterEnable);
      vi.useRealTimers();
    });

    it('should stop sending events and warn when replaced with a config missing a method', async () => {
      vi.useFakeTimers();
      service.init();

      enableHttpApi();
      const event1 = { id: 'event1' };
      mockEvents.next(event1);
      await vi.runAllTimersAsync();
      expect(logSpy).toHaveBeenCalledWith(event1);

      const callsAfterEnable = logSpy.mock.calls.length;

      mockConfig.next({
        logHttpTraffic: true,
        destinations: [{ name: Destinations.HttpApi, sendCustomEvents: false, endpoint: '/telemetry' }],
      });
      expect(warnSpy).toHaveBeenCalledWith('An HTTP method is required to send events to this destination');

      const event2 = { id: 'event2' };
      mockEvents.next(event2);
      await vi.runAllTimersAsync();

      expect(logSpy).not.toHaveBeenCalledWith(event2);
      expect(logSpy.mock.calls.length).toEqual(callsAfterEnable);
      vi.useRealTimers();
    });

    it('should stop sending custom events after removal from custom-event mode and deliver a re-enabled event exactly once', async () => {
      vi.useFakeTimers();
      service.init();

      enableHttpApi({ sendCustomEvents: true });
      const customEvent1 = { id: 'custom1' };
      mockCustomEvents.next(customEvent1);
      await vi.runAllTimersAsync();
      expect(logSpy).toHaveBeenCalledWith(customEvent1);

      const callsAfterEnable = logSpy.mock.calls.length;

      mockConfig.next({ logHttpTraffic: true, destinations: [] });
      const customEvent2 = { id: 'custom2' };
      mockCustomEvents.next(customEvent2);
      await vi.runAllTimersAsync();

      expect(logSpy).not.toHaveBeenCalledWith(customEvent2);
      expect(logSpy.mock.calls.length).toEqual(callsAfterEnable);

      enableHttpApi({ sendCustomEvents: true });
      const customEvent3 = { id: 'custom3' };
      mockCustomEvents.next(customEvent3);
      await vi.runAllTimersAsync();

      const customEvent3Calls = logSpy.mock.calls.filter((call) => call[0] === customEvent3).length;
      expect(customEvent3Calls).toEqual(1);
      vi.useRealTimers();
    });
  });

  describe('integration: feedback loop with the analytics interceptor', () => {
    it('should make zero new requests after the destination is removed', async () => {
      vi.useFakeTimers();
      const realConfigService = new ConfigurationService();
      const realEventBus = new AnalyticsEventBusService();
      const mockTimeService = { now: () => 0 };
      const mockDispatchService = {
        trackApiStart: (context: any, request: any) => {
          realEventBus.dispatch({ request, eventType: 'api-start', ...context });
        },
        trackApiComplete: (context: any, response: any, request: any, duration: number) => {
          realEventBus.dispatch({ response, request, duration, eventType: 'api-complete', ...context });
        },
      };
      const interceptor = new AnalyticsInterceptor(mockDispatchService as any, mockTimeService, realConfigService);

      let requestCount = 0;
      const maxRequests = 10;
      const mockHttpClient = {
        request: (method: string, url: string, options?: any) => {
          requestCount++;
          if (requestCount > maxRequests) {
            return EMPTY;
          }
          const httpRequest = new HttpRequest(method, url, options?.body, {
            headers: options?.headers ? new HttpHeaders(options.headers) : undefined,
          });
          const handler = { handle: () => of(new HttpResponse({ status: 200 })) };
          return interceptor.intercept(httpRequest, handler);
        },
      };

      const realHttpApiService = new HttpApiService(realConfigService, realEventBus, mockZone, mockHttpClient as any);
      realHttpApiService.init();

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        destinations: [{ name: Destinations.HttpApi, sendCustomEvents: false, method: 'POST', endpoint: '/telemetry' }],
      });

      realEventBus.dispatch({ id: 'event1' });
      await vi.runAllTimersAsync();
      expect(requestCount).toBeGreaterThan(0);

      const countAfterEnable = requestCount;

      realConfigService.loadAppConfig({ logHttpTraffic: true, destinations: [] });

      realEventBus.dispatch({ id: 'event2' });
      await vi.runAllTimersAsync();

      expect(requestCount).toEqual(countAfterEnable);
      vi.useRealTimers();
    });
  });

  describe('log', () => {
    const event = { id: 'event' };
    let config: any;

    beforeEach(() => {
      config = {
        name: Destinations.HttpApi,
        sendCustomEvents: false,
        method: 'POST',
        endpoint: 'blah.com',
        headers: { Authorization: '1231-1231' },
      };
      service['loadAndValidateConfig'](config);
    });

    it('should handle valid requests successfully', async () => {
      vi.useFakeTimers();
      mockResponse.next({});
      await vi.runAllTimersAsync();

      service.log(event);

      expect(mockHttp.request).toHaveBeenCalledWith(config.method, config.endpoint, {
        headers: config.headers,
        body: event,
      });
      vi.useRealTimers();
    });

    describe('retry behavior', () => {
      let warnSpy: Mock;

      const makeError = (status: number, statusText = 'Internal server error') =>
        new HttpErrorResponse({ status, statusText });

      // A cold observable that actually errors (or succeeds) on each subscription and
      // counts subscriptions, because retryWhen resubscribes to the returned observable
      // rather than calling HttpClient.request again.
      const createColdHttp = (outcomes: Array<{ error: HttpErrorResponse } | { value: any }>) => {
        let attempts = 0;
        const observable = defer(() => {
          const outcome = outcomes[Math.min(attempts, outcomes.length - 1)];
          attempts++;
          return 'error' in outcome ? throwError(() => outcome.error) : of(outcome.value);
        });
        return { observable, getAttempts: () => attempts };
      };

      beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn');
      });

      afterEach(() => {
        vi.useRealTimers();
        warnSpy.mockRestore();
      });

      it('retries a status-0 failure at 1000, 3000, and 6000 ms with no premature attempts', async () => {
        vi.useFakeTimers();
        const { observable, getAttempts } = createColdHttp([{ error: makeError(0) }]);
        mockHttp.request.mockReturnValue(observable);

        service.log(event);
        expect(getAttempts()).toBe(1); // original attempt at t=0

        await vi.advanceTimersByTimeAsync(999);
        expect(getAttempts()).toBe(1); // no premature attempt before 1000 ms

        await vi.advanceTimersByTimeAsync(1); // t=1000
        expect(getAttempts()).toBe(2);

        await vi.advanceTimersByTimeAsync(1999); // t=2999
        expect(getAttempts()).toBe(2); // no premature attempt before 3000 ms

        await vi.advanceTimersByTimeAsync(1); // t=3000
        expect(getAttempts()).toBe(3);

        await vi.advanceTimersByTimeAsync(2999); // t=5999
        expect(getAttempts()).toBe(3); // no premature attempt before 6000 ms

        await vi.advanceTimersByTimeAsync(1); // t=6000
        expect(getAttempts()).toBe(4);

        expect(warnSpy).toHaveBeenCalledTimes(1);
      });

      it('stops after four status-0 failures, warns once, and makes no further attempts', async () => {
        vi.useFakeTimers();
        const { observable, getAttempts } = createColdHttp([{ error: makeError(0) }]);
        mockHttp.request.mockReturnValue(observable);

        service.log(event);
        await vi.runAllTimersAsync();

        expect(getAttempts()).toBe(4);
        expect(warnSpy).toHaveBeenCalledTimes(1);

        // Advancing time further produces no new attempt.
        await vi.advanceTimersByTimeAsync(60000);
        expect(getAttempts()).toBe(4);
        expect(warnSpy).toHaveBeenCalledTimes(1);
      });

      it('stops retrying and does not warn when a retry succeeds', async () => {
        vi.useFakeTimers();
        const { observable, getAttempts } = createColdHttp([
          { error: makeError(0) },
          { value: new HttpResponse({ status: 200 }) },
        ]);
        mockHttp.request.mockReturnValue(observable);

        service.log(event);
        await vi.runAllTimersAsync();

        expect(getAttempts()).toBe(2);
        expect(warnSpy).not.toHaveBeenCalled();

        // No further attempts after success.
        await vi.advanceTimersByTimeAsync(60000);
        expect(getAttempts()).toBe(2);
      });

      it('does not retry a status-500 error and warns once with the method, endpoint, and error', async () => {
        vi.useFakeTimers();
        const error = makeError(500);
        const { observable, getAttempts } = createColdHttp([{ error }]);
        mockHttp.request.mockReturnValue(observable);

        service.log(event);
        await vi.runAllTimersAsync();

        expect(getAttempts()).toBe(1); // status 500 is not in the default retry list
        expect(warnSpy).toHaveBeenCalledTimes(1);

        const [firstArg, secondArg] = warnSpy.mock.calls[0];
        expect(firstArg).toBe('Unable to reach destination');
        expect(secondArg.status).toBe(500);
        expect(secondArg.statusText).toBe('Internal server error');
        expect(secondArg.message).toBe(`Failed to POST to blah.com : ${error.message}`);
      });

      it('does not retry or warn when the first attempt succeeds', async () => {
        vi.useFakeTimers();
        const { observable, getAttempts } = createColdHttp([{ value: new HttpResponse({ status: 200 }) }]);
        mockHttp.request.mockReturnValue(observable);

        service.log(event);
        await vi.runAllTimersAsync();

        expect(getAttempts()).toBe(1);
        expect(warnSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('loadAndValidateConfig', () => {
    let consoleSpy: Mock;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'warn');
    });

    it('should invalidate a config without an endpoint', () => {
      const config: any = { method: 'POST' };
      const isValid = service['loadAndValidateConfig'](config);
      expect(consoleSpy).toHaveBeenCalledWith('An endpoint is required to send events to this destination');
      expect(isValid).toEqual(false);
    });

    it('should invalidate a config without a method', () => {
      const config: any = { endpoint: 'https://hello.com' };
      const isValid = service['loadAndValidateConfig'](config);
      expect(consoleSpy).toHaveBeenCalledWith('An HTTP method is required to send events to this destination');
      expect(isValid).toEqual(false);
    });

    it('should load and validate a valid config', () => {
      const config: any = { method: 'POST', endpoint: 'https://hello.com' };
      const isValid = service['loadAndValidateConfig'](config);
      expect(service['config']).toEqual(config);
      expect(isValid).toEqual(true);
    });
  });

  describe('replay on configuration update (real event bus)', () => {
    const createRealService = () => {
      const realEventBus = new AnalyticsEventBusService();
      const realConfigService = new ConfigurationService();
      const requests: Array<{ method: string; url: string; options?: any }> = [];
      const realHttpClient = {
        request: (method: string, url: string, options?: any) => {
          requests.push({ method, url, options });
          return of(new HttpResponse({ status: 200 }));
        },
      };
      const realService = new HttpApiService(realConfigService, realEventBus, mockZone, realHttpClient as any);
      realService.init();
      return { realEventBus, realConfigService, requests };
    };

    it('should not replay delivered events when only applicationName changes', async () => {
      vi.useFakeTimers();
      const { realEventBus, realConfigService, requests } = createRealService();

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        applicationName: 'app-1',
        destinations: [
          { name: Destinations.HttpApi, sendCustomEvents: false, method: 'POST', endpoint: '/telemetry' },
        ],
      });

      realEventBus.dispatch({ id: 'one' });
      await vi.runAllTimersAsync();
      expect(requests.length).toBe(1);

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        applicationName: 'app-2',
        destinations: [
          { name: Destinations.HttpApi, sendCustomEvents: false, method: 'POST', endpoint: '/telemetry' },
        ],
      });
      await vi.runAllTimersAsync();

      expect(requests.length).toBe(1);
      vi.useRealTimers();
    });

    it('should not resend historical events when the endpoint changes and should use the new endpoint for the next event', async () => {
      vi.useFakeTimers();
      const { realEventBus, realConfigService, requests } = createRealService();

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        destinations: [{ name: Destinations.HttpApi, sendCustomEvents: false, method: 'POST', endpoint: '/v1' }],
      });

      realEventBus.dispatch({ id: 'one' });
      await vi.runAllTimersAsync();
      expect(requests.length).toBe(1);
      expect(requests[0].url).toBe('/v1');

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        destinations: [{ name: Destinations.HttpApi, sendCustomEvents: false, method: 'POST', endpoint: '/v2' }],
      });
      await vi.runAllTimersAsync();

      expect(requests.length).toBe(1);

      realEventBus.dispatch({ id: 'two' });
      await vi.runAllTimersAsync();
      expect(requests.length).toBe(2);
      expect(requests[1].url).toBe('/v2');
      vi.useRealTimers();
    });

    it('should not resend historical events when headers change and should use the new headers for the next event', async () => {
      vi.useFakeTimers();
      const { realEventBus, realConfigService, requests } = createRealService();

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        destinations: [
          {
            name: Destinations.HttpApi,
            sendCustomEvents: false,
            method: 'POST',
            endpoint: '/telemetry',
            headers: new HttpHeaders({ 'x-api-key': 'old' }),
          },
        ],
      });

      realEventBus.dispatch({ id: 'one' });
      await vi.runAllTimersAsync();
      expect(requests.length).toBe(1);

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        destinations: [
          {
            name: Destinations.HttpApi,
            sendCustomEvents: false,
            method: 'POST',
            endpoint: '/telemetry',
            headers: new HttpHeaders({ 'x-api-key': 'new' }),
          },
        ],
      });
      await vi.runAllTimersAsync();

      expect(requests.length).toBe(1);

      realEventBus.dispatch({ id: 'two' });
      await vi.runAllTimersAsync();
      expect(requests.length).toBe(2);
      expect(requests[1].options?.headers?.get('x-api-key')).toBe('new');
      vi.useRealTimers();
    });

    it('should deliver two separate dispatches with the same ID', async () => {
      vi.useFakeTimers();
      const { realEventBus, realConfigService, requests } = createRealService();

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        destinations: [
          { name: Destinations.HttpApi, sendCustomEvents: false, method: 'POST', endpoint: '/telemetry' },
        ],
      });

      realEventBus.dispatch({ id: 'same' });
      realEventBus.dispatch({ id: 'same' });
      await vi.runAllTimersAsync();

      expect(requests.length).toBe(2);
      vi.useRealTimers();
    });

    it('should deliver events emitted before first activation via the startup replay buffer', async () => {
      vi.useFakeTimers();
      const { realEventBus, realConfigService, requests } = createRealService();

      realEventBus.dispatch({ id: 'early' });
      await vi.runAllTimersAsync();
      expect(requests.length).toBe(0);

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        destinations: [
          { name: Destinations.HttpApi, sendCustomEvents: false, method: 'POST', endpoint: '/telemetry' },
        ],
      });
      await vi.runAllTimersAsync();

      expect(requests.length).toBe(1);
      expect(requests[0].options?.body).toEqual({ id: 'early' });
      vi.useRealTimers();
    });

    it('should select the intended stream when switching between standard and custom modes', async () => {
      vi.useFakeTimers();
      const { realEventBus, realConfigService, requests } = createRealService();

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        destinations: [
          { name: Destinations.HttpApi, sendCustomEvents: false, method: 'POST', endpoint: '/telemetry' },
        ],
      });
      realEventBus.dispatch({ id: 'standard' });
      await vi.runAllTimersAsync();
      expect(requests.length).toBe(1);
      expect(requests[0].options?.body).toEqual({ id: 'standard' });

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        destinations: [
          { name: Destinations.HttpApi, sendCustomEvents: true, method: 'POST', endpoint: '/telemetry' },
        ],
      });
      realEventBus.dispatchCustomEvent({ id: 'custom' });
      await vi.runAllTimersAsync();
      expect(requests.length).toBe(2);
      expect(requests[1].options?.body).toEqual({ id: 'custom' });
      vi.useRealTimers();
    });
  });
});
