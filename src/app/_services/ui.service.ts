import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs/Rx';
import { toPromise } from 'rxjs/operator/toPromise'
import { User } from '../_models/index'
import 'rxjs/add/operator/map'

@Injectable()
export class UIService {
	private loginMessageSubject = new Subject<any>();
	private registerMessageSubject = new Subject<any>();
	private formMessageSubject = new Subject<any>();

	constructor(
		private http: HttpClient,
		private router: Router) {
		router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				this.loginMessageSubject.next({ event: 'close', url: '/' });
				this.registerMessageSubject.next({ event: 'close', url: '/' });
				this.formMessageSubject.next({ event: 'close', url: '/' });
			}
		})
	}


	promptUserLogin(successRoute: string, onCanceled?) {
		this.loginMessageSubject.next({ event: 'open', url: successRoute, onCanceled: onCanceled })
	}

	promptUserRegister(successRoute: string) {
		this.registerMessageSubject.next({ event: 'open', url: successRoute })
	}

	promptForm(successRoute: string) {
		this.formMessageSubject.next({ event: 'open', url: successRoute })
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