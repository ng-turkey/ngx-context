import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Optional,
  SkipSelf,
  ViewEncapsulation,
} from '@angular/core';
import { AbstractContextConsumer } from './consumer.abstract';
import { ContextProviderComponent } from './provider.component';

@Component({
  selector: 'context-consumer',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ContextConsumerComponent<T = any> extends AbstractContextConsumer<T> {
  constructor(
    @Optional()
    @SkipSelf()
    providerComponent: ContextProviderComponent,
    @Optional()
    @SkipSelf()
    parent: ChangeDetectorRef,
  ) {
    super(providerComponent, parent);
  }
}
