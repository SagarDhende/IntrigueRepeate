import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessRuleComponent } from './business-rule.component';
import { BusinessRuleListComponent } from './business-rule-list/business-rule-list.component';
import { CommonListModule } from '../shared/components/common-list/common-list.module';
import { SidebarAccordionModule } from 'ng-sidebar-accordion';
import { MenuModule } from 'primeng/menu';
import { BusinessRuleRoutingModule } from './business-rule-routing.module';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [
    BusinessRuleComponent,
    BusinessRuleListComponent,
  ],
  imports: [
    CommonModule,
    CommonListModule,
    SidebarAccordionModule,
    MenuModule,
    BusinessRuleRoutingModule,
    BreadcrumbModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    TabViewModule,
    InputTextModule,
    ToastModule
  ],
})
export class BusinessRuleModule { }
