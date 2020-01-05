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
  { path: 'story-explorer', redirectTo: 'posts' },
  { path: 'blog-post-explorer', redirectTo: 'posts' },

  { path: 'story-explorer/:user_id', redirectTo: 'posts/:user_id' },
  { path: 'blog-post-explorer/:user_id', redirectTo: 'posts/:user_id' },

  { path: 'story-viewer', redirectTo: 'view' },
  { path: 'blog-post-viewer', redirectTo: 'view' },

  { path: 'story-editor/:blog_id', redirectTo: 'edit/:blog_id' },
  { path: 'blog-post-editor/:blog_id', redirectTo: 'edit/:blog_id' },


  {
    path: '',
    component: HomeComponent,
    /*canActivate: [AuthGuard],*/
    data: { contextMenu: [CreateBlogPostComponent] }
  },
  {
    path: 'posts',
    component: BlogPostExplorerComponent,
    data: { contextMenu: [CreateBlogPostComponent] }
  },
  {
    path: 'posts/:user_id',
    component: BlogPostExplorerComponent,
    data: { 
      contextMenu: [CreateBlogPostComponent],
      contextInfo: AuthorContextInfoComponent
    }
  },
  {
    path: 'view/:blog_id',
    component: BlogPostViewerComponent,
    data: { 
      contextMenu: [[CreateBlogPostComponent, DeleteBlogPostComponent, EditBlogPostComponent]],
      contextInfo: AuthorContextInfoComponent
    }
  },
  {
    path: 'edit/:blog_id',
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