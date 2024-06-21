import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BusinessRuleComponent } from './business-rule.component';
import { BusinessRuleListComponent } from './business-rule-list/business-rule-list.component';


const routes: Routes = [{
    path: '',
    component: BusinessRuleComponent, children: [
      { path: '', component: BusinessRuleListComponent},
      { path: 'business-rule-list', component: BusinessRuleListComponent },
      ]
  },];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessRuleRoutingModule { }
