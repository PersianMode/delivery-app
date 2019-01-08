import {Component, OnInit} from '@angular/core';
import {NavController, ToastController, LoadingController, AlertController} from 'ionic-angular';
import {HttpService} from '../../services/http.service';
import {DeliveryDetailsPage} from '../delivery-details/delivery-details';
import {AuthService} from '../../services/auth.service';
import {WarehouseService} from '../../services/warehoues.service';
import {DELIVERY_STATUS} from '../../lib/delivery_status.enum';
import {OrderDetailsPage} from '../order-details/order-details';

@Component({
  selector: 'page-external-inbox',
  templateUrl: 'external-inbox.html',
})
export class ExternalInboxPage implements OnInit {
  deliveryItems = [];

  selectedDelivery: any = null;
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
        type: "ExternalUnassignedDelivery"
      }
    }).subscribe(
      res => {
        this.deliveryItems = res.data;
        this.selectedDelivery = this.deliveryItems.find(x =>
          (x.last_ticket.status === DELIVERY_STATUS.agentSet || x.last_ticket.status === DELIVERY_STATUS.requestPackage) &&
          x.last_ticket.receiver_id === this.authService.userData.userId
        );

        if (this.selectedDelivery) {
          this.selectedDelivery.selected = true;
          this.deliveryItems.filter(x => x._id !== this.selectedDelivery._id).forEach(x => x.disabled = true);
        }
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
  }

  showOrderLineDetails(item) {
    this.navCtrl.push(OrderDetailsPage, {
      delivery: item,
    });
  }

  getSenderDistrict(item) {

    try {
      let from;
      if (item.from.customer)
        from = item.from_customer.find(x => x._id === item.from.customer.address_id);
      else if (item.from.warehouse_id)
        from = this.warehouseService.getWarehouse(item.from.warehouse_id).address;

      return from.district || '-';
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';
  }

  getSenderStreet(item) {
    try {
      let from;
      if (item.from.customer)
        from = item.from_customer.find(x => x._id === item.from.customer.address_id);
      else if (item.from.warehouse_id)
        from = this.warehouseService.getWarehouse(item.from.warehouse_id).address;

      return from.street.trim() || '-';
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }

  getSenderName(item) {
    try {
      let sender;
      if (item.from.customer) {
        let address = item.from_customer.find(x => x._id === item.from.customer.address_id);
        sender = this.getConcatinatedName(address.recipient_name, address.recipient_surname);
      } else if (item.from.warehouse_id)
        sender = this.warehouseService.getWarehouse(item.from.warehouse_id).name;

      return sender || '-';
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }


  getReceiverDistrict(item) {
    try {
      let to;
      if (item.to.customer)
        to = item.to_customer.find(x => x._id === item.to.customer.address_id);
      else if (item.to.warehouse_id)
        to = this.warehouseService.getWarehouse(item.to.warehouse_id).address;

      return to.district || '-';
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }

  getReceiverStreet(item) {
    try {
      let to;
      if (item.to.customer)
        to = item.to_customer.find(x => x._id === item.to.customer.address_id);
      else if (item.to.warehouse_id)
        to = this.warehouseService.getWarehouse(item.to.warehouse_id).address;

      return to.street.trim() || '-';
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }

  getReceiverName(item) {
    try {
      let receiver;
      if (item.to.customer) {
        let address = item.to_customer.find(x => x._id === item.to.customer.address_id);
        receiver = this.getConcatinatedName(address.recipient_name, address.recipient_surname);
      }
      else if (item.to.warehouse_id)
        receiver = this.warehouseService.getWarehouse(item.to.warehouse_id).name;

      return receiver || '-';
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }

  private getConcatinatedName(name1, name2) {
    try {
      return name1 && name2 ? name1 + ' - ' + name2 : (name1 ? name1 : name2);
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }


  getDeliveryType(item) {
    try {
      if (item.from.customer && item.form.customer._id)
        return 'بازگشت';
      else if (item.to.customer && item.to.customer._id)
        return 'ارسال به مشتری';
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }

  isDeliveryOrdersRequested(item) {
    try {
      return item.last_ticket.status === DELIVERY_STATUS.requestPackage;
    } catch (err) {
      console.log('-> ', err);
    }
    return false;

  }

  requestDeliveryOrders(del) {
    if (!this.deliveryItems.length)
      return;

    const loading = this.loadingCtrl.create({
      content: 'در حال اعمال تغیرات. لطفا صبر کنید ...'
    });

    loading.present();

    this.httpService.post('delivery/requestPackage', {
      deliveryId: del._id,
    }).subscribe(
      data => {
        loading.dismiss();
        this.toastCtrl.create({
          message: 'درخواست تحویل بسته با موفقیت انجام شد',
          duration: 2300,
        }).present();
        this.load();
      },
      err => {
        console.error('Cannot request for delivery orders: ', err.error);

        let message;
        if (err.error === 'agent has incomplete delivery')
            message = 'ارسال در حال اجرا هنوز پایان نیافته است';
        else if (err.error === 'delivery is not started yet')
          message = 'ارسال هنوز شروع نشده است';
        else
          message = 'خطا در درخواست بسته ارسالی. دوباره تلاش کنید';

        this.toastCtrl.create({
          message,
          duration: 3200,
        }).present();
        loading.dismiss();
      });
  }

  assignDelivery(delivery) {

    const loading = this.loadingCtrl.create({
      content: 'در حال اعمال تغیرات. لطفا صبر کنید ...'
    });

    loading.present();

    this.httpService.post('delivery/agent', {
      deliveryId: delivery._id
    }).subscribe(
      data => {
        loading.dismiss();
        this.toastCtrl.create({
          message: 'ارسال با موفقت انتخاب شد',
          duration: 2000,
        }).present();
        this.load();
      },
      err => {
        console.error('Error when unassign delivery from current agent: ', err);
        loading.dismiss();
        this.toastCtrl.create({
          message: 'خطا به هنگام انتخاب ارسال. دوباره تلاش کنید',
          duration: 2000,
        }).present();
      });
  }

  unassignDelivery(delivery) {

    const loading = this.loadingCtrl.create({
      content: 'در حال اعمال تغیرات. لطفا صبر کنید ...'
    });

    loading.present();

    this.httpService.post('delivery/unassign', {
      deliveryId: delivery._id
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

      let totalDeliveryOrderLines = item.order_details.map(x => x.order_line_ids);

      let canStart = false;
      if (res.length === totalDeliveryOrderLines.length) {
        message = 'everything is OK. start scan?'
        canStart = true;
      } else {
        message = `${res.length} of ${totalDeliveryOrderLines.length} is ready. start scan?`
      }
      let alert = this.alertCtrl.create({
        title: 'اعلام نتیجه اسکن',
        message,
        buttons: [
          {
            text: 'خیر',
            role: 'cancel',
            handler: () => {
            }
          },
          {
            text: 'شروع؟',
            handler: () => {
              if (canStart) {
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
              } else
                this.toastCtrl.create({
                  message: 'هنوز قادر به شروع ارسال نمی باشید',
                  duration: 2000,
                }).present();
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
