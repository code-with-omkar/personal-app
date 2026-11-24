import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CONTACT_CONTENT } from '../../content';
import { SectionHeader } from '../../shared/ui/section-header/section-header';
import { ContactGateway } from './data/contact.gateway';

export type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 2000;

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, SectionHeader],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Contact {
  private readonly gateway = inject(ContactGateway);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly content = CONTACT_CONTENT;
  protected readonly status = signal<SubmitStatus>('idle');
  protected readonly maxLength = MESSAGE_MAX_LENGTH;

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    message: [
      '',
      [Validators.required, Validators.minLength(MESSAGE_MIN_LENGTH), Validators.maxLength(MESSAGE_MAX_LENGTH)],
    ],
    /** Honeypot: hidden from people, filled by naive bots. */
    website: [''],
  });

  protected submit(): void {
    if (this.status() === 'sending') return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, message, website } = this.form.getRawValue();
    if (website) {
      // Silently accept bot submissions without sending them.
      this.status.set('success');
      return;
    }

    this.status.set('sending');
    this.gateway
      .send({ name: name.trim(), email: email.trim(), message: message.trim() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.status.set('success');
          this.form.reset();
        },
        error: () => this.status.set('error'),
      });
  }

  protected errorFor(control: AbstractControl): string | null {
    if (!control.touched || !control.errors) return null;
    const m = this.content.messages;
    if (control.hasError('required')) return m.required;
    if (control.hasError('email')) return m.invalidEmail;
    if (control.hasError('minlength')) return m.messageTooShort;
    return null;
  }
}
