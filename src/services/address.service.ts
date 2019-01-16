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
          return delivery[customer_lable].find(x => x._id === delivery[direction].customer.address_id);
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



}