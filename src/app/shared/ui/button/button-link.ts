import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Cta } from '../../../content';
import { SmartLink } from '../smart-link/smart-link';

@Component({
  selector: 'app-button-link',
  imports: [SmartLink],
  template: `<app-smart-link [link]="cta()" [linkClass]="classes()" />`,
  styleUrl: './button-link.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonLink {
  readonly cta = input.required<Cta>();

  protected readonly classes = computed(() => `btn btn--${this.cta().variant}`);
}
