import { Injectable } from '@angular/core';
import { ConsoleService } from '../destinations/console/console.service';
import { SplunkService } from '../destinations/splunk/splunk.service';

@Injectable()
export class InitializationService {
  constructor(private console: ConsoleService, private splunk: SplunkService) {}

  init(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.console.init();
      this.splunk.init();
      resolve();
    });
  }
}
