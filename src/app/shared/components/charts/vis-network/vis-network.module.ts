import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SidebarModule } from 'primeng/sidebar';
import { ContextMenuModule } from "primeng/contextmenu";
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import {ConfirmDialogModule} from 'primeng/confirmdialog'
import { TableModule } from 'primeng/table';

import { VisNetworkRoutingModule } from './vis-network-routing.module';
import { VisNetworkComponent } from './vis-network.component';
import { MenuModule } from 'primeng/menu';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbar,NgScrollbarModule } from 'ngx-scrollbar';


@NgModule({
  declarations: [
    VisNetworkComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarModule,
    ContextMenuModule,
    DialogModule,
    NgScrollbarModule,
    NgScrollbar,
    DropdownModule,
    ConfirmDialogModule,
    MenuModule,
    TableModule,
    NgbDropdownModule,
    //ErrorDialogModule,
    VisNetworkRoutingModule,
     ],
  providers: [
    MessageService,ConfirmationService],
  exports: [VisNetworkComponent]

})
export class VisNetworkModule { }
