import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { AuthenticationService, UIService } from '../../_services/index';
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
    private uiService: UIService,
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
    this.uiService.promptUserLogin('/');
  }

  signOut() {
    this.authService.logout().then(() => {
      this.router.navigate(['/'])
    })
  }

  register() {
    this.uiService.promptUserRegister('/');
  }

  getCurrentUserId(): string {
    if (this.currentUser != undefined) {
      return this.currentUser.id
    }
  }

}
