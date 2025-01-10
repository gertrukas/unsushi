import { Routes } from '@angular/router';
import { NgxPermissionsGuard } from "ngx-permissions";

const Routing: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  // {
  //   path: 'builder',
  //   loadChildren: () => import('./builder/builder.module').then((m) => m.BuilderModule),
  // },
  // {
  //   path: 'crafted/pages/profile',
  //   loadChildren: () => import('../modules/profile/profile.module').then((m) => m.ProfileModule),
  //   // data: { layout: 'light-sidebar' },
  // },
  {
    path: 'crafted/account',
    loadChildren: () => import('../modules/account/account.module').then((m) => m.AccountModule),
    // data: { layout: 'dark-header' },
  },
  // {
  //   path: 'crafted/pages/wizards',
  //   loadChildren: () => import('../modules/wizards/wizards.module').then((m) => m.WizardsModule),
  //   // data: { layout: 'light-header' },
  // },
  // {
  //   path: 'crafted/widgets',
  //   loadChildren: () => import('../modules/widgets-examples/widgets-examples.module').then((m) => m.WidgetsExamplesModule),
  //   // data: { layout: 'light-header' },
  // },
  {
    path: 'chat',
    loadChildren: () => import('../modules/apps/chat/chat.module').then((m) => m.ChatModule),
    // data: { layout: 'light-sidebar' },
  },
  {
    path: 'users',
    loadChildren: () => import('./user/user.module').then((m) => m.UserModule),
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ['full_access'],
        redirectTo: '/no-access'
      }
    }
  },
  
  {
    path: 'web-site/categories',
    loadChildren: () => import('./web/category/category.module').then((m) => m.CategoryModule),
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ['full_access', 'view_web'],
        redirectTo: '/no-access'
      }
    }
  },
  {
    path: 'web-site/products',
    loadChildren: () => import('./web/product/product.module').then((m) => m.ProductModule),
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ['full_access', 'view_web'],
        redirectTo: '/no-access'
      }
    }
  },
  {
    path: 'web-site/tags',
    loadChildren: () => import('./web/tag/tag.module').then((m) => m.TagModule),
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ['full_access', 'view_web'],
        redirectTo: '/no-access'
      }
    }
  },
  {
    path: 'web-site/blogs',
    loadChildren: () => import('./web/blog/blog.module').then((m) => m.BlogModule),
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ['full_access', 'view_web'],
        redirectTo: '/no-access'
      }
    }
  },
  {
    path: 'roles',
    loadChildren: () => import('./role/role.module').then((m) => m.RoleModule),
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ['full_access'],
        redirectTo: '/no-access'
      }
    }
  },
  {
    path: 'permissions',
    loadChildren: () => import('./permission/permission.module').then((m) => m.PermissionModule),
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: ['full_access'],
        redirectTo: '/no-access'
      }
    }
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };
