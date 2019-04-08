# ngx-context (a.k.a. Angular Context)

Angular Context is a library to transfer control of a child component to a parent component high above in a nested component tree **without passing properties through other components or getting blocked by a router outlet**.

If you would like to have further information on why you need a library like this, you may find the [reasons](#reasons-to-use-this-library) below. Otherwise, skip to the [quickstart](#quickstart) or [usage](#usage) section.

## Reasons to Use This Library

Data-binding and input properties are great. However, working with them has some challenges:

- Passing properties through several layers of the component tree is known as prop-drilling and it is time consuming and difficult and error prone to maintain.
- When a component is loaded via `router-outlet`, data-binding is not available and prop-drilling is no longer an option.
- Providing data through state management has its own caveat: Since connecting presentational (dumb) components directly to a specific state breaks their reusability, they have to be wrapped by container (smart) components instead and that usually is additional work.

This library is designed to improve developer experience by fixing all issues above. It provides context through dependency injection system behind-the-scenes and lets your deeply nested dumb components consume them easily. It is conceptually influenced by [React Context](https://reactjs.org/docs/context.html), but is 100% tailored for Angular.

## Quickstart

### Installation

Run the following code in your terminal:

```
yarn add ngx-context
```

or if you are using npm:

```
npm install ngx-context
```

### Setup Before Initial Use

Import `NgxContextModule` into your root module like:

```TS
import { NgxContextModule } from 'ngx-context';

@NgModule({
  imports: [ NgxContextModule ]
})
export class AppModule {}

```

### How to Provide Context from Parent Component

Simply put a `ContextProviderComponent` around the children and refer to property names to provide.

```TS
@Component({
  selector: 'parent-component',
  template: `
  <context-provider provide="someProp someOtherProp">

    <!--
    components consuming the context can be deeply nested
    within the components placed here (inside context provider)
    and be able to consume someProp and someOtherProp
    -->

  </context-provider>
  `,
})
export class ParentComponent {
  someProp: string = 'Test';

  someOtherProp: boolean = true;

  notProvided: number = 5;

  alsoNotProvided: Observable<> = empty();
}

```

### How to Consume Context in Child Component

You may consume any provided context in a component by placing a `ContextConsumerDirective` on it. This component can either be a direct or a deeply nested child of the context provider.

```HTML
<!-- child component will be able to consume all provided props -->

<child-component contextConsumer></child-component>

```

## Usage

### ContextProviderComponent

The name of the props to be provided is set by `provide` input and it can take `string` or `Array<string>` values.

```HTML
<context-provider provide="someProp someOtherProp">
  <!-- consumers will consume someProp and someOtherProp -->
</context-provider>

```

— or —

```HTML
<context-provider [provide]="['someProp', 'someOtherProp']">
  <!-- consumers will consume someProp and someOtherProp -->
</context-provider>

```

Provided property names can be dynamically set.

```HTML
<context-provider [provide]="propertiesToProvide">
  <!-- consumers will consume properties defined by propertiesToProvide -->
</context-provider>

```

Provided property names can be mapped.

```HTML
<context-provider
  provide="someProp"
  [contextMap]="{someProp: 'someOtherPropName'}"
>
  <!-- consumers will consume someOtherPropName -->
</context-provider>

```

Context consumers or their parents should be wrapped by `ContextProviderComponent` in the parent component.

```HTML
<context-provider provide="someProp someOtherProp">
  <some-context-consumer></some-context-consumer>
  <some-other-context-consumer></some-other-context-consumer>
  <parent-of-context-consumer></parent-of-context-consumer>
  <grand-grand-grand-parent-of-context-consumer></grand-grand-grand-parent-of-context-consumer>
</context-provider>

```

More than one `ContextProviderComponent` can be placed in a parent component.

```HTML
<context-provider provide="someProp someOtherProp">
  <some-context-consumer></some-context-consumer>
  <parent-of-context-consumer></parent-of-context-consumer>
</context-provider>

<context-provider provide="yetAnotherProp">
  <some-other-context-consumer></some-other-context-consumer>
</context-provider>

```

Router outlets have no effect on context and can be safely used.

```HTML
<context-provider provide="someProp someOtherProp">
  <router-outlet></router-outlet>
</context-provider>

```

### ContextConsumerComponent

The easiest way to consume a context is to place a `ContextConsumerComponent` inside a child component. It will be able to consume context once provided and behave normally when not.

```HTML
<!--
place this inside the template of the consumer component
consumer will consume any property provided
-->

<context-consumer></context-consumer>

```

The name of specific props to be consumed can be set by `consume` input and it can take `string` or `Array<string>` values.

```HTML
<!-- consumer will consume someProp and someOtherProp -->

<context-consumer consume="someProp someOtherProp"></context-consumer>

```

— or —

```HTML
<!-- consumer will consume someProp and someOtherProp -->

<context-consumer [consume]="['someProp', 'someOtherProp']"></context-consumer>

```

Consumed property names can be dynamically set.

```HTML
<!-- consumer will consume properties defined by propertiesToConsume -->

<context-consumer [consume]="propertiesToConsume"></context-consumer>

```

Consumed property names can be mapped.

```HTML
<!-- consumer will consume someOtherPropName -->

<context-consumer [contextMap]="{someProp: 'someOtherPropName'}"></context-consumer>

```

### ContextConsumerDirective

If a component cannot take `ContextConsumerComponent` in (e.g. 3rd-party components), you can use `ContextConsumerDirective` on them.

```HTML
<!-- consumer will consume any property provided -->

<child-component contextConsumer></child-component>

```

The name of specific props to be consumed can be set by `contextConsumer` input and it can take `string` or `Array<string>` values.

```HTML
<!-- consumer will consume someProp and someOtherProp -->

<child-component contextConsumer="someProp someOtherProp"></child-component>

```

— or —

```HTML
<!-- consumer will consume someProp and someOtherProp -->

<child-component [contextConsumer]="['someProp', 'someOtherProp']"></child-component>

```

Consumed property names can be dynamically set.

```HTML
<!-- consumer will consume properties defined by propertiesToConsume -->

<child-component [contextConsumer]="propertiesToConsume"></child-component>

```

Consumed property names can be mapped.

```HTML
<!-- consumer will consume someOtherPropName -->

<child-component [contextMap]="{someProp: 'someOtherPropName'}"></child-component>

```

## Roadmap

- [x] Component to provide context

- [ ] Component and directive to consume context

- [ ] Test coverage

- [ ] Documentation & examples

- [ ] Permissive license

- [ ] Inclusive code of conduct

- [ ] Issue submission templates

- [ ] Contribution guidelines

- [ ] GitHub Pages implementation

- [ ] CI integrations
