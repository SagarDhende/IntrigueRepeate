import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { MenuItem, MessageService } from 'primeng/api';
import { NgScrollbar } from 'ngx-scrollbar';
import { NgxSpinnerService } from 'ngx-spinner';
import { v4 as uuid } from 'uuid';

import { GenerativeAiService } from './generative-ai.service';
import { AppConfig, LayoutService } from '../layout/service/app.layout.service';
import { SubjectService } from '../shared/services/subject.service';
import { HelperService } from '../shared/services/helper.service';

import { VisNetworkComponent } from '../shared/components/charts/vis-network/vis-network.component';

import { IGraphpod } from '../shared/models/API/graphpod.model';
import { IColStructure } from '../shared/models/col-structure.model';
import { MetaType } from '../shared/enums/api/meta-type.enum';
import { GraphpodResultView } from '../shared/models/API/graphpod-result-view.model';
import { IDataObject, DataObject, ResponseType, IDocuument, DocumentObject, IDocumentRequestObject, 
         DatapodRequestObject, Ref, sourceTable, RagType, DataSourceRequestObject } from './gen-ai-model';
import { IVizNetworkStyle } from '../shared/components/charts/vis-network/viz-network-model';


@Component({
  selector: 'app-generative-ai',
  templateUrl: './generative-ai.component.html',
  styleUrl: './generative-ai.component.scss',
  providers: [DatePipe]
})

export class GenerativeAiComponent implements OnInit {

  @ViewChild('fileSelect') public fileSelect: any;
  @ViewChild('documentSelect') public documentSelect: any;
  @ViewChild("container") container: ElementRef<HTMLDivElement>;
  @ViewChild("scrollbarRef") scrollbarRef: NgScrollbar;
  @ViewChild("visNetworkComp") visNetworkComp: VisNetworkComponent;

  protected responseType: string = ResponseType.GRAPH
  protected vizNetworkHeightObj: IVizNetworkStyle;
  protected length: number;
  protected selectedOptions: any[] = [];
  protected tableCols: IColStructure[];
  protected tempTableRows: any = [];
  protected tableRows: any = [];
  protected themeConfig: any
  protected graphpodMeta?: IGraphpod;
  protected linkAnalysisResult: GraphpodResultView;
  protected copyTooltip: string = ""
  protected currentIndex: number;
  protected popUpTitle: string = "Confirmation"
  protected isDialogOpen: boolean = false;
  protected isShowSQLDialogOpen: boolean = false;
  protected sqlQuery: string = ""
  protected breadcrumbItems: MenuItem[];
  protected breadcrumbHome: MenuItem;
  protected isMaximized: boolean = true
  protected actionButtonLoading: boolean = false;
  protected isDocumentsUploadError: boolean = false;
  protected selectedDocuments: any = [];
  protected selectedSchema: any = []
  protected uploadModal: boolean = false
  protected errorTitle: string;
  protected errorContent: string;
  protected messageHead: string;
  protected question: string;
  protected documentArray: IDocuument[] = [];
  protected chatConversationDataArray: IDataObject[] = [];
  protected selectedFile: any;
  protected genAIForm: FormGroup
  protected uploadForm: FormGroup
  protected allDocuments: any = [];
  protected allCategories: any = [];
  protected uploadCategories: any = []
  private cols: IColStructure[];

  protected sourceTypes = [
    { name: 'DOCUMENT', value: MetaType.DOCUMENT },
    { name: 'DATASOURCE', value: MetaType.DATASOURCE },
    { name: 'DATAPOD', value: MetaType.DATAPOD },
    { name: 'KNOWLEDGE GRAPH', value: MetaType.GRAPHPOD },
  ]

  protected ragTypes = [
    { name: 'Graph', value: RagType.GRAPH },
    { name: 'VectorDB', value: RagType.VECTORDB },
  ]

  constructor(private genAIService: GenerativeAiService, private layoutService: LayoutService,
    private messageService: MessageService, private subjectService: SubjectService, 
    private spinner: NgxSpinnerService, private helperService: HelperService) {
    const observableTemp = this.subjectService.themeBehaviour.asObservable().subscribe({
      next: (response: AppConfig) => {
        this.themeConfig = null;
        this.themeConfig = response;
      }
    });
  }

