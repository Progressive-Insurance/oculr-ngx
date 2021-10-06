import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { EVENT_TYPES } from '../event-types';
import { AnalyticsAction } from '../models/actions/analytics-action.enum';
import { AnalyticsEventModelMap } from '../models/analytics-event-model-map.interface';
import { AnalyticsEventModel } from '../models/analytics-event-model.interface';
import { MonocleAngularModule } from '../monocle-ngx.module';
import { AnalyticsEventBusService } from '../services/analytics-event-bus.service';
import { AnalyticsEventModelsService } from '../services/analytics-event-models.service';
import { AnalyticsService } from '../services/analytics.service';
import { EventDispatchService } from '../services/event-dispatch.service';

@Component({
  template: `
    <a id="a1" [psEventId]="'000000A1'">Link 1</a>
    <a
      id="a3"
      [psEventId]="'000000A3'"
      [psEventExtras]="{ customDimensions: { label: 'Fall Campaign' }, selectedItems: { agentCode: 'ABC123' } }"
      >Link 2</a
    >
    <pui-input-error
      id="a5"
      errorFor="test"
      errorType="required"
      [psEventId]="'000000A5'"
      [psEventExtras]="{ selectedItems: { agentCode: 'ABC123' } }"
    ></pui-input-error>
  `,
})
class TestComponent {}

@Component({
  template: `
    <div psEventId="parentDisplay">
      <a href="#" psEventId="000000A1" id="click">This is my link</a>
      <span psEventId="childConditionalDisplay" *ngIf="displayChild">Conditional Child</span>>
      <span psEventId="childDisplay">Child</span>>
    </div>
  `,
})
class BubbleTestComponent {
  displayChild = false;
}

@Component({
  template: `
    <div id="parent">
      <a id="a1" [psEventId]="'000000A1'">Link 1</a>
      <a id="a3" [psEventId]="'000000A3'" [psEventExtras]="{ customDimensions: { label: 'Fall Campaign' } }">Link 2</a>
      <pui-input-error id="a5" errorFor="test" errorType="required" [psEventId]="'000000A5'"></pui-input-error>
    </div>
  `,
})
class MouseUpDownTestComponent {}

@Component({
  template: `
    <div id="parent">
      <a id="a1" [psEventId]="'000000A1'">Link 1</a>
      <a id="a3" [psEventId]="'000000A3'" [psEventExtras]="undefined">Link 2</a>
      <pui-input-error id="a5" errorFor="test" errorType="required" [psEventId]="'000000A5'"></pui-input-error>
    </div>
  `,
})
class UndefinedEventExtrasTestComponent {}

@Component({
  template: `
    <div id="parent" psEventId="000000A1">
      <a id="a1"> Parent Link 1</a>
      <div id="child" psEventId="000000A3">
        <a href="#" id="a3">Child Link 2</a>
      </div>
    </div>
  `,
})
class NestedTestComponent {}

const MODELS: AnalyticsEventModelMap = {
  '000000A1': {
    trackOn: 'click',
    details: {
      eventAction: 'LinkClick',
      eventCategory: 'Servicing',
      eventLabel: 'Doing Things',
      eventValue: 0,
      scopes: ['AppScope'],
    },
  } as AnalyticsEventModel,
  '000000A3': {
    trackOn: 'click',
    details: {
      eventAction: 'LinkClick',
      eventCategory: 'Servicing',
      eventLabel: 'Link 2 Clicked',
      eventValue: 0,
      scopes: ['AppScope'],
    },
  } as AnalyticsEventModel,
  '000000A5': {
    trackOn: 'click',
    details: {
      eventAction: 'LinkClick',
      eventCategory: 'Servicing',
      eventLabel: 'Custom Event',
      eventValue: 0,
      scopes: ['AppScope'],
    },
  } as AnalyticsEventModel,
  parentDisplay: {
    trackOn: 'custom',
    details: {
      eventAction: 'Display',
      eventCategory: 'Servicing',
      eventLabel: 'Parent Display',
      eventValue: 0,
      scopes: ['AppScope'],
    },
  } as AnalyticsEventModel,
  childDisplay: {
    trackOn: 'custom',
    details: {
      eventAction: 'Display',
      eventCategory: 'Servicing',
      eventLabel: 'Child Display',
      eventValue: 0,
      scopes: ['AppScope'],
    },
  } as AnalyticsEventModel,
  childConditionalDisplay: {
    trackOn: 'custom',
    details: {
      eventAction: 'Display',
      eventCategory: 'Servicing',
      eventLabel: 'Conditional Child Display',
      eventValue: 0,
      scopes: ['AppScope'],
    },
  } as AnalyticsEventModel,
};

