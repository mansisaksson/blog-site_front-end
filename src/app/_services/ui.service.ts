import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs/Rx';

export interface DynamicFormElement {
	type: string
	label: string
	key: string
	value: any,
	color: string
}

export interface DropdownFormElement extends DynamicFormElement {
	dropdownEntries: { [key: string]: string }
	addDropdownEntry: (key: string, label: string) => DropdownFormElement
}

export interface FormValues {
	[key: string]: any
}

export interface DynamicFormElements {
	[key: string]: DynamicFormElement
}

export class DynamicForm {
	private _entries: DynamicFormElements = {}

	constructor(
		public title: string = "Form",
		public submitText: string = "Submit") {
	}

	keys(): string[] {
		return Object.keys(this._entries)
	}

	values(): DynamicFormElement[] {
		return Object.values<DynamicFormElement>(this._entries)
	}

	entries(): DynamicFormElements {
		return this._entries
	}

	addLabel(key: string, value: string, color?: string) {
		let elem = <DynamicFormElement>{
			type: "label",
			label: value,
			key: key,
			value: value,
			color: color ? color : ''
		}
		this._entries[key] = elem;
	}

	addPasswordInput(label: string, key: string, color?: string) {
		let elem = <DynamicFormElement>{
			type: "password",
			label: label,
			key: key,
			value: '',
			color: color ? color : ''
		}
		this._entries[key] = elem;
	}

	addTextInput(label: string, key: string, defaultValue?: string, color?: string) {
		let elem = <DynamicFormElement>{
			type: "text",
			label: label,
			key: key,
			value: DynamicForm.getTextValue(defaultValue),
			color: color ? color : ''
		}
		this._entries[key] = elem;
	}

	addDropdown(label: string, key: string, defaultValue?: string, color?: string): DropdownFormElement {
		let elem = <DropdownFormElement>{
			type: "dropdown",
			label: label,
			key: key,
			value: DynamicForm.getTextValue(defaultValue),
			color: color ? color : '',
			dropdownEntries: {},
			addDropdownEntry: function(key: string, label: string) {
				this.dropdownEntries[key] = label
				return this
			}
		}
		this._entries[key] = elem;

		return elem
	}

	addBoolInput(label: string, key: string, defaultValue?: boolean, color?: string) {
		let textElem = <DynamicFormElement>{
			type: "bool",
			label: label,
			key: key,
			value: defaultValue ? defaultValue : false,
			color: color ? color : ''
		}
		this._entries[key] = textElem;
	}

	updateElementValue(key: string, value: string): any {
		if (this._entries[key] != undefined && value != undefined) {
			switch (this._entries[key].type) {
				case "text": {
					this._entries[key].value = DynamicForm.getTextValue(value)
					break;
				}
				case "bool": {
					this._entries[key].value = DynamicForm.getBoolValue(value)
					break;
				}
				case "label": {
					this._entries[key].value = value
					break;
				}
				case "password": {
					this._entries[key].value = DynamicForm.getPasswordValue(value)
					break;
				}
			}
		}

		return this._entries[key].value
	}

	private static getTextValue(value: string): string {
		return value ? value : ""
	}

	private static getPasswordValue(value: string): string {
		return value ? value : ""
	}

	private static getBoolValue(value: string): boolean {
		return value != undefined ? (value == "true" ? true : false) : false
	}

}

@Injectable()
export class UIService {
	private loginMessageSubject = new Subject<any>()
	private registerMessageSubject = new Subject<any>()
	private formMessageSubject = new Subject<any>()

	constructor(
		private router: Router) {
		router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				this.loginMessageSubject.next({ event: 'close', url: '/' })
				this.registerMessageSubject.next({ event: 'close', url: '/' })
				this.formMessageSubject.next({ event: 'close' })
			}
		})
	}

	promptUserLogin(successRoute: string, onCanceled?: Function) {
		this.loginMessageSubject.next({ event: 'open', url: successRoute, onCanceled: onCanceled })
	}

	promptUserRegister(successRoute: string) {
		this.registerMessageSubject.next({ event: 'open', url: successRoute })
	}

	promptForm(formContent: DynamicForm, autoClose: boolean, onSubmitted: (values: FormValues, closeForm: () => any, showError: (error: string) => any) => any, onCanceled?: (reason: any) => any) {
			//let onSubmitted = (values: FormValues) => { resolve(values) }
			//let onCanceled = (error) => { reject(error) }
			this.formMessageSubject.next({
				event: 'open',
				form: formContent,
				onSubmitted: onSubmitted,
				onCanceled: onCanceled,
				autoClose: autoClose
			})
	}

	getShowLoginPrompt(): Observable<any> {
		return this.loginMessageSubject.asObservable();
	}

	getShowRegisterPrompt(): Observable<any> {
		return this.registerMessageSubject.asObservable();
	}

	getFormPrompt(): Observable<any> {
		return this.formMessageSubject.asObservable();
	}
}