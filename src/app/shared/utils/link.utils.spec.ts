import { isInternalHref } from './link.utils';

describe('isInternalHref', () => {
  it('treats root-relative paths as internal', () => {
    expect(isInternalHref('/')).toBeTrue();
    expect(isInternalHref('/about')).toBeTrue();
  });

  it('treats absolute, protocol-relative and scheme URLs as external', () => {
    expect(isInternalHref('https://example.com')).toBeFalse();
    expect(isInternalHref('//evil.example')).toBeFalse();
    expect(isInternalHref('mailto:a@b.c')).toBeFalse();
  });
});
