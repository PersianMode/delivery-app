import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, Navbar, NavParams} from 'ionic-angular';
import * as moment from 'moment';
import {HttpService} from '../../services/http.service';

@Component({
  selector: 'page-delivery-details',
  templateUrl: 'delivery-details.html',
})
export class DeliveryDetailsPage implements OnInit {
  @ViewChild(Navbar) navBar: Navbar;
  deliveryDetails = null;
  isDelivered = false;
  address_parts = [
    {
      name: 'province',
      fa_name: 'استان',
    },
    {
      name: 'city',
      fa_name: 'شهر',
    },
    {
      name: 'district',
      fa_name: 'منطقه',
    },
    {
      name: 'street',
      fa_name: 'خیابان',
    },
    {
      name: 'no',
      fa_name: 'پلاک',
    },
    {
      name: 'unit',
      fa_name: 'واحد',
    },
  ]

  constructor(public navCtrl: NavController, private navParams: NavParams) {
  }

  ngOnInit() {
    this.navBar.setBackButtonText("بازگشت");
    this.deliveryDetails = this.navParams.data.delivery;
    this.isDelivered = this.navParams.data.is_delivered || false;
  }

  getAddressPart(direction, part) {
    const cw = direction.toLowerCase() === 'from' ?
      (this.deliveryDetails.is_return ? 'customer' : 'warehouse') :
      (Object.keys(this.deliveryDetails.to.customer).length ? 'customer' : 'warehouse');
    return this.deliveryDetails[direction][cw].address[part];
  }

  getDestinationName() {
    const tf = this.deliveryDetails.is_return ? 'from' : 'to';

    if (Object.keys(this.deliveryDetails[tf].customer).length)
      return this.deliveryDetails[tf].customer.address.recipient_name + ' ' + this.deliveryDetails[tf].customer.address.recipient_surname;
    else
      return this.deliveryDetails[tf].warehouse.name;
  }

  getDestinationPhone() {
    const tf = this.deliveryDetails.is_return ? 'from' : 'to';

    if (Object.keys(this.deliveryDetails[tf].customer).length)
      return this.deliveryDetails[tf].customer.address.recipient_mobile_no ? this.deliveryDetails[tf].customer.address.recipient_mobile_no : '';
    else
      return this.deliveryDetails[tf].warehouse.phone ? this.deliveryDetails[tf].warehouse.phone : '';
  }

  getStartDateTime() {
    return moment(this.deliveryDetails.start).format('YYYY-MM-DD HH:mm');
  }

  getEndDateTime() {
    return moment(this.deliveryDetails.end).format('YYYY-MM-DD HH:mm');
  }

  getDeliveryStartDateTime() {
    return moment(this.deliveryDetails.delivery_start).format('YYYY-MM-DD HH:mm');
  }

  getDeliveryEndDateTime() {
    return moment(this.deliveryDetails.delivery_end).format('YYYY-MM-DD HH:mm');
  }

  getEvidenceImage() {
    return HttpService.Host + this.deliveryDetails.delivered_evidence;
  }
}
