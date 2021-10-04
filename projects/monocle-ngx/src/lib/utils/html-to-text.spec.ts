import { htmlToText } from './html-to-text';

describe('htmlToText Function', () => {
  it('removes tags from a string', () => {
    const htmlString = 'This is <b>bold</b> text. &amp; these are line breaks <br> <br />';
    const textString = 'This is bold text. & these are line breaks  ';
    expect(htmlToText(htmlString)).toEqual(textString);
  });

  it('removes tags without a closing tag', () => {
    const htmlString = 'This is a <test>here';
    const textString = 'This is a here';
    expect(htmlToText(htmlString)).toEqual(textString);
  });

  it('does not remove text that happens to use < and > signs', () => {
    const htmlString = 'This statement, 3 < 5 is true but, 2 > 3 is false.';
    const textString = 'This statement, 3 < 5 is true but, 2 > 3 is false.';
    expect(htmlToText(htmlString)).toEqual(textString);
  });

  it('converts tags and text', () => {
    const htmlString = 'Snapshot<sup>&reg;</sup>';
    const textString = 'Snapshot®';
    expect(htmlToText(htmlString)).toEqual(textString);
  });

});