  ngOnInit(): void {
    this.createGenAIFormGroup()
    this.createUploadFormGroup()
    this.breadcrumbItems = [
      { label: '<i class="pi pi-chevron-right custom-chevron"></i> Generative AI', escape: false }
    ];
    let sourceType = this.genAIForm.get('sourceType').value?.value
    this.getAllLatestDocuments(sourceType)
    this.getAllCategories()
    this.getConfigList()
  }

  protected getConfigList(): void{
    this.genAIService.getConfigList("framework_document_rag_type").subscribe({
      next: (response: any) => {
      console.log(response)
      },
      error: (err) => {
       console.log(err)
      }
    });
  }

  private createGenAIFormGroup():void{
    this.genAIForm = new FormGroup({
      sourceType: new FormControl({ name: 'DOCUMENT', value: 'document' }),
      sourceName: new FormControl({ name: 'All Documents', uuid: null }),
      category: new FormControl({ name: 'All Categories', uuid: null })
    })
  }

  private createUploadFormGroup():void{
    this.uploadForm = new FormGroup({
      uploadCategory: new FormControl({ name: '', uuid: null }),
      ragType: new FormControl({name: "", value: RagType.GRAPH})
    })
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    let sourceType = this.genAIForm.get('sourceType').value?.value
    if (event.key == "Enter" && this.question != "") { 
        let dataObj = this.createDataObject()
        this.getAIResponse(sourceType, dataObj)
    }
  }

  private getAIResponse(sourceType:string, dataObj:IDataObject): void{
    switch (sourceType) {
      case MetaType.DOCUMENT:
        let documentObj = this.createDocumentObject()
        this.getResponseForDocument(documentObj)
        break;
      case MetaType.GRAPHPOD:
        this.getResponseForKnowledgeGraph(dataObj)
        break;
      case MetaType.DATASOURCE:
        this.getResponseForDatasource(dataObj)
        break;
      case MetaType.DATAPOD:
        this.getResponseForDatapod(dataObj)
       break;
    }
  }

  private createDataObject(): IDataObject {
    let dataObj = new DataObject()
    dataObj.question = this.question;
    dataObj.currentDateAndTimeForQuestion = new Date();
    dataObj.requestId = uuid()
    dataObj.spinnerId = uuid()
    this.chatConversationDataArray.push(dataObj)
    this.setScrollToBottom()
    return dataObj
  }

  private createDocumentObject(): IDocuument {
    let documentObj = new DocumentObject()
    documentObj.question = this.question;
    documentObj.requestId = uuid()
    this.documentArray.push(documentObj)
    this.setScrollToBottom()
    return documentObj;
  }

  private showResultTable(response: any, dataObj: any) {
        dataObj.tempTableRows = []
        dataObj.tempTableRows = response.data.data;
        dataObj.tableRows = dataObj.tempTableRows;
        if (response != null && response.data.data.length > 0) {
          this.prepareColumns(Object.keys(dataObj.tableRows[0]));
        }
        dataObj.tableCols = this.cols;
        dataObj.selectedOptions = dataObj.tableCols
        this.spinner.hide(dataObj.spinnerId);
        dataObj.length = response.data.data.length
  }

  private prepareColumns(cols: any): void {
    if (cols != null && cols.length > 0) {
      this.cols = [];
      for (let i = 0; i < cols.length; i++) {
        let colsInfo = { field: "", header: "", visible: true };
        colsInfo.field = cols[i];
        colsInfo.header = cols[i];
        colsInfo.visible = true
        this.cols.push(colsInfo);
      }
    }
  }

  protected onColumnSelectChange(item: IDataObject) {
    const uncheckedColumns = item.tableCols.filter(
      col => !item.selectedOptions.includes(col)
    );
    const checkedColumns = item.tableCols.filter(
      col => item.selectedOptions.includes(col)
    );
    uncheckedColumns.forEach(col => {
      col.visible = false
    })
    checkedColumns.forEach(col => {
      col.visible = true
    })
  }

  protected searchTableRows(item: IDataObject): void {
    item.tableRows = this.helperService.setSearchTerm(item.tempTableRows, item.searchText);
  }

