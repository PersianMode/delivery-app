import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, Navbar, NavParams, ToastController, LoadingController } from 'ionic-angular';
import * as moment from 'moment';
import { HttpService } from '../../services/http.service';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer';
import { Camera } from '@ionic-native/camera';
import { WarehouseService } from '../../services/warehoues.service';


@Component({
  selector: 'page-order-details',
  templateUrl: 'order-details.html',
})
export class OrderDetailsPage implements OnInit {
  @ViewChild(Navbar) navBar: Navbar;
  deliveryDetails = null;
  isDelivered = false;
  products = [];
  productIds = [];
  imagesrc;
  ticketstatus;
  tickets = [];
  orderlines=[];
  constructor(public navCtrl: NavController, private navParams: NavParams,
    private httpService: HttpService) {
  }

  ngOnInit() {
    this.navBar.setBackButtonText("بازگشت");
    this.deliveryDetails = this.navParams.data.delivery;
    this.isDelivered = this.navParams.data.is_delivered || false;
    this.deliveryDetails.order_details.forEach(element => {
      this.productIds.push(element.order_lines[0].product_id)
    })
    this.deliveryDetails.order_details.forEach(orderline => {
     this.orderlines.push(orderline)
      
    });

    console.log(this.orderlines)
    this.loadProducts(this.productIds)
  
  }

  getimagesrc(product) {
    return [HttpService.Host, HttpService.PRODUCT_IMAGE_PATH, product.id, product.colors[0].id, product.colors[0].image.thumnail].join('/');
  }


  loadProducts(productIds) {
    return new Promise((resolve) => {
      this.httpService.post('product/getMultiple', { productIds })
        .subscribe(data => {
          this.products = data;
         console.log(data);

          resolve(data);
        });
    });
  }






}
