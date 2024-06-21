import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WhatIfAnalysisComponent } from './what-if-analysis.component';


const routes: Routes = [
  { path: "", component: WhatIfAnalysisComponent }
]


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WhatIfAnalysisRoutingModule { }
