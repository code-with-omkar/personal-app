import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE_CONTENT } from '../../../content';
import { SmartLink } from '../../../shared/ui/smart-link/smart-link';

@Component({
  selector: 'app-footer',
  imports: [SmartLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly site = SITE_CONTENT;
  protected readonly year = new Date().getFullYear();
}
