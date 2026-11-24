import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  template: `
    @if (eyebrow(); as text) {
      <p class="eyebrow">{{ text }}</p>
    }
    @switch (level()) {
      @case (1) { <h1>{{ heading() }}</h1> }
      @default { <h2>{{ heading() }}</h2> }
    }
    @if (intro(); as text) {
      <p class="intro">{{ text }}</p>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-3);
      max-width: 60ch;
    }
    :host(.center) {
      margin-inline: auto;
      text-align: center;
    }
    .eyebrow {
      color: var(--color-primary);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .intro {
      color: var(--color-text-muted);
      font-size: var(--text-lg);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeader {
  readonly heading = input.required<string>();
  readonly intro = input<string>();
  readonly eyebrow = input<string>();
  readonly level = input<1 | 2>(2);
}
