import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SidebarAccordionComponent } from 'ng-sidebar-accordion';
import { Subscriber, Subscription } from 'rxjs';
import { GraphpodResultView } from '../shared/models/API/graphpod-result-view.model';
import { VisNetworkComponent } from '../shared/components/charts/vis-network/vis-network.component';
import { LeafletMapComponent } from "../shared/components/charts/leaflet-map/leaflet-map.component";
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as viz from 'vis-network/dist/vis-network.js'
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../shared/services/helper.service';
import { SubjectService } from '../shared/services/subject.service';
import * as _ from 'underscore';
import { LinkAnalysisService } from './link-analysis.service';
import { AppConfig, LayoutService } from '../layout/service/app.layout.service';



@Component({
  selector: 'app-link-analysis',
  templateUrl: './link-analysis.component.html',
  styleUrl: './link-analysis.component.scss'
})
export class LinkAnalysisComponent implements OnInit, OnDestroy {

  protected nodeDetilsForm: FormGroup;
  protected nodeDetails = { label: true };
  protected isMaximized: boolean = false
  protected edgesDetailsForm: FormGroup;
  protected edgeDetails = { label: true };

  protected miscDetailsForm: FormGroup;
  protected controlPanel: boolean = false;
  protected range: boolean = false;
  protected limit: number = 500;

  protected activeIndex: number = 0;
  protected isDisableSlider: boolean = true;
  protected isStartDateShow: boolean = true;
  protected isEndDateShow: boolean = true;
  protected constantStartDate: any;
  protected constantEndDate: any;
  protected rangeStart: any;
  protected rangeEnd: any;
  protected startDate: any;
  protected endDate: any
  protected rangeValues: number[] = [];
  protected isShowRange: boolean = false
  protected uuid: any
  protected allAnalysis: any[];
  protected selectedAnalysis: any;
  protected graphpodMeta: any;
  protected graphData: any;
  protected isRunBtnDisable: boolean = true;
  protected isAnalysisSelected: boolean = false;
  protected isShowGraphAnalysis: boolean = false;
  protected breadcrumb: { title: string; url: boolean; }[];
  protected isGAnSelected: boolean;
  protected linkAnalysisResult: GraphpodResultView;
  protected isLinkAnalysisError: boolean = false;
  protected linkAnalysisErrorContent: string;
  protected errorTitle: string = 'Operation Failed';
  protected errorContent: string = '';
  protected displayMaximizable: boolean;
  // themeConfig: ThemeConfig;
  protected themeConfig: AppConfig;

