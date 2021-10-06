import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { MonocleAngularModule } from '../monocle-ngx.module';
import { AnalyticsEventBusService } from '../services/analytics-event-bus.service';
import { EventDispatchService } from '../services/event-dispatch.service';

@Component({
  template: `
    <div id="tileContainer">
      <div id="tile1">
        <div>
          <header id="header1" [pa-interaction-event]="header1Event">
            Happy Paths <span [pa-interaction-event]="tooltip1Event"><img id="tooltip1" src="" /></span>
          </header>
        </div>
        <div>
          <article>Body text with <a id="link1" [pa-interaction-event]="link1Event">link</a></article>
          <button id="button1" value="Next"></button>
        </div>
      </div>
      <div id="tile2">
        <div>
          <header id="header2" [pa-interaction-event]>
            Unhappy Paths <img id="tooltip2" [pa-interaction-event]="tooltip2Event" src="" />
          </header>
        </div>
        <div>
          <article>Body text with <a id="link2" [pa-interaction-event]="link2Event">link</a></article>
          <button id="button2" [pa-interaction-event]="button2Event" value="Next"></button>
        </div>
        <div>
          <select id="select1" [pa-interaction-event]="select1Event">
            <option></option>
            <option value="1" pui-option>One</option>
            <option value="2" pui-option>Two</option>
          </select>
        </div>
      </div>
    </div>
  `,
})
class TestComponent {
  header1Event = { trackOn: 'click', eventId: 'HEADER1HASH', eventKey: 'Header1Click', customDimensions: {} };
  tooltip1Event = { trackOn: 'click', eventId: 'TOOLTIP1HASH', eventKey: 'Tooltip1Click', customDimensions: {} };
  link1Event: any = { trackOn: 'click', eventId: 'LINK1HASH1', eventKey: 'Link1Click', customDimensions: {} };
  select1Event = {
    trackOn: 'change',
    eventId: 'SELECT1HASH',
    eventKey: 'Select1Change',
    customDimensions: { dataValue: ($event: any) => $event.target.nodeName },
  };
  tooltip2Event = null;
  link2Event = undefined;
  button2Event = {};

  changeLinkEvent() {
    this.link1Event = { trackOn: 'focus', eventId: 'LINK1HASH2', eventKey: 'Link1Focus', customDimensions: {} };
  }
  clearLinkEvent() {
    this.link1Event = null;
  }
}

