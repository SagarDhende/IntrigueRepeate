import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LinkAnalysisComponent } from './link-analysis.component';

const routes: Routes = [
  {path:'', component: LinkAnalysisComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LinkAnalysisRoutingModule { }