  protected allSmooths = ["dynamic", "continuous", "discrete", "diagonalCross", "straightCross", "horizontal", "vertical", "curvedCW", "curvedCCW", "cubicBezier"];
  protected allDirections = ["UD", "DU", "LR", "RL"];
  protected allSortMethods = ["hubsize", "directed"];
  protected colors = ["#FFE081", "#C990C0", "#F79767", "#57C7E3", "#F16667", "#D9C8AE", "#8DCC93", "#4C8EDA", "#FFC454", "#DA7194", "#569480", "#848484", "#D9D9D9"];
  protected nodeProperty = [];
  protected nodeSizes = [10, 15, 20, 25, 30, 35];
  protected edgeSize = [1, 2, 4, 6, 8, 10, 12, 14];
  protected edgeProperty = [];
  protected edgeLableActive: number;
  protected nodeLableActive :number |undefined;
  protected activeAttrName: string | undefined;
  protected icons: any;
  protected isIconIsHierarchical: boolean = true;
  protected panelTitle: string = "Select Analysis";
  protected popoverDetail = { type: 'node', linkType: "color", key: null, isOpen: false };
  protected nodeKeysCount: any;
  protected nodes: viz.DataSet;
  protected edges: any;
  protected edgeKeysCount: any = [];
  private allIcons: any;
  protected formVisible: boolean = false;
  protected formGroup: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    desc: new FormControl(''),
    graph: new FormControl('', [Validators.required]),
    param: new FormControl(''),
    cypher: new FormControl('', [Validators.required])
  })
  protected graphList = [];
  protected paramList = [];
  protected paramListDialog: boolean;
  protected editDialog: boolean = false;
  protected paramDialogControl: string;
  protected paramDialogList = [];
  protected createClicked: boolean;
  protected editClicked: boolean;
  protected loading: boolean = false;
  protected vizOption: any = { manipulation: { enabled: false } };
  protected isAnalysisSubmitError: boolean = false;
  protected active: any;
  protected isMapView:boolean=false;
  protected isNetworkView:boolean=true;
  private subscriptions: Subscription[] = [];
  private panelOpen: any;
  private networkOption: any;

  @ViewChild('rightAccordion') accordion: SidebarAccordionComponent;
  @ViewChild("child") child: VisNetworkComponent;
  @ViewChild("p") popover: NgbPopover;
  @ViewChild('cardElementRef') protected cardElementRef: ElementRef;
  @ViewChild('leafletMapRef') protected leafletMapRef:LeafletMapComponent;

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private helperService: HelperService,
    private linkAnalysisService: LinkAnalysisService,
    private subjectService: SubjectService,
    private layoutService: LayoutService) {

    // this.themeConfig = NextConfig.config;
    this.networkOption = { edges: { smooth: {} } };

    // const observableTemp = this.subjectShareService.themeBehaviour.asObservable().subscribe({
    //   next: (response: ThemeConfig) => {
    //     this.themeConfig = null;
    //     this.themeConfig = response;
    //   }
    // });
    // this.addSubscribe(observableTemp);

    const observableTemp = this.subjectService.themeBehaviour.asObservable().subscribe({
      next: (response: AppConfig) => {
        this.themeConfig = null;
        this.themeConfig = response;
      }
    });
    this.addSubscribe(observableTemp);
  }

  ngOnInit(body?: any, nodeId?: string): void {
    this.breadcrumb = [{ title: 'Link Analysis', url: false }]
    this.icons = this.linkAnalysisService.getAllIcon();
    this.allIcons = _.clone(this.linkAnalysisService.getAllIcon());
    this.getAllLatestAnalysis("graphanalysis", "Y");
    this.getParamList();
    this.getGraphList();

    const today = new Date();
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    console.log(nextDay);

    this.rangeStart = 0;
    this.rangeEnd = 730;

    this.rangeValues = [this.rangeStart, this.rangeEnd];
    console.log(this.rangeValues)

    const initialDate = new Date(today);
    initialDate.setFullYear(today.getFullYear() - 2);
    const stableStartTime = initialDate.getTime() + this.rangeValues[0] * 24 * 60 * 60 * 1000;
    const stableEndTime = initialDate.getTime() + this.rangeValues[1] * 24 * 60 * 60 * 1000;

    this.constantStartDate = this.formatDate(new Date(stableStartTime));
    this.constantEndDate = this.formatDate(new Date(stableEndTime));
    this.networkOption.edges.smooth.type = "dynamic";

    this.nodeDetilsForm = this.formBuilder.group({
      label: [this.nodeDetails.label]
    });

    this.nodeDetilsForm.get('label').valueChanges.subscribe((value) => {
      this.onChangeNodeLabel(value);
    });

    this.edgesDetailsForm = this.formBuilder.group({
      label: [this.edgeDetails.label],
      length: [this.networkOption.edges.length]
    });

    this.edgesDetailsForm.get('label').valueChanges.subscribe((value) => {
      this.onChangeEdgeLabel(value);
    })

    this.edgesDetailsForm.get('length').valueChanges.subscribe((value) => {
      this.networkOption.edges.length = value;
      this.child.updateNetworkOption(this.networkOption)
    })


    this.miscDetailsForm = this.formBuilder.group({
      controlPanel: [this.controlPanel],
      range: [this.range],
      limit: [this.limit],
      roundness: [this.networkOption.edges.smooth.roundness],
      direction: [this.networkOption?.layout?.hierarchical.direction]
    })
    this.miscDetailsForm.get('controlPanel').valueChanges.subscribe(value => {
      this.controlPanel = value;
    })

  }

  protected mapView():void{
    this.isMapView=true;
    this.isNetworkView=false;
  }

  protected networkView ():void{
    this.isMapView=false;
    this.isNetworkView=true;
  }

  protected analysisCreateForm: FormGroup = new FormGroup({
    name: new FormControl(undefined, [Validators.required]),
  });

  protected onTabChange(event: any) {
    switch (event.index) {
      case 0:
        this.onClickNodePopover('color');
        break;
      case 1:
        this.onClickNodePopover('size');
        break;
      case 2:
        this.onClickNodePopover('icon');
        break;
      case 3:
        this.onClickNodePopover('label');
        break;
      default:
        break;
    }
  }




  protected toggleEdgeLabel(event: any) {
    const value = event.checked;
    this.onChangeEdgeLabel(value)
  }

  protected toggleLabel(event: any) {
    const value = event.checked;
    this.onChangeNodeLabel(value);
  }

  protected onSlide(event: any, body?: any): void {
    if (this.rangeValues[0] >= this.rangeValues[1]) {
      // Adjust the start value to be less than the end value
      this.rangeValues[0] = this.rangeValues[1] - 1;
    }

    this.updateDatesValues(body);
  }

  private updateDatesValues(body?: any): void {
    this.spinner.show("graphanalysisreload");
    this.isShowGraphAnalysis = false;


    console.log(this.uuid)
    const today = new Date();
    const initialDate = new Date(today);
    initialDate.setFullYear(today.getFullYear() - 2);

    const startTimestamp = initialDate.getTime() + this.rangeValues[0] * 24 * 60 * 60 * 1000;
    const endTimestamp = initialDate.getTime() + this.rangeValues[1] * 24 * 60 * 60 * 1000;

    this.startDate = this.formatDate(new Date(startTimestamp));
    this.endDate = this.formatDate(new Date(endTimestamp));

    this.getGraphAnalysis(this.uuid, '', '', this.startDate, '', this.endDate, this.limit, body, '');

  }

  protected slideChangeValues(): void {

    const today = new Date();
    const initialDate = new Date(today);
    initialDate.setFullYear(today.getFullYear() - 2);

    const startTimestamp = initialDate.getTime() + this.rangeValues[0] * 24 * 60 * 60 * 1000;
    const endTimestamp = initialDate.getTime() + this.rangeValues[1] * 24 * 60 * 60 * 1000;

    this.startDate = this.formatDate(new Date(startTimestamp));
    this.endDate = this.formatDate(new Date(endTimestamp));

    let compareStartDate = new Date(this.startDate);

    let compareconstantStartDate = new Date(this.constantStartDate);

    compareconstantStartDate.setDate(compareconstantStartDate.getDate() + 50);

    let compareEndDate = new Date(this.endDate);
    let compareconstantEndDate = new Date(this.constantEndDate);
    compareconstantEndDate.setDate(compareconstantEndDate.getDate() - 50);

    if (compareStartDate > compareconstantStartDate) {
      if (compareStartDate > new Date(compareconstantEndDate.getDate() - 50)) {
        this.isEndDateShow = true;
      }
      else {
        this.isEndDateShow = false;
      }
      this.isStartDateShow = true;
    }
    else {
      this.isStartDateShow = false;
    }

    if (compareEndDate < compareconstantEndDate) {
      if (compareEndDate > new Date(compareconstantStartDate.getDate() + 50)) {
        this.isStartDateShow = true;
      }
      else {
        this.isStartDateShow = false;
      }
      this.isEndDateShow = true;
    }
    else {
      this.isEndDateShow = false;
    }
  }

  protected HandleEvent() {
    this.isDisableSlider = false
  }

  protected calculateLeftPosition(sliderValue: any): number {

    const minValue = 0;
    const maxValue = 730;

    const percentage = ((sliderValue - minValue) / (maxValue - minValue)) * 100;

    return percentage;


  }
  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  protected onLimitChange(body?: any) {
    this.spinner.show("graphanalysisreload");
    this.isShowGraphAnalysis = false;
    this.isLinkAnalysisError = false;
    setTimeout(() => {
      this.getGraphAnalysis(this.uuid, '', '', '', '', '', this.miscDetailsForm.get('limit').value, body, '');
      this.spinner.hide("graphanalysisreload");
    }, 2000);
  }


  protected onSelectAnalysis() {
    this.isRunBtnDisable = true;
    if (this.selectedAnalysis) {
      this.isRunBtnDisable = false;
      this.isShowGraphAnalysis = false;
      this.panelTitle = this.selectedAnalysis.name;
      this.uuid = this.selectedAnalysis.uuid
      this.runGraphAnalysis()
      this.accordion.close('right');
    }
  }

  private runGraphAnalysis() {
    this.isAnalysisSelected = true;
    this.isGAnSelected = true;
    if (this.selectedAnalysis['paramList']) {
      this.paramListDialog = true;
    }
    else {

      this.getGraphpodByGraphAnalysis(this.selectedAnalysis["uuid"]);
    }

  }

  protected refreshAnalysis() {
    this.panelClose()
    this.isShowGraphAnalysis = false;
    this.runGraphAnalysis();
  }


  protected panelToggle(): any {
    if (this.panelOpen) {
      this.panelClose();
    }
    else {
      this.accordion.open('all', 0);
      this.panelOpen = true;
    }
    this.networkOption = this.child.getNetworkOption();
    this.nodes = this.child.nodes.get();
    let nodeKeysCount = this.helperService.getCountByKey(this.child.nodes, "nodeType");
    this.nodeKeysCount = this.helperService.convertObjectToArray(nodeKeysCount);
    this.edges = this.child.edges.get();
    let edgeKeysCount = this.helperService.getCountByKey(this.child.edges, "label");
    this.edgeKeysCount = this.helperService.convertObjectToArray(edgeKeysCount);
  }

  protected download() {
    this.child.downloadVizNetwork();
  }

  protected panelClose(): any {
    this.accordion.close('right');
    this.panelOpen = false;
  }


  // Node Methods

  protected nodeToggle = function (item: any) {
    if (item != null && item.hidden == false) {
      for (let i = 0; i < this.nodes.length; i++) {
        if (item.key == this.nodes[i].nodeType) {
          this.nodes[i].hidden = true;
        }
      }
    }

    if (item != null && item.hidden == true) {
      for (let i = 0; i < this.nodes.length; i++) {
        if (item.key == this.nodes[i].nodeType) {
          this.nodes[i].hidden = false;
        }
      }
    }
    item.hidden = !item.hidden;
    this.child.onChangeNodesAndEdges(this.nodes, this.edges);
  }

  protected getNodeBGColor(item: any) {
    let bgDarkMap = {
      "#6c757d": { "dark_color": "#3f454a" },
      "#078c71": { "dark_color": "#078c71" },
      "#dc3545": { "dark_color": "#690711" },
      "#006df0": { "dark_color": "#034ba1" },
      "#f4516c": { "dark_color": "#bf3b51" },
      "#36a3f7": { "dark_color": "#2778b8" },
      "#ffc107": { "dark_color": "#a37c05" },
      "#f16667": { "dark_color": "#a84344" },
      "#ffe08": { "dark_color": "#8a7842" },
      "#c990c0": { "dark_color": "#996b92" },
      "#57c7e3": { "dark_color": "#607184" },
      "#867760": { "dark_color": "#615645" },
      "#8dcc93": { "dark_color": "#4d7551" },
      "#795965": { "dark_color": "#523c44" },
      "#607184": { "dark_color": "#3a4552" },
      "#795863": { "dark_color": "#543d45" },
      "#f79767": { "dark_color": "#965c3f" },
      "#ffe081": { "dark_color": "#9c894f" },
      "#d9c8ae": { "dark_color": "#b3a38b" },
      "#ffc454": { "dark_color": "#d1a145" },
      "#da7194": { "dark_color": "#b05b78" },
      "#569480": { "dark_color": "#447565" },
      "#848484": { "dark_color": "#636161" },
      "#d9d9d9": { "dark_color": "#adacac" },
      "#299882": { "dark_color": "#1a6355" },
      "#4c8eda": { "dark_color": "#386a80" },
    };
    let nodeTemp = _.findWhere(this.nodes, { nodeType: item });
    let style = {};
    if (nodeTemp.color != null) {
      //   style["background-color"] = nodeTemp.color.background
      // } else {
      if (nodeTemp.color.background.toLowerCase()) {
        style["background-color"] = nodeTemp.color.background.toLowerCase()
      }
      else {
        style["background-color"] = "#D2E5FF";
      }
    }
    if (nodeTemp != null && nodeTemp.hidden == true) {
      style["background-color"] = "#696969";
    }
    return style
  }

  protected onClickNodePopover(linkType: string) {
    this.popoverDetail.linkType = linkType;
    if (linkType == 'label' && this.popoverDetail.type == "node") {
      for (let i = 0; i < this.nodes.length; i++) {
        if (this.popoverDetail.key == this.nodes[i].nodeType) {
          this.nodeProperty = this.nodes[i].nodeProperties.map((item: any) => item.name);
          this.nodeProperty.splice(0, 0, "<id>");
              const matchingNode = this.graphpodMeta.nodeInfo.find(node => node.nodeType === this.popoverDetail.key);
              if (matchingNode) {
                  const attrName = matchingNode.nodeName.attrName;
                  const labelIndex = this.nodeProperty.findIndex(label => label === attrName);
                  if (labelIndex !== -1) {
                      this.nodeLableActive = labelIndex;
                      this.activeAttrName = attrName; 
                  }
              } else {
                  this.nodeLableActive = null; 
                  this.activeAttrName = undefined;
              }
          break;
        }
      }
    }
    if (linkType == 'label' && this.popoverDetail.type == "edge") {
      for (let i = 0; i < this.edges.length; i++) {
        if (this.popoverDetail.key == this.edges[i].edgeType) {
          this.edgeProperty = this.edges[i].edgeProperties.map((item: any) => item.name);
          this.edgeProperty.splice(0, 0, "<id>");
          this.edgeProperty.splice(1, 0, "<type>");
        }
      }
    }
  }

  protected nodePopoverShown(node: any, index: any) {
    this.nodeKeysCount[index].isPopoverOpen = true;
    this.isIconIsHierarchical = false;
  }

  protected nodePopoverHidden(node: any, index: any) {
    this.nodeKeysCount[index].isPopoverOpen = false;
    this.popoverDetail.isOpen = this.isNodePopoverOpen();
    if (!this.popoverDetail.isOpen)
      this.isIconIsHierarchical = true;
  }

  protected onClickSelectNode(key: string, linkType: string) {
    this.popoverDetail.key = key;
    console.log(this.popoverDetail.key,'colorrrrrrr')
    this.popoverDetail.type = "node";
    this.popoverDetail.linkType = linkType;
  }

  protected applyNodeColor = function (color: string, key: string) {
    for (let i = 0; i < this.nodes.length; i++) {
      if (key == this.nodes[i].nodeType) {
        if (this.nodes[i].color) {
          this.nodes[i].color.background = color;
          /*let borderColor =null;
          if( typeof borderColor !='undefined'){
            this.nodes[i].color.border=borderColor.dark_color; 
          }else{
            this.nodes[i].color.border="black";
          }*/

        }
        else {
          this.nodes[i].color = {};
          this.nodes[i].color.background = color;
        }
      }
    }
    this.child.onChangeNodesAndEdges(this.nodes, this.edges);
  }

  protected applyNodeSize = function (size: number, key: string) {
    for (let i = 0; i < this.nodes.length; i++) {
      if (key == this.nodes[i].nodeType) {
        if (this.nodes[i].size)
          this.nodes[i].size = size;
      }
    }
    this.child.onChangeNodesAndEdges(this.nodes, this.edges);
  }

  protected onSearchString(searchStr: string) {
    this.icons = this.allIcons.filter(function (item: string) {
      return JSON.stringify(item).toLowerCase().includes(searchStr);

    })
  }

  protected applyNodeIcon = function (code: string, key: string) {
    for (let i = 0; i < this.nodes.length; i++) {
      if (key == this.nodes[i].nodeType) {
        if (this.nodes[i].icon) {
          this.nodes[i].icon.code = code;
        }
      }
    }
    this.child.onChangeNodesAndEdges(this.nodes, this.edges);
  }

  protected applyNodeLabel(label: any, key: string, index: any) {
    for (let i = 0; i < this.nodes.length; i++) {
      if (key == this.nodes[i].nodeType) {
        if (this.nodes[i].label) {
          if (label !== "<id>") {
            let index = this.helperService.isItemExist(this.nodes[i].nodeProperties, label, "name");
            this.nodes[i].label = index != -1 ? this.nodes[i].nodeProperties[index].value : "";
            this.nodes[i].nodeName = index != -1 ? this.nodes[i].nodeProperties[index].value : "";
          } else {
            this.nodes[i].label = this.nodes[i].id;
            this.nodes[i].nodeName = this.nodes[i].id;
          }
        }
      }
    }
    this.nodeLableActive = index;
    this.activeAttrName = label;
    this.child.onChangeNodesAndEdges(this.nodes, this.edges);
  }

  private onChangeNodeLabel(value: boolean) {
    if (value) {
      this.networkOption.nodes.font.size = 15;
    } else {
      this.networkOption.nodes.font.size = 0;
    }
    this.child.updateNetworkOption(this.networkOption);
  }

  protected styleNodeSize = function (size: number) {
    let style = { width: '', height: '', margin: '' };
    style.width = (10 + size) + "px";
    style.height = (10 + size) + "px";
    style.margin = "0px 27px 5px 0px";
    return style;
  }

  private isNodePopoverOpen() {
    let result = false;
    if (this.nodeKeysCount != null && this.nodeKeysCount.length > 0) {
      for (let i = 0; i < this.nodeKeysCount.length; i++) {
        if (typeof this.nodeKeysCount[i].isPopoverOpen != "undefined" && this.nodeKeysCount[i].isPopoverOpen) {
          result = true;
          break;
        }
      }
    }
    return result;
  }

  // Edge Methods

  protected applyEdgeSize = function (size, key) {
    for (let i = 0; i < this.edges.length; i++) {
      if (key == this.edges[i].edgeType) {
        this.edges[i].width = size;
      }
    }
    this.child.onChangeNodesAndEdges(this.nodes, this.edges);
  }
  protected applyEdgeLabel = function (label: any, key: string, index) {
    this.edgeLableActive = index;
    for (let i = 0; i < this.edges.length; i++) {
      if (key == this.edges[i].edgeType) {
        if (this.edges[i].label) {
          if (label != "<id>" && label != "<type>") {
            let index = this.helperService.isItemExist(this.edges[i].edgeProperties, label, "name");
            this.edges[i].label = index != -1 ? this.edges[i].edgeProperties[index].value : "";
          } else if (label == "<id>") {
            this.edges[i].label = this.edges[i].id;
          }
          else if (label == "<type>") {
            this.edges[i].label = this.edges[i].edgeType;
          }
        }
      }
    }
    this.child.onChangeNodesAndEdges(this.nodes, this.edges);
  }

  protected styleEdgeSize = function (size: number) {
    let style = { width: '', height: '' };
    style.width = "100%";
    //style.height = (1 + size) + "px";
    style.height = ((3 * size) + size) + "px";
    style["border-radius"] = "0";
    style["border-left"] = (1 + size) + "px solid #bbb";
    style["text-align"]; "center";
    style["display"] = "inline-block";
    //style["transform"]="rotate(90deg)";
    //style["margin-top"]=((1*size) + size) + "px";;

    return style;
  }

  protected applyEdgeColor = function (color: string, key: string) {
    for (let i = 0; i < this.edges.length; i++) {
      if (key == this.edges[i].edgeType) {
        if (this.edges[i].color) {
          this.edges[i].color.color = color;
        }
        else {
          this.edges[i].color = {};
          this.edges[i].color.color = color;
        }
      }
    }
    this.child.onChangeNodesAndEdges(this.nodes, this.edges);
  }

  protected edgePopoverShown(edge: any, index: any) {
    this.edgeKeysCount[index].isPopoverOpen = true;
    this.isIconIsHierarchical = false;
  }

  protected edgePopoverHidden(edge: any, index: any) {
    this.edgeKeysCount[index].isPopoverOpen = false;
    this.popoverDetail.isOpen = this.isEdgePopoverOpen();
    if (!this.popoverDetail.isOpen)
      this.isIconIsHierarchical = true;
  }


  protected onClickSelectEdge(key: string, linkType: string) {
    this.popoverDetail.key = key;
    this.popoverDetail.type = "edge";
    this.popoverDetail.linkType = linkType
  }


  protected getEdgeBGColor(item: any) {
    let edgeTemp = _.findWhere(this.edges, { edgeName: item });
    if (edgeTemp != null) {
      let style = {
        "background-color": edgeTemp.color ? edgeTemp.color.color : 'inherit',
      };
      if (edgeTemp != null && edgeTemp.hidden == true) {
        style["background-color"] = "#696969";
      }
      return style;
    }
  }

  protected onChangeEdgeSmooth() {
    console.log(this.child.setNetworkOption(this.networkOption));
  }

  private onChangeEdgeLabel(value: boolean) {
    if (value) {
      this.networkOption.edges.font.size = 15;
    } else {
      this.networkOption.edges.font.size = 0;
    }
    this.child.updateNetworkOption(this.networkOption);
  }

  protected onChangeEdgeLength() {
    this.child.updateNetworkOption(this.networkOption);
  }

  protected edgeToggle = function (item: any) {
    if (item != null && item.hidden == false) {
      for (let i = 0; i < this.edges.length; i++) {
        if (item.key == this.edges[i].label) {
          this.edges[i].hidden = true;
        }
      }
    }
    if (item != null && item.hidden == true) {
      for (let i = 0; i < this.edges.length; i++) {
        if (item.key == this.edges[i].label) {
          this.edges[i].hidden = false;
        }
      }
    }
    item.hidden = !item.hidden;
    this.child.onChangeNodesAndEdges(this.nodes, this.edges);
  }

  private isEdgePopoverOpen() {
    let result = false;
    if (this.edgeKeysCount != null && this.edgeKeysCount.length > 0) {
      for (let i = 0; i < this.edgeKeysCount.length; i++) {
        if (typeof this.edgeKeysCount[i].isPopoverOpen != "undefined" && this.edgeKeysCount[i].isPopoverOpen) {
          result = true;
          break;
        }
      }
    }
    return result;
  }



  //private methods

  private getAllLatestAnalysis(type: string, active: string): any {
    const observableTemp = this.linkAnalysisService.getAllLatest().subscribe({
      next: (response) => {
        this.allAnalysis = [];
        response = response.sort((a, b) => {
          if (a.displayName < b.displayName) {
            return -1;
          }
        });
        this.allAnalysis = response;
        console.log(this.allAnalysis)

      },
      error: (response) => {
      }
    });
    this.addSubscribe(observableTemp);
  }

  private getGraphpodByGraphAnalysis(uuid: string, body?: any) {
    this.spinner.show("graphanalysis")
    this.isRunBtnDisable = true;
    this.loading = true;
    const observableTemp = this.linkAnalysisService.getGraphpodByGraphAnalysis(uuid).subscribe({
      next: (response) => {
        this.graphpodMeta = response;
        if (body)
          this.getGraphAnalysis(this.selectedAnalysis["uuid"], "", "", "", '', "", 500, body, "")
        else
          this.getGraphAnalysis(this.selectedAnalysis["uuid"], "", "", "", '', "", 500, null, "")
      },
      error: (response) => {
        this.isRunBtnDisable = false;
        this.loading = false;
        this.spinner.hide("graphanalysis");
        this.errorTitle = 'Operation Failed';
        this.errorContent = response.error;
        this.isGAnSelected = false;
        this.isLinkAnalysisError = true;
        this.linkAnalysisErrorContent = response != null && response.error != null ? response.error : response;
      }
    });
    this.addSubscribe(observableTemp);
  }
  private getGraphAnalysis(uuid: string, nodeType: string, degree: string, startDate: string, edge: string, endDate: string, limit: number, body?: any, nodeId?: string,) {
    const observableTemp = this.linkAnalysisService.getGraphAnalysis(uuid, "graphanalysis", nodeType, degree, startDate, edge, endDate, limit, body, nodeId,).subscribe({
      next: (response: GraphpodResultView) => {
        this.graphData = response;
        this.loading = false;
        this.spinner.hide("graphanalysisreload");
        this.spinner.hide("graphanalysis");
        this.isShowGraphAnalysis = true;
        this.isGAnSelected = false;
        this.linkAnalysisResult = response;


      },
      error: (response) => {
        this.isRunBtnDisable = false;
        this.loading = false;
        this.spinner.hide("graphanalysis");
        this.errorTitle = 'Operation Failed';
        this.errorContent = response.error;
        this.isLinkAnalysisError = true;
        this.linkAnalysisErrorContent = response != null && response.error != null ? response.error.message : response;
        this.errorContent = this.linkAnalysisErrorContent;

        this.isGAnSelected = false;
        //this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Some Error Occured' });
      }
    });
    this.addSubscribe(observableTemp)
  }
  protected showMaximizableDialog() {
    this.displayMaximizable = true;
  }
  private getParamList(): void {
    const observableTemp = this.linkAnalysisService.getAllLatestParamList().subscribe({
      next: (response: any) => {
        this.paramList = response;
      }
    });
    this.addSubscribe(observableTemp)
  }
  private getGraphList(): void {
    const observableTemp = this.linkAnalysisService.getGraphList().subscribe({
      next: (response: any) => {
        this.graphList = response;
      }
    });
    this.addSubscribe(observableTemp);
  }
  protected addOpen(): void {
    this.formVisible = true;
    this.isAnalysisSubmitError = false;
    this.formGroup.reset();
  }

  protected createSubmit(): void {
    console.log(this.formGroup.valid)
    this.createClicked = true;
    if (this.formGroup.valid) {
      let req: any = {
        cql: this.formGroup.value.cypher,
        name: this.formGroup.value.name,
        dependsOn: { ref: { uuid: this.formGroup.value.graph, type: 'graphpod' } },
        desc: this.formGroup.value.desc
      }
      if (this.formGroup.value.param) {
        req.paramList = { ref: { uuid: this.formGroup.value.param, type: 'paramlist' } };
      }
      const observableTemp = this.linkAnalysisService.createGraphAnalysis(req).subscribe({
        next: (response: any) => {
          //this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Create Successfull' });
          this.hideDialog();
          this.getAllLatestAnalysis("graphanalysis", "Y");
        },
        error: (response) => {
          this.isAnalysisSubmitError = true;
          this.errorContent = response.error;
          //this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Some Error Occured' }); 
        }
      });
      this.addSubscribe(observableTemp);
    }
  }
  protected editOpen(): void {
    this.formVisible = true;
    this.editDialog = true;
    this.isAnalysisSubmitError = false;
    const observableTemp = this.linkAnalysisService.getOneGraphAnalysis(this.selectedAnalysis.uuid, this.selectedAnalysis.version).subscribe({
      next: (response: any) => {
        this.formGroup.reset();
        if (response.paramList != null) {
          this.formGroup.patchValue({
            name: response.name,
            desc: response.desc,
            graph: response.dependsOn.ref.uuid,
            param: response.paramList.ref.uuid,
            cypher: response.cql
          })
        } else {
          this.formGroup.patchValue({
            name: response.name,
            desc: response.desc,
            graph: response.dependsOn.ref.uuid,
            param: '',
            cypher: response.cql
          })
        }
      },
      error: (response) => {
        this.isAnalysisSubmitError = true;
        this.errorContent = response.error;
        //this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Some Error Occured' }); 
      }
    });
    this.addSubscribe(observableTemp);
  }
  protected hideDialog(): void {
    this.editDialog = false;
    this.formVisible = false;
    this.createClicked = false;
    this.editClicked = false;
  }
  protected paramDialogChange(): void {
    console.log(this.paramDialogControl)
    const observableTemp = this.linkAnalysisService.getParamList(this.paramDialogControl).subscribe({
      next: (response: any) => {
        console.log(response)
        this.paramDialogList = response;
      }
    });
    this.addSubscribe(observableTemp);
  }
  protected editSubmit(): void {
    console.log(this.formGroup.value)
    this.isAnalysisSubmitError = false;
    this.editClicked = true;
    if (this.formGroup.valid) {
      let req: any = {
        cql: this.formGroup.value.cypher,
        name: this.formGroup.value.name,
        dependsOn: { ref: { uuid: this.formGroup.value.graph, type: 'graphpod' } },
        desc: this.formGroup.value.desc,
        uuid: this.selectedAnalysis['uuid']
      }
      if (this.formGroup.value.param) {
        req.paramList = { ref: { uuid: this.formGroup.value.param, type: 'paramlist' } };
      } else {
        this.selectedAnalysis['paramList'] = null;
      }

      const observableTemp = this.linkAnalysisService.editGraphAnalysis(req).subscribe({
        next: (response: any) => {
          // this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Update Successfull' });
          this.hideDialog();
          this.refreshAnalysis();
        },
        error: (response) => {
          this.isAnalysisSubmitError = true;
          this.errorContent = response.error;
          //this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Some Error Occured' }); 
        }
      });
      this.addSubscribe(observableTemp);
    }
  }
  protected paramDialogSubmit(): void {
    let req = {
      paramListInfo: []
    }
    this.paramDialogList.forEach(element => {
      let item = {
        paramId: element.paramId,
        paramType: element.paramType,
        paramValue: element.paramValue,
        ref: element.ref
      }
      req.paramListInfo.push(item);
    });
    this.paramListDialogClose();
    this.getGraphpodByGraphAnalysis(this.selectedAnalysis["uuid"], req);
  }
  protected paramListDialogClose(): void {
    this.paramListDialog = false;
  }
  protected onNodeDblClick(event: any) {
    // this.spinner.show("graphanalysisreload");
    let degree = '1'
    if (event.degree)
      degree = event.degree
    this.getGraphAnalysis(this.selectedAnalysis["uuid"], event.nodeType, degree, "", event.type, "", 500, null, event.id)
  }

  protected onChangeRange(event: any): void {
    this.isShowRange = true;
    this.isDisableSlider = !this.isDisableSlider;
    if (this.isShowRange) {
      this.rangeValues = [this.rangeStart, this.rangeEnd]
    }
  }

  private addSubscribe(subscriber: any): void {
    if (subscriber != null && subscriber instanceof Subscriber) {
      this.subscriptions.push(subscriber);
    }
  }

  protected windowMaximize():void{
   this.panelClose();
   this.layoutService.onMenuToggle(true);
   this.isMaximized = true;
   let maxHeight = 'calc(100vh - 15rem)'
   if(this.isNetworkView)
      this.child.setMaxHeight(maxHeight);
    if(this.isMapView)
      this.leafletMapRef.setMaxHeight();
  }
  
  protected windowMinimize():void{
    this.isMaximized = false;
    let minHeight = 'calc(100vh - 28rem)'
    if(this.isNetworkView)
      this.child.setMinHeight(minHeight);
    if(this.isMapView)
       this.leafletMapRef.setMinHeight();
   }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

}
