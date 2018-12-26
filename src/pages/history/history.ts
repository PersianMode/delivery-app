import {Component, OnInit} from '@angular/core';
import {NavController, ToastController, LoadingController} from 'ionic-angular';
import {HttpService} from '../../services/http.service';
import {DELIVERY_STATUS} from '../../lib/delivery_status.enum';
import {DeliveryDetailsPage} from '../delivery-details/delivery-details';
import {WarehouseService} from '../../services/warehoues.service';
import {OrderDetailsPage} from '../order-details/order-details';

@Component({
  selector: 'page-history',
  templateUrl: 'history.html',
})
export class HistoryPage implements OnInit {
  deliveredItems = [];

  constructor(public navCtrl: NavController, private httpService: HttpService,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController,
    private warehouseService: WarehouseService) {
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.load();
  }

  load() {
    const loading = this.loadingCtrl.create({
      content: 'در حال دریافت لیست ارسال های گذشته. لطفا صبر کنید ...'
    });

    loading.present();

    this.httpService.post('search/DeliveryTicket', {
      offset: 0,
      limit: 100,
      options: {
        type: "AgentFinishedDelivery"
      }
    }).subscribe(
      res => {
        this.deliveredItems = res.data;
        loading.dismiss();
      },
      err => {
        console.error('Cannot get delivery box: ', err);
        loading.dismiss();
        this.toastCtrl.create({
          message: 'خطا در دریافت ارسال های گذشته. دوباره تلاش کنید',
          duration: 3200,
        }).present();
      });
  }

  getDistrict(item) {
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

  getStreet(item) {
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

  showOrderLineDetails(item) {
    this.navCtrl.push(OrderDetailsPage, {
      delivery: item,
    });
  }

  selectDelivery(item) {

    this.navCtrl.push(DeliveryDetailsPage, {
      delivery: item,
      is_delivered: false,
    });
  }

}
