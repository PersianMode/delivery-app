import {Component, OnInit} from '@angular/core';
import {NavController, ToastController, LoadingController} from 'ionic-angular';
import {HttpService} from '../../services/http.service';
import {DELIVERY_STATUS} from '../../lib/delivery_status.enum';
import {DeliveryDetailsPage} from '../delivery-details/delivery-details';
import {WarehouseService} from '../../services/warehoues.service';
import {OrderDetailsPage} from '../order-details/order-details';
import {AddressService} from '../../services/address.service';

@Component({
  selector: 'page-history',
  templateUrl: 'history.html',
})
export class HistoryPage implements OnInit {
  deliveredItems = [];

  constructor(public navCtrl: NavController, private httpService: HttpService,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController,
    private warehouseService: WarehouseService, private addressService: AddressService) {
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

  getAddressPart(item, isReceiver = false, part) {

    try {
      let address = this.addressService.getAddress(item, isReceiver);
      return address[part].trim();
    } catch (err) {
    }
    return '-';
  }



  getName(item, isReceiver = false) {
    try {
      let sender;
      if (item.from.customer) {
        let address = this.addressService.getAddress(item, isReceiver);
        sender = this.getConcatinatedName(address.recipient_name, address.recipient_surname);
      } else if (item.from.warehouse_id)
        sender = this.warehouseService.getWarehouse(item.from.warehouse_id).name;

      return sender;
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
