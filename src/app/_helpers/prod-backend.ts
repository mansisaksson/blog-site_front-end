import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/materialize';
import 'rxjs/add/operator/dematerialize';

@Injectable()
export class ProdBackend implements HttpInterceptor {

    constructor() { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
            /* 
            * TODO:
            * Could use this to re-route requests so that they work both in production and in development.
            * It would also make it easier to move the script locations.
            */
            // authenticate
            if (request.url.endsWith('/api/authenticate') && request.method === 'POST') {
                
            }

            // get users
            if (request.url.endsWith('/api/users') && request.method === 'GET') {

            }

            // get user by id
            if (request.url.match(/\/api\/users\/\d+$/) && request.method === 'GET') {

            }

            // create user
            if (request.url.endsWith('/api/users') && request.method === 'POST') {

            }

            // delete user
            if (request.url.match(/\/api\/users\/\d+$/) && request.method === 'DELETE') {

            }

            // pass through any requests not handled above
            return next.handle(request);
            
    }
}