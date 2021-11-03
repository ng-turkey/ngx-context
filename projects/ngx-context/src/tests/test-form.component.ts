import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'context-test-form',
  template: `
    <form [formGroup]="form">
      <context-provider provide="checkControl">
        <context-test-disposer></context-test-disposer>
      </context-provider>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TestFormComponent {
  form: FormGroup;

  get checkControl(): AbstractControl {
    return this.form.controls.check;
  }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      check: [false],
    });
  }
}
