import { Component, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConfigService } from 'src/app/app-config.service';
import { DataTableService } from './data-table.service';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent {

  @Input() Url: any;
  resultCols: any[];
  result: any[];
  colHideList: any = ["rule_id", "app_uuid", "rule_exec_uuid", "rule_exec_version", "rule_exec_time", "rule_uuid", "rule_version", "version"];
  isInprogess: boolean = false;
  isError: boolean = false;
  pTableHeight: string;
  balanceFrozen: boolean = true
  isReadyTable = false;
  fColumnsList: any = ["score", "severity"];
  errorContent: any;
  errorTitle: string = 'Operation Failed';

  constructor(private dataTableService: DataTableService, private spinner: NgxSpinnerService, private appConfigService: AppConfigService) { }

  ngOnInit(): void {
    this.balanceFrozen = true
    this.isInprogess = true;
    this.result = [];
    this.isError = false;
  }

  ngAfterViewInit() {
    this.spinner.show("result");

    this.dataTableService.getResultByURL(this.Url).subscribe({
      next: (response: any) => {

        if (response != null && response.data != null && response.data.length > 0) {
          this.result = response.data;
          this.resultCols = this.prepareColumns(Object.keys(response.data[0]), this.fColumnsList);
          this.isReadyTable = true;
          this.pTableHeight = this.getPTableHeight(this.result);
          this.spinner.hide("result");
          this.isInprogess = false;
          this.isError = false;
          setTimeout(() => {
            this.frozenColumns(this.fColumnsList);
          }, 1000)
        } else {
          this.isInprogess = false;
          this.isError = true;
          this.spinner.hide("result");
          this.errorContent = response.error.message;

        }
      },
      error: (response: any) => {
        this.spinner.hide("result");
        this.isInprogess = false;
        this.isError = false;
        this.errorContent = response.error;
      }
    })
  }

  public frozenColumns = function (fColumns: any) {
    for (let i = 0; i < fColumns.length; i++) {
      let objIndex = this.resultCols.findIndex(((obj: any) => obj.field == fColumns[i]));
      this.resultCols[objIndex].frozen = true;
    }
  }

  public getSeveritryCaption(severity: string): any {
    return this.appConfigService.getSeveritryCaption(severity);
  }
  public getSeverityBGColor(severity: string): any {
    return this.appConfigService.getSeverityBGColor(severity)
  }

  private prepareColumns(cols: any, fColumnsList: any) {
    let columns = [];
    let fColumns = [];
    if (cols != null && cols.length > 0) {
      for (let i = 0; i < cols.length; i++) {
        let colsInfo = { field: "", header: "", hide: false, frozen: false };
        if (this.colHideList.indexOf(cols[i]) == -1) {
          colsInfo.field = cols[i];
          colsInfo.header = cols[i];
          if (fColumnsList.indexOf(colsInfo.field) == -1) {
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

}
