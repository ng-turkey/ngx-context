import { ChangeDetectorRef, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContextConsumerDirective } from '../lib/consumer.directive';
import { ContextProviderComponent } from '../lib/provider.component';
import { execRoutineTestsForConsumer } from './consumer.routine';
import { TestConsumerComponent } from './test-consumer.component';
import { TestMiddleComponent } from './test-middle.component';
import { TestProviderComponent } from './test-provider.component';

type TConsumer = ContextConsumerDirective<TestConsumerComponent>;

export interface UConsumerDirective {
  component: TestConsumerComponent;
  consumer: TConsumer;
  fixture: ComponentFixture<TestMiddleComponent>;
  middle: TestMiddleComponent;
  provider: ContextProviderComponent<TestProviderComponent>;
  source: 'middle';
}

describe('ContextConsumerDirective', function(this: UConsumerDirective) {
  this.source = 'middle';

  describe('with source', () => {
    beforeEach(() => {
      this.provider = new ContextProviderComponent(({
        _view: { component: new TestProviderComponent() },
      } as any) as ChangeDetectorRef);

      TestBed.configureTestingModule({
        declarations: [
          ContextConsumerDirective,
          TestConsumerComponent,
          TestMiddleComponent,
        ],
        providers: [
          {
            provide: ContextProviderComponent,
            useValue: this.provider,
          },
        ],
      }).compileComponents();

      this.fixture = TestBed.createComponent(TestMiddleComponent);
      this.middle = this.fixture.debugElement.componentInstance;
      const element = this.fixture.debugElement.query(
        By.directive(ContextConsumerDirective),
      );
      this.component = element.componentInstance;
      this.consumer = element.injector.get(ContextConsumerDirective as Type<TConsumer>);
    });

    execRoutineTestsForConsumer.call(this);
  });
});
