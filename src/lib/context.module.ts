import { NgModule } from '@angular/core';
import { ContextConsumerComponent } from './consumer.component';
import { ContextConsumerDirective } from './consumer.directive';
import { ContextProviderComponent } from './provider.component';

@NgModule({
  declarations: [
    ContextConsumerComponent,
    ContextConsumerDirective,
    ContextProviderComponent,
  ],
  exports: [
    ContextConsumerComponent,
    ContextConsumerDirective,
    ContextProviderComponent,
  ],
})
export class NgxContextModule {}
