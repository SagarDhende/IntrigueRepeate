import { Component, AfterViewInit, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AppConfigService } from 'src/app/app-config.service';
import { CaseService } from '../case.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Subscriber, Subscription, iif } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { TabView } from 'primeng/tabview';
import { NgxSpinnerService } from 'ngx-spinner';
import { IEntity } from 'src/app/shared/models/API/entity.model';
import { CommonService } from 'src/app/shared/services/common.service';
import { IGraphpod } from 'src/app/shared/models/API/graphpod.model';
import { MetaType } from 'src/app/shared/enums/api/meta-type.enum';
import { GraphpodResultView } from 'src/app/shared/models/API/graphpod-result-view.model';
import { SubjectService } from 'src/app/shared/services/subject.service';
import { ICaseDetail } from 'src/app/shared/models/API/case-details.model';
import { IColStructure } from 'src/app/shared/models/col-structure.model';
import { IAlert } from 'src/app/shared/models/API/alert.model';
import { INote } from 'src/app/shared/models/API/note.model';
import { IDocument } from 'src/app/shared/models/API/document.model';
import { INotification } from 'src/app/shared/models/API/notification.model';
import { ISankey } from 'src/app/shared/models/API/sankey.model';
import { WorkflowForm } from 'src/app/shared/models/API/workflow-form.model';
import { HelperService } from 'src/app/shared/services/helper.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { UrlService } from 'src/app/shared/services/url.service';
import { AppConfig, LayoutService } from 'src/app/layout/service/app.layout.service';
import { Session } from 'src/app/login/auth.model';
import { Location } from '@angular/common'

enum TabName{
  SUMMARY="Summary",
  ENTITYDETAILS="Entity Details",
  ALERTS="Alerts",
  CREATECASE="Create New Case",
  RULEDETAILS="Rule Details",
  CRITERIADETAILS="Criteria Details",
  LINKANALYSIS="Link Analysis",
  FLOWOFFUNDS="Flow of Funds",
  NOTES="Notes",
  DOCUMENTS="Documents",
  WORKFLOW="Workflow",
  AUDIT="Audit",
  NOTIFICSTIONS="Notifications",
  VIEW="View",
  PREVIEW="Preview"
}

@Component({
  selector: 'app-case-details',
  standalone: false,
  templateUrl: './case-details.component.html',
  styleUrl: './case-details.component.scss'
})


