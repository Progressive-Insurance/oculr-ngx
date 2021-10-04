import { JwtToken } from '../models/jwt-token.interface';
import { LoginData } from '../models/login-data.interface';

export const getDataFromDecodedToken = (decodedToken: JwtToken): LoginData => {
  const commonData: LoginData = {
    customerId: '',
    entityId: '',
    entityType: decodedToken.entity_type,
    hasDecodedAccessToken: true,
    isLoggedIn: true,
    loginIndicator: 'Yes',
    loginStatus: 'Logged In',
    loginMethod: '',
    trackingId: decodedToken.tracking_id,
    policyNumber: '',
    policyNumberArray: ''
  };

  switch (decodedToken.entity_type) {
    case 'OlsPerson':
      return {
        ...commonData,
        customerId: decodedToken.sub,
        entityId: decodedToken.sub,
        loginMethod: 'UserID'
      };
    case 'PolicyPerson':
      return {
        ...commonData,
        entityId: decodedToken.sub,
        policyNumber: decodedToken.sub,
        policyNumberArray: decodedToken.sub,
        loginMethod: 'LowLevel'
      };
    case 'ClaimPerson':
      return {
        ...commonData,
        entityId: decodedToken.sub,
        loginMethod: 'LowLevel'
      };
    default:
      return commonData;
  }
};
