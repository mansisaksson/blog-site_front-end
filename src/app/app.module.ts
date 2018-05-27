import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// used to create fake backend
import { fakeBackendProvider } from './_helpers/index';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

import { AlertComponent, LoginComponent } from './_directives/index';
import { AuthGuard } from './_guards/index';
import { JwtInterceptor } from './_helpers/index';
import { AlertService, AuthenticationService, UserService, StoryService } from './_services/index';
import { HomeComponent } from './components/home/index';
import { RegisterComponent } from './components/register/index';

import { StoryExplorerComponent } from './components/story-explorer/story-explorer.component';
import { StoryViewerComponent } from './components/story-viewer/story-viewer.component';

import { QuillModule } from 'ngx-quill';
import { StoryEditorComponent } from './components/story-editor/story-editor.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { CommonToolsComponent } from './components/side-bars/common-tools/common-tools.component';
import { SideBarsComponent, SideBarComponent } from './components/side-bars/side-bars.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    routing,
    QuillModule,
  ],
  declarations: [
    AppComponent,
    AlertComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,

    StoryExplorerComponent,
    StoryViewerComponent,
    StoryEditorComponent,
    NavbarComponent,
    ToolbarComponent,
    NavMenuComponent,
    CommonToolsComponent,
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
