import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NOT_FOUND_CONTENT } from '../../content';
import { ButtonLink } from '../../shared/ui/button/button-link';

@Component({
  selector: 'app-not-found',
  imports: [ButtonLink],
  template: `
    <section class="container not-found">
      <p class="code" aria-hidden="true">404</p>
      <h1>{{ content.heading }}</h1>
      <p>{{ content.body }}</p>
      <app-button-link [cta]="content.cta" />
    </section>
  `,
  styles: `
    .not-found {
      display: grid;
      justify-items: center;
      gap: var(--space-4);
      padding-block: var(--space-9);
      text-align: center;
    }
    .code {
      color: var(--color-primary);
      font-size: var(--text-4xl);
      font-weight: var(--weight-bold);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotFound {
  protected readonly content = NOT_FOUND_CONTENT;
}
