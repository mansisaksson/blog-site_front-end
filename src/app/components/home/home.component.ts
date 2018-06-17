import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../_models/index';
import { UserService, AuthenticationService } from '../../_services/index';

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {
    currentUser: User;
    users: User[];
    isLoggedIn: boolean;

    constructor(
        private userService: UserService,
        private authService: AuthenticationService) {
    }

    ngOnInit() {
        this.authService.getCurrentUser().subscribe(user => {
            this.currentUser = user
            this.isLoggedIn = user ? true : false;

            if (this.isLoggedIn)
                this.loadAllUsers();
        })
    }

    deleteUser(id: string) {
        this.userService.delete(id).then(() => { this.loadAllUsers() });
    }

    private loadAllUsers() {
        this.userService.getAll().then(users => { this.users = users; });
    }
}