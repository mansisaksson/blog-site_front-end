import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, Event, ActivatedRoute } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private bIsContextInfoEnabled: boolean = false

  constructor(
    private router: Router,
    private route: ActivatedRoute) {
    router.events
      .filter(e => e instanceof NavigationEnd)
      .forEach(e => {
        this.bIsContextInfoEnabled = route.root.firstChild.snapshot.data['contextInfo'] ? true : false
      })
  }

  isContextInfoEnabled(): boolean {
    return this.bIsContextInfoEnabled
  }
}
