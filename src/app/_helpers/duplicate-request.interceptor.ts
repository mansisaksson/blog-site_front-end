import { Injectable } from '@angular/core'
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http'
import { Observable, Subject } from 'rxjs'

@Injectable()
export class DuplicateRequestInterceptor implements HttpInterceptor {
  private pendingRequests: { [url: string]: Subject<any> } = {}

  private getPendingRequest(url: string): Subject<any> {
    let request = this.pendingRequests[url]
    if (request != undefined) {
      console.log("Stopped Duplicate Request: " + url)
      return request
    }
    return undefined
  }

  private createPendingRequest(url: string): Subject<any> {
    let existinRequest = this.getPendingRequest(url)
    if (existinRequest != undefined) {
      throw "Overwriting existing request: " + url
    }
    
    let subject = new Subject<any>()
    this.pendingRequests[url] = subject
    return subject
  }

  private resolveRequest(url: string) {
    if (this.pendingRequests[url] != undefined) {
      delete this.pendingRequests[url]
    }
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method == 'GET') {
      let pendingRequest = this.getPendingRequest(request.urlWithParams)
      if (pendingRequest == undefined) {
        pendingRequest = this.createPendingRequest(request.urlWithParams)
        next.handle(request).subscribe((data) => {
          pendingRequest.next(data)
        }, (error) => { 
          pendingRequest.thrownError(error) 
        }, () => { 
          this.resolveRequest(request.urlWithParams) 
        })
      }
      return pendingRequest.asObservable()
    }

    // TODO: we should probably throw some form of error if we get duplicate PUT/POST/DELETE requests
    return next.handle(request)
  }
}

export let DuplicateRequestProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: DuplicateRequestInterceptor,
  multi: true
};