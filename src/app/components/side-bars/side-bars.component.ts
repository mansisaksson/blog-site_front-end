import {
  Component,
  OnInit,
  OnDestroy,
  ViewContainerRef,
  ViewChild,
  ComponentRef,
  ComponentFactoryResolver,
  ComponentFactory
} from '@angular/core';

import { Router, ActivatedRouteSnapshot, Event, NavigationEnd } from '@angular/router'
import { ISubscription } from 'rxjs/Subscription'
import { unescapeIdentifier } from '@angular/compiler';

@Component({
  selector: 'app-side-bars',
  templateUrl: './side-bars.component.html',
  styleUrls: ['./side-bars.component.css']
})
export class SideBarsComponent implements OnInit, OnDestroy {

  @ViewChild("sidebarTarget", { read: ViewContainerRef })
  sidebarTarget: ViewContainerRef;

  sidebarComponents: ComponentRef<Component>[] = new Array<ComponentRef<Component>>();
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
        let factory: ComponentFactory<Component> = this.componentFactoryResolver.resolveComponentFactory(sidebar);
        let componentRef: ComponentRef<Component> = this.sidebarTarget.createComponent(factory);
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
