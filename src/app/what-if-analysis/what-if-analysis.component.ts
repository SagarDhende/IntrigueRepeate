import { Component,OnInit ,OnDestroy, Input} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscriber, Subscription } from 'rxjs';
import { MetaType } from '../shared/enums/api/meta-type.enum';
import { DataType } from '../shared/enums/data-type.enmu';
import { RequestMode } from './request-mode.enum';
import { CommonService } from '../shared/services/common.service';
import { WhatIfAnalysisService } from './what-if-analysis.service';
import { ConfirmationService } from 'primeng/api';
import { AppConfigService } from '../app-config.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { IColStructure } from '../shared/models/col-structure.model';
import { AttributeHolder } from '../shared/models/UI/attribute-holder.model';
import { ScenarioInfo } from './scenario-info.model';
import { Severity } from '../shared/enums/UI/severity.enum';
import { ScenarioMode } from './scenario-mode.enum';
import { IParamlistHolder, ParamlistHolder } from '../shared/models/API/paramlist-holder.model';
import { IAttributeRefHolder } from '../shared/models/API/atribute-ref-holder-model';
import { SliderOptions } from './sliderOptions.model';
import { HttpClient, HttpRequest} from '@angular/common/http';


@Component({
  selector: 'app-what-if-analysis',
  templateUrl: './what-if-analysis.component.html',
  styleUrl: './what-if-analysis.component.scss'
})

export class WhatIfAnalysisComponent implements OnInit,OnDestroy {

protected breadcrumb: { title: string; url: boolean; }[];
protected dataTypeEnum = DataType;
protected  errorTitle: string = 'Operation Failed';
protected  messageHead: string = 'Operation Failed';
protected  isAnalysisSaveDisabled: boolean = true;
protected  isNameEntered: boolean = false;
protected  allAnalysis: any;
protected  analysis: any;
protected  analysisTypes: any[] = [{ name: 'New', key: 'N' }, { name: 'Existing', key: 'E' }];
protected  selectedRule: any;
protected  isSubmitDisabled: boolean = true;
protected  analysisForm: FormGroup = new FormGroup({
    'selectedAnalysis': new FormControl('', []),
    'selectedSession': new FormControl('', []),
    'analysisName': new FormControl('', [Validators.required])
  });
protected  inputAnalysisForm: FormGroup = new FormGroup({
    'type': new FormControl({ value: '', disabled: true }),
    'selectedItem': new FormControl({ value: '', disabled: true })
  });
protected  allTypes: any = [{ "text": "datapod", 'caption': "DATAPOD" }, { "text": "dataset", 'caption': "DATASET" }];
protected  allItem: any;
protected  priviewResult: any = [];
protected  cols: any = [];
protected  _selectedColumns: any[];
protected  pTablePriviewHeight: string;
protected  priviewErrorContent: any;
//filter
protected  filterDialog: boolean = false;
protected  filterForm: FormGroup;
protected  lhsTypes: any = [
    { "text": "string", "caption": "STRING" },
    { "text": "string", "caption": "INTEGER" },
    { "text": "datapod", "caption": "ATTRIBUTE" },
  ];
protected rhsTypes: any =
    [{ "text": "string", "caption": "STRING", "disabled": false },
    { "text": "string", "caption": "INTEGER", "disabled": false },
    { "text": "datapod", "caption": "ATTRIBUTE", "disabled": false },
    ];
 protected operators: any = [
    { "caption": "EQUAL (=)", "value": "=" },
    { "caption": " NOT EQUAL (!=)", "value": "!=" },
    { "caption": "LESS THAN (<)", "value": "<" },
    { "caption": "GREATER THAN (>) ", "value": ">" },
    { "caption": "LESS OR EQUAL (<=) ", "value": "<=" },
    { "caption": "GREATER OR EQUAL (>=)  ", "value": ">=" },
  ];
protected  logicalOperators: any = [{ 'text': 'AND', 'caption': 'AND' }, { 'text': 'OR', 'caption': 'OR' }];
protected  allAttr: AttributeHolder[];
protected  allRules: any;
protected  isOpenParamsDialog: boolean = false;
protected  isInputPreviewSuccess: boolean = false;
protected  isInputPreviewNoRecord: boolean = false;
protected  isInputPreviewInprogess: boolean;
protected  ruleErrorContent: any;
protected  sliderDefaultOption: SliderOptions = { min: 0,max: 100};
protected  rule: any;
protected  allAnalysisUuid: any;
protected  isSaveSessionInprogess: boolean;
protected  isSaveSessionError: boolean;
protected  isSaveSessionSuccess: boolean;
protected  isRefreshRuleScenarioCalled: boolean = false;
protected  isLoadSessionError: boolean;
protected  isLoadSessionSuccess: boolean;
protected  scenarioTabIndex: number = 0;
protected  scenarioTab: Array<ScenarioInfo> = [];
protected  severity: typeof Severity;
protected  tabIndex: any;

private fColumnsList: any = ["score", "severity"];
private  subscriptions: Subscription[] = [];
private  selectedAnalysisType = this.analysisTypes[0].key;
private  isAnalysisSubmited = false;
private  isRuleSelected: boolean = false;
private  priviewCols: IColStructure[]; isInputPreviewError: boolean;
private  colHideList: any = ["rule_id", "app_uuid", "rule_exec_uuid", "rule_exec_version", "rule_exec_time", "rule_uuid", "rule_version", "version"];
private execParams: any; 


  constructor(
    private http: HttpClient,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private whatIfAnalysisService: WhatIfAnalysisService,
    private confirmationService: ConfirmationService,
    private appConfigService: AppConfigService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.severity = Severity;
    this.inputAnalysisForm.controls['type'].enable();
    this.inputAnalysisForm.controls['selectedItem'].enable();
    this.getAllLatestAnalysis();
    this.pTablePriviewHeight = this.getPTableHeight([]);
    this.filterForm = this.fb.group({
      rows: this.fb.array([])
    });
    this.scenarioTab[0] = this.whatIfAnalysisService.getScenarioDefaultValue();
  }

  //CRDU Analyis   

  public onSubmitAnalysis() :void {
    
    this.isAnalysisSubmited = true
    let analysis: any = {};
    analysis.name = ""; 
    this.submit(analysis, RequestMode.ANALYSISADD, null, null, null);
  }

  protected OnClickAnalysisType():void {
    this.resetAllforms();
  }
  protected openFilterDialog() {
    this.filterFormArr.clear()
    this.filterDialog = true;
    this.getSourceAttribute();
  }

  //End CRUD

  protected onChangeAnalysis():void {
    this.inputAnalysisForm.controls['type'].enable();
    this.inputAnalysisForm.controls['selectedItem'].enable();
    this.getAllVersionByUuid(this.analysisForm.value.selectedAnalysis.uuid);
    this.getAnalysisOnyByUuidAndVersion(MetaType.WhatIFANALYSIS, this.analysisForm.value.selectedAnalysis.uuid, this.analysisForm.value.selectedAnalysis.version);

  }

  protected onAnalysisSession():void {
    this.inputAnalysisForm.controls['type'].enable();
    this.inputAnalysisForm.controls['selectedItem'].enable();
    this.getAnalysisOnyByUuidAndVersion(MetaType.WhatIFANALYSIS, this.analysisForm.value.selectedAnalysis.uuid, this.analysisForm.value.selectedSession.version);

  }

  public whatIfAnalysisReset = function () {
    this.resetAllforms();
  }

