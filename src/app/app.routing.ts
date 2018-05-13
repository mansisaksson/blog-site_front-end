import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home/index';
import { LoginComponent } from './components/login/index';
import { RegisterComponent } from './components/register/index';
import { AuthGuard } from './_guards/index';

import { UserComponent } from './components/user/user.component';
import { StoryExplorerComponent } from './components/story-explorer/story-explorer.component';
import { StoryViewerComponent } from './components/story-viewer/story-viewer.component';

const appRoutes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    
    { path: 'tutorial', component: UserComponent },
    { path: 'story-explorer', component: StoryExplorerComponent },
    { path: 'story-viewer/:story-id', component: StoryViewerComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);