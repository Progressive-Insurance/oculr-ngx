/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { HttpErrorResponse } from '@angular/common/http';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, retryWhen } from 'rxjs/operators';
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
    mockHttp = { request: jasmine.createSpy('request').and.returnValue(mockResponse) };
    mockEventBus = { customEvents$: mockCustomEvents, events$: mockEvents };
    mockConfiguration = { appConfig$: mockConfig };

    service = new HttpApiService(mockConfiguration, mockEventBus, mockZone, mockHttp);
  });

  describe('init', () => {
    let logSpy: jasmine.Spy;

    beforeEach(() => {
      logSpy = spyOn(service, 'log');
    });

    it('events should not be logged before a config is set', fakeAsync(() => {
      service.init();

      const event = { id: 'id' };
      mockEvents.next(event);
      mockCustomEvents.next(event);
      flush();

      expect(logSpy).not.toHaveBeenCalled();
    }));

    it('events should not be logged when there is no HttpApi destination', fakeAsync(() => {
      service.init();

      mockConfig.next({ destinations: [{ name: Destinations.Console, sendCustomEvents: false }] });
      const event = { id: 'id' };
      mockEvents.next(event);
      mockCustomEvents.next(event);
      flush();

      expect(logSpy).not.toHaveBeenCalled();
    }));

    it('events should be logged to the standard event bus when sendCustomEvents is false', fakeAsync(() => {
      service.init();

      mockConfig.next({
        destinations: [{ name: Destinations.HttpApi, sendCustomEvents: false, method: 'POST', endpoint: 'blah.com' }],
      });
      const event = { id: 'event' };
      const customEvent = { id: 'custom' };
      mockEvents.next(event);
      mockCustomEvents.next(customEvent);
      flush();

      expect(logSpy).toHaveBeenCalledWith(event);
    }));

    it('events should be logged to the custom event bus when sendCustomEvents is true', fakeAsync(() => {
      service.init();

      mockConfig.next({
        destinations: [{ name: Destinations.HttpApi, sendCustomEvents: true, method: 'POST', endpoint: 'blah.com' }],
      });
      const event = { id: 'event' };
      const customEvent = { id: 'custom' };
      mockEvents.next(event);
      mockCustomEvents.next(customEvent);
      flush();

      expect(logSpy).toHaveBeenCalledWith(customEvent);
    }));
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

    it('should handle valid requests successfully', fakeAsync(() => {
      mockResponse.next({});
      flush();

      service.log(event);

      expect(mockHttp.request).toHaveBeenCalledWith(config.method, config.endpoint, {
        headers: config.headers,
        body: event,
      });
    }));

    // TODO: revisit this test to see if we can cover the retry flow
    xit('should retry failed requests according to the strategy', fakeAsync(() => {
      const warnSpy = spyOn(console, 'warn');

      service.log(event);

      const error = new HttpErrorResponse({ status: 500, statusText: 'Internal server error' });
      mockResponse.next(error);
      flush();

      for (let i = 1; i < 4; i++) {
        tick(i * 1100);
        mockResponse.next(error);
        flush();
      }

      expect(warnSpy).toHaveBeenCalledWith({
        status: error.status,
        statusText: error.statusText,
        message: `Failed to ${config.method as string} to ${config.endpoint as string} : `,
      });
    }));
  });

  // TODO: try and get this to actually test the retry
  xdescribe('retryStrategy', () => {
    const error = new HttpErrorResponse({ status: 500, statusText: 'Internal server error' });
    const errorPipe = new BehaviorSubject<any>(error);

    it('should return a timer with the configured strategy', fakeAsync(() => {
      errorPipe
        .pipe(
          retryWhen(service['retryStrategy'](1, 1, [0])),
          catchError((err: HttpErrorResponse) => {
            console.log(`err: ${JSON.stringify(err)}`);
            return EMPTY;
          })
        )
        .subscribe();

      flush();
    }));
  });

  describe('loadAndValidateConfig', () => {
    let consoleSpy: jasmine.Spy;

    beforeEach(() => {
      consoleSpy = spyOn(console, 'warn');
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
});
