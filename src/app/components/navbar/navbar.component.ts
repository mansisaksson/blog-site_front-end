import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../_services/index';
import { Router } from '@angular/router'
import { User } from '../../_models';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser: User;

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) { 
  }

  isLoggedIn: boolean;
  ngOnInit() {
    this.authService.getIsLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    })

    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user
    })
  }

  signOut() {
    this.authService.logout().then(() => {
      this.router.navigate(['login'])
    })
  }

}
