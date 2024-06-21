import { Component, EventEmitter, Input, OnInit, Output, ViewChild, } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Subscriber, Subscription } from 'rxjs';
import { SidebarAccordionComponent } from 'ng-sidebar-accordion';

import { NextConfig } from 'src/app/app-config';
import { CommonService } from 'src/app/shared/services/common.service';

import { INextConfig } from 'src/app/shared/models/next-config.model';
import { ISearchlist } from 'src/app/shared/models/API/search-list.model';
import { IOption } from '../common-list.model';
import { ISearchCriteria } from '../search-criteria-model';
import { MetaType } from 'src/app/shared/enums/api/meta-type.enum';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

interface Status {
  name: string;
  value: string;
}

interface Active {
  name: string;
  value: string;
}

interface ValidStatus {
  name: string;
  value: string;
}

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.scss']
})
export class SearchListComponent implements OnInit {
  
  @Input() public metaType: any;
  @Input() public options: IOption;
  
  @Output() public panelclose: EventEmitter<any> = new EventEmitter<any>();
  @Output() public searchParameterData: EventEmitter<any> = new EventEmitter<any>();
  @Output() public setIsEditFlagEmitter: EventEmitter<boolean>=new EventEmitter<boolean>();
  
  @ViewChild('rightAccordion') public accordion: SidebarAccordionComponent;
  
  protected searchCriteriaFields: ISearchlist
  protected nextConfig: INextConfig;
  protected userList: any;
  protected activeTab: 1;
  protected nameList: any;
  protected categoryList: any
  
  protected statusOptions: Status[] = [
    { name: 'PENDING', value: 'Pending' },
    { name: 'QUEUED', value: 'Queued' },
    { name: 'RUNNING', value: 'Running' },
    { name: 'COMPLETED', value: 'Completed' },
    { name: 'KILLED', value: 'Killed' },
    { name: 'FAILED', value: 'Failed' },
  ];
  protected activeOptions: Active[] = [
    { name: 'YES', value: 'Y' },
    { name: 'NO', value: 'N' },
    { name: 'ALL', value: '' }
  ];
  protected validStatusOptions: ValidStatus[] = [
    { name: 'ALL', value: 'ALL' },
    { name: 'VALID', value: 'VALID' },
    { name: 'INVALID', value: 'INVALID' }
  ];
  protected searchCriteriaForm: FormGroup;

  private startDate: any;
  private endDate: any;
  private limit = 500
  private subscriptions: Subscription[] = [];

  constructor(private commonService: CommonService, private dashboardService: DashboardService) {
    this.nextConfig = NextConfig.config;
  }

  public ngOnInit() {
    this.searchCriteriaForm = this.createSearchCriteria();
    this.getNameList(this.metaType);
    this.getCategoryList("category")
    this.getUserByOrg();
  }
  protected search(): void {
    if (this.searchCriteriaForm.value.startDate) {
      let sDate = this.searchCriteriaForm.value.startDate
      const localDate = new Date(sDate);
      let strArray = localDate.toUTCString().split(' ');
      this.startDate = `${strArray[0].slice(0, 3)} ${strArray[2]} ${strArray[1]} ${strArray[4]} ${strArray[3]} UTC`;
    }
    if (this.searchCriteriaForm.value.endDate) {
      let eDate = this.searchCriteriaForm.value.endDate
      const localDate = new Date(eDate);
      let strArray = localDate.toUTCString().split(' ');
      this.endDate = `${strArray[0].slice(0, 3)} ${strArray[2]} ${strArray[1]} ${strArray[4]} ${strArray[3]} UTC`;
    }
    let searchObj: ISearchCriteria = this.getSearchCriteria()
    const isEditEnable = this.setIsEditFlag();
    this.setIsEditFlagEmitter.emit(isEditEnable);
    this.searchParameterData.emit(searchObj)
  }

  private setIsEditFlag(): boolean {
    let searchCriteriaFormValues = this.searchCriteriaForm.value;
    let isEditEnable = false;
    Object.values(searchCriteriaFormValues).forEach(value => {
      if (value != null) {
        isEditEnable = true;
      }
    });
    return isEditEnable;
  }


