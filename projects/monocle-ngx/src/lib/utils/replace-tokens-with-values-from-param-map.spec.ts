import { convertToParamMap } from '@angular/router';
import { replaceTokensWithValuesFromParamMap } from './replace-tokens-with-values-from-param-map';
describe('replaceTokensWithValuesFromParamMap', () => {
  it('replaces only full tokens in the middle and at the end', () => {
    const currentUrl = '/id-card-hub/:policy/:policy';
    const paramMap = convertToParamMap({policy: 'hello'});
    const replaceParamTokens = ['policy'];
    const expected = '/id-card-hub/hello/hello';
    expect(replaceTokensWithValuesFromParamMap(currentUrl, paramMap, replaceParamTokens)).toEqual(expected);
  });
  it('ignores partial matches', () => {
    const currentUrl = '/id-card-hub/:policyNum/:policyNum';
    const paramMap = convertToParamMap({policy: 'hello'});
    const replaceParamTokens = ['policy'];
    const expected = '/id-card-hub/:policyNum/:policyNum';
    expect(replaceTokensWithValuesFromParamMap(currentUrl, paramMap, replaceParamTokens)).toEqual(expected);
  });
  it('inserts params into a url', () => {
    const currentUrl = '/id-card-hub/:policyNumber/:termId/id-card';
    const paramMap = convertToParamMap({policyNumber: '123456'});
    const replaceParamTokens = ['policyNumber'];
    const expected = '/id-card-hub/123456/:termId/id-card';
    expect(replaceTokensWithValuesFromParamMap(currentUrl, paramMap, replaceParamTokens)).toEqual(expected);
  });
  it('returns an undefined url', () => {
    const currentUrl = undefined;
    const paramMap = convertToParamMap({policyNumber: '123'});
    const replaceParamTokens = ['policyNumber'];
    expect(replaceTokensWithValuesFromParamMap(currentUrl, paramMap, replaceParamTokens))
      .toEqual('');
  });
  it('ignores tokens it is not supposed to replace', () => {
    const currentUrl = '/id-card-hub/:policyNumber/:termId/id-card';
    const paramMap = convertToParamMap({policyNumber: '12345', termId: '0'});
    const replaceParamTokens: any[] = [];
    const expected = '/id-card-hub/:policyNumber/:termId/id-card';
    expect(replaceTokensWithValuesFromParamMap(currentUrl, paramMap, replaceParamTokens)).toEqual(expected);
  });
});
