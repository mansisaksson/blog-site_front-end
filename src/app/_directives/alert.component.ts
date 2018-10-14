import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AlertService } from '../_services/index';

@Component({
	selector: 'app-alert',
	templateUrl: 'alert.component.html'
})

export class AlertComponent implements OnDestroy {
	private subscription: Subscription;
	private messages: { [key: string]: any } = {}

	constructor(private alertService: AlertService) {
		// subscribe to alert messages
		this.subscription = alertService.getMessage().subscribe(message => {
			if (message) {
				let key = this.makeid()
				message["key"] = key
				this.messages[key] = message
				setTimeout(() => {
					this.removeMessage(key)
				}, 8000)
			}
		})
	}

	private makeid() {
		var text = ""
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

		for (var i = 0; i < 5; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length))

		return text
	}

	public getMessages(): any[] {
		if (!this.messages)
			return []

		return Object.values(this.messages)
	}

	public removeMessage(key) {
		delete this.messages[key]
	}

	ngOnDestroy(): void {
		// unsubscribe on destroy to prevent memory leaks
		this.subscription.unsubscribe()
	}
}