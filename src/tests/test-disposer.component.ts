import { Component, ViewChild } from '@angular/core';
import { ContextDisposerDirective } from 'src/lib/disposer.directive';

@Component({
  selector: 'context-test-disposer',
  template: ``,
})
export class TestDisposerComponent {
  @ViewChild(ContextDisposerDirective)
  disposer: ContextDisposerDirective;

  provided: string | string[] = '';
}
