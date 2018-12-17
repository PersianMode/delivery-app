import {Component} from '@angular/core';
import {NavController, ToastController} from 'ionic-angular';
import {AuthService} from '../../services/auth.service';
import {TabsPage} from '../tabs/tabs';
import {LOGIN_TYPE} from '../../lib/login_type.enum';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  username = null;
  password = null;

  lt = null;
  loginType = null;
  constructor(public navCtrl: NavController, private authService: AuthService,
    private toastCtrl: ToastController) {
  }

  ngOnInit() {
    this.lt = LOGIN_TYPE;
    this.loginType = LOGIN_TYPE.InternalDeliveryAgent
  }

  login() {

    if (!this.username || !this.password) {
      this.toastCtrl.create({
        message: 'نام کاربری و رمز عبور الزامی است',
        duration: 3200
      }).present();

      return;
    }

    this.authService.login(this.username, this.password, this.loginType)
      .then(res => {
        this.navCtrl.setRoot(TabsPage);
      })
      .catch(err => {
        this.toastCtrl.create({
          message: 'نام کاربری یا رمز عبور اشتباه است',
          duration: 3200
        }).present();
      });
  }
}
