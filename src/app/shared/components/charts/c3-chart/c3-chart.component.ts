import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as c3 from 'c3';


@Component({
  selector: 'app-c3-chart',
  templateUrl: './c3-chart.component.html',
  styleUrl: './c3-chart.component.scss'
})
export class C3ChartComponent {


  @Input() id: any;
  @Input() data:any;
  @Output() onC3ClickEvent?:EventEmitter<any>=new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    let thisC3ChartComponent=this;
    this.data.onclick=function(d:any,i:any){
      thisC3ChartComponent.handleClickEvent(d,i)
    }
    if(this.id) {
      let tempId = this.id;
      let chart = c3.generate({
        bindto: '#' + tempId,
        data:this.data,
        axis: {
          x: {
            
            type: "category"
          }
        },
      });
      chart.resize();

    }
  }

  public handleClickEvent(data:any,event:any){
    this.onC3ClickEvent.emit(data);
  }
}
