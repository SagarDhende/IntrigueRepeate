import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Format, IDownloadOptions, Layout } from './download-model';
import { AppConfigService } from 'src/app/app-config.service';
import { IDownloadSetting } from 'src/app/app-settings.models';
import { CommonService } from '../../services/common.service';
import { HttpRequest } from '@angular/common/http';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrl: './download.component.scss'
})
export class DownloadComponent implements OnInit, OnChanges {

  @Output() downloadDialog = new EventEmitter<boolean>(); 
  @Input()  public downloadOptions: IDownloadOptions;
  protected errorTitle: string;
  protected errorContent: string;
  protected messageHead: string;
  protected downloadModal: boolean = false;
  private downloadSettings: IDownloadSetting
  protected downloadForm: FormGroup
  protected isDownloadError = false;
  protected actionButtonLoading: boolean = false;

  protected formats = [
    { name: 'CSV', value: Format.CSV },
    { name: 'EXCEL', value: Format.EXCEL },
    { name: 'PDF', value: Format.PDF },
    { name: 'PSV', value: Format.PSV },
    { name: 'TSV', value: Format.TSV },
  ]

  protected layout = [
    { name: 'LANDSCAPE', value: Layout.LANDSCAPE },
    { name: 'PORTRAIT', value: Layout.PORTRAIT},
  ]
  
  ngOnChanges(changes: SimpleChanges): void {
    this.openDownloadModal()
  }

  ngOnInit(): void {
  console.log("Inside OnInit")
  this.openDownloadModal()
  }

  protected openDownloadModal(){
    this.downloadSettings = this.appConfigService.getDownloadSettings()
    this.createdownloadFormGroup()
    this.downloadModal = true
    this.isDownloadError = false;
    this.actionButtonLoading = false;
    this.downloadForm.get('format').setValue({name: 'CSV', value: Format.CSV })
    this.downloadForm.get('layout').setValue({name: '', value: '' })
    this.downloadForm.get('rows').setValue(this.downloadSettings.rows)
    this.downloadForm.get('layout').disable()
  }

  constructor(private appConfigService: AppConfigService, private commonService: CommonService){
    console.log("Inside Constructor")
  }

  private createdownloadFormGroup():void{
    this.downloadForm = new FormGroup({
      rows: new FormControl(this.downloadSettings.rows,[Validators.required, Validators.min(this.downloadSettings.minRows), 
                                 Validators.max(this.downloadSettings.maxRows)]),
      format: new FormControl({name: 'CSV', value: Format.CSV }),
      layout: new FormControl({name: '', value: ''})
    })
  }

  protected downloadResult(){
    this.isDownloadError = false;
    this.actionButtonLoading = true;
    let rows = this.downloadForm.get('rows').value
    let format = this.downloadForm.get('format').value?.value
    let layout = this.downloadForm.get('layout').value?.value
    let url = this.downloadOptions.url + "&rows=" + rows + "&format=" + format + "&layout=" + layout;
      this.commonService.downloadResult(url, this.downloadOptions.type, this.downloadOptions.payload).subscribe({
        next:(response: HttpRequest<any>) => {
         let contentType = response.headers.get('content-type')
         let fileName = response.headers.get('filename')
         this.downloadFile(response.body,fileName, contentType);
         this.actionButtonLoading = false;
         this.downloadModal = false;
         this.closeDialog()
        },
        error:(err:any) => {
          this.isDownloadError = true;
          this.actionButtonLoading = false;
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
    }

    protected onChangeFormat(): void {
      let format = this.downloadForm.get('format').value?.value;
      const layoutControl = this.downloadForm.get('layout');
    
      if (format === Format.PDF) {
        layoutControl.enable();
        layoutControl.setValue(layoutControl.value?.value ? layoutControl.value : { name: 'LANDSCAPE', value: Layout.LANDSCAPE });
      } else {
        layoutControl.setValue({ name: '', value: '' });
        layoutControl.disable();
      }
    }
    
    protected isSubmitDisabled(): boolean {
      const format = this.downloadForm.get('format').value?.value;
      const layout = this.downloadForm.get('layout').value?.value;
      const rows = this.downloadForm.get('rows').value;

      if (format === Format.PDF && (!layout || !rows)) {
          return true;
      }

      return !rows;
    }

  private downloadFile(data:any,fileName:string, contentType) {
    const blob = new Blob([data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    a.download = fileName;//this.detailsObj.name; // Set the file name here
    a.click();
    window.URL.revokeObjectURL(url);
  }

  protected closeDialog(): void{
    this.downloadDialog.emit(true)
  }
}
