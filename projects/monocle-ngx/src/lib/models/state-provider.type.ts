import { Observable } from 'rxjs';

export type StateProvider = () => Observable<any>;
