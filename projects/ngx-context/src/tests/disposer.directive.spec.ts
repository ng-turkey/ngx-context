import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContextDisposerDirective } from '../lib/disposer.directive';
import { ContextProviderComponent } from '../lib/provider.component';
import { TestDisposerComponent } from './test-disposer.component';
import { TestProviderComponent } from './test-provider.component';

export interface UDisposerDirective {
  disposer: ContextDisposerDirective;
  element: HTMLElement;
  fixture: ComponentFixture<TestDisposerComponent>;
  provider: ContextProviderComponent<TestProviderComponent>;
}

describe('ContextDisposerDirective', function (this: UDisposerDirective) {
  describe('implicitly', () => {
    beforeEach(() => {
      this.provider = new ContextProviderComponent({
        _view: { component: new TestProviderComponent() },
      } as any as ChangeDetectorRef);

      TestBed.overrideComponent(TestDisposerComponent, {
        set: {
          template: `
            <ng-template contextDisposer let-context>
              {{ context.target }}
            </ng-template>
          `,
        },
      });

      TestBed.configureTestingModule({
        declarations: [ContextDisposerDirective, TestDisposerComponent],
      }).compileComponents();

      this.fixture = TestBed.createComponent(TestDisposerComponent);
      this.element = this.fixture.nativeElement;
      this.disposer = this.fixture.componentInstance.disposer;

      this.disposer['provider'] = this.provider as any;
    });

    it('should be created', () => {
      expect(this.disposer).not.toBeUndefined();
    });

    it('should have empty string as dispose', () => {
      expect(this.disposer.dispose).toBe('');
    });

    it('should call ngOnChanges on init', () => {
      spyOn(this.disposer, 'ngOnChanges');
      this.fixture.detectChanges();

      expect(this.disposer.ngOnChanges).toHaveBeenCalledTimes(1); // because, let-context
    });

    it('should call ngOnChanges on reset$', () => {
      this.fixture.detectChanges();

      spyOn(this.disposer, 'ngOnChanges');
      this.provider.reset$.next();

      expect(this.disposer.ngOnChanges).toHaveBeenCalledTimes(1);
    });

    it('should not call ngOnChanges on reset$ if provider not found', () => {
      this.disposer['provider'] = null;
      this.fixture.detectChanges();

      spyOn(this.disposer, 'ngOnChanges');
      this.provider.reset$.next();

      expect(this.disposer.ngOnChanges).toHaveBeenCalledTimes(0);
    });

    it('should dispose property when provided', () => {
      const prop: keyof TestProviderComponent = 'target';

      this.provider.provide = prop;
      this.provider.reset$.next();
      this.provider.change$.next(prop);

      this.fixture.detectChanges();

      expect(this.element.innerText).toBe(this.provider.component[prop]);
    });
  });

  describe('explicitly', () => {
    beforeEach(() => {
      this.provider = new ContextProviderComponent({
        _view: { component: new TestProviderComponent() },
      } as any as ChangeDetectorRef);

      TestBed.overrideComponent(TestDisposerComponent, {
        set: {
          template: `
            <ng-template [contextDisposer]="provided" let-target="target">
              {{ target }}
            </ng-template>
          `,
        },
      });

      TestBed.configureTestingModule({
        declarations: [ContextDisposerDirective, TestDisposerComponent],
      }).compileComponents();

      this.fixture = TestBed.createComponent(TestDisposerComponent);
      this.element = this.fixture.nativeElement;
      this.disposer = this.fixture.componentInstance.disposer;
      this.disposer['provider'] = this.provider as any;
    });

    it('should dispose property when provided', () => {
      const prop: keyof TestProviderComponent = 'target';

      this.provider.provide = prop;
      this.provider.reset$.next();
      this.provider.change$.next(prop);

      this.fixture.detectChanges();

      expect(this.element.innerText).toBe(this.provider.component[prop]);
    });

    it('should not dispose when provided property is not disposed', () => {
      this.fixture.componentInstance.provided = 'test';

      const prop: keyof TestProviderComponent = 'target';

      this.provider.provide = prop;
      this.provider.reset$.next();
      this.provider.change$.next(prop);

      this.fixture.detectChanges();

      expect(this.element.innerText).toBe('');
    });
  });
});
