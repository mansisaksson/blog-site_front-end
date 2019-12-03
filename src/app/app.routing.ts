import { Routes, RouterModule } from '@angular/router'

import { HomeComponent } from './components/home/index'
//import { AuthGuard } from './_guards/index'

import { BlogPostExplorerComponent } from './components/blog-post-explorer/blog-post-explorer.component'
import { BlogPostViewerComponent } from './components/blog-post-viewer'
import { EditUserComponent } from './components/edit-user/edit-user.component'
import { AuthorContextInfoComponent } from './components/context-info'
import { BlogPostEditorComponent, EditorToolbarComponent, EditorContextInfoComponent } from './components/blog-post-editor'
import { CreateBlogPostComponent, DeleteBlogPostComponent, EditBlogPostComponent, SaveBlogPostComponent, AddChapterComponent, DeleteChapterComponent, BlogPostSettingsComponent } from './components/context-menu'

const appRoutes: Routes = [
  // Redirects
  { path: 'story-explorer', redirectTo: 'blog-post-explorer' },
  { path: 'story-explorer/:user_id', redirectTo: 'blog-post-explorer/:user_id' },
  { path: 'story-viewer', redirectTo: 'blog-post-viewer' },
  { path: 'blog-post-editor/:blog_id', redirectTo: 'story-editor/:blog_id' },


  {
    path: '',
    component: HomeComponent,
    /*canActivate: [AuthGuard],*/
    data: { contextMenu: [CreateBlogPostComponent] }
  },
  {
    path: 'blog-post-explorer',
    component: BlogPostExplorerComponent,
    data: { contextMenu: [CreateBlogPostComponent] }
  },
  {
    path: 'blog-post-explorer/:user_id',
    component: BlogPostExplorerComponent,
    data: { 
      contextMenu: [CreateBlogPostComponent],
      contextInfo: AuthorContextInfoComponent
    }
  },
  {
    path: 'blog-post-viewer/:blog_id',
    component: BlogPostViewerComponent,
    data: { 
      contextMenu: [[CreateBlogPostComponent, DeleteBlogPostComponent, EditBlogPostComponent]],
      contextInfo: AuthorContextInfoComponent
    }
  },
  {
    path: 'blog-post-editor/:blog_id',
    component: BlogPostEditorComponent,
    data: {
      contextMenu: [
        [CreateBlogPostComponent, DeleteBlogPostComponent],
        [BlogPostSettingsComponent, AddChapterComponent, DeleteChapterComponent, SaveBlogPostComponent]
      ],
      toolbar: EditorToolbarComponent,
      contextInfo: EditorContextInfoComponent
    }
  },
  {
    path: 'edit-user',
    component: EditUserComponent,
    data: { 
      contextMenu: [],
      contextInfo: AuthorContextInfoComponent
    }
  },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);