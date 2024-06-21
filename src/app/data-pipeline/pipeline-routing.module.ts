import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PipelineComponent } from './pipeline.component';
import { PipelineListComponent } from './pipeline-list/pipeline-list.component';
const routes: Routes = [
  {
    path:'',
    component:PipelineComponent, children:[
      {
        path:'',component:PipelineListComponent
      },
      {
        path:'pipeline-list',component:PipelineListComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PipelineRoutingModule { }