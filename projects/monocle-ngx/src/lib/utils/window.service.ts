import { Injectable } from '@angular/core';

@Injectable()
export class WindowService {
  constructor(private window: Window) {}

  addEventListener = this.window.addEventListener.bind(this.nativeWindow);
  removeEventListener = this.window.removeEventListener.bind(this.nativeWindow);

  get windowSize(): string {
    return `${this.window.innerWidth}x${this.window.innerHeight}`;
  }

  get screenResolution(): string {
    return `${this.window.screen.width}x${this.window.screen.height}`;
  }

  get hostName(): string {
    return this.window.location.hostname;
  }

  get url(): string {
    return this.window.location.href;
  }

  // FIXME: this is be used in google-tage-manager.service.ts incorrectly and needs to be appropriately typed as Window or removed
  get nativeWindow(): any {
    return this.window;
  }
}
