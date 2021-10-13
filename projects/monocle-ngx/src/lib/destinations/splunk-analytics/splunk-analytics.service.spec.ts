import { of, BehaviorSubject } from 'rxjs';

import { SplunkAnalyticsService } from './splunk-analytics.service';

describe('Splunk analytics service', () => {
  let mockHttp: any;
  let mockZone: any;
  let mockAnalyticsEventBusService: any;
  let mockEventDispatchService: any;
  let mockSplunkEndpoint: any;
  let mockSplunkApiKey: any;
  let mockStateProvider: any;
  let mockTransform: any;
  let mockSplunkAnalyticsService: SplunkAnalyticsService;

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

    mockSplunkAnalyticsService = new SplunkAnalyticsService(
      mockHttp,
      mockZone,
      mockAnalyticsEventBusService,
      mockEventDispatchService,
      mockSplunkEndpoint,
      mockSplunkApiKey,
      mockTransform,
      mockStateProvider
    );
    spyOn(mockSplunkAnalyticsService, 'log');
    mockSplunkAnalyticsService.init();
    mockAnalyticsEventBusService.events$.subscribe({
      complete: () => {
        expect(mockEventDispatchService.trackAnalyticsError).toHaveBeenCalledWith(
          'it was an exception but we caught it'
        );
        expect(mockSplunkAnalyticsService.log).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should return a event transform function is successful', (done) => {
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
    mockSplunkAnalyticsService = new SplunkAnalyticsService(
      mockHttp,
      mockZone,
      mockAnalyticsEventBusService,
      mockEventDispatchService,
      mockSplunkEndpoint,
      mockSplunkApiKey,
      mockTransform,
      mockStateProvider
    );
    spyOn(mockSplunkAnalyticsService, 'log');
    mockSplunkAnalyticsService.init();
    mockAnalyticsEventBusService.events$.subscribe({
      complete: () => {
        expect(mockEventDispatchService.trackAnalyticsError).not.toHaveBeenCalled();
        expect(mockSplunkAnalyticsService.log).toHaveBeenCalledTimes(1);
        done();
      },
    });
  });
});
