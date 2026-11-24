import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { Router, TitleStrategy, provideRouter } from '@angular/router';
import { SITE_CONTENT } from '../../content';
import { SEO_DATA_KEY, SeoTitleStrategy } from './seo-title.strategy';

@Component({ selector: 'app-seo-blank', template: '' })
class Blank {}

describe('SeoTitleStrategy', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'a', component: Blank, data: { [SEO_DATA_KEY]: { title: 'Alpha', description: 'Alpha desc' } } },
          { path: 'plain', component: Blank, title: 'Plain' },
          { path: 'bare', component: Blank },
        ]),
        { provide: TitleStrategy, useClass: SeoTitleStrategy },
      ],
    });
  });

  const brand = SITE_CONTENT.brand.name;

  it('sets title and description from route SEO data', async () => {
    await TestBed.inject(Router).navigateByUrl('/a');
    expect(TestBed.inject(Title).getTitle()).toBe(`Alpha · ${brand}`);
    expect(TestBed.inject(Meta).getTag('name="description"')?.content).toBe('Alpha desc');
    expect(TestBed.inject(Meta).getTag('property="og:title"')?.content).toBe('Alpha');
  });

  it('falls back to the route title', async () => {
    await TestBed.inject(Router).navigateByUrl('/plain');
    expect(TestBed.inject(Title).getTitle()).toBe(`Plain · ${brand}`);
  });

  it('uses the brand alone when a route has no title', async () => {
    await TestBed.inject(Router).navigateByUrl('/bare');
    expect(TestBed.inject(Title).getTitle()).toBe(brand);
  });
});
