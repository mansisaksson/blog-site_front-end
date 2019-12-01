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

import { environment } from '../../../environments/environment'
import { UIService } from './../../_services'

@Component({
  selector: 'app-context-info',
  templateUrl: './context-info.component.html',
  styleUrls: ['./context-info.component.css']
})
export class ContextInfoComponent implements OnInit {
  @ViewChild("contextInfoTarget", { read: ViewContainerRef, static: true })
  contextInfoTarget: ViewContainerRef

  contextInfoComponent: ComponentRef<Component>

  bannerURL = "assets/default_banner.png"

  constructor(
    private router: Router,
    private uiService: UIService,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
  }

  ngOnInit() {
    this.router.events
      .filter(e => e instanceof NavigationEnd)
      .forEach(e => {
        this.updateContent(this.router.routerState.snapshot.root)
      })

    this.uiService.getBannerURIObserver().subscribe(uri => {
      if (uri) {
        this.bannerURL = environment.backendAddr + '/api/file/content/' + uri
      } else {
        this.bannerURL = "assets/default_banner.png"
      }
    })
  }

  private updateContent(snapshot: ActivatedRouteSnapshot): void {
    this.clearContextInfo()
    let contextInfo: any = (snapshot.data as { contextInfo: Component }).contextInfo
    let contextInfoParams: any = (snapshot.data as { contextInfoParams: string[] }).contextInfoParams

    if (contextInfo != undefined) {
      let factory: ComponentFactory<Component> = this.componentFactoryResolver.resolveComponentFactory(contextInfo)
      let componentRef: ComponentRef<Component> = this.contextInfoTarget.createComponent(factory)
      this.contextInfoComponent = componentRef

      if (this.contextInfoComponent && this.contextInfoComponent.instance['contextInfoParams'] != undefined) {
        this.contextInfoComponent.instance['contextInfoParams'] = contextInfoParams
      }
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
