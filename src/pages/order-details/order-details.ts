import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, Navbar, NavParams } from 'ionic-angular';
import { HttpService } from '../../services/http.service';
import { imagePathFixer } from '../../lib/imagePathFixer';


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
  orderStatus = {};
  constructor(public navCtrl: NavController, private navParams: NavParams,
    private httpService: HttpService) {
  }
  ngOnInit() {
    this.navBar.setBackButtonText("بازگشت");
    this.deliveryDetails = this.navParams.data.delivery;
    this.isDelivered = this.navParams.data.is_delivered || false;
     this.productdata = this.deliveryDetails.order_details.flatMap(each => each.order_lines).map(each => {
      return {
        productId: each.product_id,
        productTicket: each.tickets[each.tickets.length - 1]
      }
    })

    this.productIds = this.deliveryDetails.order_details.flatMap(each => each.order_lines).map(each => each.product_id)

    this.orderStatus = this.deliveryDetails.last_ticket


    this.deliveryDetails.order_details.forEach(orderline => {
      this.orderlines.push(orderline)

    });

    console.log('>>>>>>>', this.productIds);

    this.loadProducts(this.productIds)



  }

  getimagesrc(product) {
    return imagePathFixer(product.colors[0].image.thunail, product._id, product.colors[0]._id)
  }


  loadProducts(productIds) {
    return new Promise((resolve) => {
      this.httpService.post('product/getMultiple', { productIds })
        .subscribe(data => {
          this.productIds.forEach((element) => {
            this.products.push(data.find(one => one._id == element));
          });
          this.productdata.forEach(el => {
            this.products.filter(p => p._id == el.productId)[0].ticket = el.productTicket
          })
          console.log(this.products);



        });
    });
  }




}
