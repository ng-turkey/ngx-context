import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { ContextDisposerDirective } from '../lib/disposer.directive';

@Component({
  selector: 'context-test-disposer',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TestDisposerComponent {
  @ViewChild(ContextDisposerDirective, { static: true })
  disposer: ContextDisposerDirective;

  provided: string | string[] = '';
}
