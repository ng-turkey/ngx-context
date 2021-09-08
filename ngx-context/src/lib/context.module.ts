import { NgModule } from '@angular/core';
import { ContextConsumerComponent } from './consumer.component';
import { ContextConsumerDirective } from './consumer.directive';
import { ContextDisposerDirective } from './disposer.directive';
import { ContextProviderComponent } from './provider.component';

@NgModule({
  declarations: [
    ContextConsumerComponent,
    ContextConsumerDirective,
    ContextDisposerDirective,
    ContextProviderComponent,
  ],
  exports: [
    ContextConsumerComponent,
    ContextConsumerDirective,
    ContextDisposerDirective,
    ContextProviderComponent,
  ],
})
export class NgxContextModule {}
