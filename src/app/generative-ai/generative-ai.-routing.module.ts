import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GenerativeAiComponent } from './generative-ai.component';

const routes: Routes = [
  {path:'', component: GenerativeAiComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GenerativeAiRoutingModule { }
