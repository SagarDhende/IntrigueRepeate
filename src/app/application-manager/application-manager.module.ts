import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationManagerRoutingModule } from './application-manager-routing.module';
import { ApplicationManagerComponent } from './application-manager.component';
import { PanelModule } from 'primeng/panel';
import { MessagesModule } from 'primeng/messages';
import { CardModule, } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { ErrorDialogModule } from '../shared/components/error-dialog/error-dialog.module';
import { MessageModule } from 'primeng/message';
import { NgScrollbar } from 'ngx-scrollbar';

@NgModule({
  declarations: [
    ApplicationManagerComponent
  ],
  imports: [
    CommonModule,
    PanelModule,
    MessagesModule,
    MessageModule,
    CardModule,
    ButtonModule,
    RippleModule,
    NgxSpinnerModule,
    ApplicationManagerRoutingModule,
    ErrorDialogModule,
    FormsModule,
    NgScrollbar
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class ApplicationManagerModule { }
