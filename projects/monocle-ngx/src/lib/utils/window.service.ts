import { Injectable } from '@angular/core';

@Injectable()
export class WindowService {

  addEventListener = this.nativeWindow.addEventListener.bind(this.nativeWindow);
  removeEventListener = this.nativeWindow.removeEventListener.bind(this.nativeWindow);

  get windowSize(): string {
    return this.nativeWindow.innerWidth + 'x' + this.nativeWindow.innerHeight;
  }

  get screenResolution(): string {
    return this.nativeWindow.screen.width + 'x' + this.nativeWindow.screen.height;
  }

  get hostName(): string {
    return this.nativeWindow.location.hostname;
  }

  get url(): string {
    return this.nativeWindow.location.href;
  }

  get nativeWindow() {
    return (window as any);
  }

}
