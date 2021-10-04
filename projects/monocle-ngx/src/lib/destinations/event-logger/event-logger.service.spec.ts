import { of } from 'rxjs';

import { EventLoggerService } from './event-logger.service';

describe('EventLoggerService', () => {
  let mockAnalyticsEventBusService: any;
  let mockEventDispatchService: any;
  let mockLogger: any;
  let eventLoggerService: EventLoggerService;

  beforeEach(() => {
    mockAnalyticsEventBusService = {
      events$: of('something')
    };
    mockEventDispatchService = {
      trackAnalyticsError: jasmine.createSpy('trackAnalyticsError')
    };
  });

  it('should log an error when logger function fails', (done) => {
    mockLogger = () => { throw 'it was an exception but we caught it'; };

    eventLoggerService = new EventLoggerService(
        mockAnalyticsEventBusService,
        mockEventDispatchService
      );
    eventLoggerService.init(mockLogger);
    mockAnalyticsEventBusService.events$.subscribe({
      complete: () => {
        expect(mockEventDispatchService.trackAnalyticsError).toHaveBeenCalledWith('it was an exception but we caught it');
        done();
      }
    });
  });

  it('should call the logger function', (done) => {
    mockLogger = jasmine.createSpy('mockLogger');

    eventLoggerService = new EventLoggerService(
        mockAnalyticsEventBusService,
        mockEventDispatchService
      );
    eventLoggerService.init(mockLogger);
    mockAnalyticsEventBusService.events$.subscribe({
      complete: () => {
        expect(mockEventDispatchService.trackAnalyticsError).not.toHaveBeenCalled();
        expect(mockLogger).toHaveBeenCalled();
        done();
      }
    });
  });

});
