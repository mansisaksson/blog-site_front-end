import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class SessionService {

  constructor(public http:HttpClient) {
    
  }

  sendLoginRequest(username:string, password:string): Observable<GenericServerResponse> {
    let loginRequest: LoginRequest = {
      username: username,
      password: password
    }
    return this.http.get<GenericServerResponse>('//localhost:80/ws/php/Scripts/login.php');
  }

  sendLogoutRequest() {
    return this.http.get('//todo')
  }
}

interface GenericServerResponse {
  message: string
  serverOutput: string
}

interface LoginRequest {
  username: string
  password: string
}
