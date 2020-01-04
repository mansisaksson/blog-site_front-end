import { Injectable } from '@angular/core'
import { Meta } from '@angular/platform-browser'

@Injectable()
export class SEOService {

	constructor(private meta: Meta) {

	}

	public setPageTags(tags: string[]) {
		this.clearPageTags()
		this.meta.addTag({ name: 'page-tags', content: tags.join(', ') }, true)
	}

	public setPageDescription(description) {
		this.clearPageDescription()
		this.meta.addTag({ name: 'page-description', content: description }, true)
	}

	public clearPageTags() {
		this.meta.removeTag('name = "page-tags"')
	}

	public clearPageDescription() {
		this.meta.removeTag('name = "page-description"')
	}

	public clearPageMeta() {
		this.clearPageTags()
		this.clearPageDescription()
	}

}