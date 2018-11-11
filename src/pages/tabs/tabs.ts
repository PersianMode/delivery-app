import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {InboxPage} from '../inbox/inbox';
import {HistoryPage} from '../history/history';
import {ProfilePage} from '../profile/profile';
import {OnDeliveryPage} from '../on-delivery/on-delivery';
import { NotCompleteDeliveryPage } from '../not-complete-delivery/not-complete-delivery';
import {UnassignedDeliveriesPage} from '../unassigned-deliveries/unassigned-deliveries';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  unassignedPage = UnassignedDeliveriesPage;
  inboxPage = InboxPage;
  historyPage = HistoryPage;
  profilePage = ProfilePage;
  onDeliveryPage = OnDeliveryPage;
  notCompletePage = NotCompleteDeliveryPage;

  constructor(public navCtrl: NavController) {
  }

}
