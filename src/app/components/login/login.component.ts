import { Component, OnInit } from '@angular/core';
import { SessionService, ServerResponse } from '../../services/session.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public message:string;

  constructor(private sessionService:SessionService) {
  }

  ngOnInit() {
  }

  login(username:string, password:string) {
    this.sessionService.sendLoginRequest(username, password)
    .subscribe((data:ServerResponse) => {
      this.message = data.message;
    })
  }
}

