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

export interface FileFormElement extends DynamicFormElement {
	options: { fileTypes: string[], fileLimit: string }
}

export interface TextFormElement extends DynamicFormElement {
	options: { multiline: boolean, rows?: number, charLimit: number }
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

	addTextInput(label: string, key: string, options: { multiline: boolean, rows?: number, charLimit?: number }, defaultValue?: string, color?: string) {
		let realOptions = {
			multiline: options.multiline,
			rows: options.rows || 1,
			charLimit: options.charLimit || 500,
		}
		let elem = <TextFormElement>{
			type: "text",
			label: label,
			key: key,
			value: DynamicForm.getTextValue(defaultValue),
			color: color ? color : '',
			options: realOptions
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
			addDropdownEntry: function (key: string, label: string) {
				this.dropdownEntries[key] = label
				return this
			}
		}
		this._entries[key] = elem;

		return elem
	}

	addFileSelection(
		label: string,
		key: string,
		options: { fileTypes?: string[], fileLimit?: string },
		color?: string
	) {
		let realOptions = {
			fileTypes: options['fileTypes'] ? options['fileTypes'] : [],
			fileLimit: options['fileLimit'] ? options['fileLimit'] : [],
		}
		let elem = <FileFormElement>{
			type: "file",
			label: label,
			key: key,
			options: realOptions,
			value: '',
			color: color ? color : ''
		}
		this._entries[key] = elem;
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

	updateElementValue(key: string): any {
		if (this._entries[key] != undefined) {
			let htmlElement = <HTMLInputElement>document.getElementById("generatedFormElement-" + key)

			switch (this._entries[key].type) {
				case "text": {
					this._entries[key].value = DynamicForm.getTextValue(htmlElement.value)
					break
				}
				case "bool": {
					this._entries[key].value = DynamicForm.getBoolValue(htmlElement.value)
					break
				}
				case "label": {
					this._entries[key].value = DynamicForm.getTextValue(htmlElement.value)
					break
				}
				case "password": {
					this._entries[key].value = DynamicForm.getPasswordValue(htmlElement.value)
					break
				}
				case "dropdown": {
					this._entries[key].value = DynamicForm.getTextValue(htmlElement.value)
					break
				}
				case "file": {
					this._entries[key].value = DynamicForm.getFileValue(htmlElement.files)
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

	private static getFileValue(files: FileList): File {
		return files != undefined ? files[0] : undefined
	}

}

@Injectable()
export class UIService {
	private loginMessageSubject = new Subject<any>()
	private registerMessageSubject = new Subject<any>()
	private formMessageSubject = new Subject<any>()
	private contextMenuMessageSubject = new Subject<any>()
	private bannerURISubject = new Subject<string>()

	constructor(
		private router: Router) {
		this.router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				this.loginMessageSubject.next({ event: 'close' })
				this.registerMessageSubject.next({ event: 'close' })
				this.formMessageSubject.next({ event: 'close' })
			}
		})
	}

	promptUserLogin(onLogin?: Function, onCanceled?: Function) {
		this.loginMessageSubject.next({ event: 'open', onLogin: onLogin, onCanceled: onCanceled })
	}

	promptUserRegister(onRegister?: Function, onCanceled?: Function) {
		this.registerMessageSubject.next({ event: 'open', onRegister: onRegister, onCanceled: onCanceled })
	}

	promptForm(formContent: DynamicForm, autoClose: boolean, onSubmitted: (values: FormValues, closeForm: () => any, showError: (error: string) => any) => any, onCanceled?: (reason: any) => any) {
		this.formMessageSubject.next({
			event: 'open',
			form: formContent,
			onSubmitted: onSubmitted,
			onCanceled: onCanceled,
			autoClose: autoClose
		})
	}

	setBannerURI(bannerURI: string) {
		this.bannerURISubject.next(bannerURI)
	}

	openContextMenu() {
    this.contextMenuMessageSubject.next({
			event: 'open'
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

	getContextMenuPrompt(): Observable<any> {
		return this.contextMenuMessageSubject.asObservable();
	}

	getBannerURIObserver(): Observable<any> {
		return this.bannerURISubject.asObservable();
	}
	
}