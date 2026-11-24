import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import { CONTACT_CONTENT } from '../../content';
import Contact from './contact';
import { ContactGateway, ContactRequest } from './data/contact.gateway';

class FakeGateway extends ContactGateway {
  readonly calls: ContactRequest[] = [];
  response = new Subject<void>();
  send(request: ContactRequest): Observable<void> {
    this.calls.push(request);
    return this.response;
  }
}

describe('Contact', () => {
  let fixture: ComponentFixture<Contact>;
  let el: HTMLElement;
  let gateway: FakeGateway;

  const input = (id: string): HTMLInputElement | HTMLTextAreaElement =>
    el.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
  const submitBtn = (): HTMLButtonElement => el.querySelector<HTMLButtonElement>('button[type=submit]')!;

  async function type(id: string, value: string): Promise<void> {
    const field = input(id);
    field.value = value;
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  }

  async function fillValid(): Promise<void> {
    await type('contact-name', '  Ada  ');
    await type('contact-email', 'ada@example.com');
    await type('contact-message', 'Hello there, this is long enough.');
  }

  async function submit(): Promise<void> {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  beforeEach(async () => {
    gateway = new FakeGateway();
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: [{ provide: ContactGateway, useValue: gateway }],
    }).compileComponents();
    fixture = TestBed.createComponent(Contact);
    el = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('shows required errors and does not send when empty', async () => {
    await submit();
    expect(gateway.calls.length).toBe(0);
    expect(el.querySelector('#contact-name-error')!.textContent!.trim()).toBe(CONTACT_CONTENT.messages.required);
    expect(input('contact-name').getAttribute('aria-invalid')).toBe('true');
  });

  it('validates email format and message length', async () => {
    await type('contact-email', 'not-an-email');
    await type('contact-message', 'short');
    expect(el.querySelector('#contact-email-error')!.textContent!.trim()).toBe(CONTACT_CONTENT.messages.invalidEmail);
    expect(el.querySelector('#contact-message-error')!.textContent!.trim()).toBe(
      CONTACT_CONTENT.messages.messageTooShort,
    );
  });

  it('sends trimmed values, disables while sending, then shows success and resets', async () => {
    await fillValid();
    await submit();

    expect(gateway.calls).toEqual([
      { name: 'Ada', email: 'ada@example.com', message: 'Hello there, this is long enough.' },
    ]);
    expect(submitBtn().disabled).toBeTrue();
    expect(submitBtn().textContent!.trim()).toBe(CONTACT_CONTENT.labels.sending);

    gateway.response.next();
    gateway.response.complete();
    await fixture.whenStable();

    expect(el.querySelector('.form__success')!.textContent!.trim()).toBe(CONTACT_CONTENT.messages.success);
    expect(input('contact-name').value).toBe('');
    expect(submitBtn().disabled).toBeFalse();
  });

  it('shows an error when the gateway fails', async () => {
    await fillValid();
    await submit();
    gateway.response.error(new Error('boom'));
    await fixture.whenStable();
    expect(el.querySelector('.form__failure')!.textContent!.trim()).toBe(CONTACT_CONTENT.messages.error);
  });

  it('drops honeypot submissions without calling the gateway', async () => {
    await fillValid();
    await type('contact-website', 'http://spam.example');
    await submit();
    expect(gateway.calls.length).toBe(0);
    expect(el.querySelector('.form__success')).not.toBeNull();
  });
});
