import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {HistoryPage} from '../history/history';
import {ProfilePage} from '../profile/profile';
import {OnDeliveryPage} from '../on-delivery/on-delivery';
import {AuthService} from '../../services/auth.service';
import {LOGIN_TYPE} from '../../lib/login_type.enum';
import {InternalInboxPage} from '../internal-inbox/internal-inbox';
import {ExternalInboxPage} from '../external-inbox/external-inbox';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  internalInboxPage = InternalInboxPage;
  externalInboxPage = ExternalInboxPage;
  historyPage = HistoryPage;
  profilePage = ProfilePage;
  onDeliveryPage = OnDeliveryPage;

  isInternal = true;

  constructor(public navCtrl: NavController, private authService: AuthService) {

    this.isInternal  = this.authService.userData.access_level === LOGIN_TYPE.InternalDeliveryAgent
  }

}
