
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Subscriber, Subscription } from 'rxjs';

import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { saveAs } from 'file-saver'
import { format } from 'sql-formatter';

import { AppConfigService } from 'src/app/app-config.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { HelperService } from 'src/app/shared/services/helper.service';
import { CommonListService } from '../common-list.service';

import { ActionMenu, IOption } from '../common-list.model';
import { IColStructure } from 'src/app/shared/models/col-structure.model';
import { ISearchCriteria } from '../search-criteria-model';
import { ActionType } from '../action-type';
import { LogWebSocketService } from 'src/app/shared/services/log-web-socket.service';
import { SimulationService } from 'src/app/simulation/simulation.service';
import { HttpRequest } from '@angular/common/http';
import { MetaType } from 'src/app/shared/enums/api/meta-type.enum';
import { SessionService } from 'src/app/shared/services/session.service';
import { ILogin } from 'src/app/login/auth.model';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

enum logType {
  INFO = "info",
  ERROR = "ERROR",
  WARNING = "WARNING"
}


@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.scss']
})
export class TableListComponent implements OnInit {

  @Input()  public isRefresh: any
  @Input()  public metaType: any
  @Input()  public options: IOption;
  @Output() public setLength = new EventEmitter<number>();
  @Output('selection') public selectedRowsEventEmit=new EventEmitter<any> ();
  protected session: ILogin;
  protected offset: any
  protected activeItem: []
  protected isShowSQLDialogOpen: boolean = false;
  protected sqlQuery: string = ""
  protected listFetched: boolean = false;
  protected isVisible: boolean = false;
  protected dropdownOptions: IColStructure[];
  protected selectedOptions: any[] = [];
  protected errorTitle: string;
  protected errorContent: string;
  protected messageHead: string;
  protected tableRows: any = [];
  protected ExcuteParam :any[];
  protected pTableHeight: string;
  protected panelOpen: boolean = false;
  protected value: any;
  protected popUpTitle: any;
  protected isDelDialogOpen: boolean;
  protected isDownloadDialog :boolean;
  protected seconds: any = 5;
  protected isChecked: boolean = false
  protected isCheckedLog:Boolean
  protected tableHeader: IColStructure[];
  protected selectedRows: any;
  protected isExecutDialogOpen:boolean=false;
  protected isExecDialogOpen:boolean=false;
  protected uploadLogExec:boolean = false;
  protected similateLogs :any;
  protected fetchLog:boolean;
  protected isErrorLogs :boolean;
  //array used for unsubscribing observables
  private subscriptions:Subscription[]=[];
  private uuid: any;
  private actionValues: any;
  private timeOut: any
  private log: any;
  private version: Object;
  private deleteId: string;
  private privArray: any;
  private actionMenu = []
  private tempTableRows: any = [];
  private tablesCols = [
    { field: 'name', header: 'Name', visible: true },
    { field: 'version', header: 'Version', visible: true },
    { field: 'createdBy', header: 'Created By', visible: true },
    { field: 'updatedOn', header: 'Created On', visible: true },
    { field: 'active', header: 'Active', visible: true },
    { field: 'publicFlag', header: 'Public', visible: false },
    { field: 'metaStatus', header: 'Status', visible: true },
    { field: 'action', header: 'Action', visible: true },
  ];
  private execCols = [
    { field: 'name', header: 'Name', visible: true },
    { field: 'version', header: 'Version', visible: false },
    { field: 'createdBy', header: 'Submitted By', visible: false },
    { field: 'updatedOn', header: 'Submmited Time', visible: true },
    { field: 'startTime', header: 'Start Time', visible: true },
    { field: 'endTime', header: 'End Time', visible: true },
    { field: 'totalDuration', header: 'Total Time', visible: true },
    { field: 'parseDuration', header: 'Parse Time', visible: false },
    { field: 'waitDuration', header: 'Waiting Time', visible: false },
    { field: 'idleDuration', header: 'Idle Time', visible: false },
    { field: 'runMode', header: 'Run Mode', visible: false },
    { field: 'status', header: 'Status', visible: true },
    { field: 'action', header: 'Action', visible: true },
  ];
  
