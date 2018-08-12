import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// used to create fake backend
import { fakeBackendProvider, DuplicateRequestProvider } from './_helpers/index';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

import { AlertComponent, LoginComponent, RegisterComponent, FormComponent } from './_directives/index';
import { AuthGuard } from './_guards/index';
import { AlertService, AuthenticationService, UserService, StoryService, StoryEditorService, UIService, StoryCacheService } from './_services/index';
import { HomeComponent } from './components/home/index';

import { StoryExplorerComponent } from './components/story-explorer/story-explorer.component';
import { StoryViewerComponent } from './components/story-viewer/story-viewer.component';

import { StoryEditorComponent, StoryEditorToolbarComponent, StoryNavMenuComponent } from './components/story-editor';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { InlineEditorComponent } from './components/utility'
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { CreateStoryComponent, DeleteStoryComponent, DeleteChapterComponent, EditStoryComponent, SaveStoryComponent, AddChapterComponent } from './components/side-bars/common-tools/';
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
    
    StoryExplorerComponent,
    StoryViewerComponent,
    StoryEditorComponent,
    StoryEditorToolbarComponent,
    StoryNavMenuComponent,
    NavbarComponent,
    ToolbarComponent,
    InlineEditorComponent,
    NavMenuComponent,
    CreateStoryComponent,
    DeleteStoryComponent,
    DeleteChapterComponent,
    EditStoryComponent,
    SaveStoryComponent,
    AddChapterComponent,
    SideBarsComponent,
    SideBarComponent
  ],
  entryComponents: [
    SideBarComponent
  ],
  providers: [
    AuthGuard,
    AlertService,
    AuthenticationService,
    StoryEditorService,
    UIService,
    UserService,
    StoryService,
    StoryCacheService,
    DuplicateRequestProvider,
    fakeBackendProvider
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
