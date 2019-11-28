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

import { faAlignLeft, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import { Router, ActivatedRouteSnapshot, NavigationEnd } from '@angular/router'

import { UIService } from '../_services/ui.service';

declare let $: any

@Component({
  template: `<ng-container #contextMenuSectionContainer ></ng-container>`
})
export class ContextMenuSectionComponent {
  @ViewChild("contextMenuSectionContainer", { read: ViewContainerRef, static: true })
  container: ViewContainerRef

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
  }

  public addComponent(component: Type<Component>): ComponentRef<Component> {
    let factory: ComponentFactory<Component> = this.componentFactoryResolver.resolveComponentFactory(component)
    return this.container.createComponent(factory)
  }
}

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.css']
})
export class ContextMenuComponent implements OnInit {
  @ViewChild("contextMenuContainer", { read: ViewContainerRef, static: true })
  contextMenuContainer: ViewContainerRef;
  contextMenuSectionComponents: ComponentRef<ContextMenuSectionComponent>[] = new Array<ComponentRef<ContextMenuSectionComponent>>()

  faAlignLeft = faAlignLeft
  faArrowLeft = faArrowLeft

  constructor(private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver,
    private uiService: UIService) {
      uiService.getContextMenuPrompt().subscribe(message => {
        if (message.event == 'open') {
          this.openContextMenu()
        }
        else {
          this.closeContextMenu()
        }
      })
  }

  ngOnInit() {
    this.router.events
      .filter(e => e instanceof NavigationEnd)
      .forEach(e => {
        this.updateContextMenuContent(this.router.routerState.snapshot.root)
      })
  }

  private updateContextMenuContent(snapshot: ActivatedRouteSnapshot): void {
    this.clearContextMenu();
    let factory: ComponentFactory<ContextMenuSectionComponent> = this.componentFactoryResolver.resolveComponentFactory(ContextMenuSectionComponent)
    let componentsArray: any = (snapshot.data as { contextMenu: Component[] }).contextMenu;

    if (componentsArray !== undefined) {
      for (let components of componentsArray) {
        let componentRef: ComponentRef<ContextMenuSectionComponent> = this.contextMenuContainer.createComponent(factory)
        this.contextMenuSectionComponents.push(componentRef)

        if (components instanceof Array) {
          for (let component of components) {
            componentRef.instance.addComponent(component)
          }
        } else {
          componentRef.instance.addComponent(components)
        }
      }
    }

    for (let childSnapshot of snapshot.children) {
      this.updateContextMenuContent(childSnapshot)
    }
  }

  private clearContextMenu() {
    for (let contextSectionComponent of this.contextMenuSectionComponents) {
      contextSectionComponent.destroy()
    }
    this.contextMenuContainer.clear()
    this.contextMenuSectionComponents = []
  }

  public openContextMenu() {
    $('#sidebar').addClass('active');
    $('.overlay').addClass('active');
    $('.collapse.in').toggleClass('in');
    $('a[aria-expanded=true]').attr('aria-expanded', 'false');
  }

  public closeContextMenu() {
    $('#sidebar').removeClass('active');
    $('.overlay').removeClass('active');
  }

}
