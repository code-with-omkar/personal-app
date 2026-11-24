import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SITE_CONTENT } from '../../../content';
import { Header } from './header';

@Component({ selector: 'app-header-blank', template: '' })
class Blank {}

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let el: HTMLElement;

  const toggle = (): HTMLButtonElement => el.querySelector<HTMLButtonElement>('.header__toggle')!;
  const nav = (): HTMLElement => el.querySelector<HTMLElement>('#primary-nav')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([{ path: '**', component: Blank }])],
    }).compileComponents();
    fixture = TestBed.createComponent(Header);
    el = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('renders one link per nav item', () => {
    expect(el.querySelectorAll('.header__link').length).toBe(SITE_CONTENT.nav.length);
  });

  it('toggles the mobile menu and reflects aria-expanded', async () => {
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    toggle().click();
    await fixture.whenStable();
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(nav().classList).toContain('header__nav--open');
  });

  it('closes on Escape', async () => {
    toggle().click();
    await fixture.whenStable();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
  });

  it('closes after navigation', async () => {
    toggle().click();
    await fixture.whenStable();
    await TestBed.inject(Router).navigateByUrl('/about');
    await fixture.whenStable();
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
  });
});
