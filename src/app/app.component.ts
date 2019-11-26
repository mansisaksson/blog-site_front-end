import { Component } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

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
