import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'one-way',
  template: `
    <context-consumer consume="progress"></context-consumer>
    
    <h5>One-way Binding</h5>

    <div class="mb-2">
      <progressbar
        contextConsumer
        [contextMap]="{progress: 'value', progressStriped: 'striped'}"
      >{{ getPercentage(progress) }}</progressbar>
    </div>

    <div class="mb-2">
      <ng-template contextDisposer let-context>
        <progressbar
          [type]="context.type"
          [value]="context.progress"
          [striped]="context.progressStriped"
        >{{ getPercentage(context.progress) }}</progressbar>
      </ng-template>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OneWayComponent {
  progress: number;

  getPercentage(progress: number) {
    return progress ? progress + '%' : '';
  }
}
