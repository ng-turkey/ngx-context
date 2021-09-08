import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
  <context-provider
      provide="progress progressStriped progressType"
      [contextMap]="{progressType: 'type'}"
    >
      <one-way></one-way>
    </context-provider>

    <form [formGroup]="form">
      <context-provider
        provide="pre1 rate1 rate2 rate3 rate4 rate5 onRating1 onRating2 onRating3"
      >
        <two-way></two-way>
      </context-provider>
    </form>

    <pre>
      <code>
      Rating 1:  {{ rate1 }}
      Rating 2:  {{ rate2 }}
      Rating 3:  {{ rate3 }}
      Rating 4:  {{ rate4.value }}
      Rating 5:  {{ form.get('rate5').value }}
      </code>
    </pre>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  progress = 0;
  progressStriped = true;
  progressType = 'info';

  rate1 = 1;
  rate2 = 4;
  rate3 = 2;

  get pre1() {
    return this.rate1;
  }

  onRating1 = (value: number) => {
    this.rate1 = value;
  }
  onRating2 = (value: number) => {
    this.rate2 = value;
  }
  onRating3 = (value: number) => {
    this.rate3 = value;
  }

  form: FormGroup;
  rate4: FormControl;
  rate5: FormControl;

  constructor(private fb: FormBuilder) {
    this.rate4 = this.fb.control(5);
    this.rate5 = this.fb.control(3);
    this.form = this.fb.group({
      rate4: this.rate4,
      rate5: this.rate5,
    });
  }

  ngOnInit() {
    interval(1000).pipe(take(10)).subscribe(
      n => this.progress = (n + 1) * 10
    );
  }
}
