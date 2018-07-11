import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, Navbar, NavParams, ToastController, LoadingController} from 'ionic-angular';
import * as moment from 'moment';
import {HttpService} from '../../services/http.service';
import {FileTransfer, FileTransferObject, FileUploadOptions} from '@ionic-native/file-transfer';
import {Camera} from '@ionic-native/camera';

@Component({
  selector: 'page-delivery-details',
  templateUrl: 'delivery-details.html',
})
export class DeliveryDetailsPage implements OnInit {
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
    private camera: Camera, private transfer: FileTransfer,
    private toastCtrl: ToastController, private loadingCtrl: LoadingController,
    private httpService: HttpService) {
  }

  ngOnInit() {
    this.navBar.setBackButtonText("بازگشت");
    this.deliveryDetails = this.navParams.data.delivery;
    this.isDelivered = this.navParams.data.is_delivered || false;
    this.shouldGetEvidence = this.navParams.data.get_evidence || false;

    console.log(this.deliveryDetails);
    console.log(this.deliveryDetails.to.customer._id || this.deliveryDetails.from.customer._id);
    
  }

  getAddressPart(direction, part) {
    const cw = direction.toLowerCase() === 'from' ?
      (this.deliveryDetails.is_return ? 'customer' : 'warehouse') :
      (Object.keys(this.deliveryDetails.to.customer).length ? 'customer' : 'warehouse');
    return this.deliveryDetails[direction][cw].address[part];
  }

  getDestinationName() {
    const tf = this.deliveryDetails.is_return ? 'from' : 'to';

    if (Object.keys(this.deliveryDetails[tf].customer).length)
      return this.deliveryDetails[tf].customer.address.recipient_name + ' ' + this.deliveryDetails[tf].customer.address.recipient_surname;
    else
      return this.deliveryDetails[tf].warehouse.name;
  }

  getDestinationPhone() {
    const tf = this.deliveryDetails.is_return ? 'from' : 'to';

    if (Object.keys(this.deliveryDetails[tf].customer).length)
      return this.deliveryDetails[tf].customer.address.recipient_mobile_no ? this.deliveryDetails[tf].customer.address.recipient_mobile_no : '';
    else
      return this.deliveryDetails[tf].warehouse.phone ? this.deliveryDetails[tf].warehouse.phone : '';
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
