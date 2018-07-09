import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { User } from '../_models/user'
import { StoryChapter, StoryMetaData, ChapterMetaData } from '../_models/story'
import { UserRepository } from './local_repos/user-repository'
import { StoryRepository } from './local_repos/story-repository'

import { environment } from './../../environments/environment';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/materialize';
import 'rxjs/add/operator/dematerialize';


@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
	private userRepo: UserRepository;
	private storyRepo: StoryRepository;
	constructor() {
		this.userRepo = new UserRepository();
		this.storyRepo = new StoryRepository();
	}

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		if (!environment.useFakeBackend) {
			// pass through any requests not handled above
			return next.handle(request)
		}

		return new Observable<HttpEvent<any>>((observer) => {
			/* ***** Begin User ***** */
			// authenticate
			if (request.url.endsWith('/api/authenticate') && request.method === 'GET') {
				let userName = request.params['user_name']
				let userPassword = request.params['user_password']
				this.userRepo.findUserByName(userName).then((user: User) => {
					if (user.password === userPassword) {
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
			else if (request.url.endsWith('/api/users/query') && request.method === 'GET') {
				// check for fake auth token in header and return user if valid, this security is implemented server side in a real application
				if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
					this.userRepo.getAllUsers().then((users: User[]) => {
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
			else if (request.url.endsWith('/api/users') && request.method === 'GET') {
				// check for fake auth token in header and return user if valid, this security is implemented server side in a real application
				if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
					let userId: string = request.params.get("userId")
					this.userRepo.findUser(userId).then((user: User) => {
						observer.next(new HttpResponse({ status: 200, body: user }));
					}, error => {
						observer.error(error);
					})
				} else {
					observer.error('Unauthorised');
				}
			}

			// create user
			else if (request.url.endsWith('/api/users') && request.method === 'POST') {
				let newUser = request.body;
				this.userRepo.addUser(newUser).then((user: User) => {
					observer.next(new HttpResponse({ status: 200, body: user }));
				}, error => {
					observer.error(error);
				})
			}

			// delete user
			else if (request.url.endsWith('/api/users') && request.method === 'DELETE') {
				// check for fake auth token in header and return user if valid, this security is implemented server side in a real application
				if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
					let userId: string = request.params.get("userId")
					this.userRepo.removeUser(userId).then((success) => {
						observer.next(new HttpResponse({ status: 200 }));
					}, (error) => {
						observer.error(error)
					})
				} else {
					observer.error('Unauthorised')
				}
			}
			/* ***** End User ***** */



			/* ***** Begin Stories ***** */
			// create story
			else if (request.url.endsWith('/api/stories') && request.method === 'POST') {
				let userId = request.params.get("userId")
				let title = request.params.get("title")
				let chapter1Title = request.params.get("chapter1Title")
				this.storyRepo.createStory(title, userId, chapter1Title).then((story: StoryMetaData) => {
					observer.next(new HttpResponse({ status: 200, body: story }))
				}, (error) => {
					observer.error(error);
				})
			}

			// delete story
			else if (request.url.endsWith('/api/stories') && request.method === 'DELETE') {
				// check for fake auth token in header and return user if valid, this security is implemented server side in a real application
				if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
					let storyId: string = request.params.get("storyId")
					this.storyRepo.removeStory(storyId).then((success) => {
						observer.next(new HttpResponse({ status: 200 }));
					}, (error) => {
						observer.error(error)
					})
				} else {
					observer.error('Unauthorised');
				}
			}

			// update story title
			else if (request.url.endsWith('/api/stories/title') && request.method === 'PUT') {
				// check for fake auth token in header and return user if valid, this security is implemented server side in a real application
				if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
					let storyId: string = request.params.get("storyId")
					this.storyRepo.updateStoryTitle(storyId, request.body).then((story) => {
						observer.next(new HttpResponse({ status: 200, body: story }));
					}, (error) => {
						observer.error(error)
					})
				} else {
					observer.error('Unauthorised');
				}
			}

			// get all story meta data
			else if (request.url.endsWith('/api/stories/query') && request.method === 'GET') {
				let userId = request.params.get("userId")
				let searchQuery: string = request.params.get("searchQuery");

				this.storyRepo.getAllStories(userId ? userId : undefined, searchQuery).then((storymd: StoryMetaData[]) => {
					observer.next(new HttpResponse({ status: 200, body: storymd }))
				}, (error) => {
					observer.error(error);
				})
			}

			// get story meta data
			else if (request.url.endsWith('/api/stories') && request.method === 'GET') {
				let storyId = request.params.get("storyId")
				this.storyRepo.getStory(storyId).then((storymd: StoryMetaData) => {
					observer.next(new HttpResponse({ status: 200, body: storymd }))
				}, (error) => {
					observer.error(error);
				})
			}
			// /* ***** End Stories ***** */

			/* ***** Begin Chapters ***** */
			// create chapter
			else if (request.url.endsWith('/api/stories/chapters') && request.method === 'POST') {
				let storyId = request.params.get("storyId")
				let chapterTitle = request.params.get("chapterTitle")
				this.storyRepo.createChapter(storyId, chapterTitle).then((chapter: StoryMetaData) => {
					observer.next(new HttpResponse({ status: 200, body: chapter }))
				}, (error) => {
					observer.error(error);
				})
			}

			// delete chapter
			else if (request.url.endsWith('/api/stories/chapters') && request.method === 'DELETE') {
				let uri = request.params.get("uri")
				this.storyRepo.removeChapter(uri).then((newStory: StoryMetaData) => {
					observer.next(new HttpResponse({ status: 200, body: newStory }))
				}, (error) => {
					observer.error(error);
				})
			}

			// get chapters
			else if (request.url.endsWith('/api/stories/chapters') && request.method === 'GET') {
				let URIs: string[] = JSON.parse(request.params.get("URIs"));
				if (!URIs) {
					return observer.error("Invalid Story URIs")
				}
				this.storyRepo.getChapters(URIs).then((chapters: StoryChapter[]) => {
					observer.next(new HttpResponse({ status: 200, body: chapters }))
				}, (error) => {
					observer.error(error);
				})
			}

			// upate chapter content
			else if (request.url.endsWith('/api/stories/chapters/content') && request.method === 'PUT') {
				// check for fake auth token in header and return user if valid, this security is implemented server side in a real application
				if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
					let uri = request.params.get("uri")
					this.storyRepo.updateChapterContent(uri, request.body).then((success) => {
						observer.next(new HttpResponse({ status: 200 }));
					}, (error) => {
						observer.error(error)
					})
				} else {
					observer.error('Unauthorised');
				}
			}

			// upate chapter meta data
			else if (request.url.endsWith('/api/stories/chapters/metaData') && request.method === 'PUT') {
				// check for fake auth token in header and return user if valid, this security is implemented server side in a real application
				if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
					let uri = request.params.get("uri")
					this.storyRepo.updateChapterMetaData(uri, <ChapterMetaData>request.body).then((metaData: StoryMetaData) => {
						observer.next(new HttpResponse({ status: 200, body: metaData }));
					}, (error) => {
						observer.error(error)
					})
				} else {
					observer.error('Unauthorised');
				}
			}
			/* ***** End Chapters ***** */


		})
			// call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
			.materialize()
			.delay(300)
			.dematerialize();
	}
}

export let fakeBackendProvider = {
	// use fake backend in place of Http service for backend-less development
	provide: HTTP_INTERCEPTORS,
	useClass: FakeBackendInterceptor,
	multi: true
};