import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ContextConsumerDirective } from '../lib/consumer.directive';
import { NgxContextModule } from '../lib/context.module';
import { ContextProviderComponent } from '../lib/provider.component';
import { TestConsumerComponent } from './test-consumer.component';
import { TestMiddleComponent } from './test-middle.component';
import { TestProviderComponent } from './test-provider.component';
import { Excluded as SharedExcluded } from './consumer.routine';

type TConsumer = ContextConsumerDirective<TestConsumerComponent>;
type TProvider = ContextProviderComponent<TestProviderComponent>;

interface IContext {
  fixture: ComponentFixture<TestProviderComponent>;
  provider: TProvider;
  consumer: TConsumer;
  parent: TestProviderComponent;
  middle: TestMiddleComponent;
  child: TestConsumerComponent;
}

describe('Context Provider & Consumer', function(this: IContext) {
  it('should work through nested components', fakeAsync(() => {
    TestBed.overrideComponent(TestProviderComponent, {
      set: {
        template: `
          <context-provider [provide]="provided" [contextMap]="contextMap">
            <context-test-middle></context-test-middle>
          </context-provider>
        `,
      },
    });

    TestBed.configureTestingModule({
      imports: [NgxContextModule],
      declarations: [TestProviderComponent, TestMiddleComponent, TestConsumerComponent],
    }).compileComponents();

    this.fixture = TestBed.createComponent(TestProviderComponent);

    shouldSyncProvidedProperty.bind(this, 'target');
  }));

  it('should work through router outlet', fakeAsync(() => {
    TestBed.overrideComponent(TestProviderComponent, {
      set: {
        template: `
          <context-provider [provide]="provided" [contextMap]="contextMap">
            <router-outlet></router-outlet>
          </context-provider>
        `,
      },
    });

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          {
            path: '',
            component: TestMiddleComponent,
          },
        ]),
        NgxContextModule,
      ],
      declarations: [TestProviderComponent, TestMiddleComponent, TestConsumerComponent],
    }).compileComponents();

    this.fixture = TestBed.createComponent(TestProviderComponent);

    this.fixture.ngZone.run(() => {
      // Navigate to base path
      this.fixture.debugElement.injector.get(Router).initialNavigation();
      tick();

      shouldSyncProvidedProperty.bind(this, 'target');
    });
  }));
});

type Excluded = 'provided' | 'contextMap' | 'consume' | SharedExcluded;

function shouldSyncProvidedProperty(
  this: IContext,
  prop: Exclude<keyof TestProviderComponent | keyof ContextConsumerDirective, Excluded>,
): void {
  // Query component instances
  this.parent = this.fixture.debugElement.componentInstance;
  this.middle = this.fixture.debugElement.query(
    By.directive(TestMiddleComponent),
  ).componentInstance;
  this.child = this.fixture.debugElement.query(
    By.directive(ContextConsumerDirective),
  ).componentInstance;

  expect(this.child[prop]).not.toBe(this.parent[prop]);

  // Provide property
  this.parent.provided = prop;
  this.middle.provided = prop;

  // Detect changes
  this.fixture.detectChanges();
  tick();

  expect(this.child[prop]).toBe(this.parent[prop]);
}
