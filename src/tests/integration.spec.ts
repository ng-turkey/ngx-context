import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControlDirective, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ContextConsumerDirective } from '../lib/consumer.directive';
import { NgxContextModule } from '../lib/context.module';
import { ContextDisposerDirective } from '../lib/disposer.directive';
import { TestConsumerComponent } from './test-consumer.component';
import { TestDisposerComponent } from './test-disposer.component';
import { TestFormComponent } from './test-form.component';
import { TestMiddleComponent } from './test-middle.component';
import { TestProviderComponent } from './test-provider.component';

interface IContextDisposer {
  fixture: ComponentFixture<TestFormComponent>;
  parent: TestFormComponent;
  disposer: ContextDisposerDirective;
  child: HTMLInputElement;
}

describe('Context Provider & Disposer', function(this: IContextDisposer) {
  it('should work with reactive forms', fakeAsync(() => {
    TestBed.overrideComponent(TestDisposerComponent, {
      set: {
        template: `
          <ng-template contextDisposer let-control="checkControl">
            <input *ngIf="control" type="checkbox" [formControl]="control">
          </ng-template>
        `,
      },
    });

    TestBed.configureTestingModule({
      imports: [NgxContextModule, ReactiveFormsModule],
      declarations: [TestFormComponent, TestDisposerComponent],
    }).compileComponents();

    this.fixture = TestBed.createComponent(TestFormComponent);
    this.fixture.detectChanges();

    this.parent = this.fixture.debugElement.componentInstance;
    const disposer = this.fixture.debugElement.query(By.directive(TestDisposerComponent));
    this.disposer = disposer.componentInstance.disposer;

    tick();
    this.fixture.detectChanges();

    this.child = disposer.query(By.directive(FormControlDirective)).nativeElement;

    expect(this.child.checked).toBe(false);
    expect(this.parent.checkControl.value).toBe(false);

    this.child.click();
    this.fixture.detectChanges();

    expect(this.child.checked).toBe(true);
    expect(this.parent.checkControl.value).toBe(true);
  }));
});

interface IContextConsumer {
  fixture: ComponentFixture<TestProviderComponent>;
  parent: TestProviderComponent;
  middle: TestMiddleComponent;
  child: TestConsumerComponent;
}

describe('Context Provider & Consumer', function(this: IContextConsumer) {
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

type Excluded = 'provided' | 'contextMap' | 'consume';

function shouldSyncProvidedProperty(
  this: IContextConsumer,
  prop: Exclude<keyof TestProviderComponent & keyof TestConsumerComponent, Excluded>,
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
