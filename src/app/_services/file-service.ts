import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { BackendResponse, File } from '../_models'
import { environment } from '../../environments/environment'
//import { FileCacheService } from './caching_services'

@Injectable()
export class FileService {

	constructor(
		private http: HttpClient, 
		/*private fileCacheService: FileCacheService*/) {
  }
  
  getFile(fileId: string): Promise<File> {
		return new Promise<File>((resolve, reject) => {
			let params = {
				fileId: fileId
			}
			this.http.get<BackendResponse>(environment.backendAddr + '/api/file', { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					let file = <File>response.body
					//this.fileCacheService.UpdateFileCache([file])
					resolve(file)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
  }

	createFile(userId: string, fileName: string, fileType: string, fileMetaData: object, fileContent: string): Promise<File> {
		return new Promise<File>((resolve, reject) => {
			let params = {
				userId: userId
			}
			let body = {
				fileName: fileName,
        fileType: fileType,
        fileMetaData: fileMetaData,
        fileContent: fileContent
			}
			this.http.post<BackendResponse>(environment.backendAddr + '/api/file', JSON.stringify(body), { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					let file = <File>response.body
					//this.fileCacheService.UpdateFileCache([file])
					resolve(file)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	updateFile(fileId: string, newFileProperties: object): Promise<File> {
		return new Promise<File>((resolve, reject) => {
			let params = {
				fileId: fileId
			}
			this.http.put<BackendResponse>(environment.backendAddr + '/api/file', JSON.stringify(newFileProperties), { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					let file = <File>response.body
					//this.fileCacheService.UpdateFileCache([file])
					resolve(file)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	deleteFile(id: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			let params = {
				fileId: id
			}
			this.http.delete<BackendResponse>(environment.backendAddr + '/api/file', { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					//this.fileCacheService.InvalidateFileCache([id])
					resolve(response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
  }

  updateFileContent(fileId: string, newFileContent: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			let params = {
				fileId: fileId
			}
			this.http.put<BackendResponse>(environment.backendAddr + '/api/file/content', newFileContent, { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					//this.fileCacheService.UpdateFileCache([file])
					resolve(true)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

}