describe('Interaction Event Directive', () => {
  let mockEventDispatchService: any;
  let mockAnalyticsEventBusService: any;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(fakeAsync(() => {
    mockEventDispatchService = {
      trackInteraction: jasmine.createSpy('trackInteraction'),
    };
    mockAnalyticsEventBusService = {
      dispatch: jasmine.createSpy('dispatch'),
    };

    TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule.withRoutes([]), MonocleAngularModule.forRoot([], '')],
      declarations: [TestComponent],
      providers: [
        { provide: EventDispatchService, useValue: mockEventDispatchService },
        { provide: AnalyticsEventBusService, useValue: mockAnalyticsEventBusService },
      ],
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    tick();
  }));

  describe('custom (priority) mouseDown/mouseUp click handler replacement', () => {
    it('does not fire INTERACTION_EVENT action if mouseUp is out of the target box', fakeAsync(() => {
      const targetBox = fixture.debugElement.query(By.css('[id="header1"]'));
      const parentBox = fixture.debugElement.query(By.css('[id="tile1"]'));
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      targetBox.nativeElement.dispatchEvent(downEvent);
      parentBox.nativeElement.dispatchEvent(upEvent);
      tick();
      expect(mockEventDispatchService.trackInteraction).not.toHaveBeenCalled();
    }));

    it('fires INTERACTION_EVENT action if mouseUp is in the target box', fakeAsync(() => {
      const targetBox = fixture.debugElement.query(By.css('[id="header1"]'));
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      targetBox.nativeElement.dispatchEvent(downEvent);
      targetBox.nativeElement.dispatchEvent(upEvent);
      tick();
      expect(mockEventDispatchService.trackInteraction).toHaveBeenCalled();
    }));
  });
  describe('when valid models are supplied', () => {
    it('sets `analytics-id` attribute on element to value in model', fakeAsync(() => {
      const debugEl = fixture.debugElement.query(By.css('[id="header1"]'));
      expect(debugEl.nativeElement.getAttribute('analytics-id')).toBe('HEADER1HASH');
    }));
    it('attaches a listener on event specified in event model', fakeAsync(() => {
      const debugEl = fixture.debugElement.query(By.css('[id="header1"]'));
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      debugEl.nativeElement.dispatchEvent(downEvent);
      debugEl.nativeElement.dispatchEvent(upEvent);
      tick();
      expect(mockEventDispatchService.trackInteraction).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackInteraction.calls.argsFor(0)[0]).toEqual({
        trackOn: 'click',
        eventId: 'HEADER1HASH',
        eventKey: 'Header1Click',
        customDimensions: {},
      });
    }));
    it('prevents child event from triggering parent event', fakeAsync(() => {
      const debugEl = fixture.debugElement.query(By.css('[id="tooltip1"]'));
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      debugEl.nativeElement.dispatchEvent(downEvent);
      debugEl.nativeElement.dispatchEvent(upEvent);
      tick();
      expect(mockEventDispatchService.trackInteraction).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackInteraction.calls.argsFor(0)[0]).toEqual({
        trackOn: 'click',
        eventKey: 'Tooltip1Click',
        eventId: 'TOOLTIP1HASH',
        customDimensions: {},
      });
    }));
    it('attaches new listener on event if model changes', fakeAsync(() => {
      fixture.componentInstance.changeLinkEvent();
      fixture.detectChanges();
      tick();
      const debugEl = fixture.debugElement.query(By.css('[id="link1"]'));
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      debugEl.nativeElement.dispatchEvent(downEvent);
      debugEl.nativeElement.dispatchEvent(upEvent);
      debugEl.nativeElement.dispatchEvent(new Event('focus'));
      tick();
      expect(mockEventDispatchService.trackInteraction).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackInteraction.calls.argsFor(0)[0]).toEqual({
        trackOn: 'focus',
        eventId: 'LINK1HASH2',
        eventKey: 'Link1Focus',
        customDimensions: {},
      });
    }));
    it('removes listener if new model is not supplied', fakeAsync(() => {
      fixture.componentInstance.clearLinkEvent();
      fixture.detectChanges();
      tick();
      const debugEl = fixture.debugElement.query(By.css('[id="link1"]'));
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      debugEl.nativeElement.dispatchEvent(downEvent);
      debugEl.nativeElement.dispatchEvent(upEvent);
      tick();
      expect(mockEventDispatchService.trackInteraction).not.toHaveBeenCalled();
    }));
  });
  describe('when bad models are supplied', () => {
    it('gracefully handles when no model is supplied in html template', fakeAsync(() => {
      const debugEl = fixture.debugElement.query(By.css('[id="header2"]'));
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      debugEl.nativeElement.dispatchEvent(downEvent);
      debugEl.nativeElement.dispatchEvent(upEvent);
      tick();
      expect(mockEventDispatchService.trackInteraction).toHaveBeenCalledTimes(0);
    }));
    it('gracefully handles when `null` is supplied by component', fakeAsync(() => {
      const debugEl = fixture.debugElement.query(By.css('[id="tooltip2"]'));
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      debugEl.nativeElement.dispatchEvent(downEvent);
      debugEl.nativeElement.dispatchEvent(upEvent);
      tick();
      expect(mockEventDispatchService.trackInteraction).toHaveBeenCalledTimes(0);
    }));
    it('gracefully handles when `undefined` is supplied by component', fakeAsync(() => {
      const debugEl = fixture.debugElement.query(By.css('[id="link2"]'));
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      debugEl.nativeElement.dispatchEvent(downEvent);
      debugEl.nativeElement.dispatchEvent(upEvent);
      tick();
      expect(mockEventDispatchService.trackInteraction).toHaveBeenCalledTimes(0);
    }));
    it('gracefully handles when garbage is supplied by component', fakeAsync(() => {
      const debugEl = fixture.debugElement.query(By.css('[id="button2"]'));
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      debugEl.nativeElement.dispatchEvent(downEvent);
      debugEl.nativeElement.dispatchEvent(upEvent);
      tick();
      expect(mockEventDispatchService.trackInteraction).toHaveBeenCalledTimes(0);
    }));
  });
});
