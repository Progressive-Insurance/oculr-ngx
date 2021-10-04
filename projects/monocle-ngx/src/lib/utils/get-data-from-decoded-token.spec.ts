import { getDataFromDecodedToken } from './get-data-from-decoded-token';

describe('getDataFromDecodedToken', () => {
  it('should return a base object regardless of entity type', () => {
    const decodedToken: any = {
      entity_type: 'test',
      tracking_id: 'trackingId'
    };

    const expected: any = {
      customerId: '',
      entityId: '',
      entityType: 'test',
      hasDecodedAccessToken: true,
      isLoggedIn: true,
      loginIndicator: 'Yes',
      loginStatus: 'Logged In',
      loginMethod: '',
      policyNumber: '',
      policyNumberArray: '',
      trackingId: 'trackingId'
    };

    const actual: any = getDataFromDecodedToken(decodedToken);

    expect(actual).toEqual(expected);
  });

  it('should set entityId and customerId to the token sub if entity_type is OlsPerson', () => {
    const decodedToken: any = {
      entity_type: 'OlsPerson',
      tracking_id: 'ols_trackingId',
      sub: 'ols_sub'
    };

    const expected: any = {
      entityType: 'OlsPerson',
      isLoggedIn: true,
      loginIndicator: 'Yes',
      loginStatus: 'Logged In',
      loginMethod: 'UserID',
      trackingId: 'ols_trackingId',
      hasDecodedAccessToken: true,
      entityId: 'ols_sub',
      customerId: 'ols_sub',
      policyNumber: '',
      policyNumberArray: ''
    };

    const actual: any = getDataFromDecodedToken(decodedToken);

    expect(actual).toEqual(expected);
  });

  it('should set entityId and policy details to the token sub if entity_type is PolicyPerson', () => {
    const decodedToken: any = {
      entity_type: 'PolicyPerson',
      tracking_id: 'policy_trackingId',
      sub: 'policy_entity_sub'
    };

    const expected: any = {
      entityType: 'PolicyPerson',
      isLoggedIn: true,
      loginIndicator: 'Yes',
      loginStatus: 'Logged In',
      loginMethod: 'LowLevel',
      trackingId: 'policy_trackingId',
      hasDecodedAccessToken: true,
      entityId: 'policy_entity_sub',
      customerId: '',
      policyNumber: 'policy_entity_sub',
      policyNumberArray: 'policy_entity_sub'
    };

    const actual: any = getDataFromDecodedToken(decodedToken);

    expect(actual).toEqual(expected);
  });

  it('should set entityId and policy details to the token sub if entity_type is ClaimPerson', () => {
    const decodedToken: any = {
      entity_type: 'ClaimPerson',
      tracking_id: 'claim_trackingId',
      sub: 'claim_entity_sub'
    };

    const expected: any = {
      entityType: 'ClaimPerson',
      isLoggedIn: true,
      loginIndicator: 'Yes',
      loginStatus: 'Logged In',
      loginMethod: 'LowLevel',
      trackingId: 'claim_trackingId',
      hasDecodedAccessToken: true,
      entityId: 'claim_entity_sub',
      customerId: '',
      policyNumber: '',
      policyNumberArray: ''
    };

    const actual: any = getDataFromDecodedToken(decodedToken);

    expect(actual).toEqual(expected);
  });
});