  protected onChangeType():void{
    this.allRules = []
    if (this.inputAnalysisForm.value.type) {
      this.getAllLatestByType(this.inputAnalysisForm.value.type.text);
      this.scenarioTab[0] = this.whatIfAnalysisService.getScenarioDefaultValue()
      this.businessRuleFormEnable()
      this.getAllLatestByBusiness(this.inputAnalysisForm.value.type.text, this.inputAnalysisForm.value.selectedItem.uuid)
    }
    this.priviewResult = [];
    this.getAllLatestAnalysis();
  }

  public onChangeItem():void{
    this.isRuleSelected = false;
    this.scenarioTab[0] = this.whatIfAnalysisService.getScenarioDefaultValue()
    if (this.selectedAnalysisType == "N" && !this.isAnalysisSubmited) {
      this.onSubmitAnalysis();
    }
    if (this.inputAnalysisForm.value.selectedItem && this.isAnalysisSubmited) {
      let analysis: any = this.prepareAnalysisJson();
      this.submit(analysis, RequestMode.ANALYSISINPUT, null, null, null);
      this.getAllLatestByBusiness(this.inputAnalysisForm.value.type.text, this.inputAnalysisForm.value.selectedItem.uuid);
      this.businessRuleFormEnable();
    }
  }
  //added
  public refreshAnalysis():void{
    this.getPriview();
  }
  public refreshRuleScenario():void{
    this.ruleExecute(this.analysis.uuid, this.analysis.version, MetaType.RULE, this.execParams, this.analysis.scenarioInfo[0].scenarioId);
    this.getRuleResult(this.analysis.uuid, this.analysis.version, "", this.analysis.scenarioInfo[0].scenarioId);
    this.isRefreshRuleScenarioCalled = true;
  }

  /** @description use for datadownload components */
  protected downloadAnalysisInput(){
    this.whatIfAnalysisService.getInputDownloadURL(this.analysisForm.value.selectedAnalysis.uuid).subscribe({
      next:(response: HttpRequest<any>) => {
        console.log(response.headers.get('filename'))
       this.downloadFile(response.body,response.headers.get('filename'));
      },
      error:(err:any) => {
        
        console.log(err);
        this.errorTitle = 'Operation Failed';
        this.messageHead = 'Operation Failed';
      }
    }); 
  }

    private downloadFile(data: Blob, fileName: string): void {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
  }

  //Filter
  get filterFormArr() {
    return this.filterForm.get("rows") as FormArray;
  }

  protected addFilterRow():void{
    this.filterFormArr.push(this.initFilterRows());
    let filterForm = this.filterForm.get("rows").value;
    if(this.filterFormArr.length > 1){
        filterForm.forEach((entry,index) =>{
           if(index>0){
            this.filterFormArr.at(index).get('logicalOperator').setValue(this.logicalOperators[0])
           }
        })
    }
  }

  protected deleteFilterRow():void{
    for (let i = this.filterFormArr.length - 1; i >= 0; i--) {
        const control = this.filterFormArr.at(i);
        if (control.value.select) {
            this.filterFormArr.removeAt(i);
        }
    }
}


  private initFilterRows(){
    return new FormGroup({
      'select': new FormControl(false),
      'logicalOperator': new FormControl('', [Validators.required]),
      'lhsType': new FormControl(this.lhsTypes[2], [Validators.required]),
      'lhsAttr': new FormControl('', [Validators.required]),
      'operator': new FormControl(this.operators[0], [Validators.required]),
      'rhsType': new FormControl(this.rhsTypes[2], [Validators.required]),
      'rhsAttr': new FormControl('', [Validators.required]),
      'rhsValue': new FormControl('')
    });
  }

  private getFilterInfo(filterForm: any){
    let filterList = [];
    console.log(filterForm);
    if (filterForm != null) {
      for (let i = 0; i < filterForm.length; i++) {
        let filterInfo: any = {};
        let lhsRef: any = {};
        let lhsOperand: any = {};
        let rhsRef: any = {};
        let rhsOperand: any = {};
        let operand: any = [];
        filterInfo.logicalOperator = filterForm[i].logicalOperator.text;
        filterInfo.operator = filterForm[i].operator.value;
        if (filterForm[i].lhsType.text == DataType.STRING) {
          lhsRef.type = MetaType.SIMPLE;
          lhsOperand.ref = lhsRef;
          lhsOperand.attributeType = filterForm[i].lhsType.caption;
          lhsOperand.value = filterForm[i].lhsValue;
        }
        else if (filterForm[i].lhsType.text == MetaType.DATAPOD) {
          lhsRef.type = filterForm[i].lhsAttr.type;
          lhsRef.uuid = filterForm[i].lhsAttr.uuid;
          lhsOperand.ref = lhsRef;
          lhsOperand.attributeId = filterForm[i].lhsAttr.attrId;
        }
        operand[0] = lhsOperand;
        if (filterForm[i].rhsType.text == DataType.STRING) {
          rhsRef.type = MetaType.SIMPLE;
          rhsOperand.ref = rhsRef;
          rhsOperand.attributeType = filterForm[i].rhsType.caption;
          rhsOperand.value = filterForm[i].rhsValue;
        }
        else if (filterForm[i].rhsType.text == MetaType.DATAPOD && filterForm[i].rhsType.caption == MetaType.ATTRIBUTE) {
          rhsRef.type = filterForm[i].rhsAttr.type;
          rhsRef.uuid = filterForm[i].rhsAttr.uuid;
          rhsOperand.ref = rhsRef;
          rhsOperand.attributeId = filterForm[i].rhsAttr.attrId;
        }
        operand[1] = rhsOperand;
        filterInfo.operand = operand;
        filterList[i] = filterInfo;
      }
    }
    return filterList;
  }

  protected filterSubmit():void{
    let filterForm = this.filterForm.get("rows").value;
    let flag = true;
    for(let i=0; i<filterForm.length; i++){
      if((filterForm[i].rhsAttr == "" || filterForm[i].rhsAttr == null) && this.filterFormArr.at(i).get('rhsType').value.text == 'datapod'){
        flag = false;
        this.filterFormArr.at(i).get('rhsAttr').markAsTouched();
        this.filterFormArr.at(i).get('rhsAttr').errors['required'] = true;
      }else if((filterForm[i].rhsValue == "" || filterForm[i].rhsValue == null) && this.filterFormArr.at(i).get('rhsType').value.text == 'string'){
        flag = false;
        this.filterFormArr.at(i).get('rhsValue').markAsTouched();
        this.filterFormArr.at(i).get('rhsValue').errors['required'] = true;
      }
      if(filterForm[i].lhsAttr == ""){
        flag = false;
        this.filterFormArr.at(i).get('lhsAttr').markAsTouched();
        this.filterFormArr.at(i).get('lhsAttr').errors['required'] = true;
      }
    }
    if(flag){
      this.filterDialog = false;
      let analysis: any = this.prepareAnalysisJson();
      this.submit(analysis, RequestMode.ANALYSISFILTER, null, null, null);
    }
  }


 protected onChangeSelectAllFilter(event):void{
    if(this.filterFormArr.length>0)
    {
      this.filterFormArr.controls.forEach(filter=> {
        filter.get('select').setValue(event.checked);
      })
    }
  }

  protected onColumnSelectChange() {
    const uncheckedColumns = this.cols.filter(
      col => !this._selectedColumns.includes(col)
    );
    const checkedColumns = this.cols.filter(
      col => this._selectedColumns.includes(col)
    );
    uncheckedColumns.forEach(col => {
      col.visible = false
    })
    checkedColumns.forEach(col => {
      col.visible = true
    })
  }
  

