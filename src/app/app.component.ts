import {Component, OnInit} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {LoginPage} from '../pages/login/login';
import {AuthService} from '../services/auth.service';
import {TabsPage} from '../pages/tabs/tabs';
import {WarehouseService} from '../services/warehoues.service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit {
  rootPage: any = TabsPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
    private authService: AuthService, private warehouseService: WarehouseService) {
    platform.ready().then(async () => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      try {
        await this.warehouseService.load();
        statusBar.styleDefault();
        splashScreen.hide();

      } catch (err) {
        console.log('-> ');
<<<<<<< HEAD
        throw err;
=======
>>>>>>> 5bef583b6622e0357ea7d09053c8969198c37d75
      }


    });
  }

  ngOnInit() {
    this.authService.isLoggedIn.subscribe(
      (data) => {
        this.rootPage = data ? TabsPage : LoginPage;
      }
    );
  }
}

