import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { Subscription } from 'rxjs/Subscription'
import { UIService, DynamicForm, FormValues } from '../_services/ui.service';
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
		private uiService: UIService
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
				formValues[key] = this.form.updateElementValue(key)
			})
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

	getAcceptedFiles(files: string[]) {
		let result = ''
		files.forEach(s => {
			result += s + ','
		})
		if (result.length > 0) {
			result = result.slice(0, result.length - 1)
		}
		return result;
	}

	selectDropdownValue(dropdownKey: string, valueKey: string) {
		let htmlElement = <HTMLInputElement>document.getElementById(dropdownKey)
		if (htmlElement) {
			htmlElement.value = valueKey
			this.form.updateElementValue(dropdownKey)
		}
	}
}
