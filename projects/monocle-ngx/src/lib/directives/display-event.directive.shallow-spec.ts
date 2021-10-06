import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';

import { MonocleAngularModule } from '../monocle-ngx.module';
import { AnalyticsEventBusService } from '../services/analytics-event-bus.service';
import { EventDispatchService } from '../services/event-dispatch.service';

@Component({
  template: `
    <div id="tileContainer">
      <div id="tile1" *ngIf="shouldDisplayTile | async" [pa-display-event]="tileDisplayEvent"></div>
    </div>
    <div [pa-display-event] *ngIf="shouldDisplayPromo | async">Promo</div>
    <h1 [pa-display-event]="headingDisplayEvent" *ngIf="shouldDisplayHeading | async"></h1>
    <p [pa-display-event]="paragraphDisplayEvent" *ngIf="shouldDisplayParagraph | async">Body text</p>
    <button
      id="button1"
      value="Next"
      [pa-display-event]="buttonDisplayEvent"
      *ngIf="shouldDisplayButton | async"
    ></button>
  `,
})
class TestComponent {
  tileDisplayEvent = { trackOn: 'custom', eventId: 'TILE1HASH', eventKey: 'TileDisplay' };
  headingDisplayEvent = null;
  paragraphDisplayEvent = undefined;
  buttonDisplayEvent = {};
  shouldDisplayTile = new Subject<boolean>();
  shouldDisplayPromo = new Subject<boolean>();
  shouldDisplayHeading = new Subject<boolean>();
  shouldDisplayParagraph = new Subject<boolean>();
  shouldDisplayButton = new Subject<boolean>();

  onInit() {
    this.shouldDisplayTile.next(false);
    this.shouldDisplayPromo.next(false);
    this.shouldDisplayHeading.next(false);
    this.shouldDisplayParagraph.next(false);
    this.shouldDisplayButton.next(false);
  }
}

describe('Display Event Directive', () => {
  let fixture: ComponentFixture<TestComponent>;
  let mockEventDispatchService: any;
  let mockAnalyticsEventBusService: any;

  beforeEach(fakeAsync(() => {
    mockEventDispatchService = {
      trackDisplay: jasmine.createSpy('trackDisplay'),
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
  it('does not dispatch a display event if the component is not added', fakeAsync(() => {
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledTimes(0);
  }));
  describe('when component gets added', () => {
    beforeEach(fakeAsync(() => {
      fixture.componentInstance.shouldDisplayTile.next(true);
      fixture.detectChanges();
      tick();
    }));
    it('dispatches a display event', fakeAsync(() => {
      expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledWith({
        trackOn: 'custom',
        eventId: 'TILE1HASH',
        eventKey: 'TileDisplay',
      });
    }));
    it('sets `analytics-display-id` attribute on element to value in model', fakeAsync(() => {
      const debugEl = fixture.debugElement.query(By.css('[id="tile1"]'));
      expect(debugEl.nativeElement.getAttribute('analytics-display-id')).toBe('TILE1HASH');
    }));
  });
  it('gracefully handles when no model is supplied in html template', fakeAsync(() => {
    fixture.componentInstance.shouldDisplayPromo.next(true);
    fixture.detectChanges();
    tick();
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledTimes(0);
  }));
  it('gracefully handles when `null` is supplied by component', fakeAsync(() => {
    fixture.componentInstance.shouldDisplayHeading.next(true);
    fixture.detectChanges();
    tick();
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledTimes(0);
  }));
  it('gracefully handles when `undefined` is supplied by component', fakeAsync(() => {
    fixture.componentInstance.shouldDisplayParagraph.next(true);
    fixture.detectChanges();
    tick();
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledTimes(0);
  }));
  it('gracefully handles when garbage is supplied by component', fakeAsync(() => {
    fixture.componentInstance.shouldDisplayButton.next(true);
    fixture.detectChanges();
    tick();
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledTimes(0);
  }));
});
