import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InternalInboxPage } from './internal-inbox';

@NgModule({
  declarations: [
    InternalInboxPage,
  ],
  imports: [
    IonicPageModule.forChild(InternalInboxPage),
  ],
})
export class InternalInboxPageModule {}
