import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, NavParams, Navbar, ToastController, LoadingController} from 'ionic-angular';
import {File} from '@ionic-native/file';
import {FileTransfer, FileTransferObject, FileUploadOptions} from '@ionic-native/file-transfer';
// import { FilePath } from '@ionic-native/file-path';
import {Camera} from '@ionic-native/camera';
import {HttpService} from '../../services/http.service';

declare var cordova: any;

@Component({
  selector: 'page-delivered-evidence',
  templateUrl: 'delivered-evidence.html',
})
export class DeliveredEvidencePage implements OnInit {
  @ViewChild(Navbar) navBar: Navbar;
  deliveryDetails = null;
  captureDataUrl = null;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private camera: Camera, private transfer: FileTransfer,
    private toastCtrl: ToastController, private loadingCtrl: LoadingController,
    private httpService: HttpService) {
  }

  ngOnInit() {
    this.navBar.setBackButtonText("بازگشت");
    this.deliveryDetails = this.navParams.data.delivery;
  }

  browse() {
    this.takePhoto(this.camera.PictureSourceType.SAVEDPHOTOALBUM);
  }

  takePhoto(st) {
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
        this.captureDataUrl = imageData;
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
            'customer_id': this.deliveryDetails.to.customer.customer_id || this.deliveryDetails.from.customer.customer_id,
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

            this.captureDataUrl = 'done';
          })
          .catch(err => {
            waiting.dismiss();
            this.toastCtrl.create({
              message: 'بارگذاری تصویر به خطا برخورد. دوباره تلاش کنید.',
              duration: 2000,
            }).present();

            this.captureDataUrl = 'fail: ' + err;
          });
      })
      .catch(err => {
        this.captureDataUrl = 'Error: ' + err;
      });
  }
}
