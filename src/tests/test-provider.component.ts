import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { of } from 'rxjs';
import { ContextMap } from '../lib/symbols';

@Component({
  selector: 'context-test-provider',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TestProviderComponent {
  private _title: string = 'Testing';

  greeting$ = of('Hello');
  target = 'World';
  contextMap: ContextMap = null;
  provided: string | string[] = '';

  get title(): string {
    return this._title;
  }
  set title(title: string) {
    this._title = title ? title.toUpperCase() : title;
  }
}
