import { Routes, RouterModule } from '@angular/router';

import { OrbitalComponent } from './orbital/orbital.component'
import { NoContentComponent } from './no-content/no-content.component';

export const ROUTES: Routes = [
  { path: '', component: NoContentComponent },
  { path: 'orbital/:id', component: OrbitalComponent },
  { path: '**', component: NoContentComponent },
];