  //End Filter



  /*Start Scenario*/
  public onClickOverviewExpend(parentIndex: number, index: number):void{
    if (this.scenarioTab[parentIndex].overViewTabCol != null) {
      for (let i = 0; i < this.scenarioTab[parentIndex].overViewTabCol.length; i++) {
        this.scenarioTab[parentIndex].overViewTabCol[i].isShow = false;
        this.scenarioTab[parentIndex].overViewTabCol[i].isExpand = false;
      }
      this.scenarioTab[parentIndex].overViewTabCol[index].isShow = true;
      this.scenarioTab[parentIndex].overViewTabCol[index].isExpand = true;
    }
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }
  public onClickOverviewCollapse(parentIndex: number, index: number):void{
    if (this.scenarioTab[parentIndex].overViewTabCol != null) {
      for (let i = 0; i < this.scenarioTab[parentIndex].overViewTabCol.length; i++) {
        this.scenarioTab[parentIndex].overViewTabCol[i].isShow = true;
        this.scenarioTab[parentIndex].overViewTabCol[i].isExpand = false;
      }
    }
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  public addScenario():void{
    let scenarioInfo: any = {};
    scenarioInfo = this.whatIfAnalysisService.getScenarioDefaultValue();
    scenarioInfo.id = (this.scenarioTab.length - 1) + 1;
    scenarioInfo.name = "Scenario " + (this.scenarioTab.length + 1);
    scenarioInfo.inputBusinessRuleForm.controls['selectedRule'].enable()
    this.scenarioTab.push(scenarioInfo);
  }

  public enterKeyChangeHeader(event: any, index: number):void{
    if (event.keyCode == 13) {
      this.scenarioTab[index].isHeaderEdit = false;
      let tempTabIndex = this.scenarioTabIndex;
      this.scenarioTabIndex = 0;
      setTimeout(() => {
        this.scenarioTabIndex = tempTabIndex;
      }, 100)
    }
  }

  public handleScenarioClose(index: number):void{
    if (this.scenarioTab[index].scenarioMode == ScenarioMode.MEMORY) {
      setTimeout(() => {
        this.scenarioTabIndex = 0;
        this.scenarioTab.splice(index, 1);
        this.onChangeScenarioTab();
      }, 100)

    }
    else if (this.scenarioTab[index].scenarioMode == ScenarioMode.DISK) {
      const observableTemp = this.whatIfAnalysisService.deleteScenario(this.analysis.uuid, this.analysis.version, index).subscribe({
        next: (response: any) => {
          if (response != null && response.success) {
            setTimeout(() => {
              this.scenarioTabIndex = 0;
              this.scenarioTab.splice(index, 1);
              this.onChangeScenarioTab();
              delete this.analysis.createdOn;
              delete this.analysis.createdBy;
              this.analysis.scenarioInfo = this.getScenarioInfo()
              this.submit(this.analysis, RequestMode.ANALYSISSAVESESSION, null, null, null);

            }, 100)
          }
        },
        error: (response: any) => {

        }
      });
      this.addSubscribe(observableTemp);
    }
    //e.close();
  }

  public onChangeScenarioTab():void{
    this.unfrozenColumns(this.fColumnsList);

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      this.frozenColumns(this.fColumnsList);

    }, 100);

  }

  protected ResultTabOnColumnSelectChange():void {
    const uncheckedColumns = this.cols.filter(
      col => !this._selectedColumns.includes(col)
    );
    const checkedColumns = this.cols.filter(
      col => this._selectedColumns.includes(col)
    );
    uncheckedColumns.forEach(col => {
      col.visible = false
    })
    checkedColumns.forEach(col => {
      col.visible = true
    })
  }

  public onClickSeverity(event: any):void{
    this.severity = Severity;
    console.log(this.severity[event.name]);
    console.log(this.scenarioTabIndex);
    let severity: any = {};
    severity.id = this.scenarioTab[this.scenarioTabIndex].severityTab.length;
    severity.name = this.severity[event.name];
    severity.type = this.severity[event.name].toUpperCase();
    severity.url = "/whatifanalysis/" + this.analysis.uuid + "/summary/result?version=" + this.analysis.version + "&scenarioId=" + this.scenarioTabIndex + "&severity=" + this.severity[event.name].toUpperCase();
    let isFound = -1
    if (this.scenarioTab[this.scenarioTabIndex].severityTab.length > 0)
      isFound = this.scenarioTab[this.scenarioTabIndex].severityTab.findIndex(item => item.name === this.severity[event.name]);
    if (isFound == -1) {
      this.scenarioTab[this.scenarioTabIndex].severityTab.push(severity);
      setTimeout(() => {
        this.tabIndex = this.scenarioTab[this.scenarioTabIndex].severityTab.findIndex(item => item.name === this.severity[event.name]) + 2;
      }, 1000);
    } else {
      setTimeout(() => {
        this.tabIndex = this.scenarioTab[this.scenarioTabIndex].severityTab.findIndex(item => item.name === this.severity[event.name]) + 2;
      }, 1000)
    }
  }

  public handleSeverityTabClose(e: any):void{
    this.scenarioTab[this.scenarioTabIndex].severityTab.splice(e.index - 2, 1);
    e.close();
  }

  /** @description use service in data download  */
  public downloadRuleResult(){
    this.whatIfAnalysisService.getRuleResultDownloadURL(this.analysisForm.value.selectedAnalysis.uuid, this.analysisForm.value.selectedAnalysis.version, this.scenarioTabIndex).subscribe({
    next:(response:HttpRequest<any>)=>{
      console.log(response.headers.get('filename'))
      this.downloadFile(response.body,response.headers.get('filename'));
     },
     error:(err:any) => {
       
       console.log(err);
       this.errorTitle = 'Operation Failed';
       this.messageHead = 'Operation Failed';
     }
  })
  /** commented for data download component 
  this.dataDownloadComponent.openDownloadDialog();
  this.dataDownloadComponent.url = url; */
}

  private unfrozenColumns = function (fColumns: any):void{
    if (fColumns != null && fColumns.length > 0 && this.scenarioTab[this.scenarioTabIndex].ruleResultCols && this.scenarioTab[this.scenarioTabIndex].ruleResultCols.length > 0) {
      for (let i = 0; i < fColumns.length; i++) {
        let objIndex = this.scenarioTab[this.scenarioTabIndex].ruleResultCols.findIndex(((obj: any) => obj.field == fColumns[i]));
        this.scenarioTab[this.scenarioTabIndex].ruleResultCols[objIndex].frozen = false;
      }
    }
    console.log(this.scenarioTab[this.scenarioTabIndex].ruleResultCols)
  }

  private frozenColumns = function (fColumns: any):void{
    if (this.scenarioTab[this.scenarioTabIndex].ruleResultCols != null && this.scenarioTab[this.scenarioTabIndex].ruleResultCols.length > 0) {
      for (let i = 0; i < fColumns.length; i++) {
        let objIndex = this.scenarioTab[this.scenarioTabIndex].ruleResultCols.findIndex(((obj: any) => obj.field == fColumns[i]));
        this.scenarioTab[this.scenarioTabIndex].ruleResultCols[objIndex].frozen = true;
      }
    }
    console.log(this.scenarioTab[this.scenarioTabIndex].ruleResultCols)
  }

  private getScenarioInfo(){
    let scenarioInfo = [];

    if (this.scenarioTab != null && this.scenarioTab.length > 0) {
      for (let i = 0; i < this.scenarioTab.length; i++) {
        let scenario: any = {};
        scenario.scenarioId = this.scenarioTab[i].id;
        scenario.scenarioName = this.scenarioTab[i].name;
        let ref: any = {};
        let ruleInfo: any = {};
        ref.type = MetaType.RULE;
        ref.uuid = (this.scenarioTab[i].inputBusinessRuleForm as FormGroup).value.selectedRule.uuid;
        // this. selectedRule=ref.uuid;
        ruleInfo.ref = ref;
        scenario.ruleInfo = ruleInfo;
        scenario.thresholdInfo = this.getThreshold(i);
        scenarioInfo.push(scenario);
      }
    }
    return scenarioInfo;
  }
  private businessRuleFormEnable():void{
    if (this.scenarioTab != null && this.scenarioTab.length > 0) {
      for (let i = 0; i < this.scenarioTab.length; i++) {
        this.scenarioTab[i].inputBusinessRuleForm.controls['selectedRule'].enable();
      }
    }
  }


  /*End Scenario*/


  //Start Business Rule
  public getSeveritryCaption(severity: string): any {
    return this.appConfigService.getSeveritryCaption(severity);
  }
  public getSeverityBGColor(severity: string): any {
    return this.appConfigService.getSeverityBGColor(severity)
  }
  public onChangeBusinessRule(index: number):void{
    this.isRuleSelected = true;
    this.scenarioTab[index].ruleParamForm = this.fb.group({ rows: this.fb.array([]) });
    this.scenarioTab[index].ruleParamForm.reset();
    this.scenarioTab[index].ruleParamForm = this.fb.group({ rows: this.fb.array([]) })
    let analysis: any = this.prepareAnalysisJson();
    this.submit(analysis, RequestMode.ANALYSISRULE, (this.scenarioTab[index].inputBusinessRuleForm as FormGroup).value.selectedRule.uuid, "", this.scenarioTab[index].id);
    this.getBROnyByUuidAndVersion(MetaType.RULE, (this.scenarioTab[index].inputBusinessRuleForm as FormGroup).value.selectedRule.uuid, "", this.scenarioTab[index].id);

  }
  public openParamDialog(index: number):void{
    this.isOpenParamsDialog = true;
  }

  public paramSubmit(index: number):void{
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
    console.log(paramsList);
    this.isOpenParamsDialog = false;
     this.execParams = null;
    if (paramsList != null) {
      this.execParams = {}
      this.execParams.paramListInfo = paramsList
    }
    this.ruleExecute(this.analysis.uuid, this.analysis.version, MetaType.RULE, this.execParams, index);
  }


  //Start Submit Threshold
  public onChangeLowValue(index: number):void{
    this.isSubmitDisabled = false;
    const newOptions: SliderOptions = Object.assign({}, this.scenarioTab[index].medOptions);
    newOptions.min = this.scenarioTab[index].lowValue;
    this.scenarioTab[index].medOptions = newOptions;
    if (this.scenarioTab[index].lowValue >= this.scenarioTab[index].medValue) {
      this.scenarioTab[index].medValue = this.scenarioTab[index].lowValue + 10;
      this.onChangeMedValue(index);
    }
  }

  public onChangeMedValue(index: number):void{
    this.isSubmitDisabled = false;
    const newOptions: SliderOptions = Object.assign({}, this.scenarioTab[index].heighOptions);
    newOptions.min = this.scenarioTab[index].medValue;
    this.scenarioTab[index].heighOptions = newOptions;
    if (this.scenarioTab[index].lowValue >= this.scenarioTab[index].medValue) {
      this.scenarioTab[index].medValue = this.scenarioTab[index].lowValue;
    }
    if (this.scenarioTab[index].medValue >= this.scenarioTab[index].highValue) {
      this.scenarioTab[index].highValue = this.scenarioTab[index].medValue + 10;
    }
  }
  public onChangeHighValue(index: number):void{
    this.isSubmitDisabled = false;
    const newOptions: SliderOptions = Object.assign({}, this.scenarioTab[index].medOptions);
    newOptions.min = this.scenarioTab[index].highValue;
    this.scenarioTab[index].medOptions = newOptions;
    if (this.scenarioTab[index].medValue >= this.scenarioTab[index].highValue) {
      this.scenarioTab[index].highValue = this.scenarioTab[index].medValue;

    }
  }

  public submitThreshold(index: number):void{
    let threshold: any = {}
    threshold = this.getThreshold(index);
    this.getRuleOverviewResult(this.analysis.uuid, this.analysis.version, MetaType.RULE, threshold, index);
  }

  //End Submit Threshold

  //Start Analysis Session
  public whatIfAnalysisSaveSession():void{
    this.confirmationService.confirm({
      message: 'Are you sure that you want to save analysis?',
      icon: 'pi pi-save',
      accept: () => {
        
        this.spinner.show("analysis-save");
        let analysis = this.prepareAnalysisJson();
        this.analysis.saveSession = "true";
        if (this.selectedAnalysisType == 'E') {
          delete this.analysis.createdOn;
          delete this.analysis.createdBy;
        } else {
          this.analysis.name = this.analysisForm.controls["analysisName"].value;
        }
        if (this.analysis.name.length > 0) {
          this.submit(this.analysis, RequestMode.ANALYSISSAVESESSION, null, null, null);
        }
        else {
          this.isLoadSessionSuccess = false;
          this.isSaveSessionInprogess = false;
          this.isNameEntered = true;
          this.onAnalysisName(this.analysis.name)
        }
      }
    });
  }

  public onAnalysisName(name: any):void{
    var input = document.getElementById("analysisName");
    if (name === "") {
      input.classList.add("highlight");
    }
    else {
      input.classList.remove("highlight");
      // this.isLoadSessionSuccess =true;
      this.isSaveSessionInprogess = true;
      this.isNameEntered = false;
    }
  }

  private loadAnalysisSession(uuid: string, version: any):void{
    this.isSaveSessionInprogess = true;
    this.isLoadSessionError = false;
    this.isLoadSessionSuccess = false;
    this.spinner.show("analysis-load");
    const observableTemp = this.whatIfAnalysisService.analysisLoadSession(uuid, version).subscribe({
      next: (response: any) => {
        this.isSaveSessionInprogess = false;
        this.spinner.hide("analysis-load");
        if (response && response.success) {
          this.isLoadSessionSuccess = true;
          this.getAnalysisSessionInput(this.analysis.uuid, this.analysis.version);
          this.getAllLatestByBusiness(this.inputAnalysisForm.value.type.text, this.inputAnalysisForm.value.selectedItem.uuid);
          if (this.analysis != null && this.analysis.scenarioInfo != null && this.analysis.scenarioInfo.length > 0) {
            this.scenarioTab = [];
            for (let i = 0; i < this.analysis.scenarioInfo.length; i++) {
              let selectedRule = {
                uuid: this.analysis.scenarioInfo[i].ruleInfo.ref.uuid,
                version: '',
              }
              this.scenarioTab[i] = this.whatIfAnalysisService.getScenarioDefaultValue();
              this.scenarioTab[i].id = this.analysis.scenarioInfo[i].scenarioId
              this.scenarioTab[i].name = this.analysis.scenarioInfo[i].scenarioName
              this.scenarioTab[i].isRuleExecutionSuccess = true;
              this.scenarioTab[i].isTabReady = true;
              this.scenarioTab[i].inputBusinessRuleForm.controls['selectedRule'].enable();
              this.scenarioTab[i].inputBusinessRuleForm.controls["selectedRule"].setValue(selectedRule);
              this.scenarioTab[i].scenarioMode = ScenarioMode.DISK;
              this.getBROnyByUuidAndVersion(MetaType.RULE, this.analysis.scenarioInfo[i].ruleInfo.ref.uuid, "", i);
              this.getRuleResult(this.analysis.uuid, this.analysis.version, "", i);

              //this.getAnalysisSessionSummay(this.analysis.uuid, this.analysis.version, i);
              //this.getAnalysisSessionDatil(this.analysis.uuid, this.analysis.version, i);
              this.getAnalysisSessionOverview(this.analysis.uuid, this.analysis.version, i);

            }
          }
        } else {
          this.isLoadSessionError = true;
        }
      },
      error: (response: any) => {
        this.spinner.hide("analysis-load");
        this.isSaveSessionInprogess = false;
        this.isLoadSessionError = true;

      }
    });
    this.addSubscribe(observableTemp);
  }

  private getAnalysisSessionInput(uuid: string, version: string):void{
    this.spinner.show("input-preview");
    this.priviewCols = [];
    this.priviewResult = [];
    this.isInputPreviewInprogess = true;
    this.isInputPreviewError = false;
    this.isInputPreviewSuccess = false;
    this.isInputPreviewNoRecord = false;
    const observableTemp = this.whatIfAnalysisService.getAnalysisSessionInput(uuid, version).subscribe({
      next: (response: any) => {
        console.log('checking header',response);
        this.spinner.hide("input-preview");
        this.isInputPreviewSuccess = true;
        this.isInputPreviewInprogess = false;
        if (response != null && response.data.length > 0) {
          this.pTablePriviewHeight = this.getPTableHeight(response.data);
          this.priviewCols = this.prepareColumns(Object.keys(response.data[0]), null);
          this.priviewResult = response.data;
        } else {
          this.isInputPreviewNoRecord = true;

        }
      },
      error: (response: any) => {
        this.spinner.hide("input-preview");
        this.isInputPreviewError = true;
        this.isInputPreviewSuccess = false;
        this.isInputPreviewInprogess = false;
        this.priviewErrorContent = response.error
        if (typeof this.priviewErrorContent == 'object') {
          this.priviewErrorContent = response.error.message;
        }
      }
    });
    this.addSubscribe(observableTemp);
  }


  protected getAnalysisSessionDatil(uuid: string, version: string, scenarioId: number):void{
    this.spinner.show("rule-detail-result");
    this.scenarioTab[scenarioId].isRuleDetailResltInprogess = true;
    this.scenarioTab[scenarioId].isRuleDetailResultError = false;
    this.scenarioTab[scenarioId].isRuleDetailResultSuccess = false;
    const observableTemp = this.whatIfAnalysisService.getAnalysisSessionDetail(uuid, version, scenarioId).subscribe({
      next: (response: any) => {
        this.spinner.hide("rule-detail-result");
        if (response != null && response.data && response.data && response.data.length > 0 && response.success) {
          this.scenarioTab[scenarioId].isRuleDetailResultSuccess = true;
          this.scenarioTab[scenarioId].isRuleDetailResltInprogess = false;
          this.scenarioTab[scenarioId].pTableDetailResultHeight = this.getPTableHeight(response.data);
          this.scenarioTab[scenarioId].ruleDetailResultCols = this.prepareColumns(Object.keys(response.data[0]), null);
          this.scenarioTab[scenarioId].ruleDetailResult = response.data;
        } else if (response != null && !response.success) {
          this.ruleErrorContent = response.error.message
        }
        else {
          this.scenarioTab[scenarioId].isRuleDetailNoRecord = true;
        }
      },
      error: (response: any) => {
        this.spinner.hide("rule-detail-result");
        this.scenarioTab[scenarioId].isRuleDetailResultError = false;
      }
    });
    this.addSubscribe(observableTemp);
  }

  protected getAnalysisSessionSummay(uuid: string, version: string, scenarioId: number):void{
    this.spinner.show("rule-summary-result");
    this.scenarioTab[scenarioId].isRuleSummaryResultInprogess = true;
    this.scenarioTab[scenarioId].isRuleSummaryResultError = false;
    this.scenarioTab[scenarioId].isRuleSummarySuccess = false;
    const observableTemp = this.whatIfAnalysisService.getAnalysisSessionSummary(uuid, version, scenarioId).subscribe({
      next: (response: any) => {
        this.spinner.hide("rule-summary-result");
        this.scenarioTab[scenarioId].isRuleSummaryResultInprogess = false;
        this.scenarioTab[scenarioId].isRuleSummarySuccess = true;
        if (response != null && response.data && response.data.length > 0 && response.success) {
          this.scenarioTab[scenarioId].pTableSummaryHeight = this.getPTableHeight(response.data);
          this.scenarioTab[scenarioId].ruleSummaryResultCols = this.prepareColumns(Object.keys(response.data[0]), null);
          this.scenarioTab[scenarioId].ruleSummaryResult = response.data;
        } else if (response != null && !response.success) {
          this.ruleErrorContent = response.error
          if (typeof this.ruleErrorContent == 'object') {
            this.ruleErrorContent = response.error.error.message;
          }
        }
        else {
          this.scenarioTab[scenarioId].isRuleSummaryResultNoRecord = true;
        }
      },
      error: (response: any) => {
        this.spinner.hide("rule-summary-result");
        this.scenarioTab[scenarioId].isRuleSummaryResultError = false;
        this.scenarioTab[scenarioId].isRuleSummaryResultInprogess = false;
        this.scenarioTab[scenarioId].isRuleSummarySuccess = false;

      }
    });
    this.addSubscribe(observableTemp);
  }

  private getAnalysisSessionOverview(uuid: string, version: string, scenarioId: number):void{
    this.spinner.show("rule-overview-result");
    this.scenarioTab[scenarioId].isRuleOverViewResultInprogess = true;
    this.scenarioTab[scenarioId].isRuleOverviewResultError = false;
    const observableTemp = this.whatIfAnalysisService.getAnalysisSessionOverview(uuid, version, scenarioId).subscribe({
      next: (response: any) => {
        this.spinner.hide("rule-overview-result");
        this.scenarioTab[scenarioId].isRuleOverViewResultInprogess = false;
        if (response != null && response.data != null && response.success) {
          this.scenarioTab[scenarioId].ruleSHData.json = response.data[0].histScores;
          this.scenarioTab[scenarioId].ruleSeverityData.json[0] = response.data[0]
        } else if (response != null && !response.success) {
          this.scenarioTab[scenarioId].ruleOverViewErrorContent = response.error.message;
        }
      },
      error: (response: any) => {
        this.spinner.hide("rule-overview-result");
        this.scenarioTab[scenarioId].isRuleOverviewResultError = true;
        this.scenarioTab[scenarioId].isRuleOverViewResultInprogess = false;
        this.scenarioTab[scenarioId].ruleOverViewErrorContent = response.error;
        if (typeof this.scenarioTab[scenarioId].ruleOverViewErrorContent == 'object') {
          this.scenarioTab[scenarioId].ruleOverViewErrorContent = response.error.message;
        }
      }
    });
    this.addSubscribe(observableTemp);
  }

  private SaveAnalysisSession(uuid: string, version: string):void{
    this.isSaveSessionInprogess = true;
    this.isSaveSessionError = false;
    this.isSaveSessionSuccess = false;
    const observableTemp = this.whatIfAnalysisService.analysisSaveSession(uuid, version, null).subscribe({
      next: (response: any) => {
        this.spinner.hide("analysis-save");
        this.isSaveSessionInprogess = false;
        if (response && response.success) {
          this.isSaveSessionSuccess = true;
        } else {
          this.isSaveSessionError = true;
        }
      },
      error: (response: any) => {
        this.spinner.hide("analysis-save");
        this.isSaveSessionError = true;
        console.log("responce error ", response)

      }
    });
    this.addSubscribe(observableTemp);
  }
  //End Analysis Session


  //private 
  private prepareAnalysisJson():void{
    
    let analysis: any = {};
    let ref: any = {};
    let dependsOn: any = {};
    analysis.name = this.analysis.name;
    analysis.uuid = this.analysis.uuid;
    ref.type = this.inputAnalysisForm.value.type.text;
    ref.uuid = this.inputAnalysisForm.value.selectedItem.uuid;
    dependsOn.ref = ref;
    analysis.dependsOn = dependsOn;
    //analysis.ruleInfo = null;
    let filterForm = this.filterForm.get("rows").value;
    analysis.filterInfo = this.getFilterInfo(filterForm);
    if (this.isRuleSelected && this.scenarioTab != null) {
      analysis.scenarioInfo = this.getScenarioInfo();
    }
    return analysis
  }

  private resetAllforms():void{
    this.analysisForm.reset();
    this.inputAnalysisForm.reset();
    this.getAllLatestAnalysis();
    this.priviewResult = [];
    this.priviewCols = [];
    this.analysis = null;
    this.allAnalysisUuid = [];
    this.scenarioTab = [];
    this.scenarioTab[0] = this.whatIfAnalysisService.getScenarioDefaultValue();
  }

  private submit(data: any, requestType: RequestMode, ruleUuid: string, ruleVersion: string, scenarioId: number):void{

    if ([RequestMode.ANALYSISRULE, RequestMode.ANALYSISINPUT, RequestMode.ANALYSISFILTER].indexOf(requestType) != -1 && this.selectedAnalysisType == "N") {
      data.version = this.analysis.version;
      data.id = this.analysis.id;
    }
    else if ([RequestMode.ANALYSISRULE, RequestMode.ANALYSISINPUT, RequestMode.ANALYSISFILTER].indexOf(requestType) != -1 && this.selectedAnalysisType == "E") {
      data.version = "";
      delete data.id;
    }
    const observableTemp = this.commonService.submit(data, MetaType.WhatIFANALYSIS).subscribe({
      next: response => {
        if (requestType == RequestMode.ANALYSISADD) {
          this.getAnalysisOneById(MetaType.WhatIFANALYSIS, response, requestType);
        }
        else if (requestType == RequestMode.ANALYSISSAVESESSION) {
          this.getAnalysisOneById(MetaType.WhatIFANALYSIS, response, requestType);
        }
        else if (requestType == RequestMode.ANALYSISINPUT) {
          this.getAnalysisOneById(MetaType.WhatIFANALYSIS, response, requestType);
          this.getAnalysisOnyByUuidAndVersion(MetaType.WhatIFANALYSIS, this.analysis.uuid, "");
          this.getPriview();
        }
        else if (requestType == RequestMode.ANALYSISFILTER) {
          this.getAnalysisOneById(MetaType.WhatIFANALYSIS, response, requestType);

          this.getPriview();
        }
        else if (requestType == RequestMode.ANALYSISRULE) {
          this.getAnalysisOneById(MetaType.WhatIFANALYSIS, response, requestType);
          this.getParamByRule(ruleUuid, ruleVersion, MetaType.RULE, scenarioId);
        }
        console.log(response);
      },
      error: response => {
        
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getAllLatestAnalysis():void{
    const observableTemp = this.whatIfAnalysisService.getAnalyisisBySaveSession().subscribe({
      next: response => {
        if (response != null && response.data != null && response.data.length > 0) {
          this.allAnalysis = response.data;
        }
      },
      error: response => {

      }
    });
    this.addSubscribe(observableTemp);
  }
  private getAllVersionByUuid(uuid: string):void{
    const observableTemp = this.whatIfAnalysisService.getAllVersionByUuid("true", uuid).subscribe({
      next: (response) => {
        if (response != null && response.data != null && response.data.length > 0)
          this.allAnalysisUuid = response.data;
      },
      error: response => {
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getAllLatestByType(type: any):void{
    const observableTemp = this.commonService.getAllLatest(type, "Y").subscribe({
      next: (response) => {
        this.allItem = response;
        //For Edit Mode
        if (this.analysis && this.selectedAnalysisType == "E") {
          let selectedItem = { uuid: this.analysis.dependsOn.ref.uuid };
          this.inputAnalysisForm.controls['selectedItem'].setValue(selectedItem);
          this.loadAnalysisSession(this.analysis.uuid, this.analysis.version);
        }
      },
      error: (response) => {
        console.log(response)
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getAllLatestByBusiness(type: any, uuid: string):void{
    const observableTemp = this.whatIfAnalysisService.getBusinessRuleBySource(type, uuid).subscribe({
      next: (response) => {
        this.allRules = response.data;
      },
      error: (response) => {
        console.log(response)
      }
    });
    this.addSubscribe(observableTemp);
  }


  /** @description use for filter*/

  private getSourceAttribute():void{
    const observableTemp = this.commonService.getSourceAttribute(this.inputAnalysisForm.value.selectedItem.uuid, this.inputAnalysisForm.value.type.text).subscribe({
      next: (response: IAttributeRefHolder[]) => {
        console.log('response of getSourceAttribute ',response)
        let attributeList: AttributeHolder[] = [];
        if (response != null) {
          for (let i = 0; i < response.length; i++) {
            let attrInfo: AttributeHolder = new AttributeHolder();
            attrInfo.id = response[i].ref.uuid + "_" + response[i].attrId;
            //remove for short attr name
            attrInfo.dname = response[i].attrName;
            attrInfo.uuid = response[i].ref.uuid;
            attrInfo.type = response[i].ref.type;
            attrInfo.name = response[i].ref.name;
            attrInfo.displayName = response[i].ref.displayName;
            attrInfo.attrId = response[i].attrId;
            attrInfo.attrName = response[i].attrName;
            attrInfo.attrType = response[i].attrType;
            attributeList.push(attrInfo);
          }
        }
        this.allAttr = attributeList;
      },
      error: () => {
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getAnalysisOneById(type: string, id: string, requestType: RequestMode):void{
    const observableTemp = this.commonService.getOneById(type, id).subscribe({
      next: response => {
        this.analysis = response;
        if (requestType == RequestMode.ANALYSISSAVESESSION) {
          this.SaveAnalysisSession(this.analysis.uuid, this.analysis.version);
        }
        else if (requestType == RequestMode.ANALYSISADD) {
          this.inputAnalysisForm.controls['type'].enable();
          this.inputAnalysisForm.controls['selectedItem'].enable();
          this.analysisForm.controls['selectedAnalysis'].setValue(response);
          this.onChangeItem();
        }

      },
      error: response => {
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getAnalysisOnyByUuidAndVersion(type: string, uuid: string, version: string):void{
    const observableTemp = this.commonService.getOnyByUuidAndVersion(type, uuid, version).subscribe({
      next: response => {
        this.analysis = response;
        this.analysisForm.controls['selectedSession'].setValue(this.analysis);
        //For Edit Mode

        if (this.analysis.dependsOn) {
          let type = {
            text: response.dependsOn.ref.type,
            caption: response.dependsOn.ref.type.toUpperCase()
          }
          this.inputAnalysisForm.controls['type'].setValue(type);
          console.log("calling getAnalysisOnyByUuidAndVersion type analysis");
          this.onChangeType();
        }
      },
      error: response => {

      }
    });
    this.addSubscribe(observableTemp);
  }

  private getBROnyByUuidAndVersion(type: string, uuid: string, version: string, scenarioId: number):void{
    const observableTemp = this.commonService.getOnyByUuidAndVersion(type, uuid, version).subscribe({
      next: (response: any) => {
        this.rule = response;
        this.scenarioTab[scenarioId].lowValue = parseInt(response.thresholdInfo.low);
        this.scenarioTab[scenarioId].medValue = parseInt(response.thresholdInfo.medium);
        this.scenarioTab[scenarioId].highValue = parseInt(response.thresholdInfo.high);
        this.scenarioTab[scenarioId].thresholdType = response.thresholdInfo.type;
      },
      error: (response: any) => {

      }
    });
    this.addSubscribe(observableTemp);
  }

  private getPriview():void{
    this.spinner.show("input-preview");
    this.priviewCols = [];
    this.priviewResult = [];
    this.isInputPreviewInprogess = true;
    this.isInputPreviewError = false;
    this.isInputPreviewSuccess = false;
    this.isInputPreviewNoRecord = false;
    const observableTemp = this.whatIfAnalysisService.getPriviewResult(this.analysisForm.value.selectedAnalysis.uuid,
      this.analysisForm.value.selectedAnalysis.version, MetaType.WhatIFANALYSIS)
      .subscribe({
        next: response => {
          console.log("Input Responce", response);
          this.spinner.hide("input-preview");
          this.isInputPreviewSuccess = true;
          this.isInputPreviewInprogess = false;

          if (response != null && response.data != null && response.data.length > 0) {
            this.pTablePriviewHeight = this.getPTableHeight(response.data);
            this.priviewCols = this.prepareColumns(Object.keys(response.data[0]), null);
            console.log('checked priviewcols value ',this.priviewCols)
            this.priviewResult = response.data;
            this.cols = this.priviewCols;
            this._selectedColumns = this.cols;
          } else {
            this.isInputPreviewNoRecord = true;

          }
        },
        error: response => {
          this.spinner.hide("input-preview");
          this.isInputPreviewError = true;
          this.isInputPreviewSuccess = false;
          this.isInputPreviewInprogess = false;
          this.priviewErrorContent = response.error
          if (typeof this.priviewErrorContent == 'object') {
            this.priviewErrorContent = response.error.message;
          }
        }
      });
      this.addSubscribe(observableTemp);
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }
  set selectedColumns(val: any[]) {
    //restore original order
    this._selectedColumns = this.cols.filter((col: any) => val.includes(col));

  }
  private ruleExecute(uuid: string, version: string, type: string, data: any, scenarioId: number):void{
    this.spinner.show("rule-execution");
    this.scenarioTab[scenarioId].isRuleExecutionInprogess = true;
    this.scenarioTab[scenarioId].isRuleExecutionError = false;
    this.scenarioTab[scenarioId].isRuleExecutionSuccess = false;
    const observableTemp = this.whatIfAnalysisService.ruleExecute(uuid, version, type, data, scenarioId).subscribe({
      next: (response: any) => {
        if (response.success == true) {
          this.spinner.hide("rule-execution");
          this.isAnalysisSaveDisabled = false;

          this.scenarioTab[scenarioId].isRuleExecutionInprogess = false;
          this.scenarioTab[scenarioId].isTabReady = true;
          this.scenarioTab[scenarioId].isRuleExecutionError = false;
          this.scenarioTab[scenarioId].isRuleExecutionSuccess = true;

          this.getRuleOverviewResult(uuid, version, type, null, scenarioId);
          this.getRuleResult(uuid, version, type, scenarioId);
          console.log(this.scenarioTab);
        } else {
          this.spinner.hide("rule-execution");
          this.scenarioTab[scenarioId].isRuleExecutionError = true;
          this.scenarioTab[scenarioId].isRuleExecutionSuccess = false;
          this.ruleErrorContent = response.error.message
        }
      },
      error: response => {
        this.spinner.hide("rule-execution");
        this.scenarioTab[scenarioId].isRuleExecutionError = true;
        this.scenarioTab[scenarioId].isRuleExecutionSuccess = false;
        this.ruleErrorContent = response.error
        if (typeof this.ruleErrorContent == 'object') {
          this.ruleErrorContent = response.error.message;
        }
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getRuleResult(uuid: string, version: string, type: string, scenarioId: number):void{
    this.spinner.show("rule-result");
    this.scenarioTab[scenarioId].isRuleResltInprogess = true;
    this.scenarioTab[scenarioId].isRuleResultError = false;
    this.scenarioTab[scenarioId].isRuleResultSuccess = false;
    const observableTemp = this.whatIfAnalysisService.ruleResult(uuid, version, type, scenarioId).subscribe({
      next: (response: any) => {
        this.spinner.hide("rule-result");
        if (response != null && response.data.length > 0 && response.success) {
          this.scenarioTab[scenarioId].pTableResultHeight = this.getPTableHeight(response.data);
          this.scenarioTab[scenarioId].ruleResultCols = this.prepareColumns(Object.keys(response.data[0]), this.fColumnsList);
          this.scenarioTab[scenarioId].ruleResult = response.data;
          this.scenarioTab[scenarioId].isRuleResultSuccess = true;
          this.scenarioTab[scenarioId].isRuleResltInprogess = false;
          setTimeout(() => {
            this.frozenColumns(this.fColumnsList);
          }, 1000)
        } else if (response != null && !response.success) {
          this.scenarioTab[scenarioId].isRuleResultError = true;
          this.scenarioTab[scenarioId].ruleResultErrorContent = response.error.message;
        }
        else {
          this.scenarioTab[scenarioId].isRuleResultNoRecord = true;
        }
      },
      error: (response: any) => {
        this.spinner.hide("rule-result");
        this.scenarioTab[scenarioId].isRuleResltInprogess = false;
        this.scenarioTab[scenarioId].isRuleResultError = true;
        this.scenarioTab[scenarioId].ruleResultErrorContent = response.error;
        if (typeof this.scenarioTab[scenarioId].ruleResultErrorContent == 'object') {
          this.scenarioTab[scenarioId].ruleResultErrorContent = response.error.message;
        }


      }
    });
    this.addSubscribe(observableTemp);
  }

  protected getRuleDetailResult(uuid: string, version: string, type: string, scenarioId: number):void{
    this.spinner.show("rule-detail-result");
    this.scenarioTab[scenarioId].isRuleDetailResltInprogess = true;
    this.scenarioTab[scenarioId].isRuleDetailResultError = false;
    this.scenarioTab[scenarioId].isRuleDetailResultSuccess = false;
    const observableTemp = this.whatIfAnalysisService.ruleDetailResult(uuid, version, type, scenarioId).subscribe({
      next: (response: any) => {
        this.spinner.hide("rule-detail-result");
        this.scenarioTab[scenarioId].isRuleDetailResltInprogess = false;
        if (response != null && response.data.length > 0 && response.success) {
          this.scenarioTab[scenarioId].pTableDetailResultHeight = this.getPTableHeight(response.data);
          this.scenarioTab[scenarioId].ruleDetailResultCols = this.prepareColumns(Object.keys(response.data[0]), null);
          this.scenarioTab[scenarioId].ruleDetailResult = response.data;
          this.scenarioTab[scenarioId].isRuleDetailResultSuccess = true;
        } else if (response != null && !response.success) {
          this.ruleErrorContent = response.error.message
        }
        else {
          this.scenarioTab[scenarioId].isRuleDetailNoRecord = true;
        }
      },
      error: (response: any) => {
        this.spinner.hide("rule-detail-result");
        this.scenarioTab[scenarioId].isRuleDetailResltInprogess = false;
        this.scenarioTab[scenarioId].isRuleDetailResultError = false;
      }
    });
    this.addSubscribe(observableTemp);
  }

  protected getRuleSummaryResult(uuid: string, version: string, type: string, scenarioId: number):void{
    this.spinner.show("rule-summary-result");
    this.scenarioTab[scenarioId].isRuleSummaryResultInprogess = true;
    this.scenarioTab[scenarioId].isRuleSummaryResultError = false;
    this.scenarioTab[scenarioId].isRuleSummarySuccess = false;
    const observableTemp = this.whatIfAnalysisService.ruleSummaryResult(uuid, version, type, scenarioId).subscribe({
      next: (response: any) => {
        this.spinner.hide("rule-summary-result");
        this.scenarioTab[scenarioId].isRuleSummaryResultInprogess = false;
        this.scenarioTab[scenarioId].isRuleSummarySuccess = true;
        if (response != null && response.data.length > 0 && response.success) {
          this.scenarioTab[scenarioId].pTableSummaryHeight = this.getPTableHeight(response.data);
          this.scenarioTab[scenarioId].ruleSummaryResultCols = this.prepareColumns(Object.keys(response.data[0]), null);
          this.scenarioTab[scenarioId].ruleSummaryResult = response.data;
        } else if (response != null && !response.success) {
          this.ruleErrorContent = response.error
          if (typeof this.ruleErrorContent == 'object') {
            this.ruleErrorContent = response.error.error.message;
          }
        }
        else {
          this.scenarioTab[scenarioId].isRuleSummaryResultNoRecord = true;
        }
      },
      error: (response: any) => {
        this.spinner.hide("rule-summary-result");
        this.scenarioTab[scenarioId].isRuleSummaryResultError = false;
        this.scenarioTab[scenarioId].isRuleSummaryResultInprogess = false;
        this.scenarioTab[scenarioId].isRuleSummarySuccess = false;

      }
    });
    this.addSubscribe(observableTemp);
  }

  private getRuleOverviewResult(uuid: string, version: string, type: string, data: any, scenarioId: number):void{
    this.spinner.show("rule-overview-result");
    this.scenarioTab[scenarioId].isRuleOverViewResultInprogess = true;
    this.scenarioTab[scenarioId].isRuleOverviewResultError = false;
    const observableTemp = this.whatIfAnalysisService.ruleOverViewResult(uuid, version, type, data, scenarioId).subscribe({
      next: (response: any) => {
        this.spinner.hide("rule-overview-result");
        console.log(this.scenarioTab);
        this.scenarioTab[scenarioId].isRuleOverViewResultInprogess = false;
        if (response != null && response.data != null && response.data.length > 0 && response.success) {
          this.scenarioTab[scenarioId].ruleSHData.json = response.data[0].histScores;
          this.scenarioTab[scenarioId].ruleSeverityData.json[0] = response.data[0];
        } else if (response != null && !response.success) {
          this.scenarioTab[scenarioId].ruleOverViewErrorContent = response.error.message
        }
      },
      error: (response: any) => {
        this.spinner.hide("rule-overview-result");
        this.scenarioTab[scenarioId].isRuleOverviewResultError = true;
        this.scenarioTab[scenarioId].isRuleOverViewResultInprogess = false;
        this.scenarioTab[scenarioId].ruleOverViewErrorContent = response.error;
        if (typeof this.scenarioTab[scenarioId].ruleOverViewErrorContent == 'object') {
          this.scenarioTab[scenarioId].ruleOverViewErrorContent = response.error.message;
        }
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getParamByRule(uuid: string, version: string, type: string, scenarioId: number):void{
    const observableTemp = this.commonService.getParamByRule(uuid, version, type).subscribe({
      next: (response: IParamlistHolder[]) => {
        if (response != null && response.length > 0) {
          this.isOpenParamsDialog = true;
          for (let i = 0; i < response.length; i++) {
            let paramInfo: any = {}
            let row = null;
            paramInfo.param = response[i];
            paramInfo.paramValue = response[i].paramValue.value;
            row = this.initParamRows(paramInfo);
            (this.scenarioTab[scenarioId].ruleParamForm.get("rows") as FormArray).push(row);
          }
        } else {
          this.isOpenParamsDialog = false;
          this.ruleExecute(this.analysis.uuid, this.analysis.version, MetaType.RULE, null, scenarioId);

        }
        console.log(this.scenarioTab[scenarioId].ruleParamForm);

      },
      error: response => {

      }
    });
    this.addSubscribe(observableTemp);
  }


  public getThreshold(index: number){
    let threshold: any = {}
    threshold.low = this.scenarioTab[index].lowValue;
    threshold.medium = this.scenarioTab[index].medValue;
    threshold.high = this.scenarioTab[index].highValue;
    threshold.type = this.scenarioTab[index].thresholdType;
    return threshold
  }

  private initParamRows(params: any){
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

  private prepareColumns(cols: any, fColumnsList: any){
    let columns = [];
    let fColumns = [];
    if (cols != null && cols.length > 0) {
      for (let i = 0; i < cols.length; i++) {
        let colsInfo = { field: "", header: "", visible : true, frozen: false };
        if (this.colHideList.indexOf(cols[i]) == -1) {
          colsInfo.field = cols[i];
          colsInfo.header = cols[i];
          colsInfo.visible = true
          if (fColumnsList == null || fColumnsList.indexOf(colsInfo.field) == -1) {
            columns.push(colsInfo);
          } else {
            colsInfo.frozen = false
            fColumns.push(colsInfo);
          }
        }
      }
    }
    columns = [...fColumns, ...columns];
    return columns;
  }

  private getPTableHeight(data: any) {
    if (data != null && data.length == 0) { return "90px"; }
    else if (data != null) {
      if (data.length <= 5) {
        return (data.length * 40) + 50 + "px"
      } else {
        return "220px"
      }
    }
  }

 /** @description use in filterlog(Input database) */ 
 protected onChangeRhsType(index):void{
    if(this.filterFormArr.at(index).get('rhsType').value.text == 'string'){
      this.filterFormArr.at(index).get('rhsValue').reset();
      this.filterFormArr.at(index).get('rhsValue').setValidators([Validators.required]);
      this.filterFormArr.at(index).get('rhsAttr').clearValidators();
      this.filterFormArr.at(index).get('rhsAttr').updateValueAndValidity();
      this.filterFormArr.at(index).get('rhsValue').updateValueAndValidity()
    }
    else{
      this.filterFormArr.at(index).get('rhsAttr').reset();
      this.filterFormArr.at(index).get('rhsAttr').setValidators([Validators.required]);
      this.filterFormArr.at(index).get('rhsValue').clearValidators();
      this.filterFormArr.at(index).get('rhsValue').updateValueAndValidity();
      this.filterFormArr.at(index).get('rhsAttr').updateValueAndValidity()
    }
  }
  

  private addSubscribe(subscriber:any):void {
    if(subscriber!=null && subscriber instanceof Subscriber){     
      this.subscriptions.push(subscriber);
    }
  }


  ngOnDestroy(): void {
    // Method for Unsubscribing Observable
     for (let subscription of this.subscriptions) {
        subscription.unsubscribe();
      }
  }
}