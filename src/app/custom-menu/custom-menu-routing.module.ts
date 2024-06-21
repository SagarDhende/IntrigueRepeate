import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomMenuComponent } from './custom-menu.component';

const routes: Routes = [
   {path:":url",component:CustomMenuComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomMenuRoutingModule { }