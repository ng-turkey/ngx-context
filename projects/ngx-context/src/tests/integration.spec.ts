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
import { TestDummyComponent } from './test-dummy.component';
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
    const props = ['target', 'title'];

    setProvidedProperties.call(this, props);
    shouldSyncProvidedProperties.call(this, props);
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
            pathMatch: 'full',
            component: TestDummyComponent,
          },
          {
            path: 'test',
            component: TestMiddleComponent,
          },
        ]),
        NgxContextModule,
      ],
      declarations: [
        TestProviderComponent,
        TestDummyComponent,
        TestMiddleComponent,
        TestConsumerComponent,
      ],
    }).compileComponents();

    const props = ['target', 'title'];
    setProvidedProperties.call(this, props);

    this.fixture.ngZone.run(() => {
      // Navigate to base path
      const router = this.fixture.debugElement.injector.get(Router);
      router.initialNavigation();
      tick();

      // TestMiddleComponent should not be loaded at first
      expect(
        this.fixture.debugElement.query(By.directive(TestMiddleComponent)),
      ).toBeNull();

      router.navigate(['test']);
      tick();

      // All properties should be synced at start
      shouldSyncProvidedProperties.call(this, props);

      // And properties should be kept in sync later
      this.parent.title = null;
      this.fixture.detectChanges();
      expect(this.child.title).toBeNull();
    });
  }));
});

type Excluded = 'provided' | 'contextMap' | 'consume';
type Props = Array<
  Exclude<keyof TestProviderComponent & keyof TestConsumerComponent, Excluded>
>;

function setProvidedProperties(this: IContextConsumer, props: Props): void {
  this.fixture = TestBed.createComponent(TestProviderComponent);
  this.parent = this.fixture.debugElement.componentInstance;
  this.parent.provided = props;
  this.fixture.detectChanges();
}

function shouldSyncProvidedProperties(this: IContextConsumer, props: Props): void {
  // Query component instances
  this.middle = this.fixture.debugElement.query(
    By.directive(TestMiddleComponent),
  ).componentInstance;
  this.child = this.fixture.debugElement.query(
    By.directive(ContextConsumerDirective),
  ).componentInstance;

  // Confirm the starting value is different
  props.forEach(prop => {
    if (typeof this.parent[prop] !== 'undefined')
      expect(this.child[prop]).not.toEqual(this.parent[prop]);
  });

  // Provide property
  this.middle.provided = props;

  // Detect changes
  this.fixture.detectChanges();
  tick();

  props.forEach(prop => {
    expect(this.child[prop]).not.toBeUndefined();
    expect(this.child[prop]).toEqual(this.parent[prop]);
  });
}
