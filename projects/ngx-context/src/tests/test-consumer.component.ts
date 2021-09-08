import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { ContextMap } from '../lib/symbols';

@Component({
  selector: 'context-test-consumer',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TestConsumerComponent {
  private _title: string;

  greeting$: Observable<string>;
  target = '';
  contextMap: ContextMap = null;
  provided: string | string[] = '';

  get title(): string {
    return this._title;
  }
  set title(title: string) {
    this._title = title;
  }
}
