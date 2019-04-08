import { ChangeDetectorRef, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MonoTypeOperatorFunction, ReplaySubject, Subject } from 'rxjs';
import { filter, take, timeout } from 'rxjs/operators';
import { ContextProviderComponent } from '../lib/provider.component';
import { TestProviderComponent } from './test-provider.component';

type TProvider = ContextProviderComponent<TestProviderComponent>;

interface UProviderComponent {
  fixture: ComponentFixture<TProvider>;
  component: TestProviderComponent;
  provider: TProvider;
}

describe('ContextProviderComponent', function(this: UProviderComponent) {
  describe('with source', () => {
    beforeEach(() => {
      this.component = new TestProviderComponent();

      const cdRef = { _view: { component: this.component } };

      TestBed.configureTestingModule({
        declarations: [ContextProviderComponent],
        providers: [{ provide: ChangeDetectorRef, useValue: cdRef }],
      }).compileComponents();

      this.fixture = TestBed.createComponent(ContextProviderComponent as Type<TProvider>);
      this.provider = this.fixture.debugElement.componentInstance;
    });

    it('should be created', () => {
      expect(this.provider).not.toBeUndefined();
    });

    it('should have a ReplaySubject as change stream', () => {
      expect(this.provider.change$ instanceof ReplaySubject).toBeTruthy();
    });

    it('should have a Subject as reset stream', () => {
      expect(this.provider.reset$ instanceof Subject).toBeTruthy();
    });

    it('should have TestProviderComponent as component', () => {
      expect(this.provider.component).toBe(this.component);
    });

    it('should have empty string as provide', () => {
      expect(this.provider.provide).toBe('');
    });

    it('should have empty object as contextMap', () => {
      expect(this.provider.contextMap).toEqual({});
    });

    it('should have empty object as contextMap (undefined/null input)', () => {
      setProp.call(this, 'contextMap', undefined);

      expect(this.provider.contextMap).toEqual({});

      setProp.call(this, 'contextMap', null);

      expect(this.provider.contextMap).toEqual({});
    });

    it('should call ngOnChanges on init', () => {
      spyOn(this.provider, 'ngOnChanges');
      this.fixture.detectChanges();

      expect(this.provider.ngOnChanges).toHaveBeenCalledTimes(1);
    });

    it('should cast void as reset$ on init', done => {
      this.provider.reset$.pipe(take(1)).subscribe({
        next: value => expect(value).toBeUndefined(),
        complete: () => done(),
      });

      this.fixture.detectChanges();
    });

    it('should cast reset$ on input changes', fakeAsync(() => {
      this.fixture.detectChanges();

      let i = 0;

      this.provider.reset$.pipe(take(2)).subscribe(() => i++);

      // 1
      this.provider.provide = 'target';
      this.provider.ngOnChanges();
      tick();

      // 2
      this.provider.contextMap = { target: 'to' };
      this.provider.ngOnChanges();
      tick();

      expect(i).toBe(2);
    }));

    it('should cast empty string as change$ on init', done => {
      this.provider.change$.pipe(take(1)).subscribe({
        next: value => expect(value).toBe(''),
        complete: () => done(),
      });

      this.fixture.detectChanges();
    });

    it('should cast property names provided as change$ (string input)', done => {
      const provided = ['greeting$', 'target'];
      const { length } = provided;
      let i = 0;

      this.provider.change$
        .pipe(
          skipResetEmptyString(),
          take(length),
        )
        .subscribe({
          next: key => expect(key).toBe(provided[i++]),
          complete: () => done(),
        });

      setProp.call(this, 'provide', provided.join(' '));
    });

    it('should cast property names provided as change$ (array input)', done => {
      const provided = ['greeting$', 'target'];
      const { length } = provided;
      let i = 0;

      this.provider.change$
        .pipe(
          skipResetEmptyString(),
          take(length),
        )
        .subscribe({
          next: key => expect(key).toBe(provided[i++]),
          complete: () => done(),
        });

      setProp.call(this, 'provide', provided);
    });

    it('should not cast a property name provided as change$ unless a property of component', done => {
      this.provider.change$
        .pipe(
          skipResetEmptyString(),
          take(1),
        )
        .subscribe({
          next: key => expect(key).toBe('target'),
          complete: () => done(),
        });

      setProp.call(this, 'provide', 'test target check');
    });

    it('should cast property name when a provided property is changed on component', fakeAsync(() => {
      shouldCastPropertyNameWhenChanged.call(this, 'target');
    }));

    it('should cast property name when a provided property is changed on component (getter)', fakeAsync(() => {
      shouldCastPropertyNameWhenChanged.call(this, 'title');
    }));
  });

  describe('without source', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [ContextProviderComponent],
        providers: [{ provide: ChangeDetectorRef, useValue: null }],
      }).compileComponents();

      this.fixture = TestBed.createComponent(ContextProviderComponent as Type<TProvider>);
      this.provider = this.fixture.debugElement.componentInstance;
    });

    it('should not cast property names provided as change$', done => {
      let called = false;

      this.provider.change$
        .pipe(
          timeout(3000),
          skipResetEmptyString(),
        )
        .subscribe({
          next: () => (called = true),
          error: () => {
            expect(called).toBe(false);
            done();
          },
        });

      const provided = 'target';
      setProp.call(this, 'provide', provided);
    });
  });
});

type Excluded = 'component' | 'ngOnChanges' | 'ngOnInit' | 'ngOnDestroy';

function setProp(
  this: UProviderComponent,
  prop: Exclude<keyof ContextProviderComponent<any>, Excluded>,
  value: any,
): void {
  this.component[prop === 'provide' ? 'provided' : prop] = value;
  this.provider[prop] = value;

  this.fixture.detectChanges();
}

function shouldCastPropertyNameWhenChanged(
  this: UProviderComponent,
  provided: keyof TestProviderComponent,
) {
  let cast: boolean;

  setProp.call(this, 'provide', provided);
  tick();

  this.provider.change$
    .pipe(
      skipResetEmptyString(),
      filter(key => key === provided),
      take(2),
    )
    .subscribe({
      complete: () => (cast = true),
    });

  this.component[provided] = 'Test';
  tick();

  expect(cast).toBe(true);
}

function skipResetEmptyString(): MonoTypeOperatorFunction<string> {
  return filter<string>(key => !!key);
}