  constructor(private spinner: NgxSpinnerService, private helperService: HelperService,
    private commonService: CommonService, private appConfigService: AppConfigService,
    private commonlistService: CommonListService, private router: Router, private dashboardService: DashboardService,
    private messageService: MessageService, private webSocketService: LogWebSocketService,
    private simulationService: SimulationService, private sessionService: SessionService
    ) { }
 
  rxStomp: any
  ngOnInit(): void {
    this.session = this.sessionService.getData();
    if(this.metaType == MetaType.DASHBOARD){
      // this.getDashboardList(null)
    }
    else{
      this.getDataByCriteria(null)
    }
    if(this.options.tableCols.length > 0){
      this.dropdownOptions = this.options.tableCols.filter(col => col.field !== 'select');
      this.selectedOptions = this.options.tableCols.filter(column => column.visible);
      this.tableHeader = this.options.tableCols;
      this.setDynamicActionMenu()
    }
    else{
      this.dropdownOptions = this.tablesCols.filter(col => col.field !== 'select');
      this.selectedOptions = this.tablesCols.filter(column => column.visible);
      this.tableHeader = this.tablesCols;
    }
  } 

  protected selectAllRows(event:any):void{
    this.selectedRowsEventEmit.emit(this.selectedRows);

  }

  protected onSelectCheckbox():void{
    this.selectedRowsEventEmit.emit(this.selectedRows);
  }
  
  protected closeExecuteDialog():void{
    this.isExecutDialogOpen=false;
  }

  private setDynamicActionMenu(){
    this.options.actionMenu.forEach(action=>{
      this.actionMenu.push({ label: action.label, icon: action.icon, command: () => {
        this.onClickActionMenu(action)
       }})
    })
  }
  public receiveLogsDataFromChild(data: any) {
    this.tableRows = data;
  }

  public getDataBySearchCriteria(searchCriteria: ISearchCriteria){
    this.getDataByCriteria(searchCriteria);
  }

  public refreshClick(): any {
    this.pTableHeight = this.getPTableHeight();
    this.getDataByCriteria(null);
  }

  protected onColumnSelectChange() {
    const uncheckedColumns = this.dropdownOptions.filter(
      col => !this.selectedOptions.includes(col)
    );
    const checkedColumns = this.dropdownOptions.filter(
      col => this.selectedOptions.includes(col)
    );
    uncheckedColumns.forEach(col => {
      col.visible = false
    })
    checkedColumns.forEach(col => {
      col.visible = true
    })
  }

  protected getSeveritryCaption(severity: string): any {
    return this.appConfigService.getNotificationCaption(severity);
  }

  protected getSevertyStatusCaption(status: string): any {
    return this.appConfigService.getNodificationStatusCaption(status);
  }

  protected searchTableRows(searchStr: any): void {
    this.tableRows = this.helperService.setSearchTerm(this.tempTableRows, searchStr);
  }

  protected autoRefresh() {
    if (this.isChecked) {
      this.refreshData()
    }
    else {
      clearTimeout(this.timeOut)
    }
  }

  protected isDisableKill(stage: string) {
    if (stage === 'COMPLETED' || stage === 'KILLED' || stage === 'PENDING' || stage === 'FAILED') {
      return true;
    }
    else{
      return ""
    }
  }

  protected isDisableRestart(stage: string) {
    if (stage == 'KILLED' || stage == 'FAILED') {
      return false;
    }
    else {
      return true;
    }
  }

  protected closeDialog(): void {
    this.isDelDialogOpen = false
  }

  protected downloadData(): void {
    const uuid = this.activeItem['uuid'];
    const version = this.activeItem['version'];
    const format = this.activeItem['format'];
    const rows = 0;
    const layout = '';
    const isDownloadReportArchive = true;
    const observableTemp = this.commonService.reportDownloadResult(uuid, version, rows, format, layout, null, isDownloadReportArchive).subscribe({
      next: (res: HttpRequest<any>) => {
        const contentType = res.headers.get('content-type');
        const fileName =  res.headers.get('filename');
        this.downloadFile(res.body, fileName, contentType);
        this.isDownloadDialog = false;
      },
      error: (err: any) => {
        console.log(err);
      }
    });
    this.addSubscribe(observableTemp);
  }
  
  private downloadFile(data: any, fileName: string, contentType: string) {
    const blob = new Blob([data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    a.download = `${fileName}`;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  protected openDownloadDialog(name:any):void{
    this.popUpTitle = name;
    this.isDownloadDialog = true
  }

  protected deleteData() {
    const observableTemp=this.commonlistService.deleteExistingSimulatedLog(this.deleteId, this.metaType).subscribe((response) => {
      this.messageService.add({ key: 'confirm', severity: 'error', summary: this.popUpTitle, detail: 'Simulation Deleted Successfully' });
      this.isDelDialogOpen = false;
      this.refreshClick();
    });
    this.addSubscribe(observableTemp);
  }

  protected getRolePriv(): any {
    const observableTemp=this.commonlistService.getPriv().subscribe((response: any) => {
      this.privArray = response
      this.privArray.forEach((priv: any) => {
        if (priv.type == 'datapod') {
          this.actionValues = priv.privInfo
          const actionsObject: { [key: number]: string } = {};
          this.actionValues.forEach((action, index) => {
            actionsObject[index] = action;

          });
        }
      });
    })
    this.addSubscribe(observableTemp);
  }

  private getPTableHeight() {
    if (this.tableRows != null && this.tableRows.length == 0 && this.listFetched) {
      return "100px";
    }
    else if (!this.listFetched && this.tableRows != null && this.tableRows.length == 0) {
      return "550px";
    }
    else if (this.tableRows != null) {
      if (this.tableRows.length < 10) {
        return (this.tableRows.length * 54) + 50 + "px"
      } else {
        return "550px"
      }
    }
  }


  protected isButtonDisabled(buttonValue: string): boolean {
    return !this.actionValues.includes(buttonValue);
  }

  protected getDataByCriteria(searchCriteria: ISearchCriteria):void{
    this.tableRows = []; 
    this.spinner.show("table-spinner")
    this.listFetched = false;
    this.selectedRows=[];
    const observableTemp=this.commonService.getBaseEntityStatusByCriteria(this.metaType, searchCriteria?.category || "", searchCriteria?.name ||"", searchCriteria?.tags ||"" , searchCriteria?.userName ||"", 
    searchCriteria?.startDate ||"", searchCriteria?.endDate ||"", (this.options.isExec && searchCriteria == null) ? 'Y' : searchCriteria?.activeStatus || "",
     searchCriteria?.status ||"", searchCriteria?.limit|| 500, searchCriteria?.validStatus || '' ,this.options.isExec, this.options.requestParam?.publishFlag || ""
     ,this.options.uuid).subscribe({
      next: (response) => {                                  
        this.tempTableRows = []
        this.tempTableRows = response;
        if (response && this.options.isExec) {
          this.tempTableRows.forEach((element: any) => {
            element.status?.sort((a: any, b: any) => b.createdOn - a.createdOn);
          });
        } 
        this.tableRows = this.tempTableRows; 
        this.spinner.hide("table-spinner");
        this.listFetched = true;
        this.setLength.emit(this.tempTableRows.length)
        this.pTableHeight = this.getPTableHeight();
        if(this.options.isExec){
         this.convertData()
        }
      },
      error: (err) => {
        this.spinner.hide("table-spinner")
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    })
    this.addSubscribe(observableTemp);
  }
  // private getDashboardList(searchCriteria: ISearchCriteria) {
  //   this.tableRows = []; 
  //   this.spinner.show("table-spinner")
  //   this.listFetched = false;
  //   this.selectedRows=[];
  //   let type = this.session.userName
  //   let uuid = this.session.userUuid
  //   this.dashboardService.getDashboardList(this.metaType, searchCriteria?.name ||"", searchCriteria?.category || "").subscribe({
  //     next: (response: any) => {
  //       this.tempTableRows = []
  //       this.tempTableRows = response;
  //       if (response && this.options.isExec) {
  //         this.tempTableRows.forEach((element: any) => {
  //           element.status?.sort((a: any, b: any) => b.createdOn - a.createdOn);
  //         });
  //       } 
  //       this.tableRows = this.tempTableRows; 
  //       this.spinner.hide("table-spinner");
  //       this.listFetched = true;
  //       this.setLength.emit(this.tempTableRows.length)
  //       this.pTableHeight = this.getPTableHeight();
  //       if(this.options.isExec){
  //        this.convertData()
  //       }
  //     },
  //     error: (err) => {
  //       this.spinner.hide("table-spinner")
  //       this.errorTitle = 'Operation Failed';
  //       this.errorContent = err.error;
  //       this.messageHead = 'Operation Failed';
  //     }
  //   })
  // }
  private convertData(): void{
    this.tableRows.forEach((obj: any) => {
      obj.totalDuration = this.convertSecondsToHHMMSS(obj.totalDuration);
    });
    this.tableRows.forEach((obj: any) => {
      obj.parseDuration = this.convertSecondsToHHMMSS(obj.parseDuration);
    });
    this.tableRows.forEach((obj: any) => {
      obj.waitDuration = this.convertSecondsToHHMMSS(obj.waitDuration);
    })

    this.tableRows.forEach((obj: any) => {
      obj.idleDuration = this.convertSecondsToHHMMSS(obj.idleDuration);
    })
    this.tableRows.forEach((obj: any) => {
      obj.execDuration = this.convertSecondsToHHMMSS(obj.execDuration);
    })
    this.tableRows.forEach(logObject => {
      logObject.status.forEach(entry => {
        if (entry.stage === "STARTING") {
          logObject.startTime = logObject.createdOn;
        }
      });
    });
    this.tableRows.forEach(logObject => {
      logObject.status.forEach(entry => {
        if (entry.stage === "COMPLETED") {
          logObject.endTime = logObject.createdOn;
        }
      });
    });
    this.pTableHeight = this.getPTableHeight();
  }

  private setActionMenuForMap(){
    this.actionMenu = [
          { label: 'View', icon: 'pi pi-eye', command: () => {
            //this.viewData(this.activeItem['uuid'], this.activeItem['version'], this.activeItem['name'])
           }},
           { label: 'Delete', icon: 'pi pi-trash', command: () => {
            this.openConfirmationDialog(this.activeItem['name'])
            this.closeDeleteDropdown(this.activeItem['name'])
           } },
           { label: 'Edit', icon: 'fa-solid fa-pen-to-square', command: () => {
            this.editLogs()
           }}, 
           { label: 'Publish', icon: 'fa-solid fa-share-nodes', command: () => {
            this.publishLog()
           }},
           { label: 'Clone', icon: 'fa-solid fa-copy', command: () => {
            this.cloneLogs(this.activeItem['uuid'], this.activeItem['version'])
           }},
           { label: 'Log', icon: 'fa-solid fa-copy', command: () => {
            this.storeLogs(this.activeItem['uuid'])
           }},
           { label: 'Execute', icon: 'fa fa-tasks'},
           { label: 'Export', icon: "fa-solid fa-file-pdf"}   
    ]
  }

  private setActionMenuForExec(){   
   this.actionMenu = [
        { label: 'View', icon: 'pi pi-eye', command: () => {
         // this.viewData(this.activeItem['uuid'], this.activeItem['version'], this.activeItem['name'])
         }},
         { label: 'Delete', icon: 'pi pi-trash', command: () => {
          this.openConfirmationDialog(this.activeItem['name'])
          this.closeDeleteDropdown(this.activeItem['id'])
         } },
         { label: 'Kill', icon: 'fa-solid fa-xmark', command: () => {
          this.killData(this.activeItem['uuid'],this.activeItem['version'])
         } },
         { label: 'Restart', icon: 'fa-solid fa-rotate-right', command: () => {
          this.restart(this.activeItem['uuid'],this.activeItem['version'])
         } }, 
  ]
  }

  private onClickActionMenu(actionMenu:ActionMenu) {
    switch (actionMenu.actionType) {
      case ActionType.VIEW:
        this.onclickLogView()
        this.viewData(this.activeItem,actionMenu)
        break;
      case ActionType.DELETE:
        this.openConfirmationDialog(this.activeItem['name'])
        this.closeDeleteDropdown(this.activeItem['id'])
        break;
      case ActionType.KILL:
        this.killData(this.activeItem['uuid'], this.activeItem['version'])
        break;
      case ActionType.DOWNLOAD:
        this.openDownloadDialog(this.activeItem['name'])
        break;
      case ActionType.RESTART:
        this.restart(this.activeItem['uuid'], this.activeItem['version'])
        break;
      case ActionType.EDIT:
        this.editLogs()
        break;
      case ActionType.PUBLISH:
        this.publishLog()
        break;
      case ActionType.CLONE:
        this.cloneLogs(this.activeItem['uuid'], this.activeItem['version'])
        break;
      case ActionType.LOG:
        this.storeLogs(this.activeItem['uuid'])
        break;
      case ActionType.QUERY:
        this.showSQLQuery(this.activeItem['exec'])
        break;  
      case ActionType.TOGGLELOCK:
        this.toggleLogLock(this.activeItem['uuid'])
        break;
      case ActionType.EXECUTE:
        //this.onClickExecuteAction(this.activeItem['uuid'], this.activeItem['version'])
        this.isExecutDialogOpen= true
        break;  
    }
  }
  
  private showSQLQuery(query: string): void{
   this.isShowSQLDialogOpen = true
   this.sqlQuery = format(query, { language: 'mysql' }) 
  }

  // Method For Action Buttons
  private viewData(actionItem:any,actionMenu:ActionMenu) {
    //const url = this.commonlistService.getNodificationStatusCaption(this.metaType)
    this.router.navigate([actionMenu.routerLink,actionItem.uuid,actionItem.version,actionItem.name]);
  }

  testData(actionItem: any){
    if(this.options.actionMenu[0].routerLink.includes('dataset')){
      let navigationExtras: NavigationExtras = {
        queryParams: {
          "type": actionItem.type,
        }
      }
      this.router.navigate([this.options.actionMenu[0].routerLink,
        actionItem.uuid,actionItem.version,actionItem.name],navigationExtras);
    } else if(this.options.actionMenu[0].routerLink.includes('dashboard')){
      let navigationExtras: NavigationExtras = {
        queryParams: {
          "type": actionItem.type,
        }
      }
      this.router.navigate([this.options.actionMenu[0].routerLink,
        actionItem.uuid],navigationExtras);
    }
    else{
      this.router.navigate([this.options.actionMenu[0].routerLink,actionItem.uuid,actionItem.version, actionItem.name]);
    }
  }
  protected onClickExecuteAction() {
    this.isExecutDialogOpen = false;
    this.commonlistService.getParamByPipeline(this.activeItem['uuid'], this.activeItem['version']).subscribe((res) => {
      this.ExcuteParam = Array.isArray(res.data) ? res.data : [res.data];
  
      if (this.ExcuteParam.length === 0) {
        this.onClickExecute();
      } else {
        this.isExecDialogOpen = true;
      }
    });
  }

  protected onClickExecute() {
    const payload = this.ExcuteParam.map(param => ({
      key: param.paramName,
      value: param.paramValue.value
    }));
  
    this.commonlistService.getExecuteParamByPipeline(this.activeItem['uuid'], this.activeItem['version'], payload).subscribe((res) => {
      this.isExecDialogOpen = false;
    });
  
    this.getDataByCriteria(null);
  }
  
  protected onclickLogView() {
    this.uploadLogExec = true;
    this.fetchLog = false;
    this.isErrorLogs = false;
    this.spinner.show("database-details");
  
    this.commonService.readLogs(this.metaType, this.activeItem['uuid'], this.activeItem['version']).subscribe({
      next: (res) => {
        this.fetchLog = true;
        this.isErrorLogs = false;
        this.similateLogs = res.data;
        this.spinner.hide("database-details");
        console.log('check log resp', res);
      },
      error: (response) => {
        this.isErrorLogs = true;
        this.spinner.hide("database-details");
        this.errorTitle = 'Operation Failed';
        this.errorContent = response.error;
        this.messageHead = 'Operation Failed';
        console.error('Error fetching logs:', response);
      }
    });
  }

  public onCheckboxChange(): void {
    if (this.isCheckedLog) {
      this.logsWS();
      this.onclickLogView()
    }
    else {
    this.webSocketService.deactivate()
    }
  }

  private logsWS(): void {
    const observableTemp=this.simulationService.logsWithWS(this.activeItem['uuid'], this.activeItem['version'], this.metaType, this.offset, logType.INFO).subscribe((message)=>{
      console.log(message.body)
    })
    this.addSubscribe(observableTemp);
  }
  
  protected refreshLogs(): void {
    this.onclickLogView()
  }
  public downloadLogs() {
    const observableTemp=this.commonService.downloadLogs(this.metaType,this.activeItem['uuid'],this.activeItem['version']).subscribe((response) => {
      const blob = new Blob([response], { type: 'application/pdf' });
      saveAs(blob, 'simulate-log.log');
    });
    this.addSubscribe(observableTemp);
  }
  private openConfirmationDialog(name: any): void {
    this.popUpTitle = name;
    this.isDelDialogOpen = true;
  }

  private closeDeleteDropdown(rowId: string): void {
    this.deleteId = rowId
  }

  private killData(uuid: any, version: any) {
    const observableTemp=this.commonlistService.Killed(uuid, this.metaType, version).subscribe((response: any) => {
    });
    this.addSubscribe(observableTemp);
  }

  private restart(uuid: any, version: any) {
    const observableTemp=this.commonlistService.Restart(uuid, version, this.metaType).subscribe((response: any) => {
    });
    this.addSubscribe(observableTemp);
  }

  private storeLogs(rowData: any) {
    this.uuid = rowData;
    console.log(rowData, this.metaType)
    const observableTemp=this.commonlistService.getUuid(rowData, this.metaType).subscribe((response) => {
      this.log = response;
      this.version = this.log.version
      this.getVersionByUuid(this.version);
    })
    this.addSubscribe(observableTemp);
  }

  private getVersionByUuid(version: any) {
    console.log(this.version)
    const observableTemp=this.commonlistService.viewLogs(this.uuid, this.metaType, version).subscribe((response) => {
    })
    this.addSubscribe(observableTemp);
  }

  private editLogs() {
    console.log("Inside Edit Logs")
  }

  private toggleLogLock(id: string) {
    if (this.isVisible) {
      const observableTemp=this.commonlistService.unLock(id, this.metaType).subscribe((response) => {

      });
      this.addSubscribe(observableTemp);
    } else {
      const observableTemp=this.commonlistService.Lock(id, this.metaType).subscribe((response) => {
      });
      this.addSubscribe(observableTemp);
    }
  }

  private publishLog() {
    console.log("Inside Publish Logs")
  }

  private cloneLogs(uuid: string, version: string) {
    const observableTemp=this.commonlistService.Clone(uuid, this.metaType, version).subscribe((response: any) => {
    })
    this.addSubscribe(observableTemp);
  }

  private convertSecondsToHHMMSS(totalSeconds) {
    if (totalSeconds <= 0) {
      return "-NA-";
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return formattedTime;
  }

  private refreshData() {
    this.getDataByCriteria(null);
    this.timeOut = setTimeout(() => {
      this.refreshData();
    }, this.seconds * 1000)
  }

  private addSubscribe(subscriber:any):void {
    if(subscriber!=null && subscriber instanceof Subscriber){     
      this.subscriptions.push(subscriber);
    }
  }

  ngOnDestroy() {
    for(let subscription of this.subscriptions){
      subscription.unsubscribe();
    }
  }
  
}

