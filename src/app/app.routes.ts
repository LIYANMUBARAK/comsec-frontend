import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { MainFrameComponent } from './layout/main-frame/main-frame.component';
import { AddCompanyComponent } from './pages/add-company/add-company.component';
import { SummaryComponent } from './pages/summary/summary.component';
import { DocumentStatusComponent } from './pages/document-status/document-status.component';
import { ProjectIncorporationsComponent } from './pages/project-incorporations/project-incorporations.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProjectFormComponent } from './pages/project-form/project-form.component';
import { AuthGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { InvitationGuard } from './core/guards/invitation.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard] 
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [noAuthGuard] 
  },
  {
    path: '',
    component: MainFrameComponent,
    canActivate: [AuthGuard], 
    children: [
      {
        path: 'user-dashboard',
        component: UserDashboardComponent,
      },
      
      {
        path: 'add-company',
        component: AddCompanyComponent,
      },
      {
        path: 'summary/:companyId',
        component: SummaryComponent,
      },
      {
        path: 'document-status/:id',
        component: DocumentStatusComponent,
      },
      {
        path: 'project-incorp',
        component: ProjectIncorporationsComponent,
      },
    ],
  },
  {
    path: '',
    component: MainFrameComponent,
    canActivate: [InvitationGuard] , 
    children: [
      {
        path: 'project-form',
        component: ProjectFormComponent
      },
    ],
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'project-form',
    component: ProjectFormComponent,
    canActivate: [InvitationGuard] 
  },
  // Add a catch-all route at the end
  {
    path: '**',
    redirectTo: 'login'
  }
];
