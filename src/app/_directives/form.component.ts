import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { Subscription } from 'rxjs/Subscription'
import { AlertService } from '../_services'
import { UIService, DynamicFormElement, DynamicForm, FormValues } from '../_services/ui.service';
declare let $: any

@Component({
	selector: 'app-form',
	templateUrl: 'form.component.html'
})

export class FormComponent implements OnDestroy, OnInit {
	private subscription: Subscription
	private form: DynamicForm = new DynamicForm("Form")
	private loading = false
	private message: any
	private autoClose: boolean = true
	private error: string = ''

	@ViewChild('formModal') formModal

	constructor(
		private uiService: UIService,
		private alertService: AlertService
	) {
		this.uiService.getFormPrompt().subscribe(message => {
			if (this.message) {
				this.closeModal()
			}

			this.message = message
			if (message.event === 'open') {
				if (message.form != undefined) {
					this.form = this.message.form
					this.autoClose = this.message.autoClose != undefined ? this.message.autoClose : true
					this.openModal()
				} else {
					console.error("Tried to open invalid form")
				}
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
		this.error = ''
		if (this.message && this.message.onSubmitted) {
			let formValues: FormValues = {}
			this.form.keys().forEach(key => {
				let element = <HTMLInputElement>document.getElementById(this.generateKeyId(key))
				formValues[key] = this.form.updateElementValue(key, element.value)
			});
			let closeForm = () => {
				this.closeModal()
			}
			let showFormError = (error: string) => {
				this.loading = false
				this.error = error
			}
			this.message.onSubmitted(formValues, closeForm, showFormError)
		}

		if (this.autoClose) {
			this.closeModal()
		}
	}

	openModal() {
		this.loading = false
		this.error = ''
		$(this.formModal.nativeElement).modal('show')
	}

	closeModal() {
		this.loading = false
		this.error = ''
		$(this.formModal.nativeElement).modal('hide')
	}

	onModalClosed() {
		if (this.message && this.message.onCanceled) {
			this.message.onCanceled("Form Canceled")
		}
		this.message = undefined
	}

	generateKeyId(key: string) {
		return "generatedFormElement-" + key
	}

	getDropdownKeys(dropdownEntries: any) {
		return Object.keys(dropdownEntries)
	}

	getDropdownValue(dropdownEntries: any, key: string) {
		return dropdownEntries[key]
	}
}
