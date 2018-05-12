import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable()
export class SessionService {
  private serverOutput = "";
  
  constructor(public http:HttpClient) {
  }

  sendLoginRequest(username:string, password:string): Observable<ServerResponse> {
    let loginRequest: LoginRequest = {
      username: username,
      password: password
    }
    let request = this.http.post<ServerResponse>('//localhost:80/ws/php/Scripts/login.php', loginRequest, httpOptions);
    
    request.subscribe((data:any) => {
      console.log(data)
      this.serverOutput = data.serverOutput;
    }, (errorMsg) => {
      console.log(errorMsg.error)
    })

    return request;
  }

  sendLogoutRequest(): Observable<ServerResponse> {
    let request = this.http.post<ServerResponse>('//localhost:80/ws/php/Scripts/login.php', {}, httpOptions);
    
    request.subscribe((data:any) => {
      console.log(data)
      this.serverOutput = data.serverOutput;
    }, (errorMsg) => {
      console.log(errorMsg.error)
    })

    return request;
  }

  getServerOutput():string {
    return this.serverOutput;
  }
}

export interface ServerResponse {
  success: boolean
  message: string
  payload: any
  serverOutput: string
}

export interface LoginRequest {
  username: string
  password: string
}
