import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth.guard';
import { LoginComponent } from './login/login.component';
import { ShellComponent } from './layout/shell.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // public
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },

  // everything behind the login lives under /app and shares the sidebar
  {
    path: 'app',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard',  component: DashboardComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'settings',   component: SettingsComponent },
      // ADD NEW PAGES HERE, for example:
      // { path: 'reports', component: ReportsComponent },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
