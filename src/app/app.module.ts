import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// used to create fake backend
import { fakeBackendProvider } from './_helpers/index';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

import { AlertComponent, LoginComponent, RegisterComponent, FormComponent } from './_directives/index';
import { AuthGuard } from './_guards/index';
import { JwtInterceptor } from './_helpers/index';
import { AlertService, AuthenticationService, UserService, StoryService, StoryEditorService, UIService } from './_services/index';
import { HomeComponent } from './components/home/index';

import { StoryExplorerComponent } from './components/story-explorer/story-explorer.component';
import { StoryViewerComponent } from './components/story-viewer/story-viewer.component';

import { StoryEditorComponent, StoryEditorToolbarComponent, StoryNavMenuComponent } from './components/story-editor';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { CreateStoryComponent, DeleteStoryComponent, EditStoryComponent, SaveStoryComponent, AddChapterComponent } from './components/side-bars/common-tools/';
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
    NavMenuComponent,
    CreateStoryComponent,
    DeleteStoryComponent,
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
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    StoryService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },

    // provider used to create fake backend
    fakeBackendProvider
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
