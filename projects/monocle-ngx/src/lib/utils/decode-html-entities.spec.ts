import { decodeHtmlEntities } from './decode-html-entities';

describe('decodeHtmlEntities Function', () => {
  it('converts &mdash; into a long -', () => {
    const originalMessage = 'This is from &mdash; the API';
    const finalMessage = 'This is from - the API';
    expect(decodeHtmlEntities(originalMessage)).toEqual(finalMessage);
  });
});
