import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Router } from '@angular/router';

import { NgxSpinnerService } from 'ngx-spinner';
import { MenuItem } from 'primeng/api';

import { ActionType } from 'src/app/shared/components/common-list/action-type';
import { Options } from 'src/app/shared/components/common-list/common-list.model';
import { TableListComponent } from 'src/app/shared/components/common-list/table-list/table-list.component';
import { DataType } from 'src/app/shared/enums/data-type.enmu';
import { MetaType } from 'src/app/shared/enums/api/meta-type.enum';
import { IColStructure } from 'src/app/shared/models/col-structure.model';
import {FinalFilterObject, FinalObj} from './filter-model'

import { CommonService } from 'src/app/shared/services/common.service';
import { HelperService } from 'src/app/shared/services/helper.service';
import { AppConfigService } from 'src/app/app-config.service';
import { DownloadOptions, IDownloadOptions } from 'src/app/shared/components/download/download-model';

@Component({
  selector: 'app-dataset-details',
  templateUrl: './dataset-details.component.html',
  styleUrl: './dataset-details.component.scss'
})
export class DatasetDetailsComponent implements OnInit {

  protected downloadOptions: IDownloadOptions;
  protected type: string;
  protected tooltipObj={}
  protected breadcrumbItems:MenuItem[];
  protected breadcrumbHome:MenuItem;
  @ViewChild(TableListComponent) tableListComponent;
  protected uploadForm: FormGroup;
  protected downloadModal: boolean = false;
  protected items: any[]
  protected attributes: any[] = []
  protected dataTypeEnum = DataType;
  protected filterDialog: boolean = false;
  protected filterForm: FormGroup;
  protected length: number;
  protected selectedOptions: any[] = [];
  protected cols: IColStructure[];
  protected errorTitle: string;
  protected errorContent: string;
  protected messageHead: string;
  protected listFetched: boolean = false;
  protected tableRows: any = [];
  protected tempTableRows: any = [];
  protected detailsObj: any;
  protected options: Options;
  protected metaType = MetaType.UPLOADEXEC;
  protected isUploadShow: boolean;
  protected isPreviewShow: boolean;
  protected uploadDialog: boolean;
  protected selectedFile: any;
  protected isEditEnable:boolean=false;
  protected fileError: string | null = null;
  protected checked: boolean=false;
  protected refreshSeconds: number = 5;
  private autoRefreshInterval: any;
  protected uploadLength:number
  private validationFlag: boolean;
  private filterObj: FinalFilterObject;
  private isMainCheckboxChecked: boolean = false;
  protected isDownloadError = false;
  protected actionButtonLoading: boolean = false;
  protected disableDownload:boolean=true;
  private selectedMode: any

  protected allModes: any = [
    { name: 'APPEND', value: 'APPEND' },
    { name: 'OVERWRITE', value: 'OVERWRITE' },
    { name: 'MERGE', value: 'MERGE' }
  ];
  protected lhsTypes: any = [
    { "text": "string", "caption": "STRING" },
    { "text": "string", "caption": "INTEGER" },
  ];

  protected rhsTypes: any =
    [{ "text": "string", "caption": "STRING", "disabled": false },
    { "text": "string", "caption": "INTEGER", "disabled": false },
    ];
  protected operators: any = [
    { "caption": "EQUAL (=)", "value": "=" },
    { "caption": " NOT EQUAL (!=)", "value": "!=" },
    { "caption": "LESS THAN (<)", "value": "<" },
    { "caption": "GREATER THAN (>) ", "value": ">" },
    { "caption": "LESS OR EQUAL (<=) ", "value": "<=" },
    { "caption": "GREATER OR EQUAL (>=)  ", "value": ">=" },
  ];

  protected logicalOperators: any = [{ 'text': 'AND', 'caption': 'AND' }, { 'text': 'OR', 'caption': 'OR' }];

