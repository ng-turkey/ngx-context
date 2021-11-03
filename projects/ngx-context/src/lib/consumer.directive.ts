import {
  ChangeDetectorRef,
  Directive,
  Host,
  Input,
  Optional,
  SkipSelf
} from '@angular/core';
import { AbstractContextConsumer } from './consumer.abstract';
import { ContextProviderComponent } from './provider.component';

@Directive({
  selector: '[contextConsumer]',
})
export class ContextConsumerDirective<T = any> extends AbstractContextConsumer<T> {
  @Input('contextConsumer')
  set consume(consume: string | string[]) {
    this._consume = consume || '';
  }
  get consume(): string | string[] {
    return this._consume;
  }

  constructor(
    @Optional()
    @SkipSelf()
    providerComponent: ContextProviderComponent,
    @Optional()
    @Host()
    host: ChangeDetectorRef,
  ) {
    super(providerComponent, host);
  }
}
