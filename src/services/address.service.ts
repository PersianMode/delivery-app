import {Injectable} from '@angular/core';
import {WarehouseService} from './warehoues.service';

@Injectable()
export class AddressService {

  constructor(private warehouseService: WarehouseService) {
  }

  getAddress(delivery, isReceiver = false) {
    try {

      const direction = isReceiver ? 'to' : 'from';

      if (delivery[direction].customer) {

        const customer_lable = `${direction}_customer`

        if (delivery[direction].customer._id && delivery[customer_lable]) {
          return delivery[customer_lable].find(x => x._id === delivery[direction].customer.address._id);
        } else if (delivery[direction].customer.address) { // guest user
          return delivery[direction].customer.address;
        }
      }

      else if (delivery[direction].warehouse_id) {
        let warehouse = this.warehouseService.getWarehouse(delivery[direction].warehouse_id);
        if (warehouse && warehouse.address)
          return warehouse.address;
      }


    } catch (err) {
    }
  }

  
  getDeliveryType(delivery) {
    try {
      if (delivery.from.customer)
        return 'بازگشت';
      else if (delivery.to.customer)
        return 'ارسال به مشتری';
      else if (delivery.to.warehouse_id)
        return 'داخلی'

    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }

  getName(item, isReceiver = false) {
    try {
      let name;

      let direction = isReceiver ? 'to' : 'from';

      if (item[direction].customer) {
        let address = this.getAddress(item, isReceiver);
        name = this.getConcatinatedName(address.recipient_name, address.recipient_surname);
      } else if (item.from.warehouse_id)
        name = this.warehouseService.getWarehouse(item.from.warehouse_id).name;

      return name;
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }
  
  public getConcatinatedName(name1, name2) {
    try {
      return name1 && name2 ? name1 + ' - ' + name2 : (name1 ? name1 : name2);

    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }


}