import { Component, OnInit } from '@angular/core'
import { User } from '../../_models/index'
import { UserService, AuthenticationService, AlertService } from '../../_services/index'

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {
  currentUser: User
  users: User[]
  isLoggedIn: boolean

  constructor(
    private authService: AuthenticationService) {
  }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user
      this.isLoggedIn = user ? true : false
    })
  }

}