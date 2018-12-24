import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExternalInboxPage } from './external-inbox';

@NgModule({
  declarations: [
    ExternalInboxPage,
  ],
  imports: [
    IonicPageModule.forChild(ExternalInboxPage),
  ],
})
export class ExternalInboxPageModule {}
