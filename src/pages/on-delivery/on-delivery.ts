import {Component, OnInit} from '@angular/core';
import {NavController, LoadingController, ToastController, AlertController} from 'ionic-angular';
import {HttpService} from '../../services/http.service';
import {DeliveryDetailsPage} from '../delivery-details/delivery-details';
import {CallNumber} from '@ionic-native/call-number';
import {WarehouseService} from '../../services/warehoues.service';
import * as moment from 'jalali-moment';
import {FileTransfer, FileTransferObject, FileUploadOptions} from '@ionic-native/file-transfer';
import {Camera} from '@ionic-native/camera';
import {OrderDetailsPage} from '../order-details/order-details';
import {AddressService} from '../../services/address.service';

@Component({
  selector: 'page-on-delivery',
  templateUrl: 'on-delivery.html',
})
export class OnDeliveryPage implements OnInit {
  deliveryItems = [];

  constructor(
    private callNumber: CallNumber, public navCtrl: NavController, private httpService: HttpService,
    private toastCtrl: ToastController, private loadingCtrl: LoadingController,
    private camera: Camera, private transfer: FileTransfer,
    private warehouseService: WarehouseService,
    private alertCtrl: AlertController, private addressService: AddressService) {
  }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.load();
  }

  load() {
    const loading = this.loadingCtrl.create({
      content: 'در حال دریافت لیست ارسال ها. لطفا صبر کنید ...'
    });

    loading.present();

    this.httpService.post('search/DeliveryTicket', {
      offset: 0,
      limit: 100,
      options: {
        type: "OnDelivery"
      }
    }).subscribe(
      res => {
        this.deliveryItems = res.data;
        loading.dismiss();
      },
      err => {
        console.error('Cannot get delivery box: ', err);
        loading.dismiss();
        this.toastCtrl.create({
          message: 'خطا در دریافت ارسال های در حال اجرا. دوباره تلاش کنید',
          duration: 3200,
        }).present();
      });
  }

  getAddressPart(item, isReceiver = false, part) {

    try {
      let address = this.addressService.getAddress(item, isReceiver);
      return address[part].trim();
    } catch (err) {
    }
    return '-';
  }

  getName(item, isReceiver = false) {
    try {
      return this.addressService.getName(item, isReceiver)

    } catch (err) {
      console.log('-> ', err);
    }
    return '-';
  }

  getStartDate(item) {
    try {
      if (item.start)

        return moment(item.start).format('jYYYY-jMM-jDD');

    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }
  getActualStartDate(item) {
    try {
      if (item.delivery_start)

        return moment(item.delivery_start).format('jYYYY-jMM-jDD');
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }

  getStartTime(item) {
    try {
      if (item.delivery_start)
        return moment(item.delivery_start).format('HH:mm');

    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }

  getTimeSlot(item) {
    try {
      return this.addressService.getTimeSlot(item);
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';
  }

  getDeliveryType(item) {
    return this.addressService.getDeliveryType(item);  
  }

  showOrderLineDetails(item) {
    this.navCtrl.push(OrderDetailsPage, {
      delivery: item,

    });
  }


  selectDelivery(item) {
    this.navCtrl.push(DeliveryDetailsPage, {
      delivery: item,
    });
  }

  callReceiver(item) {
    let phoneNumber = "";

    if (item.to.customer)
      phoneNumber = item.to.customer.address.recipient_mobile_no ? item.to.customer.address.recipient_mobile_no : '';
    else {

      phoneNumber = this.warehouseService.getWarehouse(item.to.warehouse_id).phone || '';
    }

    if (phoneNumber)
      this.callNumber.callNumber(phoneNumber, true)
        .then(res => {

        })
        .catch(err => {

        });
    else {
      this.toastCtrl.create({
        message: 'شماره ای برای تماس یافت نشد',
        duration: 2000,
      }).present();
    }
  }

  finishDelivery(item) {
    if (item.delivery_end) {
      this.toastCtrl.create({
        message: 'این ارسال مورد نظر پیشتر به پایان رسیده است.',
        duration: 2000,
      }).present();

      this.deliveryItems = this.deliveryItems.filter(el => el._id !== item._id);
      return;
    }

    this.alertCtrl.create({
      title: 'تأیید ارسال',
      message: 'آیا ارسال به پایان رسیده است؟',
      buttons: [
        {
          text: 'لغو',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'بله',
          handler: () => {

            let action = () => {
              if (item.to.customer)
                return this.takePhoto(item);
              else
                return Promise.resolve();
            }
            action()
              .then(res => {
                let waiting = this.loadingCtrl.create({
                  content: 'در حال پایان ارسال...',
                });
                this.httpService.post('delivery/end', {
                  deliveryId: item._id,
                }).subscribe(
                  data => {
                    this.toastCtrl.create({
                      message: 'ارسال به پایان رسید',
                      duration: 1200,
                    }).present();
                    waiting.dismiss();
                    this.load();
                  },
                  err => {
                    waiting.dismiss();
                    this.toastCtrl.create({
                      message: 'پایان ارسال با خطا مواجه شد',
                      duration: 2000,
                    }).present();
                  });
              }).catch(err => {
                console.error('-> ', err);
              })

          }
        }
      ]
    }).present();

  }

  async takePhoto(delivery) {
    let waiting;

    try {

      waiting = this.loadingCtrl.create({
        content: 'در حال بارگذاری تصویر. لطفا صبر کنید ...',
      });

      let options = {
        quality: 50,
        sourceType: this.camera.PictureSourceType.CAMERA,
        saveToPhotoAlbum: false,
        correctOrientation: true,
        encodingType: this.camera.EncodingType.JPEG,
        destinationType: this.camera.DestinationType.FILE_URI
      };

      let imageData = await this.camera.getPicture(options)
      const fileTransfer: FileTransferObject = this.transfer.create();

      let uploadOptions: FileUploadOptions = {
        fileKey: 'file',
        fileName: 'delivered-evidence.jpeg',
        chunkedMode: false,
        mimeType: "image/jpeg",
        headers: {
          'token': this.httpService.userToken
        },
        params: {
          '_id': delivery._id,
          'customer_id': delivery.to.customer._id || delivery.from.customer._id,
        }
      };

      waiting.present();

      await fileTransfer.upload(imageData, HttpService.Host + '/api/delivery/evidence', uploadOptions)
      waiting.dismiss();
      this.toastCtrl.create({
        message: 'تصویر بارگذاری شد',
        duration: 1200,
      }).present();
    } catch (err) {
      console.log('-> ', err);
      waiting.dismiss();
      this.toastCtrl.create({
        message: 'بارگذاری تصویر به خطا برخورد. دوباره تلاش کنید.',
        duration: 2000,
      }).present();
    }

  }
}
