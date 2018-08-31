import { Component, OnInit } from '@angular/core';
import { User } from '../../_models';
import { AuthenticationService } from '../../_services';

@Component({
  selector: 'edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  private user: User = new User()

  constructor(private authService: AuthenticationService) {

  }
  
  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
    })
  }

  getCurrentUserId() {

  }

}
