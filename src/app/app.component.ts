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
    private route: ActivatedRoute
  ) {
    this.router.events
      .filter(e => e instanceof NavigationEnd)
      .forEach(e => {
        this.bIsContextInfoEnabled = this.route.root.firstChild.snapshot.data['contextInfo'] ? true : false
      })
  }

  isContextInfoEnabled(): boolean {
    return this.bIsContextInfoEnabled
  }
}
