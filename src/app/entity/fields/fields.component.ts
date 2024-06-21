import { Component  ,Input, OnDestroy, OnInit  } from '@angular/core';
import { EntityService } from '../entity.service';
import { Subscriber, Subscription } from 'rxjs';

@Component({
  selector: 'app-fields',
  templateUrl: './fields.component.html',
  styleUrl: './fields.component.scss'
})
export class FieldsComponent implements OnInit, OnDestroy{

 @Input() data: any;
 @Input() control: any;
 @Input() duuid:any;
 protected emptyFilterMessage = "No Record Found";
 protected model: number[];
 protected emptySearch: any;
 protected allOptions: any;
 protected unique: any = [];
 protected rangeMinMax=[0,100];

 /** @description- Array For Unsubscription Of Observable  */
 private subscriptions: Subscription[] = [];

 constructor(private entityService: EntityService) { }


  ngOnInit(): void {
    this.model = this.data.unique[0].name;
    this.emptySearch = "No Record Found";
    this.unique = this.data.unique;
    this.allOptions = this.data.unique;
    if (this.data.unique[0].value && this.data.unique[0].value.length > 1) {
      this.rangeMinMax = [Number(this.data.unique[0].value[0]), Number(this.data.unique[0].value[1])];
    }
  }

  protected searchChange(event: any): any {
    this.emptySearch = "Loading";
    let uuid = this.duuid;
    let attributeId = this.data.attributeId;
    if (event.filter.length > 0) {
      const observableTemp = this.entityService.getDynamicFilterValues(this.data.entityType, uuid, attributeId, event.filter).subscribe({
        next: (response: any) => {
          this.allOptions = response;
          if (response.length == 0) {
            this.emptySearch = "No Record Found";
          }
        }
      });
      this.addSubscribe(observableTemp);
    }
    else {
      this.allOptions = this.unique;
    }
  }
  
  private addSubscribe(subscriber:any):void {
    if(subscriber!=null && subscriber instanceof Subscriber){     
      this.subscriptions.push(subscriber);
    }
  }

  ngOnDestroy(): void {
     for (let subscription of this.subscriptions) {
        subscription.unsubscribe();
      }
  }

}
