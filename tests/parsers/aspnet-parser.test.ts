import { describe, it, expect } from 'vitest';
import { extractAspNetFormData, buildPostbackData } from '../../src/parsers/aspnet-parser';
import { VulmsParsingError } from '../../src/core/errors';

describe('extractAspNetFormData', () => {
  it('should extract __VIEWSTATE and __EVENTVALIDATION from HTML', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <form>
    <input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="viewstate123" />
    <input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="validation123" />
  </form>
</body>
</html>`;

    const result = extractAspNetFormData(html);
    expect(result.__VIEWSTATE).toBe('viewstate123');
    expect(result.__EVENTVALIDATION).toBe('validation123');
  });

  it('should extract optional __VIEWSTATEGENERATOR when present', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <form>
    <input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="vs" />
    <input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="ev" />
    <input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="gen123" />
  </form>
</body>
</html>`;

    const result = extractAspNetFormData(html);
    expect(result.__VIEWSTATEGENERATOR).toBe('gen123');
  });

  it('should extract optional __PREVIOUSPAGE when present', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <form>
    <input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="vs" />
    <input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="ev" />
    <input type="hidden" name="__PREVIOUSPAGE" id="__PREVIOUSPAGE" value="../prev.aspx" />
  </form>
</body>
</html>`;

    const result = extractAspNetFormData(html);
    expect(result.__PREVIOUSPAGE).toBe('../prev.aspx');
  });

  it('should throw VulmsParsingError when __VIEWSTATE is missing', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <form>
    <input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="ev" />
  </form>
</body>
</html>`;

    expect(() => extractAspNetFormData(html)).toThrow(VulmsParsingError);
  });

  it('should return form data when __EVENTVALIDATION is missing but __VIEWSTATE exists', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <form>
    <input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="vs" />
  </form>
</body>
</html>`;

    const result = extractAspNetFormData(html);
    expect(result.__VIEWSTATE).toBe('vs');
    expect(result.__EVENTVALIDATION).toBe('');
  });

  it('should throw VulmsParsingError for empty HTML', () => {
    expect(() => extractAspNetFormData('')).toThrow(VulmsParsingError);
  });
});

describe('buildPostbackData', () => {
  it('should build POST data with required form fields', () => {
    const formData = {
      __VIEWSTATE: 'vs123',
      __EVENTVALIDATION: 'ev123',
    };

    const data = buildPostbackData(formData);
    expect(data).toEqual({
      __VIEWSTATE: 'vs123',
      __EVENTVALIDATION: 'ev123',
    });
  });

  it('should include optional fields when present', () => {
    const formData = {
      __VIEWSTATE: 'vs123',
      __EVENTVALIDATION: 'ev123',
      __VIEWSTATEGENERATOR: 'gen123',
      __PREVIOUSPAGE: '../prev.aspx',
    };

    const data = buildPostbackData(formData);
    expect(data).toEqual({
      __VIEWSTATE: 'vs123',
      __EVENTVALIDATION: 'ev123',
      __VIEWSTATEGENERATOR: 'gen123',
      __PREVIOUSPAGE: '../prev.aspx',
    });
  });

  it('should merge extra fields into the result', () => {
    const formData = {
      __VIEWSTATE: 'vs123',
      __EVENTVALIDATION: 'ev123',
    };

    const data = buildPostbackData(formData, {
      ctl00$btnSubmit: 'Submit',
      __EVENTTARGET: 'ctl00$btnSubmit',
    });

    expect(data).toEqual({
      __VIEWSTATE: 'vs123',
      __EVENTVALIDATION: 'ev123',
      ctl00$btnSubmit: 'Submit',
      __EVENTTARGET: 'ctl00$btnSubmit',
    });
  });
});
