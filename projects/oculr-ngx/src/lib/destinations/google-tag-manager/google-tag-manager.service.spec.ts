import { of, BehaviorSubject } from 'rxjs';

import { GoogleTagManagerService } from './google-tag-manager.service';

describe('Google tag manager service', () => {
  let mockWindow: any;
  let mockTagManagerService: any;
  let mockAnalyticsEventBusService: any;
  let mockEventDispatchService: any;
  let mockStateProvider: any;
  let mockTransform: any;

  beforeEach(() => {
    mockStateProvider = () => { return new BehaviorSubject('Bruce Wayne'); };

    mockAnalyticsEventBusService = {
      events$: of('something')
    };

    mockEventDispatchService = {
      trackAnalyticsError: jasmine.createSpy('trackAnalyticsError')
    };

    mockWindow = {
      nativeWindow: {
        dataLayer: {
          push: () => { return; }
        }
      }
    };
  });

  it('should throw an error when transform function fails', (done) => {
    mockTransform = () => { throw 'it was an exception but we caught it'; };

    mockTagManagerService = new GoogleTagManagerService(
      mockWindow,
      mockAnalyticsEventBusService,
      mockEventDispatchService,
      mockStateProvider,
      mockTransform
    );
    spyOn(mockTagManagerService, 'log');
    mockTagManagerService.init();
    mockAnalyticsEventBusService.events$.subscribe({
      complete: () => {
        expect(mockEventDispatchService.trackAnalyticsError).toHaveBeenCalledWith('it was an exception but we caught it');
        expect(mockTagManagerService.log).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should dispatch log when transform function is successful', (done) => {
    const mockObj = {
      event: {
        mockEventId: '123'
      }
    };
    mockTransform = () => { return mockObj; };

    mockTagManagerService = new GoogleTagManagerService
      (mockWindow,
        mockAnalyticsEventBusService,
        mockEventDispatchService,
        mockStateProvider,
        mockTransform
      );

    spyOn(mockTagManagerService, 'log');
    mockTagManagerService.init();
    mockAnalyticsEventBusService.events$.subscribe({
      complete: () => {
        expect(mockEventDispatchService.trackAnalyticsError).not.toHaveBeenCalled();
        expect(mockTagManagerService.log).toHaveBeenCalledTimes(1);
        done();
      }
    });
  });

});
