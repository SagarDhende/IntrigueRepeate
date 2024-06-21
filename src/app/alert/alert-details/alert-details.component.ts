import { AfterViewInit, Component, OnInit, ViewChild, Input, NgZone } from '@angular/core';
import { ActivatedRoute, NavigationExtras, ParamMap, Router } from '@angular/router';
import { TabView } from 'primeng/tabview';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConfigService } from 'src/app/app-config.service';
import { UrlService } from 'src/app/shared/services/url.service';
import { AlertService } from '../alert.service';
import { SubjectService } from 'src/app/shared/services/subject.service';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { IGraphpod } from 'src/app/shared/models/API/graphpod.model';
import { IEntity } from 'src/app/shared/models/API/entity.model';
import { GraphpodResultView } from 'src/app/shared/models/API/graphpod-result-view.model';
import { MetaType } from 'src/app/shared/enums/api/meta-type.enum';
import { IBreadcrumb } from 'src/app/shared/models/breadcrumn.model';
import { IAlert } from 'src/app/shared/models/API/alert.model';
import { IColStructure } from 'src/app/shared/models/col-structure.model';
import { IRuleDetails } from 'src/app/shared/models/API/rule-details.model';
import { INote } from 'src/app/shared/models/API/note.model';
import { IDocument } from 'src/app/shared/models/API/document.model';
import { ICriteria } from 'src/app/shared/models/API/criteria.model';
import { ICase } from 'src/app/shared/models/API/case.model';
import { ISankey } from 'src/app/shared/models/API/sankey.model';
import { INotification } from 'src/app/shared/models/API/notification.model';
import { CommonService } from 'src/app/shared/services/common.service';
import { AppConfig, LayoutService } from 'src/app/layout/service/app.layout.service';
import { Session } from 'src/app/login/auth.model';
import { SessionService } from 'src/app/shared/services/session.service';
import { WorkflowForm } from 'src/app/shared/models/API/workflow-form.model';
import { HelperService } from 'src/app/shared/services/helper.service';
import { IDicomConfig, ITool, IViewerProvider, ToolModeEnum } from 'src/app/shared/components/image-viewer/ngx-dicom/public-api';
import { FormControl, FormGroup } from '@angular/forms';
import { Location } from '@angular/common'

