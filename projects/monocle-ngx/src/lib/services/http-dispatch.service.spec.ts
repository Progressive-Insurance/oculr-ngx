import { fakeAsync, discardPeriodicTasks, tick } from '@angular/core/testing';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { take, catchError, mergeMap, switchMap, map } from 'rxjs/operators';

import { HttpDispatchService } from './http-dispatch.service';
import { HttpDispatchRequestOptions } from '../models/http-dispatch-request-options.interface';
import { AnalyticsAction } from '../models/actions/analytics-action.enum';
import { AnalyticsService } from './analytics.service';
import { TimeService } from './time.service';

const START_ACTION = 0;
const SUCCESS_ACTION = 1;
const ERROR_ACTION = 1;
const startAction = jasmine.objectContaining({ type: AnalyticsAction.API_STARTED });
const successAction = jasmine.objectContaining({ type: AnalyticsAction.API_SUCCEEDED });
const unhandledErrorAction = jasmine.objectContaining({ type: AnalyticsAction.API_UNHANDLED_ERROR });

const resultAction = jasmine.objectContaining({
  payload: jasmine.objectContaining({
    requestStartTime: jasmine.any(Number),
    requestEndTime: jasmine.any(Number),
    variableData: { duration: jasmine.any(Number), statusCode: undefined },
  }),
});

const completedAction = jasmine.objectContaining({ type: AnalyticsAction.API_COMPLETED });

