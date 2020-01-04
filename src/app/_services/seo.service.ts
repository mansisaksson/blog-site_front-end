import { Injectable } from '@angular/core'
import { Meta } from '@angular/platform-browser'

@Injectable()
export class SEOService {

	constructor(private meta: Meta) {

	}

	public setPageTitle(title: string) {
		this.clearPageTitle()
		this.meta.addTag({ name: 'title', content: title }, true)
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

	public clearPageTitle() {
		this.meta.removeTag('name = "title"')
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
		this.clearPageTitle()
		this.clearPageDescription()
		this.clearPageAuthor()
		this.clearPageTags()
	}

}