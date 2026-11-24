import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  CONTACT_CONFIG,
  ContactConfig,
  ContactGateway,
  HttpContactGateway,
  MailtoContactGateway,
  provideContactGateway,
} from './contact.gateway';

const request = { name: 'Ada & Co', email: 'ada@example.com', message: 'Hi?' };

function setup(config: ContactConfig, extra: unknown[] = []): void {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: CONTACT_CONFIG, useValue: config },
      provideContactGateway(),
      ...(extra as never[]),
    ],
  });
}

describe('provideContactGateway', () => {
  it('uses HTTP when an endpoint is configured', () => {
    setup({ endpoint: '/api/contact', recipient: 'x@y.z' });
    expect(TestBed.inject(ContactGateway)).toBeInstanceOf(HttpContactGateway);
  });

  it('falls back to mailto without an endpoint', () => {
    setup({ endpoint: null, recipient: 'x@y.z' });
    expect(TestBed.inject(ContactGateway)).toBeInstanceOf(MailtoContactGateway);
  });
});

describe('HttpContactGateway', () => {
  it('POSTs the request as JSON to the endpoint', async () => {
    setup({ endpoint: '/api/contact', recipient: 'x@y.z' });
    const result = firstValueFrom(TestBed.inject(HttpContactGateway).send(request));
    const req = TestBed.inject(HttpTestingController).expectOne('/api/contact');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush('ok');
    await expectAsync(result).toBeResolvedTo(undefined);
    TestBed.inject(HttpTestingController).verify();
  });
});

describe('MailtoContactGateway', () => {
  it('opens an encoded mailto link', async () => {
    const assign = jasmine.createSpy('assign');
    const fakeDocument = { defaultView: { location: { assign } } };
    setup({ endpoint: null, recipient: 'me@example.com' }, [{ provide: DOCUMENT, useValue: fakeDocument }]);

    await firstValueFrom(TestBed.inject(MailtoContactGateway).send(request));

    const href = assign.calls.mostRecent().args[0] as string;
    expect(href.startsWith('mailto:me%40example.com?subject=')).toBeTrue();
    expect(href).toContain(encodeURIComponent('Message from Ada & Co'));
    expect(href).not.toContain('&Co');
  });
});
