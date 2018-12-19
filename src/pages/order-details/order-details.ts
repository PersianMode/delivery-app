import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, Navbar, NavParams } from 'ionic-angular';
import { HttpService } from '../../services/http.service';
import {imagePathFixer} from '../../lib/imagePathFixer';


@Component({
  selector: 'page-order-details',
  templateUrl: 'order-details.html',
})
export class OrderDetailsPage implements OnInit {
  @ViewChild(Navbar) navBar: Navbar;
  deliveryDetails = null;
  isDelivered = false;
  products = [];
  productdata = [];
  imagesrc;
  orderlines = [];
  productIds = [];
orderStatus={};
  constructor(public navCtrl: NavController, private navParams: NavParams,
    private httpService: HttpService) {
  }
  ngOnInit() {
    this.navBar.setBackButtonText("بازگشت");
    this.deliveryDetails = this.navParams.data.delivery;
    this.isDelivered = this.navParams.data.is_delivered || false;
    this.deliveryDetails.order_details.forEach(element => {
       for (let i=0;i<element.order_lines.length;i++)
       { this.productIds.push(element.order_lines[i].product_id)};
      this.productdata.push({
        productId: element.order_lines[0].product_id,
        productTicket: element.order_lines[0].tickets[element.order_lines[0].tickets.length - 1]
      })
    })
this.orderStatus= this.deliveryDetails.last_ticket


    this.deliveryDetails.order_details.forEach(orderline => {
      this.orderlines.push(orderline)

    });
    console.log('>>>>>>>',this.productIds);
    
    this.loadProducts(this.productIds)



  }
  
  getimagesrc(product) {
    return imagePathFixer(product.colors[0].image.thunail,product._id, product.colors[0]._id)
  }


  loadProducts(productIds) {
    return new Promise((resolve) => {
      this.httpService.post('product/getMultiple', { productIds })
        .subscribe(data => {
          this.products = data;
          this.productdata.forEach(el => {
            this.products.filter(p => p._id == el.productId)[0].ticket = el.productTicket
          })
          console.log(this.products);
          


        });
    });
  }




}
