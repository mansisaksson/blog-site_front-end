﻿import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home/index';
import { AuthGuard } from './_guards/index';

import { StoryExplorerComponent } from './components/story-explorer/story-explorer.component';
import { StoryViewerComponent } from './components/story-viewer/story-viewer.component';
import { StoryEditorComponent, StoryEditorToolbarComponent, StoryNavMenuComponent } from './components/story-editor';
import { CreateStoryComponent, DeleteStoryComponent, EditStoryComponent, SaveStoryComponent } from './components/side-bars/common-tools/';

const appRoutes: Routes = [
    { 
        path: '',
        component: HomeComponent,
        /*canActivate: [AuthGuard],*/
        data: { sidebars: [ CreateStoryComponent ]}
    },
    {
        path: 'story-explorer',
        component: StoryExplorerComponent,
        data: { sidebars: [ CreateStoryComponent ] }
    },
    {
        path: 'story-explorer/:user_id',
        component: StoryExplorerComponent,
        data: { sidebars: [ CreateStoryComponent ] }
    },
    { 
        path: 'story-viewer/:story_id',
        component: StoryViewerComponent,
        data: { sidebars: [ [ CreateStoryComponent, DeleteStoryComponent, EditStoryComponent ] ]}
    },
    { 
        path: 'story-editor/:story_id',
        component: StoryEditorComponent,
        data: { 
            sidebars: [ [ CreateStoryComponent, DeleteStoryComponent, SaveStoryComponent ] ],
            toolbar: StoryEditorToolbarComponent,
            navMenu: StoryNavMenuComponent
        }
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);