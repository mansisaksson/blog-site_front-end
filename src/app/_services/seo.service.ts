import { Injectable } from '@angular/core'
import { Meta } from '@angular/platform-browser'

@Injectable()
export class SEOService {

	constructor(private meta: Meta) {

	}

	public setPageDescription(description: string) {
		this.clearPageDescription()
		this.meta.addTag({ name: 'description', content: description }, true)
	}

	public setPageTags(tags: string[]) {
		this.clearPageTags()
		this.meta.addTag({ name: 'tags', content: tags.join(', ') }, true)
	}

	public setPageAuthor(description: string) {
		this.clearPageAuthor()
		this.meta.addTag({ name: 'author', content: description }, true)
	}
	
	public clearPageDescription() {
		this.meta.removeTag('name = "description"')
	}

	public clearPageTags() {
		this.meta.removeTag('name = "tags"')
	}

	public clearPageAuthor() {
		this.meta.removeTag('name = "author"')
	}

	public clearPageMeta() {
		this.clearPageDescription()
		this.clearPageAuthor()
		this.clearPageTags()
	}

}