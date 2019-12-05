import { Component } from '@angular/core';

declare let hljs: any

hljs.configure({
  languages: [
    'javascript', 
    'typescript', 
    'json',
    'ruby',
    'pearl',
    'cmake',
    'css',
    'scss',
    'shell',
    'sql',
    'xml',
    'ini',
    'java',
    'lua',
    'cs',
    'python', 
    'php'
  ]
});

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() {

  }
}
