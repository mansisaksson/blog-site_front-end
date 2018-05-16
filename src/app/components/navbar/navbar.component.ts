import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../_services/index';
import { Router } from '@angular/router'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) 
  { }

  isLoggedIn: boolean;
  ngOnInit() {
    this.authService.getIsLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    })

  }

  signOut() {
    this.authService.logout().then(() => {
      this.router.navigate(['login'])
    })
  }

}
