import {Component, OnInit} from '@angular/core';
import {NavController, LoadingController, ToastController, AlertController} from 'ionic-angular';
import {HttpService} from '../../services/http.service';
import {DELIVERY_STATUS} from '../../lib/delivery_status.enum';
import {DeliveryDetailsPage} from '../delivery-details/delivery-details';
import {CallNumber} from '@ionic-native/call-number';
import {AuthService} from '../../services/auth.service';
import {WarehouseService} from '../../services/warehoues.service';
import {LOGIN_TYPE} from '../../lib/login_type.enum';
import * as moment from 'moment';

@Component({
  selector: 'page-on-delivery',
  templateUrl: 'on-delivery.html',
})
export class OnDeliveryPage implements OnInit {
  deliveryItems = [];
  Full = true;

  constructor(
    private callNumber: CallNumber, public navCtrl: NavController, private httpService: HttpService,
    private toastCtrl: ToastController, private loadingCtrl: LoadingController,
    private authService: AuthService, private warehouseService: WarehouseService,
    private alertCtrl: AlertController) {
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.load();
  }

  load() {
    const loading = this.loadingCtrl.create({
      content: 'در حال دریافت لیست ارسال ها. لطفا صبر کنید ...'
    });

    loading.present();

    this.httpService.post('search/DeliveryTicket', {
      offset: 0,
      limit: 100,
      options: {
        type: "OnDelivery",
        Full: this.Full
      }
    }).subscribe(
      res => {
        console.log('res on-delivery: ', res);
        this.deliveryItems = res.data;
        loading.dismiss();
      },
      err => {
        console.error('Cannot get delivery box: ', err);
        loading.dismiss();
        this.toastCtrl.create({
          message: 'خطا در دریافت ارسال های در حال اجرا. دوباره تلاش کنید',
          duration: 3200,
        }).present();
      });
  }

  getDistrict(item) {
    let district;
    if (this.authService.userData.access_level === LOGIN_TYPE.DeliveryAgent) {
      district = item.to.customer && item.to.customer._id ? item.to.customer.address.district : '-'
    } else {
      district = item.to.warehouse_id ? this.warehouseService.getWarehouse(item.to.warehouse_id).address.district : '-';
    }
    return district;
  }

  getStreet(item) {

    let street;
    if (this.authService.userData.access_level === LOGIN_TYPE.DeliveryAgent) {
      street = item.to.customer && item.to.customer._id ? item.to.customer.address.street : '-'
    } else {
      street = item.to.warehouse_id ? this.warehouseService.getWarehouse(item.to.warehouse_id).address.street : '-';
    }
    return street.trim();
  }

  getReceiverName(item) {
    let receiver;
    if (this.authService.userData.access_level === LOGIN_TYPE.DeliveryAgent) {
      receiver = item.to.customer && item.to.customer._id ? this.getConcatinatedName(item.to.customer.first_name, item.to.customer.surname) : '-'
    } else {
      receiver = item.to.warehouse_id ? this.warehouseService.getWarehouse(item.to.warehouse_id).name : '-';
    }
    return receiver;
  }

  private getConcatinatedName(name1, name2) {
    return name1 && name2 ? name1 + ' - ' + name2 : (name1 ? name1 : name2);
  }

  getStartDate(item) {
    return moment(item.start).format('YYYY-MM-DD');
  }
  getActualStartDate(item) {
    return moment(item.delivery_start).format('YYYY-MM-DD');
  }

  getStartTime(item) {
    return moment(item.delivery_start).format('HH:mm');
  }

  getDeliveryType(item) {
    if (item.from.customer && item.form.customer._id)
      return 'بازگشت';
    else if (item.to.customer && item.to.customer._id)
      return 'ارسال به مشتری';
    else if (item.to.warehouse_id)
      return 'داخلی'
  }

  showOrderLineDetails(item) {

  }


  selectDelivery(item) {
    this.navCtrl.push(DeliveryDetailsPage, {
      delivery: item,
    });
  }

  callReceiver(item) {
    let phoneNumber = "";

    if (item.to.customer)
      phoneNumber = item.to.customer.address.recipient_mobile_no ? item.to.customer.address.recipient_mobile_no : '';
    else {

      phoneNumber = this.warehouseService.getWarehouse(item.to.warehouse_id).phone || '';

    }

    if (phoneNumber)
      this.callNumber.callNumber(phoneNumber, true)
        .then(res => {

        })
        .catch(err => {

        });
    else {
      this.toastCtrl.create({
        message: 'شماره ای برای تماس یافت نشد',
        duration: 2000,
      }).present();
    }
  }

  finishDelivery(item) {
    if (item.delivery_end) {
      this.toastCtrl.create({
        message: 'این ارسال مورد نظر پیشتر به پایان رسیده است.',
        duration: 2000,
      }).present();

      this.deliveryItems = this.deliveryItems.filter(el => el._id !== item._id);
      return;
    }

    this.alertCtrl.create({
      title: 'تأیید ارسال',
      message: 'آیا ارسال به پایان رسیده است؟',
      buttons: [
        {
          text: 'لغو',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'بله',
          handler: () => {
            this.httpService.post('delivery/end', {
              deliveryId: item._id,
            }).subscribe(
              data => {
                this.toastCtrl.create({
                  message: 'ارسال به پایان رسید',
                  duration: 1200,
                }).present();
                this.load();
              },
              err => {
                this.toastCtrl.create({
                  message: 'پایان ارسال با خطا مواجه شد. شاید این ارسال پیشتر به پایان یافته باشد',
                  duration: 2000,
                }).present();
              });
          }
        }
      ]
    }).present();
  }
}
