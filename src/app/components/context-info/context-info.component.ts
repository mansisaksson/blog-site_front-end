import {
  Component,
  OnInit,
  ViewContainerRef,
  ViewChild,
  ComponentRef,
  ComponentFactoryResolver,
  ComponentFactory,
  Type
} from '@angular/core';

import { Router, ActivatedRouteSnapshot, NavigationEnd } from '@angular/router'

@Component({
  selector: 'app-context-info',
  templateUrl: './context-info.component.html',
  styleUrls: ['./context-info.component.css']
})
export class ContextInfoComponent implements OnInit {
  @ViewChild("contextInfoTarget", { read: ViewContainerRef, static: true })
  contextInfoTarget: ViewContainerRef

  contextInfoComponent: ComponentRef<Component>

  constructor(private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver) { 
  }

  ngOnInit() {
    this.router.events
    .filter(e => e instanceof NavigationEnd)
    .forEach(e => {
      this.updateContent(this.router.routerState.snapshot.root)
    })
  }

  private updateContent(snapshot: ActivatedRouteSnapshot): void {
    this.clearContextInfo()
    let contextInfo: any = (snapshot.data as { contextInfo: Component }).contextInfo

    if (contextInfo != undefined) {
      let factory: ComponentFactory<Component> = this.componentFactoryResolver.resolveComponentFactory(contextInfo)
      let componentRef: ComponentRef<Component> = this.contextInfoTarget.createComponent(factory)
      this.contextInfoComponent = componentRef
    }

    for (let childSnapshot of snapshot.children) {
      this.updateContent(childSnapshot)
    }
  }

  private clearContextInfo() {
    if (this.contextInfoComponent) {
      this.contextInfoComponent.destroy()
    }
    if (this.contextInfoTarget) {
      this.contextInfoTarget.clear()
    }
    this.contextInfoComponent = undefined
  }

}
