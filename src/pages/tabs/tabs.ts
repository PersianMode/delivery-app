import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {InboxPage} from '../inbox/inbox';
import {HistoryPage} from '../history/history';
import {ProfilePage} from '../profile/profile';
import {OnDeliveryPage} from '../on-delivery/on-delivery';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  inboxPage = InboxPage;
  historyPage = HistoryPage;
  profilePage = ProfilePage;
  onDeliveryPage = OnDeliveryPage;

  constructor(public navCtrl: NavController) {
  }

}
