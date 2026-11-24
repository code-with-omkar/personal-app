import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HOME_CONTENT } from '../../content';
import { ButtonLink } from '../../shared/ui/button/button-link';
import { Card } from '../../shared/ui/card/card';
import { SectionHeader } from '../../shared/ui/section-header/section-header';

@Component({
  selector: 'app-home',
  imports: [ButtonLink, Card, SectionHeader],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Home {
  protected readonly content = HOME_CONTENT;
}
