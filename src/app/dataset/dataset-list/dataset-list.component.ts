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
import { ActionType } from 'src/app/shared/components/common-list/action-type';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-dataset-list',
  templateUrl: './dataset-list.component.html',
  styleUrl: './dataset-list.component.scss'
})
export class DatasetListComponent {
  @ViewChild(TableListComponent) tableListComponent;
  @ViewChild(SearchListComponent) searchListComponent;
  @ViewChild('rightAccordion') accordion: SidebarAccordionComponent;

  public options: Options
  public metaType = MetaType.DATAPOD;
  protected breadcrumbItems:MenuItem[];
  protected breadcrumbHome:MenuItem;
  protected errorTitle: string = '';
  protected errorContent: string = '';
  protected length: any;
  protected items: ({ label: string; items: { label: string; icon: string; command: () => void; }[]; } | { label: string; items: ({ label: string; icon: string; url: string; routerLink?: undefined; } | { label: string; icon: string; routerLink: string; url?: undefined; })[]; })[];
  protected isEditEnable: boolean = false;

  private label: string = ""
  private limit: number = 500
  private panelOpen: boolean = false;
  searchCriteriaFormGroup:any;

  constructor(private router: Router, private customerService: CustomerService, private sessionService: SessionService) {
  }

  ngOnInit(): void {
    this.setMenuOptions();
    this.setDynamicOptions();
    // this.breadcrumbHome={icon:"pi pi-home",routerLink:['/home']};
    this.breadcrumbItems=[
      { label: '<i class="pi pi-chevron-right custom-chevron"></i> Datasets', escape: false }
    ];
    // this.breadcrumbItems.push({label:"Datasets"});
  }
  private setDynamicOptions():void{
    this.options= new Options();
    this.options.isExec = false;
    this.options.tableCols =  [
      { field: 'type', header: 'Type', visible: true },
      { field: 'categoryInfo', header: 'Category', visible: false },
      { field: 'name', header: 'Name', visible: true },
      { field: 'desc', header: 'Description', visible: true },
      { field: 'updatedOn', header: 'Last Updated On', visible: false },
    ];
    this.options.requestParam = {publishFlag : 'Y'}
    this.options.actionMenu = [{
      label: "View",
      icon: "pi pi-eye",
      actionType: ActionType.VIEW,
      routerLink: 'datasets/details'
    }];
    this.options.filter=["Category","Name",""];
    this.options.isRowClickable = true;
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

  private getAllData(): void{
    const sessionDetail: Session = this.sessionService.getData()
    let searchObj = {
      metaType: this.metaType,
      name: "",
      userName: "",
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
    this.isEditEnable=false;
    this.getAllData();
    this.panelClose();
    
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
  onIsEditEnableChanged(isEditEnable: boolean) {
    this.isEditEnable=isEditEnable;
  }

}
