import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PastControlsComponent } from './pages/past-controls/past-controls.component';
import { InprocessControlComponent } from './pages/inprocess-control/inprocess-control.component';
import { MotherIncomingcontrolsListComponent } from './components/mother-incomingcontrols-list/mother-incomingcontrols-list.component';
import { ControlDataComponent } from './components/control-data/control-data.component';
import { AddControlComponent } from './components/add-control/add-control.component';
import { ControlsListComponent } from './components/controls-list/controls-list.component';
import { ControlsRoutingModule } from './controls-routing.module';
import { PopUpPrintControlComponent } from './components/pop-up-print-control/pop-up-print-control.component';
import { SharedModule } from '@shared/shared.module';
import { PastControlsListComponent } from './components/past-controls-list/past-controls-list.component';
import { FirstControlFormComponent } from './pages/first-control-form/first-control-form.component';
import { ControlFormComponent } from './pages/control-form/control-form.component';



@NgModule({
  declarations: [
    PastControlsComponent, 
    InprocessControlComponent, 
    MotherIncomingcontrolsListComponent, 
    ControlDataComponent, 
    AddControlComponent, 
    ControlsListComponent, 
    PopUpPrintControlComponent, 
    PastControlsListComponent, 
    FirstControlFormComponent, 
    ControlFormComponent
  ],
  imports: [
    CommonModule,
    ControlsRoutingModule,
    SharedModule
  ],
  exports:[
    PastControlsComponent, 
    InprocessControlComponent, 
    MotherIncomingcontrolsListComponent, 
    ControlDataComponent, 
    AddControlComponent, 
    ControlsListComponent,
    PopUpPrintControlComponent, 
    PastControlsListComponent, 
    FirstControlFormComponent, 
    ControlFormComponent
  ]
})
export class ControlsModule { }