// TODO Rewrite tests to be more readable with less setup
describe('The HttpDispatchService', () => {
  const defaultIds: HttpDispatchRequestOptions = {
    startId: 'startId',
    successId: 'successId',
    errorId: 'errorId',
    completedId: 'completedId',
    customDimensions: { dataValue: 'isChecked' },
    selectedItems: { policyNumber: '123456789' },
    variableData: { policyIndex: 1 },
  };

  type ObservableMutate = (modifier: Observable<any>) => Observable<any>;

  const testSetup = (options: HttpDispatchRequestOptions = defaultIds, modifier?: ObservableMutate) => {
    const mockAnalyticsEventBusService: any = {
      dispatch: () => ({}),
    };

    const mockAnalyticsModel: any = {
      getModel: (id: string) => ({ id, details: { eventLabel: 'dummy label', eventValue: 0 } }),
    };

    const analyticsService = new AnalyticsService(mockAnalyticsEventBusService, mockAnalyticsModel);
    const timeService = new TimeService();

    const source$ = of({ type: 'TEST DATA' }).pipe((obs) => (modifier ? modifier(obs) : obs));
    const service = new HttpDispatchService(analyticsService, timeService);
    const dispatch = spyOn(mockAnalyticsEventBusService, 'dispatch');
    const request = HttpDispatchService.createRequest(options);
    const dispatched$ = service.dispatchObservable(source$, request);

    return {
      mockAnalyticsEventBusService,
      source$,
      service,
      request,
      dispatched$,
      dispatch,
    };
  };

  const setupSuccess = (eventIds?: HttpDispatchRequestOptions) => testSetup(eventIds);
  const setupError = (eventIds?: HttpDispatchRequestOptions) =>
    testSetup(eventIds, (obs) => obs.pipe(mergeMap(() => throwError('Ooops'))));

  beforeEach(fakeAsync(() => {
    discardPeriodicTasks();
  }));

  it('should dispatch once an observable sequence starts', fakeAsync(() => {
    const { dispatched$, dispatch } = setupSuccess();
    dispatched$.pipe(take(1)).subscribe(() => (): undefined => undefined);
    tick();
    expect(dispatch).toHaveBeenCalledWith(startAction);
  }));

  it('should dispatch once an observable sequence succeeds', fakeAsync(() => {
    const { dispatched$, dispatch } = setupSuccess();
    dispatched$.pipe(take(1)).subscribe(() => (): undefined => undefined);
    tick();
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch).toHaveBeenCalledWith(successAction);
  }));

  it('should dispatch a completed event on success', fakeAsync(() => {
    const { dispatched$, dispatch } = setupSuccess();
    dispatched$.pipe(take(1)).subscribe(() => (): undefined => undefined);
    tick();
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch).toHaveBeenCalledWith(completedAction);
  }));

  it('should dispatch once an observable sequence errors', fakeAsync(() => {
    const { dispatched$, dispatch } = setupError();
    dispatched$
      .pipe(
        take(1),
        catchError(() => {
          return of('handled');
        })
      )
      .subscribe(() => (): undefined => undefined);
    tick();
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch).toHaveBeenCalledWith(unhandledErrorAction);
  }));

  it('should dispatch a completed action if it errors also', fakeAsync(() => {
    const { dispatched$, dispatch } = setupError();

    dispatched$
      .pipe(
        take(1),
        catchError(() => {
          return of('handled');
        })
      )
      .subscribe(() => (): undefined => undefined);
    tick();
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch).toHaveBeenCalledWith(completedAction);
  }));

  it('should track start, end time, and duration of a successful request', fakeAsync(() => {
    const { dispatched$, dispatch } = setupSuccess();
    dispatched$.pipe(take(1)).subscribe(() => (): undefined => undefined);
    tick();

    expect(dispatch).toHaveBeenCalledWith(resultAction);
  }));

  it('should track start, end time, and duration of a failed request', fakeAsync(() => {
    const { dispatched$, dispatch } = setupError();
    dispatched$
      .pipe(
        take(1),
        catchError(() => {
          return of('handled');
        })
      )
      .subscribe(() => (): undefined => undefined);
    tick();
    expect(dispatch).toHaveBeenCalledWith(resultAction);
  }));

  it('should track start and end time of a successful request', fakeAsync(() => {
    const { dispatched$, dispatch } = setupSuccess();
    dispatched$.pipe(take(1)).subscribe(() => (): undefined => undefined);
    tick();

    const actualSuccessAction = dispatch.calls.argsFor(SUCCESS_ACTION) as any;
    const { requestStartTime, requestEndTime } = actualSuccessAction[0].payload;

    expect(requestEndTime).toBeGreaterThanOrEqual(requestStartTime);
  }));

  it('should still emit the source value on success', fakeAsync(() => {
    const results: any[] = [];
    const { dispatched$ } = setupSuccess();
    dispatched$.pipe(take(1)).subscribe((result) => {
      results.push(result);
    });
    tick();
    expect(results.length).toBe(1);
    expect(results[0]).toEqual({ type: 'TEST DATA' });
  }));

  it('should have model provided if there is a startId', fakeAsync(() => {
    const { dispatched$, dispatch } = setupSuccess();
    dispatched$.pipe(take(1)).subscribe(() => (): undefined => undefined);
    tick();
    const actualStartAction = dispatch.calls.argsFor(START_ACTION)[0] as any;
    expect(actualStartAction.payload.model.id).toBe('startId');
  }));

  it('should have model provided if there is a successId', fakeAsync(() => {
    const { dispatched$, dispatch } = setupSuccess();
    dispatched$.pipe(take(1)).subscribe(() => (): undefined => undefined);
    tick();
    const actualSuccessAction = dispatch.calls.argsFor(SUCCESS_ACTION)[0] as any;

    expect(actualSuccessAction.payload.model.id).toBe('successId');
  }));

  it('should have model provided if there is a errorId', fakeAsync(() => {
    const { dispatched$, dispatch } = setupError();
    dispatched$
      .pipe(
        take(1),
        catchError(() => {
          return of('handled');
        })
      )
      .subscribe(() => (): undefined => undefined);
    tick();
    const actualErrorAction = dispatch.calls.argsFor(ERROR_ACTION)[0] as any;

    expect(actualErrorAction.payload.model.id).toBe('errorId');
  }));

  it("should have action type API_UNHANDLED_ERROR if status doesn't match provided mapping", fakeAsync(() => {
    const errorResponse = new HttpResponse<any>({
      body: { test: 'data' },
      status: 400,
    });

    const { dispatched$, dispatch } = testSetup(undefined, (obs) =>
      obs.pipe(switchMap(() => throwError(errorResponse)))
    );
    dispatched$.pipe(take(1)).subscribe(
      () => {
        expect(1).toBe(2);
      },
      () => {
        tick();
        expect(dispatch).toHaveBeenCalledTimes(3);
        const actualAction = dispatch.calls.argsFor(ERROR_ACTION)[0] as any;
        expect(actualAction.type).toBe(AnalyticsAction.API_UNHANDLED_ERROR);
      },
      () => {
        expect(3).toBe(4);
      }
    );
  }));

  it('should have action type API_HANDLED_ERROR if status matches provided mapping', fakeAsync(() => {
    const errorResponse = new HttpResponse({
      body: { test: 'data' },
      status: 400,
    });

    const testOptions: HttpDispatchRequestOptions = {
      errorId: 'errorId',
      isErrorCodeSuccess: {
        '400': true,
      },
      customDimensions: { dataValue: 'isError' },
      selectedItems: { policyNumber: '123456789' },
      variableData: { policyIndex: 1 },
    };

    const { dispatched$, dispatch } = testSetup(testOptions, (obs) =>
      obs.pipe(switchMap(() => throwError(errorResponse)))
    );
    dispatched$.pipe(take(1)).subscribe(
      () => {
        fail('should not have reached happy path');
      },
      () => {
        tick();
        const actualAction = dispatch.calls.argsFor(ERROR_ACTION)[0] as any;
        expect(dispatch).toHaveBeenCalledTimes(3);
        expect(actualAction.type).toBe(AnalyticsAction.API_HANDLED_ERROR);
      }
    );
  }));
});

