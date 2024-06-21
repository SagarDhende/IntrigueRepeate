import { MetaType } from 'src/app/shared/enums/api/meta-type.enum';
import { Options } from 'src/app/shared/components/common-list/common-list.model';
import { Session } from 'src/app/login/auth.model'; 
import { ISearchCriteria } from 'src/app/shared/components/common-list/search-criteria-model';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TableListComponent } from 'src/app/shared/components/common-list/table-list/table-list.component';

import { SidebarAccordionComponent } from 'ng-sidebar-accordion';
import { SearchListComponent } from 'src/app/shared/components/common-list/search-list/search-list.component';
import { CustomerService } from 'src/app/demo/service/customer.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ActionType } from 'src/app/shared/components/common-list/action-type';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-pipeline-list',
  standalone: false,
  templateUrl: './pipeline-list.component.html',
  styleUrl: './pipeline-list.component.scss'
})
export class PipelineListComponent {

  constructor(private router: Router, private customerService: CustomerService, private sessionService: SessionService) {
  }

  @ViewChild(TableListComponent) tableListComponent;
  @ViewChild(SearchListComponent) searchListComponent;
  @ViewChild('rightAccordion') accordion: SidebarAccordionComponent;
  public options: Options;
  public metaType = MetaType.DAG;
  protected items:any;
  protected length:any;
  protected breadcrumbItems:MenuItem[];
  private panelOpen:boolean=false;
  private limit:number=500;
  protected isEditEnable: boolean = false
 
  // protected isExecDialogOpen:boolean=false;

  ngOnInit(): void {
    this.setMenuOptions()
    this.setDynamicOptions()
    this.breadcrumbItems = [
      { label: '<i class="pi pi-chevron-right custom-chevron"></i> Pipeline', escape: false }
    ];
  }

  //
  protected panelClose(): any {
    this.accordion?.close('right');
    this.panelOpen = false;
  }

  protected refreshClick(): any {
    this.panelClose()
    this.tableListComponent.refreshClick()
  }

  protected getLength(length: number) {
    this.length = length
  }

  protected getSearchCriteria(searchCriteria: ISearchCriteria) {
    this.panelClose()
    this.tableListComponent.getDataBySearchCriteria(searchCriteria)
  }

  private setMenuOptions():void {
    this.items = [
      {
        label: 'Options',
        items: [
          {
            label: 'Edit Filter',
            icon: 'pi pi-plus',
            command: () => {
              this.panelToggle();
            }
          },
          {
            label: 'Clear filter',
            icon: 'pi pi-times',
            command: () => {
              this.clearAll();
            }
          }
        ]
      },
    ];
  }
  
  public clearAll(): any {
    this.isEditEnable=false;
    this.getAllData();
    this.panelClose();
    // this.onIsEditEnableChanged(false);
    
  }
  private getAllData(): void{
    const sessionDetail: Session = this.sessionService.getData()
    let searchObj = {
      metaType: this.metaType,
      name: "",
      userName: sessionDetail.userName,
      startDate: "",
      endDate: "",
      activeStatus: "",
      status: "",
      limit: this.limit,
      validStatus: ""
    }
    this.searchListComponent.resetFormOnClearClick(searchObj)
    this.tableListComponent.getDataByCriteria(searchObj)
  }
  protected panelToggle(): any {
    if (this.panelOpen) {
      this.panelClose();
    }
    else {
      this.accordion.open('all', 0);
      this.panelOpen = true;
      setTimeout(() => {
      }, 1000)
    }
  }
  
  private showMyMeta(): void {
    this.getAllData();
  }
  private setDynamicOptions():void{
    this.options = new Options();
    this.options.isExec = false;
    this.options.requestParam = {publishFlag : ""}
    this.options.actionMenu = [{
      label: "Execute",
      icon: "fa fa-tasks",
      actionType: ActionType.EXECUTE,
      routerLink: 'null'
    }];
    if(this.options.isExec){
     this.options.tableCols = [
       { field: 'name', header: 'Name', visible: true },
       { field: 'version', header: 'Version', visible: false },
       { field: 'createdBy', header: 'Submitted By', visible: true },
       { field: 'createdOn', header: 'Submmited Time', visible: true },
       { field: 'startTime', header: 'Start Time', visible: true },
       { field: 'endTime', header: 'End Time', visible: true },
       { field: 'totalDuration', header: 'Total Time', visible: true },
       { field: 'parseDuration', header: 'Parse Time', visible: false },
       { field: 'waitDuration', header: 'Waiting Time', visible: false },
       { field: 'idleDuration', header: 'Idle Time', visible: false },
       { field: 'runMode', header: 'Run Mode', visible: false },
       { field: 'status', header: 'Status', visible: false },
       { field: 'action', header: 'Action', visible: true },
     ]
     this.options.filter=["Name","User","Category","Active","Tags","MetaStatus","StartData","EndDate"];
    }
    else{
     this.options.tableCols = [
      { field: 'name', header: 'Name', visible: true },
      { field: 'createdBy', header: 'Created By', visible: true },
      // { field: 'desc', header: 'Description', visible: true },
      { field: 'updatedOn', header: 'Last Updated On', visible: false },
      { field: 'metaStatus', header: 'Status', visible: false },
      { field: 'action', header: 'Action', visible: true },
     ];
     this.options.filter=["Name","User","Category"];
    }
    this.options.requestParam = {publishFlag : 'Y'}
  }

  // protected onIsEditEnableChanged(isEditEnable: boolean) {
  //   let menuList = this.items[0].items
  //   menuList.forEach((menuItem) => {
  //     if (menuItem.label === 'Add Filter' || menuItem.label === 'Edit Filter') {
  //       menuItem.label = isEditEnable ? 'Edit Filter' : 'Add Filter';
  //     }
  //   });
  // }
  onIsEditEnableChanged(isEditEnable: boolean) {
    this.isEditEnable=isEditEnable;
  }
}
