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
  template: `
  <div class="card" style="padding: 10px; margin-top: 10px">
    <ng-container #sidebarContainer></ng-container>
  </div>`
})
export class SideBarComponent {
  @ViewChild("sidebarContainer", { read: ViewContainerRef })
  container: ViewContainerRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
  }

  public addComponent(component: Type<Component>): ComponentRef<Component> {
    let factory: ComponentFactory<Component> = this.componentFactoryResolver.resolveComponentFactory(component);
    return this.container.createComponent(factory);
  }
}

@Component({
  selector: 'app-side-bars',
  templateUrl: './side-bars.component.html',
  styleUrls: ['./side-bars.component.css']
})
export class SideBarsComponent implements OnInit, OnDestroy {
  @ViewChild("sidebarTarget", { read: ViewContainerRef })
  sidebarTarget: ViewContainerRef;

  sidebarComponents: ComponentRef<SideBarComponent>[] = new Array<ComponentRef<SideBarComponent>>();
  routerEventSubscription: ISubscription;

  constructor(private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
    this.routerEventSubscription = this.router.events.subscribe(
      (event: Event) => {
        if (event instanceof NavigationEnd) {
          this.updateSidebarContent(this.router.routerState.snapshot.root);
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.routerEventSubscription.unsubscribe();
  }

  private updateSidebarContent(snapshot: ActivatedRouteSnapshot): void {
    this.clearSidebar();
    let sidebars: any = (snapshot.data as { sidebars: Component[] }).sidebars;

    if (sidebars !== undefined) {
      for (let sidebar of sidebars) {
        let factory: ComponentFactory<SideBarComponent> = this.componentFactoryResolver.resolveComponentFactory(SideBarComponent)
        let componentRef: ComponentRef<SideBarComponent> = this.sidebarTarget.createComponent(factory)
        componentRef.instance.addComponent(sidebar)
        this.sidebarComponents.push(componentRef);
      }
    }

    for (let childSnapshot of snapshot.children) {
      this.updateSidebarContent(childSnapshot);
    }
  }

  private clearSidebar() {
    for (let sidebarComponent of this.sidebarComponents) {
      sidebarComponent.destroy();
    }
    this.sidebarTarget.clear();
    this.sidebarComponents = [];
  }

}
