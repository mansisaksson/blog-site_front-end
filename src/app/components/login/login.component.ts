import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../services/session.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private sessionService:SessionService) {

  }

  ngOnInit() {

  }

  login(username:string, password:string) {
    this.sessionService.sendLoginRequest(username, password)
    .subscribe((data:any) => {
      console.log(data)
    }, (errorMsg) => {
      console.log(errorMsg.error)
    })
  }
}

