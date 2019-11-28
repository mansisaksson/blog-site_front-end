import { Component, OnInit } from '@angular/core'
import { AuthenticationService, UIService } from '../../_services/index'
import { User } from '../../_models'
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean;
  currentUser: User = new User()
  faAlignLeft = faAlignLeft

  constructor(
    private authService: AuthenticationService,
    private uiService: UIService
  ) { 
  }
  
  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user
      this.isLoggedIn = user != undefined;
    })
  }

  signIn() {
    let onLogin = function() {
      location.reload()
    }
    this.uiService.promptUserLogin(onLogin)
  }

  signOut() {
    this.authService.logout().then(() => {
      location.reload()
    })
  }

  register() {
    let onRegister = function() {
      location.reload()
    }
    this.uiService.promptUserRegister(onRegister);
  }

  getCurrentUserId(): string {
    if (this.currentUser != undefined) {
      return this.currentUser.id
    }
  }

  openContextMenu() {
    this.uiService.openContextMenu()
  }

}
