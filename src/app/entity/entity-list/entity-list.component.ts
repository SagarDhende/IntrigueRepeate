import {AfterViewInit,Component,ElementRef,HostListener,Input,OnInit,ViewChild} from "@angular/core";
import { EntityService } from "../entity.service";
import { NgxSpinnerService } from "ngx-spinner";
import {ActivatedRoute,NavigationEnd,ParamMap,Router} from "@angular/router";
import { MetaType } from "src/app/shared/enums/api/meta-type.enum";
import { IColStructure } from "src/app/shared/models/API/col-structure.model";
import { IEntity } from "src/app/shared/models/API/entity.model";
import { Pagination } from "src/app/shared/models/pagination.model";
import { FormControl, FormGroup } from "@angular/forms";
import { Subscriber, Subscription } from "rxjs";
import { TabView } from "primeng/tabview";
import { IBreadcrumb } from "src/app/shared/models/breadcrumn.model";
import { LazyLoadEvent } from "primeng/api";
import { DataType } from "src/app/shared/enums/data-type.enmu";
import { SidebarAccordionComponent } from "ng-sidebar-accordion";
import { SubjectService } from "src/app/shared/services/subject.service";
import { CommonService } from "src/app/shared/services/common.service";
import * as _ from 'underscore';
import { HelperService } from "src/app/shared/services/helper.service";




@Component({
  selector: "app-entity-list",
  templateUrl: "./entity-list.component.html",
  styleUrl: "./entity-list.component.scss",
})
export class EntityListComponent implements OnInit, AfterViewInit {


  @ViewChild('rightAccordion') accordion: SidebarAccordionComponent;
  @ViewChild(TabView) tabView!: TabView;
  @ViewChild ('cardElementRef') protected cardElementRef:ElementRef;
  protected isEditEnable: boolean = false;
  protected tooltipObj={}
  protected value: string
  protected listFetched:boolean = false
  protected selectedOptions: any[] = [];
  protected filteredLogs: any;
  protected selectedCases: any
  protected selectedColumn: any;
  protected duuid :any;
  protected countOfTabIndex: number = 0;
  protected items: { label: string; items: { label: string; icon: string; command: () => void; }[]; }[];
  protected cols: IColStructure[];
  protected entityCols: any;
  protected _selectedColumns: any = []
  protected entitys: IEntity[];
  protected tempEntitys: IEntity[];
  protected pTableHeight: string;
  protected type: string;
  protected uuid: string;
  protected isFilterConfigerd: boolean = true;
  protected isButtonEnable: boolean = true;
  protected pagination: Pagination;
  protected version: string;
  protected sortField: string = "";
  protected sortOrderBy: string = "";
  protected columns: any;
  protected tabIds = []; 
  protected filterForm: FormGroup = new FormGroup({});
  protected panelOpen: boolean = false;
  protected currentEntity: any;
  protected entitiesMeta: any;
  protected tabIndex: number;
  protected tabs: Array<any> = [];
  protected active: 1;

  private currentEntityKey: string;
  private attributes: any;
  private breadcrumb: IBreadcrumb[];
  private currentTabBreadcrumb: IBreadcrumb;
  private subscriptions: Subscription[] = [];  // Array For Unsubscription Of Observable
  public listError: boolean = false; 
  public messageHead: string = '';
  public errorTitle: string = '';
  public errorContent: string = '';


