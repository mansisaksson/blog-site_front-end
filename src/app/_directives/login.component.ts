import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AlertService, AuthenticationService } from '../_services';
declare let $: any;

@Component({
	selector: 'app-login',
	templateUrl: 'login.component.html'
})

export class LoginComponent implements OnDestroy {
	private subscription: Subscription;
	private model: any = {};
	private loading = false;
	private returnUrl: string;
	private message: any;

	@ViewChild('loginModal') loginModal;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private authenticationService: AuthenticationService,
		private alertService: AlertService
	) {
		this.authenticationService.getShowLoginPrompt().subscribe(message => {
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

	login() {
		this.loading = true;
		this.authenticationService.login(this.model.username, this.model.password).then(user => {
			this.router.navigate([this.message.url])
			this.closeModal()
		}).catch(error => {
			this.alertService.error(error);
			this.loading = false;
		})
	}

	openModal() {
		this.loading = false;
		$(this.loginModal.nativeElement).modal('show')
	}

	closeModal() {
		this.loading = false;
		$(this.loginModal.nativeElement).modal('hide')
	}
}
