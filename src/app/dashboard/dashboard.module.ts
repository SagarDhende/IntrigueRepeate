import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
// import { BreadcrumbModule } from '../theme/shared/components';
// import { DashboardEmbedContainerModule } from '../shared/components/dashboard-embed-container/dashboard-embed-container.module';
import { DashboardIntegratedContainerModule } from '../shared/components/dashboard-integrated-container/dashboard-integrated-container.module';


@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    // BreadcrumbModule,
    DashboardRoutingModule,
    // DashboardEmbedContainerModule,
    DashboardIntegratedContainerModule
  ]
})
export class DashboardModule { }
