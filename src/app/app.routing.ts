import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home/index';
import { LoginComponent } from './components/login/index';
import { RegisterComponent } from './components/register/index';
import { AuthGuard } from './_guards/index';

import { StoryExplorerComponent } from './components/story-explorer/story-explorer.component';
import { StoryViewerComponent } from './components/story-viewer/story-viewer.component';
import { StoryEditorComponent } from './components/story-editor/story-editor.component';
import { CommonToolsComponent } from './components/side-bars/common-tools/common-tools.component';

const appRoutes: Routes = [
    { 
        path: '',
        component: HomeComponent,
        /*canActivate: [AuthGuard],*/
        data: { sidebars: [ CommonToolsComponent ] }
    },
    {
        path: 'story-explorer',
        component: StoryExplorerComponent,
        data: { sidebars: [ CommonToolsComponent ] }
    },
    {
        path: 'story-explorer/:user_id',
        component: StoryExplorerComponent,
        data: { sidebars: [ CommonToolsComponent ] }
    },
    { 
        path: 'story-viewer/:story_id',
        component: StoryViewerComponent,
        data: { sidebars: [ CommonToolsComponent ] }
    },
    { 
        path: 'story-editor/:story_id',
        component: StoryEditorComponent,
        data: { sidebars: [ CommonToolsComponent ] }
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);