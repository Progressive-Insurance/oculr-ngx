import { of, BehaviorSubject } from 'rxjs';

import { SplunkStandardLoggingService } from './splunk-standard-logging.service';

describe('SplunkStandardLoggingService', () => {
  let mockHttp: any;
  let mockZone: any;
  let mockAnalyticsEventBusService: any;
  let mockEventDispatchService: any;
  let mockSplunkEndpoint: any;
  let mockSplunkApiKey: any;
  let mockStateProvider: any;
  let mockTransform: any;
  let mockSplunkStandardService: SplunkStandardLoggingService;

  beforeEach(() => {
    mockZone = { runOutsideAngular: (arg: () => unknown) => arg() };

    mockSplunkEndpoint = () => 'https://fakesplunkendpoint.progressive.com';
    mockSplunkApiKey = () => 'fakeApiKey';

    mockStateProvider = () => {
      return new BehaviorSubject('Bruce Wayne');
    };
    mockHttp = jasmine.createSpyObj('mockHttp', ['post']);
    mockAnalyticsEventBusService = {
      events$: of('something'),
    };
    mockEventDispatchService = {
      trackAnalyticsError: jasmine.createSpy('trackAnalyticsError'),
    };
  });

  it('should throw an error when transform function fails', (done) => {
    mockTransform = () => {
      throw 'it was an exception but we caught it';
    };

    mockSplunkStandardService = new SplunkStandardLoggingService(
      mockHttp,
      mockZone,
      mockAnalyticsEventBusService,
      mockEventDispatchService,
      mockSplunkEndpoint,
      mockSplunkApiKey,
      mockTransform,
      mockStateProvider
    );
    spyOn(mockSplunkStandardService, 'log');
    mockSplunkStandardService.init();
    mockAnalyticsEventBusService.events$.subscribe({
      complete: () => {
        expect(mockEventDispatchService.trackAnalyticsError).toHaveBeenCalledWith(
          'it was an exception but we caught it'
        );
        expect(mockSplunkStandardService.log).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should return an event transform function if successful', (done) => {
    const mockObj = {
      event: {
        mockEventId: '123',
      },
      appState: {
        appName: 'test app',
      },
    };
    mockTransform = () => {
      return mockObj;
    };
    mockSplunkStandardService = new SplunkStandardLoggingService(
      mockHttp,
      mockZone,
      mockAnalyticsEventBusService,
      mockEventDispatchService,
      mockSplunkEndpoint,
      mockSplunkApiKey,
      mockTransform,
      mockStateProvider
    );
    spyOn(mockSplunkStandardService, 'log');
    mockSplunkStandardService.init();
    mockAnalyticsEventBusService.events$.subscribe({
      complete: () => {
        expect(mockEventDispatchService.trackAnalyticsError).not.toHaveBeenCalled();
        expect(mockSplunkStandardService.log).toHaveBeenCalledTimes(1);
        done();
      },
    });
  });
});
