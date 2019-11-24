import { Routes, RouterModule } from '@angular/router'

import { HomeComponent } from './components/home/index'
import { AuthGuard } from './_guards/index'

import { BlogPostExplorerComponent } from './components/blog-post-explorer/blog-post-explorer.component'
import { BlogPostViewerComponent } from './components/blog-post-viewer/blog-post-viewer.component'
import { EditUserComponent } from './components/edit-user/edit-user.component'
import { BlogPostEditorComponent, EditorToolbarComponent, EditorContextInfoComponent } from './components/blog-post-editor'
import { CreateBlogPostComponent, DeleteBlogPostComponent, EditBlogPostComponent, SaveBlogPostComponent, AddChapterComponent, DeleteChapterComponent, BlogPostSettingsComponent } from './components/side-bars/common-tools/'

const appRoutes: Routes = [
    { 
        path: '',
        component: HomeComponent,
        /*canActivate: [AuthGuard],*/
        data: { sidebars: [ CreateBlogPostComponent ]}
    },
    {
        path: 'blog-post-explorer',
        component: BlogPostExplorerComponent,
        data: { sidebars: [ CreateBlogPostComponent ] }
    },
    {
        path: 'blog-post-explorer/:user_id',
        component: BlogPostExplorerComponent,
        data: { sidebars: [ CreateBlogPostComponent ] }
    },
    { 
        path: 'blog-post-viewer/:blog_id',
        component: BlogPostViewerComponent,
        data: { sidebars: [ [ CreateBlogPostComponent, DeleteBlogPostComponent, EditBlogPostComponent ] ]}
    },
    { 
        path: 'blog-post-editor/:blog_id',
        component: BlogPostEditorComponent,
        data: { 
            sidebars: [ 
                [ CreateBlogPostComponent, DeleteBlogPostComponent ], 
                [ BlogPostSettingsComponent, AddChapterComponent, DeleteChapterComponent, SaveBlogPostComponent ] 
            ],
            toolbar: EditorToolbarComponent,
            contextInfo: EditorContextInfoComponent
        }
    },
    { 
        path: 'edit-user',
        component: EditUserComponent,
        data: { sidebars: [ ]}
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);