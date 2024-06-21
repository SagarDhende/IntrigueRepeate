import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingRoutingModule } from './setting-routing.module';
import { SettingComponent } from './setting.component';
import { TabViewModule } from 'primeng/tabview';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
// import { BreadcrumbModule } from '../theme/shared/components';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { NgxSpinnerModule } from 'ngx-spinner';



@NgModule({
  declarations: [
    SettingComponent
  ],
  imports: [
    CommonModule,
    SettingRoutingModule,
    TabViewModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    ToastModule,
    PanelModule,
    // BreadcrumbModule,
    PasswordModule,
    ButtonModule,
    NgxSpinnerModule
  ],
  providers: [
    MessageService
  ]
})
export class SettingModule { }
