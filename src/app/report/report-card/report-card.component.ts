import { Component, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { MetaType } from 'src/app/shared/enums/api/meta-type.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { IColStructure } from 'src/app/shared/models/col-structure.model';
import { Options } from 'src/app/shared/components/common-list/common-list.model';
import { ActionType } from 'src/app/shared/components/common-list/action-type';
import { SidebarAccordionComponent } from 'ng-sidebar-accordion';
import { ISearchCriteria } from 'src/app/shared/components/common-list/search-criteria-model';
import { TableListComponent } from 'src/app/shared/components/common-list/table-list/table-list.component';
import { SearchListComponent } from 'src/app/shared/components/common-list/search-list/search-list.component';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-report-card',
  templateUrl: './report-card.component.html',
  styleUrl: './report-card.component.scss'
})
export class ReportCardComponent {


  @ViewChild('rightAccordion') protected accordion: SidebarAccordionComponent;
  public metaType = MetaType.REPORT;
  public options: Options;
  protected breadcrumbItems: MenuItem[];
  protected breadcrumbHome: MenuItem;
  protected tooltipValue: string = 'List'
  protected icon = "fa fa-th"
  protected tooltipObj = {};
  protected length: number;
  protected selectedOptions: any[] = [];
  protected cols: IColStructure[];
  protected tableCols: IColStructure[];
  protected isTileShow: boolean = true;
  protected errorPosition: string;
  protected messageHead: string = "";
  protected errorContent: string = "";
  protected errorTitle: string = "";
  protected showError: boolean = false;
  protected search: string = '';
  protected reportData: any[];
  protected tempReportData: any[];
  protected reportFetched: boolean = false;
  protected items: ({ label: string; items: { label: string; icon: string; command: () => void; }[]; } | { label: string; items: ({ label: string; icon: string; url: string; routerLink?: undefined; } | { label: string; icon: string; routerLink: string; url?: undefined; })[]; })[];
  private panelOpen: boolean = false;
  @ViewChild(TableListComponent) private tableListComponent;
  @ViewChild(SearchListComponent) private searchListComponent;

  protected paginatedReportData: any[] = [];
  protected isEditEnable: boolean = false;

  constructor(private commonService: CommonService, private spinner: NgxSpinnerService, private router: Router) { }

  ngOnInit(): void {
    this.setMenuOptions();
    this.setDynamicOptions();
    this.getReportData(null);
    // this.breadcrumbHome = { icon: "pi pi-home", routerLink: ['/home'] };
    // this.breadcrumbItems = [];
    // this.breadcrumbItems.push({ label: "Reports" });
    this.breadcrumbItems = [
      { label: '<i class="pi pi-chevron-right custom-chevron"></i> Reports', escape: false, routerLink: ['/reports'] }
    ];
  }

  protected navigateToArchive():void {
    this.router.navigate(['reports/history'])
  }

