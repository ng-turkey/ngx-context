import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { RatingModule } from 'ngx-bootstrap/rating';
import { NgxContextModule } from 'ngx-context';
import { AppComponent } from './app.component';
import { OneWayComponent } from './one-way.component';
import { TwoWayComponent } from './two-way.component';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    ProgressbarModule.forRoot(),
    RatingModule.forRoot(),
    NgxContextModule,
  ],
  declarations: [
    AppComponent,
    OneWayComponent,
    TwoWayComponent,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
