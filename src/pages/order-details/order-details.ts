import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, Navbar, NavParams, ToastController, LoadingController} from 'ionic-angular';
import * as moment from 'moment';
import {HttpService} from '../../services/http.service';
import {FileTransferObject, FileUploadOptions} from '@ionic-native/file-transfer';
import {WarehouseService} from '../../services/warehoues.service';

@Component({
  selector: 'page-order-details',
  templateUrl: 'order-details.html',
})
export class OrderDetailsPage implements OnInit {
  @ViewChild(Navbar) navBar: Navbar;
  deliveryDetails = null;
  isDelivered = false;
  shouldGetEvidence = false;
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

  constructor(public navCtrl: NavController, private navParams: NavParams,
    private toastCtrl: ToastController, private loadingCtrl: LoadingController,
    private httpService: HttpService, private warehouseService: WarehouseService) {
  }

  ngOnInit() {
    this.navBar.setBackButtonText("بازگشت");
    this.deliveryDetails = this.navParams.data.delivery;
    this.isDelivered = this.navParams.data.is_delivered || false;
    this.shouldGetEvidence = this.navParams.data.get_evidence || false;

  }

  getAddressPart(direction, part) {

    const where = direction.toLowerCase() === 'from' ?
      (this.deliveryDetails.is_return ? 'customer' : 'warehouse') :
      (this.deliveryDetails.to.customer_id ? 'customer' : 'warehouse');


    if (where === 'customer')
      return this.deliveryDetails[direction]['customer'].address[part];

    else if (where === 'warehouse')
      return this.warehouseService.getWarehouse(this.deliveryDetails[direction]['warehouse_id']).address[part];
  }

  getDestinationName() {

    if (this.deliveryDetails.is_return) {
      return this.warehouseService.getWarehouse(this.deliveryDetails.to.warehouse_id).name;
    } else {
      if (this.deliveryDetails.to.customer_id)
        return this.deliveryDetails.to.customer.address.recipient_name + ' ' + this.deliveryDetails.to.customer.address.recipient_surname;
      else if (this.deliveryDetails.to.warehouse_id)
        return this.warehouseService.getWarehouse(this.deliveryDetails.to.warehouse_id).name;
    }
  }

  getDestinationPhone() {

    let phone;
    if (this.deliveryDetails.is_return) {
      phone = this.warehouseService.getWarehouse(this.deliveryDetails.to.warehouse_id).name;
    } else {
      if (this.deliveryDetails.to.customer_id)
        phone = this.deliveryDetails.to.customer.address.recipient_mobile_no;
      else if (this.deliveryDetails.to.warehouse_id)
        phone = this.warehouseService.getWarehouse(this.deliveryDetails.to.warehouse_id).phone;
    }

    return phone ? phone : '-';
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

  takePhoto(st) {
    if (!this.shouldGetEvidence)
      return;

    var options = {
      quality: 50,
      sourceType: st ? st : this.camera.PictureSourceType.CAMERA,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      encodingType: this.camera.EncodingType.JPEG,
      destinationType: this.camera.DestinationType.FILE_URI
    };

    this.camera.getPicture(options)
      .then(imageData => {
        const fileTransfer: FileTransferObject = this.transfer.create();

        let options: FileUploadOptions = {
          fileKey: 'file',
          fileName: 'delivered-evidence.jpeg',
          chunkedMode: false,
          mimeType: "image/jpeg",
          headers: {
            'token': this.httpService.userToken
          },
          params: {
            '_id': this.deliveryDetails._id,
            'customer_id': this.deliveryDetails.to.customer._id || this.deliveryDetails.from.customer._id,
          }
        };

        const waiting = this.loadingCtrl.create({
          content: 'در حال بارگذاری تصویر. لطفا صبر کنید ...',
        });

        waiting.present();

        fileTransfer.upload(imageData, HttpService.Host + '/api/delivery/evidence', options)
          .then((data) => {
            waiting.dismiss();
            this.toastCtrl.create({
              message: 'تصویر بارگذاری شد',
              duration: 1200,
            }).present();
          })
          .catch(err => {
            waiting.dismiss();
            this.toastCtrl.create({
              message: 'بارگذاری تصویر به خطا برخورد. دوباره تلاش کنید.',
              duration: 2000,
            }).present();
          });
      })
      .catch(err => {
        console.error('Error: ', err);
      });
  }
}
