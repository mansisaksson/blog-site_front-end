export interface BackendResponse {
	success: boolean
	body?: any
	error_code?: string
	error_message?: string
}

export interface BackendError {
	errorCode?: string
	errorMessage?: string
	error?: any
}

export namespace BackendError {
	export function toString(error: BackendError): string {
		return `${error.errorCode}:${error.errorMessage}`
	}
}