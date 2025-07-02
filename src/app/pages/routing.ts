import { Routes } from '@angular/router';
import { BancosComponent } from './bancos/bancos.component';
import { AniosAcademicosComponent } from './anios-academicos/anios-academicos.component';
import { ApoderadosComponent } from './apoderados/apoderados.component';
import { ConceptosPagoComponent } from './conceptos-pago/conceptos-pago.component';
import { CronogramaPagosComponent } from './cronograma-pagos/cronograma-pagos.component';
import { EstudiantesComponent } from './estudiantes/estudiantes.component';
import { GradosComponent } from './grados/grados.component';
import { MatriculasComponent } from './matriculas/matriculas.component';
import { PagosComponent } from './pagos/pagos.component';
import { UserComponent } from './admin/user/user.component';
import { RolesComponent } from './roles/roles.component';

const Routing: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'builder',
    loadChildren: () => import('./builder/builder.module').then((m) => m.BuilderModule),
  },
  {
    path: 'crafted/pages/profile',
    loadChildren: () => import('../modules/profile/profile.module').then((m) => m.ProfileModule),
    // data: { layout: 'light-sidebar' },
  },
  {
    path: 'crafted/account',
    loadChildren: () => import('../modules/account/account.module').then((m) => m.AccountModule),
    // data: { layout: 'dark-header' },
  },
  {
    path: 'crafted/pages/wizards',
    loadChildren: () => import('../modules/wizards/wizards.module').then((m) => m.WizardsModule),
    // data: { layout: 'light-header' },
  },
  {
    path: 'crafted/widgets',
    loadChildren: () => import('../modules/widgets-examples/widgets-examples.module').then((m) => m.WidgetsExamplesModule),
    // data: { layout: 'light-header' },
  },
  {
    path: 'apps/chat',
    loadChildren: () => import('../modules/apps/chat/chat.module').then((m) => m.ChatModule),
    // data: { layout: 'light-sidebar' },
  },
  {
    path: 'apps/users',
    loadChildren: () => import('./user/user.module').then((m) => m.UserModule),
  },
  {
    path: 'apps/roles',
    loadChildren: () => import('./role/role.module').then((m) => m.RoleModule),
  },
  {
    path: 'apps/permissions',
    loadChildren: () => import('./permission/permission.module').then((m) => m.PermissionModule),
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
  {
    path: 'bancos',
    component: BancosComponent,
  },
  {
    path: 'anios-academicos',
    component: AniosAcademicosComponent,
  },
  {
    path: 'apoderados',
    component: ApoderadosComponent,
  },
  {
    path: 'conceptos-pago',
    component: ConceptosPagoComponent,
  },
  {
    path: 'cronograma-pagos',
    component: CronogramaPagosComponent,
  },
  {
    path: 'estudiantes',
    component: EstudiantesComponent,
  },
  {
    path: 'grados',
    component: GradosComponent,
  },
  {
    path: 'matriculas',
    component: MatriculasComponent,
  },
  {
    path: 'pagos',
    component: PagosComponent,
  },
  {
    path: 'admin',
    component: UserComponent,
  },
  {
    path: 'roles',
    component: RolesComponent,
  },
];

export { Routing };