  protected getResponseForDatapod(dataObj: IDataObject) {
    this.question = ""
    let ref = new Ref()
    let sourceTableName = new sourceTable()
    let datapodObject = new DatapodRequestObject()
    ref.type = this.genAIForm.get('sourceType').value?.value
    ref.uuid = this.genAIForm.get('sourceName').value?.uuid
    sourceTableName.ref = ref
    datapodObject.sourceTableName = sourceTableName
    datapodObject.userInput = dataObj.question
    dataObj.tableRows = [];
    dataObj.tableCols = []
    dataObj.isDataFetched = false
    dataObj.isDataError = false;
    dataObj.isQueryBtnShow = true
    dataObj.isDataInProgress = true
    dataObj.isDataNoRecords = false;
    dataObj.isLike = false
    dataObj.isDislike = false
    dataObj.flagged = false
    dataObj.isDeleted = false
    this.spinner.show(dataObj.spinnerId)
    const observableTemp = this.genAIService.getDatapodResult(datapodObject, dataObj.requestId).subscribe({
      next: (response: any) => {
        dataObj.isDataInProgress = false
        this.spinner.hide(dataObj.spinnerId)
        if(response.data == null){
          dataObj.isDataError = true
          dataObj.isDataInProgress = false;
          this.spinner.hide(dataObj.spinnerId)
          dataObj.errorTitle = 'Operation Failed';
          dataObj.errorContent = response.error.message;
          dataObj.messageHead = 'Operation Failed';
        }
        else if(response.data.data == null || response.data.data.lenght == 0){
          dataObj.isDataNoRecords = true; 
        }
        else if(response.meta.type.toLowerCase() == ResponseType.TABLE){
          dataObj.responseType = ResponseType.TABLE
          dataObj.sqlQuery = response.meta.query;
          dataObj.isDataFetched = true
          this.showResultTable(response, dataObj)
        }
        else if(response.meta.type.toLowerCase() == ResponseType.GRAPH){
           dataObj.responseType = ResponseType.GRAPH
           dataObj.sqlQuery = response.meta.query;
           dataObj.isDataFetched = true
           dataObj.linkAnalysisResult = response.data.data
        }
      },
      error: (err) => {
        dataObj.isDataError = true
        this.spinner.hide(dataObj.spinnerId)
        dataObj.errorTitle = 'Operation Failed';
        dataObj.errorContent = err.error;
        dataObj.messageHead = 'Operation Failed';
      }
    });
  }
  
  protected getResponseForDatasource(dataObj: IDataObject): void {
    this.question = ""
    this.spinner.show(dataObj.spinnerId)
    let ref = new Ref()
    let sourceTableName = new sourceTable()
    let dataSourceObject = new DataSourceRequestObject()
    ref.type = this.genAIForm.get('sourceType').value?.value
    ref.uuid = this.genAIForm.get('sourceName').value?.uuid
    sourceTableName.ref = ref
    dataSourceObject.dbName = sourceTableName
    dataSourceObject.userInput = dataObj.question
    dataObj.tableRows = [];
    dataObj.tableCols = []
    dataObj.isDataFetched = false
    dataObj.isDataError = false;
    dataObj.isQueryBtnShow = true
    dataObj.isDataInProgress = true
    dataObj.isDataNoRecords = false;
    dataObj.isLike = false
    dataObj.isDislike = false
    dataObj.flagged = false
    dataObj.isDeleted = false
    const observableTemp = this.genAIService.getDataSourceResult(dataSourceObject, dataObj.requestId).subscribe({
      next: (response: any) => {
      dataObj.isDataInProgress = false
      this.spinner.hide(dataObj.spinnerId)
      if(response.data == null){
        dataObj.isDataError = true
        dataObj.isDataInProgress = false;
        this.spinner.hide(dataObj.spinnerId)
        dataObj.errorTitle = 'Operation Failed';
        dataObj.errorContent = response.error.message;
        dataObj.messageHead = 'Operation Failed';
      }
      if(response.data == null || response.data.lenght == 0){
        dataObj.isDataNoRecords = true;
       }
     else if (response.meta.type.toLocaleLowerCase() == ResponseType.GRAPH) {
        dataObj.responseType = ResponseType.GRAPH
        dataObj.sqlQuery = response.meta.query;
        dataObj.linkAnalysisResult = response.data;
        this.vizNetworkHeightObj = { 'height': 'calc(100vh - 32rem)' }
        dataObj.isDataFetched = true;
        }
      else if(response.meta.type.toLocaleLowerCase() == ResponseType.TABLE) {
        dataObj.responseType = ResponseType.TABLE
        dataObj.sqlQuery = response.meta.query;
        dataObj.isDataFetched = true
        this.showResultTable(response, dataObj)
      }
      },
      error: (err) => {
        dataObj.isDataError = true
        dataObj.isDataInProgress = false;
        this.spinner.hide("data-spinner")
        dataObj.errorTitle = 'Operation Failed';
        dataObj.errorContent = err.error;
        dataObj.messageHead = 'Operation Failed';
      }
    });
  }

