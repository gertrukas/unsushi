import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./pages/modules/layout/layout.module').then((m) => m.LayoutModule),
    }
];
