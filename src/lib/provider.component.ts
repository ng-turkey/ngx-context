import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  Optional,
  SkipSelf,
  ViewEncapsulation
} from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { isSubscribableOrPromise, parseKeys } from './internals';
import { ContextMap } from './symbols';

@Component({
  selector: 'context-provider',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ContextProviderComponent<T = any> implements OnChanges, OnInit {
  private initialized = false;
  private _contextMap: ContextMap = {};
  private _provide: string | string[] = '';

  provided = new Map();

  @Input()
  set contextMap(map: ContextMap) {
    this._contextMap = map || {};
  }
  get contextMap(): ContextMap {
    return this._contextMap;
  }

  @Input()
  set provide(value: string | string[]) {
    this._provide = value || '';
  }
  get provide(): string | string[] {
    return this._provide;
  }

  get component(): T {
    return this.source['_view']?.component || this.source['context']
  }

  change$ = new ReplaySubject<string>(1);
  reset$ = new Subject<void>();

  constructor(
    @Optional()
    @SkipSelf()
    private source: ChangeDetectorRef,
  ) {
  }

  private init() {
    setTimeout(() => {
      const THIS = this;
      const context = new Map();
      const provided = parseKeys(this.provide).filter(
        key => key && key in this.component,
      );

      provided.forEach(key => {
        if (isSubscribableOrPromise(this.component[key])) {
          this.change$.next(key);
          return;
        }

        const propertyDescriptor =
          Object.getOwnPropertyDescriptor(this.component, key) ||
          Object.getOwnPropertyDescriptor((this.component as any).__proto__, key);

        this.provided.set(key, propertyDescriptor);

        const { value, writable, get: getter, set: setter, ...prop } = propertyDescriptor;

        Object.defineProperty(this.component, key, {
          ...prop,
          get: getter
            ? function(): any {
                return getter.call(this);
              }
            : function(): any {
                return context.get(key);
              },
          set: setter
            ? function() {
                setter.apply(this, arguments);
                THIS.change$.next(key);
              }
            : function(newValue: any) {
                context.set(key, newValue);
                THIS.change$.next(key);
              },
        });

        this.component[key] = value || this.component[key];
      });
    }, 0);
  }

  private reset() {
    this.provided.forEach((propertyDescriptor, key) => {
      const value = this.component[key];

      Object.defineProperty(this.component, key, propertyDescriptor);

      this.component[key] = value;
    });

    this.provided.clear();
    this.change$.next('');
    this.reset$.next();
  }

  ngOnChanges() {
    if (this.initialized) {
      this.reset();

      if (this.source) this.init();
    }
  }

  ngOnInit() {
    this.initialized = true;
    this.ngOnChanges();
  }
}
