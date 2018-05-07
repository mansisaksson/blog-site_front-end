import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable()
export class SessionService {

  constructor(public http:HttpClient) {
    
  }

  sendLoginRequest(username:string, password:string) {
    return this.http.get('//localhost:80/ws/php/Scripts/login.php');
  }

  sendLogoutRequest() {
    return this.http.get('//todo');
  }
}

interface GenericServerResponse {
  message: string;
  logs: string[];
}

interface LoginRequest {
  username: string;
  password: string;
}
