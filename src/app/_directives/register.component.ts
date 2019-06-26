import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AlertService, UserService, AuthenticationService, UIService } from '../_services/index';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { environment } from '../../environments/environment';
declare let $: any;

@Component({
	selector: 'app-register',
	templateUrl: 'register.component.html'
})

export class RegisterComponent implements OnDestroy, OnInit {
	private registerForm: FormGroup
	private submitted = false
	private loading = false

	private subscription: Subscription;
	private message: any;

	@ViewChild('registerModal', { static: true }) registerModal;

	constructor(
		private router: Router,
		private userService: UserService,
		private alertService: AlertService,
		private formBuilder: FormBuilder,
		private authenticationService: AuthenticationService,
		private uiService: UIService
	) {
		this.uiService.getShowRegisterPrompt().subscribe(message => {
			this.message = message;
			if (message.event === 'open') {
				this.openModal()
			} else {
				this.closeModal()
			}
		})
	}

	ngOnInit() {
		this.registerForm = this.formBuilder.group({
      userName: ['', [Validators.required, Validators.pattern(environment.userNameRegex)]],
      password: ['', [Validators.pattern(environment.userPasswordRegex)]],
			confirmPassword: [''],
			registrationKey: ['']
    }, {
      validator: RegisterComponent.MatchPassword
    })
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	static MatchPassword(AC: AbstractControl) {
    let password = AC.get('password').value
    let confirmPassword = AC.get('confirmPassword').value
    if (password != confirmPassword) {
      AC.get('confirmPassword').setErrors({ MatchPassword: true })
    } else {
      AC.get('confirmPassword').setErrors(undefined)
      return null
    }
  }

	register() {
		this.submitted = true

    if (this.registerForm.invalid) {
      return
    }

    let userName = this.registerForm.get('userName').value
		let password = this.registerForm.get('password').value
		let registrationKey = this.registerForm.get('registrationKey').value
    
		this.userService.createUser(userName, password, registrationKey).then(user => {
			this.alertService.success('Registration successful', true)
			this.authenticationService.login(userName, password).then(() => {
				if (this.message && this.message.onRegister) {
					this.message.onRegister()
				}
				this.closeModal()
			}).catch(error => {
				this.alertService.error(error)
				this.closeModal()
			})
		}).catch((error) => {
			this.alertService.error(error)
			this.closeModal()
		});
	}

	// convenience getter for easy access to form fields
	get f() { return this.registerForm.controls }

	openModal() {
		this.submitted = false
		this.loading = false
		$(this.registerModal.nativeElement).modal('show')
	}

	closeModal() {
		this.submitted = false
		this.loading = false
		$(this.registerModal.nativeElement).modal('hide')
	}
}
