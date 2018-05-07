import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router'

import { QuillModule } from 'ngx-quill';

import { AppComponent } from './app.component';
import { UserComponent } from './components/user/user.component';
import { AboutComponent } from './components/about/about.component';
import { StoryExplorerComponent } from './components/story-explorer/story-explorer.component';
import { StoryViewerComponent } from './components/story-viewer/story-viewer.component';
import { LoginComponent } from './components/login/login.component';

import { DataService } from './services/data.service';
import { SessionService } from './services/session.service';


const appRoutes: Routes = [
  {path:'tutorial', component:UserComponent},
  {path:'about', component:AboutComponent},
  {path:'login', component:LoginComponent},
  {path:'story-explorer', component:StoryExplorerComponent},
  {path:'story-viewer/:story-id', component:StoryViewerComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    UserComponent,
    AboutComponent,
    StoryExplorerComponent,
    StoryViewerComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    QuillModule
  ],
  providers: [
    DataService,
    SessionService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { 
  isLoggedIn=true;
}
