import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatasetComponent } from './dataset.component';
import { DatasetListComponent } from './dataset-list/dataset-list.component';
import { DatasetDetailsComponent } from './dataset-details/dataset-details.component';


const routes: Routes = [{
    path: '',
    component: DatasetComponent, children: [
      { path: '', component: DatasetListComponent},
      { path: 'details', component: DatasetDetailsComponent },
      { path: 'details/:uuid/:version/:name', component: DatasetDetailsComponent },
      ]
  },];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatasetRoutingModule { }
