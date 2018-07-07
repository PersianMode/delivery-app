import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage implements OnInit{
  user = null;

  constructor(public navCtrl: NavController, private authService: AuthService) {
  }

  ngOnInit() {
    this.user = this.authService.userData;
    if (this.user && !this.user.imgUrl)
      this.user.imgUrl = 'assets/imgs/default-user.png';

    this.user.fullName = this.user.name + ' ' + this.user.surname;
  }

  logout(){
    this.authService.logout();
  }
}
