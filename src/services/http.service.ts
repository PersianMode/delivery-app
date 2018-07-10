import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import "rxjs/add/operator/map";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable()
export class HttpService {
  // public static Host = 'http://bankofstyle.com';
  // serverAddress: string = 'http://bankofstyle.com/api/';
  public static Host = 'http://192.168.8.148:3000';
  serverAddress: string = 'http://192.168.8.148:3000/api/';

  userToken = null;

  constructor(private http: HttpClient) {

  }

  get(url: any): Observable<any> {
    let headers: any = new HttpHeaders();
    if (this.userToken)
      headers = headers.append('token', this.userToken);

    return this.http.get(this.serverAddress + url, {observe: 'response', headers: headers}).map(data => data.body);
  }

  put(url: any, values: any): Observable<any> {
    let headers: any = new HttpHeaders();
    if (this.userToken)
      headers = headers.append('token', this.userToken);

    return this.http.put(this.serverAddress + url, values, {
      observe: 'response',
      headers: headers,
    }).map(data => data.body);
  }

  post(url: any, values: any): Observable<any> {
    let headers: any = new HttpHeaders();
    if (this.userToken)
      headers = headers.append('token', this.userToken);

    return this.http.post(this.serverAddress + url, values, {
      observe: 'response',
      headers: headers,
    }).map(data => data.body);
  }

  delete(url: any): Observable<any> {
    let headers: any = new HttpHeaders();
    if (this.userToken)
      headers = headers.append('token', this.userToken);

    return this.http.delete(this.serverAddress + url, {observe: 'response', headers: headers}).map(data => data.body);
  }

  static addHost(url) {
    return url.includes(HttpService.Host) ? url : HttpService.Host + url;
  }
}