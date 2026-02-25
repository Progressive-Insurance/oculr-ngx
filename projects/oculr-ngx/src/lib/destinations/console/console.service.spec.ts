/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
 */

import { BehaviorSubject } from 'rxjs';
import type { Mock } from 'vitest';
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
    let logSpy: Mock;

    beforeEach(() => {
      logSpy = vi.spyOn(console, 'log');
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

    it('events should not be logged when there is no Console destination', async () => {
      vi.useFakeTimers();
      service.init();

      mockConfig.next({ destinations: [{ name: Destinations.HttpApi, sendCustomEvents: false }] });
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
        destinations: [{ name: Destinations.Console, sendCustomEvents: false }],
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
        destinations: [{ name: Destinations.Console, sendCustomEvents: true }],
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
});
