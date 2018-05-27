import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AlertService, UserService, AuthenticationService } from '../_services/index';
declare let $: any;

@Component({
	selector: 'app-register',
	templateUrl: 'register.component.html'
})

export class RegisterComponent implements OnDestroy {
	private subscription: Subscription;
	private model: any = {};
	private loading = false;
	private message: any;

	@ViewChild('registerModal') registerModal;

	constructor(
		private router: Router,
		private userService: UserService,
		private alertService: AlertService,
		private authenticationService: AuthenticationService
	) {
		this.authenticationService.getShowRegisterPrompt().subscribe(message => {
			this.message = message;
			if (message.event === 'open') {
				this.openModal()
			} else {
				this.closeModal()
			}
		})
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	register() {
		this.loading = true;
		this.userService.create(this.model).then(user => {
			this.alertService.success('Registration successful', true)
			this.authenticationService.login(this.model.username, this.model.username).then(() => {
				this.router.navigate([this.message.url])
				this.closeModal()
			})
		}).catch((error) => {
			this.alertService.error(error)
			this.closeModal()
		});
	}

	openModal() {
		this.loading = false;
		$(this.registerModal.nativeElement).modal('show')
	}

	closeModal() {
		this.loading = false;
		$(this.registerModal.nativeElement).modal('hide')
	}
}