export class CaseDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('fileSelect') public fileSelect: any;
  @ViewChild(TabView) public tabView: TabView;
  @Input() public details: any;

  protected items: MenuItem[] | undefined;
  protected activeItem: any;

  protected flowOfFundsFetched: boolean = false;
  protected isFlowOfFundsError: boolean = false;
  protected isFlowOfFundsComplete: boolean = false;
  protected isFlowOfFundsInProgress: boolean = false;
  protected isFlowOfFundsNoRecords:boolean = false
  protected isFlowFundsTabVisible: boolean = false;

  protected isLinkAnalysisError: boolean = false;
  protected isGraphpodMeta: boolean = false
  protected isLinkAnalysisComplete: boolean;
  protected isLinkAnalysisInProgress: boolean;
  protected isLinkAnalysisNoRecords:boolean = false

  protected isCaseSummaryInprogess:boolean = false;
  protected isCaseSummaryNoRecords:boolean = false;
  protected isCaseSummaryComplete:boolean = false;
  protected isCaseSummaryError:boolean = false;

  protected isEntityInprogess:boolean = false;
  protected isEntityNoRecords:boolean = false;
  protected isEntityComplete:boolean = false;
  protected isEntityError:boolean = false;

  protected isAlertInProgess:boolean = false;
  protected isAlertNoRecords:boolean = false;
  protected isAlertComplete:boolean = false;
  protected isAlertError:boolean = false;

  protected isNotificationsInProgess:boolean = false;
  protected isNotificationsNoRecords:boolean = false;
  protected isNotificationsComplete:boolean = false;
  protected isNotificationsError:boolean = false;

  protected isDocumentsInProgress:boolean = false;
  protected isDocumentsNoRecords:boolean = false;
  protected isDocumentsComplete:boolean = false;
  protected isDocumentsError:boolean = false;

  protected isAuditInProgress:boolean = false;
  protected isAuditNoRecords:boolean = false;
  protected isAuditComplete:boolean = false;
  protected isAuditError:boolean = false;

  protected isWorkflowEmpty: boolean = false;
  protected isWorkflowError: boolean = false;
  protected isWorkflowComplete: boolean = false;
  protected isWorkflowInProgress: boolean = false;

  protected isNotesError: boolean = false
  protected isNotesCompleted: boolean = false;
  protected isNotesInProgress: boolean = false;
  
  protected entity_type: any;
  protected Case = "Case";
  protected entity_id: any;
  protected id: string;
  protected caseDetails: ICaseDetail = {} as ICaseDetail;
  protected entityDetails: IEntity = null;
  protected caseSummaryLeft: string[];
  protected caseSummaryRight: string[];
  protected caseDetailsFetched: boolean = false;
  protected entityDetailsFetched: boolean = false;
  protected alertDetailsFetched: boolean = false;
  protected documentDetailsFetched: boolean = false;
  protected linkAnalysisFetched: boolean = false;
  protected historyFetched: boolean = false;
  protected notesFetched: boolean = false;
  protected notificationsFetched: boolean = false;
  protected entityDetailsLeft: string[] = [];
  protected entityDetailsRight: string[] = [];
  protected dispositionCodeDropdown: boolean = false;
  protected dispositionCodeDropdownValues = [{ name: 'No Suspicious Activity Found' }, { name: 'Suspicious Activity Found' }];
  protected dispositionCodeDropdownSelected: any;
  protected priorityDropdown: boolean = false;
  protected severityDropdown: boolean = false;
  protected statusDropdown: boolean = false;
  protected statusDropdownValues: any;
  protected alertDetailsCols: IColStructure[];
  protected alertDetails: IAlert[] = null;
  protected tabIndex: number;
  protected notes: INote[] = null;
  protected newNote: string;
  protected documentDetailsCols: IColStructure[];
  protected documentDetails: IDocument[] = null;
  protected historyCols: IColStructure[];
  protected history: any = null;
  protected notificationCols: IColStructure[];
  protected notifications: INotification[] = null;
  protected uploadModal: boolean;
  protected selectedFile: any;
  protected selectedDocuments: any = [];
  protected workflowFetched: boolean = false;
  protected actionFetched: boolean = false;
  protected actionValues: any;
  protected flowOfFunds: any;
  protected sankey: ISankey = null;
  protected sankeyRange: number[];
  protected summaryError: boolean = false;
  protected entityError: boolean = false;
  protected flowOfFundsError: boolean = false;
  protected notesError: boolean = false;
  protected documentsError: boolean = false;
  protected workflowError: boolean = false;
  protected historyError: boolean = false;
  protected notificationsError: boolean = false;
  protected messageHead: string = '';
  protected errorTitle: string = '';
  protected errorContent: string = '';
  protected isShowGraphAnalysis: boolean;
  protected linkAnalysisError: boolean;
  protected graphpodMeta: IGraphpod;
  protected linkAnalysisResult: GraphpodResultView = null;
  protected themeConfig: AppConfig;
  protected notificationErrorContent: any;
  protected isMaximized: boolean = false;
  protected isAppendMode: boolean = false;
  protected workFlowActionDialog: boolean = false;
  protected isDisabledActionBtn: boolean = true;
  protected workflowForm: WorkflowForm;
  protected workflow: any = null;
  protected graphReload: boolean = false;
  protected dynamicHeight: string;
  protected pTableHeight: boolean = false;
  protected user: any;
  protected errorMessage: boolean = false;
  protected actionButtonLoading:boolean=false;
  protected isDocumentsUploadError:boolean=false;
  protected tooltipObj={}
  protected actionForm: FormGroup
  protected isDocumentsDeleteError:boolean=false;
  private subscriptions: Subscription[] = [];  //Array for unsubscribing observables
  private caseName: string;
  private priorityDropdownSelected: any;
  private severityDropdownSelected: any;
  private statusDropdownSelected: any;
  private caseObj: any;
  private entityUuid: string = null;
  paramDialogList: any;


  constructor(
    private route: ActivatedRoute, private urlService: UrlService,
    private caseService: CaseService, private appConfigService: AppConfigService,
    private messageService: MessageService, private router: Router,
    private spinner: NgxSpinnerService, private location: Location,
    private commonService: CommonService,
    private subjectService: SubjectService,
    private helperService: HelperService, private sessionService: SessionService, private layoutService: LayoutService,
    private confirmationService:ConfirmationService
  ) {

    this.dynamicHeight = this.calculateDynamicHeight();
    this.sankeyRange = [0, 100000];
    const observableTemp = this.subjectService.themeBehaviour.asObservable().subscribe({
      next: (response: AppConfig) => {
        this.themeConfig = null;
        this.themeConfig = response;
        if (this.tabIndex == 6) {
          this.actionFetched = false;
          this.actionValues = [];
          this.workflowFetched = false;
          this.getWorkflow();
        }
      }
    });
    this.addSubscribe(observableTemp);


  }

  /* to increase the height of table conditionaly */
  protected calculateDynamicHeight() :string {
    if (this.notes != null && this.notes.length == 0 && this.pTableHeight) {
      return "90px";
    }
    else if (!this.pTableHeight && this.notes != null && this.notes.length == 0) {
      return "450px";
    }
    else if (this.notes != null) {
      if (this.notes.length < 10) {
        return (this.notes.length * 40) + 50 + "px";
      } else {
        return "500px";
      }
    }
    return "450px";
  }



  ngAfterViewInit(): void {
    // this.currentTabBreadcrumb = { title: this.tabView.tabs[this.tabIndex].header, url: false };
    // this.breadcrumb.push(this.currentTabBreadcrumb);
  }

  ngOnInit(): void {
    this.actionForm = new FormGroup({
      assignTo : new FormControl(),
      dispositionCode: new FormControl()
    })
    this.setActionMenuForMap();
    this.messageHead = 'Operation Failed';
    const sessionDetail: Session = this.sessionService.getData();
    if (sessionDetail) {
      this.getUserByUuid(sessionDetail.userUuid);
    }
    // when calling from component selector
    if (this.details) {
      this.id = this.details.case_id;
      this.caseName = this.details.rule_name;
      this.entity_type = this.caseDetails.entity_type
      this.entity_id = this.caseDetails.entity_id;
      this.viewCase(this.id, "VIEW");
      this.getCaseByCaseExec(this.details.rule_exec_uuid, MetaType.CASERULEExec);

    }
    if (!this.details) {
      this.route.queryParams.subscribe({
        next: (params: any) => {
          this.id = params.case_id;
          this.caseName = params.rule_name;
          this.viewCase(this.id, "VIEW");
          this.getCaseDetails(this.id);

        }
      });
    }
    if (!this.caseDetailsFetched) {
      this.getCaseDetails(this.id);
    }

    this.alertDetailsCols = [
      { field: 'alert_id', header: 'Alert Id', headAlign: 'center', contentAlign: 'center' },
      { field: 'rule_exec_time', header: 'Alert Date', headAlign: 'center', contentAlign: 'center' },
      { field: 'rule_name', header: 'Alert Name', headAlign: 'center', contentAlign: 'center' },
      { field: 'score', header: 'Score', headAlign: 'center', contentAlign: 'center' },
      { field: 'severity', header: 'Severity', headAlign: 'center', contentAlign: 'center' },
    ];
    this.documentDetailsCols = [
      { field: 'file_name', header: 'Name', headAlign: 'center', contentAlign: 'center' },
      { field: 'file_format', header: 'Format', headAlign: 'center', contentAlign: 'center' },
      { field: 'file_size_mb', header: 'Size MB', headAlign: 'center', contentAlign: 'center' },
      { field: 'createdOn', header: 'Created On', headAlign: 'center', contentAlign: 'center' },
      { field: 'createdBy', header: 'Created By', headAlign: 'center', contentAlign: 'center' },
      { field: 'action', header: 'Action', headAlign: 'center', contentAlign: 'center' },
    ];
    this.historyCols = [
      { field: 'action', header: 'Action', headAlign: 'center', contentAlign: 'center' },
      { field: 'priority', header: 'Priority', headAlign: 'center', contentAlign: 'center' },
      { field: 'status', header: 'Status', headAlign: 'center', contentAlign: 'center' },
      { field: 'disposition_code', header: 'Disposition Code', headAlign: 'center', contentAlign: 'center' },
      { field: 'owner', header: 'Owner', headAlign: 'center', contentAlign: 'center' },
      { field: 'user_group', header: 'Group', headAlign: 'center', contentAlign: 'center' },
      { field: 'stage', header: 'Stage', headAlign: 'center', contentAlign: 'center' },
      { field: 'updated_by', header: 'Updated By', headAlign: 'center', contentAlign: 'center' },
      { field: 'updated_on', header: 'Updated On', headAlign: 'center', contentAlign: 'center' },
    ];
    this.notificationCols = [
      { field: 'to', header: 'Sent To', headAlign: 'center', contentAlign: 'center' },
      { field: 'subject', header: 'Subject', headAlign: 'center', contentAlign: 'center' },
      { field: 'sendAttachment', header: 'Attachment', headAlign: 'center', contentAlign: 'center' },
      { field: 'createdOn', header: 'Sent On', headAlign: 'center', contentAlign: 'center' },
      { field: 'status.stage', header: 'Status', headAlign: 'center', contentAlign: 'center' },
      { field: 'action', header: 'Action', headAlign: 'center', contentAlign: 'center' },
    ];
    this.tabIndex = 0;
    this.uploadModal = false;

  }


  protected convertName(name): string {
    return name.toLowerCase().split('_').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
  }

  protected getSeveritryCaption(severity: string): string {
    return this.appConfigService.getSeveritryCaption(severity);
  }

  protected getSeverityBGColor(severity: string): string {
    return this.appConfigService.getSeverityBGColor(severity)
  }
  // Summary
  protected caseSummarySubmit(): void {
    let req = {
      case_id: this.id,
      type: this.caseDetails.case_type,
      status: this.statusDropdownSelected.name,
      severity: this.severityDropdownSelected.name,
      priority: this.priorityDropdownSelected.name || "",
      desposition_code: this.dispositionCodeDropdownSelected.name
    }
    this.spinner.show("loading");
    const observableTemp = this.caseService.updateCaseSummary(req).subscribe({
      next: (response: any) => {
        this.spinner.hide("loading");
        this.priorityDropdown = false;
        if (response == true) {

          this.caseDetailsFetched = false;
          this.historyFetched = false;
          this.getCaseDetails(this.id);
          this.getHistory();
        } else {

        }
      }, error: (err: any) => {
        this.spinner.hide("loading");

      }
    });
    this.addSubscribe(observableTemp);
  }

  protected caseSummaryReset(): void {
    this.dispositionCodeDropdownSelected = { name: this.caseDetails.disposition_code };
    this.priorityDropdownSelected = { name: this.caseDetails.priority };
    this.severityDropdownSelected = { name: this.caseDetails.severity };
    this.statusDropdownSelected = { name: this.caseDetails.status };
    this.dispositionCodeDropdown = false;
    this.priorityDropdown = false;
    this.severityDropdown = false;
    this.statusDropdown = false;
  }

  protected closeSpecific(check: any): void {
    if (check == 'dispositionCodeDropdown') {
      this.dispositionCodeDropdownSelected = { name: this.caseDetails.disposition_code };
      this.dispositionCodeDropdown = false;
    }
    if (check == 'priorityDropdown') {
      this.priorityDropdownSelected = { name: this.caseDetails.priority };
      this.priorityDropdown = false;
    }
    if (check == 'severityDropdown') {
      this.severityDropdownSelected = { name: this.caseDetails.severity };
      this.severityDropdown = false;
    }
    if (check == 'statusDropdown') {
      this.statusDropdownSelected = { name: this.caseDetails.status };
      this.statusDropdown = false;
    }
  }

  protected openEntity(item: any): void {
    const observableTemp = this.commonService.getEntity().subscribe({
      next: (response) => {
        response.forEach(element => {
          if (element.name == this.caseDetails.entity_type) {
            let navigationExtras: NavigationExtras = {
              queryParams: {
                "type": this.caseDetails.entity_type,
                "uuid": element.uuid,
                "id": this.caseDetails[item],
                "duuid": element.dependsOn.ref.uuid
              }
            }
            this.router.navigate(["/entities/entity-details"], navigationExtras);
          }
        });
      }
    });
  }


  // Flow of funds
  protected sankeyRangeChange(): any {
    this.flowOfFundsFetched = false;
    this.getFlowOfFunds();
  }


  protected showTooltip(td,span,field){
    if(span.offsetWidth + 28 > td.clientWidth){
      this.tooltipObj[field] = true
    }
   }

  // Notes
  protected noteSubmit(): void {
    if (this.newNote && this.newNote != '' && this.newNote != null) {
      this.spinner.show("notes");
      this.isNotesCompleted = false
      this.isNotesInProgress = true;
      const observableTemp=this.caseService.postNote(this.id, this.newNote).subscribe({
        next: (response: any) => {
          if (response == true) {
            this.noteClear();
            this.notesFetched = false;
            this.getNotes();
          } 
        }, error: (err: any) => {
          this.spinner.hide("notes");
          this.isNotesError = true;
          this.isNotesInProgress = false;
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  protected noteUpdate(item: any): void {
    if (item.updateText && item.updateText != item.noteText && item.updateText != '' && item.updateText != null) {
      const observableTemp = this.caseService.putNote(this.id, { noteText: item.updateText, noteId: item.noteId }).subscribe({
        next: (response: any) => {
          this.spinner.show("notes");
          if (response == true) {

            item.update = false;
            this.notesFetched = false;
            this.getNotes();
          } else {


          }
        }, error: (err: any) => {
          this.spinner.hide("notes");


        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  protected noteDelete(item: any):void {
    this.spinner.show("notes");
    const observableTemp = this.caseService.deleteNote(this.id, item.noteId).subscribe({
      next: (response: any) => {
        this.spinner.hide("notes");
        if (response == true) {

          this.notesFetched = false;
          this.getNotes();
        } else {


        }
      }, error: (err: any) => {
        this.spinner.hide("notes");


      }
    });
    this.addSubscribe(observableTemp);
  }

   // Others
   protected handleError(err: any):void {
    if (err) {
      console.warn('Ups, error: ', err);
    }
  }

  protected documentDelete(item: any): void {
    this.isDocumentsDeleteError = false;
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete?',
      accept: () => {
        this.spinner.show("documents");
        const observableTemp = this.caseService.deleteDocument(this.id, item.attachmentId).subscribe({
          next: (response: any) => {
            this.spinner.hide("documents");
            if (response == true) {
              this.documentDetailsFetched = false;
              this.isDocumentsDeleteError = false;
              this.getDocumentDetails();
            } else {
            }
          },
          error: (err: any) => {
            this.spinner.hide("documents");
            this.isDocumentsDeleteError = true;
            this.isDocumentsInProgress = false
            this.errorTitle = 'Operation Failed';
            this.errorContent = err.error;
            this.messageHead = 'Operation Failed';
          }
        });
        this.addSubscribe(observableTemp);
      },
      reject: () => {
      }
    });
  }

  protected fileSelectClick(): void {
    this.fileSelect.nativeElement.click();
  }

  protected onFileChange(event: any): void {
    for (var i = 0; i < event.target.files.length; i++) {
      this.selectedDocuments.push(event.target.files[i]);
    }
  }

  protected uploadDocuments(): void {
    this.actionButtonLoading=true;
    this.isDocumentsUploadError = false;
    if (this.selectedDocuments.length > 0) {
      let formData = new FormData();
      for (var i = 0; i < this.selectedDocuments.length; i++) {
        formData.append("file", this.selectedDocuments[i]);
        this.spinner.show("documents");
        const observableTemp = this.caseService.postDocument(this.id, formData).subscribe({
          next: (response: any) => {
            this.spinner.hide("documents");
            if (response == true) {

              this.documentDetailsFetched = false;
              this.actionButtonLoading=false;
              this.isDocumentsUploadError = false;
              this.selectedDocuments = [];
              this.uploadModal = false;
              this.getDocumentDetails();
            } else {

            }
          }, error: (err: any) => {
            this.spinner.hide("documents");
            this.actionButtonLoading = false;
            this.isDocumentsUploadError = true;
            this.isDocumentsInProgress = false;
            this.errorTitle = 'Operation Failed';
            this.errorContent = err.error;
            this.messageHead = 'Operation Failed';

          }
        })
        this.addSubscribe(observableTemp);
      }
    }
  }

  protected popFile(id: any): void {
    this.selectedDocuments.splice(id, 1);
  }
  protected getUserByUuid(uuid: any):void {
    const observableTemp = this.commonService.getOnyByUuidAndVersion(MetaType.USER, uuid, null).subscribe({
      next: (response: any) => {
        this.user = response;
      }, error: (response: any) => {

      }
    });
    this.addSubscribe(observableTemp);
  }

  protected getAction(): void {
    if (!this.actionFetched) {
      this.actionFetched = true;
      this.spinner.show("action");
      const observableTemp = this.caseService.getActions(this.caseDetails.case_id).subscribe({
        next: (response: any) => {
          this.spinner.hide("action");
          this.actionValues = response;
        }, error: (err: any) => {
          this.spinner.hide("action");

        }
      });
      this.addSubscribe(observableTemp);
    }
  }
  protected renderForm(data: WorkflowForm):void {
    this.workflowForm = data;
    if (this.workflowForm.type == "rendered-form") {
      let temp = data.fromData
      let div = document.getElementById('form_render_div');
      div.innerHTML = temp;
      setTimeout(function () {
        let helpBlock = document.getElementsByClassName('help-block');
        if (helpBlock != null && helpBlock.length) {
          for (let i = 0; i < helpBlock.length; i++) {
            helpBlock[i].remove();
          }
          document.getElementsByClassName('help-block')[0].remove();
        }
      }, 100)
    }
    else {
      if (this.workflowForm.formMeta.components[0].hasOwnProperty("valuesKey")) {
        this.workflowForm.formVariables[this.workflowForm.formMeta.components[0].valuesKey].value = JSON.parse(this.workflowForm.formVariables[this.workflowForm.formMeta.components[0].valuesKey].value);
      } else {
        this.workflowForm.formMeta.components[0].valuesKey = this.workflowForm.formMeta.components[0].key;
        this.workflowForm.formVariables[this.workflowForm.formMeta.components[0].valuesKey] = {};
        this.workflowForm.formVariables[this.workflowForm.formMeta.components[0].valuesKey].value = this.workflowForm.formMeta.components[0].values
      }
      if (this.workflowForm.formMeta.components.length > 1) {

      }
    }
  }

  protected WFActionSubmit():void {
    let isValidationApplied =  this.setValidationToActionForm()
    if(!isValidationApplied){ 
    let data = null;
    if (this.workflowForm.type == "rendered-form") {
      let elements = document.forms['generatedForm'].elements;
      if (elements != null && elements.length > 0) {
        data = {};
        data.variables = {};
        for (let i = 0; i < elements.length; i++) {
          data.variables[elements[i].name] = {};
          data.variables[elements[i].name].value = elements[i].value;
          data.variables[elements[i].name].type = "String";
          data.variables[elements[i].name].valueInfo = {};
        }
      }
    } else {
      data = {};
      data.variables = {};
      let label = this.workflowForm.formMeta.components[0].key;
      data.variables[label] = {};
      data.variables[label].value = this.actionForm.get('assignTo').value;;
      data.variables[label].type = "String";
      data.variables[label].valueInfo = {};
      if (this.workflowForm.formMeta.components.length > 1) {
        let label = this.workflowForm.formMeta.components[1].key;
        data.variables[label] = {};
        data.variables[label].value = this.actionForm.get('dispositionCode').value;;
        data.variables[label].type = "String";
        data.variables[label].valueInfo = {};

      }
    }
    this.workFlowActionDialog = false;
    this.workflowFetched = false;
    const observableTemp = this.commonService.submitFormByBusinessKey(this.caseDetails.case_id, data).subscribe({
      next: (response: any) => {
        setTimeout(() => {
          this.getCaseDetails(this.id);
        }, 5000);
        this.getWorkflow();
      },
      error: (respose: any) => {
      }
    });
    this.addSubscribe(observableTemp);
  }
  }

  private setValidationToActionForm(): boolean{
    let isValidationApplied = false
    if(this.workflowForm.formMeta){
     if(this.workflowForm.formMeta.components[0]?.type == 'select' && this.actionForm.value.assignTo == null){
       isValidationApplied = true
       this.actionForm.get('assignTo').markAsTouched()
       this.actionForm.get('assignTo').setErrors({ required: true })
     }
     if(this.workflowForm.formMeta.components[1]?.type == 'select' && this.actionForm.value.dispositionCode == null){
       isValidationApplied = true
       this.actionForm.get('dispositionCode').markAsTouched()
       this.actionForm.get('dispositionCode').setErrors({ required: true })
     }
    }
    return isValidationApplied
   }

  protected postAction(): void {
    this.actionForm.reset()
    this.spinner.show("loading");
    this.workFlowActionDialog = true;
    const observableTemp = this.commonService.getFormByBusinessKey(this.caseDetails.case_id).subscribe({
      next: (response: any) => {

        setTimeout(() => {
          this.renderForm(response);

        }, 500);
      },
      error: (respose: any) => {
      }
    });
    this.addSubscribe(observableTemp);
  }
    //  Notification
    protected notificationAttachmentDownload(rowData: any):void {
      const observableTemp = this.caseService.notificationAttachmentDownload
        (this.id, this.caseDetails.rule_exec_uuid, this.caseDetails.rule_exec_version.toString()).subscribe({
          next: (response: any) => {
            const a = document.createElement('a');
            const objectUrl = URL.createObjectURL(response);
            a.href = objectUrl
            a.download = "download.pdf";
            a.click();
            URL.revokeObjectURL(objectUrl);
          },
          error: (response: any) => {
            let errorContent = response != null && response.message != null ? response.message : response;
          }
        });
      this.addSubscribe(observableTemp);
    }
  
    protected getNofiticationBgColor(status: string): any {
      return this.appConfigService.getNotificationBgColor(status)
    }
    protected resendNotification(item: any): void {
      this.caseService.resendNotification(item.uuid, this.id).subscribe({
        next: (response: any) => {
          if (response == true) {
  
            this.getNotifications();
          }
          else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Resend Failed" });
          }
        }
      })
    }

  protected downloadDocument(item: any): void {
    this.spinner.show("documents");
    const observableTemp = this.caseService.downloadDocument(item.attachmentId).subscribe({
      next: (response: any) => {
        this.spinner.hide("documents");
        const a = document.createElement('a')
        const objectUrl = URL.createObjectURL(response)
        a.href = objectUrl
        a.download = item.file_name;
        a.click();
        URL.revokeObjectURL(objectUrl);
      }, error: (err: any) => {
        this.spinner.hide("documents");
        // /*comment out toaster messages*/ this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Some Error Occured' });
      }
    });
    this.addSubscribe(observableTemp);
  }
  protected getNofiticationStatusCaption(status: string): any {
    return this.appConfigService.getNotificationCaption(status);
  }


  protected tabChange():void{
    let headerName=this.tabView.tabs[this.tabIndex].header;
    if(headerName){
      switch (headerName) {
        case TabName.SUMMARY:
          this.getCaseDetails(this.id);
          break
        case TabName.ENTITYDETAILS:
          this.getEntityDetails();
          break;
        case TabName.ALERTS:
          this.getAlertDetails();
          break;  
        case TabName.LINKANALYSIS:
          this.getEntityByCaseExec(this.caseDetails.rule_exec_uuid, MetaType.CASERULEExec);
          break;
        case TabName.FLOWOFFUNDS:
          this.getFlowOfFunds();
          break;
        case TabName.NOTES:
          this.getNotes();
          break;
        case TabName.DOCUMENTS:
          this.getDocumentDetails();
          break;
        case TabName.WORKFLOW:
          this.getWorkflow();
          break;
          case TabName.AUDIT:
          this.getHistory();
          break;
        case TabName.NOTIFICSTIONS:
          this.getNotifications();
          break;  
      }
    }
 }

  protected refreshDetails():void{
    let headerName=this.tabView.tabs[this.tabIndex].header;
    if(headerName){
      switch (headerName) {
        case TabName.SUMMARY:
          this.getCaseDetails(this.id);
          break
        case TabName.ENTITYDETAILS:
          this.entityDetailsFetched = false;
          break;
        case TabName.ALERTS:
          this.alertDetailsFetched = false;
          break; 
        case TabName.LINKANALYSIS:
          this.linkAnalysisFetched = false;
          break;
        case TabName.FLOWOFFUNDS:
          this.flowOfFundsFetched = false;
          break;
        case TabName.NOTES:
          this.notesFetched = false;
          break;
        case TabName.DOCUMENTS:
          this.documentDetailsFetched = false;
          break;
        case TabName.WORKFLOW:
          this.workflowFetched = false;
          break;
          case TabName.AUDIT:
          this.historyFetched = false;
          break;
        case TabName.NOTIFICSTIONS:
          this.notificationsFetched = false;
          break;  
      }
    }
    this.tabChange()
 }

  protected openAlert(item: any):void {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "alert_id": item.alert_id,
        "entity_type": item.entity_type,
        "entity_id": item.entity_id,
        "rule_exec_uuid": item.rule_exec_uuid,
        "rule_exec_version": item.rule_exec_version,
        "rule_name": item.rule_name,
        "rule_exec_time": item.rule_exec_time,
        "business_date": item.business_date,
        "score": item.score,
        "severity": item.severity
      }
    }
    this.router.navigate(["/alerts/alert-details"], navigationExtras)
  }

  protected toogleIsMaximized():void {
    this.isMaximized = !this.isMaximized;
    this.layoutService.onMenuToggle()
  }


  // Link Analysis

  protected onNodeDblClick(event: any):void {
    this.graphReload = true;
    let id = event.id;
    let degree = '1'
    if (event.degree)
      degree = event.degree;

    if (this.caseObj != null && this.caseObj.graphAnalysisInfo != null) {
      this.getGraphAnalysis2(this.caseObj.graphAnalysisInfo.ref.uuid, event.nodeType, degree, "", event.type, "", null, id, false);
    } else {
      this.getGraphByEntity(this.entityUuid, id, event.nodeType, degree, MetaType.GRAPHPOD, event.type || "", true, true);
    }
  }


   // Entity Details
   private getEntityDetails(): void {
    if (!this.entityDetailsFetched) {
      this.entityDetailsFetched = true;
      this.entityDetailsLeft = undefined;
      this.entityDetailsRight = undefined;
      this.isEntityComplete = false;
      this.isEntityError = false;
      this.isEntityNoRecords = false;
      this.isEntityInprogess = true
      this.spinner.show("entityDetail");
      const observableTemp = this.caseService.getEntityDetails(this.caseDetails.entity_type, this.caseDetails.entity_id).subscribe({
        next: (response: any) => {
          this.entityDetails = response.data[0];
          this.spinner.hide("entityDetail");
          this.isEntityInprogess = false
          if (this.entityDetails == undefined || response.data == null || response.data == undefined || response.data.length == 0) {
            this.isEntityNoRecords = true;
       
        }
        else{
          this.isEntityComplete = true;
          let names = Object.keys(this.entityDetails);
          let middleIndex = Math.ceil(names.length / 2);
          this.entityDetailsLeft = names.splice(0, middleIndex);
          this.entityDetailsRight = names.splice(-middleIndex);
          this.spinner.hide("entityDetail");
        }
      }
        , error: (err: any) => {
          this.spinner.hide("entityDetail");
          this.isEntityError = true;
          this.isEntityInprogess = false
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  // Alerts Details
  private getAlertDetails(): void {
    if (!this.alertDetailsFetched) {
      this.isAlertComplete = false;
      this.isAlertInProgess = true
      this.isAlertNoRecords = false
      this.isAlertError = false;
      this.alertDetails = [];
      this.spinner.show("alertDetail");
      const observableTemp = this.caseService.getAlertDetails(this.caseDetails.case_id).subscribe({
        next: (response: any) => {
          setTimeout(() => {
          this.isAlertInProgess = false
          this.spinner.hide("alertDetail");
          this.alertDetailsFetched = true;
          if(response.data == null || response == null || response.data == undefined || response.data.length == 0){
            this.isAlertNoRecords = true
          }
            else{
              this.isAlertComplete = true;
              this.alertDetails = response.data;
            }
          }, 500);
        }, error: (err: any) => {
          this.isAlertError = true;
          this.isAlertInProgess = false
          this.spinner.hide("alertDetail");
          this.isAlertInProgess = false
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  private getFlowOfFunds(): void {
    if (!this.flowOfFundsFetched) {
      this.isFlowOfFundsComplete = false;
      this.isFlowOfFundsInProgress = true;
      this.isFlowOfFundsError = false;
      this.isFlowOfFundsNoRecords = false
      this.spinner.show("flowoffunds");
      let req = {
        caseId: this.id,
        uuid: this.caseDetails.rule_exec_uuid,
        entityId: this.caseDetails.entity_id
      };
      const observableTemp=this.caseService.getFlowOfFunds(req, this.sankeyRange).subscribe({
        next: (response: any) => {
          setTimeout(() => {
            this.spinner.hide("flowoffunds");
            this.isFlowOfFundsInProgress = false;
            if (response.nodes == null && response.edges == null) {
              this.isFlowOfFundsNoRecords = true
            }
            else {
              this.sankey = response;
              this.flowOfFundsFetched = true;
              this.isFlowOfFundsComplete = true;
            }
          }, 500);    
        }, error: (err: any) => {
          this.spinner.hide("flowoffunds");
          this.isFlowOfFundsError = true;
          this.isFlowOfFundsInProgress = false;
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  // Workflow
  
  protected isActionButtonDisable(): boolean {
    return this.isWorkflowEmpty || this.isDisabledActionBtn;
  }
  
  private isWorkFlowActionBtnDisable():void {
    const sessionDetail: Session = this.sessionService.getData();
    if (sessionDetail) {
      let foundItem = [];
      if (this.user != null && this.user.userGroupInfo != null && this.user.userGroupInfo.length > 0) {
        let caseDetailsTemp = this.caseDetails;
        foundItem = this.user.userGroupInfo.filter(function (el: any) {
          return el.ref.name == caseDetailsTemp.user_group;
        });
      }
      if (this.caseDetails && this.caseDetails.owner != null && sessionDetail.userName == this.caseDetails.owner) {
        this.isDisabledActionBtn = false;
      }
      else if (this.caseDetails != null && (this.caseDetails.owner == null || this.caseDetails.owner == "") && foundItem.length > 0) {
        this.isDisabledActionBtn = false;
      }
      else {
        this.isDisabledActionBtn = true;
      }
    }
  }

 

  private getWorkflow(): void {
    if (!this.workflowFetched) {
      this.workflowFetched = true;
      this.workflow = undefined;
      this.isWorkflowEmpty = false;
      this.isWorkflowInProgress = true;
      this.isWorkflowError = false;
      this.isWorkflowComplete = false;
      this.spinner.show("workflow");
      const observableTemp = this.caseService.getWorkflow(this.caseDetails.case_id).subscribe({
        next: (response: any) => {
          this.spinner.hide("workflow");
          this.isWorkflowInProgress = false;
          if (response != null && (response.bpmn20Xml != null || response.taskDefinitionKey != null)){
            this.workflow = response;
            this.isWorkflowComplete = true;
          }
            else{
            this.isWorkflowEmpty = true;
          }
        }, error: (err: any) => {
          this.spinner.hide("workflow");
          this.isWorkflowError = true;
          this.isWorkflowInProgress = false;
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }



  // audit
  private getHistory(): void {
    if (!this.historyFetched) {
      this.isAuditComplete = false;
      this.isAuditInProgress = true
      this.isAuditNoRecords = false;
      this.isAuditError = false;
      this.history = undefined;
      this.spinner.show("history");
      const observableTemp = this.caseService.getHistory(this.caseDetails.case_id).subscribe({
        next: (response: any) => {
          setTimeout(() => {
            this.spinner.hide("history");
            this.isAuditInProgress = false
          if(response.data == null || response == null || response.data == undefined || response.data.length == 0 ){
            this.isAuditNoRecords = true;
          }
          else{
            this.history = response.data;
            this.isAuditComplete = true;
            this.historyFetched = true;
          }
        }, 500);
        }, error: (err: any) => {
          this.spinner.hide("history");
          this.isAuditError = true;
          this.isAuditInProgress = false
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  private getNotifications(): void {
    if (!this.notificationsFetched) {
      this.isNotificationsComplete = false;
      this.isNotificationsInProgess = true;
      this.isNotificationsNoRecords = false;
      this.isNotificationsError = false;
      this.spinner.show("notifications");
       this.caseService.getNotifications(this.id).subscribe({
        next: (response: any) => {
          setTimeout(() => {
            this.spinner.hide("notifications");
            this.isNotificationsInProgess = false;
            if(response.data == null || response == null || response.data == undefined || response.length == 0)
            {
              this.isNotificationsNoRecords = true;
            }
            else{
              this.notifications = response.data;
              this.isNotificationsComplete = true;
              this.notificationsFetched = true;
            }
        }, 500);
          },
        error: (err: any) => {
          this.spinner.hide("notifications");
          this.isNotificationsError = true;
          this.isNotificationsInProgess = false;
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
          this.notificationErrorContent = err != null && err.message != null ? err.message : err;
        }
      })

    }
  }


  private getCaseByCaseExec(uuid: string, type: string):void {
    this.isFlowFundsTabVisible = false;
    const observableTemp = this.caseService.getCaseByCaseExec(uuid, type).subscribe({
      next: (response: any) => {
        this.caseObj = response.data[0];
        if (response != null && response.data != null && response.data[0].query != null) {
          this.isFlowFundsTabVisible = true;
          this.caseObj = response.data[0];
        }
      },
      error: (response) => {
      }
    });
    this.addSubscribe(observableTemp);
  }

  //Open Case
  private viewCase(caseId: string, action: string): void {
    this.spinner.show("loading");
    const observableTemp = this.caseService.postActions(caseId, action).subscribe({
      next: (response: any) => {
        this.spinner.hide("loading");
      }, error: (err: any) => {
        this.spinner.hide("loading");
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getGraphAnalysisByUuid(uuid: any):void {
    const observableTemp = this.commonService.getOnyByUuidAndVersion(MetaType.GRAPHANALYSIS, uuid, "").subscribe({
      next: (response: any) => {
        let graphanalysis = response;
        if (graphanalysis != null && graphanalysis.paramList != null) {
          let uuid = graphanalysis.paramList.ref.uuid;
          this.getParamListParam(uuid);
        } else {
          let body = { parmaListInfo: [], otherParams: null };
          const otherParams = new Map();
          otherParams.set("ENTITY_ID", this.caseDetails.entity_id);
          body.otherParams = Object.fromEntries(otherParams);;
          this.getGraphAnalysis2(this.caseObj.graphAnalysisInfo.ref.uuid, "", "", "", "", "", body, "");
        }
      }, error: (err: any) => { 
        this.isLinkAnalysisError = true;
        this.isLinkAnalysisInProgress = false
        this.spinner.hide("case-graph-analysis");
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getParamListParam(uuid: string) {
    const observableTemp=this.caseService.getParamListParam(uuid).subscribe({
      next: (response: any) => {
        console.warn(response)
        this.paramDialogList = response;
        let body = { paramListInfo: [], otherParams: null };
        this.paramDialogList.forEach(element => {
          let item = {
            paramId: element.paramId,
            ref:element.ref,
            paramType: element.paramType,
            paramValue:{
            value:this.caseDetails.entity_id,
            ref:{
              type:"simple"
            }
          },
          }
          body.paramListInfo.push(item);
        });
        const otherParams = new Map();
        otherParams.set("ENTITY_ID", this.caseDetails.entity_id);
        body.otherParams = Object.fromEntries(otherParams);
        console.log(body);
        this.getGraphAnalysis2(this.caseObj.graphAnalysisInfo.ref.uuid, "", "", "", "", "", body, "", false);

      }
    });
    this.addSubscribe(observableTemp);
  }

  private getEntityByCaseExec(caseExecUuid: string, type: string):void {
    if (!this.linkAnalysisFetched) {
      this.isGraphpodMeta = false
      this.isLinkAnalysisNoRecords = false
      this.isShowGraphAnalysis = false;
      this.isLinkAnalysisInProgress = true
      this.isLinkAnalysisComplete = false
      this.isLinkAnalysisError = false;
      this.spinner.show("case-graph-analysis");
      const observableTemp = this.caseService.getEntityByCaseExec(caseExecUuid, type).subscribe({
        next: (response: IEntity) => {
          this.entityUuid = response.uuid;
          this.linkAnalysisFetched = true;
          this.getGraphpodByEntity(response.uuid, MetaType.GRAPHPOD);
        },
        error: (err) => {
          this.isLinkAnalysisError = true;
          this.isLinkAnalysisInProgress = false
          this.spinner.hide("case-graph-analysis");
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }


  private getGraphpodByEntity(entityUuid: string, type: string):void {
    const observableTemp = this.commonService.getGraphpodByEntity(entityUuid, type).subscribe({
      next: (response: IGraphpod) => {
        if(response!=null){
          this.graphpodMeta = response;
          if (this.caseObj != null && this.caseObj.graphAnalysisInfo != null) {
            this.getGraphAnalysisByUuid(this.caseObj.graphAnalysisInfo.ref.uuid);
          } else {
            this.getGraphByEntity(this.entityUuid, this.caseDetails.entity_id, this.caseDetails.entity_type, "", MetaType.GRAPHPOD, "", false, false);
          }
        }
        else {
          this.spinner.hide("case-graph-analysis");
          this.isShowGraphAnalysis = false;
          this.isLinkAnalysisInProgress = false
          this.linkAnalysisFetched = true;
          this.isGraphpodMeta = true;
       }
      },
      error: (err) => {
        this.isLinkAnalysisError = true;
        this.isLinkAnalysisInProgress = false
        this.spinner.hide("case-graph-analysis");
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed'
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getGraphByEntity(entityUuid: string, entityId: string, entityType: string, degree: string, type: string, edgeType: string, isAppendMode: boolean, isImplicitId: boolean):void {
    this.linkAnalysisResult = null;
    const observableTemp = this.commonService.getGraphByEntity(entityUuid, entityId, entityType, degree, type, edgeType, isImplicitId).subscribe({
      next: (response: GraphpodResultView) => {
        this.spinner.hide("case-graph-analysis");
        this.spinner.hide("case-graph-analysisreload");
        this.graphReload = false;
        this.linkAnalysisResult = response;
        this.isLinkAnalysisInProgress = false;
        if(this.linkAnalysisResult.nodes == null && this.linkAnalysisResult.edges == null){
          this.isLinkAnalysisNoRecords = true;
        }
        else{
          this.isLinkAnalysisComplete = true;
        }
        this.isAppendMode = isAppendMode;
        this.isShowGraphAnalysis = true;
      },
      error: (err) => {
        this.spinner.hide("case-graph-analysis");
        this.isLinkAnalysisError = true;
        this.isLinkAnalysisInProgress = false;
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed'
      }
    });
    this.addSubscribe(observableTemp);
  }
  private setActionMenuForMap():void {
    this.items = [
      {
        label: 'Download',
        icon: 'pi pi-download',
        command: () => {
          this.downloadDocument(this.activeItem);
        }
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
          this.documentDelete(this.activeItem);
        }
      }
    ]
  }

  private getCaseDetails(id: any): void {
    this.spinner.show("caseDetails");
    this.isCaseSummaryError = false;
    this.isCaseSummaryInprogess = true;
    this.isCaseSummaryNoRecords = false;
    this.isCaseSummaryComplete = false;
    const observableTemp = this.caseService.getCaseDetails(id).subscribe({
      next: (response: any) => {
        this.spinner.hide("caseDetails");
        this.caseDetails = response.data[0];
        this.entity_type = this.caseDetails.entity_type;
        this.entity_id = this.caseDetails.entity_id
        if(response.data == null || response == null || response.data == undefined || response.data.length == 0){
          this.isCaseSummaryNoRecords = true;
        }
        this.isWorkFlowActionBtnDisable();
        if (this.caseDetails) {
          this.isCaseSummaryInprogess = false;
          this.isCaseSummaryComplete = true;
          /* assigning value of this.id to property case_id to caseDetails. */
          this.caseDetails.case_id = this.id;
          this.caseDetails.case_name = this.caseName;
          /* variable will be an obeject with a 'name' property set to the value of this.caseDetails. */
          this.dispositionCodeDropdownSelected = { name: this.caseDetails.disposition_code };
          this.priorityDropdownSelected = { name: this.caseDetails.priority };
          this.severityDropdownSelected = { name: this.caseDetails.severity };
          /* nested if condition */
          if (this.caseDetails.status == 'OPEN') {
            this.statusDropdownValues = [{ name: 'CLOSED' }];
          } else {
            this.statusDropdownValues = [{ name: 'OPNE' }];
          }
          this.statusDropdownSelected = { name: this.caseDetails.status };
          /* nested if condition */
          if (response.data.length != 0) {
            this.caseSummaryLeft = ['case_id', 'case_name', 'case_type', 'business_date', 'score', 'disposition_code', 'created_date', 'updated_date'];
            this.caseSummaryRight = ['entity_type', 'entity_id', 'owner', 'user_group', 'status', 'stage', 'severity', 'priority'];
          }
        }
        if (this.caseDetails && !this.entityDetailsFetched) {
          this.getEntityDetails();
        }
      }, error: (err: any) => {
        this.spinner.hide("caseDetails");
        this.isCaseSummaryError = true;
        this.isCaseSummaryInprogess = false;
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getNotes(): void {
    if (!this.notesFetched) {
      this.isNotesCompleted = false
      this.isNotesInProgress = true;
      this.isNotesError = false;
      this.notes = undefined;
      this.spinner.show("notes");
      const observableTemp=this.caseService.getNotes(this.id).subscribe({
        next: (response: any) => {
          setTimeout(() => {
            this.isNotesCompleted = true
            this.isNotesInProgress = false;
            this.spinner.hide("notes");
            this.notes = response;
            this.notesFetched = true;
            for (let index = 0; index < this.notes.length; index++) {
              this.notes[index] = { ...this.notes[index], ...{ updateText: this.notes[index].noteText, update: false } };
            }
          }, 500);
         
        }, error: (err: any) => {
          this.spinner.hide("notes");
          this.isNotesError = true;
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  // Documents
  private getDocumentDetails(): void {
    if (!this.documentDetailsFetched) {
        this.isDocumentsComplete = false
        this.isDocumentsInProgress = true
        this.isDocumentsNoRecords = false;
        this.isDocumentsError = false;
      this.documentDetails = undefined;
      this.spinner.show("documents");
      const observableTemp = this.caseService.getDocumentDetails(this.caseDetails.case_id).subscribe({
        next: (response: any) => {
          setTimeout(() => {
            this.isDocumentsInProgress = false
          this.spinner.hide("documents");
          if(response == null || response.length == 0 || response == undefined){
          this.isDocumentsNoRecords = true;
              }
          else{ 
            this.documentDetails = response;
            this.isDocumentsComplete = true
            this.documentDetailsFetched = true;
          }
        }, 500);
        }, error: (err: any) => {
          this.spinner.hide("documents");
          this.isDocumentsError = true;
          this.isDocumentsInProgress = false
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  private noteClear(): void {
    this.newNote = undefined;
  }


  private getGraphAnalysis2(uuid: string, nodeType: string, degree: string, startDate: string, edge: string, endDate: string, body?: any, nodeId?: string, isAppendMode?: boolean):void {
    const observableTemp = this.commonService.getGraphAnalysis2(uuid, "graphanalysis", nodeType, degree, startDate, edge, endDate, body, nodeId).subscribe({
      next: (response: GraphpodResultView) => {
        this.spinner.hide("case-graph-analysis");
        this.spinner.hide("case-graph-analysisreload");
        this.graphReload = false;
        this.linkAnalysisResult = response;
        this.isLinkAnalysisInProgress = false;
        if(this.linkAnalysisResult.nodes == null && this.linkAnalysisResult.edges == null){
          this.isLinkAnalysisNoRecords = true;
        }
        else{
          this.isLinkAnalysisComplete = true;
        }
        this.isAppendMode = isAppendMode;
        this.isShowGraphAnalysis = true;
      },
      error: (err) => {
        this.spinner.hide("case-graph-analysis");
        this.isLinkAnalysisError = true;
        this.isLinkAnalysisInProgress = false
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed'

      }
    });
    this.addSubscribe(observableTemp);
  }

  private addSubscribe(subscriber: any): void {
    if (subscriber != null && subscriber instanceof Subscriber) {
      this.subscriptions.push(subscriber);
    }
  }

  protected shortenText(text: any): string {
    let short = ''
    if (text != null) {
      if (text.length > 45) {
        short = text.substring(0, 45);
        short = short + '...'
        this.tooltipObj[text] = text
      }
      else {
        short = text;
      }
    }
    return short
  }

  protected closeTab(){
    this.location.back()
  }

  ngOnDestroy() {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
