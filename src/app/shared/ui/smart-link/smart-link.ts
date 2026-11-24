import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Link } from '../../../content';
import { isInternalHref } from '../../utils/link.utils';

/** Renders a router link for internal paths and a safe external anchor otherwise. */
@Component({
  selector: 'app-smart-link',
  imports: [RouterLink],
  template: `
    @if (internal()) {
      <a [routerLink]="link().href" [class]="linkClass()"><ng-content />{{ link().label }}</a>
    } @else {
      <a [href]="link().href" [class]="linkClass()" target="_blank" rel="noopener noreferrer"
        ><ng-content />{{ link().label }}</a
      >
    }
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmartLink {
  readonly link = input.required<Link>();
  readonly linkClass = input<string>('');

  protected readonly internal = computed(() => isInternalHref(this.link().href));
}