  constructor(private route: ActivatedRoute, private entityService: EntityService,
    private spinner: NgxSpinnerService, private _subjectShareService: SubjectService, private router: Router,
    private commonService: CommonService, private helperService: HelperService) {
      
    this.router.events.subscribe({
      next: (val: any) => {
        this.tabs = [];
        this.tabIds = [];
        if (val['navigationTrigger'] == 'imperative') {
          this.panelClose();
          this.listError = false;
        }
      }
    })

    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.tabs = [];
      }
    });
  }

  ngOnInit(): void {
    this.breadcrumb = [{ title: 'Entity', url: '/entity' }];
    this.items = [
      {
        label: 'Options',
        items: [
          {
            label: 'Edit Filter',
            icon: 'pi pi-plus',
            command: () => {
              this.panelToggle();
            }
          },
          {
            label: 'Clear filter',
            icon: 'pi pi-times',
            command: () => {
              this.clearFilter();
            }
          }
        ]
      },
    ];
    // this.pagination = new Pagination(10, 0, 20);
    // this.getEntityByType(this.uuid, this.type, this.pagination.offset, this.pagination.rows, this.sortField, this.sortOrderBy, []);
  }
  
  ngAfterViewInit(): void {
    this.breadcrumb = [{ title: 'Entity', url: false }]
    this.route.paramMap.subscribe({
      next: (params: ParamMap) => {
        this.spinner.show("entity-detail")
        this.cols = [];
        this.tabs = [];
        this.type = params.get("name");
        this.uuid = params.get("uuid");
        this.getOnyByUuidAndVersion(this.uuid);
        this.version = params.get('version');
        //this.pTableHeight = this.getPTableHeight();
        this.pagination = new Pagination(10, 0, 20);
        this.entitys = undefined;
        this.sortField = "";
        this.sortOrderBy = "";
        this.breadcrumb = [{ title: 'Entity', url: false }]
        this.currentTabBreadcrumb = { title: params.get("type"), url: false };
        this.breadcrumb.push(this.currentTabBreadcrumb);

        const observableTemp = this.commonService.getEntity().subscribe({
          next: (response) => {
            this.entitiesMeta = response;
            for (let i = 0; i < this.entitiesMeta.length; i++) {
              const element = this.entitiesMeta[i];
              if (element.name == this.type) {
                this.currentEntity = element.keyAttr;
                break;
              }
            }
          },
          error: (response) => {

          }
        });

        this.addSubscribe(observableTemp);
        this.getEntityByFilter(this.uuid, this.type, [])
        this.getEntityByType(this.uuid, this.type, this.pagination.offset, this.pagination.rows, this.sortField, this.sortOrderBy, []);
        this.tabIndex = 0;
        this.currentTabBreadcrumb = { title: this.tabView.tabs[this.tabIndex].header, url: false };
        if (this.tabs.length) {
          this.breadcrumb.pop();
        }
        this.breadcrumb.push(this.currentTabBreadcrumb);
        this.currentTabBreadcrumb = { title: this.tabView.tabs[this.tabIndex].header, url: false };
        this.breadcrumb.push(this.currentTabBreadcrumb);
      }
    });
    this.tabIndex = 0;
  }
  
  @HostListener('window:resize',['$event'])
  onWindowRezie(event:Event){
    if(this.tabIndex<1){
    let pTableHeightTemp = this.getPTableHeight();
    let cardHeight =this.cardElementRef.nativeElement.offsetHeight;
    let wrapperElements: HTMLCollection = document.getElementsByClassName('p-datatable-wrapper');
    Array.prototype.forEach.call(wrapperElements, function(wrapperElement) {
        let maxHeight = wrapperElement.style["max-height"];
        cardHeight=cardHeight-230;
        if(cardHeight < pTableHeightTemp) {
          wrapperElement.style["height"] = cardHeight+"px";
        }
        else{ 
        wrapperElement.style["height"] = pTableHeightTemp +"px";
        
        }
    });  
  }
  }


  protected refreshClick(): void {
    this.spinner.show("entity-detail");
    //this.pTableHeight = this.getPTableHeight();
    this.entitys = undefined;
    this.sortField = "";
    this.sortOrderBy = "";
    this.getEntityByFilter(this.uuid, this.type, [])
    this.getEntityByType(this.uuid, this.type, this.pagination?.offset, this.pagination?.rows, this.sortField, this.sortOrderBy, []);
    this.panelClose();
  }

  protected tabChange(): void {
    if (this.tabIndex <= 1) {
      this.currentTabBreadcrumb = { title: this.tabView.tabs[this.tabIndex].header, url: false };
      this.breadcrumb.pop();
      this.breadcrumb.push(this.currentTabBreadcrumb);
    }
    else {
      this.currentTabBreadcrumb = { title: this.tabs[this.tabIndex - 1].id, url: false };
      this.breadcrumb.pop();
      this.breadcrumb.push(this.currentTabBreadcrumb);
    }
    this.panelClose();
  }

  protected async tabClosed(event: any):Promise<void> {
    let shortName = '';
    await new Promise<void>(resolve => setTimeout(() => {
      this.tabIndex = 0;
      this.tabs.splice(event.index - 1, 1);
      this.tabIds.splice(event.index - 1, 1);
    }, 10));
  }

   // @todo openDetailsTab 
   protected async openDetailsTab(item: any):Promise<void> {

    let data = {
      "type": this.type,
      "uuid": this.uuid,
      "id": item[this.currentEntityKey],
      "shortName": "",
      "version": this.version
    }
    this.panelClose();
    data.shortName = this.type + '-' + item[this.currentEntityKey]
    if (!this.tabIds.includes(item[this.currentEntityKey])) {
      this.tabs.push(data)
      this.tabIds.push(item[this.currentEntityKey])
      await new Promise(f => setTimeout(() => {
        this.tabIndex = this.tabs.length;

        this.currentTabBreadcrumb = { title: item[this.currentEntityKey], url: false };
        this.breadcrumb.pop();
        this.breadcrumb.push(this.currentTabBreadcrumb);
      }, 1000));
    } else {
      this.tabIndex = this.tabIds.indexOf(item[this.currentEntityKey]) + 1
    }

  }


  protected panelClose(): void {
    this.isEditEnable=false;
    this.accordion.close('right');
    this.panelOpen = false;
  }

  protected onColumnSelectChange(): void {
    const uncheckedColumns = this.entityCols.filter(
      (col: any) => !this.selectedOptions.includes(col)
    );
    const checkedColumns = this.entityCols.filter(
      (col: any) => this.selectedOptions.includes(col)
    );

    console.log('Unchecked Columns:', uncheckedColumns);
    uncheckedColumns.forEach((col: any) => {
      col.visible = false
    })
    checkedColumns.forEach((col: any) => {
      col.visible = true
    })
    }
  
  protected filterSubmit(): void {
    this.panelClose();
    let entityFilterAttributeHolders = [];
    let arr = [];
    for (var k in this.filterForm.value) arr.push({ controlName: k, value: this.filterForm.value[k] });
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      if (element.value != null && element.value != undefined) {
        let item = this.getAttributeDetails(element.controlName);
        if (item.filterType == "SINGLE") {
          item.values.push(element.value.value);
          entityFilterAttributeHolders.push(item);
        }
        else if (item.filterType == "MULTISELECT") {
          for (let i = 0; i < element.value.length; i++) {
            item.values.push(element.value[i].value);
          }
          entityFilterAttributeHolders.push(item);
        }
        else if (item.filterType == "RANGE") {
          item.values.push(element.value[0].toString());
          item.values.push(element.value[1].toString());
          entityFilterAttributeHolders.push(item);
        }
        else if (item.filterType == "CALENDAR") {
          //let date = new Date(element.value.year, element.value.month, element.value.day);
          //let d = (date.getFullYear() + '-' + date.getMonth().toString().padStart(2, "0") + '-' + date.getDate().toString().padStart(2, "0")) || "";
          item.values.push(element.value);
          entityFilterAttributeHolders.push(item);
        }
        else if (item.filterType == "RADIOBUTTON") {
          item.values.push(element.value);
          item.filterType = "SINGLE";
          entityFilterAttributeHolders.push(item);
        }
      }
    }
    this.setIsEditFlag()
    //this.getEntityByFilter(this.uuid,this.type,[])
    this.getEntityByType(this.uuid, this.type, this.pagination.offset, this.pagination.rows, this.sortField, this.sortOrderBy, entityFilterAttributeHolders);
  }

  protected clearFilter(): void {
    let filters = [];
    if(this.attributes){
      for (let index = 0; index < this.attributes.length; index++) {
        const element = this.attributes[index];
        if (element.filterFlag == "Y") {
          if (element.filterType == "SINGLE") {
            let unique = [];
            for (let i = 0; i < element.unique.length; i++) {
              const item = element.unique[i];
              unique.push(item);
            }
            element.unique = unique;
            this.filterForm.get(element.name)?.setValue(null);
          }
          if (element.filterType == "MULTISELECT") {
            let unique = [];
            for (let i = 0; i < element.unique.length; i++) {
              const item = element.unique[i];
              unique.push(item);
            }
            element.unique = unique;
            this.filterForm.get(element.name)?.setValue(null);
          }
          if (element.filterType == 'RANGE') {
            element.unique = [{ name: [parseInt(element.min), parseInt(element.max)] }];
            this.filterForm.get(element.name)?.setValue([parseInt(element.min), parseInt(element.max)]);
          }
          if (element.filterType == "CALENDAR") {
            this.filterForm.get(element.name)?.setValue(null);
          }
          if (element.filterType == "RADIOBUTTON") {
            let unique = [];
            for (let i = 0; i < element.unique.length; i++) {
              const item = element.unique[i];
              unique.push(item);
            }
            element.unique = unique;
            this.filterForm.get(element.name)?.setValue(null);
          }
          filters.push(element);
        }
      }
    }
  
    this.columns = filters;
    this.filterSubmit();
    this.panelClose();
  }

  protected paginate(event:any):void {
    this.spinner.show("entity-detail");
    this.pagination.offset = event['first']
    this.getEntityByType(this.uuid, this.type, this.pagination.offset, this.pagination.rows, this.sortField, this.sortOrderBy, []);
  }

  protected customSort(event: LazyLoadEvent):void {
    if (typeof event != 'undefined' && typeof event['sortField'] != 'undefined') {
      this.sortField = event['sortField']
      this.sortOrderBy = event.sortOrder == 1 ? 'ASC' : 'DESC';
      this.getEntityByType(this.uuid, this.type, this.pagination.offset, this.pagination.rows, this.sortField, this.sortOrderBy, []);
    }
  }

  public getEntityByType(uuid: any, type: any, offset: number, limit: number, sortBy: string, sortOrderBy: string, entityFilterAttributeHolders: any):void {
    this.spinner.show("entity-detail")
    this.entitys = []; 
    this.entityCols = []
    this.listFetched = false;
    const observableTemp = this.entityService.getEntityByType(uuid, type, offset, limit, sortBy, sortOrderBy, entityFilterAttributeHolders).subscribe({
      next: (response) => {
        this.entitys = response.data;
        this.tempEntitys = this.entitys;
        this._selectedColumns = response.data;
        //this.pTableHeight = this.getPTableHeight();
        this.pagination.totalRecords = response.meta.count;
        this.listFetched = true
        this.spinner.hide("entity-detail");
        if (response != null && response.data.length > 0) {
          this.prepareColumns(Object.keys(this.entitys[0]));
        }
        this.entityCols = this.cols;
        this.selectedOptions = this.entityCols
      },
      error: (err: any) => {
        this.listFetched = true
        this.spinner.hide("entity-detail");
        this.listError = true;
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    });
    this.addSubscribe(observableTemp);
  }

                            /*---------Private Method----------*/

  private getEntityByFilter(uuid: any, type: any, entityFilterAttributeHolders: any):void {
    this.spinner.show("filter-data");
    this.isFilterConfigerd = false;
    this.filterForm = new FormGroup({});
    const observableTemp = this.entityService.getEntityByFilter(uuid, type, entityFilterAttributeHolders).subscribe({
      next: (response) => {
        this.spinner.hide("filter-data")
        let filters = [];
        if (response != null && response.length > 0) {
          this.isFilterConfigerd = false;
          this.isButtonEnable = false;
        }
        else {
          this.isFilterConfigerd = true;
          this.isButtonEnable = true;
        }
        for (let index = 0; index < response.length; index++) {
          const element = response[index];
          element.entityType = this.type;
          this.attributes = response;
          if (this.currentEntity && response[index].attributeId.toString() == this.currentEntity.attrId.toString()) {
            this.currentEntityKey = response[index].name;
          }
          if (element.filterFlag == "Y") {
            if (element.filterType == "SINGLE") {
              let unique = [];
              for (let i = 0; i < element.unique.length; i++) {
                const item = element.unique[i];
                unique.push({ value: item });
              }
              element.unique = unique;
              this.filterForm.addControl(element.name, new FormControl());
            }
            if (element.filterType == "MULTISELECT") {
              let unique = [];
              for (let i = 0; i < element.unique.length; i++) {
                const item = element.unique[i];
                unique.push({ value: item });
              }
              element.unique = unique;
              this.filterForm.addControl(element.name, new FormControl());
            }
            if (element.filterType == 'RANGE') {
              element.unique = [{ name: [parseInt(element.min), parseInt(element.max)] }];
              this.filterForm.addControl(element.name, new FormControl([parseInt(element.min), parseInt(element.max)]));
            }
            if (element.filterType == "CALENDAR") {
              this.filterForm.addControl(element.name, new FormControl());
            }
            if (element.filterType == "RADIOBUTTON") {
              let unique = [];
              for (let i = 0; i < element.unique.length; i++) {
                const item = element.unique[i];
                unique.push({ name: item });
              }
              element.unique = unique;
              this.filterForm.addControl(element.name, new FormControl());
            }
            filters.push(element);
          }
        }
        this.columns = filters;
        console.log('this.columns',this.columns)

      },
      error: (err: any) => {
        this.spinner.hide("entity-detail");
        this.listError = true;
        this.spinner.hide("filter-data")
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }

    });
    this.addSubscribe(observableTemp);

  }

  private prepareColumns(cols: any):void {
    if (cols != null && cols.length > 0) {
      this.cols = [];
      for (let i = 0; i < cols.length; i++) {
        let colsInfo = { field: "", header: "", visible: true };
        colsInfo.field = cols[i];
        colsInfo.header = cols[i];
        this.cols.push(colsInfo);
      }
    }
  }

  private getAttributeDetails(name: any): any {
    for (let i = 0; i < this.columns.length; i++) {
      const element = this.columns[i];
      if (element.name == name) {
        return ({ attributeName: element.dispName, filterType: element.filterType, attrType: element.type != null && element.type != DataType.VARCHAR ? element.type : "String", values: [] })
      }
    }
  }
  protected panelToggle(): void {
    if (this.panelOpen) {
      this.panelClose();
      // this.isFilterConfigerd=false;

    }
    else {
      this.accordion.open('all', 0);
      this.panelOpen = true;
      // this.isFilterConfigerd=false;
    }

  }

  /*private getPTableHeight() {
    if (this.entitys != null && this.entitys.length === 0) {
      return "90px";
    } else if (this.entitys != null) {
      if (this.entitys.length < 10) {
        return (this.entitys.length * 40) + 84 + "px";
      } else {
        return "550px";
      }
    } else {

      return "550px";
    }
  }*/

  private setIsEditFlag(): void
  {
   let searchCriteriaFormValues = this.filterForm.value
   Object.values(searchCriteriaFormValues).forEach(value =>{
    if(value != null){
      this.isEditEnable = true
    }
   })
  }

  private getPTableHeight() {
    if (this.entitys != null && this.entitys.length == 0) {
      return "103";
    }
    else if (this.listFetched && this.entitys != null && this.entitys.length == 0) {
      return "562";
    }
    else if (this.entitys != null) {
      if (this.entitys.length <= 10) {
        return (this.entitys.length * 51) + 52;
      } else {
        return "562"
      }
    }
    return false
  }

  private getOnyByUuidAndVersion(uuid: any):void {
    const observableTemp = this.commonService.getOnyByUuidAndVersion(MetaType.ENTITY, uuid, null).subscribe({
      next: (response:IEntity) => { 
        this.duuid=response.dependsOn.ref.uuid
        this.currentEntityKey = response.keyAttr.attrName;
      }
    });
    this.addSubscribe(observableTemp);
  }

  private addSubscribe(subscriber: any): void {
    if (subscriber != null && subscriber instanceof Subscriber) {
      this.subscriptions.push(subscriber);
    }
  }

  protected searchTableRows(searchStr: any): void {
    this.entitys = this.helperService.setSearchTerm(this.tempEntitys, searchStr);
    this.onWindowRezie(null);

  }

  protected showTooltip(td,span,field){
    if(span.offsetWidth + 28 > td.clientWidth){
      this.tooltipObj[field] = true
    }
   }

  ngOnDestroy(): void {
    // Method for Unsubscribing Observable
    this.tabs = null;

    // this.subscriptions = null;
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
  
}

