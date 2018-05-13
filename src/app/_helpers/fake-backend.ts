import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { User } from '../_models/user'
import { UserRepository } from './local_repos/user-repository'

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/materialize';
import 'rxjs/add/operator/dematerialize';

import * as storyMD from './dummy_data/stories_md.json';
import * as story from './dummy_data/story.json';

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    private userRepo: UserRepository;
    constructor() {
        this.userRepo = new UserRepository();
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let stories: any[] = JSON.parse(localStorage.getItem('stories')) || [];
        let storyMetaData: any[] = <any>storyMD;

        return new Observable<HttpEvent<any>>((observer) => {
            /* ***** Begin User ***** */
            // authenticate
            if (request.url.endsWith('/api/authenticate') && request.method === 'POST') {
                this.userRepo.findUserByName(request.body.username).then((user:User) => {
                    if (user.password === request.body.password) {
                        let body = {
                            id: user.id,
                            username: user.username,
                            token: 'fake-jwt-token'
                        };
                        observer.next(new HttpResponse({ status: 200, body: body }));
                    } else {
                        observer.error('Incorrect Password')
                    }
                }, (error) => {
                    observer.error(error)
                })
            }

            // get users
            if (request.url.endsWith('/api/users') && request.method === 'GET') {
                // check for fake auth token in header and return user if valid, this security is implemented server side in a real application
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    this.userRepo.getAllUsers().then((users:User[]) => {
                        observer.next(new HttpResponse({ status: 200, body: users }));
                    }, (error) => {
                        observer.error(error);
                    })
                }
                else {
                    observer.error('Unauthorised');
                }
            }

            // get user by id
            if (request.url.match(/\/api\/users\/\d+$/) && request.method === 'GET') {
                // check for fake auth token in header and return user if valid, this security is implemented server side in a real application
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    let urlParts = request.url.split('/');
                    let id = parseInt(urlParts[urlParts.length - 1]);
                    this.userRepo.findUser(id).then((user:User) => {
                        observer.next(new HttpResponse({ status: 200, body: user }));
                    }, error => {
                        observer.error(error);
                    })
                } else {
                    observer.error('Unauthorised');
                }
            }

            // create user
            if (request.url.endsWith('/api/users') && request.method === 'POST') {
                let newUser = request.body;
                this.userRepo.addUser(newUser).then((user:User) => {
                    observer.next(new HttpResponse({ status: 200 }));
                }, error => {
                    observer.error(error);
                })
            }

            // delete user
            if (request.url.match(/\/api\/users\/\d+$/) && request.method === 'DELETE') {
                // check for fake auth token in header and return user if valid, this security is implemented server side in a real application
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    let urlParts = request.url.split('/');
                    let id = parseInt(urlParts[urlParts.length - 1]);
                    this.userRepo.removeUser(id).then((success) => {
                        observer.next(new HttpResponse({ status: 200 }));
                    }, (error) => {
                        observer.error(error)
                    })
                } else {
                    observer.error('Unauthorised');
                }
            }
            /* ***** End User ***** */


            // /* ***** Begin Stories ***** */
            // // create story
            // if (request.url.endsWith('/api/stories') && request.method === 'POST') {
            //     let userId = request.body;

            //     // get new user object from post body
            //     let newStory = {
            //         storyId: stories.length + 1,
            //         title: "title",
            //         authorId: userId,
            //         content: ""
            //     };
            //     stories.push(newStory);
            //     localStorage.setItem('stories', JSON.stringify(stories));

            //     // respond 200 OK
            //     return Observable.of(new HttpResponse({ status: 200, body: newStory }));
            // }

            // // get story meta data
            // if (request.url.match(/\/api\/stories\/\d+$/) && request.method === 'GET') {
            //     return Observable.of(new HttpResponse({ status: 200, body: <any>story }));
            // }
            // /* ***** End Stories ***** */


            // /* ***** Begin Story Meta Data ***** */
            // // get all story meta data
            // if (request.url.endsWith('/api/stories_md') && request.method === 'GET') {
            //     let userId = request.params.get("userId");
            //     let searchQuery:string = request.params.get("searchQuery");

            //     let metaData = storyMetaData;
            //     if (userId) {
            //         metaData.filter(obj => obj.userId != userId)
            //     }
            //     if (searchQuery) {
            //         metaData.filter(obj => obj.title.indexOf(searchQuery) >= 0)
            //     }

            //     return Observable.of(new HttpResponse({ status: 200, body: storyMetaData }));
            // }

            // // get story meta data
            // if (request.url.match(/\/api\/stories_md\/\d+$/) && request.method === 'GET') {
            //     return Observable.of(new HttpResponse({ status: 200, body: storyMetaData[0] }));
            // }
            // /* ***** End Story Meta Data ***** */


            // pass through any requests not handled above
            //return next.handle(request);
        })
        // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
        .materialize()
        .delay(500)
        .dematerialize();
    }
}

export let fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};