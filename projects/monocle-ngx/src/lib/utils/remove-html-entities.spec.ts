import { removeHtmlEntities } from './remove-html-entities';

describe('removeHtmlEntities Function', () => {
  it('removes all entities from a string', () => {
    const htmlString = 'This is &reg; and this is &amp;';
    const textString = 'This is  and this is ';
    expect(removeHtmlEntities(htmlString)).toEqual(textString);
  });

  it('removes all NON-WHITELISTED entities from a string', () => {
    const htmlString = 'This is &reg; &amp;';
    const textString = 'This is &reg; ';
    expect(removeHtmlEntities(htmlString, ['&reg;'])).toEqual(textString);
  });

  it('doesn\'t remove &nbsp;', () => {
    const htmlString = '&lt;Home&mdash;&nbsp;Page';
    const textString = 'Home&mdash;&nbsp;Page';
    expect(removeHtmlEntities(htmlString, ['&mdash;'])).toEqual(textString);
  });

});
