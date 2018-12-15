import {Component, OnInit} from '@angular/core';
import {NavController, ToastController, LoadingController} from 'ionic-angular';
import {HttpService} from '../../services/http.service';
import {DeliveryDetailsPage} from '../delivery-details/delivery-details';
import * as moment from 'moment';
import {AuthService} from '../../services/auth.service';
import {LOGIN_TYPE} from '../../lib/login_type.enum';
import {WarehouseService} from '../../services/warehoues.service';
import {DELIVERY_STATUS} from '../../lib/delivery_status.enum';

@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html',
})
export class InboxPage implements OnInit {
  deliveryItems = [];

  constructor(public navCtrl: NavController, private httpService: HttpService,
    private toastCtrl: ToastController, private loadingCtrl: LoadingController,
    private authService: AuthService, private warehouseService: WarehouseService) {
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.load();
  }

  ionViewDidLeave() {
  }

  load() {
    const loading = this.loadingCtrl.create({
      content: 'در حال دریافت اطلاعات. لطفا صبر کنید ...'
    });

    loading.present();

    this.httpService.post('search/DeliveryTicket', {
      offset: 0,
      limit: 100,
      options: {
        type: "InternalAssinedDelivery"
      }
    }).subscribe(
      res => {
        this.deliveryItems = res.data;
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

    this.navCtrl.push(DeliveryDetailsPage, {
      delivery: item,
      is_delivered: false,
    });

    // if (this.isSelectMode) {
    //   if (this.selectedList.find(el => el === item._id))
    //     this.selectedList = this.selectedList.filter(el => el !== item._id);
    //   else {
    //     // Check start date-time with current date for target delivery
    //     if (moment(item.start, 'YYYY-MM-DD HH').isAfter(moment(new Date(), 'YYYY-MM-DD HH'))) {
    //       this.toastCtrl.create({
    //         message: 'تاریخ/ساعت ارسال مورد انتخاب شده پیش از تاریخ/ساعت فعلی است',
    //         duration: 2000,
    //       }).present();
    //       return;
    //     }

    //     this.selectedList.push(item._id);
    //   }
    // } else {
    //   this.navCtrl.push(DeliveryDetailsPage, {
    //     delivery: item,
    //     is_delivered: false,
    //   });
    // }
  }

  showOrderLineDetails(item){
    
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

  getStartTime(item) {
    return moment(item.start).format('HH:mm');
  }

  getDeliveryType(item) {
    if (item.from.customer && item.form.customer._id)
      return 'بازگشت';
    else if (item.to.customer && item.to.customer._id)
      return 'ارسال به مشتری';
    else if (item.to.warehouse_id)
      return 'داخلی'
  }

  isDeliveryOrdersRequested(item) {
    return item.last_ticket.status === DELIVERY_STATUS.requestPackage;
  }

  requestDeliveryOrders() {
    // if (!this.selectedList.length)
    //   return;

    // const loading = this.loadingCtrl.create({
    //   content: 'در حال اعمال تغیرات. لطفا صبر کنید ...'
    // });

    // loading.present();

    // this.httpService.post('delivery/status', {
    //   delivery_ids: this.selectedList,
    //   target_status: DELIVERY_STATUS.OnDelivery,
    // }).subscribe(
    //   data => {
    //     this.deliveryItems = this.deliveryItems.filter(el => !this.selectedList.includes(el._id));
    //     this.selectedList = [];

    //     loading.dismiss();
    //     this.toastCtrl.create({
    //       message: 'موارد انتخاب شده با موفقیت قبول شدند.',
    //       duration: 2300,
    //     }).present();
    //   },
    //   err => {
    //     console.error('Cannot set/chagne status of selected items: ', err);
    //     this.toastCtrl.create({
    //       message: 'قبول موارد انتخاب شده با مشکل مواجه شد. دوباره تلاش کنید.',
    //       duration: 3200,
    //     }).present();
    //     loading.dismiss();
    //   });
  }


  unassignDelivery() {
    // if (!this.selectedList.length) {
    //   return;
    // }

    const loading = this.loadingCtrl.create({
      content: 'در حال اعمال تغیرات. لطفا صبر کنید ...'
    });

    loading.present();

    // this.httpService.post('delivery/unassign', {
    //   delivery_ids: this.selectedList
    // }).subscribe(
    //   data => {
    //     loading.dismiss();
    //     this.toastCtrl.create({
    //       message: 'مرسوله با موفقیت برداشته شد',
    //       duration: 2000,
    //     }).present();
    //     this.isSelectMode = false;
    //     this.load();
    //   },
    //   err => {
    //     console.error('Error when unassign delivery from current agent: ', err);
    //     loading.dismiss();
    //     this.toastCtrl.create({
    //       message: 'خطا در هنگام عدم انتساب مرسوله. دوباره تلاش کنید',
    //       duration: 2000,
    //     }).present();
    //   });
  }
}
