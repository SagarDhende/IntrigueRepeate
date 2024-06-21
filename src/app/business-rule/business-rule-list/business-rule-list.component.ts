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
import { MenuItem, MessageService } from 'primeng/api';
import { BusinessRuleService } from '../business-rule.service';

@Component({
  selector: 'app-business-rule-list',
  templateUrl: './business-rule-list.component.html',
  styleUrls: ['./business-rule-list.component.scss']
})
export class BusinessRuleListComponent {

  @ViewChild(TableListComponent) tableListComponent;
  @ViewChild(SearchListComponent) searchListComponent;
  @ViewChild('rightAccordion') accordion: SidebarAccordionComponent;

  protected isParamInfoListPresent: boolean = false
  protected actionButtonLoading: boolean = false;
  protected paramMap:any
  protected paramInfoResult: any;
  protected isExecDialogOpen:boolean=false;
  public options: Options
  public metaType = MetaType.RULE;
  protected breadcrumbItems:MenuItem[];
  protected breadcrumbHome:MenuItem;
  protected errorTitle: string = '';
  protected errorContent: string = '';
  protected length: any;
  protected items: ({ label: string; items: { label: string; icon: string; command: () => void; }[]; } | { label: string; items: ({ label: string; icon: string; url: string; routerLink?: undefined; } | { label: string; icon: string; routerLink: string; url?: undefined; })[]; })[];
  protected selectedRows: any;
  protected isExecutDialogOpen:boolean=false;
  protected isEditEnable:boolean=false;

  private limit: number = 500
  private panelOpen: boolean = false;
 
  constructor(private router: Router, private customerService: CustomerService, private sessionService: SessionService,
              private businessRuleService:BusinessRuleService, private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.setMenuOptions();
    this.setDynamicOptions();
    // this.breadcrumbHome={icon:"pi pi-home",routerLink:['/home']};
    this.breadcrumbItems=[
      { label: '<i class="pi pi-chevron-right custom-chevron"></i> Rules', escape: false }
    ];
    // this.breadcrumbItems.push({label:"Rules"});
  }

  setDynamicOptions(){
    this.options= new Options();
    this.options.isExec = false;
    this.options.tableCols =  [
      { field: 'select', header: '',visible: true,controlType:"checkbox"},
      { field: 'categoryInfo', header: 'Category', visible: true },
      { field: 'name', header: 'Name', visible: true },
      { field: 'desc', header: 'Description', visible: true },
      // { field: 'updatedOn', header: 'Last Updated On', visible: true },
      { field: 'lastRunTime', header: 'Last Run Time', visible: true },
      { field: 'nextRunTime', header: 'Next Run Time', visible: true },
      { field: 'status', header: 'Status', visible: true },
      { field: 'action', header: 'Action', visible: false },
    ];
    this.options.requestParam = {publishFlag : 'Y'}
    this.options.actionMenu=[{
      label: "View",
      icon: "pi pi-eye",
      actionType: ActionType.VIEW,
      routerLink:null
    }]
    this.options.filter=["Category","Name",""];
  }

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

  protected closeExecuteDialog():void{
    this.isExecutDialogOpen=false;
  }

  protected onClickExecute():void{
    this.actionButtonLoading = true
    let uuids=null;
    uuids = this.selectedRows.map((item: any) => {
      return item.uuid
    }).join(',');
    let requestObj = {};
    requestObj["paramsInfoList"] = this.paramInfoResult.data
    this.businessRuleService.execute(uuids,requestObj).subscribe({
      next:(response) =>{
        this.selectedRows=[];
        this.refreshClick();
        this.isExecDialogOpen = false
        this.actionButtonLoading = false
        this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: 'Data Submitted Successfully' });
      },
      error:(response) =>{
        this.selectedRows=[];
        this.refreshClick();
      }
    })

  }

  protected openExecuteDialogBox():void {
    this.isExecutDialogOpen = true
  }

  protected onClickExecuteAction():void{
    this.isExecutDialogOpen = false
    let uuids=null;
    uuids = this.selectedRows.map((item: any) => {
      return item.uuid
    }).join(',');
    this.businessRuleService.getParamByRules(uuids).subscribe({
      next:(response) =>{
        this.setParamListVisibility(response)
        this.paramInfoResult = response
        if(this.isParamInfoListPresent){
          this.isExecDialogOpen = true;
        }
        else{
        this.onClickExecute()
        }
      },
      error:(response) =>{
      }
    })
  }

  protected setParamListVisibility(response){
     this.paramMap = new Map()
     this.isParamInfoListPresent = false
     response.data.forEach((item,index) =>{
      if(item.paramInfo.length > 0){
        this.isParamInfoListPresent = true
        if(!this.paramMap.has(item.paramInfo[0].ref.uuid)){
          this.paramMap.set(item.paramInfo[0].ref.uuid,{uuid:item.ruleInfo.uuid,index:index})
          item.isVisible = true
        }
        else{
          item.isVisible = false
          item.dupIndex = this.paramMap.get(item.paramInfo[0].ref.uuid).index
        }
      }
     })
  }

  protected setParamValues(dupIndex,index, event){
   this.paramInfoResult.data.forEach(item =>{
    if(item.dupIndex == dupIndex){
      item.paramInfo[index].paramValue.value = event.target.value
    }
   })
   console.log(this.paramInfoResult)
  }
  
  protected getselectedRows(event:any):void{
    this.selectedRows=event;
}

  protected getLength(length: number):void {
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
    this.isEditEnable=false
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

  onIsEditEnableChanged(isEditEnable){
    this.isEditEnable=isEditEnable;
  }

}