  protected getReportData(searchCriteria: ISearchCriteria): void {
    this.reportFetched = false
    this.spinner.show("report-spinner")
    this.commonService.getBaseEntityStatusByCriteria(this.metaType, searchCriteria?.category || "", searchCriteria?.name || "", searchCriteria?.tags || "", "", "", "", "Y", "", 500, "", false, "Y").subscribe({
      next: (response: any) => {
        this.reportData = [];
        this.reportData = response;
        this.tempReportData = response
        if (response != null && response.length > 0) {
          this.prepareColumns(Object.keys(this.reportData[0]));
        }
        this.tableCols = this.cols;
        this.selectedOptions = this.tableCols
        this.length = this.reportData.length
        this.paginateReportData(0,9)
        setTimeout(() => {
          this.spinner.hide("report-spinner");
          this.reportFetched = true;
        }, 500);
      },
      error: (err) => {
        this.reportFetched = false
        this.spinner.hide("application-manager-spinner");
        this.showError = true;
        this.errorPosition = "CENTER";
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    })
    //this.addSubscribe(observableTemp);
  }

  protected onPageChange(event): void {
    this.paginateReportData(event.first,event.rows);
  }
  protected paginateReportData(first,rows): void {
    const startIndex = first;
    const endIndex = startIndex + rows;
    this.paginatedReportData = this.reportData.slice(startIndex, endIndex);
  }
  
  protected searchReport(): void {
    let res = [];
    this.paginatedReportData = this.tempReportData;
    this.paginatedReportData.forEach(element => {
      if (element.displayName.toLowerCase().includes(this.search.toLowerCase())) {
        res.push(element)
      }
    });
    this.paginatedReportData = res;
  }

  protected submitReport(uuid: string, version: string, name: string): void {
    this.router.navigate([this.options.actionMenu[0].routerLink, uuid, version, name]);
  }

  protected getSearchCriteria(searchCriteria: ISearchCriteria):void {
    this.panelClose();
    if (!this.isTileShow)
      this.tableListComponent.getDataBySearchCriteria(searchCriteria);
    else {
      this.getReportData(searchCriteria);
    }
  }

  protected refreshClick(): void {
    this.getAllData();
  }
  
  protected panelClose(): any {
    this.accordion?.close('right');
    this.panelOpen = false;
  }

  protected clearAll(): any {
    this.isEditEnable=false
    this.panelClose();
    this.getAllData();
  }

  protected onColumnSelectChange(): void {
    const uncheckedColumns = this.tableCols.filter(
      col => !this.selectedOptions.includes(col)
    );
    const checkedColumns = this.tableCols.filter(
      col => this.selectedOptions.includes(col)
    );
    uncheckedColumns.forEach(col => {
      col.visible = false
    })
    checkedColumns.forEach(col => {
      col.visible = true
    })
  }

  protected showTooltip(td: any, span: any, field: string): void {
    if (span.offsetWidth + 28 > td.clientWidth) {
      this.tooltipObj[field] = true
    }
  }

  protected getLength(length: number): void {
    this.length = length
  }

  protected onChangeStyle(): void {
    if (this.icon == 'fa fa-th') {
      this.icon = 'fa fa-bars'
      this.isTileShow = false
      this.tooltipValue = 'Tile'
    }
    else {
      this.icon = 'fa fa-th'
      this.isTileShow = true
      this.tooltipValue = 'List'
    }
  }
  private getAllData(): void {
    let searchObj = {
      metaType: this.metaType,
      name: "",
      userName: "",
      startDate: "",
      endDate: "",
      activeStatus: "",
      status: "",
      limit: 500,
      validStatus: ""
    }
    this.searchListComponent.resetFormOnClearClick(searchObj);
    if (!this.isTileShow) {
      this.tableListComponent.getDataByCriteria(searchObj);
    }
    else {
      this.getReportData(null);
    }
  }

  private setDynamicOptions(): void {
    this.options = new Options();
    this.options.isExec = false;
    this.options.tableCols = [
      { field: 'categoryInfo', header: 'Category', visible: true },
      { field: 'name', header: 'Name', visible: true },
      { field: 'desc', header: 'Description', visible: true },
      { field: 'updatedOn', header: 'Last Updated On', visible: false },
    ];
    this.options.actionMenu = [{
      label: "View",
      icon: "pi pi-eye",
      actionType: ActionType.VIEW,
      routerLink: 'reports/details'
    }];
    this.options.requestParam = {publishFlag : 'Y'}
    this.options.filter = ["Category", "Name", ""];
    this.options.isRowClickable = true;
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
    this.isEditEnable=isEditEnable;
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

  private prepareColumns(cols: any): void {
    if (cols != null && cols.length > 0) {
      this.cols = [];
      for (let i = 0; i < cols.length; i++) {
        let colsInfo = { field: "", header: "", visible: true };
        colsInfo.field = cols[i];
        colsInfo.header = cols[i];
        colsInfo.visible = true
        this.cols.push(colsInfo);
      }
    }
  }
}
