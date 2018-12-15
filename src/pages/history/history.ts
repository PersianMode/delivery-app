import {Component, OnInit} from '@angular/core';
import {NavController, ToastController, LoadingController} from 'ionic-angular';
import {HttpService} from '../../services/http.service';
import {DELIVERY_STATUS} from '../../lib/delivery_status.enum';
import {DeliveryDetailsPage} from '../delivery-details/delivery-details';

@Component({
  selector: 'page-history',
  templateUrl: 'history.html',
})
export class HistoryPage implements OnInit {
  deliveredItems = [];

  constructor(public navCtrl: NavController, private httpService: HttpService,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController) {
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.getDeliveredItems();
  }

  getDeliveredItems() {
    const loading = this.loadingCtrl.create({
      content: 'در حال دریافت اطلاعات. لطفا صبر کنید ...'
    });

    loading.present();

    this.httpService.post('delivery/agent/items', {
      // delivery_status: DELIVERY_STATUS.Delivered,
      is_delivered: true,
      is_processed: true,      
    }).subscribe(
      data => {
        this.deliveredItems = data;
        loading.dismiss();
      },
      err => {
        console.error('Cannot fetch delivery items as on delivery items: ', err);
        loading.dismiss();

        this.toastCtrl.create({
          message: 'قادر به دریافت لیست موارد در حال ارسال نیستیم. دوباره تلاش کنید',
          duration: 3200,
        }).present();
      });
  }

  getDistrict(item) {
    const district = item.to.customer && item.to.customer._id ? item.to.customer.address.district : item.to.warehouse.address.disctrict;
    return district ? district : '-';
  }

  getStreet(item) {
    const street = item.to.customer && item.to.customer._id ? item.to.customer.address.street : item.to.warehouse.address.street;
    return street && street.trim() ? street : '-';
  }

  getReceiverName(item) {
    const receiverName = item.to.customer && item.to.customer._id ? this.getConcatinatedName(item.to.customer.first_name, item.to.customer.surname) : item.to.warehouse.name;
    return receiverName && receiverName.trim() ? receiverName : '-';
  }

  private getConcatinatedName(name1, name2) {
    return name1 && name2 ? name1 + ' - ' + name2 : (name1 ? name1 : name2);
  }

  viewDetails(item) {
    this.navCtrl.push(DeliveryDetailsPage, {
      delivery: item,
      is_delivered: true,
    });
  }
}
