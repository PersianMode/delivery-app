import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, Navbar, NavParams } from 'ionic-angular';
import { HttpService } from '../../services/http.service';
import { imagePathFixer } from '../../lib/imagePathFixer';
import {ORDER_LINE_STATUS}from '../../lib/order_line_status.enum'
import {DELIVERY_STATUS}from '../../lib/delivery_status.enum'

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
  productIds = [];
  orderStatus = {};
  orderlinestatus = ORDER_LINE_STATUS
  deliverystatus = DELIVERY_STATUS
  constructor(public navCtrl: NavController, private navParams: NavParams,
    private httpService: HttpService) {
  }
  ngOnInit() { 
    this.navBar.setBackButtonText("بازگشت");
    this.deliveryDetails = this.navParams.data.delivery;
     this.productdata = this.deliveryDetails.order_details.flatMap(each => each.order_lines).map(each => {
      return {
        productId: each.product_id,
        productTicket: each.tickets[each.tickets.length - 1]
      }
    })
    this.productIds = this.deliveryDetails.order_details.flatMap(each => each.order_lines).map(each => each.product_id)
    this.orderStatus = this.deliveryDetails.last_ticket
    this.loadProducts(this.productIds)
  }

  getimagesrc(product) {
    return imagePathFixer(product.colors[0].image.thumbnail, product._id, product.colors[0]._id)
  }

  loadProducts(productIds) {
    return new Promise((resolve) => {
      this.httpService.post('product/getMultiple', { productIds })
        .subscribe(data => {
          this.productIds.forEach((element) => { 
            this.products.push(JSON.parse(JSON.stringify(data.find(one => one._id == element)))); 
          });
          this.productdata.forEach(el => {
            this.products.filter(p => p._id == el.productId && !p.ticket)[0].ticket = el.productTicket
          })
        });
    });
  }
}
