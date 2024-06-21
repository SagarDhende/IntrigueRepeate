import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TableListComponent } from 'src/app/shared/components/common-list/table-list/table-list.component';

import { SidebarAccordionComponent } from 'ng-sidebar-accordion';


import { MetaType } from 'src/app/shared/enums/api/meta-type.enum';
import { Options } from 'src/app/shared/components/common-list/common-list.model';
import { Session } from 'src/app/login/auth.model'; 
import { ISearchCriteria } from 'src/app/shared/components/common-list/search-criteria-model'; 

import { SessionService} from 'src/app/shared/services/session.service';
import { CustomerService } from 'src/app/demo/service/customer.service';
import { SearchListComponent } from 'src/app/shared/components/common-list/search-list/search-list.component';

@Component({
  selector: 'app-simulation-list',
  templateUrl: './simulation-list.component.html',
  styleUrls: ['./simulation-list.component.scss']
})
export class SimulationListComponent {

  @ViewChild(TableListComponent) tableListComponent;
  @ViewChild(SearchListComponent) searchListComponent;
  @ViewChild('rightAccordion') accordion: SidebarAccordionComponent;

  public options: Options;
  public metaType = MetaType.GRAPHSIMULATEExec;

  protected errorTitle: string = '';
  protected errorContent: string = '';
  protected length: any;
  protected items:any;
  private limit: number = 500
  private panelOpen: boolean = false;

  constructor(private router: Router, private customerService: CustomerService, private sessionService: SessionService) {
  }

  ngOnInit(): void {
    this.setMenuOptions()
    this.setDynamicOptions()
  }

  private setDynamicOptions(){
   this.options = new Options();
   this.options.isExec = false;
   this.options.requestParam = {publishFlag : "Y"}
   if(this.options.isExec){
    this.options.tableCols = [
      { field: 'name', header: 'Name', visible: true },
      { field: 'version', header: 'Version', visible: false },
      { field: 'createdBy', header: 'Submitted By', visible: false },
      { field: 'createdOn', header: 'Submmited Time', visible: true },
      { field: 'startTime', header: 'Start Time', visible: true },
      { field: 'endTime', header: 'End Time', visible: true },
      { field: 'totalDuration', header: 'Total Time', visible: true },
      { field: 'parseDuration', header: 'Parse Time', visible: false },
      { field: 'waitDuration', header: 'Waiting Time', visible: false },
      { field: 'idleDuration', header: 'Idle Time', visible: false },
      { field: 'runMode', header: 'Run Mode', visible: false },
      { field: 'status', header: 'Status', visible: true },
      { field: 'action', header: 'Action', visible: true },
    ]
    this.options.filter=["Name","User","Category","Active","Tags","MetaStatus","StartData","EndDate"];
   }
   else{
    this.options.tableCols = [
      { field: 'name', header: 'Name', visible: true },
      { field: 'version', header: 'Version', visible: true },
      { field: 'createdBy', header: 'Created By', visible: true },
      { field: 'createdOn', header: 'Last Updated On', visible: true },
      { field: 'active', header: 'Active', visible: true },
      { field: 'publicFlag', header: 'Public', visible: false },
      { field: 'metaStatus', header: 'Status', visible: true },
      { field: 'action', header: 'Action', visible: true },
    ];
    this.options.filter=["Name","User","Category","Tags","Status","Tags","StartData","EndDate"];
   }
  }

  // if (!this.options.isExec) {
  //   this.searchCriteriaFields = {
  //     isStatus: true,
  //     isActive: false,
  //     isTags: true,
  //     isMetaStatus: false
  //   };
  // } else {
  //   this.searchCriteriaFields = {
  //     isStatus: false,
  //     isActive: true,
  //     isTags: false,
  //     isMetaStatus: true
  //   };
  // }
  protected addNewSimulation(): void {
    this.router.navigateByUrl('/simulation/simulation-details');
  }

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

  private setMenuOptions() {
    this.items = [
      {
        label: 'Options',
        items: [
          {
            label: 'My Simulation',
            icon: 'pi pi-user',
            command: () => {
              this.showMyMeta();
            }
          },
          {
            label: 'Add Filter',
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

  private showMyMeta(): void {
    this.getAllData();
  }

  public clearAll(): any {
    this.getAllData();
    this.panelClose();
    this.onIsEditEnableChanged(false);
    
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
  protected onIsEditEnableChanged(isEditEnable: boolean) {
  
      let menuList=this.items[0].items
      menuList.forEach((menuItem) => {
          if (menuItem.label === 'Add Filter'|| menuItem.label === 'Edit Filter') {
            menuItem.label = isEditEnable ? 'Edit Filter' : 'Add Filter';
          } 
        });
  }
}

