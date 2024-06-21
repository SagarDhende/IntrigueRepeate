import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationManagerComponent } from './application-manager.component';

const routes: Routes = [
  {
    path:'',
    component:ApplicationManagerComponent
 }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationManagerRoutingModule { }