import {Component, OnInit} from '@angular/core';
import {NavController, LoadingController, ToastController, AlertController} from 'ionic-angular';
import {HttpService} from '../../services/http.service';
import {DeliveryDetailsPage} from '../delivery-details/delivery-details';
import {CallNumber} from '@ionic-native/call-number';
import {AuthService} from '../../services/auth.service';
import {WarehouseService} from '../../services/warehoues.service';
import * as moment from 'moment';
import {FileTransfer, FileTransferObject, FileUploadOptions} from '@ionic-native/file-transfer';
import {Camera} from '@ionic-native/camera';
import {OrderDetailsPage} from '../order-details/order-details';

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
    private alertCtrl: AlertController) {
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

  getDistrict(item) {
    try {
      let to;
      if (item.to.customer)
        to = item.to_customer.find(x => x._id === item.to.customer.address_id);
      else if (item.to.warehouse_id)
        to = this.warehouseService.getWarehouse(item.to.warehouse_id).address;

      return to.district || '-';
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }

  getStreet(item) {
    try {
      let to;
      if (item.to.customer)
        to = item.to_customer.find(x => x._id === item.to.customer.address_id);
      else if (item.to.warehouse_id)
        to = this.warehouseService.getWarehouse(item.to.warehouse_id).address;

      return to.street.trim() || '-';
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';

  }

  getReceiverName(item) {
    try {
      let receiver;
      if (item.to.customer) {
        let address = item.to_customer.find(x => x._id === item.to.customer.address_id);
        receiver = this.getConcatinatedName(address.recipient_name, address.recipient_surname);
      }
      else if (item.to.warehouse_id)
        receiver = this.warehouseService.getWarehouse(item.to.warehouse_id).name;

      return receiver || '-';
    } catch (err) {
      console.log('-> ', err);
    }
    return '-';
  }

  private getConcatinatedName(name1, name2) {
    try{
      return name1 && name2 ? name1 + ' - ' + name2 : (name1 ? name1 : name2);
      
    }catch(err){
      console.log('-> ', err ); 
    }
    return '-';

  }

  getStartDate(item) {
    try{
      return moment(item.start).format('YYYY-MM-DD');
      
    }catch(err){
      console.log('-> ', err ); 
    }
    return '-';

  }
  getActualStartDate(item) {
    try{
      
      return moment(item.delivery_start).format('YYYY-MM-DD');
    }catch(err){
      console.log('-> ', err ); 
    }
    return '-';

  }

  getStartTime(item) {
    try{
      return moment(item.delivery_start).format('HH:mm');
      
    }catch(err){
      console.log('-> ', err ); 
    }
    return '-';

  }

  getDeliveryType(item) {
    try{
      if (item.from.customer && item.form.customer._id)
        return 'بازگشت';
      else if (item.to.customer && item.to.customer._id)
        return 'ارسال به مشتری';
      else if (item.to.warehouse_id)
        return 'داخلی'
      
    }catch(err){
      console.log('-> ', err ); 
    }
    return '-';
    
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
            this.httpService.post('delivery/end', {
              deliveryId: item._id,
            }).subscribe(
              data => {
                this.toastCtrl.create({
                  message: 'ارسال به پایان رسید',
                  duration: 1200,
                }).present();
                this.load();
              },
              err => {
                this.toastCtrl.create({
                  message: 'پایان ارسال با خطا مواجه شد. شاید این ارسال پیشتر به پایان یافته باشد',
                  duration: 2000,
                }).present();
              });
          }
        }
      ]
    }).present();

  }

  takePhoto(delivery) {

    var options = {
      quality: 50,
      sourceType: this.camera.PictureSourceType.CAMERA,
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
            '_id': delivery._id,
            'customer_id': delivery.to.customer._id || delivery.from.customer._id,
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
