import { ChangeDetectorRef, Directive, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, startWith, takeUntil } from 'rxjs/operators';
import { parseKeys } from './internals';
import { ContextProviderComponent } from './provider.component';
import { ContextMap } from './symbols';

@Directive()
export class AbstractContextConsumer<T> implements OnChanges, OnDestroy, OnInit {
  protected destroy$ = new Subject<void>();
  protected initialized: boolean;
  protected _contextMap = {};
  protected _consume: string | string[] = '';

  consumed = new Map();

  @Input()
  set contextMap(map: ContextMap) {
    this._contextMap = map || {};
  }
  get contextMap(): ContextMap {
    return this._contextMap;
  }

  @Input()
  set consume(consume: string | string[]) {
    this._consume = consume || '';
  }
  get consume(): string | string[] {
    return this._consume;
  }

  get component(): T {
    return this.target['_view']?.component || this.target['context']
  }

  constructor(
    protected provider: ContextProviderComponent,
    protected target: ChangeDetectorRef,
  ) {}

  protected init(): void {
    const consumed: string[] = parseKeys(this.consume);

    this.provider.reset$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.ngOnChanges());

    if (this.provider.provide.length)
      this.provider.change$
        .pipe(
          takeUntil(this.destroy$),
          startWith(...Array.from(this.provider.provided.keys())),
          filter(key => !!key),
        )
        .subscribe(providerKey => this.syncProperties(consumed, providerKey));
  }

  protected reset(): void {
    this.consumed.forEach((value, key) => {
      this.component[key] = value;
    });

    this.consumed.clear();
  }

  protected syncProperties(consumed: string[], providerKey: string): void {
    let key = this.provider.contextMap[providerKey] || providerKey;
    key = this.contextMap[key] || key;

    if (consumed.length && consumed.indexOf(key) < 0) return;

    if (!this.consumed.has(key)) this.consumed.set(key, this.component[key]);

    this.component[key] = this.provider.component[providerKey];
    this.target.markForCheck();
  }

  ngOnChanges() {
    if (this.initialized) {
      this.destroy$.next();

      this.reset();
      if (this.target && this.provider) this.init();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  ngOnInit() {
    this.initialized = true;
    this.ngOnChanges();
  }
}