describe('EventId Directive', () => {
  let mockEventDispatchService: any;
  let mockAnalyticsService: any;
  let mockAnalyticsEventBusService: any;

  beforeEach(() => {
    mockEventDispatchService = {
      trackAnalyticsError: jasmine.createSpy('trackAnalyticsError'),
    };
    mockAnalyticsService = {
      track: jasmine.createSpy('track'),
    };
    mockAnalyticsEventBusService = {
      dispatch: jasmine.createSpy('dispatch'),
    };
  });

  describe('custom (priority) mouseDown/mouseUp click handler replacement', () => {
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule, RouterTestingModule.withRoutes([]), MonocleAngularModule.forRoot([MODELS], 'ABC123')],
        declarations: [MouseUpDownTestComponent],
        providers: [
          AnalyticsEventModelsService,
          { provide: EventDispatchService, useValue: mockEventDispatchService },
          { provide: AnalyticsService, useValue: mockAnalyticsService },
          { provide: AnalyticsEventBusService, useValue: mockAnalyticsEventBusService },
        ],
      });
      fixture = TestBed.createComponent(MouseUpDownTestComponent);
      fixture.detectChanges();
    });

    it('does not fire INTERACTION_EVENT action if mouseUp is out of the target box', fakeAsync(() => {
      const targetBox = fixture.debugElement.query(By.css('[id="a1"]'));
      const parentBox = fixture.debugElement.query(By.css('[id="parent"]'));
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      targetBox.nativeElement.dispatchEvent(downEvent);
      parentBox.nativeElement.dispatchEvent(upEvent);
      tick();
      expect(mockAnalyticsService.track).not.toHaveBeenCalled();
    }));

    it('fires INTERACTION_EVENT action if mouseUp is in the target box', fakeAsync(() => {
      const targetBox = fixture.debugElement.query(By.css('[id="a1"]'));
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      targetBox.nativeElement.dispatchEvent(downEvent);
      targetBox.nativeElement.dispatchEvent(upEvent);
      tick();
      expect(mockAnalyticsService.track).toHaveBeenCalled();
    }));
  });

  describe('should not bubble up the event', () => {
    let fixture: ComponentFixture<NestedTestComponent>;
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule, RouterTestingModule.withRoutes([]), MonocleAngularModule.forRoot([MODELS], 'ABC123')],
        declarations: [NestedTestComponent],
        providers: [
          AnalyticsEventModelsService,
          { provide: EventDispatchService, useValue: mockEventDispatchService },
          { provide: AnalyticsService, useValue: mockAnalyticsService },
          { provide: AnalyticsEventBusService, useValue: mockAnalyticsEventBusService },
        ],
      });
      fixture = TestBed.createComponent(NestedTestComponent);
      fixture.detectChanges();
    });

    it('dispatch the event for the nearest parent element with psEventid', fakeAsync(() => {
      const targetBox = fixture.debugElement.query(By.css('[id="a3"]'));
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      targetBox.nativeElement.dispatchEvent(downEvent);
      targetBox.nativeElement.dispatchEvent(upEvent);
      tick();
      expect(mockAnalyticsService.track).toHaveBeenCalledWith({
        type: `${AnalyticsAction.INTERACTION_EVENT}`,
        payload: {
          event: upEvent,
          id: '000000A3',
          model: MODELS['000000A3'],
          customDimensions: undefined,
          variableData: undefined,
          selectedItems: undefined,
        },
        meta: {
          trackAs: EVENT_TYPES.interaction,
        },
      });
      expect(mockAnalyticsService.track).toHaveBeenCalledTimes(1);
    }));
  });

  describe('for elements other than pui-input-error', () => {
    describe('when event lookup is successful', () => {
      let fixture: ComponentFixture<TestComponent>;

      beforeEach(() => {
        TestBed.configureTestingModule({
          imports: [CommonModule, RouterTestingModule.withRoutes([]), MonocleAngularModule.forRoot([MODELS], 'ABC123')],
          declarations: [TestComponent],
          providers: [
            AnalyticsEventModelsService,
            { provide: EventDispatchService, useValue: mockEventDispatchService },
            { provide: AnalyticsService, useValue: mockAnalyticsService },
            { provide: AnalyticsEventBusService, useValue: mockAnalyticsEventBusService },
          ],
        });
        fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
      });

      it('wires up an event handler that dispatches a INTERACTION_EVENT action', fakeAsync(() => {
        const debugEl = fixture.debugElement.query(By.css('[id="a1"]'));
        const downEvent = new MouseEvent('mousedown', { bubbles: true });
        const upEvent = new MouseEvent('mouseup', { bubbles: true });
        debugEl.nativeElement.dispatchEvent(downEvent);
        debugEl.nativeElement.dispatchEvent(upEvent);
        tick();
        expect(mockAnalyticsService.track).toHaveBeenCalled();
        expect(mockAnalyticsService.track).toHaveBeenCalledWith({
          type: `${AnalyticsAction.INTERACTION_EVENT}`,
          payload: {
            event: upEvent,
            id: '000000A1',
            model: MODELS['000000A1'],
            customDimensions: undefined,
            variableData: undefined,
            selectedItems: undefined,
          },
          meta: {
            trackAs: EVENT_TYPES.interaction,
          },
        });
      }));

      it('includes any extra properties specified in the HTML template as customDimensions and selectedItems', fakeAsync(() => {
        const debugEl = fixture.debugElement.query(By.css('[id="a3"]'));
        const downEvent = new MouseEvent('mousedown', { bubbles: true });
        const upEvent = new MouseEvent('mouseup', { bubbles: true });
        debugEl.nativeElement.dispatchEvent(downEvent);
        debugEl.nativeElement.dispatchEvent(upEvent);
        tick();
        expect(mockAnalyticsService.track).toHaveBeenCalled();
        expect(mockAnalyticsService.track).toHaveBeenCalledWith({
          type: `${AnalyticsAction.INTERACTION_EVENT}`,
          payload: {
            event: upEvent,
            id: '000000A3',
            model: MODELS['000000A3'],
            customDimensions: { label: 'Fall Campaign' },
            variableData: undefined,
            selectedItems: { agentCode: 'ABC123' },
          },
          meta: {
            trackAs: EVENT_TYPES.interaction,
          },
        });
      }));
    });
  });

  describe('for pui-input-error elements', () => {
    let fixture: ComponentFixture<TestComponent>;
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule, RouterTestingModule.withRoutes([]), MonocleAngularModule.forRoot([MODELS], 'ABC123')],
        declarations: [TestComponent],
        providers: [
          AnalyticsEventModelsService,
          { provide: EventDispatchService, useValue: mockEventDispatchService },
          { provide: AnalyticsService, useValue: mockAnalyticsService },
          { provide: AnalyticsEventBusService, useValue: mockAnalyticsEventBusService },
        ],
      });
      fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
    });
    it('does not attach an event handler', () => {
      const debugEl = fixture.debugElement.query(By.css('[id="a5"]'));
      debugEl.nativeElement.click();
      expect(mockAnalyticsService.track).not.toHaveBeenCalled();
    });
  });

  describe('event bubbling behaviour of nested items', () => {
    const parentDisplayAction = jasmine.objectContaining({
      payload: jasmine.objectContaining({ id: 'parentDisplay' }),
    });
    const childDisplayAction = jasmine.objectContaining({ payload: jasmine.objectContaining({ id: 'childDisplay' }) });
    const conditionalChildAction = jasmine.objectContaining({
      payload: jasmine.objectContaining({ id: 'childConditionalDisplay' }),
    });
    const clickAction = jasmine.objectContaining({ payload: jasmine.objectContaining({ id: '000000A1' }) });

    let fixture: ComponentFixture<BubbleTestComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes([]), CommonModule, MonocleAngularModule.forRoot([MODELS], 'ABC123')],
        declarations: [BubbleTestComponent],
        providers: [
          AnalyticsEventModelsService,
          { provide: EventDispatchService, useValue: mockEventDispatchService },
          { provide: AnalyticsService, useValue: mockAnalyticsService },
          { provide: AnalyticsEventBusService, useValue: mockAnalyticsEventBusService },
        ],
      });
      fixture = TestBed.createComponent(BubbleTestComponent);
    });

    it('should not bubble custom events up to the parent', inject(
      [],
      fakeAsync(() => {
        const component = fixture.componentInstance;
        expect(mockAnalyticsService.track).not.toHaveBeenCalled();
        fixture.detectChanges();
        tick();
        expect(mockAnalyticsService.track).toHaveBeenCalledTimes(2);
        expect(mockAnalyticsService.track).toHaveBeenCalledWith(parentDisplayAction);
        expect(mockAnalyticsService.track).toHaveBeenCalledWith(childDisplayAction);
        mockAnalyticsService.track.calls.reset();
        component.displayChild = true;
        fixture.detectChanges();
        tick();
        expect(mockAnalyticsService.track).toHaveBeenCalledTimes(1);
        expect(mockAnalyticsService.track).toHaveBeenCalledWith(conditionalChildAction);
      })
    ));

    it('should not have custom events capture click events', fakeAsync(() => {
      const debugElement = fixture.debugElement.query(By.css('[id="click"]'));
      expect(mockAnalyticsService.track).not.toHaveBeenCalled();
      fixture.detectChanges();
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      debugElement.nativeElement.dispatchEvent(downEvent);
      debugElement.nativeElement.dispatchEvent(upEvent);
      tick();
      expect(mockAnalyticsService.track).toHaveBeenCalledTimes(3);
      expect(mockAnalyticsService.track).toHaveBeenCalledWith(parentDisplayAction);
      expect(mockAnalyticsService.track).toHaveBeenCalledWith(childDisplayAction);
      expect(mockAnalyticsService.track).toHaveBeenCalledWith(clickAction);
    }));
  });

  describe('when psEventExtras input property has a value of undefined', () => {
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule, RouterTestingModule.withRoutes([]), MonocleAngularModule.forRoot([MODELS], 'ABC123')],
        declarations: [UndefinedEventExtrasTestComponent],
        providers: [
          AnalyticsEventModelsService,
          { provide: EventDispatchService, useValue: mockEventDispatchService },
          { provide: AnalyticsService, useValue: mockAnalyticsService },
          { provide: AnalyticsEventBusService, useValue: mockAnalyticsEventBusService },
        ],
      });
      fixture = TestBed.createComponent(UndefinedEventExtrasTestComponent);
      fixture.detectChanges();
    });

    it('should default customDimensions, variableData and selectedItems to undefined', fakeAsync(() => {
      const debugEl = fixture.debugElement.query(By.css('[id="a3"]'));
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      debugEl.nativeElement.dispatchEvent(downEvent);
      debugEl.nativeElement.dispatchEvent(upEvent);
      tick();
      expect(mockAnalyticsService.track).toHaveBeenCalledWith({
        type: `${AnalyticsAction.INTERACTION_EVENT}`,
        payload: {
          event: upEvent,
          id: '000000A3',
          model: MODELS['000000A3'],
          customDimensions: undefined,
          variableData: undefined,
          selectedItems: undefined,
        },
        meta: {
          trackAs: EVENT_TYPES.interaction,
        },
      });
    }));
  });
});
