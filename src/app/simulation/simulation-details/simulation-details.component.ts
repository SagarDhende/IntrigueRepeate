
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DataType } from 'src/app/shared/enums/data-type.enmu';
import { MetaType } from 'src/app/shared/enums/api/meta-type.enum';
import { IParamlistHolder, ParamlistHolder } from 'src/app/shared/models/API/paramlist-holder.model';

import { CommonService } from 'src/app/shared/services/common.service';
import { SubjectService } from 'src/app/shared/services/subject.service';
import { OutputType } from '../output-type.enum';
import { ScenarioInfo } from '../scenario-info.model';
import { SimulationService } from '../simulation.service';
import { saveAs } from 'file-saver'
import { LogWebSocketService } from 'src/app/shared/services/log-web-socket.service';
import { ActivatedRoute } from '@angular/router';
import { Subscriber, Subscription } from 'rxjs';
import { AppConfig } from 'src/app/layout/service/app.layout.service';


enum logType {
  INFO = "info",
  ERROR = "ERROR",
  WARNING = "WARNING"
}

@Component({
  selector: 'app-simulation-details',
  templateUrl: './simulation-details.component.html',
  styleUrls: ['./simulation-details.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class SimulationDetailsComponent implements OnInit, OnDestroy {

  //Array used for usubscribing observables
  subscriptions:Subscription[]=[];
  // existing logs
  visible:boolean=true
  isFormVisible: boolean = true
  uuid: any
  version: any
  execSimulateData: any
  isButtonEnabled: boolean = true;
  isrefreshEnabled: boolean = true
  offset: any
  newId: any;
  simulateView: any;
  name: string;


  themeConfig: AppConfig;
  errorTitle: string = 'Operation Failed';
  messageHead: string = 'Operation Failed';

  sampleVizOption: any;
  vizOption: any = {
    manipulation: {
      enabled: true
    }
  };

  simulateTypes: any[] = [{ name: 'New', key: 'N' }, { name: 'Existing', key: 'E' }];
  selectedSimulateType = this.simulateTypes[0].key;
  isSimulateBtnDisabled: boolean = true;
  simulateForm: FormGroup = new FormGroup({
    'selectedSimulationExec': new FormControl('', []),
    'selectedGraphSimulate': new FormControl('', []),
    'simulateName': new FormControl('', [Validators.required])
  });

  allSimulationExec: any;
  allGraphpod: any;

  @ViewChild('cloneLogRef') cloneLogRef: ElementRef;
  isCloneDBInprogress: boolean = false;
  isCloneDBError: boolean = false;
  isCloneDBSuccess: boolean = false;
  isCloneDBRunBtnShow: boolean = true;
  isCloneDBRunBtnDisabled: boolean = true;
  isCloneSampleSucess: boolean = true;
  cloneDBErrorContent: any;
  cloneDBResult: any = null;
  wserrorContent: string;
  similateLogs: any;
  isChecked: boolean;
  isErrorLogs: boolean
  cloneSampleLimit: number = 100
  cloneDBId: any = "";
  filterDialog: boolean;
  islogs: boolean = false;
  isKGInprogess: boolean = false;
  isKGError: boolean = false;

  kgErrorContent: any;
  KGData: any;
  KGResult: any = null;
  isKGSucess: boolean = false;
  filterForm: FormGroup;
  edgeFilterForm: FormGroup;
  dataTypeEnum = DataType;
  isFilterSubmited = false;
  logicalOperators: any = [{ 'text': 'AND', 'caption': 'AND' }, { 'text': 'OR', 'caption': 'OR' }];
  operators: any = [
    { "caption": "EQUAL (=)", "value": "=" },
    { "caption": " NOT EQUAL (!=)", "value": "!=" },
    { "caption": "LESS THAN (<)", "value": "<" },
    { "caption": "GREATER THAN (>) ", "value": ">" },
    { "caption": "LESS OR EQUAL (<=) ", "value": "<=" },
    { "caption": "GREATER OR EQUAL (>=)  ", "value": ">=" }
  ];
  KGForm: FormGroup = new FormGroup({
    // 'type': new FormControl({ value: '', disabled: false }),
    'selectedItem': new FormControl({ value: '', disabled: false })
  });


  scenarioTab: Array<ScenarioInfo> = [];
  scenarioTabIndex: any;
  isOpenParamsDialog: boolean = false;
  allGraphSimulates: any;
  allNodeLabels: any;
  allEdgeLabels: any;
  simulateInterval: any
  outputTypeEnum: typeof OutputType = OutputType;
  simulateOuputcols: any;
  cols: any;
  simulationStatusInprogess: boolean;
  tabInfo: ScenarioInfo;
  isCloneDBLogInprogess: boolean;
  runSimulateLog: any;
  wsLogsList: any;

  constructor(private route: ActivatedRoute,private cdref: ChangeDetectorRef, private spinner: NgxSpinnerService, private fb: FormBuilder,
    private commonService: CommonService, private simulationService: SimulationService,
    private subjectShareService: SubjectService, private messageService: MessageService, private confirmationService: ConfirmationService, private webSocketService: LogWebSocketService) { }

  ngOnInit(): void {
    this.selectedSimulateType =this.simulateTypes[0].key;
    this.uuid = this.route.snapshot.paramMap.get('uuid');
    this.version = this.route.snapshot.paramMap.get('version');
    this.name= this.route.snapshot.paramMap.get('name')
    if (this.uuid != null) {
      this.selectedSimulateType =this.simulateTypes[1].key;
      this.isFormVisible = true; 
      this.isButtonEnabled=false
    }
    this.getAllLatestByType(MetaType.GRAPHPOD);
    this.getAllLatestGraphSimulate(MetaType.GRAPHSIMULATE);
    this.getAllLatestGraphSimulateExec(MetaType.GRAPHSIMULATEExec);
    this.simulateView = {};
    //this.themeConfig = NextConfig.config;
    const observableTemp=this.subjectShareService.themeBehaviour.asObservable().subscribe({
      next: (response: AppConfig) => {
        this.themeConfig = null;
        this.themeConfig = response;
      }
    });
    this.addSubscribe(observableTemp);
    this.sampleVizOption = this.vizOption;

    this.filterForm = this.fb.group({
      rows: this.fb.array([])
    });

    this.edgeFilterForm = this.fb.group({
      rows: this.fb.array([])
    });

    this.scenarioTabIndex = 0;
    this.scenarioTab[0] = this.simulationService.getScenarioDefaultValue();
    this.tabInfo = this.scenarioTab[0];
    this.OnClickSimulationExec()
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  //Select Simulation Start
  public resetSimulate(): void {
    this.simulateForm.reset();
    this.resetAllforms();
  }
  public OnClickSimulationType(event: any): void {
    this.resetAllforms();
    this.simulateForm.reset();
    this.KGForm.enable();
    if (this.selectedSimulateType == "E") {
      this.KGForm.disable();
    }
  }
  public onChangeSimulate(): void {
    this.tabInfo.isSimulateRunBtnShow = true;
    this.tabInfo.isSimulateRunBtnDisabled = true;
    this.isCloneDBRunBtnDisabled = false;
    let simulate = (this.simulateForm as FormGroup).value.selectedGraphSimulate;
    this.cloneDBId = simulate.cloneDatasource.ref.uuid
    
    this.scenarioTab[0].graphSimulateForm.controls["selectedGraphSimulate"].setValue(simulate);
    this.getKGOnyByUuidAndVersion(simulate.dependsOn.ref.uuid);
  }
   /*public onChangeSimulationExec():void{
    this.isSimulateBtnDisabled=true;
    if(this.simulateForm.value.selectedSimulationExec?.uuid){
      this.isSimulateBtnDisabled=false;
    }
  }*/
  public OnClickSimulationExec(): void {
    this.getGraphSimulationExecByUuidAndVersion();
    this.resetAllforms();
    this.isSimulateBtnDisabled = true;
  }

  private getGraphSimulationExecByUuidAndVersion() :void {
    let type = 'graphSimulateExec'
    let version = this.version
    const observableTemp=this.commonService.getOnyByUuidAndVersion(type, this.uuid, version).subscribe((response) => {
      this.execSimulateData = response
      this.getGraphSimulationOnyByUuidAndVersion(this.execSimulateData.dependsOn.ref.uuid);   
    });
    this.addSubscribe(observableTemp);
  }

  private getGraphSimulationOnyByUuidAndVersion(uuid: string): void {
    const observableTemp=this.commonService.getOnyByUuidAndVersion(MetaType.GRAPHSIMULATE, uuid, '').subscribe({
      next: (response) => {
        this.sampleVizOption=null;
        this.cloneDBId = response.cloneDatasource.ref.uuid
        this.isCloneDBRunBtnShow = false;
        this.isCloneDBInprogress = true;
        this.spinner.show("clone-db-execute");
        this.isCloneDBSuccess = true;
        this.simulateView = response;
        this.simulateView.simulateExec = {};
        this.simulateView.simulateExec.ref = {};
        this.simulateView.simulateExec.ref.uuid = this.uuid;
        this.simulateView.simulateExec.ref.version =this.version
        this.simulateView.simulateExec.ref.type = MetaType.GRAPHSIMULATEExec;

        this.getKGOnyByUuidAndVersion(response.dependsOn.ref.uuid);
        this.scenarioTab[0].graphSimulateForm.disable();
        this.scenarioTab[0].graphSimulateForm.controls["selectedGraphSimulate"].setValue(response);
        this.scenarioTab[0].isSimulateRunBtnShow = false;
        let outputInfo = (this.scenarioTab[0].graphSimulateForm as FormGroup).value.selectedGraphSimulate.outputInfo;
        if (outputInfo != null && outputInfo.length > 0) {
          for (let i = 0; i < outputInfo.length; i++) {
            let output: any = {};
            output.isOutputError = false;
            output.outputId = outputInfo[i].outputId;
            output.isOutputInprogess = false;
            output.isOutputSuccess = false;
            output.title = outputInfo[i].title;
            output.type = outputInfo[i].type;
            output.highlightInfo = outputInfo[i].highlightInfo;
            output.ngxSpinnerName = outputInfo[i].title + "_" + outputInfo[i].outputId;
            output.result = null;
            output.isOutoutNoRecord = false;
            output.errorContent = null;
            output.highlightInfo = outputInfo[i].highlightInfo;
            this.scenarioTab[0].outputInfo.push(output);
          }
        }
      },
      error: (response) => {

      }
    });
    this.addSubscribe(observableTemp);
  }
  //Select Simulattion End

  /*------------Clone DB Start-------------------*/

  public onClickCloneDBRun(): void {
    this.isButtonEnabled = false
    const offset = this.offset
    this.simulateView.name = this.simulateForm.value.simulateName;
    let simulate = (this.simulateForm as FormGroup).value.selectedGraphSimulate;
    this.spinner.show("clone-db-execute");
    this.isCloneDBRunBtnShow = false;
    this.isCloneDBInprogress = true;
    this.isCloneDBError = false;
    const observableTemp=this.simulationService.simulateClone(simulate.uuid, "", this.simulateView).subscribe({
      next: (response) => {
        this.simulateView.simulateExec = {};
        this.simulateView.simulateExec.ref = response;
        this.simulationService.logsWithWS(response.uuid, response.version, MetaType.GRAPHSIMULATEExec, offset, logType.INFO);
        this.simulateStatusForQUEUED(response.uuid);
        this.simulateInterval = setInterval(() => {
          this.simulateStatusForQUEUED(response.uuid);
        }, 5000)
      },
      error: (response) => {
        this.isCloneDBInprogress = false;
        this.isCloneDBError = true;
        this.spinner.hide("clone-db-execute");
        this.cloneDBErrorContent = response.error;
        if (typeof this.cloneDBErrorContent == 'object') {
          this.cloneDBErrorContent = response.error.message;
        }
      }
    });
    this.addSubscribe(observableTemp);
  }

  private confirmRollBack() {
    const observableTemp=this.simulationService.simulateRollBack(this.simulateView.simulateExec.ref.uuid, "").subscribe({
      next: (response) => {
        if (response == true) {

          this.messageService.add({ severity: 'success', summary: 'Success', detail: "Rollback Completed Succesfully" });
          this.getGraphBySimulateExecSample(this.simulateView.simulateExec.ref.uuid, this.simulateView.simulateExec.ref.version, null);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: "Rollback Operation Failed" });
        }
        this.confirmationService.close();
      },
      error: (response) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Rollback Operation Failed" });
        this.confirmationService.close();

      }
    });
    this.addSubscribe(observableTemp);
  }

  public onClickRollBack() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to rollback changes ?',
      accept: () => {
        this.confirmRollBack();
      },
      reject: () => {
        this.confirmationService.close();
      }
    });
  }

  private confirmRedo() {
    const observableTemp=this.simulationService.simulateRedo(this.simulateView.simulateExec.ref.uuid, "").subscribe({
      next: (response) => {
        if (response == true) {

          this.messageService.add({ severity: 'success', summary: 'Success', detail: "Redo Completed Succesfully" });
          this.getGraphBySimulateExecSample(this.simulateView.simulateExec.ref.uuid, this.simulateView.simulateExec.ref.version, null);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: "Redo Operation Failed" });
        }
        this.confirmationService.close();
      },
      error: (response) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Redo Operation Failed" });
        this.confirmationService.close();
      }
    });
    this.addSubscribe(observableTemp);
  }

  public onClickRedo() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to redo changes ?',
      accept: () => {
        this.confirmRedo();
      },
      reject: () => {
        this.confirmationService.close();
      }
    });

  }


  private simulateStatusForQUEUED(uuid: string): void {
    const observableTemp=this.simulationService.simulateStatus(uuid).subscribe({
      next: (response: any) => {
        this.isCloneDBInprogress = false;
        this.cloneLogs(uuid);

        if (response.statusCode == "200" && response.data == "QUEUED") {
          clearInterval(this.simulateInterval);
          this.isCloneDBSuccess = true;
          this.isCloneDBInprogress = false;
          this.isCloneDBLogInprogess = false;
          // this.simulateOutput(uuid, this.scenarioTabIndex);
          this.simulationStatusInprogess = false;
          this.getGraphBySimulateExecSample(this.simulateView.simulateExec.ref.uuid, this.simulateView.simulateExec.ref.version, null);
        }
        else if (response.statusCode == "500" && response.data == "FAILED") {
          clearInterval(this.simulateInterval);
          this.spinner.hide("clone-db-execute");
          this.isCloneDBInprogress = false;
          this.isCloneDBError = true;
          this.cloneDBErrorContent = response.message;
          this.simulationStatusInprogess = false;
        }
      },
      error: (response) => {
        clearInterval(this.simulateInterval);
        this.simulationStatusInprogess = false;
        this.isCloneDBError = true;
        this.scenarioTab[this.scenarioTabIndex].errorContent = response.error;
        this.cloneDBErrorContent = response.error;
        if (typeof this.cloneDBErrorContent == 'object') {
          this.cloneDBErrorContent = response.error.message;
        }
      }
    });
    this.addSubscribe(observableTemp);
  }

  private cloneLogs(uuid: string): void {
    this.isCloneDBLogInprogess = true;
    const observableTemp=this.simulationService.cloneLogs(uuid, "", -1000, 0, "INFO_LOG", MetaType.GRAPHSIMULATEExec).subscribe({
      next: (response) => {
        this.cloneDBResult = response.data;
        this.offset = response.offset;
      },
      error: (response) => {
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getGraphBySimulateExecSample(uuid: string, version: string, data: any): void {
    this.spinner.show("clone-db-execute");
    this.isCloneDBInprogress = true;
    this.isCloneDBError = false;
    const observableTemp=this.simulationService.getGraphBySimulateExecSample(uuid, version, data, this.cloneSampleLimit).subscribe({
      next: (response) => {
        this.isCloneSampleSucess = true;
        this.cloneDBResult = response;
        this.spinner.hide("clone-db-execute");
        this.isCloneDBInprogress = false;
        this.scenarioTab[0].isSimulateRunBtnDisabled = false;
        if (this.selectedSimulateType == "E") {
          this.simulateStatus(uuid);
        }

      },
      error: (response) => {
        this.spinner.hide("clone-db-execute");
        this.isCloneDBInprogress = false;
        this.isCloneDBError = true;
        this.cloneDBErrorContent = response.error;
        if (typeof this.cloneDBErrorContent == 'object') {
          this.cloneDBErrorContent = response.error.message;
        }
      }
    });
    this.addSubscribe(observableTemp);
  }
  // method for logs in dialog
  public openLogsDialog(): void {
    this.isErrorLogs = false
    this.islogs = true;
    const newId = this.simulateView.simulateExec.ref.uuid
    const type = this.simulateView.simulateExec.ref.type
    const version = this.simulateView.simulateExec.ref.version
  

    const observableTemp=this.commonService.readLogs(type, newId, version).subscribe({
      next: (response) => {
        this.similateLogs = response.data;
      },
      error: (response) => {
        this.wserrorContent = response.error
        this.isErrorLogs = true
      }
    });
    this.addSubscribe(observableTemp);

  }

  public onCheckboxChange(): void {
    if (this.isChecked) {
      this.logsWS();
    }
    else {
      this.webSocketService.deactivate()
    }
  }


  // Method For Ws
  private logsWS(): void {
    const uuid = this.simulateView.simulateExec.ref.uuid
    const version = this.simulateView.simulateExec.ref.version
    const offset = this.offset
    const observableTemp=this.simulationService.logsWithWS(uuid, version, MetaType.GRAPHSIMULATEExec, offset, logType.INFO).subscribe((response) => {
      this.similateLogs += response.body;

    });
    this.addSubscribe(observableTemp);
  }

  //Method for download logs
  public downloadLogs() {
    const newId = this.simulateView.simulateExec.ref.uuid
    const type = this.simulateView.simulateExec.ref.type
    const version = this.simulateView.simulateExec.ref.version
    const observableTemp=this.commonService.downloadLogs(type, newId, version).subscribe((response) => {
      const blob = new Blob([response], { type: 'application/pdf' });
      saveAs(blob, 'simulate-log.log');
    });
    this.addSubscribe(observableTemp);
  }
  // method for logs in dialog
  public refreshLogs(): void {
    const newId = this.simulateView.simulateExec.ref.uuid
    const type = this.simulateView.simulateExec.ref.type
    const version = this.simulateView.simulateExec.ref.version
    

    const observableTemp=this.commonService.readLogs(type, newId, version).subscribe((response: any) => {
      this.similateLogs = response.data;
    });
    this.addSubscribe(observableTemp);
  }
  /*------------Clone DB END-------------------*/

  //KG Start

  public onChangeItem(): void {
    if (this.KGForm.value.selectedItem?.uuid) {
      this.isKGInprogess = true;
      this.spinner.show('graph-sample');
      this.simulateView.name = this.simulateForm.value.simulateName;
      this.getKGOnyByUuidAndVersion(this.KGForm.value.selectedItem.uuid);
    } else {
      this.isKGSucess = false;
      this.isKGInprogess = false;
      this.isKGError = false;
      this.KGResult = null;
    }
  }


  public openFilterDialog(): void {
    this.filterDialog = true;
  }

  get filterFormArr(): FormArray {
    return this.filterForm.get("rows") as FormArray;
  }

  public addFilterRow(): void {
    this.filterFormArr.push(this.initFilterRows());
    this.filterFormArr.controls[0].get("logicalOperator").disable();
    if (this.filterForm.value.rows.length > 1) {
      this.filterForm.controls[this.filterForm.value.rows.length - 1].get("logicalOperator").setValue(this.logicalOperators[0]);
    }
  }

  public deleteFilterRow(): void {
    this.filterFormArr.controls.forEach((filter: any, index: number) => {
      if (filter.get('select').value) {
          this.filterFormArr.removeAt(index)
          this.deleteFilterRow()
      }
    })
  }

  get edgeFilterFormArr(): FormArray {
    return this.edgeFilterForm.get("rows") as FormArray;
  }

  public addEdgeFilterRow(): void {
    this.isFilterSubmited = false;
    this.edgeFilterFormArr.push(this.initFilterRows());
    this.edgeFilterFormArr.controls[0].get("logicalOperator").disable();
    if (this.edgeFilterForm.value.rows.length > 1) {
      this.edgeFilterFormArr.controls[this.edgeFilterForm.value.rows.length - 1].get("logicalOperator").setValue(this.logicalOperators[0]);
    }
  }

  public deleteEdgeFilterRow(): void {
    this.edgeFilterFormArr.controls.forEach((filter: any, index: number) => {
      if (filter.get('select').value) {
        this.edgeFilterFormArr.removeAt(index);
        this.deleteEdgeFilterRow()
      }
    })
  }

  onChangeSelectAllEdgeFilter(event){
    if(this.edgeFilterFormArr.length>0)
    {
      this.edgeFilterFormArr.controls.forEach(filter => {
        filter.get('select').setValue(event.checked);
      })
    }
  }

  onChangeSelectAllNodeFilter(event){
    if(this.filterFormArr.length>0)
    {
      this.filterFormArr.controls.forEach(filter=> {
        filter.get('select').setValue(event.checked);
      })
    }
  }

  public onNodeDblClick(event: any): void {

  }

  public onChangeNodeLabel(label: any, index: number): void {
    label = label.get("source").value.label;
    let allAttributes = this.getNodePropertyByLabel(this.KGData, label);
    this.filterFormArr.controls[index].get("allAttributes").setValue(allAttributes);

  }

  public onChangeEdgeLabel(label: any, index: number): void {
    label = label.get("source").value.label;
    let allAttributes = this.getEdgePropertyByLabel(this.KGData, label);
    this.edgeFilterFormArr.controls[index].get("allAttributes").setValue(allAttributes);
  }
  public refreshKGInput(): void {
    this.filterSubmit();
  }


  public filterSubmit(): any {
    this.isFilterSubmited = true;
    let graphFilter: any = {};
    if (this.filterForm.invalid) {
      return false;
    }
    graphFilter.nodeFilter = this.getNodeFilter(this.filterForm);
    graphFilter.edgeFilter = this.getEdgeFilter(this.edgeFilterForm);
    this.filterDialog = false;

    this.simulateView.filer = graphFilter;
    if (this.KGData == null) {
      this.getKGOnyByUuidAndVersion(this.KGForm.value.selectedItem.uuid);
    } else
      this.getGraphBySimulateExecSample(this.simulateView.simulateExec.ref.uuid, this.simulateView.simulateExec.ref.version, graphFilter);
    //this.getGraphSample(this.KGForm.value.selectedItem.uuid, "", JSON.stringify(graphFilter));
  }

  private getAllLatestByType(type: any): void {
    const observableTemp=this.commonService.getAllLatest(type, "Y").subscribe({
      next: (response) => {
        this.allGraphpod = response;
      },
      error: (response) => { }
    });
    this.addSubscribe(observableTemp);
  }

  private initFilterRows(): FormGroup {
    return new FormGroup({
      'select': new FormControl(false),
      'logicalOperator': new FormControl('', [Validators.required]),
      'source': new FormControl('', [Validators.required]),
      'attribute': new FormControl('', [Validators.required]),
      'allAttributes': new FormControl('', []),
      'operator': new FormControl('', [Validators.required]),
      'value': new FormControl('', [Validators.required])
    });
  }

  private getNodes(kgData: any, lable: string): any {
    let source = [];
    for (let i = 0; i < kgData.nodeInfo.length; i++) {
      let sourceInfo: any = {};
      sourceInfo.index = i;
      sourceInfo.label = kgData.nodeInfo[i].nodeType;
      sourceInfo.uuid = kgData.nodeInfo[i].nodeSource?.ref?.uuid || null;
      sourceInfo.type = kgData.nodeInfo[i].nodeSource?.ref?.type || null;
      sourceInfo.name = kgData.nodeInfo[i].nodeSource?.ref?.name || null;
      source[i] = sourceInfo;
    }
    return source;
  }

  private getNodePropertyByLabel(kgData: any, label: string): any {
    let propertyList = [];
    for (let i = 0; i < kgData.nodeInfo.length; i++) {
      if (kgData.nodeInfo[i].nodeType == label) {
        for (let j = 0; j < kgData.nodeInfo[i].nodeProperties.length; j++) {
          let propertyInfo: any = {};
          propertyInfo.index = i;
          propertyInfo.label = kgData.nodeInfo[i].nodeType;
          propertyInfo.uuid = kgData.nodeInfo[i].nodeSource.ref.uuid;
          propertyInfo.type = kgData.nodeInfo[i].nodeSource.ref.type;
          propertyInfo.name = kgData.nodeInfo[i].nodeSource.ref.name
          propertyInfo.propertyName = kgData.nodeInfo[i].nodeProperties[j].attrName;
          propertyInfo.propertyType = kgData.nodeInfo[i].nodeProperties[j].attrType;
          propertyList[j] = propertyInfo;
        }
      }
    }
    return propertyList
  }

  private getEdges(kgData: any, lable: string): any {
    let source = [];
    for (let i = 0; i < kgData.edgeInfo.length; i++) {
      let sourceInfo: any = {};
      sourceInfo.index = i;
      sourceInfo.label = kgData.edgeInfo[i].edgeType;
      sourceInfo.dlabel = "( " + kgData.edgeInfo[i].sourceNodeType + " ) -" + kgData.edgeInfo[i].edgeType + "-( " + kgData.edgeInfo[i].targetNodeType + " )";
      sourceInfo.uuid = kgData.edgeInfo[i].edgeSource?.ref?.uuid || null;
      sourceInfo.type = kgData.edgeInfo[i].edgeSource?.ref?.type || null;;
      sourceInfo.name = kgData.edgeInfo[i].edgeSource?.ref?.name || null;
      source[i] = sourceInfo;
    }
    return source;
  }
  private getEdgePropertyByLabel(kgData: any, label: string): any {
    let propertyList = [];
    for (let i = 0; i < kgData.edgeInfo.length; i++) {
      if (kgData.edgeInfo[i].edgeType == label) {
        for (let j = 0; j < kgData.edgeInfo[i].edgeProperties.length; j++) {
          let propertyInfo: any = {};
          propertyInfo.index = i;
          propertyInfo.label = kgData.edgeInfo[i].edgeType;
          propertyInfo.srcNodeType = kgData.edgeInfo[i].sourceNodeType
          propertyInfo.dstNodeType = kgData.edgeInfo[i].targetNodeType
          propertyInfo.uuid = kgData.edgeInfo[i].edgeSource.ref.uuid;
          propertyInfo.type = kgData.edgeInfo[i].edgeSource.ref.type;
          propertyInfo.name = kgData.edgeInfo[i].edgeSource.ref.name
          propertyInfo.propertyName = kgData.edgeInfo[i].edgeProperties[j].attrName;
          propertyInfo.propertyType = kgData.edgeInfo[i].edgeProperties[j].attrType;
          propertyList[j] = propertyInfo;
        }
      }
    }
    return propertyList
  }

  private getNodeFilter(filterForm: any): any {
    let nodeFilters = [];
    if (filterForm.value) {
      for (let i = 0; i < filterForm.value.rows.length; i++) {
        let nodeInfo: any = {}
        nodeInfo.logicalOperator = filterForm.value.rows[i].logicalOperator?.text || "";
        nodeInfo.operator = filterForm.value.rows[i].operator.value;
        nodeInfo.source = filterForm.value.rows[i].source.label;
        nodeInfo.operand = {};
        nodeInfo.operand.propertyName = filterForm.value.rows[i].attribute.propertyName;
        nodeInfo.operand.propertyType = filterForm.value.rows[i].attribute.propertyType;
        nodeInfo.operand.propertyValue = filterForm.value.rows[i].value
        nodeFilters[i] = nodeInfo;
      }
    }
    return nodeFilters;
  }
  private getEdgeFilter(edgeFilterForm: any): any {
    let edgeFilters = [];
    if (edgeFilterForm.value) {
      for (let i = 0; i < edgeFilterForm.value.rows.length; i++) {
        let edgeInfo: any = {}
        edgeInfo.logicalOperator = edgeFilterForm.value.rows[i].logicalOperator?.text || "";
        edgeInfo.operator = edgeFilterForm.value.rows[i].operator.value;
        edgeInfo.source = edgeFilterForm.value.rows[i].source.label;
        edgeInfo.srcNodeType = edgeFilterForm.value.rows[i].srcNodeType;
        edgeInfo.dstNodeType = edgeFilterForm.value.rows[i].dstNodeType;
        edgeInfo.operand = {};
        edgeInfo.operand.propertyName = edgeFilterForm.value.rows[i].attribute.propertyName;
        edgeInfo.operand.propertyType = edgeFilterForm.value.rows[i].attribute.propertyType;
        edgeInfo.operand.propertyValue = edgeFilterForm.value.rows[i].value;
        edgeFilters[i] = edgeInfo;
      }
    }
    return edgeFilters
  }

  private getKGOnyByUuidAndVersion(uuid: string): void {
    const observableTemp=this.commonService.getOnyByUuidAndVersion(MetaType.GRAPHPOD, uuid, '').subscribe({
      next: (response) => {
        this.KGData = response;
        this.KGForm.controls['selectedItem'].setValue(response);
        this.allNodeLabels = this.getNodes(this.KGData, null);
        this.allEdgeLabels = this.getEdges(this.KGData, null);
        if (this.selectedSimulateType == "E") {
          this.getGraphBySimulateExecSample(this.simulateView.simulateExec.ref.uuid, this.simulateView.simulateExec.ref.version, null);

        }
        //this.getGraphSample(uuid, "", null);
      },
      error: (response) => {

      }
    });
    this.addSubscribe(observableTemp);
  }

  private getGraphSample(uuid: string, version: string, data: any): void {
    this.isKGInprogess = true;
    this.isKGError = false;
    this.spinner.show('graph-sample');
    const observableTemp=this.simulationService.getGraphSample(uuid, version, data).subscribe({
      next: (response) => {
        this.spinner.hide('graph-sample');
        this.isKGSucess = true;
        this.KGResult = response;
        this.isKGInprogess = false;
        this.isKGError = false;
        if (this.selectedSimulateType == "N") {
          (this.scenarioTab[0].graphSimulateForm as FormGroup).controls["selectedGraphSimulate"].enable();
        }
        else {
          this.simulateStatus(this.simulateForm.value.selectedSimulationExec.uuid);
        }

      },
      error: (response) => {
        this.spinner.hide('graph-sample');
        this.isKGInprogess = false;
        this.isKGError = true;
        this.kgErrorContent = response.error;
        if (typeof this.kgErrorContent == 'object') {
          this.kgErrorContent = response.error.message;
        }
      }
    });
    this.addSubscribe(observableTemp);
  }

  //KG End


  //Run Simulate Start

  public openParamDialog(index: number): void {
    this.isOpenParamsDialog = true;
  }

  public enterKeyChangeHeader(event: any, index: number): void {
    if (event.keyCode == 13) {
      this.scenarioTab[index].isHeaderEdit = false;
      let tempTabIndex = this.scenarioTabIndex;
      this.scenarioTabIndex = 0;
      setTimeout(() => {
        this.scenarioTabIndex = tempTabIndex;
      }, 100)
    }
  }

  public onClickSimulateExecute(index: number): void {
    this.scenarioTab[index].isGSExecutionInprogess = true;
    this.scenarioTab[index].isSimulateRunBtnShow = false;
    this.isSimulateBtnDisabled=false
    this.scenarioTab[index].isGSExecutionError = false;
    let uuid = (this.scenarioTab[index].graphSimulateForm as FormGroup).value.selectedGraphSimulate.uuid;
    this.scenarioTab[index].isGSExecutionSuccess = false;
    this.scenarioTab[index].outputInfo = [];
    let outputInfo = (this.scenarioTab[index].graphSimulateForm as FormGroup).value.selectedGraphSimulate.outputInfo;
    if (outputInfo != null && outputInfo.length > 0) {
      for (let i = 0; i < outputInfo.length; i++) {
        let output: any = {};
        output.isOutputError = false;
        output.outputId = outputInfo[i].outputId;
        output.isOutputInprogess = false;
        output.isOutputSuccess = false;
        output.title = outputInfo[i].title;
        output.type = outputInfo[i].type;
        output.highlightInfo = outputInfo[i].highlightInfo;
        output.ngxSpinnerName = outputInfo[i].title + "_" + outputInfo[i].outputId;
        output.result = null;
        output.isOutoutNoRecord = false;
        output.errorContent = null;
        output.highlightInfo = outputInfo[i].highlightInfo;
        this.scenarioTab[index].outputInfo.push(output);
      }
    }
    this.getParamByGraphSimulate(uuid, "", MetaType.GRAPHSIMULATE, index);
  }

  public paramSubmit(index: number): void {
    let paramsList: Array<ParamlistHolder> = [];
    let ruleParmForm = this.scenarioTab[index].ruleParamForm.get("rows").value;
    if (ruleParmForm != null && ruleParmForm.length > 0) {
      for (let i = 0; i < ruleParmForm.length; i++) {
        let paramInfo: ParamlistHolder;
        ruleParmForm[i].param.paramValue.value = ruleParmForm[i].paramValue;
        paramInfo = ruleParmForm[i].param
        paramsList.push(paramInfo);
      }
    } else {
      paramsList = null;
    }
    this.isOpenParamsDialog = false;
    let execParams = null;
    if (paramsList != null) {
      execParams = {}
      execParams.paramListInfo = paramsList
    }
    let uuid = (this.scenarioTab[index].graphSimulateForm as FormGroup).value.selectedGraphSimulate.uuid;
    this.simulateExecute(uuid, index, execParams);
  }

  private runSimulateLogs(uuid: string): void {
    const observableTemp=this.simulationService.runLogs(uuid, "", -1, 0, "INFO_LOG", MetaType.GRAPHSIMULATEExec).subscribe({
      next: (response) => {
        this.runSimulateLog = response.data;
      },
      error: (response) => {
      }
    });
    this.addSubscribe(observableTemp);
  }

  private initParamRows(params: any) {
    if (params != null) {
      return new FormGroup({
        'param': new FormControl(params.param, [Validators.required]),
        'paramValue': new FormControl(params.paramValue, [Validators.required]),
      });
    } else {
      return new FormGroup({
        'param': new FormControl("", [Validators.required]),
        'paramValue': new FormControl("", [Validators.required]),
      });
    }
  }

  private getParamByGraphSimulate(uuid: string, version: string, type: string, index: number): void {
    this.scenarioTab[index].ruleParamForm = this.fb.group({ rows: this.fb.array([]) });
    const observableTemp=this.commonService.getParamByGraphSimulate(uuid, version, type).subscribe({
      next: (response: IParamlistHolder[]) => {
        if (response != null && response.length > 0) {
          this.isOpenParamsDialog = true;
          for (let i = 0; i < response.length; i++) {
            let paramInfo: any = {}
            let row = null;
            paramInfo.param = response[i];
            paramInfo.paramValue = response[i].paramValue.value;
            row = this.initParamRows(paramInfo);
            (this.scenarioTab[index].ruleParamForm.get("rows") as FormArray).push(row);
          }
        } else {
          this.isOpenParamsDialog = false;
          this.simulateExecute(uuid, index, null);
        }
      },
      error: response => {

      }
    });
    this.addSubscribe(observableTemp);
  }

  private simulateExecute(uuid: string, index: number, data: any): void {
    this.spinner.show("simulate-execute");
    this.simulateView.execParam = data;
    let graphSimulateInfo: any = {};
    graphSimulateInfo.simulateName = this.scenarioTab[index].name;
    graphSimulateInfo.simulateId = this.scenarioTab[index].id;
    graphSimulateInfo.execParams = data;
    let graphSimulate: any = {};
    let ref: any = {};
    ref.type = MetaType.GRAPHSIMULATE;
    ref.uuid = uuid;
    graphSimulate.ref = ref;
    graphSimulateInfo.graphSimulate = graphSimulate;
    this.simulateView.simulateInfo = [];
    this.simulateView.simulateInfo[index] = graphSimulateInfo;
      const observableTemp=this.simulationService.simulateRun(uuid, "", this.simulateView).subscribe({
      next: (response) => {
        this.spinner.hide("simulate-execute");
        this.simulateStatus(response.uuid);
        this.scenarioTab[index].isGSExecutionInprogess = false;
        this.scenarioTab[index].isGSExecutionError = false;
        this.simulationStatusInprogess = true;
        this.simulateInterval = setInterval(() => {
          this.simulateStatus(response.uuid);
        }, 5000)
      },
      error: (response) => {
        this.spinner.hide("simulate-execute");
        this.scenarioTab[index].isGSExecutionInprogess = false;
        this.scenarioTab[index].isGSExecutionError = true;
        this.scenarioTab[index].errorContent = response.error;
        if (typeof this.scenarioTab[index].errorContent == 'object') {
          this.scenarioTab[index].errorContent = response.error.message;
        }
      }
    });
    this.addSubscribe(observableTemp);
  }

  private simulateStatus(uuid: string): void {
    const observableTemp=this.simulationService.simulateStatus(uuid).subscribe({
      next: (response: any) => {
        this.runSimulateLogs(uuid);
        if (response.statusCode == "200" && response.data == "COMPLETED") {
          clearInterval(this.simulateInterval);
          this.scenarioTab[this.scenarioTabIndex].isGSExecutionSuccess = true;
          this.scenarioTab[this.scenarioTabIndex].isGSExecutionInprogess = false;
          this.simulateOutput(uuid, this.scenarioTabIndex);
          this.simulationStatusInprogess = false;
        }
        else if (response.statusCode == "500" && response.data == "FAILED") {
          clearInterval(this.simulateInterval);
          this.spinner.hide("simulate-execute");
          this.scenarioTab[this.scenarioTabIndex].isGSExecutionInprogess = false;
          this.scenarioTab[this.scenarioTabIndex].isGSExecutionError = true;
          this.scenarioTab[this.scenarioTabIndex].errorContent = response.message;
          this.simulationStatusInprogess = false;
        }
      },
      error: (response) => {
        clearInterval(this.simulateInterval);
        this.simulationStatusInprogess = false;
        this.scenarioTab[this.scenarioTabIndex].isGSExecutionError = true;
        this.scenarioTab[this.scenarioTabIndex].errorContent = response.error;
        if (typeof this.scenarioTab[this.scenarioTabIndex].errorContent == 'object') {
          this.scenarioTab[this.scenarioTabIndex].errorContent = response.error.message;
        }
      }
    });
    this.addSubscribe(observableTemp);
  }

  private simulateOutput(simulateExecUuid: string, index: number): void {
    const observables = {};
    this.scenarioTab[index].outputInfo.forEach(output => {
      this.scenarioTab[index].outputInfo[output.outputId].isOutputInprogess = true;
      this.scenarioTab[index].outputInfo[output.outputId].isOutputError = false;
      this.spinner.show(output.ngxSpinnerName);
      this.simulationStatusInprogess = false;
      const observableTemp=observables[output.outputId] = this.simulationService.simulateOutput(simulateExecUuid, index, output.outputId).subscribe(
        {
          next: (response) => {

            this.scenarioTab[index].outputInfo[output.outputId].isOutputInprogess = false;
            this.spinner.hide(this.scenarioTab[index].outputInfo[output.outputId].ngxSpinnerName);
            this.scenarioTab[index].outputInfo[output.outputId].result = response;
            if (this.scenarioTab[index].outputInfo[output.outputId].type == OutputType.DATAGRID) {
              let cols = this.prepareColumns(Object.keys(response.data[0]), null);
              this.scenarioTab[index].outputInfo[output.outputId].cols = cols;
              this.scenarioTab[index].outputInfo[output.outputId].isOutoutNoRecord = response.data.length == 0 ? true : false;
              this.scenarioTab[index].outputInfo[output.outputId].pTableHeight = this.getPTableHeight(response.data);
            }
          }, error: (response) => {
            this.scenarioTab[this.scenarioTabIndex].outputInfo[output.outputId].isOutputInprogess = false;
            this.scenarioTab[this.scenarioTabIndex].outputInfo[output.outputId].isOutputError = true;
            this.spinner.hide(this.scenarioTab[index].outputInfo[output.outputId].ngxSpinnerName);
            this.scenarioTab[this.scenarioTabIndex].outputInfo[output.outputId].result = response[response.outputId];
            this.scenarioTab[this.scenarioTabIndex].outputInfo[output.outputId].errorContent = response.error;
            if (typeof this.scenarioTab[this.scenarioTabIndex].outputInfo[output.outputId].errorContent == 'object') {
              this.scenarioTab[this.scenarioTabIndex].outputInfo[output.outputId].errorContent = response.error.message;
            }
          }
        }
      );
      this.addSubscribe(observableTemp);
    })
  }

  private prepareColumns(cols: any, fColumnsList: any): any {
    let columns = [];
    let fColumns = [];
    if (cols != null && cols.length > 0) {
      for (let i = 0; i < cols.length; i++) {
        let colsInfo = { field: "", header: "", hide: false, frozen: false };
        colsInfo.field = cols[i];
        colsInfo.header = cols[i];
        if (fColumnsList == null || fColumnsList.indexOf(colsInfo.field) == -1) {
          columns.push(colsInfo);
        } else {
          colsInfo.frozen = false
          fColumns.push(colsInfo);
        }
      }
    }
    columns = [...fColumns, ...columns];
    return columns
  }

  private getPTableHeight(data: any) {
    if (data != null && data.length == 0) { return "90px"; }
    else if (data != null) {
      if (data.length <= 5) {
        return (data.length * 40) + 50 + "px"
      } else {
        return "250px"
      }
    }
    return "";
  }

  public columnHighlight(highlightInfo: any, colName: string, colValue: any): string {
    try {
      let result = null;
      let tempPInfo = null;
      let tempType = null;
      if (highlightInfo != null) {
        for (let j = 0; j < highlightInfo.length; j++) {
          if (highlightInfo[j].propertyId.attrName == colName) {
            tempPInfo = highlightInfo[j].propertyInfo;
            tempType = highlightInfo[j].type
          }
        }
        if (tempPInfo != null) {
          for (let i = 0; i < tempPInfo.length; i++) {
            if (tempType == 'numerical') {
              if (tempPInfo[i].endRange != null
                && colValue >= tempPInfo[i].startRange
                && colValue <= tempPInfo[i].endRange) {
                result = tempPInfo[i].propertyValue;
                break;
              }
              if (tempPInfo[i].endRange == null
                && colValue >= tempPInfo[i].startRange) {
                result = tempPInfo[i].propertyValue;
                break;
              }

            } else {
              if (colValue == tempPInfo[i].propertyName) {
                result = tempPInfo[i].propertyValue;
                break;
              }
            }
          }
        }
      }
      if (result != null) {
        return result;
      }
      return ""
    } catch (e) {
      return null;
    }
  }

  //Run Scenario End

  private getAllLatestGraphSimulate(type: any): void {
    const observableTemp=this.commonService.getAllLatest(type, "Y").subscribe({
      next: (response) => {
        this.allGraphSimulates = response;
      },
      error: (response) => {
      }
    });
    this.addSubscribe(observableTemp);
  }
  private getAllLatestGraphSimulateExec(type: any): void {
    const observableTemp=this.commonService.getAllLatest(type, "Y").subscribe({
      next: (response) => {
        this.allSimulationExec = response;
      },
      error: (response) => {
      }
    });
    this.addSubscribe(observableTemp);
  }

  private resetAllforms(): void {
    this.KGForm.reset();
    this.filterForm.reset();
    this.edgeFilterForm.reset();
    this.scenarioTab = [];
    this.scenarioTab[0] = this.simulationService.getScenarioDefaultValue();
    this.cloneDBResult = null;
    this.isCloneDBRunBtnShow = true;
    this.KGResult = null;
    this.isKGInprogess = false;
    this.isKGError = false;
    this.kgErrorContent = null;
    this.KGData = null;
  }
  private addSubscribe(subscriber:any):void {
    if(subscriber!=null && subscriber instanceof Subscriber){     
      this.subscriptions.push(subscriber);
    }
  }
  ngOnDestroy(): void {
    clearInterval(this.simulateInterval);
    //Method used for unsubscribing observables
    for(let subscription of this.subscriptions){
      subscription.unsubscribe();
    }
  }
}

