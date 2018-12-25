import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, Navbar, NavParams} from 'ionic-angular';
import * as moment from 'moment';
import {HttpService} from '../../services/http.service';
import {WarehouseService} from '../../services/warehoues.service';
import {DELIVERY_STATUS} from '../../lib/delivery_status.enum';

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
      fa_name: 'واحد',
    },
  ]

  from_address: any;
  to_address: any;

  constructor(public navCtrl: NavController, private navParams: NavParams,
   private warehouseService: WarehouseService) {
  }

  ngOnInit() {
    try {

      this.navBar.setBackButtonText("بازگشت");
      this.delivery = this.navParams.data.delivery;

      if (this.delivery) {
        if (this.delivery.from.customer && this.delivery.from.customer._id && this.delivery.from.customer.address_id && this.delivery.from_customer) {
          this.from_address = this.delivery.from_customer.find(x => x._id === this.delivery.from.customer.address_id);

        } else if (this.delivery.to.customer && this.delivery.to.customer._id && this.delivery.to.customer.address_id && this.delivery.to_customer) {
          this.to_address = this.delivery.to_customer.find(x => x._id === this.delivery.to.customer.address_id);

        } else if (this.delivery.from.warehouse_id) {
          let warehouse = this.warehouseService.getWarehouse(this.delivery.from.warehouse_id);
          if (warehouse && warehouse.address)
            this.from_address = warehouse.address;

        } else if (this.delivery.to.warehouse_id) {
          let warehouse = this.warehouseService.getWarehouse(this.delivery.to.warehouse_id);
          if (warehouse && warehouse.address)
            this.to_address = warehouse.address;
        }
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
      console.log('-> ', err);
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

  private getConcatinatedName(name1, name2) {
    try {
      return name1 && name2 ? name1 + ' - ' + name2 : (name1 ? name1 : name2);
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

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
      return moment(this.delivery.start).format('YYYY-MM-DD HH:mm');
    } catch (err) {
      console.log('-> ', err);
    }
  }

  getExpireDateTime() {
    try {
      return moment(this.delivery.expire_date).format('YYYY-MM-DD HH:mm');
    } catch (err) {
      console.log('-> ', err);
    }
  }

  getDeliveryStartDateTime() {
    try {
      return moment(this.delivery.delivery_start).format('YYYY-MM-DD HH:mm');
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }

  getDeliveryEndDateTime() {
    try {
      return moment(this.delivery.delivery_end).format('YYYY-MM-DD HH:mm');
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

  getDeliveryType() {
    try {
      if (this.delivery.from.customer && this.delivery.form.customer._id)
        return 'بازگشت';
      else if (this.delivery.to.customer && this.delivery.to.customer._id)
        return 'ارسال به مشتری';
      else if (this.delivery.to.warehoues_id)
        return 'انتقال داخلی';
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }

 
}
