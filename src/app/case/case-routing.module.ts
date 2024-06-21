import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaseComponent } from './case.component';
import { CaseListComponent } from './case-list/case-list.component';
import { CaseDetailsComponent } from './case-details/case-details.component';

const routes: Routes = [
  {
    path:'',
    component:CaseComponent, children: [
      {
        path: '', component: CaseListComponent
      },
      {
        path: 'case-list', component: CaseListComponent
      },
      {
        path: 'case-details', component: CaseDetailsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CaseRoutingModule { }
