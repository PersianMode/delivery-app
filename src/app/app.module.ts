import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { AuthService } from '../services/auth.service';
import {HttpService} from '../services/http.service';
import {HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import {IonicStorageModule} from '@ionic/storage';
import {TabsPage} from '../pages/tabs/tabs';
import {InboxPage} from '../pages/inbox/inbox';
import {HistoryPage} from '../pages/history/history';
import {ProfilePage} from '../pages/profile/profile';
import {OnDeliveryPage} from '../pages/on-delivery/on-delivery';
import {DeliveryDetailsPage} from '../pages/delivery-details/delivery-details';
import {DeliveredEvidencePage} from '../pages/delivered-evidence/delivered-evidence';
import {Camera} from '@ionic-native/camera';
import {File} from '@ionic-native/file';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer';
import {CallNumber} from '@ionic-native/call-number';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    TabsPage,
    InboxPage,
    HistoryPage,
    ProfilePage,
    OnDeliveryPage,
    DeliveryDetailsPage,
    DeliveredEvidencePage,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    TabsPage,
    InboxPage,
    HistoryPage,
    ProfilePage,
    OnDeliveryPage,
    DeliveryDetailsPage,
    DeliveredEvidencePage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService,
    HttpService,
    Camera,
    File,
    FileTransfer,
    // FileUploadOptions,
    FileTransferObject,
    CallNumber,
  ]
})
export class AppModule {}