  private getGraphByText(type, uuid, question, dataObj) {
    this.genAIService.getGraphByText(type, uuid, question, dataObj.requestId).subscribe({
      next: (response: any) => {
        dataObj.isDataInProgress = false;
        this.spinner.hide(dataObj.spinnerId)
        if (response.meta.resultType.toLocaleLowerCase() == ResponseType.GRAPH){
          if(response.data.edges == null || response.data.nodes == null){
            dataObj.isDataNoRecords = true;
          }
          else{
            dataObj.responseType = ResponseType.GRAPH
            dataObj.linkAnalysisResult = response.data;
            this.vizNetworkHeightObj = { 'height': 'calc(100vh - 32rem)' }
            dataObj.isDataFetched = true;
          }
          }
        else if(response.meta.resultType.toLocaleLowerCase() == ResponseType.TABLE){
          dataObj.responseType = ResponseType.TABLE
          dataObj.isDataFetched = true
          this.showTableForKG(response, dataObj)
        }
      },
      error: (err) => {
        dataObj.isDataError = true
        dataObj.isDataInProgress = false;
        this.spinner.hide(dataObj.spinnerId)
        dataObj.errorTitle = 'Operation Failed';
        dataObj.errorContent = err.error;
        dataObj.messageHead = 'Operation Failed';
      }
    });
  }

  private showTableForKG(response: any, dataObj: any): void{
    dataObj.tempTableRows = []
    dataObj.tempTableRows = response.data;
    dataObj.tableRows = dataObj.tempTableRows;
    if (response != null && response.data.length > 0) {
      this.prepareColumns(Object.keys(dataObj.tableRows[0]));
    }
    dataObj.tableCols = this.cols;
    dataObj.selectedOptions = dataObj.tableCols
    this.spinner.hide(dataObj.spinnerId);
    dataObj.length = response.data.length
  }

  protected getResponseForKnowledgeGraph(dataObj: IDataObject): void {
    this.question = ""
    const UUID = this.genAIForm.get('sourceName').value?.uuid
    const type = this.genAIForm.get('sourceType').value?.value
    dataObj.isQueryBtnShow = false
    dataObj.isDataFetched = false
    dataObj.isDataError = false;
    dataObj.isDataInProgress = true
    dataObj.isDataNoRecords = false;
    dataObj.isLike = false
    dataObj.isDislike = false
    dataObj.flagged = false
    dataObj.isDeleted = false
    dataObj.tableRows = [];
    dataObj.tableCols = []
    this.spinner.show(dataObj.spinnerId)
    this.genAIService.getOneByUuidAndVersion(type, UUID).subscribe({
      next: (response: any) => {
          dataObj.graphpodMeta = response;
          this.getGraphByText(type, UUID, dataObj.question, dataObj)
      },
      error: (err) => {
        dataObj.isDataError = true
        dataObj.isDataInProgress = false;
        this.spinner.hide(dataObj.spinnerId)
        dataObj.errorTitle = 'Operation Failed';
        dataObj.errorContent = err.error;
        dataObj.messageHead = 'Operation Failed';
      }
    });
  }

  private setScrollToBottom(): void{
    setTimeout(() => {
      this.scrollbarRef.scrollTo({ bottom: 0 })
     }, 10)
  }

