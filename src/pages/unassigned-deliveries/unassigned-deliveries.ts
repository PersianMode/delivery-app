import { Component } from '@angular/core';
import {NavController, ToastController, LoadingController} from 'ionic-angular';
import {HttpService} from '../../services/http.service';
import {DeliveryDetailsPage} from '../delivery-details/delivery-details';
import * as moment from 'moment';

@Component({
  selector: 'page-unassigned-deliveries',
  templateUrl: 'unassigned-deliveries.html',
})
export class UnassignedDeliveriesPage {
  isSelectMode = false;
  selectedList = [];
  deliveries = [];

  constructor(private httpService: HttpService, private navCtrl: NavController,
      private toastCtrl: ToastController, private loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    this.getUnassignedDeliveries();
  }

  getUnassignedDeliveries() {
    const loading = this.loadingCtrl.create({
      content: 'در حال دریافت اطلاعات. لطفا صبر کنید ...'
    });

    loading.present();

    this.httpService.get('delivery/unassigned').subscribe(
      data => {
        this.deliveries = data;
        loading.dismiss();
      },
      err => {
        console.error('Cannot fetch unassigned delivery items: ', err);
        loading.dismiss();

        this.toastCtrl.create({
          message: 'قادر به دریافت لیست مرسولات منتسب شده نیستیم. دوباره تلاش کنید',
          duration: 3200,
        }).present();
      });
  }

  getDistrict(item, isDestination = true) {
    const which = isDestination ? 'to' : 'from';
    const district = item[which].customer && item[which].customer._id ? item[which].customer.address.district : item[which].warehouse.address.disctrict;
    return district ? district : '-';
  }

  getStreet(item, isDestination = true) {
    const which = isDestination ? 'to' : 'from';
    const street = item[which].customer && item[which].customer._id ? item[which].customer.address.street : item[which].warehouse.address.street;
    return street && street.trim() ? street : '-';
  }

  selectDelivery(item) {
    if(this.isSelectMode) {
      if(this.selectedList.find(el => el === item._id)) {
        this.selectedList = this.selectedList.filter(el => el !== item._id);
      } else {
        // Check priority here
        const foundNotAssignedTodayDelivery = this.deliveries.find(el => moment(item.end, 'YYYY-MM-DD').isSame(moment(new Date())) && !this.selectedList.includes(el._id));
        if(foundNotAssignedTodayDelivery) {
          this.toastCtrl.create({
            message: 'در حال حاضر مرسولات امروز انتخاب نشده وجود دارند',
            duration: 2000
          }).present();
          return;
        }

        this.selectedList.push(item._id);
      }
    } else {
      this.navCtrl.push(DeliveryDetailsPage, {
        delivery: item,
        is_delivered: false,
      })
    }
  }

  isSelectedItem(id) {
    return this.selectedList.find(el => el === id);
  }

  approveSelectedDeliveries() {
    
  }
}
