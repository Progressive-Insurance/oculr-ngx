import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppConfiguration } from '../models/app-configuration.interface';

@Injectable()
export class ConfigurationService {
  private _appConfig$: BehaviorSubject<AppConfiguration>;
  appConfig$: Observable<AppConfiguration>;

  constructor() {
    this._appConfig$ = new BehaviorSubject({});
    this.appConfig$ = this._appConfig$.asObservable();
  }

  loadAppConfig(config: AppConfiguration): void {
    this._appConfig$.next(config);
  }
}
