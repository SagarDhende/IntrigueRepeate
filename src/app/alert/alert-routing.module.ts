import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlertComponent } from './alert.component';
import { AlertDetailsComponent } from './alert-details/alert-details.component';
import { AlertListComponent } from './alert-list/alert-list.component';

const routes: Routes = [
  {
    path:'',
    component:AlertComponent, children:[
      {
        path:'',component:AlertListComponent
      },
      {
        path:'alert-list',component:AlertListComponent
      },
      {
        path:'alert-details',component:AlertDetailsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlertRoutingModule { }
