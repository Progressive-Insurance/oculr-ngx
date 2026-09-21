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
import { AnalyticsEventBusService } from '../../services/analytics-event-bus.service';
import { ConfigurationService } from '../../services/configuration.service';
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

  describe('destination removal', () => {
    let logSpy: Mock;

    beforeEach(() => {
      logSpy = vi.spyOn(console, 'log');
    });

    const enableConsole = (sendCustomEvents: boolean) => {
      mockConfig.next({
        logHttpTraffic: true,
        destinations: [{ name: Destinations.Console, sendCustomEvents }],
      });
    };

    it('should stop logging events after the Console destination is removed with an empty destinations array', async () => {
      vi.useFakeTimers();
      service.init();

      enableConsole(false);
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

    it('should stop logging events after the destinations property is omitted', async () => {
      vi.useFakeTimers();
      service.init();

      enableConsole(false);
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

    it('should stop logging custom events after removal from custom-event mode and deliver a re-enabled event exactly once', async () => {
      vi.useFakeTimers();
      service.init();

      enableConsole(true);
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

      enableConsole(true);
      const customEvent3 = { id: 'custom3' };
      mockCustomEvents.next(customEvent3);
      await vi.runAllTimersAsync();

      const customEvent3Calls = logSpy.mock.calls.filter((call) => call[0] === customEvent3).length;
      expect(customEvent3Calls).toEqual(1);
      vi.useRealTimers();
    });
  });

  describe('replay on configuration update (real event bus)', () => {
    let logSpy: Mock;

    beforeEach(() => {
      logSpy = vi.spyOn(console, 'log');
      logSpy.mockClear();
    });

    const createRealService = () => {
      const realEventBus = new AnalyticsEventBusService();
      const realConfigService = new ConfigurationService();
      const realService = new ConsoleService(realConfigService, realEventBus, mockZone);
      realService.init();
      return { realEventBus, realConfigService };
    };

    it('should not replay delivered events when only applicationName changes', async () => {
      vi.useFakeTimers();
      const { realEventBus, realConfigService } = createRealService();

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        applicationName: 'app-1',
        destinations: [{ name: Destinations.Console, sendCustomEvents: false }],
      });

      realEventBus.dispatch({ id: 'one' });
      await vi.runAllTimersAsync();
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith({ id: 'one' });

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        applicationName: 'app-2',
        destinations: [{ name: Destinations.Console, sendCustomEvents: false }],
      });
      await vi.runAllTimersAsync();

      expect(logSpy).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it('should not replay delivered events when an equivalent configuration is resubmitted', async () => {
      vi.useFakeTimers();
      const { realEventBus, realConfigService } = createRealService();

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        destinations: [{ name: Destinations.Console, sendCustomEvents: false }],
      });

      realEventBus.dispatch({ id: 'one' });
      await vi.runAllTimersAsync();
      expect(logSpy).toHaveBeenCalledTimes(1);

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        destinations: [{ name: Destinations.Console, sendCustomEvents: false }],
      });
      await vi.runAllTimersAsync();

      expect(logSpy).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it('should deliver two separate dispatches with the same ID', async () => {
      vi.useFakeTimers();
      const { realEventBus, realConfigService } = createRealService();

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        destinations: [{ name: Destinations.Console, sendCustomEvents: false }],
      });

      realEventBus.dispatch({ id: 'same' });
      realEventBus.dispatch({ id: 'same' });
      await vi.runAllTimersAsync();

      expect(logSpy).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });

    it('should deliver events emitted before first activation via the startup replay buffer', async () => {
      vi.useFakeTimers();
      const { realEventBus, realConfigService } = createRealService();

      realEventBus.dispatch({ id: 'early' });
      await vi.runAllTimersAsync();
      expect(logSpy).not.toHaveBeenCalled();

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        destinations: [{ name: Destinations.Console, sendCustomEvents: false }],
      });
      await vi.runAllTimersAsync();

      expect(logSpy).toHaveBeenCalledWith({ id: 'early' });
      vi.useRealTimers();
    });

    it('should select the intended stream when switching between standard and custom modes', async () => {
      vi.useFakeTimers();
      const { realEventBus, realConfigService } = createRealService();

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        destinations: [{ name: Destinations.Console, sendCustomEvents: false }],
      });
      realEventBus.dispatch({ id: 'standard' });
      await vi.runAllTimersAsync();
      expect(logSpy).toHaveBeenCalledWith({ id: 'standard' });

      realConfigService.loadAppConfig({
        logHttpTraffic: true,
        destinations: [{ name: Destinations.Console, sendCustomEvents: true }],
      });
      realEventBus.dispatchCustomEvent({ id: 'custom' });
      await vi.runAllTimersAsync();
      expect(logSpy).toHaveBeenCalledWith({ id: 'custom' });
      vi.useRealTimers();
    });
  });
});
