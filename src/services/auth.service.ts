import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {HttpService} from './http.service';
import {Storage} from '@ionic/storage';
import {ReplaySubject} from 'rxjs/ReplaySubject';

@Injectable()
export class AuthService {
  user: ReplaySubject<any> = new ReplaySubject<any>();
  isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  userData = {
    userId: null,
    username: null,
    name: null,
    surname: null,
    mobile_no: null,
    access_level: null
  };

  constructor(private httpService: HttpService, private storage: Storage) {
    this.loadUserBasicData()
      .then(data => {
        if (data)
          this.httpService.get('agent/validUser').subscribe(
            res => {
              this.isLoggedIn.next(true);
            },
            err => {
              console.error('Cannot check user validation: ', err);
              this.isLoggedIn.next(false);
            });
        else
          this.isLoggedIn.next(false);
      })
      .catch(err => {
        console.error('Error: ', err);
      });
  }

  loadUserBasicData() {
    return new Promise((resolve, reject) => {
      this.storage.get('user')
        .then(data => {
          if (data) {
            this.httpService.userToken = data.token;
            delete data.token;
            this.setUserData(data);
            this.user.next(data);
          }

          resolve(data);
        })
        .catch(err => {
          this.user.next(null);
          console.error('Error when loading user data from storage: ', err);
          reject();
        })
    });
  }

  setUserData(data) {
    this.userData = {
      userId: data._id,
      username: data.username,
      name: data.name,
      surname: data.surname,
      mobile_no: data.mobile_no,
      access_level: data.access_level
    };
  }

  saveUserData(user) {
    this.storage.set('user', user);
  }

  removeUser() {
    this.storage.remove('user');
    this.user.next(null);
  }

  login(username, password, loginType) {
    return new Promise((resolve, reject) => {
      this.httpService.post('app/agent/login', {
        username: username,
        password: password,
        loginType,
      }).subscribe(
        res => {
          this.afterLogin(res);
          resolve();
        },
        err => {
          console.error('Cannot login. Error: ', err);
          this.isLoggedIn.next(false);
          reject(err);
        });
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      this.httpService.get('logout').subscribe(
        res => {
          this.removeUser();
          this.httpService.userToken = null;
          this.isLoggedIn.next(false);
          resolve();
        },
        err => {
          console.error('Cannot logout: ', err);
          reject();
        });
    });
  }

  afterLogin(data) {
    this.httpService.userToken = data.token;
    this.isLoggedIn.next(true);
    this.setUserData(data);
    this.saveUserData(data);
  }
}