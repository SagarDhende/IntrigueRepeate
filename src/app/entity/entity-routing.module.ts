import {  NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntityComponent } from './entity.component';
import { EntityListComponent } from './entity-list/entity-list.component';
import { EntityDetailComponent } from './entity-detail/entity-detail.component';

const routes: Routes = [{
 path:'',
 component: EntityComponent,children:[
  {path:'',component:EntityListComponent},
  { path:':name/:uuid', component: EntityListComponent},
  { path: 'entity-details', component: EntityDetailComponent}
 ]
},];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntityRoutingModule { }
