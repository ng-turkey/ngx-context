import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ContextMap } from '../lib/symbols';

@Component({
  selector: 'context-test-middle',
  template: `
    <context-test-consumer
      [contextConsumer]="provided"
      [contextMap]="contextMap"
    ></context-test-consumer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TestMiddleComponent {
  contextMap: ContextMap = null;
  provided: string | string[] = '';
}
