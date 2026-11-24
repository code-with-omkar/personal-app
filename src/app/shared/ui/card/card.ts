import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
    @if (icon(); as glyph) {
      <span class="card__icon" aria-hidden="true">{{ glyph }}</span>
    }
    <h3 class="card__title">{{ heading() }}</h3>
    <div class="card__body"><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding: var(--space-5);
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      transition:
        transform var(--duration-base) var(--ease-standard),
        box-shadow var(--duration-base) var(--ease-standard);
    }
    :host(:hover) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .card__icon {
      display: inline-grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: var(--color-surface);
      font-size: var(--text-xl);
    }
    .card__body {
      color: var(--color-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  readonly heading = input.required<string>();
  readonly icon = input<string>();
}
