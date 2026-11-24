import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Header, Footer],
  template: `
    <a class="skip-link" href="#main">Skip to content</a>
    <app-header />
    <main id="main" tabindex="-1">
      <router-outlet />
    </main>
    <app-footer />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }
    main {
      flex: 1;
      outline: none;
    }
    .skip-link {
      position: absolute;
      left: var(--space-4);
      top: -100px;
      z-index: 100;
      padding: var(--space-2) var(--space-4);
      background: var(--color-primary);
      color: var(--color-on-primary);
      border-radius: var(--radius-sm);
    }
    .skip-link:focus {
      top: var(--space-2);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {}
