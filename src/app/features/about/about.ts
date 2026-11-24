import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ABOUT_CONTENT } from '../../content';
import { SectionHeader } from '../../shared/ui/section-header/section-header';

@Component({
  selector: 'app-about',
  imports: [SectionHeader],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class About {
  protected readonly content = ABOUT_CONTENT;
}
