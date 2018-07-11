import {Component, OnInit} from '@angular/core';
import {NavController, ToastController, LoadingController} from 'ionic-angular';
import {HttpService} from '../../services/http.service';
import {DELIVERY_STATUS} from '../../lib/delivery_status.enum';
import {DeliveryDetailsPage} from '../delivery-details/delivery-details';
import * as moment from 'moment';

@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html',
})
export class InboxPage implements OnInit {
  deliveryItems = [];
  selectedList = [];
  allIsSelected = false;
  isSelectMode = false;

  constructor(public navCtrl: NavController, private httpService: HttpService,
    private toastCtrl: ToastController, private loadingCtrl: LoadingController) {
  }

  ngOnInit() {
    this.getDeliveryItems();
  }

  getDeliveryItems() {
    const loading = this.loadingCtrl.create({
      content: 'در حال دریافت اطلاعات. لطفا صبر کنید ...'
    });

    loading.present();

    this.httpService.post('delivery/agent/items', {
      delivery_status: DELIVERY_STATUS.DeliverySet,
      is_delivered: false,
    }).subscribe(
      data => {
        this.deliveryItems = data;
        loading.dismiss();
      },
      err => {
        console.error('Cannot fetch delivery items as inbox: ', err);
        loading.dismiss();

        this.toastCtrl.create({
          message: 'قادر به دریافت لیست ورودی های شما نیستیم. دوباره تلاش کنید',
          duration: 3200,
        }).present();
      });
  }

  selectDelivery(item) {
    if (this.isSelectMode) {
      if (this.selectedList.find(el => el === item._id))
        this.selectedList = this.selectedList.filter(el => el !== item._id);
      else {
        // Check start date-time with current date for target delivery
        if (moment(item.start, 'YYYY-MM-DD HH').isAfter(moment(new Date(), 'YYYY-MM-DD HH'))) {
          this.toastCtrl.create({
            message: 'تاریخ/ساعت ارسال مورد انتخاب شده پیش از تاریخ/ساعت فعلی است',
            duration: 2000,
          }).present();
          return;
        }

        this.selectedList.push(item._id);
      }
    } else {
      this.navCtrl.push(DeliveryDetailsPage, {
        delivery: item,
        is_delivered: false,
      });
    }
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

  getStartDate(item) {
    return moment(item.start).format('YYYY-MM-DD');
  }

  getStartTime(item) {
    return moment(item.start).format('HH:mm');
  }

  approveSelectedDelivery() {
    if (!this.selectedList.length)
      return;

    this.httpService.post('delivery/status', {
      delivery_ids: this.selectedList,
      target_status: DELIVERY_STATUS.OnDelivery,
    }).subscribe(
      data => {
        this.deliveryItems = this.deliveryItems.filter(el => !this.selectedList.includes(el._id));
        this.selectedList = [];

        this.toastCtrl.create({
          message: 'موارد انتخاب شده با موفقیت قبول شدند.',
          duration: 2300,
        }).present();
      },
      err => {
        console.error('Cannot set/chagne status of selected items: ', err);
        this.toastCtrl.create({
          message: 'قبول موارد انتخاب شده با مشکل مواجه شد. دوباره تلاش کنید.',
          duration: 3200,
        }).present();
      });
  }

  isSelectedItem(id) {
    return this.selectedList.find(el => el === id);
  }

  selectAll() {
    this.selectedList = this.allIsSelected ? [] : this.deliveryItems.map(el => el._id);
    this.allIsSelected = !this.allIsSelected;
  }
}
