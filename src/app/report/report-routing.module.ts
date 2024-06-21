import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportComponent } from './report.component';
import { ReportCardComponent } from './report-card/report-card.component';
import { ReportDetailsComponent } from './report-details/report-details.component';
import { ReportArchiveComponent } from './report-archive/report-archive.component';

const routes: Routes = [{
    path: '',
    component: ReportComponent, children: [
      { path: '', component: ReportCardComponent},
      { path: 'details', component: ReportDetailsComponent },
      { path: 'details/:uuid/:version/:name', component: ReportDetailsComponent },
      { path: 'history', component:ReportArchiveComponent}
      ]
  },];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }