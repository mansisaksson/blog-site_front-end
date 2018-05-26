import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { LoginComponent } from '../login/index'
import { AuthenticationService } from '../../_services/index';
import { User } from '../../_models';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean;
  currentUser: User;

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) { 
  }
  
  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user
      this.isLoggedIn = user != undefined;
    })
  }

  signOut() {
    this.authService.logout().then(() => {
      this.router.navigate(['/'])
    })
  }

  getCurrentUserId():number {
    if (this.currentUser != undefined) {
      return this.currentUser.id
    }
  }

}
