import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { EventIdErrorDirective } from '../directives/event-id-error.directive';
import { EVENT_TYPES } from '../event-types';
import { AnalyticsEventModelsService } from '../services/analytics-event-models.service';
import { AnalyticsService } from '../services/analytics.service';

@Component({
  template: `
    <pui-input-error
      errorFor="testInput"
      errorType="required"
      psEventId="000000A1"
      [psEventExtras]="{ customDimensions: { dataValue: 'Blank' } }"
      #puiInputError
    >
      Please enter a valid User ID.
    </pui-input-error>
  `,
})
class TestComponent {
  @ViewChild('puiInputError') puiInputError: MockUiModalComponent;

  triggerOnError() {
    this.puiInputError.onError();
  }
}

@Component({
  selector: 'pui-input-error',
  template: `<ng-content></ng-content>`,
})
class MockUiModalComponent {
  @Output() errorStateChanged: EventEmitter<any> = new EventEmitter();

  onError() {
    this.errorStateChanged.emit({ visible: true });
  }
}

const MODELS: any = {
  '000000A1': {
    trackOn: 'click',
    details: {
      eventAction: 'LinkClick',
      eventCategory: 'Servicing',
      eventLabel: 'Doing Things',
      eventValue: 0,
      scopes: ['AppScope'],
    },
  },
};

describe('[SHALLOW] Directive: EventIdErrorDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let mockAnalyticsService: any;
  let mockAnalyticsEventModelsService: any;

  beforeEach(() => {
    mockAnalyticsService = jasmine.createSpyObj('mockAnalyticsService', ['track']);
    mockAnalyticsEventModelsService = jasmine.createSpyObj('mockAnalyticsEventModelsService', ['getModel']);

    mockAnalyticsEventModelsService.getModel.and.returnValue(MODELS['000000A1']);

    TestBed.configureTestingModule({
      declarations: [TestComponent, MockUiModalComponent, EventIdErrorDirective],
      providers: [
        { provide: AnalyticsService, useValue: mockAnalyticsService },
        { provide: AnalyticsEventModelsService, useValue: mockAnalyticsEventModelsService },
      ],
    });

    fixture = TestBed.createComponent(TestComponent);
  });

  it('should listen for errorStateChanged and run analyticsService.track interaction event', inject(
    [AnalyticsService, AnalyticsEventModelsService],
    (analyticsService: { track: any }) => {
      fixture.detectChanges();
      fixture.componentInstance.triggerOnError();

      expect(analyticsService.track).toHaveBeenCalledWith({
        type: '@pgr/analytics/INTERACTION_EVENT',
        payload: {
          customDimensions: { dataValue: 'Blank' },
          event: { visible: true },
          id: '000000A1',
          model: {
            details: {
              eventAction: 'LinkClick',
              eventCategory: 'Servicing',
              eventLabel: 'Doing Things',
              eventValue: 0,
              scopes: ['AppScope'],
            },
            trackOn: 'click',
          },
          selectedItems: undefined,
          variableData: undefined,
        },
        meta: { trackAs: EVENT_TYPES.interaction },
      });
    }
  ));
});
