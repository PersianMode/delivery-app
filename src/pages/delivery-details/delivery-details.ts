import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, Navbar, NavParams} from 'ionic-angular';
import * as moment from 'jalali-moment';
import {HttpService} from '../../services/http.service';
import {WarehouseService} from '../../services/warehoues.service';
import {DELIVERY_STATUS} from '../../lib/delivery_status.enum';
import {AddressService} from '../../services/address.service';

@Component({
  selector: 'page-delivery-details',
  templateUrl: 'delivery-details.html',
})
export class DeliveryDetailsPage implements OnInit {
  @ViewChild(Navbar) navBar: Navbar;
  delivery = null;
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
    {
      name: 'postal_code',
      fa_name: 'کد پستی',
    },
  ]

  from_address: any;
  to_address: any;

  constructor(public navCtrl: NavController, private navParams: NavParams,
    private warehouseService: WarehouseService,
    private addressService: AddressService) {
  }

  ngOnInit() {
    try {

      this.navBar.setBackButtonText("بازگشت");
      this.delivery = this.navParams.data.delivery;

      if (this.delivery) {
        this.from_address = this.addressService.getAddress(this.delivery, false);
        this.to_address = this.addressService.getAddress(this.delivery, true);
      }
    } catch (err) {
      console.log('-> ', err);
    }

  }

  isDelivered() {
    try {

      return this.delivery.tickets[this.delivery.tickets.length - 1].status === DELIVERY_STATUS.ended;

    } catch (err) {
      console.log('-> ', err);
    }
  }

  getAddressPart(name, from = true) {
    try {

      if (from && this.from_address)
        return this.from_address[name] ? this.from_address[name] : '-';

      if (!from && this.to_address)
        return this.to_address[name] ? this.to_address[name] : '-';

      if (from && this.delivery.from.warehouse_id) {
        let warehouse = this.warehouseService.getWarehouse(this.delivery.from.warehouse_id);
        return warehouse.address[name];
      }
      if (!from && this.delivery.to.warehouse_id) {
        let warehouse = this.warehouseService.getWarehouse(this.delivery.to.warehouse_id);
        return warehouse.address[name];
      }
    } catch (err) {
    }

    return '-';

  }

  getDestinationName() {
    try {
      if (this.delivery.to.warehouse_id)
        return this.warehouseService.getWarehouse(this.delivery.to.warehoues_id).name;
      else if (this.delivery.to.customer && this.to_address)
        return this.getConcatinatedName(this.to_address.recipient_name, this.to_address.recipient_surname);
    } catch (err) {
      console.log('-> ', err);
    }
  }


  getDestinationPhone() {
    try {
      if (this.delivery.to.warehouse_id)
        return this.warehouseService.getWarehouse(this.delivery.to.warehoues_id).phone;
      else if (this.delivery.to.customer && this.to_address)
        return this.to_address.recipient_mobile_no;
    } catch (err) {
      console.log('-> ', err);
    }

  }

  getStartDateTime() {
    try {
      if (this.delivery.start)
        return moment(this.delivery.start).format('jYYYY-jMM-jDD HH:mm');
    } catch (err) {
      console.log('-> ', err);
    }
  }

  getExpireDateTime() {
    try {
      if (this.delivery.expire_date)

        return moment(this.delivery.expire_date).format('jYYYY-jMM-jDD HH:mm');
    } catch (err) {
      console.log('-> ', err);
    }
  }

  getDeliveryStartDateTime() {
    try {
      if (this.delivery.delivery_start)

        return moment(this.delivery.delivery_start).format('jYYYY-jMM-jDD HH:mm');
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }

  getDeliveryEndDateTime() {
    try {
      if (this.delivery.delivery_end)
        return moment(this.delivery.delivery_end).format('jYYYY-jMM-jDD HH:mm');
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';
  }

  getEvidenceImage() {
    try {

      if (this.delivery.to.customer)
        return HttpService.Host + this.delivery.delivered_evidence;

    } catch (err) {
      console.log('-> ', err);
    }
  }
  getDeliveryType(item) {
    return this.addressService.getDeliveryType(item);  
  }



}
