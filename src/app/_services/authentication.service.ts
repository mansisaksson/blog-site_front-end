import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { User, BackendResponse } from '../_models/index'
import { UIService } from './ui.service'
import { CacheManagementService, UserCacheService } from './caching_services'
import { environment } from '../../environments/environment'

@Injectable()
export class AuthenticationService {
  private isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  private currentUser: BehaviorSubject<User> = new BehaviorSubject<User>(undefined)
  private lastValidateTime: number = 0
  private revalidateTime: number = 20 * 1000

  constructor(
    private http: HttpClient,
    private uiService: UIService,
    private userCacheService: UserCacheService,
    private cacheManagementService: CacheManagementService) {
    this.validateLoginState()
  }

  ensureWithLoggedInUser(): Promise<User> {
    return this.withLoggedInUser();
  }

  withLoggedInUser(): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.getCurrentUser().subscribe((user: User) => {
        if (user) {
          resolve(user)
        }
        else {
          let onCanceled = () => {
            reject("Action Canceled")
          }
          this.uiService.promptUserLogin(undefined, onCanceled)
        }
      })
    })
  }

  login(username: string, password: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.authenticate(username, password).then((user: User) => {
        // Clear out our queries since they give different results depending on whether the user is logged in
        this.cacheManagementService.GetCacheService('blog_post_query_cache').ClearCache()
        this.setUserSession(user)
        resolve(user)
      }).catch(e => {
        this.setUserSession(undefined)
        reject(e)
      })
    })
  }

  logout(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.invalidateSession().then(() => {
        // Clear out our queries since they give different results depending on whether the user is logged in
        this.cacheManagementService.GetCacheService('blog_post_query_cache').ClearCache()
        this.setUserSession(undefined)
        resolve(true)
      }).catch((e) => {
        this.setUserSession(undefined)
        reject(e)
      })
    })
  }

  getIsLoggedIn(): Observable<boolean> {
    this.validateLoginState()
    return this.isLoggedIn.asObservable()
  }

  getCurrentUser(): Observable<User> {
    this.validateLoginState()
    return this.currentUser.asObservable()
  }

  setUserSession(user: User) {
    if (!user) {
      localStorage.removeItem('currentUser')
    } else {
      localStorage.setItem('currentUser', JSON.stringify(user))
    }
    this.lastValidateTime = Date.now()
    this.refreshLoginState()
  }

  private validateLoginState() {
    let timeSinceUpdate = Date.now() - this.lastValidateTime
    if (timeSinceUpdate > this.revalidateTime) {
      this.getSession().then((user) => {
        this.setUserSession(user)
        this.refreshLoginState()
      }).catch(error => {
        console.log(error)
      })
    }
    else {
      this.refreshLoginState()
    }
  }

  private refreshLoginState() {
    let localUser = JSON.parse(localStorage.getItem('currentUser'))
    if (this.currentUser.getValue() !== localUser) {
      this.currentUser.next(localUser)
    }

    let isLoggedIn = localUser ? true : false;
    if (this.isLoggedIn.getValue() !== isLoggedIn) {
      this.isLoggedIn.next(isLoggedIn)
    }
  }

  authenticate(userName: string, password: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      let body = {
        user_name: userName,
        user_password: password
      }
      this.http.post<BackendResponse>(environment.backendAddr + '/api/authenticate', JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json' },
        responseType: "json",
        withCredentials: true
      }).subscribe((response: BackendResponse) => {
        if (response.success) {
          let user = <User>response.body
          this.userCacheService.UpdateUserCache([user])
          resolve(user)
        } else {
          reject(response.error_code)
        }
      }, (e) => reject(e))
    })
  }

  invalidateSession(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      let body = {}
      this.http.post<BackendResponse>(environment.backendAddr + '/api/session/invalidate', JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json' },
        responseType: "json",
        withCredentials: true
      }).subscribe(data => {
        let response = <BackendResponse>data
        if (response.success) {
          resolve(<boolean>response.body)
        } else {
          reject(response.error_code)
        }
      }, (e) => reject(e))
    })
  }

  getSession(): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.http.get<BackendResponse>(environment.backendAddr + '/api/session', {
        headers: { 'Content-Type': 'application/json' },
        responseType: "json",
        withCredentials: true
      }).subscribe((response: BackendResponse) => {
        if (response.success) {
          resolve(<User>response.body)
        } else {
          reject(response.error_code)
        }
      }, (e) => reject(e))
    })
  }
}