describe('Integration tests for HttpDispatchService', () => {
  class SomeApiService {
    constructor(private http: HttpClient, private httpDispatch: HttpDispatchService) {}

    getSuccessWithStartIdSuccessId() {
      const options: HttpDispatchRequestOptions = {
        startId: 'startId',
        successId: 'successId',
        errorId: 'errorId',
      };
      const dispatchRequest = HttpDispatchService.createRequest(options);
      const httpRequest = this.http.get('data') as Observable<HttpResponse<any>>;
      return this.httpDispatch.dispatchObservable(httpRequest, dispatchRequest);
    }

    getUnhandledError() {
      const options: HttpDispatchRequestOptions = {
        errorId: 'errorId',
      };
      const dispatchRequest = HttpDispatchService.createRequest(options);
      const httpRequest = this.http.get('data') as Observable<HttpResponse<any>>;
      return this.httpDispatch.dispatchObservable(httpRequest, dispatchRequest);
    }

    getHandledError() {
      const options: HttpDispatchRequestOptions = {
        errorId: 'errorId',
        isErrorCodeSuccess: {
          305: true,
        },
      };
      const dispatchRequest = HttpDispatchService.createRequest(options);
      const httpRequest = this.http.get('data') as Observable<HttpResponse<any>>;
      return this.httpDispatch.dispatchObservable(httpRequest, dispatchRequest);
    }

    getByPassingOptions() {
      const options: HttpDispatchRequestOptions = {
        startId: 'startId',
        successId: 'successId',
        errorId: 'errorId',
      };

      return this.httpDispatch.dispatchObservable(this.http.get('data') as Observable<HttpResponse<any>>, options);
    }
  }

  const testSetup = () => {
    const mockHttp: any = {
      get: () => {
        const httpResponse = new HttpResponse({
          body: { test: 'data' },
          status: 200,
        });

        return of(httpResponse);
      },
    };
    const mockAnalyticsEventBusService: any = {
      dispatch: () => ({}),
    };

    const mockAnalyticsModel: any = {
      getModel: (id: string) => ({ id, details: { eventLabel: 'dummy label', eventValue: 0 } }),
    };

    const dispatch = spyOn(mockAnalyticsEventBusService, 'dispatch');
    const analyticsService = new AnalyticsService(mockAnalyticsEventBusService, mockAnalyticsModel);
    const timeService = new TimeService();
    const httpDispatch = new HttpDispatchService(analyticsService, timeService);
    const service = new SomeApiService(mockHttp, httpDispatch);
    const subscribeSpy = jasmine.createSpy('successSpy');
    const errorSpy = jasmine.createSpy('errorSpy');
    const completedSpy = jasmine.createSpy('completedSpy');

    return {
      service,
      dispatch,
      mockHttp,
      subscribeSpy,
      errorSpy,
      completedSpy,
    };
  };

  it('should emit start and success events', fakeAsync(() => {
    const { service, dispatch, subscribeSpy, errorSpy } = testSetup();
    service
      .getSuccessWithStartIdSuccessId()
      .pipe(map((response) => response.body))
      .subscribe(
        (n) => {
          subscribeSpy();
          expect(n).toEqual({ test: 'data' });
        },
        () => errorSpy()
      );
    tick();
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(subscribeSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  }));

  it('should emit an API_UNHANDLED_ERROR if an unhandled exception without an isErrorSuccess map', fakeAsync(() => {
    const { service, dispatch, mockHttp, subscribeSpy, errorSpy, completedSpy } = testSetup();
    spyOn(mockHttp, 'get').and.callFake(() => {
      const httpResponse = new HttpResponse({
        body: { test: 'data' },
        status: 305,
      });

      return throwError(httpResponse);
    });

    service
      .getUnhandledError()
      .pipe(map((response) => response.body))
      .subscribe(
        () => {
          subscribeSpy();
        },
        () => {
          errorSpy();
          tick();
          const actualAction = dispatch.calls.argsFor(ERROR_ACTION)[0] as any;
          expect(dispatch).toHaveBeenCalledTimes(3);
          expect(actualAction.type).toBe(AnalyticsAction.API_UNHANDLED_ERROR);
        },
        () => completedSpy()
      );
    expect(subscribeSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  }));

  it('should emit an API_HANDLED_ERROR if an unhandled exception without an isErrorSuccess map', fakeAsync(() => {
    const { service, dispatch, mockHttp, errorSpy, subscribeSpy } = testSetup();
    spyOn(mockHttp, 'get').and.callFake(() => {
      const httpResponse = new HttpResponse({
        body: { test: 'data' },
        status: 305,
      });
      return throwError(httpResponse);
    });
    service
      .getHandledError()
      .pipe(map((response) => response.body))
      .subscribe(
        () => {
          subscribeSpy();
        },
        () => {
          errorSpy();
          tick();
          const actualAction = dispatch.calls.argsFor(ERROR_ACTION)[0] as any;
          expect(dispatch).toHaveBeenCalledTimes(3);
          expect(actualAction.type).toBe(AnalyticsAction.API_HANDLED_ERROR);
        }
      );
    expect(subscribeSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  }));

  it('should emit start and end events if service is only provided with config options', fakeAsync(() => {
    const { service, dispatch, subscribeSpy, errorSpy } = testSetup();

    service
      .getByPassingOptions()
      .pipe(map((response) => response.body))
      .subscribe(
        (n) => {
          subscribeSpy();
          expect(n).toEqual({ test: 'data' });
        },
        () => errorSpy()
      );
    tick();
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch).toHaveBeenCalledWith(startAction);
    expect(dispatch).toHaveBeenCalledWith(successAction);
    expect(subscribeSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  }));
});
