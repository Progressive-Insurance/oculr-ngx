import { Injectable } from '@angular/core';

@Injectable()
export class WindowService {
  constructor(private window: Window) {}

  get url(): string {
    return this.window.location.href;
  }

  // FIXME: this is be used in google-tage-manager.service.ts incorrectly and needs to be appropriately typed as Window or removed
  get nativeWindow(): any {
    return this.window;
  }
}
