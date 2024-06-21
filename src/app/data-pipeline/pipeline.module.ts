import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PipelineComponent } from './pipeline.component';
import { PipelineRoutingModule } from './pipeline-routing.module';
import { PipelineListComponent } from './pipeline-list/pipeline-list.component';
import { TableModule } from 'primeng/table';
import { SidebarAccordionModule } from 'ng-sidebar-accordion';
import { CommonListModule } from '../shared/components/common-list/common-list.module';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@NgModule({
    declarations:
        [
            PipelineComponent, PipelineListComponent
        ],
    imports: [
        CommonModule, 
        ReactiveFormsModule,
        PipelineRoutingModule, 
        TableModule,
        SidebarAccordionModule,
        CommonListModule,
        MenuModule,
        PanelModule,
        DropdownModule,
        DialogModule,
        ButtonModule,
        TabViewModule,
        BreadcrumbModule
    ],
    providers: [

    ]
})
export class PipelineModule { }
