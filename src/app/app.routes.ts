import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { UpdateProfile } from './update-profile/update-profile';
import { WorkLog } from './work-log/work-log';
import { AuthGuard } from './guards/auth-guard';
import { CreateScaleComponent } from './create-scale/create-scale';
import { ScaleList } from './scale-list/scale-list';
import { EditScale } from './edit-scale/edit-scale';
import { Payroll } from './payroll/payroll';
import { Deductions } from './deductions/deductions';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'update-profile', component: UpdateProfile, canActivate: [AuthGuard]},
  { path: 'work-log', component: WorkLog, canActivate: [AuthGuard]},
  { path: 'scales', component: ScaleList, canActivate: [AuthGuard] },
  { path: 'scales/edit/:id', component: EditScale },
  { path: 'scales/create', component: CreateScaleComponent, canActivate: [AuthGuard] },
  { path: 'payroll', component: Payroll, canActivate: [AuthGuard] },
  { path: 'deductions', component: Deductions, canActivate: [ AuthGuard]}


];
