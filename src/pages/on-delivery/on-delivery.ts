import {Component, OnInit} from '@angular/core';
import {NavController, LoadingController, ToastController} from 'ionic-angular';
import {HttpService} from '../../services/http.service';
import {DELIVERY_STATUS} from '../../lib/delivery_status.enum';
import {DeliveryDetailsPage} from '../delivery-details/delivery-details';
import {DeliveredEvidencePage} from '../delivered-evidence/delivered-evidence';
import {CallNumber} from '@ionic-native/call-number';

@Component({
  selector: 'page-on-delivery',
  templateUrl: 'on-delivery.html',
})
export class OnDeliveryPage implements OnInit {
  deliveryItems = [];

  constructor(public navCtrl: NavController, private httpService: HttpService,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController,
    private callNumber: CallNumber) {
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
      delivery_status: DELIVERY_STATUS.OnDelivery,
      is_delivered: false,
    }).subscribe(
      data => {
        this.deliveryItems = data;
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

  deliveryDetails(item) {
    this.navCtrl.push(DeliveryDetailsPage, {
      delivery: item,
    });
  }

  setEvidence(item) {
    this.navCtrl.push(DeliveredEvidencePage, {
      delivery: item,
      is_delivered: false,
    });
  }

  callReceiver(item) {
    const tf = item.is_return ? 'from' : 'to';
    let phoneNumber = "";

    if (Object.keys(item[tf].customer).length)
      phoneNumber = item[tf].customer.address.recipient_mobile_no ? item[tf].customer.address.recipient_mobile_no : '';
    else
      phoneNumber = item[tf].warehouse.phone ? item[tf].warehouse.phone : '';

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
}
