import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MenuItem } from 'primeng/api';
import { DataType } from 'src/app/shared/enums/data-type.enmu';
import { MetaType } from 'src/app/shared/enums/api/meta-type.enum';
import { IColStructure } from 'src/app/shared/models/col-structure.model';
import { CommonService } from 'src/app/shared/services/common.service';
import { HelperService } from 'src/app/shared/services/helper.service';
import { AppConfigService } from 'src/app/app-config.service';
import { DownloadOptions, IDownloadOptions } from 'src/app/shared/components/download/download-model';

@Component({
  selector: 'app-report-details',
  templateUrl: './report-details.component.html',
  styleUrl: './report-details.component.scss'
})
export class ReportDetailsComponent implements OnInit {
  protected downloadOptions: IDownloadOptions
  protected isEditEnable:boolean=false;
  protected breadcrumbItems:MenuItem[];
  protected breadcrumbHome:MenuItem;
  protected attributes: any[] = []
  protected dataTypeEnum = DataType;
  protected filterForm: FormGroup;
  protected filterDialog: boolean = false;
  protected items: any[]
  protected tooltipObj = {}
  protected length: number;
  protected selectedOptions: any[] = [];
  protected cols: IColStructure[];
  protected tableCols: IColStructure[];
  protected errorTitle: string;
  protected errorContent: string;
  protected messageHead: string;
  protected listFetched: boolean = false;
  protected tableRows: any = [];
  protected tempTableRows: any = [];
  private filterObj: {};
  private validationFlag: boolean;
  protected downloadModal: boolean = false;
  protected isReportError:boolean=false;
  protected isReportNoRecord:boolean=false;
  protected isReportInProgress:boolean=false;
  protected disableDownload:boolean=true;
  private isMainCheckboxChecked: boolean = false;
  
  reportDetail: any;
  pTableHeight: string;