  protected onClickSendQuestion(): void {
    if(this.question != ""){
      let sourceType = this.genAIForm.get('sourceType').value?.value
      let dataObj = this.createDataObject()
      this.getAIResponse(sourceType, dataObj)
    }
  }

  private getResponseForDocument(documentObj: IDocuument): void {
    this.question = ""
    documentObj.currentDateAndTimeForQuestion = new Date();
    documentObj.requestId = documentObj.requestId
    documentObj.isGenAIError = false
    documentObj.isGenAICompleted = false
    documentObj.isGenAIInProgress = true
    documentObj.isGenAINoAnswer = false
    documentObj.isLike = false
    documentObj.isDislike = false
    documentObj.flagged = false
    documentObj.isDeleted = false
    let requestObj: IDocumentRequestObject = {
      categoryInfo: {
        ref: {
          type: "category",
          uuid: this.genAIForm.get('category').value?.uuid
        }
      },
      docInfo: {
        ref: {
          type: this.genAIForm.get('sourceType').value?.value,
          uuid: this.genAIForm.get('sourceName').value?.uuid
        }
      },
      userInput : documentObj.question
    }
    const observableTemp = this.genAIService.getDocumentResult(requestObj, documentObj.requestId).subscribe({
      next: (response: any) => {
        documentObj.isGenAIInProgress = false
        if (response.error.code == '500') {
          documentObj.isGenAIError = true
          documentObj.errorTitle = 'Operation Failed';
          documentObj.errorContent = response.error.message;
          documentObj.messageHead = 'Operation Failed';
          documentObj.currentDateAndTimeForAnswer = new Date();
        }
        else if (response.data == null && response.error == null) {
          documentObj.isGenAINoAnswer = true
          documentObj.answer = "No Answer Found";
          documentObj.currentDateAndTimeForAnswer = new Date();
        }
        else {
          documentObj.answer = response.data.text
          documentObj.isGenAICompleted = true
          documentObj.currentDateAndTimeForAnswer = new Date();
        }
        this.setScrollToBottom()
      },
      error: (err) => {
        documentObj.isGenAIError = true
        documentObj.isGenAIInProgress = false
        documentObj.errorTitle = 'Operation Failed';
        documentObj.errorContent = err.message;
        documentObj.messageHead = 'Operation Failed';
      }
    });
  }

  protected showSQL(dataObj: IDataObject): void{
    this.isShowSQLDialogOpen = true;
    this.sqlQuery = dataObj.sqlQuery 
  }

