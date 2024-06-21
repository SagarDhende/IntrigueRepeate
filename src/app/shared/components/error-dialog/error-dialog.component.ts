import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss']
})
export class ErrorDialogComponent implements OnInit {
  @Input() public isErrorDialogOpen: boolean=false;
  @Input() public position:string="CENTER";
  @Input() public title: string;
  @Input() public content: any;
  @Input() public messageHead: string;
  protected isErrorDialogVisible: boolean = false;

  constructor(){
    this.isErrorDialogVisible=this.isErrorDialogOpen;
  }

  ngOnInit(): void {
    if(typeof this.content =='object'){
      this.content=this.content.message;
    }
  }

}
