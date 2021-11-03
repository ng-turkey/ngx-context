import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'two-way',
  template: `
  <context-consumer consume="rate2 rate4 onRating2"></context-consumer>

  <h5>Two-way Binding</h5>

  <div class="mb-2"> #1
    <rating
      contextConsumer
      [contextMap]="{rate1: 'value', pre1: 'preValue', onRating1: 'onChange'}"
    ></rating>
  </div>

  <div class="mb-2"> #2
    <rating
      [ngModel]="rate2"
      (ngModelChange)="onRating2($event)"
    ></rating>
  </div>

  <div class="mb-2"> #3
    <ng-template contextDisposer="rate3 onRating3" let-context>
      <rating
        [ngModel]="context.rate3"
        (ngModelChange)="context.onRating3($event)"
      ></rating>
    </ng-template>
  </div>

  <div class="mb-2"> #4
    <rating *ngIf="rate4" [formControl]="rate4"></rating>
  </div>

  <div class="mb-2"> #5
    <ng-template contextDisposer="rate5" let-control="rate5">
      <rating *ngIf="control" [formControl]="control"></rating>
    </ng-template>
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoWayComponent {
  rate2: number;
  rate4: FormControl;
  onRating2: (rate: number) => void;
}