  protected onClickDocumentAnswerLike(docObj: IDocuument): void {
    docObj.isLike = !docObj.isLike
    docObj.isDislike = docObj.isLike ? false : false
    let userFeedback = docObj.isLike ? "LIKE" : ""
    const observableTemp = this.genAIService.sendFeedback(docObj.requestId, userFeedback).subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (response) => {
      }
    });
  }

  protected onClickLikeAnswer(dataObj: IDataObject): void {
    dataObj.isLike = !dataObj.isLike
    dataObj.isDislike = dataObj.isLike ? false : false
    let userFeedback = dataObj.isLike ? "LIKE" : ""
    const observableTemp = this.genAIService.sendFeedback(dataObj.requestId, userFeedback).subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (response) => {
      }
    });
  }

  protected shortenText(text: any): string {
    let short = ''
    if (text != null) {
      if (text.length > 17) {
        short = text.substring(0, 35);
        short = short + '...'
      }
      else {
        short = text;
      }
    }
    return short
  }

  protected onClickDocumentAnswerBookmar(docObj: IDocuument): void {
    docObj.flagged = !docObj.flagged
    let flagged = docObj.flagged ? "Y" : "N"
    const observableTemp = this.genAIService.sendFlagged(docObj.requestId, flagged).subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (response) => {
      }
    });
  }

  protected onClickBookmarkAnswer(dataObj: IDataObject): void {
    dataObj.flagged = !dataObj.flagged
    let flagged = dataObj.flagged ? "Y" : "N"
    const observableTemp = this.genAIService.sendFlagged(dataObj.requestId, flagged).subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (response) => {
      }
    });
  }

  protected onClickDocumentAnswerDisLike(docObj: IDocuument): void {
    docObj.isDislike = !docObj.isDislike
    docObj.isLike = docObj.isDislike ? false : false
    let userFeedback = docObj.isDislike ? "DISLIKE" : ""
    const observableTemp = this.genAIService.sendFeedback(docObj.requestId, userFeedback).subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (response) => {
      }
    });
  }

  protected onClickDisLikeAnswer(dataObj: IDataObject): void {
    dataObj.isDislike = !dataObj.isDislike
    dataObj.isLike = dataObj.isDislike ? false : false
    let userFeedback = dataObj.isDislike ? "DISLIKE" : ""
    const observableTemp = this.genAIService.sendFeedback(dataObj.requestId, userFeedback).subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (response) => {
      }
    });
  }

  protected copyAnswer(docObj: IDocuument): void {
    this.copyTooltip = "Copied"
    setTimeout(() => {
      navigator.clipboard.writeText(docObj.answer);
      this.copyTooltip = ""
    }, 1000);
  }

  protected openDeleteDialog(index: number): void {
    this.isDialogOpen = true;
    this.currentIndex = index
  }

  protected deleteAnswer(): void {
    let sourceType = this.genAIForm.get('sourceType').value?.value
    this.deleteResponse(sourceType)
  }

  private deleteResponse(sourceType:string): void{
      switch (sourceType) {
        case MetaType.DOCUMENT:
          this.deleteDocumentResponse()
          break;
        case MetaType.GRAPHPOD:
          this.deleteData()
          break;
        case MetaType.DATASOURCE:
          this.deleteData()
          break;
        case MetaType.DATAPOD:
          this.deleteData()
         break;
      }
  }

  private deleteDocumentResponse(): void{
    let currentQuestion = this.documentArray[this.currentIndex]
    const observableTemp = this.genAIService.deleteAnswer(currentQuestion.requestId).subscribe({
      next: (response) => {
        if (response.data) {
          currentQuestion.answer = "Answer Deleted"
          currentQuestion.isDeleted = true
          this.isDialogOpen = false;
          this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: 'Answer Deleted Successfully' });
        }
      },
      error: (response) => {
      }
    });
  }

  private deleteData(): void{
    let currentQuestion = this.chatConversationDataArray[this.currentIndex]
    currentQuestion.isDataFetched = false;
    const observableTemp = this.genAIService.deleteAnswer(currentQuestion.requestId).subscribe({
      next: (response) => {
        if (response.data) {
          currentQuestion.isDeleted = true
          this.isDialogOpen = false;
          this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: 'Answer Deleted Successfully' });
        }
      },
      error: (response) => {
      }
    });
  }

  protected onChangeSourceType(): void {
    this.documentArray = []
    this.chatConversationDataArray = []
    let sourceType = this.genAIForm.get('sourceType').value?.value
    this.getAllLatestDocuments(sourceType)
    this.getAllCategories()
  }

  protected onChangeCategory(): void{
    this.documentArray = []
    this.chatConversationDataArray = []
    let sourceType = this.genAIForm.get('sourceType').value?.value
    let categoryUuid = this.genAIForm.get('category').value?.uuid
    if(categoryUuid == null){
      this.getAllLatestDocuments(sourceType)
    }
    else{
      this.getDocumentsByCategory(categoryUuid)
    }
  }

  protected onChangeUploadCategory(): void{
   
  }

  protected getDocumentsByCategory(categoryUuid: string): void{
  const observableTemp = this.genAIService.getAllDocumentsByCategory(categoryUuid).subscribe({
    next: (response) => {
      if(response != null){
        this.allDocuments = response
        this.allDocuments.unshift({
          name: 'All Documents',
          uuid: null
        })
        this.genAIForm.get('sourceName').setValue({ name: 'All Documents', uuid: null })
      }
    },
    error: (response) => {
    }
  });
}

  protected onClickDocumentAnswerRefresh(docObj: IDocuument): void {
    this.getResponseForDocument(docObj)
  }

  protected onClickRefreshAnswer(dataObj: IDataObject): void {
    let sourceType = this.genAIForm.get('sourceType').value?.value
    this.getAIResponse(sourceType,dataObj)
  }

  private getAllLatestDocuments(sourceType: string): void {
    const observableTemp = this.genAIService.getAllLatest(sourceType, "Y").subscribe({
      next: (response) => {
        this.allDocuments = response;
        let sourceType = this.genAIForm.get('sourceType').value?.value
        if(sourceType == MetaType.DOCUMENT){
          this.allDocuments.unshift({
            name: 'All Documents',
            uuid: null
          })
          this.genAIForm.get('sourceName').setValue({ name: 'All Documents', uuid: null })
        }
      },
      error: (response) => {
      }
    });
  }

  private getAllCategories(): void {
    const observableTemp = this.genAIService.getAllLatest("category", "Y").subscribe({
      next: (response) => {
        if(response != null){
          if(this.uploadModal){
            this.uploadCategories = response
            this.uploadForm.get('uploadCategory').setValue({ name: '', uuid: null })
          }
          else{
            this.allCategories = response
            this.allCategories.unshift({
              name: 'All Categories',
              uuid: null
            })
            this.genAIForm.get('category').setValue({ name: 'All Categories', uuid: null })
          }
        }
      },
      error: (response) => {
      }
    });
  }

  protected onDocumentChange(event: any): void {
    for (var i = 0; i < event.target.files.length; i++) {
      this.selectedDocuments.push(event.target.files[i]);
    }
  }

  protected documentSelectClick(): void {
    this.documentSelect.nativeElement.click();
  }

  protected onFileChange(event: any): void {
    this.selectedSchema = []
    this.selectedSchema.push(event.target.files[0]);
  }

  protected fileSelectClick(): void {
    this.fileSelect.nativeElement.click();
  }

  protected openUploadModal(): void{
    this.isDocumentsUploadError = false
    this.selectedSchema = []
    this.selectedDocuments = []
    this.actionButtonLoading = false;
    this.uploadModal = true
    this.getAllCategories()
  }

  protected popDocument(id: any): void {
    this.selectedDocuments.splice(id, 1);
  }
  protected popFiles(): void {
    this.selectedSchema = []
  }

  protected uploadDocuments(): void {
    this.actionButtonLoading = true;
    this.isDocumentsUploadError = false;
    let categoryUuid = this.uploadForm.get('uploadCategory').value?.uuid
    let ragType = this.uploadForm.get('ragType').value?.value
    let formData = new FormData();
    if (this.selectedSchema.length > 0) {
      formData.append("schema", this.selectedSchema[0])
    }
    if (this.selectedDocuments.length > 0) {
      for (var i = 0; i < this.selectedDocuments.length; i++) {
        formData.append("file", this.selectedDocuments[i]);
      }
    }
    const observableTemp = this.genAIService.postDocument(formData, categoryUuid, ragType).subscribe({
      next: (response: any) => {
        this.isDocumentsUploadError = false;
        if (response != null) {
          this.actionButtonLoading = false;
          this.selectedDocuments = [];
          this.selectedSchema = []
          this.uploadModal = false;
          this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: 'Document Uploaded Successfully' });
          let sourceType = this.genAIForm.get('sourceType').value?.value
          this.getAllLatestDocuments(sourceType)
        } else {
          this.actionButtonLoading = false;
        }
      }, error: (err: any) => {
        this.actionButtonLoading = false;
        this.isDocumentsUploadError = true;
        this.errorTitle = 'Operation Failed';
        this.errorContent = err.error;
        this.messageHead = 'Operation Failed';
      }
    });
  }

  protected onNodeDblClick(event: any):void {
    console.log("Inside Node Double Click")
  }


  protected onChangeSourceName(): void {
    this.documentArray = []
    this.chatConversationDataArray = []
  }

  protected windowMaximize(): void {
    this.isMaximized = false;
    this.layoutService.onMenuToggle()
  }

  protected windowMinimize(): void {
    this.isMaximized = true
    this.layoutService.onMenuToggle()
  }

  protected refreshClick(): void {
    this.documentArray = []
    this.chatConversationDataArray= []
    this.genAIForm.get('sourceType').setValue({name: 'DOCUMENT', value: 'document'})
    let sourceType = this.genAIForm.get('sourceType').value?.value
    this.getAllLatestDocuments(sourceType)
    this.getAllCategories()
  }

}