import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
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

  signIn() {
    this.authService.promptUserLogin('/');
  }

  signOut() {
    this.authService.logout().then(() => {
      this.router.navigate(['/'])
    })
  }

  register() {
    this.authService.promptUserRegister('/');
  }

  getCurrentUserId():number {
    if (this.currentUser != undefined) {
      return this.currentUser.id
    }
  }

}
