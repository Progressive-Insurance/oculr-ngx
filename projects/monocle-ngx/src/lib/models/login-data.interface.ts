import { LoginStatus } from '../models/login-status';
import { LoginIndicator } from '../models/login-indicator.type';

export interface LoginData {
  customerId: string;
  entityId: string;
  entityType: string;
  hasDecodedAccessToken: boolean;
  isLoggedIn: boolean;
  loginIndicator: LoginIndicator;
  loginStatus: LoginStatus;
  loginMethod: string;
  policyNumber: string;
  policyNumberArray: string;
  trackingId: string;
}