  protected allModes: any = [
    { name: 'APPEND', value: 'APPEND' },
    { name: 'OVERRIDE', value: 'OVERRIDE' }
  ];
  protected lhsTypes: any = [
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
  protected logicalOperators: any = [{ 'text': 'AND', 'caption': 'AND' }, { 'text': 'OR', 'caption': 'OR' }];
  
  constructor(private router: ActivatedRoute, private helperService: HelperService, private formBuilder: FormBuilder,
    private routerNav: Router, private commonService: CommonService, private spinner: NgxSpinnerService,
    private appConfigService: AppConfigService) { }
    
  ngOnInit(): void {
    // this.breadcrumbHome={icon:"pi pi-home",routerLink:['/home']};
    this.breadcrumbItems=[];
    this.breadcrumbItems.push({label:"Report",routerLink:['/reports']});
    this.filterForm = this.formBuilder.group({
      rows: this.formBuilder.array([])
    });
    
    
    this.router.paramMap
    .subscribe({
      next: (respones: ParamMap) => {
        this.reportDetail = {};
        this.reportDetail.uuid = respones.get("uuid");
        this.reportDetail.version = respones.get("version");
        this.reportDetail.name = respones.get("name");

        this.breadcrumbItems.push({label:this.reportDetail.name});

      }
    })
    this.setMenuOptions()
    this.getReportData(null)
    this.getAnalysisOnyByUuidAndVersion(MetaType.REPORT, this.reportDetail.uuid, this.reportDetail.version)
  }
  
  private getAnalysisOnyByUuidAndVersion(type: string, uuid: string, version: string) {
    const observableTemp = this.commonService.getOnyByUuidAndVersion(type, uuid, version).subscribe({
      next: response => {
        response.attributeInfo.forEach(attr => {
          let attrObj = {
            name: attr.attrSourceName,
            code: attr.attrSourceId,
            ref: attr.sourceAttr.ref
          }
          this.attributes.push(attrObj)
        })
      },
      error: err => {
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    });
    //this.addSubscribe(observableTemp);
  }

  private setMenuOptions() {
    this.items = [
      {
        label: 'Options',
        items: [
          {
            label: 'Add Filter',
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

  public openFilterDialog() {
    this.filterDialog = true;
  }

  private clearFilters() {
    this.filterFormArr.clear()
    this.isEditEnable=false;
    this.getReportData(null);
  }

  private getReportData(filterBody:any){
    this.tableRows = []; 
    this.tableCols = []
    this.spinner.show("table-spinner")
    this.listFetched = false;
    this.isReportError=false;
    this.disableDownload=true;
    this.isReportNoRecord=false;
    this.isReportInProgress=true;
    this.commonService.getReportSample(this.reportDetail.uuid,this.reportDetail.version,500,filterBody).subscribe({
      next: (response:any) => {                           
        this.tempTableRows = []
        this.tempTableRows = response;
        this.tableRows = this.tempTableRows; 
        this.listFetched = true;
        this.disableDownload=false;
        this.isReportNoRecord=false;
        this.isReportInProgress=false;

        if (response != null && response.length > 0) {
          this.prepareColumns(Object.keys(this.tableRows[0]));
          this.tableCols = this.cols;
          this.selectedOptions = this.tableCols
          this.length = response.length
          this.pTableHeight = this.getPTableHeight();  
        }
        else{
          this.isReportError=false
          this.isReportNoRecord=true
          this.spinner.hide("table-spinner");
        }
      },
      error: (err) => {
        this.isReportError=true
        this.listFetched = false;
        this.disableDownload=true
        this.spinner.hide("table-spinner")
        this.isReportInProgress=false
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
       }
    })
    //this.addSubscribe(observableTemp);
  }

  private prepareColumns(cols: any):void {
    if (cols != null && cols.length > 0) {
      this.cols = [];
      for (let i = 0; i < cols.length; i++) {
        let colsInfo = { field: "", header: "", visible : true };
        colsInfo.field = cols[i];
        colsInfo.header = cols[i];
        colsInfo.visible = true
        this.cols.push(colsInfo);
      }
    }
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

  protected searchTableRows(searchStr: any): void {
    this.tableRows = this.helperService.setSearchTerm(this.tempTableRows, searchStr);
  }

  navigateToReportPage(){
    this.routerNav.navigateByUrl('/reports');
  }
  onClickRefresh(){
    this.pTableHeight = this.getPTableHeight();
    this.getReportData(null);
  }


  private getPTableHeight() {
    if (this.tableRows != null && this.tableRows.length == 0 && this.listFetched) {
      return "550px";
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

  showTooltip(td,span,field){
    if(span.offsetWidth + 28 > td.clientWidth){
      this.tooltipObj[field] = true
    }
   }

   protected addFilterRow() {
    // this.filterFormArr.push(this.initFilterRows());
    // let filterForm = this.filterForm.get("rows").value;

    const newRow = this.initFilterRows();
    newRow.get('select').setValue(this.isMainCheckboxChecked);
    
    this.filterFormArr.push(newRow);
    let filterForm = this.filterForm.get("rows").value;
      filterForm.forEach((entry, index) => {
        if (index == 0) {
          this.filterFormArr.at(index).get('logicalOperator').disable()
          this.filterFormArr.at(index).get('logicalOperator').updateValueAndValidity()
        }
        if (index > 0) {
          this.filterFormArr.at(index).get('logicalOperator').setValue(this.logicalOperators[0])
        }
      })

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

  get filterFormArr() {
    return this.filterForm.get("rows") as FormArray;
  }

  onChangeSelectAllFilter(event) {
    this.isMainCheckboxChecked = event.checked;
    if (this.filterFormArr.length > 0) {
      this.filterFormArr.controls.forEach(filter => {
        filter.get('select').setValue(event.checked);
      })
    }
  }

  public filterSubmit(): any {
    this.validationFlag = true;
    this.applyValidationToFilter()
    this.getFilterPreviewData()
    this.setIsEditFlag();
  }

  private getFilterPreviewData() {
    if (this.validationFlag) {
      this.filterDialog = false
      this.filterObj = this.getRequestObjForFilter();
      this.getReportData(this.filterObj);
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

  private getRequestObjForFilter() {
    let filterHolder = []
    let finalObj = {}
    for (let i = 0; i < this.filterFormArr.length; i++) {
      let filterObj = {
        "display_seq": i,
        "logicalOperator": this.filterFormArr.at(i).get('logicalOperator').value.caption ?
          this.filterFormArr.at(i).get('logicalOperator').value.caption : "",
        "operator": this.filterFormArr.at(i).get('operator').value.value,
        "operand": [
          {
            "ref":this.filterFormArr.at(i).get('lhsAttr').value.ref,
            "attributeId": this.filterFormArr.at(i).get('lhsAttr').value.code,
            "value": this.filterFormArr.at(i).get('lhsValue').value
          },
          {
            "ref": {
              "type": this.filterFormArr.at(i).get('rhsType').value.text ==MetaType.DATAPOD ?this.filterFormArr.at(i).get('lhsAttr').value.ref.type :MetaType.SIMPLE,
              "uuid": this.filterFormArr.at(i).get('rhsType').value.text ==MetaType.DATAPOD ?this.filterFormArr.at(i).get('lhsAttr').value.ref.uuid :null
            },
            "attributeType": this.filterFormArr.at(i).get('rhsType').value.text,
            "value": this.filterFormArr.at(i).get('rhsValue').value
          }
        ]
      }
      filterHolder.push(filterObj)
      finalObj['filterInfoHolder'] = filterHolder
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
  
  protected openDownloadModal(): void {
    this.downloadModal = true
    this.downloadOptions = new DownloadOptions()
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerBaseUrl = this.appConfigService.getBaseControllerUrl();
    let UUID = this.reportDetail.uuid
    let version = this.reportDetail.version
    let url = baseUrl + controllerBaseUrl + "/report/download?action=view" + "&uuid=" + UUID + "&version=" + version    
    this.downloadOptions.url = url 
    this.downloadOptions.payload = this.filterObj
    this.downloadOptions.type = 'get'
  }
}