  @ViewChild('fileSelect') protected fileSelect: any;
  tableCols: IColStructure[];
  constructor(private router: ActivatedRoute, private helperService: HelperService,
    private routerNav: Router, private commonService: CommonService, private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder, private route: ActivatedRoute, private appConfigService: AppConfigService) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe({
      next: (params: any) => {
        this.type = params.type;
      }
    });
    // this.breadcrumbHome={icon:"pi pi-home",routerLink:['/home']};
    this.breadcrumbItems=[];
    this.breadcrumbItems.push({label:"Datasets",routerLink:['/datasets']});
    this.filterForm = this.formBuilder.group({
      rows: this.formBuilder.array([])
    });
    this.setMenuOptions()
    this.isPreviewShow = true;
    this.selectedMode = this.allModes[0];
    this.uploadForm = this.formBuilder.group({
      selectedFile: ['', [Validators.required]],
      mode: ['OVERWRITE', [Validators.required]],
      desc: ['']
    })
    this.router.paramMap
      .subscribe({
        next: (respones: ParamMap) => {
          this.detailsObj = {};
          this.detailsObj.uuid = respones.get("uuid");
          this.detailsObj.version = respones.get("version");
          this.detailsObj.name = respones.get("name");
          this.breadcrumbItems.push({label:this.detailsObj.name});
        }
      })
    this.setDynamicOptions();
    if(this.type == 'Table'){
      this.lhsTypes.push({ "text": "datapod", "caption": "ATTRIBUTE" })
      this.rhsTypes.push({"text": "datapod", "caption": "ATTRIBUTE", "disabled": false })
      this.getAnalysisOnyByUuidAndVersion(MetaType.DATAPOD, this.detailsObj.uuid, this.detailsObj.version)
      this.getDatapodPreview()
    }
    else if(this.type == 'View'){
      this.lhsTypes.push({ "text": "dataset", "caption": "ATTRIBUTE" })
      this.rhsTypes.push({"text": "dataset", "caption": "ATTRIBUTE", "disabled": false })
      this.getAnalysisOnyByUuidAndVersion(MetaType.DATASET, this.detailsObj.uuid, this.detailsObj.version)
      this.getDatasetPreview()
    }
  }



  protected getLength(length: number):void {
    this.uploadLength = length
  }
  private getDatasetPreview(filterObj?:FinalFilterObject){
    this.tableRows = [];
    this.tableCols = []
    this.spinner.show("table-spinner")
    this.listFetched = false;
    this.disableDownload=true
    this.commonService.getDatasetPreview(this.detailsObj.uuid, filterObj).subscribe({
      next: (response: any) => {
        this.tempTableRows = []
        this.tempTableRows = response;
        this.tableRows = this.tempTableRows;
        this.listFetched = true;
        this.disableDownload=false;
        if (response != null && response.length > 0) {
          this.prepareColumns(Object.keys(this.tableRows[0]));
        }
        this.tableCols = this.cols;
        this.selectedOptions = this.tableCols
        this.spinner.hide("table-spinner");
        this.length = response.length
      },
      error: (err) => {
        this.listFetched = true
        this.disableDownload=true
        this.spinner.hide("table-spinner")
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    })
  }

  private getDatapodPreview(filterObj?) {
    this.tableRows = [];
    this.tableCols = []
    this.spinner.show("table-spinner")
    this.listFetched = false;
    this.disableDownload=true;
    this.commonService.getDatapodPreview(this.detailsObj.uuid, this.detailsObj.version, 100, filterObj).subscribe({
      next: (response: any) => {
        this.tempTableRows = []
        this.tempTableRows = response;
        this.tableRows = this.tempTableRows;
        this.listFetched = true;
        this.disableDownload=false
        if (response != null && response.length > 0) {
          this.prepareColumns(Object.keys(this.tableRows[0]));
        }
        this.tableCols = this.cols;
        this.selectedOptions = this.tableCols
        this.spinner.hide("table-spinner");
        this.length = response.length
      },
      error: (err) => {
        this.listFetched = true
        this.disableDownload=true
        this.spinner.hide("table-spinner")
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    })
    //this.addSubscribe(observableTemp);
  }

  protected addFilterRow() {
    const newRow = this.initFilterRows();
    newRow.get('select').setValue(this.isMainCheckboxChecked);
    
    this.filterFormArr.push(newRow);
    
    let filterForm = this.filterForm.get("rows").value;
    filterForm.forEach((entry, index) => {
      if (index == 0) {
        this.filterFormArr.at(index).get('logicalOperator').disable();
        this.filterFormArr.at(index).get('logicalOperator').updateValueAndValidity();
      }
      if (index > 0) {
        this.filterFormArr.at(index).get('logicalOperator').setValue(this.logicalOperators[0]);
      }
    });
  }

  public deleteFilterRow(): void {
    this.filterFormArr.controls.forEach((filter: any, index: number) => {
      if (filter.get('select').value) {
        this.filterFormArr.removeAt(index)
        this.deleteFilterRow()
      }
    })
  }

  private initFilterRows() {
    return new FormGroup({
      'select': new FormControl(false),
      'logicalOperator': new FormControl('', [Validators.required]),
      'lhsType': new FormControl(this.lhsTypes[2], [Validators.required]),
      'lhsAttr': new FormControl('', [Validators.required]),
      'lhsValue': new FormControl(''),
      'operator': new FormControl(this.operators[0], [Validators.required]),
      'rhsType': new FormControl(this.rhsTypes[2], [Validators.required]),
      'rhsAttr': new FormControl('', [Validators.required]),
      'rhsValue': new FormControl('')
    });
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
  protected resetUploadForm(): void {
    this.uploadForm.reset();
    this.fileError = null;
    this.selectedFile = null;
  }

  protected onClickHome() {
    this.isUploadShow = false;
    this.isPreviewShow = true;
  }
  //Upload
  protected onClickUpload(): void {
    this.isUploadShow = true;
    this.isPreviewShow = false;
  }

  protected onFileChange(event: any): void {
    const file: File = event.target.files[0];
    const fileName: string = file.name;

    const regex = /[^a-zA-Z0-9._-]/;

    if (regex.test(fileName)) {
      this.fileError = 'Special character or space not allowed in file name.';
    } else {
      this.fileError = null;
      this.selectedFile = file;
      this.uploadForm.get('selectedFile')?.setValue(file);
      console.log(this.selectedFile.name);
    }

    this.selectedFile = file;
    console.log(this.selectedFile.name);
  }

  protected uploadAction(): void {
    this.uploadDialog = true;
  }

  protected onClickFileSelect(): void {
    this.fileSelect.nativeElement.click();
  }

  protected onSubmitUpload() {
    console.log(this.uploadForm.get('mode').value)
    let formData = new FormData();
    formData.append("csvFileName", this.selectedFile);
    this.uploadDialog = false;
    this.commonService.uploadFile(this.detailsObj.uuid, this.uploadForm.get('mode').value, MetaType.DATAPOD, formData).subscribe({
      next: (response: any) => {
        this.refreshClick();
        this.uploadForm.get('mode').setValue('OVERWRITE');
        this.uploadForm.get('desc').setValue('');
        this.uploadForm.get('selectedFile').reset(); 
        this.selectedFile = null; 
      },
      error: (error) => {
        this.refreshClick();
        this.uploadForm.get('mode').setValue('OVERWRITE');
        this.uploadForm.get('desc').setValue('');
        this.uploadForm.get('selectedFile').reset(); 
        this.selectedFile = null; 
        console.error('Error fetching logs:', error);
      }
    });
    setTimeout(() => {
      this.refreshClick();
    },1000);
    setTimeout(() => {
      this.refreshClick();
    },2000);
    
  }

  //Upload

  private setDynamicOptions(): void {
    this.options = new Options();
    this.options.isTableCaptionEnable = false;
    this.options.uuid = this.detailsObj.uuid;
    this.options.isExec = true;
    this.options.tableCols = [
      { field: 'name', header: 'Name', visible: true },
      { field: 'version', header: 'Version', visible: false },
      { field: 'createdBy', header: 'Submited By', visible: true },
      { field: 'updatedOn', header: 'Submited On', visible: true },
      { field: 'execDuration', header: 'Duration', visible: true },
      { field: 'sizeMB', header: 'Size MB', visible: true },
      { field: 'numRows', header: 'Rows', visible: true },
      { field: 'status', header: 'Status', visible: true },
      { field: 'action', header: 'Action', visible: true },
    ];
    this.options.requestParam = { publishFlag: "Y" }
    this.options.actionMenu = [{
      label: "View",
      icon: "pi pi-eye",
      actionType: ActionType.VIEW,
      // routerLink: null
    }]
  }

  protected onColumnSelectChange() {
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
  
  navigateToDataset(){
    this.routerNav.navigateByUrl('/datasets');
  }

  protected searchTableRows(searchStr: any): void {
    this.tableRows = this.helperService.setSearchTerm(this.tempTableRows, searchStr);
  }

  get filterFormArr() {
    return this.filterForm.get("rows") as FormArray;
  }
  protected onChangeSelectAllFilter(event) {
    this.isMainCheckboxChecked = event.checked;
    if (this.filterFormArr.length > 0) {
      this.filterFormArr.controls.forEach(filter => {
        filter.get('select').setValue(event.checked);
      });
    }
  }

  public openFilterDialog() {
    this.filterDialog = true;
  }

  public filterSubmit(): any {
    this.validationFlag = true;
    this.applyValidationToFilter()
    if(this.type == 'Table' && this.validationFlag){
      this.filterDialog = false
      this.filterObj = this.getRequestObjForDatapodFilter()
      this.getDatapodPreview(this.filterObj)
    }
    else if(this.type == 'View' && this.validationFlag){
      this.filterDialog = false
      this.filterObj = this.getRequestObjForDatasetFilter()
      this.getDatasetPreview(this.filterObj)
    }
    this.setIsEditFlag();
  }


  private getRequestObjForDatapodFilter() : FinalFilterObject{
    let finalObj = new FinalObj()
    finalObj.filterInfoHolder = []; 
    for (let i = 0; i < this.filterFormArr.length; i++) {
      const filterForm = this.filterFormArr.at(i);
      const lhsType = filterForm.get('lhsType').value.text;
      const rhsType = filterForm.get('rhsType').value.text;
      const isDatapodLhs = lhsType === 'datapod';
      const isDatapodRhs = rhsType === 'datapod';
      finalObj.filterInfoHolder.push({
        display_seq: i,
        logicalOperator: filterForm.get('logicalOperator').value.caption || "",
        operator: filterForm.get('operator').value.value,
        operand: [
          {
            ref: {
              type: isDatapodLhs ? MetaType.DATAPOD : "simple",
              uuid: isDatapodLhs ? this.detailsObj.uuid : undefined
            },
            attributeId: filterForm.get('lhsAttr').value.code,
            value: filterForm.get('lhsValue').value
          },
          {
            ref: {
              type: isDatapodRhs ? MetaType.DATAPOD : "simple",
              uuid: isDatapodRhs ? this.detailsObj.uuid : undefined
            },
            attributeType: rhsType,
            value: filterForm.get('rhsValue').value
          }
        ]
      })
    }
    return finalObj
  }

  private getRequestObjForDatasetFilter() : FinalFilterObject{
    let finalObj = new FinalObj()
    finalObj.filterInfoHolder = []; 
    for (let i = 0; i < this.filterFormArr.length; i++) {
      const filterForm = this.filterFormArr.at(i);
      const lhsType = filterForm.get('lhsType').value.text;
      const rhsType = filterForm.get('rhsType').value.text;
      const isDatasetLhs = lhsType === 'dataset';
      const isDatasetRhs = rhsType === 'dataset';
      finalObj.filterInfoHolder.push({
        display_seq: i,
        logicalOperator: filterForm.get('logicalOperator').value.caption || "",
        operator: filterForm.get('operator').value.value,
        operand: [
          {
            ref: {
              type: isDatasetLhs ? MetaType.DATASET : "simple",
              uuid: isDatasetLhs ? this.detailsObj.uuid : undefined
            },
            attributeId: filterForm.get('lhsAttr').value.code,
            value: filterForm.get('lhsValue').value
          },
          {
            ref: {
              type: isDatasetRhs ? MetaType.DATASET : "simple",
              uuid: isDatasetRhs ? this.detailsObj.uuid : undefined
            },
            attributeType: rhsType,
            value: filterForm.get('rhsValue').value
          }
        ]
      });
    }
    return finalObj
  }

  setIsEditFlag() {
    let filterFormValues = this.filterFormArr.controls.some(control => {
      const formGroup = control as FormGroup;
      return formGroup.get('lhsAttr').value || formGroup.get('rhsAttr').value;
    });
  
    this.isEditEnable = filterFormValues;
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
              this.openFilterDialog();
            }
          },
          {
            label: 'Clear Filter',
            icon: 'pi pi-times',
            command: () => {
              this.clearFilters();
            }
          }
        ]
      },
    ];
  }

  private clearFilters() {
    this.filterFormArr.clear()
    this.isEditEnable=false;
    this.filterObj.filterInfoHolder = []
    if(this.type == 'Table'){
      this.getDatapodPreview()
    }
    else if(this.type == 'View'){
      this.getDatasetPreview();
    }
  }

  private applyValidationToFilter() {
    let filterForm = this.filterForm.get("rows").value;
    for (let i = 0; i < this.filterFormArr.length; i++) {
      if ((filterForm[i].rhsAttr == "" || filterForm[i].rhsAttr == null) && this.filterFormArr.at(i).get('rhsType').value.text == 'datapod') {
        this.validationFlag = false;
        this.filterFormArr.at(i).get('rhsAttr').markAsTouched();
        this.filterFormArr.at(i).get('rhsAttr').errors['required'] = true;
      } else if ((filterForm[i].rhsValue == "" || filterForm[i].rhsValue == null) && this.filterFormArr.at(i).get('rhsType').value.text == 'string') {
        this.validationFlag = false;
        this.filterFormArr.at(i).get('rhsValue').markAsTouched();
        this.filterFormArr.at(i).get('rhsValue').errors['required'] = true;
      }
      if (filterForm[i].lhsAttr == "") {
        this.validationFlag = false;
        this.filterFormArr.at(i).get('lhsAttr').markAsTouched();
        this.filterFormArr.at(i).get('lhsAttr').errors['required'] = true;
      }
    }
  }

  private getAnalysisOnyByUuidAndVersion(type: string, uuid: string, version: string) {
    const observableTemp = this.commonService.getOnyByUuidAndVersion(type, uuid, version).subscribe({
      next: response => {
        if(this.type == 'Table'){
          response.attributes.forEach(attr => {
            let attrObj = {
              name: attr.name,
              code: attr.attributeId
            }
            this.attributes.push(attrObj)
          })
        }
        else if(this.type == 'View'){
          response.attributeInfo.forEach(attr => {
            let attrObj = {
              name: attr.attrSourceName,
              code: attr.attrSourceId
            }
            this.attributes.push(attrObj)
          })
        }
     
      },
      error: err => {
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    });
    //this.addSubscribe(observableTemp);
  }


  protected openDownloadModal(): void {
    this.downloadModal = true
    this.downloadOptions = new DownloadOptions()
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerBaseUrl = this.appConfigService.getBaseControllerUrl();
    let UUID = this.detailsObj.uuid
    let version = this.detailsObj.version
    if(this.type == 'Table'){
      let url = baseUrl + "/datapod/downloadWithFilter?action=view" + "&uuid=" + UUID + "&version=" + version  
      this.downloadOptions.url = url 
      this.downloadOptions.payload = this.filterObj
      this.downloadOptions.type = 'post'
    }
    else if(this.type == 'View'){
      let url = baseUrl + controllerBaseUrl + "/dataset/download?action=view" + "&uuid=" + UUID + "&version=" + version    
      this.downloadOptions.url = url 
      this.downloadOptions.payload = this.filterObj
      this.downloadOptions.type = 'post'
    }
  }

  protected refreshClick(){
    this.filterFormArr.clear()
    this.isEditEnable=false;
    this.filterObj.filterInfoHolder = []
    if(this.isPreviewShow){
      if(this.type == 'Table'){
        this.getDatapodPreview()
      }
      else if(this.type == 'View'){
        this.getDatasetPreview()
      }
    }
    else
    this.tableListComponent.refreshClick()
  }

  showTooltip(td,span,field){
   if(span.offsetWidth + 28 > td.clientWidth){
     this.tooltipObj[field] = true
   }
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
  ngOnDestroy(): void {
    clearInterval(this.autoRefreshInterval);
  }
}