  protected clearAll(): void {
    this.searchCriteriaForm.reset();
    this.searchCriteriaForm = this.createSearchCriteria();
    this.search();
    this.setIsEditFlagEmitter.emit(false); 
  }

  private getNameList(type: string): void {
   if(type == MetaType.DASHBOARD){
    // this.getNameListForDashboard()
   }
   else{
    this.getCommonNameList(type)
   }
  }

  private getCommonNameList(type: string): void {
    type = this.getType(type)
    const observableTemp = this.commonService.getAllLatestByType(type, "Y").subscribe({
      next: (response) => {
        this.nameList = response;
      },
      error: (err) => {
      console.log(err)
      }
    });
    this.addSubscribe(observableTemp);
  }

  // private getNameListForDashboard(): void {
  //   this.dashboardService.getDashboardList(this.metaType, "", "").subscribe({
  //     next: (response: any) => {
  //       if(response == null || response == undefined || response.length == 0){
  //         this.nameList = []
  //       }
  //       else{
  //         this.nameList = response
  //       }
  //     },
  //     error: (err) => {
  //     console.log(err)
  //     }
  //   })
  // }

  protected getType(type: string): string {
    if (type == MetaType.REPORTEXEC) {
       return MetaType.REPORT
    }
    else if(type == MetaType.DATAPOD){
     return MetaType.DATAPOD + ',' + MetaType.DATASET
    }
    else{
      return type
    }
  }

  private getCategoryList(type: any): void {
    const observableTemp = this.commonService.getAllLatestByType(type, "Y").subscribe({
      next: (response) => {
        this.categoryList = response;
      },
      error: (response) => {
      }
    })
    this.addSubscribe(observableTemp);
  }

  private getUserByOrg(): void { 
    const type = 'user'
    const observableTemp = this.commonService.getUserByOrg(type).subscribe((respose) => {
      this.userList = respose
    })
    this.addSubscribe(observableTemp);

  }

  private getSearchCriteria(): ISearchCriteria {
    return {
      name: this.searchCriteriaForm.get('name').value?.name,
      category: this.getCategory(),
      userName: this.searchCriteriaForm.get('userName').value?.name,
      tags: this.getTags(),
      startDate: this.startDate,
      endDate: this.endDate,
      activeStatus: this.searchCriteriaForm.get('active').value,
      status: this.getStatus(),
      limit: this.limit,
      validStatus: this.searchCriteriaForm.get('statusColumn').value,
    }
  }

  private getTags(): string{
    let tags = ""
    let tempTagList = this.searchCriteriaForm.get('tags').value;
    if (tempTagList != null && tempTagList.length > 0) {
      tags = tempTagList.join(',')
    }
    return tags;
  }

  private getStatus(): String {
    let statusArr = [];
    let tempStatusList = this.searchCriteriaForm.get('statusList').value;
    if (tempStatusList != null && tempStatusList.length > 0) {
      for (let i = 0; i < tempStatusList.length; i++) {
        statusArr.push(tempStatusList[i].name)
      }
    }
    return statusArr.join(',');
  }

  private getCategory(): string {
    let categoryArr = [];
    let tempCategoryList = this.searchCriteriaForm.get('category').value;
    if (tempCategoryList != null && tempCategoryList.length > 0) {
      for (let i = 0; i < tempCategoryList.length; i++) {
        categoryArr.push(tempCategoryList[i].uuid);
      }
    }
    return categoryArr.join(',');
  }
  
  private addSubscribe(subscriber: any): void {
    if (subscriber != null && subscriber instanceof Subscriber) {
      this.subscriptions.push(subscriber);
    }
  }

  private createSearchCriteria(): FormGroup {
    return new FormGroup({
      userName: new FormControl(),
      name: new FormControl(),
      category: new FormControl([]),
      startDate: new FormControl(),
      endDate: new FormControl(),
      statusList: new FormControl(),
      active: new FormControl(),
      statusColumn: new FormControl(),
      tags: new FormControl()
    });
  }

  protected panelClose(){
    this.panelclose.emit()
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  resetFormOnClearClick(searchObj){
    this.searchCriteriaForm.reset();
  }
}

