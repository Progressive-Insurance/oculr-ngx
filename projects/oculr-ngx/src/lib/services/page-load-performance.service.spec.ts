import { ApplicationRef } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { debounceTime, filter, take } from 'rxjs/operators';


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
      trackPageView: jasmine.createSpy(
        'mockEventDispatchService.trackPageView',
      ),
    } as unknown as DispatchService;
    service = new PageLoadPerformanceService(
      mockDispatchService,
      mockConfigService
    );

  });

  describe('when the application becomes stable', () => {
    describe('if the window has a pageLoadStartTime time stamp', () => {
      beforeEach(() => {
        (window as any).pageLoadStartTime = 1000;
        spyOn(Date, 'now').and.returnValue(1500);
        service.initialize();
      });

      it('should dispatch a page load performance event', () => {
        expect(
          mockDispatchService.trackPageView,
        ).toHaveBeenCalled();
      });
    });
  });

  describe('if the window does not have a pageLoadStartTime time stamp', () => {
    beforeEach(() => {
      spyOn(console, 'error');
      delete (window as any).pageLoadStartTime;
      service.initialize();
    });

    it('should not dispatch a page load performance event', () => {
      expect(
        mockDispatchService.trackPageView,
      ).not.toHaveBeenCalled();
    });

    it('should log an error to the console', () => {
      expect(console.error).toHaveBeenCalledWith(
        'Error: PageLoadPerformanceService - No timestamp "pageLoadStartTime" found on window',
      );
    });
  });

  // Cleanup to avoid test pollution
  afterEach(() => {
    delete (window as any).pageLoadStartTime;
  });
});
