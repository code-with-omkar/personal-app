import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SmartLink } from './smart-link';

describe('SmartLink', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  async function render(href: string): Promise<HTMLAnchorElement> {
    const fixture = TestBed.createComponent(SmartLink);
    fixture.componentRef.setInput('link', { label: 'X', href });
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).querySelector('a')!;
  }

  it('renders internal links without target', async () => {
    const a = await render('/about');
    expect(a.getAttribute('href')).toBe('/about');
    expect(a.hasAttribute('target')).toBeFalse();
  });

  it('opens external links safely in a new tab', async () => {
    const a = await render('https://example.com');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
