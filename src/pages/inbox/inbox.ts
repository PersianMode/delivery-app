import {Component, OnInit} from '@angular/core';
import {NavController, ToastController, LoadingController, AlertController} from 'ionic-angular';
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
  Full = true;

  constructor(public navCtrl: NavController, private httpService: HttpService,
    private toastCtrl: ToastController, private loadingCtrl: LoadingController,
    private authService: AuthService, private warehouseService: WarehouseService,
    private alertCtrl: AlertController) {
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
      content: 'در حال دریافت لیست ارسال ها. لطفا صبر کنید ...'
    });

    loading.present();

    this.httpService.post('search/DeliveryTicket', {
      offset: 0,
      limit: 100,
      options: {
        type: "InternalAssinedDelivery",
        Full:  this.Full
      }
    }).subscribe(
      res => {
        console.log('res:', res);
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

  showOrderLineDetails(item) {

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
    if (!this.deliveryItems.length)
      return;

    const loading = this.loadingCtrl.create({
      content: 'در حال اعمال تغیرات. لطفا صبر کنید ...'
    });

    loading.present();

    this.httpService.post('delivery/requestPackage', {
      deliveryId: this.deliveryItems[0]._id,
    }).subscribe(
      data => {
        loading.dismiss();
        this.toastCtrl.create({
          message: 'موارد انتخاب شده با موفقیت قبول شدند.',
          duration: 2300,
        }).present();
        this.load();
      },
      err => {
        console.error('Cannot request for delivery orders: ', err);
        this.toastCtrl.create({
          message: 'خطا در درخواست محموله ارسالی. دوباره تلاش کنید',
          duration: 3200,
        }).present();
        loading.dismiss();
      });
  }


  unassignDelivery() {
    if (!this.deliveryItems.length) {
      return;
    }

    const loading = this.loadingCtrl.create({
      content: 'در حال اعمال تغیرات. لطفا صبر کنید ...'
    });

    loading.present();

    this.httpService.post('delivery/unassign', {
      deliveryId: this.deliveryItems[0]._id
    }).subscribe(
      data => {
        loading.dismiss();
        this.toastCtrl.create({
          message: 'ارسال با موفقت از لیست شما حذف شد',
          duration: 2000,
        }).present();
        this.load();
      },
      err => {
        console.error('Error when unassign delivery from current agent: ', err);
        loading.dismiss();
        this.toastCtrl.create({
          message: 'خطا به هنگام حذف ارسال از لیست. دوباره تلاش کنید',
          duration: 2000,
        }).present();
      });
  }

  startDelivery(item) {

    const loading = this.loadingCtrl.create({
      content: 'در حال بررسی موارد اسکن شده. لطفا صبر کنید ...'
    });

    loading.present();

    this.httpService.post('delivery/start', {
      deliveryId: item._id,
      preCheck: true
    }).subscribe(res => {


      loading.dismiss();
      if (!res || !res.length) {
        this.toastCtrl.create({
          message: 'هیچ یک از محصولات اسکن نشده است',
          duration: 2000,
        }).present();
        return;
      }

      let message;

      let totalDeliveryOrderLines = [];
      this.deliveryItems[0].order_details.forEach(x => {
        totalDeliveryOrderLines = totalDeliveryOrderLines.concat(x.order_line_ids);
      })

      if (res.length === totalDeliveryOrderLines.length)
        message = 'everything is OK. start scan?'
      else {
        message = `${res.length} of ${totalDeliveryOrderLines.length} is ready. start scan?`
      }
      let alert = this.alertCtrl.create({
        title: 'شروع ارسال',
        message,
        buttons: [
          {
            text: 'خیر',
            role: 'cancel',
            handler: () => {
            }
          },
          {
            text: 'بله',
            handler: () => {
              const loading = this.loadingCtrl.create({
                content: 'در حال شروع ارسال. لطفا صبر کنید ...'
              });
              loading.present();

              this.httpService.post('delivery/start', {
                deliveryId: item._id,
              }).subscribe(res => {
                loading.dismiss();
                this.load();
              }, err => {
                console.error('Error on start delivery ', err);
                loading.dismiss();
                this.toastCtrl.create({
                  message: 'خطا به هنگام شروع ارسال. دوباره تلاش کنید',
                  duration: 2000,
                }).present();
              });
            }
          }
        ]
      });
      alert.present();
    }, err => {
      console.error('Error on pre check order line before delivery started ', err);
      loading.dismiss();
      this.toastCtrl.create({
        message: 'خطا به هنگام بررسی موارد اسکن شده. دوباره تلاش کنید',
        duration: 2000,
      }).present();
    })



  }
}
