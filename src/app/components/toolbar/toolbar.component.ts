import {
  Component,
  OnInit,
  OnDestroy,
  ViewContainerRef,
  ViewChild,
  ComponentRef,
  ComponentFactoryResolver,
  ComponentFactory,
  Type
} from '@angular/core';

import { Router, ActivatedRouteSnapshot, Event, NavigationEnd } from '@angular/router'
import { ISubscription } from 'rxjs/Subscription'
import { unescapeIdentifier } from '@angular/compiler';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent  implements OnInit, OnDestroy {
  @ViewChild("toolbarTarget", { read: ViewContainerRef })
  toolbarTarget: ViewContainerRef

  toolbarComponent: ComponentRef<Component>
  routerEventSubscription: ISubscription

  constructor(private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver) {

  }

  ngOnInit() {
    this.routerEventSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.updateContent(this.router.routerState.snapshot.root)
      }
    })
  }

  ngOnDestroy(): void {
    this.routerEventSubscription.unsubscribe()
  }

  private updateContent(snapshot: ActivatedRouteSnapshot): void {
    this.clearSidebar()
    let toolbar: any = (snapshot.data as { toolbar: Component }).toolbar

    if (toolbar != undefined) {
      let factory: ComponentFactory<Component> = this.componentFactoryResolver.resolveComponentFactory(toolbar)
      let componentRef: ComponentRef<Component> = this.toolbarTarget.createComponent(factory)
      this.toolbarComponent = componentRef
    }

    for (let childSnapshot of snapshot.children) {
      this.updateContent(childSnapshot)
    }
  }

  private clearSidebar() {
    if (this.toolbarComponent) {
      this.toolbarComponent.destroy()
    }
    if (this.toolbarTarget) {
      this.toolbarTarget.clear()
    }
    this.toolbarComponent = undefined
  }

  isEnabled(): boolean {
    return this.toolbarComponent ? true : false
  }
}
