import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UnassignedDeliveriesPage } from './unassigned-deliveries';

@NgModule({
  declarations: [
    UnassignedDeliveriesPage,
  ],
  imports: [
    IonicPageModule.forChild(UnassignedDeliveriesPage),
  ],
})
export class UnassignedDeliveriesPageModule {}
