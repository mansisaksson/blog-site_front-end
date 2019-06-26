import {
  Component,
  OnInit,
  ViewContainerRef,
  ViewChild,
  ComponentRef,
  ComponentFactoryResolver,
  ComponentFactory
} from '@angular/core';

import { Router, ActivatedRouteSnapshot, NavigationEnd } from '@angular/router'

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent  implements OnInit {
  @ViewChild("toolbarTarget", { read: ViewContainerRef, static: true })
  toolbarTarget: ViewContainerRef

  toolbarComponent: ComponentRef<Component>

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
