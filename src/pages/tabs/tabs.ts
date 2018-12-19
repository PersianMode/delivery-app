import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {HistoryPage} from '../history/history';
import {ProfilePage} from '../profile/profile';
import {OnDeliveryPage} from '../on-delivery/on-delivery';
import {NotCompleteDeliveryPage} from '../not-complete-delivery/not-complete-delivery';
import {UnassignedDeliveriesPage} from '../unassigned-deliveries/unassigned-deliveries';
import {AuthService} from '../../services/auth.service';
import {LOGIN_TYPE} from '../../lib/login_type.enum';
import {InternalInboxPage} from '../internal-inbox/internal-inbox';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  unassignedPage = UnassignedDeliveriesPage;
  internalInboxPage = InternalInboxPage;
  historyPage = HistoryPage;
  profilePage = ProfilePage;
  onDeliveryPage = OnDeliveryPage;
  notCompletePage = NotCompleteDeliveryPage;

  isInternal = true;

  constructor(public navCtrl: NavController, private authService: AuthService) {

    this.isInternal  = this.authService.userData.access_level === LOGIN_TYPE.InternalDeliveryAgent
  }

}