enum TabName{
  SUMMARY="Summary",
  ENTITYDETAILS="Entity Details",
  CASES="Cases",
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
  selector: 'app-alert-details',
  templateUrl: './alert-details.component.html',
  styleUrls: ['./alert-details.component.scss']
})
export class AlertDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('fileSelect') public fileSelect: any;
  @ViewChild(TabView) public tabView!: TabView;

  // Tab open in alert list
  @Input()
  protected details: IAlert;
  protected isAppendMode: boolean;
  protected alrtSummaryError: boolean;
  protected alrtSummaryInprogress: boolean;
  protected isAlertSummaryNoRecords: boolean;
  
  protected tabIndex: number;
  protected alertSummary: IAlert = {} as IAlert;
  protected alertId: any;
  protected alertSummaryLeft: string[];
  protected alertSummaryRight: string[];

  protected ruleDetRowData: any;
  protected notes: INote[];
  protected newNote: string;
  protected documentDetailsCols: IColStructure[];
  protected documentDetails: IDocument[];
  protected documentDetailsFetched: boolean = false;
  protected uploadModal: any;
  protected selectedFile: any;
  protected selectedDocuments: any = [];
  protected ruleDetails: IRuleDetails[];
  protected ruleDetailsCols: IColStructure[];
  protected ruleDetailsSummaryCols: IColStructure[];
  protected criteriaDetails: boolean = false;
  protected criteriaDetailsList: ICriteria[];
  protected criteriaDetailsCols: IColStructure[];
  protected expandedRules: object = {};
  protected ruleError: boolean = false;
  protected caseDetailsCols: IColStructure[];
  protected caseDetails: ICase;
  protected createCaseParams: any;
  protected createCase: boolean = false;
  protected currentTabBreadcrumb: IBreadcrumb;
  protected flowOfFunds: any;
  protected sankey: ISankey;
  protected themeConfig: AppConfig;
  protected sankeyRange: number[];
  protected notificationsFetched: boolean = false;
  protected notificationCols: IColStructure[];
  protected notifications: INotification[];
  protected notesError: boolean = false;
  protected messageHead: string = '';
  protected errorTitle: string = '';
  protected errorContent: string = '';
  protected graphpodMeta?: IGraphpod;
  protected isShowGraphAnalysis: boolean;
  protected linkAnalysisResult: GraphpodResultView;


  protected graphReload: boolean = false
  protected linkAnalysisErrorContent: string;
  protected isMaximized: boolean = false;
  protected pTableHeight: any;
  protected entityId: string;
  protected type: string;
  protected items: { label: string; icon: string; command: (e: any) => void; }[];
  protected activeItem: any;
  
  protected isNotesError: boolean = false
  protected isNotesCompleted: boolean = false;
  protected isNotesInProgress: boolean =  false;

  protected isLinkAnalysisError: boolean = false;
  protected isGraphpodMeta: boolean = false
  protected isLinkAnalysisComplete: boolean;
  protected isLinkAnalysisInProgress: boolean;
  protected isLinkAnalysisNoRecords:boolean = false

  protected flowOfFundsFetched: boolean = false;
  protected isFlowOfFundsError: boolean = false;
  protected isFlowOfFundsComplete: boolean;
  protected isFlowOfFundsInProgress: boolean;
  protected isFlowOfFundsNoRecords:boolean = false
  protected isFlowFundsTabVisible: boolean;

  protected isNotificationsError: boolean = false;
  protected isNotificationsComplete: boolean;
  protected isNotificationsInProgress: boolean;
  protected isNotificationsNoRecords:boolean = false

  protected isCriteriaDetailsError: boolean = false;
  protected isCriteriaDetailsComplete: boolean;
  protected isCriteriaDetailsInProgress: boolean;
  protected isCriteriaDetailsNoRecords:boolean = false

  protected isRuleDetailsNoRecords: boolean = false;
  protected isRuleDetailsInProgress: boolean = false
  protected isRuleDetailsComplete: boolean = false;
  protected isRuleDetailsError: boolean = false;

  protected isCaseNoRecords: boolean = false;
  protected isCaseInProgress: boolean = false
  protected isCaseComplete: boolean = false;
  protected isCaseError: boolean = false;

  protected isDocumentsInProgress:boolean = false;
  protected isDocumentsNoRecords:boolean = false;
  protected isDocumentsComplete:boolean = false;
  protected isDocumentsError:boolean = false;
  protected isImageTabVisible2: boolean;
  protected isDocumentsViewInprogess: boolean;
  protected isDocumentsViewError: boolean;
  protected isDocumentsViewCompleted: boolean;
  protected documentItem: any;


  protected isEntityNoRecods: boolean = false;
  protected isEntityError: boolean = false;
  protected isEntityInprogress: boolean;
  protected isEntityComplete: boolean;
  protected entityDetails:IEntity[];
  protected entityDetailsLeft: string[] = [];
  protected entityDetailsRight: string[] = [];
  private   entityDetailsFetched: boolean = false;

  protected workflowFetched: boolean = false;
  protected isDisabledActionBtn: boolean = true;
  protected workFlowActionDialog:boolean=false;
  protected notificationAction:any;
  protected isWorkflowEmpty: boolean = false;
  protected isWorkflowError: boolean = false;
  protected isWorkflowComplete: boolean = false;
  protected isWorkflowInProgress: boolean = false;
  protected workflow: any = null;
  protected workflowForm:WorkflowForm;

 
  protected isAuditInProgress:boolean = false;
  protected isAuditNoRecords:boolean = false;
  protected isAuditComplete:boolean = true;
  protected isAuditError:boolean = false; 
  protected auditCols:IColStructure[];
  protected history: any = null;
  protected tooltipObj={}
  protected actionButtonLoading:boolean=false;
  protected isDocumentsUploadError:boolean=false;
  protected isDocumentsDeleteError:boolean=false;

  private   auditFetched: boolean = false;
  private id: string;
  private breadcrumb: IBreadcrumb[];
  private ruleDetailsFetched: boolean = false;
  private notesFetched: boolean = false;//check again
  private linkAnalysisFetched: boolean = false;
  private caseDetailsFetched: boolean = false;
  private entityUuid: string;
  actionForm: FormGroup;
  private alertObj: any;
  private previousUrl: Observable<string> = this.urlService.previousUrl$;
  private paramDialogList: any;
  private rule_exec_uuid!: string;
  
  protected isImageTabVisible:boolean=false;
  protected config: IDicomConfig = {
    //fileUrl: `${window.location.origin}/assets/temp/0003.DCM`,
    fileUrl: "./assets/document/",

    tools: [
      {
        name: 'DragProbe',
        options: { mouseButtonMask: 1 },
        mode: ToolModeEnum.Passive
      },
      {
        name: 'Eraser',
        options: { mouseButtonMask: 1 },
        mode: ToolModeEnum.Passive
      },
      {
        name: 'Magnify',
        options: { mouseButtonMask: 1 },
        mode: ToolModeEnum.Passive
      },
      {
        name: 'StackScrollMouseWheel',
        options: { mouseButtonMask: 1 },
        mode: ToolModeEnum.Active
      },
      {
        name: 'Rotate',
        options: { mouseButtonMask: 1 },
        mode: ToolModeEnum.Passive
      },
      {
        name: 'Pan',
        options: { mouseButtonMask: 1 },
        mode: ToolModeEnum.Passive
      },
      {
        name: 'ZoomMouseWheel',
        options: { mouseButtonMask: 1 },
        mode: ToolModeEnum.Passive
      },
      {
        name: 'Length',
        options: { mouseButtonMask: 1 },
        mode: ToolModeEnum.Passive
      },
      {
        name: 'Angle',
        options: { mouseButtonMask: 1 },
        mode: ToolModeEnum.Passive
      },
      {
        name: 'FreehandRoi',
        options: { mouseButtonMask: 1 },
        mode: ToolModeEnum.Passive
      },
      {
        name: 'Wwwc',
        options: { mouseButtonMask: 1 },
        mode: ToolModeEnum.Passive
      }
    ],
    classList: 'canvas-container'
  };
  viewerProvider: IViewerProvider | undefined;


  //array used for unsubscribing observables
  private subscriptions:Subscription[]=[];
  user: any;
  
  constructor(private urlService: UrlService, private route: ActivatedRoute, private router: Router,
    private alertService: AlertService, private appConfigService: AppConfigService, private messageService: MessageService,
    private spinner: NgxSpinnerService, private subjectService: SubjectService, private commonService: CommonService,private layoutService:LayoutService,
    private confirmationService:ConfirmationService,
    private sessionService:SessionService,private location: Location,
    private helperService:HelperService,private zone: NgZone) {

    this.sankeyRange = [0, 100000];
    const observableTemp=this.subjectService.themeBehaviour.asObservable().subscribe({
      next: (response: AppConfig) => {
        this.themeConfig = null;
        this.themeConfig = response;
      }
    });
    this.addSubscribe(observableTemp);
  }

  ngAfterViewInit(): void {
    this.currentTabBreadcrumb = { title: this.tabView.tabs[this.tabIndex].header, url: false };
    this.breadcrumb.push(this.currentTabBreadcrumb);
  }

  ngOnInit(): void {
    this.actionForm = new FormGroup({
      assignTo : new FormControl(),
      dispositionCode: new FormControl()
    })
    this.messageHead = 'Operation Failed';
    this.auditCols = [
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
    const observableTemp=this.urlService.previousUrl$.subscribe((previousUrl: string) => {
      // this.prevUrl = previousUrl;
    });
    
    const sessionDetail: Session = this.sessionService.getData();
    if(sessionDetail) {
      this.getUserByUuid(sessionDetail.userUuid);
    }

    this.addSubscribe(observableTemp);
    // when calling from routes
    if (!this.details){
      this.alrtSummaryInprogress=true;
      this.alrtSummaryError=false;
      this.isAlertSummaryNoRecords=false;
      this.alertSummary=null;
      this.spinner.show("alert-summary");
      const observableTemp=this.route.queryParamMap.subscribe({
        next: (params: ParamMap) => {
          this.id = params.get("alert_id");
          this.getAlertSummary(this.id);
        }
      });
      this.addSubscribe(observableTemp);
    }
    // when calling from component selector
    if (this.details) {
      this.alrtSummaryInprogress=false;
      this.alrtSummaryError=false;
      this.isAlertSummaryNoRecords=false;
      this.id = this.details.alert_id;
      this.type = this.details.entity_type;
      this.entityId = this.details.entity_id;
      this.rule_exec_uuid = this.details.rule_exec_uuid;
      this.alertSummary = this.details;
      this.alertId=this.alertSummary.alert_id;
      this.alertSummary.alert_id = this.details.alert_id;
      this.alertSummary.entity_type = this.details.entity_type;
      this.alertSummary.entity_id = this.details.entity_id;
      this.alertSummary.rule_exec_uuid = this.details.rule_exec_uuid;
      this.alertSummary.rule_exec_version = this.details.rule_exec_version;
      this.alertSummary.rule_name = this.details.rule_name;
      this.alertSummary.rule_exec_time = this.details.rule_exec_time;
      this.alertSummary.business_date = this.details.business_date;
      this.alertSummary.score = this.details.score;
      this.alertSummary.severity = this.details.severity;
      this.getAlertByAlertExec(this.details.rule_exec_uuid, MetaType.ALERTEXEC);
      this.getAlertSummary(this.id);
      this.getEntityDetails();

    }

    this.alertSummaryLeft = ['alert_id', 'rule_name', 'rule_exec_time', 'business_date','score','disposition_code','created_on','updated_on'];
    this.alertSummaryRight = ['entity_type', 'entity_id','owner','status','stage', 'score', 'severity','priority'];

    this.breadcrumb = [{ title: 'Alerts', url: '/alert' }, { title: 'Details', url: false }, { title: this.id, url: false }];
    this.tabIndex = 0;
    this.uploadModal = false;
    this.ruleDetailsCols = [
      { field: 'rule_name', header: 'Rule Name', headAlign: 'left', contentAlign: 'left' },
      { field: 'score', header: 'Score', headAlign: 'center', contentAlign: 'center' },
      { field: 'severity', header: 'Severity', headAlign: 'center', contentAlign: 'center' },
      { field: 'param_info', header: 'Param Info', headAlign: 'left', contentAlign: 'left' },
    ];
    this.ruleDetailsSummaryCols = [
      { field: 'criteria_name', header: 'Criteria Name', headAlign: 'left', contentAlign: 'left' },
      { field: 'criteria_factor_value', header: 'Criteria Factor Value', headAlign: 'center', contentAlign: 'center' },
      { field: 'criteria_met_pass_count', header: 'Criteria Met Pass Count', headAlign: 'center', contentAlign: 'center' },
      { field: 'criteria_met_fail_count', header: 'Criteria Met Fail Count', headAlign: 'center', contentAlign: 'center' },
      { field: 'criteria_score', header: 'Criteria Info', headAlign: 'center', contentAlign: 'center' },
      { field: 'occurrence_score', header: 'Occurence Info', headAlign: 'center', contentAlign: 'center' },
    ];
    this.documentDetailsCols = [
      { field: 'file_name', header: 'Name', headAlign: 'center', contentAlign: 'left' },
      { field: 'file_format', header: 'Format', headAlign: 'center', contentAlign: 'center' },
      { field: 'file_size_mb', header: 'Size MB', headAlign: 'center', contentAlign: 'center' },
      { field: 'createdOn', header: 'Created On', headAlign: 'center', contentAlign: 'center' },
      { field: 'createdBy', header: 'Created By', headAlign: 'center', contentAlign: 'center' },
      { field: 'action', header: 'Action', headAlign: 'center', contentAlign: 'center' },
    ];
    this.criteriaDetailsCols = [
      { field: 'transaction_id', header: 'Transaction ID' },
      { field: 'direction', header: 'Direction' },
      { field: 'account_id', header: 'Account ID' },
      { field: 'customer_id', header: 'Customer ID' },
      { field: 'transaction_type_code', header: 'Transaction Type Code' },
      { field: 'transaction_channel_code', header: 'Transaction Channel Code' },
    ];
    this.caseDetailsCols = [
      { field: 'case_id', header: 'Case ID', headAlign: 'center', contentAlign: 'left' },
      { field: 'business_date', header: 'Business Date', headAlign: 'center', contentAlign: 'center' },
      { field: 'case_type', header: 'Case Type', headAlign: 'center', contentAlign: 'center' },
      { field: 'entity_type', header: 'Entity Type', headAlign: 'center', contentAlign: 'center' },
      { field: 'rule_name', header: 'Rule Name', headAlign: 'center', contentAlign: 'left' },
      { field: 'score', header: 'Score', headAlign: 'center', contentAlign: 'center' },
      { field: 'severity', header: 'Severity', headAlign: 'center', contentAlign: 'center' },
    ];
    this.notificationCols = [
      { field: 'to', header: 'Sent To', headAlign: 'center', contentAlign: 'center' },
      { field: 'subject', header: 'Subject', headAlign: 'center', contentAlign: 'center' },
      { field: 'sendAttachment', header: 'Attachment', headAlign: 'center', contentAlign: 'center' },
      { field: 'createdBy.ref.name', header: 'Sent By', headAlign: 'center', contentAlign: 'center' },
      { field: 'createdOn', header: 'Sent On', headAlign: 'center', contentAlign: 'center' },
      { field: 'status.stage', header: 'Status', headAlign: 'center', contentAlign: 'center' },
      { field: 'action', header: 'Action', headAlign: 'center', contentAlign: 'center' },
    ];
    this.createCaseParams = {
      entityType: this.type,
      entityId: this.entityId,
      alerts: this.id
    }

    this.setActionMenuForMap();
    this.notificationAction=[
      {
        label: 'Download Attachment',
        icon: 'pi pi-download',
        command: (e) => {
            this.notificationAttachmentDownload(this.activeItem);
        }
    },
    {
        label: 'Resend Email',
        icon: 'pi-refresh',
        command: (event: any) => {
            this.resendNotification(this.activeItem);
        }
    } 
    ]

    //this.getAllLatestAnalysis(MetaType.GRAPHANALYSIS, "Y");
    this.pTableHeight = this.getPTableHeight();

  }

  // Tab Change
  protected tabChange():void{
    let headerName=this.tabView.tabs[this.tabIndex].header;
    if(headerName){
      switch (headerName) {
        case TabName.SUMMARY:
          this.getAlertSummary(this.id);
          break
        case TabName.ENTITYDETAILS:
          this.getEntityDetails();
          break;

        case TabName.CASES:
          this.getCaseDetails();
          break;

        case TabName.RULEDETAILS:
          this.getRuleDetails();
          break;

        case TabName.LINKANALYSIS:
          this.getEntityByAlertExec(this.rule_exec_uuid, MetaType.ALERTEXEC);
          break;

        case  TabName.FLOWOFFUNDS:
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
          
        case TabName.NOTIFICSTIONS:
          this.getNotifications();
          break;  
        
        case TabName.CRITERIADETAILS:
          this.getCriteriaByBusinessRule(this.ruleDetRowData);
          break;    
          
        case TabName.AUDIT:
          this.getAudit();
          break;

      }
    }

    this.currentTabBreadcrumb = { title: this.tabView.tabs[this.tabIndex].header, url: false };
    this.breadcrumb.pop();
    this.breadcrumb.push(this.currentTabBreadcrumb);
  }

 // refresh Details
  protected refreshTab(): void {
    this.expandedRules = {};
    let headerName=this.tabView.tabs[this.tabIndex].header
    if(headerName){
      
      switch (headerName) {
        case TabName.ENTITYDETAILS:
          this.entityDetailsFetched = false;
          break;

        case TabName.CASES:
          this.caseDetailsFetched = false;
          this.caseDetails = undefined;
          break;

        case TabName.RULEDETAILS:
          this.ruleDetailsFetched = false;
          this.ruleDetails = undefined;
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

        case TabName.NOTIFICSTIONS:
          this.notificationsFetched = false;
          break;
          
        case TabName.AUDIT:
          this.auditFetched=false;
          break;
      }
  
    this.tabChange();
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

  protected convertName(name: any): string {
    return name.toLowerCase().split('_').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
  }
  protected getSeveritryCaption(severity: string): any {
    return this.appConfigService.getSeveritryCaption(severity);
  }
  protected getSeverityBGColor(severity: string): any {
    return this.appConfigService.getSeverityBGColor(severity)
  }

  // protected handleTabClose(e: any):void {
  //   if (e.index == 2) {
  //     this.createCase = false;
  //   }
  //   else {
  //     this.criteriaDetails = false;
  //     this.tabIndex = 0;
  //     this.criteriaDetailsList = [];
  //   }
  // }

  protected handleTabClose(e: any): void{
    let headerName=this.tabView.tabs[this.tabIndex].header;
    switch (headerName) {
      case TabName.PREVIEW:
      case TabName.VIEW:
        this.isImageTabVisible=false;
        this.tabIndex =this.tabIndex-1;  
        break
      default:
        this.criteriaDetails = false;
        this.tabIndex = 3
        this.criteriaDetailsList = [];
        break
    }
  }

  protected toogleIsMaximized():void {
    this.isMaximized = !this.isMaximized;
    this.layoutService.onMenuToggle();
  }

    // Create Case
  protected async openCreateCase(): Promise<any> {
      this.createCase = true;
      this.createCaseParams = {
        entityType: this.type,
        entityId: this.entityId,
        alerts: this.id
      }
      await new Promise(f => setTimeout(() => { this.tabIndex = 2; }, 500));
  }

  private getAlertByAlertExec(uuid: string, type: string):void {
    this.isFlowFundsTabVisible = false;
    const observableTemp=this.alertService.getAlertByAlertExec(uuid, type).subscribe({
      next: (response: any) => {
        this.alertObj = response.data[0];
        if (response != null && response.data != null && response.data[0].query != null) {
          this.isFlowFundsTabVisible = true;
        }
      },
      error: (response) => {
      }
    });
    this.addSubscribe(observableTemp);
  }
  

  // Alert Summary Tab

  /**
   * 
   * @param id - Alert Id
   * @description - thiss method for get alert summary. 
  */
  private getAlertSummary(id:string):void{
    this.spinner.show("alert-summary");
    this.alrtSummaryInprogress=true;
    this.alrtSummaryError=false;
    this.alertService.getAlertSummary(this.id).subscribe({
      next: (response) => {
        setTimeout(()=>{
          this.spinner.hide("alert-summary");
          this.alrtSummaryInprogress=false;
        
        },500)
        this.alrtSummaryError=false;
        if(response !=null && response.data !=null && response.data.length >0){
          this.alertSummary = response.data[0];
          this.alertId=this.alertSummary.alert_id;
          this.type = this.alertSummary.entity_type;
          this.entityId = this.alertSummary.entity_id;
          this.rule_exec_uuid = this.alertSummary.rule_exec_uuid;
          this.getEntityDetails();
        }else{
          this.isAlertSummaryNoRecords=true;
        }
        this.isWorkFlowActionBtnDisable();
      }, error: (response) => {
        this.spinner.hide("alert-summary");
        this.alrtSummaryInprogress=false;
        this.alrtSummaryError=true;
      }
    });
  }
  

  // Entitty details

  protected openEntity(item: any): void {
    const observableTemp = this.commonService.getEntity().subscribe({
      next: (response) => {
        response.forEach(element => {
          if (element.name == this.alertSummary.entity_type) {
            let navigationExtras: NavigationExtras = {
              queryParams: {
                "type": this.alertSummary.entity_type,
                "uuid": element.uuid,
                "id": this.alertSummary[item],
                "duuid": element.dependsOn.ref.uuid
              }
            }
            this.router.navigate(["/entities/entity-details"],navigationExtras);
          }
        });
      }
    });
    this.addSubscribe(observableTemp);
    
  }
  protected hasMultipleSlashes(str:string):boolean{
    //return this.helperService.hasMultipleSlashes(str);
    return false;
  }

  protected showTooltip(td,span,field){
    if(span.offsetWidth + 28 > td.clientWidth){
      this.tooltipObj[field] = true
    }
   }
  //end

  // Case-list
  protected openCase(item): void {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "case_id": item.case_id,
        "rule_name": item.rule_name,
      }
    }
    this.router.navigate(["/cases/case-details"], navigationExtras);
  }
  
  //Rule Details
  protected getRowDetails(item: any): void {
    let req = {
      ruleExecUuid: item.rule_exec_uuid,
      ruleExecVersion: item.rule_exec_version,
      businessDate: item.business_date
    }
    this.spinner.show(item.rule_exec_uuid);
    const observableTemp=this.alertService.getRuleRowDetails(req, this.entityId).subscribe({
      next: (response: any) => {
        this.spinner.hide(item.rule_exec_uuid);
        item.ruleDetailsSummary = response.data;
      }, error: (err: any) => {
        this.spinner.hide(item.rule_exec_uuid);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Some Error Occured' });
      }
    });
    this.addSubscribe(observableTemp);
  }
  //FLow of funds
  protected sankeyRangeChange(): void {
    this.flowOfFundsFetched = false;
    this.getFlowOfFunds();  
  }

  //Link Analysis
  protected onNodeDblClick(event: any):void {
    this.graphReload = true;
    let id = event.id;
    let degree = '1'
    if (event.degree)
      degree = event.degree;
    this.getGraphByEntity(this.entityUuid, id, event.nodeType, degree, MetaType.GRAPHPOD, event.type || "", true, true);
  }


  
  // Workflow
  protected isActionButtonDisable(): boolean {
    return this.isWorkflowEmpty || this.isDisabledActionBtn;
  }

  protected postAction(): void {
    this.actionForm.reset()
    this.spinner.show("form_render");
    this.workFlowActionDialog = true;
    const observableTemp = this.commonService.getFormByBusinessKey(this.alertSummary.alert_id).subscribe({
      next: (response: any) => {
        this.spinner.hide("form_render");
        setTimeout(() => {
          this.renderForm(response);
        }, 500);
      },
      error: (respose: any) => {
        this.spinner.hide("form_render");

      }
    });
    this.addSubscribe(observableTemp);
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
        data.variables[label].value = this.actionForm.get('assignTo').value;
        data.variables[label].type = "String";
        data.variables[label].valueInfo = {};
        if (this.workflowForm.formMeta.components.length > 1) {
          let label = this.workflowForm.formMeta.components[1].key;
          data.variables[label] = {};
          data.variables[label].value = this.actionForm.get('dispositionCode').value;
          data.variables[label].type = "String";
          data.variables[label].valueInfo = {};
  
        }
      }
      this.workFlowActionDialog = false;
      this.workflowFetched = false;
      const observableTemp = this.commonService.submitFormByBusinessKey(this.alertSummary.alert_id,data).subscribe({
        next: (response: any) => {
          setTimeout(() => {
            this.getAlertSummary(this.id);
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
  
  private isWorkFlowActionBtnDisable():void {
    const sessionDetail: Session = this.sessionService.getData();
    if (sessionDetail) {
      if (this.alertSummary && this.alertSummary.owner != null && sessionDetail.userName == this.alertSummary.owner) {
        this.isDisabledActionBtn = false;
      }
      else if((this.alertSummary.owner == null || this.alertSummary.owner == "")){
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
      this.isWorkflowComplete = false;
      this.isWorkflowError = false;
      this.spinner.show("workflow");
      const observableTemp = this.alertService.getWorkflow(this.alertSummary.alert_id).subscribe({
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
  private getAudit(): void {
    if (!this.auditFetched) {
      this.isAuditComplete = false;
      this.isAuditInProgress = true
      this.isAuditNoRecords = false;
      this.isAuditError = false;
      this.history = undefined;
      this.spinner.show("history");
      const observableTemp = this.alertService.getHistory(this.alertSummary.alert_id).subscribe({
        next: (response: any) => {
          setTimeout(() => {
            this.spinner.hide("history");
            this.isAuditInProgress = false
            if (response.data == null || response == null || response.data == undefined || response.data.length == 0)
              this.isAuditNoRecords = true;
            
            else {
              this.history = response.data;
              this.isAuditComplete = true;
              this.auditFetched = true;
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

  //Notes
  protected noteSubmit(): void {
    if (this.newNote && this.newNote != '' && this.newNote != null) {
      this.spinner.show("notes");
      this.isNotesCompleted = false
      this.isNotesInProgress = true;
      const observableTemp=this.alertService.postNote(this.id, this.newNote).subscribe({
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
      this.spinner.show("notes");
      const observableTemp=this.alertService.putNote(this.id, { noteText: item.updateText, noteId: item.noteId }).subscribe({
        next: (response: any) => {
          this.spinner.hide("notes");
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
    const observableTemp=this.alertService.deleteNote(item.noteId).subscribe({
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
    })
    this.addSubscribe(observableTemp);
  }
  //criteria Details
  protected openCriteriaLink(url: string, value) {
    url = url.replace('${VALUE}', value)
    window.open(url, "_blank");
  }

  protected getCriteriaByBusinessRule(item: any) {
    this.criteriaDetails = true;
    this.isCriteriaDetailsInProgress = true;
    this.isCriteriaDetailsComplete = false;
    this.isCriteriaDetailsError = false;
    this.criteriaDetailsCols = [];
    this.spinner.show("criteriaDetails");
    const observableTemp=this.alertService.getCriteriaByBusinessRule(item.rule_uuid, item.criteria_id).subscribe({
      next: (response: any) => {
        if (response != null && response.attributeInfo != null) {
          let columns = [];
          for (let i = 0; i < response.attributeInfo.length; i++) {
            let colsInfo: any = {};
            colsInfo.field = response.attributeInfo[i].attrSourceName;
            colsInfo.header = response.attributeInfo[i].attrSourceName;
            colsInfo.url = response.attributeInfo[i].url;
            columns.push(colsInfo);
          }
          this.criteriaDetailsCols = columns
        }
        this.getCriteriaDetails(item);

      }, error: (response: any) => {
        this.tabIndex = 4
        this.spinner.hide("criteriaDetails");
        this.isCriteriaDetailsError = true;
        this.isCriteriaDetailsInProgress = false;
        this.errorTitle = 'Operation Failed';
        this.errorContent = response.error;
        this.messageHead = 'Operation Failed';
      }
    });
    this.addSubscribe(observableTemp)
  }

  protected documentDelete(item: any): void {
    this.isDocumentsDeleteError = false;
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete?',
      accept: () => {
        this.spinner.show("documents");
        const observableTemp = this.alertService.deleteDocument(this.id, item.attachmentId).subscribe({
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
  
  protected fileSelectClick(): any {
    this.fileSelect.nativeElement.click();
  }

  protected onFileChange(event: any): void {
    for (var i = 0; i < event.target.files.length; i++) {
      this.selectedDocuments.push(event.target.files[i]);
    }
  }
  protected uploadDocuments(): void {
    this.actionButtonLoading = true;
    this.isDocumentsUploadError = false;
    if (this.selectedDocuments.length > 0) {
      let formData = new FormData();
      for (var i = 0; i < this.selectedDocuments.length; i++) {
        formData.append("file", this.selectedDocuments[i]);
        this.spinner.show("documents");
        const observableTemp=this.alertService.postDocument(this.id, formData).subscribe({
          next: (response: any) => {
            this.spinner.hide("documents");
            this.isDocumentsUploadError = false;
            if (response == true) {
              this.documentDetailsFetched = false;
              this.actionButtonLoading = false;
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
        });
        this.addSubscribe(observableTemp);
      }
    }
  }
  protected popFile(id: any): void {
    this.selectedDocuments.splice(id, 1);
  }
  protected downloadDocument(item: any): void {
    this.spinner.show("documents");
    const observableTemp=this.alertService.downloadDocument(item.attachmentId).subscribe({
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
      }
    });
    this.addSubscribe(observableTemp);
  }
  
  //Notifications
  protected notificationAttachmentDownload(rowData: any):void {
    const observableTemp=this.alertService.notificationAttachmentDownload(this.id, this.rule_exec_uuid, "").subscribe({
      next: (response: any) => {
        const a = document.createElement('a')
        const objectUrl = URL.createObjectURL(response)
        a.href = objectUrl
        a.download = "download.pdf";
        a.click();
        URL.revokeObjectURL(objectUrl);
      }, error: (response: any) => {
        let errorContent = response != null && response.message != null ? response.message : response;


      }
    });
    this.addSubscribe(observableTemp);

  }

  protected resendNotification(item: any): void {
    const observableTemp=this.alertService.resendNotification(item.uuid, this.id).subscribe({
      next: (response: any) => {
        if (response == true) {
          this.getNotifications();
        }
        else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: "Resend Failed" });
        }
      }
    });
    this.addSubscribe(observableTemp);
  }

  private setActionMenuForMap() {
    this.items = [
      {
        label: 'View',
        icon: 'pi pi-eye',
        command: (event: any) => {
          this.onClickDocumentView(this.activeItem);
        }
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: (event: any) => {
            this.documentDelete(this.activeItem);
        }
      },
      {
        label: 'Download',
        icon: 'pi pi-download',
        command: (e) => {
            this.downloadDocument(this.activeItem);
        }
      }
    ]
  }

  protected getNofiticationBgColor(status: string): any {
    return this.appConfigService.getNotificationBgColor(status)
  }

  protected getNofiticationStatusCaption(status: string): any {
    return this.appConfigService.getNotificationCaption(status);
  }
  // Entity Details

  private getEntityDetails(): void {
    if (!this.entityDetailsFetched) {
      this.entityDetailsFetched = true;
      this.isEntityInprogress=true;
      this.isEntityError =false;
      this.isEntityNoRecods = false;
      this.isEntityComplete=false;
      this.entityDetailsLeft = undefined;
      this.entityDetailsRight = undefined;
      this.spinner.show("entityDetails");
      const observableTemp=this.alertService.getEntityDetails(this.type, this.entityId).subscribe({
        next: (response: any) => {
          this.spinner.hide("entityDetails");
          this.isEntityInprogress=false;
          this.entityDetails=response.data[0];
          if (this.entityDetails===undefined) {
            this.isEntityNoRecods = true;
          } 
          else {
            this.isEntityComplete=true;
            let names = Object.keys(this.entityDetails);
            let middleIndex = Math.ceil(names.length / 2);
            this.entityDetailsLeft = names.splice(0, middleIndex);
            this.entityDetailsRight = names.splice(-middleIndex);
          }
        },
        error: (err: any) => {
          this.spinner.hide("entityDetails");
          this.isEntityError = true;
          this.isEntityInprogress=false;
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }//end

  // Case List
  private getCaseDetails(): void {
    if (!this.caseDetailsFetched) {
      this.caseDetailsFetched = true;
      this.isCaseInProgress = true;
      this.isCaseComplete = false;
      this.isCaseError = false;
      this.isCaseNoRecords = false
      this.spinner.show("caseDetails");
      const observableTemp=this.alertService.getAlertCases(this.id).subscribe({
        next: (response: any) => {
          setTimeout(() => {
          this.spinner.hide("caseDetails");
          this.isCaseInProgress = false;
          if(response == null || response.length == 0 || response == undefined){
            this.isCaseNoRecords = true
          }
          else{
            this.caseDetails = response;
            this.isCaseComplete = true;
          }
          }, 500);
        }, error: (err: any) => {
          this.spinner.hide("caseDetails");
          this.isCaseError = true;
          this.isCaseInProgress = false;
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  // Rule Details

  private getRuleDetails(): void {
    if (!this.ruleDetailsFetched) {
      this.ruleDetailsFetched = true;
      let req = {
        entityId: this.entityId,
        alertId: this.id,
        ruleExecUuid: this.alertSummary.rule_exec_uuid,
        ruleExecVersion: this.alertSummary.rule_exec_version,
        businessDate: this.alertSummary.business_date
      }
      this.spinner.show("ruleDetails");
      this.isRuleDetailsInProgress = true;
      this.isRuleDetailsNoRecords = false
      this.isRuleDetailsComplete = false;
      this.isRuleDetailsError = false;
      this.ruleDetails = []
      const observableTemp=this.alertService.getRuleDetails(req).subscribe({
        next: (response: any) => {
          this.spinner.hide("ruleDetails");
          if(response.data == null || response == null || response.data == undefined || response.data.length == 0){
            this.isRuleDetailsNoRecords = true
          }
          this.ruleDetails = response.data;
          this.isRuleDetailsInProgress = false;
          this.isRuleDetailsComplete = true;
          for (let index = 0; index < this.ruleDetails.length; index++) {
            const element = this.ruleDetails[index];
            this.ruleDetails[index].expanded = false;
            this.ruleDetails[index].fetched = false;
            this.ruleDetails[index].ruleDetailsSummary = [];
            this.pTableHeight = this.getPTableHeight();
          }
        }, error: (err: any) => {
          this.spinner.hide("ruleDetails");
          this.isRuleDetailsError = true
          this.isRuleDetailsInProgress = false;
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  // Criteria Details
 
  private async getCriteriaDetails(item: any): Promise<any> {
    this.criteriaDetails = true;
    this.tabIndex = 4
    let req = item;
    this.spinner.show("criteriaDetails");
    const observableTemp=this.alertService.getCriteriaDetails(req, this.id).subscribe({
      next: (response: any) => {
        this.spinner.hide("criteriaDetails");
        if (response != null && response.data != null && response.data.length > 0) {
          this.criteriaDetailsList = response.data;
        }
        else{
          this.isCriteriaDetailsNoRecords = true
        }
        this.isCriteriaDetailsInProgress = false;
        this.isCriteriaDetailsComplete = true;
      }, error: (err: any) => {
        this.tabIndex = 4
        setTimeout(() => {
        this.spinner.hide("criteriaDetails");
        this.isCriteriaDetailsInProgress = false;
        this.isCriteriaDetailsError = true;
        }, 500);
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    });
    this.addSubscribe(observableTemp);
  }

  private prepareColumns(cols: any):any[] {
    let columns = [];
    if (cols != null && cols.length > 0) {
      for (let i = 0; i < cols.length; i++) {
        let colsInfo = { field: "", header: "", hide: false, frozen: false };
        colsInfo.field = cols[i];
        colsInfo.header = cols[i];
        if (colsInfo.field == 'severity' || colsInfo.field == 'score')
          colsInfo.frozen = true
        columns.push(colsInfo);
      }

    }
    return columns;
  }

  //  end criteria error
 
  // Flow of Funds
  private getFlowOfFunds(): void {
    if (!this.flowOfFundsFetched) {
      this.isFlowOfFundsInProgress = true;
      this.isFlowOfFundsComplete = false;
      this.isFlowOfFundsError = false;
      this.isFlowOfFundsNoRecords = false
      this.spinner.show("flowoffunds");
      let req = {
        id: this.id,
        uuid: this.alertSummary.rule_exec_uuid,
        entityId: this.alertSummary.entity_id
      }
      const observableTemp=this.alertService.getFlowOfFunds(req, this.sankeyRange).subscribe({
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

  // Notes

  private getNotes(): void {
    if (!this.notesFetched) {
      this.isNotesInProgress = true;
      this.isNotesCompleted = false
      this.isNotesError = false;
      this.notes = undefined;
      this.spinner.show("notes");
      const observableTemp=this.alertService.getNotes(this.id).subscribe({
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
          this.isNotesInProgress = false;
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }
  
  private noteClear(): any {
    this.newNote = undefined;
  }

  // Documents
  private getDocumentDetails(): void {
    if (!this.documentDetailsFetched) {
      this.isDocumentsInProgress = true;
      this.isDocumentsComplete = false;
      this.isDocumentsNoRecords = false
      this.isDocumentsError = false;
      this.documentDetails = undefined;
      this.spinner.show("documents");
      const observableTemp=this.alertService.getDocumentDetails(this.id).subscribe({
        next: (response: any) => {
          setTimeout(() => {
            this.isDocumentsInProgress = false;
            this.spinner.hide("documents");
            if(response == null || response == undefined || response.length == 0){
              this.isDocumentsNoRecords = true
            }
            else{
              this.documentDetails = response;
              this.documentDetailsFetched = true;
              this.isDocumentsComplete = true;
            }  
          }, 500);
        }, error: (err: any) => {
          this.spinner.hide("documents");
          this.isDocumentsError = true;
          this.isDocumentsInProgress = false;
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  // Notifications
  private getNotifications(): void {
    if (!this.notificationsFetched) {
      this.isNotificationsInProgress = true;
      this.isNotificationsComplete = false;
      this.isNotificationsNoRecords = false
      this.isNotificationsError = false;
      this.notifications = undefined;
      this.spinner.show("notifications");
      const observableTemp=this.alertService.getNotifications(this.id).subscribe({
        next: (response: any) => {
          setTimeout(() => {
            this.isNotificationsInProgress = false;
            this.spinner.hide("notifications");
            if(response == null || response == undefined || response.length == 0){
              this.isNotificationsNoRecords = true
            }
            else{
              this.isNotificationsComplete = true
              this.notificationsFetched = true;
              this.notifications = response;
            }
          }, 500);
        }, error: (err: any) => {
          this.spinner.hide("notifications");
          this.isNotificationsError = true;
          this.isNotificationsInProgress = false;
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';
        }
      });
      this.addSubscribe(observableTemp);
    }
  }
  // Others
     
  // p-table height.
  private getPTableHeight() {
    if (this.ruleDetails != null && this.ruleDetails.length === 0 && this.ruleDetailsFetched) {
      return "90px";
    } else if (!this.ruleDetailsFetched && this.ruleDetails != null && this.ruleDetails.length == 0) {
      return "450px";
    } else if (this.ruleDetails != null)  {
      if (this.ruleDetails.length < 10) {
        return (this.ruleDetails.length * 40) + 50 + "px";
      } else {
        return "450px";
      }
    }
    return false;
  }

  //Start Link Analyisis Tab

  private getGraphAnalysisByUuid(uuid: any) {
    const observableTemp=this.commonService.getOnyByUuidAndVersion(MetaType.GRAPHANALYSIS, uuid, "").subscribe({
      next: (response: any) => {
        let graphanalysis = response;
        if (graphanalysis != null && graphanalysis.paramList != null) {
          let uuid = graphanalysis.paramList.ref.uuid;
          this.getParamListParam(uuid);
        } else {
          let body = { parmaListInfo: [], otherParams: null };
          const otherParams = new Map();
          otherParams.set("ENTITY_ID", this.entityId);
          body.otherParams = Object.fromEntries(otherParams);;
          this.getGraphAnalysis2(this.alertObj.graphAnalysisInfo.ref.uuid, "", "", "", "", "", body, "");
        }
      }, error: (err: any) => {
        this.isLinkAnalysisError = true;
        this.isLinkAnalysisInProgress = false
        this.spinner.hide("alert-graph-analysis");
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
       }
    });
    this.addSubscribe(observableTemp);
  }

  private getParamListParam(uuid: string) {
    const observableTemp=this.alertService.getParamListParam(uuid).subscribe({
      next: (response: any) => {
        console.warn(response)
        this.paramDialogList = response;
        let body = { parmaListInfo: [], otherParams: null };
        this.paramDialogList.forEach(element => {
          let item = {
            paramId: element.paramId,
            paramType: element.paramType,
            paramValue: this.entityId,
            ref: element.ref
          }
          body.parmaListInfo.push(item);
        });
        const otherParams = new Map();
        otherParams.set("ENTITY_ID", this.entityId);
        body.otherParams = Object.fromEntries(otherParams);
        this.getGraphAnalysis2(this.alertObj.graphAnalysisInfo.ref.uuid, "", "", "", "", "", body, "", false);
      },error: (err : any) => {
        this.isLinkAnalysisError = true;
        this.isLinkAnalysisInProgress = false
        this.spinner.hide("alert-graph-analysis");
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    });
    this.addSubscribe(observableTemp);
  }
  private getEntityByAlertExec(alertExecUuid: string, type: string) {
    if (!this.linkAnalysisFetched) {
      this.isGraphpodMeta = false
      this.isLinkAnalysisNoRecords = false
      this.isShowGraphAnalysis = false;
      this.isLinkAnalysisInProgress = true
      this.isLinkAnalysisComplete = false
      this.isLinkAnalysisError = false;
      this.spinner.show("alert-graph-analysis");
      const observableTemp=this.alertService.getEntityByAlertExec(alertExecUuid, type).subscribe({
        next: (response: IEntity) => {
          this.entityUuid = response.uuid;
          this.linkAnalysisFetched = true;
          this.getGraphpodByEntity(response.uuid, MetaType.GRAPHPOD);
        },
        error: (err) => {
          this.isLinkAnalysisError = true;
          this.isLinkAnalysisInProgress = false
          this.spinner.hide("alert-graph-analysis");
          this.errorTitle = 'Operation Failed';
          this.errorContent = err.error;
          this.messageHead = 'Operation Failed';

        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  private getGraphpodByEntity(entityUuid: string, type: string) {
    const observableTemp=this.commonService.getGraphpodByEntity(entityUuid, type).subscribe({
      next: (response: IGraphpod) => {
        if(response!=null){
          this.graphpodMeta = response;
          if (this.alertObj != null && this.alertObj.graphAnalysisInfo != null) {
            this.getGraphAnalysisByUuid(this.alertObj.graphAnalysisInfo.ref.uuid);
          } else {
            this.getGraphByEntity(this.entityUuid, this.entityId, this.type, "", MetaType.GRAPHPOD, "", false, false);
          }
        }
        else {
          this.spinner.hide("alert-graph-analysis");
          this.isShowGraphAnalysis = false;
          this.isLinkAnalysisInProgress = false
          this.linkAnalysisFetched = true;
          this.isGraphpodMeta = true;
       }
      },
      error: (err) => {
        this.isLinkAnalysisError = true;
        this.isLinkAnalysisInProgress = false
        this.spinner.hide("alert-graph-analysis");
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed'
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getGraphByEntity(entityUuid: string, entityId: string, entityType: string, degree: string, type: string, edgeType: string, isAppendMode: boolean, isImplicitId: boolean) {
    const observableTemp=this.commonService.getGraphByEntity(entityUuid, entityId, entityType, degree, type, edgeType, isImplicitId).subscribe({
      next: (response: GraphpodResultView) => {
        console.log("api response",response);
        this.spinner.hide("alert-graph-analysis");
        this.spinner.hide("alert-graph-analysisreload");
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
        this.spinner.hide("alert-graph-analysis");
        this.isLinkAnalysisError = true;
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed'

      }
    });
      this.addSubscribe(observableTemp);
  }

  private getGraphAnalysis2(uuid: string, nodeType: string, degree: string, startDate: string, edge: string, endDate: string, body?: any, nodeId?: string, isAppendMode?: boolean) {
    const observableTemp=this.commonService.getGraphAnalysis2(uuid, "graphanalysis", nodeType, degree, startDate, edge, endDate, body, nodeId).subscribe({
      next: (response: GraphpodResultView) => {
        this.spinner.hide("alert-graph-analysis");
        this.spinner.hide("alert-graph-analysisreload");
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
        this.spinner.hide("alert-graph-analysis");
        this.isLinkAnalysisError = true;
        this.isLinkAnalysisInProgress = false
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed'
      }
    });
    this.addSubscribe(observableTemp);
  }
  //End Link Analyisis Tab


  //Start DICOM Image Read Tab
  
  protected onClickDocumentView(item:any){
    this.isImageTabVisible=true;
    setTimeout(()=>{
      this.tabIndex= this.tabIndex+1;
    },1000);
    this.viewDocument(item);
  }

  protected exportStateToJson(): void {
    this.download(
      JSON.stringify(this.viewerProvider?.cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState()),
      'toolsState.json',
      'application/json'
    )
  }

  protected  saveAs(): void {
    this.viewerProvider?.cornerstoneTools.SaveAs(this.viewerProvider?.element, 'screenshot.png');
  }

  protected activateTool(name: string): void {
    const foundTool = this.config.tools?.find((tool) => tool.name === name);
    if (foundTool && this.viewerProvider) {
      this.viewerProvider.cornerstoneTools['setToolActive'](name, foundTool.options)
    }
  }

  protected isActive(tool: ITool): boolean {
    return this.viewerProvider?.cornerstoneTools.isToolActiveForElement(this.viewerProvider?.element, tool.name);
  }

  private download(content: any, fileName: string, contentType: string) {
    const a = document.createElement("a");
    const file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
  private viewDocument(item: any): void {
    this.documentItem=item;
    this.config.fileUrl="./assets/document/",
    this.config.fileUrl=this.config.fileUrl+item.file_name;
    this.spinner.show("document-view");
    this.isDocumentsViewInprogess=true;
    this.isDocumentsViewError=false;
    this.isDocumentsViewCompleted=false;
    const observableTemp=this.alertService.viewDocument(item.attachmentId).subscribe({
      next: (response: any) => {
        setTimeout(()=>{
          this.spinner.hide("document-view");
          this.isDocumentsViewInprogess=false;
        },1000)
        this.isDocumentsViewError=false;
        this.isDocumentsViewCompleted=true;

      },
      error: (err: any) => {
        this.spinner.hide("document-view");
        this.isDocumentsViewInprogess=false;
        this.isDocumentsViewError=true;
        this.isDocumentsViewCompleted=false;
      }
    });
    this.addSubscribe(observableTemp);
  }
  //END DICOM Image Read Tab


  private getUserByUuid(uuid: any):void {
    const observableTemp = this.commonService.getOnyByUuidAndVersion(MetaType.USER, uuid, null).subscribe({
      next: (response: any) => {
        this.user = response;
      }, error: (response: any) => {

      }
    });
    this.addSubscribe(observableTemp);
  }

  private addSubscribe(subscriber:any):void {
    if(subscriber!=null && subscriber instanceof Subscriber){     
      this.subscriptions.push(subscriber);
    }
  } 

  protected closeTab(){
    this.location.back()
  }

  ngOnDestroy() {
    //Method used for unsubscribing observables
    for(let subscription of this.subscriptions){
      subscription.unsubscribe();
    }
  }
}