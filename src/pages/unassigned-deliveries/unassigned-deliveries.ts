import {Component} from '@angular/core';
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

  ionViewDidEnter() {
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
    if (this.isSelectMode) {
      if (this.selectedList.find(el => el === item._id)) {
        this.selectedList = this.selectedList.filter(el => el !== item._id);
      } else {
        this.selectedList.push(item._id);
      }
    } else {
      this.navCtrl.push(DeliveryDetailsPage, {
        delivery: item,
        is_delivered: false,
      })
    }
  }

  hasNotAssignedTodayDelivery() {
    const foundNotAssignedTodayDelivery = this.deliveries.find(el => {
      if (moment(el.end, 'YYYY-MM-DD').isSame(moment(new Date(), 'YYYY-MM-DD')) && !this.selectedList.includes(el._id)) {
        return true;
      }

      return false;
    });

    return !!foundNotAssignedTodayDelivery;
  }

  isSelectedItem(id) {
    return this.selectedList.find(el => el === id);
  }

  approveSelectedDeliveries() {
    if (!this.selectedList.length) {
      return;
    }

    // Check delivery priority (continue unless there is a not-selected delivery with higher priority to deliver)
    if (this.hasNotAssignedTodayDelivery()) {
      this.toastCtrl.create({
        message: 'در حال حاضر مرسولات انتخاب نشده ای مربوط به امروز وجود دارند',
        duration: 2000
      }).present();
      return;
    }

    const loading = this.loadingCtrl.create({
      content: 'در حال انتساب مرسولات. لطفاً صبر کنید ...'
    });

    loading.present();

    this.httpService.post('delivery/assign', {
      delivery_ids: this.selectedList
    }).subscribe(
      data => {
        loading.dismiss();
        this.toastCtrl.create({
          message: 'مرسولات انتخابی با موفقیت ثبت شدند',
          duration: 2000,
        }).present();
        this.getUnassignedDeliveries();
      },
      err => {
        console.error('Error when assign delivery to agent: ', err);
        loading.dismiss();
        this.toastCtrl.create({
          message: 'خطایی هنگام انتساب مرسولات رخ داد. دوباره تلاش کنید',
          duration: 2000
        }).present();
        this.getUnassignedDeliveries();
      });
  }
}
