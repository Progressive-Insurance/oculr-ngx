/*
 * @license
 * Copyright 2021-2022 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/progressive-insurance/oculr-ngx/blob/main/LICENSE.md
 */

import { fakeAsync, flush } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Destinations } from '../../models/destinations.enum';
import { ConsoleService } from './console.service';

describe('ConsoleService', () => {
  let mockZone: any;
  let mockEventBus: any;
  let mockConfiguration: any;

  let mockEvents: BehaviorSubject<any>;
  let mockCustomEvents: BehaviorSubject<any>;
  let mockConfig: BehaviorSubject<any>;

  let service: ConsoleService;

  beforeEach(() => {
    mockEvents = new BehaviorSubject<any>(undefined);
    mockCustomEvents = new BehaviorSubject<any>(undefined);
    mockConfig = new BehaviorSubject<any>(undefined);

    mockZone = { runOutsideAngular: (func: () => void) => func.apply(this) };
    mockEventBus = { customEvents$: mockCustomEvents, events$: mockEvents };
    mockConfiguration = { appConfig$: mockConfig };

    service = new ConsoleService(mockConfiguration, mockEventBus, mockZone);
  });

  describe('init', () => {
    let logSpy: jasmine.Spy;

    beforeEach(() => {
      logSpy = spyOn(console, 'log');
    });

    it('events should not be logged before a config is set', fakeAsync(() => {
      service.init();

      const event = { id: 'id' };
      mockEvents.next(event);
      mockCustomEvents.next(event);
      flush();

      expect(logSpy).not.toHaveBeenCalled();
    }));

    it('events should not be logged when there is no Console destination', fakeAsync(() => {
      service.init();

      mockConfig.next({ destinations: [{ name: Destinations.HttpApi, sendCustomEvents: false }] });
      const event = { id: 'id' };
      mockEvents.next(event);
      mockCustomEvents.next(event);
      flush();

      expect(logSpy).not.toHaveBeenCalled();
    }));

    it('events should be logged to the standard event bus when sendCustomEvents is false', fakeAsync(() => {
      service.init();

      mockConfig.next({
        destinations: [{ name: Destinations.Console, sendCustomEvents: false }],
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
        destinations: [{ name: Destinations.Console, sendCustomEvents: true }],
      });
      const event = { id: 'event' };
      const customEvent = { id: 'custom' };
      mockEvents.next(event);
      mockCustomEvents.next(customEvent);
      flush();

      expect(logSpy).toHaveBeenCalledWith(customEvent);
    }));
  });
});
