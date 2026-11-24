import { HttpClient } from '@angular/common/http';
import { DOCUMENT, Injectable, InjectionToken, Provider, inject } from '@angular/core';
import { Observable, defer, map, of } from 'rxjs';
import { CONTACT_CONTENT } from '../../../content';

export interface ContactRequest {
  readonly name: string;
  readonly email: string;
  readonly message: string;
}

/** Port for delivering contact messages; swap the adapter without touching the page. */
export abstract class ContactGateway {
  abstract send(request: ContactRequest): Observable<void>;
}

export interface ContactConfig {
  readonly endpoint: string | null;
  readonly recipient: string;
}

export const CONTACT_CONFIG = new InjectionToken<ContactConfig>('CONTACT_CONFIG', {
  providedIn: 'root',
  factory: () => ({ endpoint: CONTACT_CONTENT.endpoint, recipient: CONTACT_CONTENT.email }),
});

/** POSTs JSON to the configured endpoint. */
@Injectable({ providedIn: 'root' })
export class HttpContactGateway extends ContactGateway {
  private readonly http = inject(HttpClient);
  private readonly config = inject(CONTACT_CONFIG);

  send(request: ContactRequest): Observable<void> {
    const { endpoint } = this.config;
    if (!endpoint) throw new Error('HttpContactGateway requires CONTACT_CONFIG.endpoint.');
    return this.http.post(endpoint, request, { responseType: 'text' }).pipe(map(() => undefined));
  }
}

/** Fallback when no endpoint is configured: opens the visitor's mail client. */
@Injectable({ providedIn: 'root' })
export class MailtoContactGateway extends ContactGateway {
  private readonly document = inject(DOCUMENT);
  private readonly config = inject(CONTACT_CONFIG);

  send(request: ContactRequest): Observable<void> {
    return defer(() => {
      const subject = encodeURIComponent(`Message from ${request.name}`);
      const body = encodeURIComponent(`${request.message}\n\n— ${request.name} <${request.email}>`);
      const href = `mailto:${encodeURIComponent(this.config.recipient)}?subject=${subject}&body=${body}`;
      this.document.defaultView?.location.assign(href);
      return of(undefined);
    });
  }
}

/** Picks the adapter from config: HTTP when an endpoint exists, mailto otherwise. */
export function provideContactGateway(): Provider {
  return {
    provide: ContactGateway,
    useFactory: (): ContactGateway =>
      inject(CONTACT_CONFIG).endpoint ? inject(HttpContactGateway) : inject(MailtoContactGateway),
  };
}
