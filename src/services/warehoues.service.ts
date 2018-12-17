import {Injectable} from '@angular/core';
import {HttpService} from './http.service';

@Injectable()
export class WarehouseService {
  warehouses: any[];
  constructor(private httpService: HttpService) {
  }



  load() {
    return new Promise((resolve, reject) => {
      this.httpService.get('warehouse/all').subscribe(res => {

        this.warehouses = res;
        resolve();
      }, err => {
        reject(err);
      })
    })
  }

  getWarehouse(id) {
    return this.warehouses.find(x => x._id === id);
  }


}