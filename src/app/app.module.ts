import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { DuplicateRequestProvider } from './_helpers/index';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

import { AlertComponent, LoginComponent, RegisterComponent, FormComponent } from './_directives/index';
import { AuthGuard } from './_guards/index';
import { AlertService, AuthenticationService, UserService, BlogPostService, BlogPostEditorService, UIService } from './_services/index';

import { UserCacheService, BlogCacheService, ChapterCacheService, ChapterContentCacheService, BlogQueryCacheService, CacheManagementService } from './_services/caching_services';

import { HomeComponent } from './components/home/index';
import { EditUserComponent } from './components/edit-user/edit-user.component'

import { BlogPostExplorerComponent } from './components/blog-post-explorer/blog-post-explorer.component';
import { BlogPostViewerComponent } from './components/blog-post-viewer/blog-post-viewer.component';

import { BlogPostEditorComponent, EditorToolbarComponent, EditorContextInfoComponent } from './components/blog-post-editor';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { InlineEditorComponent } from './components/utility'
import { ContextInfoComponent } from './components/context-info/context-info.component';
import { CreateBlogPostComponent, DeleteBlogPostComponent, DeleteChapterComponent, EditBlogPostComponent, SaveBlogPostComponent, AddChapterComponent, BlogPostSettingsComponent } from './components/side-bars/common-tools/';
import { SideBarsComponent, SideBarComponent } from './components/side-bars/side-bars.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    routing
  ],
  declarations: [
    AppComponent,
    AlertComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    FormComponent,
    EditUserComponent,
    
    BlogPostExplorerComponent,
    BlogPostViewerComponent,
    BlogPostEditorComponent,

    EditorToolbarComponent,
    EditorContextInfoComponent,
    NavbarComponent,
    ToolbarComponent,
    InlineEditorComponent,

    ContextInfoComponent,
    CreateBlogPostComponent,
    DeleteBlogPostComponent,
    DeleteChapterComponent,
    EditBlogPostComponent,
    SaveBlogPostComponent,
    AddChapterComponent,
    BlogPostSettingsComponent,
    SideBarsComponent,
    SideBarComponent
  ],
  entryComponents: [
    EditorToolbarComponent,
    EditorContextInfoComponent,
    NavbarComponent,
    ToolbarComponent,
    InlineEditorComponent,
    
    SideBarComponent,
    ContextInfoComponent,
    CreateBlogPostComponent,
    DeleteBlogPostComponent,
    DeleteChapterComponent,
    EditBlogPostComponent,
    SaveBlogPostComponent,
    AddChapterComponent,
    BlogPostSettingsComponent,
    SideBarsComponent,
    SideBarComponent
  ],
  providers: [
    AuthGuard,
    AlertService,
    AuthenticationService,
    BlogPostEditorService,
    UIService,
    UserService,
    BlogPostService,

    // Caching services
    CacheManagementService,
    BlogCacheService,
    UserCacheService,
    ChapterCacheService,
    ChapterContentCacheService,
    BlogQueryCacheService,

    DuplicateRequestProvider
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
