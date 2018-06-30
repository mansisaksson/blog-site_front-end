import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs/Rx';

export interface DynamicFormElement {
	type: string
	label: string
	key: string
	value: any
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

	addTextInput(label: string, key: string, defaultValue?: string) {
		let textElem = <DynamicFormElement>{
			type: "text",
			label: label,
			key: key,
			value: DynamicForm.getTextValue(defaultValue)
		}
		this._entries[key] = textElem;
	}

	addBoolInput(label: string, key: string, defaultValue?: boolean) {
		let textElem = <DynamicFormElement>{
			type: "bool",
			label: label,
			key: key,
			value: DynamicForm.getBoolValue(defaultValue)
		}
		this._entries[key] = textElem;
	}

	updateElementValue(key: string, value: any) {
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
			}
		}
	}

	private static getTextValue(value: any): string {
		return value ? value : ""
	}

	private static getBoolValue(value: any): string {
		return value != undefined ? (value ? "true" : "false") : "false"
	}
}

@Injectable()
export class UIService {
	private loginMessageSubject = new Subject<any>();
	private registerMessageSubject = new Subject<any>();
	private formMessageSubject = new Subject<any>();

	constructor(
		private router: Router) {
		router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				this.loginMessageSubject.next({ event: 'close', url: '/' });
				this.registerMessageSubject.next({ event: 'close', url: '/' });
				this.formMessageSubject.next({ event: 'close', url: '/' });
			}
		})
	}


	promptUserLogin(successRoute: string, onCanceled?: Function) {
		this.loginMessageSubject.next({ event: 'open', url: successRoute, onCanceled: onCanceled })
	}

	promptUserRegister(successRoute: string) {
		this.registerMessageSubject.next({ event: 'open', url: successRoute })
	}

	promptForm(successRoute: string, formContent: DynamicForm): Promise<DynamicFormElements> {
		return new Promise<DynamicFormElements>((resolve, reject) => {
			let onSubmitted = (elements: DynamicFormElements) => { resolve(elements) }
			let onCanceled = (error) => { reject(error) }
			this.formMessageSubject.next({
				event: 'open',
				url: successRoute,
				form: formContent,
				onSubmitted: onSubmitted,
				onCanceled: onCanceled
			})
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