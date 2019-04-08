import { AbstractContextConsumer } from '../lib/consumer.abstract';
import { UConsumerComponent } from './consumer.component.spec';
import { UConsumerDirective } from './consumer.directive.spec';
import { TestConsumerComponent } from './test-consumer.component';
import { TestProviderComponent } from './test-provider.component';

type TestModel = UConsumerComponent | UConsumerDirective;

export function execRoutineTestsForConsumer(this: TestModel) {
  it('should be created', () => {
    expect(this.consumer).not.toBeUndefined();
  });

  it('should have TestConsumerComponent as component', () => {
    expect(this.consumer.component).toBe(this.component);
  });

  it('should have empty string as consume', () => {
    expect(this.consumer.consume).toBe('');
  });

  it('should have empty object as contextMap', () => {
    expect(this.consumer.contextMap).toEqual({});
  });

  it('should have empty object as contextMap (undefined/null input)', () => {
    setProp.call(this, 'contextMap', undefined);

    expect(this.consumer.contextMap).toEqual({});

    setProp.call(this, 'contextMap', null);

    expect(this.consumer.contextMap).toEqual({});
  });

  it('should call ngOnChanges on init', () => {
    const timesToBeCalled = this.source === 'component' ? 1 : 2;

    spyOn(this.consumer, 'ngOnChanges');
    this.fixture.detectChanges();

    expect(this.consumer.ngOnChanges).toHaveBeenCalledTimes(timesToBeCalled);
  });

  it('should call ngOnChanges on reset$', () => {
    this.fixture.detectChanges();
    spyOn(this.consumer, 'ngOnChanges');

    this.provider.reset$.next();

    expect(this.consumer.ngOnChanges).toHaveBeenCalledTimes(1);
  });

  it('should sync provided property of component with provider component on change$', () => {
    const prop: keyof TestConsumerComponent = 'target';
    shouldSyncProvidedProperty.call(this, prop);
  });

  it('should sync provided property of component with provider component on change$ (multiple)', () => {
    const prop: keyof TestConsumerComponent = 'target';
    shouldSyncProvidedProperty.call(this, prop);

    this.provider.component[prop] = 'brand new value';
    this.provider.change$.next(prop);

    expect(this.component[prop]).toBe(this.provider.component[prop]);
  });

  it('should sync provided property of component with provider component on change$ (getter)', () => {
    this.provider.component.title = 'test';
    const prop: keyof TestConsumerComponent = 'title';
    shouldSyncProvidedProperty.call(this, prop);
  });

  it('should not sync provided property when property is not consumed', () => {
    const prop: keyof TestConsumerComponent = 'target';
    shouldSyncProvidedProperty.call(this, prop, 'title');
  });

  it('should sync provided property when properties to consume are not defined', () => {
    const prop: keyof TestConsumerComponent = 'target';
    shouldSyncProvidedProperty.call(this, prop, '');
  });

  it('should revert synced property to initial value when not consumed', () => {
    const prop: keyof TestConsumerComponent = 'target';
    const initialValue = shouldSyncProvidedProperty.call(this, prop);

    setProp.call(this, 'consume', 'title');

    expect(this.component[prop]).toBe(initialValue);
  });

  it('should revert synced property to initial value when not provided', () => {
    const prop: keyof TestConsumerComponent = 'target';
    const initialValue = shouldSyncProvidedProperty.call(this, prop);

    this.provider.provide = '';
    this.provider.reset$.next();

    expect(this.component[prop]).toBe(initialValue);
  });

  it('should map provided property to consumed property based on contextMap of provider', () => {
    this.provider.component.title = 'test';

    const prop: keyof TestProviderComponent = 'title';
    const mappedProp: keyof TestConsumerComponent = 'target';

    this.provider.contextMap = { [prop]: mappedProp };

    shouldMapProvidedProperty.call(this, prop, mappedProp);
  });

  it('should map provided property to consumed property based on contextMap of consumer', () => {
    this.provider.component.title = 'test';

    const prop: keyof TestProviderComponent = 'title';
    const mappedProp: keyof TestConsumerComponent = 'target';

    this[this.source].contextMap = { [prop]: mappedProp };
    this.consumer.contextMap = { [prop]: mappedProp };

    shouldMapProvidedProperty.call(this, prop, mappedProp);
  });

  it('should map provided property to consumed property based on contextMap of both', () => {
    this.provider.component.title = 'test';

    const prop: keyof TestProviderComponent = 'title';
    const otherProp = 'title_to_target';
    const mappedProp: keyof TestConsumerComponent = 'target';

    this.provider.contextMap = { [prop]: otherProp };
    this[this.source].contextMap = { [otherProp]: mappedProp };
    this.consumer.contextMap = { [otherProp]: mappedProp };

    shouldMapProvidedProperty.call(this, prop, mappedProp);
  });
}

export type Excluded = 'component' | 'ngOnChanges' | 'ngOnInit' | 'ngOnDestroy';

function setProp(
  this: TestModel,
  prop: Exclude<keyof AbstractContextConsumer<any>, Excluded>,
  value: any,
): void {
  this[this.source][prop === 'consume' ? 'provided' : prop] = value;
  this.consumer[prop] = value;

  if (this.source === 'component') this.consumer.ngOnChanges();
  else this.fixture.detectChanges();
}

function shouldMapProvidedProperty(
  this: TestModel,
  prop: keyof TestProviderComponent,
  mappedProp: keyof TestConsumerComponent,
): void {
  this.provider.provide = prop;
  this[this.source].provided = mappedProp;
  this.consumer.consume = mappedProp;
  this.fixture.detectChanges();

  this.provider.change$.next(prop);

  expect(this.component[mappedProp]).toEqual(this.provider.component[prop]);
}

function shouldSyncProvidedProperty(
  this: TestModel,
  prop: keyof TestConsumerComponent,
  consumed = prop,
): any {
  const initialValue = this.component[prop];
  this.provider.provide = prop;
  this[this.source].provided = consumed;
  this.consumer.consume = consumed;
  this.fixture.detectChanges();

  this.provider.change$.next(prop);

  const expected =
    consumed.length && consumed.indexOf(prop) < 0
      ? initialValue
      : this.provider.component[prop];

  expect(this.component[prop]).toEqual(expected);

  return initialValue;
}
