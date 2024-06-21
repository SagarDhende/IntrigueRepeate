import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDicomComponent } from './ngx-dicom.component';



@NgModule({
  declarations: [NgxDicomComponent],
  imports: [
    CommonModule
  ],
  exports:[NgxDicomComponent]
})
export class NgxDicomModule { }
