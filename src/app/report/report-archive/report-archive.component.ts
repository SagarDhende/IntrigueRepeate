import { Component, OnInit, ViewChild } from '@angular/core';
import { TableListComponent } from 'src/app/shared/components/common-list/table-list/table-list.component';
import { Options } from 'src/app/shared/components/common-list/common-list.model';
import { ActionType } from 'src/app/shared/components/common-list/action-type';
import { MetaType } from 'src/app/shared/enums/api/meta-type.enum';
import { MenuItem } from 'primeng/api';
import { SearchListComponent } from 'src/app/shared/components/common-list/search-list/search-list.component';
import { SidebarAccordionComponent } from 'ng-sidebar-accordion';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/shared/services/session.service';
import { Session } from 'src/app/login/auth.model';
import { ISearchCriteria } from 'src/app/shared/components/common-list/search-criteria-model';
import { CommonService } from 'src/app/shared/services/common.service';
import { ActivatedRoute, ParamMap } from '@angular/router';




@Component({
  selector: 'app-report-archive',
  templateUrl: './report-archive.component.html',
  styleUrl: './report-archive.component.scss'
})
export class ReportArchiveComponent implements OnInit{

  @ViewChild(TableListComponent) tableListComponent;
  @ViewChild(SearchListComponent) searchListComponent;
  @ViewChild('rightAccordion') accordion: SidebarAccordionComponent;
  protected checked: boolean=false;
  protected refreshSeconds: number = 5;
  protected length:number
  protected breadcrumbItems:MenuItem[];
  protected breadcrumbHome:MenuItem;
  protected options: Options;
  protected metaType = MetaType.REPORTEXEC;
  protected isEditEnable: boolean = false;
  // protected items: ({ label: string; items: { label: string; icon: string; command: () => void; }[]; } | { label: string; items: ({ label: string; icon: string; url: string; routerLink?: undefined; } | { label: string; icon: string; routerLink: string; url?: undefined; })[]; })[];
  protected items:any
  private limit: number = 500
  private autoRefreshInterval: any;
  private panelOpen: boolean = false;

  constructor(private commonService: CommonService,private router: Router, private sessionService: SessionService,private routernav: ActivatedRoute,) {
  }

  ngOnInit(): void {
    this.setDynamicOptions();
     // this.breadcrumbHome={icon:"pi pi-home",routerLink:['/home']};
     this.breadcrumbItems=[];
     this.breadcrumbItems.push({label:"Reports",routerLink:['/reports']});

     this.routernav.paramMap
     .subscribe({
       next: (respones: ParamMap) => {
         this.breadcrumbItems.push({label:'History'});
       }
     })
  }
  
  private setDynamicOptions(): void {
    this.options = new Options();
    this.options.isTableCaptionEnable = false;
    this.options.isExec = true;
    this.options.tableCols = [
      { field: 'name', header: 'Name', visible: true },
      { field: 'version', header: 'Version', visible: false },
      { field: 'createdBy', header: 'Created By', visible: false },
      { field: 'updatedOn', header: 'Created On', visible: true },
      { field: 'numRows', header: 'Rows', visible: true },
      { field: 'format', header: 'Format', visible: true },
      { field: 'sizeMB', header: 'Size MB', visible: true },
      { field: 'statusList', header: 'Status', visible: true },
      { field: 'action', header: 'Action', visible: true },
    ];
    this.options.requestParam = { publishFlag: "Y" }
    this.options.actionMenu = [
    {
      label: "Download",
      icon: "fa fa-download",
      actionType: ActionType.DOWNLOAD,
    },
    // {
    //   label: "Qyery",
    //   icon: "fa-regular fa-file-code",
    //   actionType: ActionType.QUERY,
    // }
    ]
    this.options.filter=["Category","Name","StartDate","EndDate"];
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

  protected panelClose(): any {
    this.accordion?.close('right');
    this.panelOpen = false;
  }

  protected onIsEditEnableChanged(isEditEnable: boolean) {
    let menuList=this.items[0].items
    menuList.forEach((menuItem) => {
        if (menuItem.label === 'Add Filter'|| menuItem.label === 'Edit Filter') {
          menuItem.label = isEditEnable ? 'Edit Filter' : 'Add Filter';
        } 
      });
  }

  protected getSearchCriteria(searchCriteria: ISearchCriteria) {
    this.panelClose()
    this.tableListComponent.getDataBySearchCriteria(searchCriteria)
  }

  protected getLength(length: number):void {
    this.length = length
  }

  protected refreshClick(){
    this.tableListComponent.refreshClick()
  }

  protected toggleAutoRefresh(): void {
    if (this.checked) {
        this.autoRefreshInterval = setInterval(() => {
            this.tableListComponent.refreshClick();
        }, this.refreshSeconds * 1000);
    } else {
        clearInterval(this.autoRefreshInterval);
    }
  }

  public clearAll(): any {
    this.isEditEnable=false;
    this.getAllData();
    this.panelClose();
    
  }
  private getAllData(): void{
    const sessionDetail: Session = this.sessionService.getData()
    let searchObj = {
      metaType: this.metaType,
      name: "",
      userName: "",
      startDate: "",
      endDate: "",
      tags:"",
      active: "",
      publishFlag:"",
      status: "",
    }
    this.searchListComponent.resetFormOnClearClick(searchObj)
    this.tableListComponent.getDataByCriteria(searchObj)
  }

  ngOnDestroy(): void {
    clearInterval(this.autoRefreshInterval);
  }

}
