import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs/Subscription'
import { AlertService } from '../_services'
import { UIService } from '../_services/ui.service';
declare let $: any

@Component({
	selector: 'app-form',
	templateUrl: 'form.component.html'
})

export class FormComponent implements OnDestroy, OnInit {
	private subscription: Subscription
	private model: any = {}
	private loading = false
	private returnUrl: string
	private message: any

	@ViewChild('formModal') formModal

	constructor(
		private router: Router,
		private uiService: UIService,
		private alertService: AlertService
	) {
		this.uiService.getFormPrompt().subscribe(message => {
			if (this.message) {
				this.closeModal()
			}

			this.message = message
			if (message.event === 'open') {
				this.openModal()
			}
		})
	}

	ngOnInit(): void {
		$(this.formModal.nativeElement).on('hidden.bs.modal', () => {
			this.onModalClosed()
		})
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe()
	}

	submit() {
		this.loading = true
		// this.authenticationService.login(this.model.username, this.model.password).then(user => {
		// 	if (this.message && this.message.url) {
		// 		this.router.navigate([this.message.url])
		// 		this.message = undefined
		// 	}
		// 	this.closeModal()
		// }).catch(error => {
		// 	this.alertService.error(error)
		// 	this.loading = false
		// })
	}

	openModal() {
		this.loading = false
		$(this.formModal.nativeElement).modal('show')
	}

	closeModal() {
		this.loading = false
		$(this.formModal.nativeElement).modal('hide')
	}

	onModalClosed() {
		if (this.message && this.message.onCanceled) {
			this.message.onCanceled()
		}
		this.message = undefined
	}
}
