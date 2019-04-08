import { ChangeDetectorRef, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContextConsumerComponent } from '../lib/consumer.component';
import { ContextProviderComponent } from '../lib/provider.component';
import { execRoutineTestsForConsumer } from './consumer.routine';
import { TestConsumerComponent } from './test-consumer.component';
import { TestProviderComponent } from './test-provider.component';

type TConsumer = ContextConsumerComponent<TestConsumerComponent>;

export interface UConsumerComponent {
  fixture: ComponentFixture<TConsumer>;
  component: TestConsumerComponent;
  consumer: TConsumer;
  provider: ContextProviderComponent<TestProviderComponent>;
  source: 'component';
}

describe('ContextConsumerComponent', function(this: UConsumerComponent) {
  this.source = 'component';

  describe('with source', () => {
    beforeEach(() => {
      this.component = new TestConsumerComponent();
      this.provider = new ContextProviderComponent(({
        _view: { component: new TestProviderComponent() },
      } as any) as ChangeDetectorRef);

      const cdRef = {
        _view: { component: this.component },
        markForCheck: () => {},
      };

      TestBed.configureTestingModule({
        declarations: [ContextConsumerComponent],
        providers: [
          {
            provide: ChangeDetectorRef,
            useValue: cdRef,
          },
          {
            provide: ContextProviderComponent,
            useValue: this.provider,
          },
        ],
      }).compileComponents();

      this.fixture = TestBed.createComponent(ContextConsumerComponent as Type<TConsumer>);
      this.consumer = this.fixture.debugElement.componentInstance;
    });

    execRoutineTestsForConsumer.call(this);
  });

  describe('without source', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [ContextConsumerComponent],
        providers: [
          { provide: ChangeDetectorRef, useValue: null },
          {
            provide: ContextProviderComponent,
            useValue: null,
          },
        ],
      }).compileComponents();

      this.fixture = TestBed.createComponent(ContextConsumerComponent as Type<TConsumer>);
      this.provider = this.fixture.debugElement.componentInstance;
    });

    it('should not cast property names provided as change$', () => {
      this.fixture.detectChanges();
      spyOn(this.consumer, 'ngOnChanges');
      expect(this.consumer.ngOnChanges).not.toHaveBeenCalled();
    });
  });
});
