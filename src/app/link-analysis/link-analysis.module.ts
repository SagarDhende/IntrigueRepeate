import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxSpinnerModule } from 'ngx-spinner';
import { LinkAnalysisRoutingModule } from './link-analysis-routing.module';
import { LinkAnalysisComponent } from './link-analysis.component';
import { SidebarAccordionModule } from 'ng-sidebar-accordion';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { VisNetworkModule } from '../shared/components/charts/vis-network/vis-network.module';
import { InputNumberModule } from 'primeng/inputnumber';

import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import {NgScrollbar, NgScrollbarModule} from 'ngx-scrollbar'

import { ToastModule } from 'primeng/toast';
import { ContextMenuModule } from "primeng/contextmenu";
import { ErrorDialogModule } from '../shared/components/error-dialog/error-dialog.module';
import { SliderModule } from 'primeng/slider';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ChipsModule } from 'primeng/chips';
import { LeafletMapModule } from '../shared/components/charts/leaflet-map/leaflet-map.module';


@NgModule({
    declarations: [LinkAnalysisComponent],
    imports: [
        CommonModule,
        SidebarAccordionModule,
        NgbModule,
        DropdownModule,
        FormsModule,
        VisNetworkModule,
        LinkAnalysisRoutingModule,
        PanelModule,
        TabViewModule,
        NgxSpinnerModule,
        OverlayPanelModule,
        ButtonModule,
        ReactiveFormsModule,
        ChipsModule,
        CheckboxModule,
        TooltipModule,
        InputGroupModule,
        InputGroupAddonModule,
        DialogModule,
        InputTextModule,
        InputTextareaModule,
        TableModule,
        NgScrollbar,
        NgScrollbarModule,
        InputNumberModule,
        ToastModule,
        ContextMenuModule,
        ErrorDialogModule,
        SliderModule,
        LeafletMapModule,

    ]
})
export class LinkAnalysisModule { }
