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
import {InternalInboxPage} from '../pages/internal-inbox/internal-inbox';
import {ExternalInboxPage} from '../pages/external-inbox/external-inbox';
import {HistoryPage} from '../pages/history/history';
import {ProfilePage} from '../pages/profile/profile';
import {OnDeliveryPage} from '../pages/on-delivery/on-delivery';
import {DeliveryDetailsPage} from '../pages/delivery-details/delivery-details';
import {Camera} from '@ionic-native/camera';
import {File} from '@ionic-native/file';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer';
import {CallNumber} from '@ionic-native/call-number';
import {WarehouseService} from '../services/warehoues.service';
import {OrderDetailsPage} from '../pages/order-details/order-details';
import {AddressService} from '../services/address.service';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    TabsPage,
    InternalInboxPage,
    ExternalInboxPage,
    HistoryPage,
    ProfilePage,
    OnDeliveryPage,
    OrderDetailsPage,
    DeliveryDetailsPage,
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
    InternalInboxPage,
    ExternalInboxPage,
    HistoryPage,
    ProfilePage,
    OnDeliveryPage,
    DeliveryDetailsPage,
    OrderDetailsPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService,
    HttpService,
    WarehouseService,
    AddressService,
    Camera,
    File,
    FileTransfer,
    // FileUploadOptions,
    FileTransferObject,
    CallNumber,
  ]
})
export class AppModule {}
