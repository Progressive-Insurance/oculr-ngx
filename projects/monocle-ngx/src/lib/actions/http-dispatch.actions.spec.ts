import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpDispatchRequestOptions } from '../models/http-dispatch-request-options.interface';
import { onCompleted, onSuccess, onError } from './http-dispatch.actions';
import { AnalyticsAction } from '../models/actions/analytics-action.enum';

describe('http-dispatch Actions', () => {

  it('onCompleted can take a customFunction and build the API_COMPLETED action', () => {
    const options: HttpDispatchRequestOptions = {
      completedId: '555',
      completedEventExtras: {
        customDimensions: {
          dataValue: (response: any) => response.body.intent
        }
      }
    };

    const httpResponse = new HttpResponse({
      body: { intent: 'data' },
      status: 305
    });

    const action = onCompleted(options)(httpResponse, undefined, 1, 10);
    expect(action.payload.customDimensions && action.payload.customDimensions['dataValue']).toEqual('data');
    expect(action.type).toEqual(AnalyticsAction.API_COMPLETED);
  });

  it('onSuccess can take a customFunction and build the API_SUCCEEDED action', () => {
    const options: HttpDispatchRequestOptions = {
      completedId: '555',
      successEventExtras: {
        customDimensions: {
          dataValue: (response: any) => response.body.claimNumber
        }
      }
    };

    const httpResponse = new HttpResponse({
      body: { claimNumber: '9248982' },
      status: 305
    });

    const action = onSuccess(options)(httpResponse, undefined, 1, 10);
    expect(action.payload.customDimensions && action.payload.customDimensions['dataValue']).toEqual('9248982');
    expect(action.type).toEqual(AnalyticsAction.API_SUCCEEDED);
  });

  it('onSuccess should include any variableData in the payload', () => {
    const options: HttpDispatchRequestOptions = {
      successId: '00C0FF33',
      successEventExtras: {
        variableData:
        {
          importantName: 'Something important'
        }
      }
    };

    const httpResponse = new HttpResponse({
      body: { intent: 'data' },
      status: 200
    });

    const action = onSuccess(options)(httpResponse, undefined, 1, 10);
    expect(action.payload.variableData && action.payload.variableData['importantName']).toEqual('Something important');
  });

  it('onCompleted should include any variableData in the payload', () => {
    const options: HttpDispatchRequestOptions = {
      completedId: '01C0FF33',
      completedEventExtras: {
        variableData:
        {
          moreImportantName: 'Something more important'
        }
      }
    };

    const httpResponse = new HttpResponse({
      body: { intent: 'data' },
      status: 200
    });

    const action = onCompleted(options)(httpResponse, undefined, 1, 10);
    expect(action.payload.variableData && action.payload.variableData['moreImportantName']).toEqual('Something more important');
  });

  it('onError should include any variableData in the payload', () => {
    const options: HttpDispatchRequestOptions = {
      errorId: '02C0FF33',
      errorEventExtras: {
        variableData:
        {
          interestingName: 'Something interesting'
        }
      }
    };

    const httpResponse = new HttpErrorResponse({
      status: 500
    });

    const action = onError(options)(httpResponse, undefined, 1, 10);
    expect(action.payload.variableData && action.payload.variableData['interestingName']).toEqual('Something interesting');
  });
});
