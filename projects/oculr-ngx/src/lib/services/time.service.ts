import { Injectable } from '@angular/core';

@Injectable()
export class TimeService {
  now(): number {
    return performance.now();
  }
}
