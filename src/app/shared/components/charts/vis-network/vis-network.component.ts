
import {
  Component, ElementRef, Input, OnInit, Output, ViewChild, EventEmitter, OnChanges,
  SimpleChanges, IterableDiffers, DoCheck, KeyValueDiffers, KeyValueChanges, ViewEncapsulation,
  Renderer2, OnDestroy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';

import * as viz from 'vis-network/dist/vis-network.js'

import { VisNetworkService } from './vis-network.service';

import { GraphpodResultView } from 'src/app/shared/models/API/graphpod-result-view.model';
import { Edges, IVizNetworkStyle, Nodes, VizNetworkResult } from './viz-network-model';
import { IGraphpod } from 'src/app/shared/models/API/graphpod.model';
import { ThemeConfig } from 'src/app/app-config';
import html2canvas from 'html2canvas';
import { ContextMenu } from "primeng/contextmenu";
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { HelperService } from 'src/app/shared/services/helper.service';
import { GraphNodeDML } from 'src/app/shared/models/API/graph-node-dml.model';
import { GraphEdgeDML } from 'src/app/shared/models/API/graph-edge-dml.model';
import { Subscriber, Subscription } from 'rxjs';
import { AppConfig } from 'src/app/layout/service/app.layout.service';


@Component({
  selector: 'app-vis-network',
  templateUrl: './vis-network.component.html',
  styleUrls: ['./vis-network.component.scss'],
  encapsulation: ViewEncapsulation.None, 
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(0,0,0)'
      })),
      state('out', style({
        transform: 'translate3d(100%, 0, 0)'
      })),
      transition('in => out', animate('550ms ease-in-out')),
      transition('out => in', animate('550ms ease-in-out'))
    ]),
  ]
})
export class VisNetworkComponent implements OnChanges, DoCheck, OnInit, OnDestroy {

  private nodeFormBuilder: FormGroup | any;
  private edgeFormBuilder: FormGroup | any;

  nodeBackGroundMappingColor = this.visNetworkService.bgDarkMap
  @Input('graphResult') vizGraphResult: GraphpodResultView;
  @Input('graphpodMeta') graphpodMeta: IGraphpod;
  @Input('vizNetworkHeightObj') vizNetworkHeightObj: IVizNetworkStyle;
  @Input('option') vizOption: any;
  @Input('dsId') dsId: any;
  @Input('controlPanel') controlPanel: boolean = false;
  @Output() nodeDblClick: EventEmitter<Nodes> = new EventEmitter<Nodes>();
  @ViewChild('network') el: ElementRef
  @Input('theam') theam: AppConfig;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('downloadLink') downloadLink: ElementRef;
  @ViewChild("cm") cm: ContextMenu;
  isCMMenuShow: boolean=false;
  @ViewChild("cm2") cm2: ContextMenu;
  sidepanelState = 'out';
  vizGraphResultDiffer: any;
  theamDiffer: any;
  fontColor: string = '#fff';
  addNodeDialog: boolean = false;
  @Input()
  isHierarchical: boolean = false;
  protected zoomStep = 0.3;
  isHierarchicalGraph: boolean = false;
  vizDefailtOption: any;
  networkInstance: any;
  isShowRightSidePanel: boolean = false;
  vizResult: VizNetworkResult
  nodes: viz.DataSet;
  edges: viz.DataSet;
  rshPanel: any;
  fromGenAI: boolean = false;
  nodeEventTimer: any;
  nodeRightClicked: any;
  edgeRightClicked: any;
  nodesSelected: Array<any> = [];
  protected isMaximized: boolean = false
  vizNetworkStyleObj: IVizNetworkStyle = {
    'height': 'calc(100vh - 28rem)'
  }
  // Array For Unsubscription Of Observable
  subscriptions: Subscription[] = [];
  hierarchicalmenuItems: MenuItem[] = [
    {
      label: "Add",
      icon: "pi pi-fw pi-plus",
    },
    {
      label: "Collapse",
      icon: "pi pi-fw pi-trash",
    },
    {
      label: "Center",
      icon: "pi pi-fw pi-align-center",
    },
  ];
  items: MenuItem[] = [
    {
      label: "Show Details",
      icon: "pi pi-fw pi-info",
      command: (event) => this.showDetails(this.nodeRightClicked, this.edgeRightClicked),
    },
    {
      label: "Hide",
      icon: "pi pi-fw pi-eye-slash",
      command: (event) => this.hide(),
    },
    {
      label: "Inverse",
      icon: "pi pi-fw pi-replay",
      command: (event) => this.inverse(),
    },
    {
      label: "Degree 1",
      icon: "pi pi-fw pi-sitemap",
      command: (event) => this.degree1(this.nodeRightClicked),
    },
    {
      label: "Degree 2",
      icon: "pi pi-fw pi-sitemap",
      command: (event) => this.degree2(this.nodeRightClicked),
    },
    {
      label: "Degree 3",
      icon: "pi pi-fw pi-sitemap",
      command: (event) => this.degree3(this.nodeRightClicked),
    },
    {
      label: "Collapse",
      icon: "pi pi-fw pi-minus-circle",
      disabled: false,
      items: [{
        label: 'All',
        command: (event) => this.collapse(this.nodeRightClicked),
      },]

    },
    {
      label: "Expand",
      icon: "pi pi-fw pi-align-center",
      command: (event) => this.expand(this.nodeRightClicked),
      items: [{
        label: 'Expand All',
        icon: 'pi pi-fw pi-plus',
        command: (event) => this.expand(this.nodeRightClicked),
      }]

    },
    // {
    //     label: "Add Node",
    //     icon: "pi pi-fw pi-plus",
    //     disabled:true,
    //     command: (event) => this.addNodeDialogOpen(),
    // },
    {
      label: "Delete Node",
      icon: "pi pi-fw pi-trash",
      disabled: true,
      command: (event) => this.nodeConfirm(),
    },
    {
      label: "Edit Node",
      icon: "pi pi-fw pi-pencil",
      disabled: true,
      command: (event) => this.editNodeOpen(),
    },
  ];
  edgeItems: MenuItem[] = [
    {
      label: "Show Details",
      icon: "pi pi-fw pi-info",
      command: (event) => this.showDetails(this.nodeRightClicked, this.edgeRightClicked),
    },
    {
      label: "Edit Edge",
      icon: "pi pi-fw pi-pencil",
      disabled: true,
      command: (event) => this.editEdgeDialogOpen(),
    },
    {
      label: "Delete Edge",
      icon: "pi pi-fw pi-trash",
      disabled: true,
      command: (event) => this.deleteEdge(),
    },
  ];
  protected tableCols = [
    { field: 'attrName', header: 'Name', visible: true },
    { field: 'attrType', header: 'Type', visible: true },
    { field: 'value', header: 'Value', visible: true },
  ];
  addNodeClicked: boolean = false;
  nodeSelected: string;
  addNodeSelectedTypeId: any;
  addNodeSelectedType: any;
  xCoordinate: string;
  yCoordinate: string;
  tempId: string;
  editNodeDialog: any;
  editNodeSelectedType: any;
  editNodeSelected: any;
  addEdgeClicked: boolean = false;
  addEdgeSelectedType: any;
  addEdgeSelectedTypeId: string;
  addEdgeDialog: boolean = false;
  editEdgeSelectedType: any;
  editEdgeSelectedType2: any;
  editEdgeSelectedTypeId: string;
  editEdgeDialog: boolean = false;
  addNodeData: any;
  newEdgeNodeFrom: any;
  newEdgeNodeTo: any;
  edgeCheck: boolean;
  submitted: boolean = false;
  isError: boolean = false;
  errorTitle: any = 'Operation Failed';
  errorContent: any;
  nodeTitle: any;
  otherNodeType: any;
  edgesTypes: any[];
  constructor(private helperService: HelperService, private _iterableDiffer: IterableDiffers, private messageService: MessageService,
    private confirmationService: ConfirmationService, private _keyValueDiffers: KeyValueDiffers, private visNetworkService: VisNetworkService,
    private renderer2: Renderer2, private formBuilder: FormBuilder) {
    this.edgeFormBuilder = formBuilder.group({
      addEdges: formBuilder.array([])
    });
    this.nodeFormBuilder = formBuilder.group({
      addNodes: formBuilder.array([])
    });

  }

  ngOnInit() {
  }

  nodeConfirm() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete node ?',
      accept: () => {
        this.deleteNode()
        //Actual logic to perform a confirmation
      },
      reject: () => {
        this.confirmationService.close();
      }
    });
  }

  updateNodeProperties(type: string, node: any): void {
    this.graphpodMeta?.nodeInfo.forEach(element => {
      if (element.nodeType == type) {
        node.nodeProperties.forEach(el => {
          el.name = el.name.replace(/ /g, '')
          if (element.nodeName != null && el.name == element.nodeName.attrDispName) {
            node.nodeName = el.value
            node.label = el.value
          }
        });
        // let x = JSON.parse(node.nodeProperties)[element.nodeName.attrDispName]
      }
    });
    //console.log(node);
    if (node.color != null && this.nodeBackGroundMappingColor[node.color.background])
      node.color.border = this.nodeBackGroundMappingColor[node.color.background].dark_color
    // if (!node.color.border) {
    //     node.color.border = this.nodeBackGroundMappingColor[node.color.background].dark_color
    // }
  }
  ngOnChanges(change: SimpleChanges) {
    if(change['vizNetworkHeightObj'] && change['vizNetworkHeightObj'].firstChange){
      this.vizNetworkStyleObj.height = this.vizNetworkHeightObj?.height
    }
    if (this.controlPanel && this.el) {
      this.networkDraw(this.vizGraphResult, this.graphpodMeta, true, false, "UD");
    }
    if (change['vizGraphResult'] && change['vizGraphResult'].firstChange) {
      this.vizResult = this.visNetworkService?.convertGraphResultToVizNetwork(this.vizGraphResult, this.graphpodMeta);
      if (this.vizResult != null) {
        this.otherNodeType = this.vizResult.nodes[0].otherNodeType;
        this.vizResult.nodes.forEach(element => {
          if (!element['children'])
            element['children'] = { edges: [], nodes: [] };

          this.updateNodeProperties(element.nodeType, element)
        });
      }

    }
    else if (change['vizGraphResult'] && change['vizGraphResult'].firstChange == false) {
      if (change['vizGraphResult'].currentValue != null && change['vizGraphResult'].currentValue.nodes == null) {
        this.spinnerNodeIds.forEach((element, i) => {
          delete this.spinnerNodes[i].image
          let node = { ...this.spinnerNodes[i], ...{ icon: this.spinnerNodes[i].icon, shape: this.spinnerNodes[i].shape } }
          this.nodes.update(node);
        });
      }
      else {
        this.vizResult = this.visNetworkService?.convertGraphResultToVizNetwork(this.vizGraphResult, this.graphpodMeta);
        this.vizResult.nodes.forEach(element => {
          if (!element['children'])
            element['children'] = { edges: [], nodes: [] };

          this.updateNodeProperties(element.nodeType, element)

        });
        this.vizResult.nodes.forEach(node => {
          if (this.nodes.get([node.id]).length) {
            if (this.spinnerNodeIds.includes(node.id)) {
              delete node.image
              node = { ...node, ...{ icon: node.icon, shape: node.shape } }
              this.nodes.update(node);
            }
          }
          else {
            this.nodes.update(node);
          }
        });
      }
      this.edges.update(this.vizResult.edges);
      this.networkInstance.redraw();
    }
  }

  ngDoCheck() {
    if (this.theamDiffer) {
      const changeTheam: KeyValueChanges<string, any> = this.theamDiffer.diff(this.theam);
      if (changeTheam) {
        changeTheam.forEachChangedItem((item) => {
          if (item.key == "bodyBackground") {
            this.changeTheam(item.key, item.currentValue);
          }
        })
      }
    }
  }


  ngAfterViewInit() {
    // this.theamDiffer = this._keyValueDiffers.find(this.theam).create();
    this.networkDraw(this.vizGraphResult, this.graphpodMeta, true, false, "UD");
  }
  protected zoomIn(): void {
    const currentScale = this.networkInstance.getScale();
    const newScale = currentScale + this.zoomStep;
    this.networkInstance.moveTo({ scale: newScale });
  }

  protected zoomOut(): void {
    const currentScale = this.networkInstance.getScale();
    const newScale = currentScale - this.zoomStep;
    this.networkInstance.moveTo({ scale: newScale });
  }
  //public Method

  public networkDraw(vizGraphResult: GraphpodResultView, graphpodMeta: IGraphpod, redraw: boolean, hierarchical: boolean, direction: any) {
    var filterContainer = null;
    if (this.controlPanel) {
      filterContainer = document.getElementById("filter1");
    }
    const container = this.el.nativeElement;
    let componentThis = this;
    this.vizDefailtOption = {
      // configure: {
      //             enabled: true,
      //             filter: true,
      //             container: undefined,
      //             showButton: true
      // },
      locales: {
        en: {
          edit: 'Edit',
          del: 'Delete selected',
          back: 'Back',
          addNode: 'Add Node',
          addEdge: 'Add Edge',
          editNode: 'Edit Node',
          editEdge: 'Edit Edge',
          addDescription: 'Click in an empty space to place a new node.',
          edgeDescription: 'Click on a node and drag the edge to another node to connect them.',
          editEdgeDescription: 'Click on the control points and drag them to a node to connect to it.',
          createEdgeError: 'Cannot link edges to a cluster.',
          deleteClusterError: 'Clusters cannot be deleted.',
          editClusterError: 'Clusters cannot be edited.'
        }
      },

      layout: {
        randomSeed: 1,
        improvedLayout: true,
        hierarchical: {
          enabled: hierarchical,
          levelSeparation: 250,
          // nodeSpacing: 110,
          treeSpacing: 400,
          //blockShifting: false,
          // edgeMinimization: true,
          // parentCentralization: true,
          direction: direction, //"UD",
          sortMethod: "directed",
          //shakeTowards: "roots"
        }

      },

      interaction: {
        zoomView: true,
        hover: true,
        dragNodes: true,
        dragView: true,
        selectConnectedEdges: true,
        navigationButtons: false,
        multiselect: true
      },
      physics: {
        // forceAtlas2Based: {
        //     gravitationalConstant: -126,
        //     springLength: 200,
        //     springConstant: 0.01
        // },
        enabled: true,
        maxVelocity: 50,
        solver: "barnesHut",
        timestep: 0.35,
        stabilization: true
      },

      nodes: {
        physics: true,
        borderWidth: 2,
        font: { color: "#d3d3d3", size: 12 },
      },
      edges: {
        length: 200,
        width: 2,
        physics: true,
        font: { align: "top", color: "#d3d3d3", strokeWidth: .2, size: 12 },
        chosen: true,
        color: "#6ac6ff",
        smooth: {
          enabled: false, type: "discrete", roundness: 0
        },
      },
      autoResize: true,
      manipulation: {
        enabled: false,
        initiallyActive: true,
        editEdge: false,
        deleteNode: false,
        deleteEdge: false,
        addNode: function (nodeData, callback) {
          componentThis.nodeFormBuilder = componentThis.formBuilder.group({
            addNodes: componentThis.formBuilder.array([])
          });

          componentThis.addNodeSelectedTypeId = null;
          componentThis.addNodeDialog = true;
          console.log(componentThis.addNodeDialog)
          console.log(nodeData)
          componentThis.xCoordinate = nodeData.x
          componentThis.yCoordinate = nodeData.y
          componentThis.tempId = nodeData.id
          callback();
        },
        addEdge: function (data, callback) {
          componentThis.edgeFormBuilder = componentThis.formBuilder.group({
            addEdges: componentThis.formBuilder.array([])
          });
          componentThis.newEdgeNodeFrom = componentThis.nodes.get(data.from);
          componentThis.newEdgeNodeTo = componentThis.nodes.get(data.to);

          let isCheckEdge = componentThis.checkEdge();
          if (isCheckEdge) {
            componentThis.edgeCheck = isCheckEdge
          }
          else {
            componentThis.addEdgeDialog = true;
          }
          callback()
        }
      }
    }
    if (this.controlPanel) {
      this.vizDefailtOption.configure = {
        enabled: this.controlPanel,
        container: this.controlPanel == true ? filterContainer : 'undefined',
        showButton: true
      }
    }
    let vizOptions = this.vizDefailtOption;

    if (this.vizOption != null) {
      vizOptions.manipulation.enabled = this.vizOption.manipulation.enabled;
    }
    if (typeof this.vizResult != 'undefined') {
      if (redraw) {
        this.vizResult.nodes.forEach(element => {
          if (!element['children'])
            element['children'] = { edges: [], nodes: [] };
        });
        this.nodes = new viz.DataSet(this.vizResult.nodes);
        this.edges = new viz.DataSet(this.vizResult.edges);
      }
      const data = { nodes: this.nodes, edges: this.edges };
      let networkInstance = new viz.Network(container, data, vizOptions);
      componentThis.networkInstance = networkInstance;
      networkInstance.once("afterDrawing", function () {
        networkInstance.fit({
          animation: {
            duration: 1000,
            easingFunction: 'linear',
          },
        });
      });
      networkInstance.once('stabilized', function () {
        //console.log("stabilized");
        networkInstance.body.emitter.emit('_dataChanged');
        var scaleOption = { scale: 0.7 };
        networkInstance.moveTo(scaleOption);
        this.networkInstance?.setOptions({
          "edges": {
            enabled: true, type: "dynamic", roundness: .9
          },
        },
        );
        this.networkInstance?.redraw();
        //console.log('scale: ' + networkInstance.getScale()); // Always 1
      })
      networkInstance.on("hoverNode", function (params) {
        let nodeId = networkInstance.getNodeAt(params.pointer.DOM);
        let node = componentThis.nodes.get(nodeId);
        if (node != null && node.isNodeInpogess == true) {
          networkInstance.canvas.body.container.style.cursor = 'not-allowed'
        }
        else {
          networkInstance.canvas.body.container.style.cursor = 'pointer';
        }
      });
      networkInstance.on("blurNode", function (params) {
        networkInstance.canvas.body.container.style.cursor = 'default';
      });

      networkInstance.on("hoverEdge", function (params) {
        networkInstance.canvas.body.container.style.cursor = 'pointer';
      });

      networkInstance.on("blurEdge", function (params) {
        networkInstance.canvas.body.container.style.cursor = 'default';
      });

      networkInstance.on("doubleClick", function (params) {
        clearTimeout(componentThis.nodeEventTimer);
        componentThis.nodeEventTimer = undefined;
        let nodeId = networkInstance.getNodeAt(params.pointer.DOM);
        let node = componentThis.nodes.get(nodeId);
        componentThis.onNodeDblClick(node);

      });

      networkInstance.on("click", function (params) {

        // this.cm.hide()
        componentThis.nodeEventTimer = setTimeout(() => {
          if (componentThis.nodeEventTimer) {
            let nodeId = networkInstance.getNodeAt(params.pointer.DOM);
            let edgeId = networkInstance.getEdgeAt(params.pointer.DOM);
            if (typeof nodeId != 'undefined' || typeof edgeId != 'undefined') {
              // componentThis.isShowRightSidePanel = !componentThis.isShowRightSidePanel;
              componentThis.nodeSelected = nodeId;
              componentThis.edgeRightClicked = edgeId;
              componentThis.onNodeClick(nodeId, edgeId);
            }
          }
        }, 300);
      })
      networkInstance.on("oncontext", (params) => {
        params.event.preventDefault();

        componentThis.nodeEventTimer = setTimeout(() => {
          if (componentThis.nodeEventTimer) {
            let nodeId = networkInstance.getNodeAt(params.pointer.DOM);
            let edgeId = networkInstance.getEdgeAt(params.pointer.DOM);
            if (typeof nodeId != 'undefined' || typeof edgeId != 'undefined') {
              if (typeof nodeId != 'undefined') {
                networkInstance.selectNodes([nodeId]);
               
                componentThis.nodeSelected = nodeId;
                componentThis.onNodeRightClick(nodeId);
                
                componentThis.addExpand(nodeId,params);
                // setTimeout(()=>{
                //   componentThis.cm.show(params.event);
                // },5000)

                if (this.vizOption != null) {
                  componentThis.items[8].disabled = false;
                  componentThis.items[9].disabled = false;
                  // componentThis.items[10].disabled = false;

                }

              }
              else if (typeof edgeId != 'undefined') {
                componentThis.edgeRightClicked = edgeId;
                componentThis.cm2.show(params.event);
                componentThis.edgeItems[1].disabled = false;
                componentThis.edgeItems[2].disabled = false;
              }
            }
            else {
              componentThis.nodeSelected = null;
            }
          }
        }, 100);

      });
    }

    this.changeTheam('', this.theam.colorScheme);

  }

  public showRightSidePanel(id: string, header: string, type: string, properties: any, titleColor?: string, label?: string) {
    this.rshPanel = {
        "id": id,
        "header": header,
        "type": type,
        "titleColor": titleColor,
        "label": label,
        "properties": properties
    };
    this.isShowRightSidePanel = true;
    this.sidepanelState = 'in';
  }



  public onChangeNodesAndEdges(nodes: viz.DataSet, edges: viz.DataSet) {
    this.vizResult.nodes.forEach(element => {
      if (!element['children'])
        element['children'] = { edges: [], nodes: [] };

      //this.updateNodeProperties(element.nodeType, element)

    });

    this.nodes.update(nodes);
    this.edges.update(edges);
    this.networkInstance.redraw();
  }

  public updateNetworkOption(networkOption: any) {
    if (this.networkInstance != null)
      this.networkInstance.setOptions(networkOption);
      this.changeTheam('', this.theam.colorScheme);
      this.networkInstance.redraw();
  }

  public getNetworkOption() {
    return this.vizDefailtOption;
  }

  public setNetworkOption(networkOption: any) {

    this.networkInstance.setOptions({
      "layout": {
        "hierarchical": {
          "direction": networkOption.layout.hierarchical.direction,
        }
      },
      "edges": {
        length: networkOption.edges.length,
        font: { size: networkOption.edges.font.size },
        smooth: {
          enabled: true, type: networkOption.edges.smooth.type, roundness: networkOption.edges.smooth.roundness
        },
      },
      "nodes": {
        font: { size: networkOption.nodes.font.size }
      },
    });
    this.networkInstance.redraw();
  }

  public downloadVizNetwork() {
    html2canvas(this.el.nativeElement.children[0].children[0], { backgroundColor: this.theam.colorScheme != 'light' ? '#121212' : 'white' }).then(canvas => {
      this.canvas.nativeElement.src = canvas.toDataURL();
      this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
      this.downloadLink.nativeElement.download = 'download.png';
      this.downloadLink.nativeElement.click();
    });
  }

  //private Method
  private changeTheam(key: string, value: string) {
    if (value != "light") {
      this.fontColor = "#d3d3d3";
    } else {
      this.fontColor = "#7d7d7d";
    }

    this.networkInstance.setOptions({
      "edges": {
        font: {
          color: this.fontColor
        },
      },
      "nodes": {
        font: {
          color: this.fontColor
        },
      }
    });

  }
  
  private onNodeClick(nodeId?: string, edgeId?: string) {
    let panelId: string | undefined;
    let panelHeader: string;
    let panelType: string;
    let panelProperties: any;
    let titleColor: string | undefined;
    let label: string | undefined;

    if (typeof nodeId !== "undefined") {
        let node: Nodes = this.nodes.get(nodeId);
        console.log("onNodeClick - Node:", node);
        panelId = nodeId;
        panelHeader = "Node Properties";
        panelType = node.nodeType;
        panelProperties = node.nodeProperties;
        titleColor = node.color?.background;
        label = node.label;
    } else if (typeof edgeId !== "undefined") {
        let edge: Edges = this.edges.get(edgeId);
        console.log("onNodeClick - Edge:", edge);
        panelId = edgeId;
        panelHeader = "Edge Properties";
        panelType = edge.edgeType;
        panelProperties = edge.edgeProperties;
        label=edge.label;
    }

    if (panelId) {
        if (this.isShowRightSidePanel && this.rshPanel.id === panelId) {
            this.toggleSidenav();
        } else {
            this.showRightSidePanel(panelId, panelHeader, panelType, panelProperties, titleColor, label);
        }
    }
  }



  private onNodeRightClick(node: Node) {
    this.nodeRightClicked = node;
    this.calculateChildren(node, 6);
  }

  private calculateChildren(node, i) {
    if (!this.items[i].items) {
      this.items[i].items = []
    }
    else {
      let x = this.items[i].items[0]
      this.items[i].items = [];
      this.items[i].items.push(x)
    }
    let children = [];
    let types = [];
    let typeNodes = [];
    for (let i = 0; i < this.edges.get().length; i++) {
      let element = this.edges.get()[i];
      if (element.from == node) {
        let n = this.nodes.get(element.to);
        if (n) {
          if (types.includes(n.nodeType)) {
            let isNodeExist = this.helperService.isItemExist(typeNodes[types.indexOf(n.nodeType)][n.nodeType], n.id, "id");
            if (isNodeExist == -1)
              typeNodes[types.indexOf(n.nodeType)][n.nodeType].push(n)
          }
          else {
            types.push(n.nodeType);
            typeNodes.push(JSON.parse('{"' + n.nodeType + '":[]}'))
            typeNodes[types.indexOf(n.nodeType)][n.nodeType].push(n)
          }
        }
        children.push(n)
      }
    }
    if (children.length) {
      this.items[i].disabled = false;
      //this.items[i].items.push({ label: "All Existing Children (" + children.length + ")" })
    }
    else {
      this.items[i].disabled = true;
    }

    typeNodes.forEach((el, j) => {
      this.items[i].items.push({ label: types[j] + " (" + el[types[j]].length + ")", command: (event) => this.collapseChildren(this.nodeRightClicked, types[j]), })
    });

  }

  addExpand(id,params): void {
    if (!this.items[7].items) {
      this.items[7].items = []
    }
    else {
      let x = this.items[7].items[0]
      this.items[7].items = [];
      this.items[7].items.push(x)
    }
    let x = this.nodes.get([this.nodeSelected])[0]
    const uuid = this.graphpodMeta?.uuid
    const observableTemp = this.visNetworkService.getNodeEdges(uuid, this.nodeSelected, x.nodeType).subscribe({
      next: (response: any) => {
        response.forEach(element => {
          this.items[7].items.push({
            visible:true,
            label: element.node_type + " (" + element.node_type_count + ")",
            command: (event) => this.expandWithFilter(this.nodeRightClicked, element.node_type),
          });
         
        })
        this.isCMMenuShow=true
        setTimeout(() => {
          this.cm.show(params.event);
         },10)
      }
    });
    this.addSubscribe(observableTemp);
  }

  spinnerNodes: any = [];
  spinnerNodeIds: any = [];
  public onNodeDblClick(data: Nodes) {
    this.spinnerNodes.push({ ...data, ...{} })
    this.spinnerNodeIds.push(data.id)
    let n = this.nodes.get([data.id])[0]
    delete n.icon;
    n = { ...n, ...{ image: '/intrigue/assets/images/NodeSpinner.gif', shape: 'image' } }
    // n = { ...n, ...{ icon: { code: "\uf110" } } }
    this.nodes.update(n)
    // this.nodes.update({ id: data.id, icon: { code: "\uf110" } })
    this.nodeDblClick.emit(data);
  }

  toRemoveEdges: any = [];
  toRemoveNodes: any = [];
  storeChildren(_id: number, type?: string) {
    if (!type) {
      let id = _id.toString();
      for (let j = 0; j < this.edges.get().length; j++) {
        let element0 = this.edges.get()[j];
        if (element0.from == id) {
          for (let i = 0; i < this.nodes.get().length; i++) {
            let element = this.nodes.get()[i];
            if (element.id == id && !this.toRemoveEdges.includes(element0) && element0.to != this.nodeRightClicked) {
              let isEdgeExist = this.helperService.isItemExist(element.children.edges, element0.id, "id");
              if (isEdgeExist == -1)
                element.children.edges.push(element0);
              this.toRemoveEdges.push(element0);

            }
            if (
              element.id == element0.to &&
              !this.toRemoveNodes.includes(element) && this.checkMultipleParent(element0.to, id)
            ) {

              if (!this.nodes.get([id])[0].children.nodes.includes(element)) {
                this.nodes.get([id])[0].children.nodes.push(element);
              }
              this.toRemoveNodes.push(element);
            }
          }
          for (let k = 0; k < this.edges.get().length; k++) {

            let element1 = this.edges.get()[k];
            if (element0.to == element1.from && this.checkMultipleParent(element0.to, id)) {
              this.storeChildren(element1.from);
            }

          }
        }
      }

      if (this.toRemoveNodes) {
        for (let k = 0; k < this.toRemoveNodes.length; k++) {
          this.nodes.remove([this.toRemoveNodes[k].id]);
        }
      }
      if (this.toRemoveEdges) {
        for (let k = 0; k < this.toRemoveEdges.length; k++) {
          this.edges.remove([this.toRemoveEdges[k].id]);
        }
      }




    }
    else {
      let id = _id.toString();
      for (let j = 0; j < this.edges.get().length; j++) {
        let element0 = this.edges.get()[j];
        if (element0.from == id) {

          for (let i = 0; i < this.nodes.get().length; i++) {
            let element = this.nodes.get()[i];
            if (element.nodeType == type) {
              console.log(element)
              console.log(element.id == id, !this.toRemoveEdges.includes(element0), this.nodes.get([element0.to]).nodeType == type)
            }
            if (element.id == id && !this.toRemoveEdges.includes(element0) && this.nodes.get([element0.to])[0].nodeType == type) {
              element.children.edges.push(element0);
              this.toRemoveEdges.push(element0);

            }
            if (
              element.id == element0.to &&
              !this.toRemoveNodes.includes(element) && this.checkMultipleParent(element0.to, id) && this.nodes.get([element0.to])[0].nodeType == type
            ) {
              this.nodes.get([id])[0].children.nodes.push(element);
              this.toRemoveNodes.push(element);
            }
          }
          for (let k = 0; k < this.edges.get().length; k++) {

            let element1 = this.edges.get()[k];
            if (element0.to == element1.from && this.checkMultipleParent(element0.to, id)) {
              this.storeChildren(element1.from);
            }

          }
        }
      }
    }
  }
  checkMultipleParent(_id: any, _ignore: any) {
    let id = _id.toString();
    let ignore = _ignore.toString();
    var res = true;
    for (let k = 0; k < this.edges.get().length; k++) {
      let element = this.edges.get()[k];
      if (element.to == id && element.from != ignore) {
        res = false;
      }
    }
    return res;
  }

  showDetails(nodeId: string, edgeId: string): void {
    if (typeof nodeId != 'undefined' || typeof edgeId != 'undefined') {
      this.onNodeClick(nodeId, edgeId);
    }
  }

  hide(): void {
    this.nodes.remove({ id: this.nodeRightClicked, hidden: true })
  }
  inverse(): void {
    let removeNodes = []
    let removeEdges = []
    this.nodes.get().forEach(element => {
      if (element.id != this.nodeRightClicked)
        removeNodes.push({ id: element.id, hidden: true })
    });
    this.edges.get().forEach(element => {
      removeEdges.push(element.id)
    });
    this.nodes.remove(removeNodes)
    this.edges.remove(removeEdges)
  }
  degree1(node: any): void {
    this.expandChildren(node, 1);
  }
  degree2(node: any): void {
    this.expandChildren(node, 2);
  }
  degree3(node: any): void {
    this.expandChildren(node, 3);
  }
  collapse(node: any): void {
    this.remove(node, null);
    // this.cm.hide()
  }
  collapseChildren(node: any, type: string) {
    this.remove(node, type)
  }
  expand(node: any): void {
    this.expandChildren(node);
    // this.cm.hide()
  }
  remove(id: number, type: any, event?: any) {
    if (event) {
      event.preventDefault();
    }
    if (!type) {
      this.storeChildren(id);
    }
    else {
      this.storeChildren(id, type);
    }
    for (let i = 0; i < this.toRemoveEdges.length; i++) {
      let element = this.toRemoveEdges[i];
      this.edges.remove([element]);
    }
    for (let i = 0; i < this.toRemoveNodes.length; i++) {
      let element = this.toRemoveNodes[i];
      this.nodes.remove([element]);
    }
    this.toRemoveEdges = [];
    this.toRemoveNodes = [];
  }
  expandChildren(item, degree?: any): void {
    this.nodes.add(this.nodes.get(item).children.nodes);
    this.edges.add(this.nodes.get(item).children.edges);
    let node = this.nodes.get(item);
    if (degree)
      node = { ...node, ...{ degree: degree.toString() } }
    this.nodeDblClick.emit(node);
  }
  expandWithFilter(item, type, degree?): void {
    let node = this.nodes.get(item);
    if (degree)
      node = { ...node, ...{ type: type.toString(), degree: degree.toString() } }
    else
      node = { ...node, ...{ type: type.toString() } }
    this.nodeDblClick.emit(node);

  }
 
  toggleSidenav(): void {
    this.sidepanelState = this.sidepanelState === 'out' ? 'in' : 'out';
    setTimeout(() => {
        this.isShowRightSidePanel = !this.isShowRightSidePanel;
    }, 550);
}

  toogleHierarchical(direction): void {
    this.networkDraw(this.vizGraphResult, this.graphpodMeta, false, !this.vizDefailtOption.layout.hierarchical.enabled, direction);
  }

  toogleManipulation(): void {
    this.vizOption.manipulation.enabled = !this.vizOption.manipulation.enabled;
    this.networkDraw(this.vizGraphResult, this.graphpodMeta, false, this.vizDefailtOption.layout.hierarchical.enabled, "UD");
  }

  public nodeModalTypeChange(): void {

    this.nodeFormBuilder = this.formBuilder.group({
      addNodes: this.formBuilder.array([])
    });


    this.graphpodMeta.nodeInfo.forEach(element => {
      if (element.displayId == this.addNodeSelectedTypeId) {
        this.addNodeSelectedType = element
      }
    });

    this.addNodeSelectedType.nodeProperties.forEach((ele: any) => {
      let nodeIdAttr = this.addNodeSelectedType.nodeId.attrName;
      let addNode = null;

      if (["id", "<id>"].indexOf(ele.attrName) != -1) { }

      else if (nodeIdAttr == ele.attrName) {
        addNode = this.formBuilder.group({
          attrName: [ele.attrName, [Validators.required]],
          attrType: [ele.attrType, [Validators.required]],
          value: ["", [Validators.required]],
        });
      } else {
        addNode = this.formBuilder.group({
          attrName: [ele.attrName, []],
          attrType: [ele.attrType, []],
          value: ["", []],
        });
      }
      if (addNode != null)
        this.nodeFormBuilder.get('addNodes').push(addNode);
    });

  }

  editNodeModalTypeChange(): void {
    this.editNodeGraphpodMeta.nodeInfo.forEach(element => {
      if (element.displayId == this.editNodeSelectedType) {
        console.log(this.editNodeSelected)
        console.log(element)
        this.editNodeSelected = element
      }
    });
  }

  private deleteNode(): void {
    let x: Nodes = this.nodes.get([this.nodeRightClicked])[0];
    console.log(x)
    let y = {
      key: '',
      value: ''
    }
    this.graphpodMeta.nodeInfo.forEach(element => {
      if (element.nodeType == x.nodeType) {
        x.nodeProperties.forEach(el => {
          if (el.name == element?.nodeId?.attrDispName) {
            y.key = el.name
            y.value = el.value
          } else if (el.name == element?.nodeId?.attrDispName.replace(/[\<\> ]+/g, '')) {
            y.key = el.name
            y.value = el.value
          }
        });
      }
    });
    //If Properties not config in KG
    if (y.key == "" || y.value == "") {
      y.key = "id"
      y.value = x.id;
    }


    const observableTemp = this.visNetworkService.deleteNode(this.graphpodMeta['uuid'], this.nodeSelected, x.updatedNodeType, y.key, y.value, this.dsId).subscribe({
      next: (response: any) => {
        if (response == true) {
          this.nodes.remove([this.nodeRightClicked])
          this.confirmationService.close();
        }
      }, error: (err: any) => {
        let message = "Some Error Occured";
        if (err != null && err.error.message != null) {
          message = err.error.message;
        }
        this.isError = true;
        this.errorContent = message;
        setTimeout(() => {
          this.isError = false;
        }, 5000);
      }
    });
    this.addSubscribe(observableTemp);
  }
  editNodeGraphpodMeta: any;
  editEdgeGraphpodMeta: any;
  private editNodeOpen(): void {
    this.editNodeDialog = true;
    this.editNodeGraphpodMeta = { ...{}, ...this.graphpodMeta }
    this.editNodeSelected = this.nodes.get([this.nodeRightClicked])[0];
    console.log(this.editNodeSelected)
    this.nodeTitle = this.editNodeSelected.nodeName;
    this.editNodeGraphpodMeta.nodeInfo.forEach(element => {
      if (element.nodeType.toUpperCase() == this.editNodeSelected.nodeType.toUpperCase()) {
        this.editNodeSelectedType = element.displayId;
        element.nodeProperties.forEach(el => {
          console.log(el.attrName)
          this.editNodeSelected.nodeProperties.forEach(el2 => {
            if (el.attrName.toLowerCase() == el2.name.trim().toLowerCase()) {
              el.value = el2.value;
            }

            if (el.attrName.toLowerCase() == "<id>" || el.attrName.toLowerCase() == "id") {
              el.attrName = "id";
              el.value = this.editNodeSelected.id;
            }
          });
        });
        this.editNodeSelected = element;
      }
    });
  }

  public isNodeKeyAttr(item: any): boolean {
    let isKey = false;
    this.graphpodMeta.nodeInfo.forEach(element => {
      if (element.nodeType == this.editNodeSelected.nodeType) {
        if (item.attrDispName == element.nodeId.attrDispName) {
          isKey = true;
        }
      }
    });
    return (isKey);
  }

  public editNode(): void {
    let tempNode = this.nodes.get([this.nodeRightClicked])[0]
    let req = {
      nodeType: this.editNodeSelected.nodeType,
      label: tempNode.updatedNodeType,
      graphProperty: [],
      nodeProperties: [],
    }

    this.editNodeSelected.nodeProperties.forEach(element => {
      let key = "N";
      if (element.attrName == this.editNodeSelected.nodeId.attrName) {
        key = "Y"
      }
      let prop = {
        key: key,
        name: element.attrName,
        type: element.attrType,
        value: element.value,
      }
      req.graphProperty.push(prop)
      req.nodeProperties.push(prop)
    });

    const observableTemp = this.visNetworkService.editNode(this.graphpodMeta['uuid'], this.nodeRightClicked, req, this.dsId).subscribe({
      next: (response: any) => {
        if (response == true) {
          this.editNodeDialog = false;
          let node = this.nodes.get([this.nodeRightClicked])[0]
          this.editNodeSelected.nodeProperties.forEach(element => {
            node.nodeProperties.forEach(el => {
              el.name = el.name.replace(/ /g, '')
              if (el.name == element.attrDispName) {
                node.nodeName = element.value
                node.label = element.value
                el.value = element.value
                this.nodes.update(node)
              }
            });
          });
        }
      }
    });
    this.addSubscribe(observableTemp);
  }

  public createNode(): void {
    this.submitted = true;
    if (this.nodeFormBuilder.invalid) {
      return;
    }

    let tempNodes = this.nodes.get();
    let tempNode = null;
    let tempIndex = this.helperService.isItemExist(tempNodes, this.addNodeSelectedType.nodeType, 'nodeType');
    if (tempIndex != -1) {
      tempNode = tempNodes[tempIndex];
    } else {
      if (tempNode == null) {
        tempNode = {};
        tempNode.updatedNodeType = this.addNodeSelectedType.nodeType + ":" + this.otherNodeType;
      }
    }

    //Setup Post call body

    let graphNodeDML = new GraphNodeDML();
    graphNodeDML.label = tempNode.updatedNodeType;
    let nodePropertyArray = [];
    let graphPropertyArray = [];
    let tempNodeProperties = this.nodeFormBuilder.get('addNodes').value;

    tempNodeProperties.forEach(element => {
      let key = "N";
      if (element.attrName == this.addNodeSelectedType.nodeId.attrName) {
        key = "Y";
      }
      let propertyInfo: any = {};
      propertyInfo.key = key;
      propertyInfo.name = element.attrName;
      propertyInfo.type = element.attrType;
      propertyInfo.value = element.value;
      if (propertyInfo.value != null) {
        graphPropertyArray.push(propertyInfo);
        nodePropertyArray.push(propertyInfo);
      }
    });
    graphNodeDML.graphProperty = graphPropertyArray;

    let nodeInfo = new Nodes();
    nodeInfo.nodeType = this.addNodeSelectedType.nodeType;
    nodeInfo.label = tempNode.nodeType;
    nodeInfo.updatedNodeType = tempNode.updatedNodeType;
    nodeInfo.initialNodeType = tempNode.initialNodeType;
    nodeInfo.nodeName = this.addNodeSelectedType.nodeType;
    nodeInfo.shape = "dot";
    nodeInfo.size = 25;
    nodeInfo.color = { background: this.addNodeSelectedType.nodeBackgroundColor };
    let color = this.visNetworkService.bgDarkMap[this.addNodeSelectedType.nodeBackgroundColor];
    nodeInfo.color.border = color;

    nodeInfo.nodeProperties = nodePropertyArray;
    //parseFloat(this.xCoordinate);
    //parseFloat(this.yCoordinate);

    this.addNodeDialog = false;
    const observableTemp = this.visNetworkService.createNode(this.graphpodMeta['uuid'], this.addNodeSelectedType.nodeType, graphNodeDML, this.dsId).subscribe({
      next: (response: any) => {
        if (response != null) {
          nodeInfo.id = response;
          let tempNodePropert = { "name": "id", value: response };
          nodeInfo.nodeProperties.push(tempNodePropert);
          this.nodes.add(nodeInfo);
          this.addNodeDialog = false;
          this.addNodeSelectedType = null;
          this.addNodeSelectedTypeId = null;
          this.addNodeClicked = false;

        }
      }
    });
    this.addSubscribe(observableTemp);
  }

  addEdgeDialogOpen(): void {
    this.addEdgeClicked = !this.addEdgeClicked
    this.addEdgeDialog = true;
  }

  edgeModalTypeChange(): void {
    this.edgeFormBuilder = this.formBuilder.group({
      addEdges: this.formBuilder.array([])
    });
    let index = this.visNetworkService.getIndexByEdgeType(this.graphpodMeta, this.addEdgeSelectedTypeId, this.newEdgeNodeFrom.nodeType, this.newEdgeNodeTo.nodeType);
    this.addEdgeSelectedType = this.graphpodMeta.edgeInfo[index];

    console.log(this.addEdgeSelectedType);
    this.addEdgeSelectedType.edgeProperties.forEach((ele: any) => {

      let sourceNodeIdAttr = this.addEdgeSelectedType.sourceNodeId.attrName;
      let targetNodeIdAttr = this.addEdgeSelectedType.targetNodeId.attrName;
      let addEdge = null;
      if (sourceNodeIdAttr == ele.attrName || targetNodeIdAttr == ele.attrName) {
      } else {
        addEdge = this.formBuilder.group({
          attrName: [ele.attrName, []],
          attrType: [ele.attrType, []],
          value: [ele.value, []],
        });
      }
      if (addEdge != null)
        this.edgeFormBuilder.get('addEdges').push(addEdge);
    });
  }

  editEdgeDialogOpen(): void {
    this.editEdgeDialog = true;
    this.editEdgeSelectedType2 = null;
    let tempEdge = this.edges.get([this.edgeRightClicked])[0];
    //this.editEdgeSelectedTypeId = x.edgeType;
    //this.editEdgeSelectedType = x;
    this.editNodeGraphpodMeta = { ...{}, ...this.graphpodMeta };
    let element = this.editNodeGraphpodMeta.edgeInfo[tempEdge.edgeIndex];
    if (element.edgeType == tempEdge.edgeType) {
      for (let i = 0; i < element.edgeProperties.length; i++) {
        tempEdge.edgeProperties.forEach(el2 => {
          if (element.edgeProperties[i].attrName == el2.name.replace(/ /g, '').toLowerCase()) {
            element.edgeProperties[i].value = el2.value
          }
          if (["_sourceid_", "_SourceId_"].indexOf(element.edgeProperties[i].attrName) != -1) {
            element.edgeProperties[i].value = tempEdge.from;
          }
          if (["_targetid_", "_TargetId_"].indexOf(element.edgeProperties[i].attrName) != -1) {
            element.edgeProperties[i].value = tempEdge.to;
          }
        });
      }
      this.editEdgeSelectedType2 = element
    }
  }

  public isEdgeKeyAttr(item: any): boolean {
    let isKey = false;
    if (["_sourceid_", "_SourceId_"].indexOf(item.attrName) != -1) {
      isKey = true;
    }
    else if (["_targetid_", "_TargetId_"].indexOf(item.attrName) != -1) {
      isKey = true;
    }
    return (isKey);
  }

  public editEdge(): void {
    console.log(this.editEdgeSelectedType2)
    let x = this.edges.get([this.edgeRightClicked])[0];

    let req = {
      from: x.from,
      to: x.to,
      arrows: 'to',
      sourceLabel: this.nodes.get([x.from])[0].updatedNodeType,
      targetLabel: this.nodes.get([x.to])[0].updatedNodeType,
      sourceNode: [],
      targetNode: [],
      edgeType: this.editEdgeSelectedType2.edgeType,
      label: this.editEdgeSelectedType2.edgeName,
      edgeProperty: [],
      edgeProperties: [],
      id: x.id
    }

    this.nodes.get([x.from])[0].nodeProperties.forEach(element => {
      let y = {
        name: element.name,
        key: 'N',
        type: '',
        value: element.value
      }
      this.graphpodMeta.nodeInfo.forEach(el => {
        if (this.nodes.get([x.from])[0].nodeType == el.nodeType) {
          if (element.name == el?.nodeId?.attrDispName) {
            y.key = "Y"
          }
        }
      });
      req.sourceNode.push(y)
    });
    this.nodes.get([x.to])[0].nodeProperties.forEach(element => {
      let y = {
        name: element.name,
        key: 'N',
        type: '',
        value: element.value
      }
      this.graphpodMeta.nodeInfo.forEach(el => {
        if (this.nodes.get([x.to])[0].nodeType == el.nodeType) {
          if (element.name == el?.nodeId?.attrDispName) {
            y.key = "Y"
          }
        }
      });
      req.targetNode.push(y)
    });
    this.editEdgeSelectedType2.edgeProperties.forEach(element => {
      let y = {
        name: element.attrName,
        key: 'N',
        type: element.attrType,
        value: element.value
      }
      req.edgeProperty.push(y)
      req.edgeProperties.push(y)
    });
    const observableTemp = this.visNetworkService.editEdge(this.graphpodMeta['uuid'], this.editEdgeSelectedType2.edgeType, req, this.dsId).subscribe({
      next: (response: any) => {
        if (response == true) {
          this.edges.update(req);
          this.editEdgeDialog = false;
          this.editEdgeSelectedType = null;
          this.editEdgeSelectedType2 = null;
          this.editEdgeSelectedTypeId = null;
        }
      },
      error: (err: any) => {
        let message = "Some Error Occured";
        if (err != null && err.error.message != null) {
          message = err.error.message;
        }
        this.isError = true;
        this.errorContent = message;
        setTimeout(() => {
          this.isError = false;
        }, 5000);
        //this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
      }
    });
    this.addSubscribe(observableTemp);
  }

  createEdge(): void {
    this.submitted = true;
    if (this.edgeFormBuilder.invalid) {
      return;
    }
    let edgeProperties = [];
    let graphEdgeDInput = new GraphEdgeDML();
    graphEdgeDInput.label = this.addEdgeSelectedType.edgeType;
    graphEdgeDInput.sourceLabel = this.newEdgeNodeFrom.updatedNodeType;
    graphEdgeDInput.targetLabel = this.newEdgeNodeTo.updatedNodeType;
    graphEdgeDInput.edgeProperty = [];
    graphEdgeDInput.sourceNode = [];
    graphEdgeDInput.targetNode = []
    this.newEdgeNodeFrom.edgeProperties = this.edgeFormBuilder.get('addEdges').value
    this.newEdgeNodeFrom.nodeProperties.forEach(element => {
      let y = {
        name: element.name,
        key: 'N',
        type: '',
        value: element.value
      }
      this.graphpodMeta.nodeInfo.forEach(el => {
        if (this.newEdgeNodeFrom.nodeType == el.nodeType) {
          if (element.name == el.nodeId.attrDispName) {
            y.key = "Y"
          }
        }
      });
      graphEdgeDInput.sourceNode.push(y)
    });

    this.newEdgeNodeTo.nodeProperties.forEach(element => {
      let y = {
        name: element.name,
        key: 'N',
        type: '',
        value: element.value != null ? element.value : ""
      }
      this.graphpodMeta.nodeInfo.forEach(el => {
        if (this.newEdgeNodeTo.nodeType == el.nodeType) {
          if (element.name == el.nodeId.attrDispName) {
            y.key = "Y"
          }
        }
      });
      graphEdgeDInput.targetNode.push(y)
    });

    this.newEdgeNodeFrom.edgeProperties.forEach(element => {
      let y = {
        name: element.attrName,
        key: 'N',
        type: element.attrType,
        value: element.value != null ? element.value : ""
      }
      graphEdgeDInput.edgeProperty.push(y)
      edgeProperties.push(y)
    });

    let edgeInfo = new Edges();
    edgeInfo.from = this.newEdgeNodeFrom.id;
    edgeInfo.to = this.newEdgeNodeTo.id;
    edgeInfo.edgeType = this.addEdgeSelectedType.edgeType;
    edgeInfo.label = this.addEdgeSelectedType.edgeName;
    edgeInfo.title = this.addEdgeSelectedType.edgeName;
    edgeInfo.arrows = 'to';
    edgeInfo.edgeProperties = edgeProperties;
    let index = this.visNetworkService.getIndexByEdgeType(this.graphpodMeta, edgeInfo.edgeType, this.newEdgeNodeFrom.nodeType,
      this.newEdgeNodeTo.nodeType);
    edgeInfo.edgeIndex = index;
    const observableTemp = this.visNetworkService.createEdge(this.graphpodMeta['uuid'], this.addEdgeSelectedType.edgeType, graphEdgeDInput, this.dsId).subscribe({
      next: (response: any) => {
        if (response != null) {
          edgeInfo.id = response;
          this.edges.add(edgeInfo);
          this.addEdgeDialog = false;
          this.addEdgeSelectedType = null;
          this.addEdgeSelectedTypeId = null;
          this.addEdgeClicked = false;
        }
      },
      error: (err: any) => {
        let message = "Some Error Occured";
        if (err != null && err.error.message != null) {
          message = err.error.message;
        }
        this.isError = true;
        this.errorContent = message;
        setTimeout(() => {
          this.isError = false;
        }, 5000);
        //this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
      }
    });
    this.addSubscribe(observableTemp);
  }
  checkEdge(): boolean {
    let x = true;
    let edgeTypes = [];
    this.graphpodMeta.edgeInfo.forEach(element => {
      if (element.sourceNodeType == this.newEdgeNodeFrom.nodeType) {
        if (element.targetNodeType == this.newEdgeNodeTo.nodeType) {
          edgeTypes.push(element);


          x = false;
        }
      }
    });
    this.edgesTypes = edgeTypes;
    this.addEdgeSelectedTypeId = this.edgesTypes[0].edgeType;
    console.log(edgeTypes);
    //this.edgeModalTypeChange();
    return x
  }
  deleteEdge(): void {
    let tempEdge: Edges = this.edges.get([this.edgeRightClicked])[0];
    tempEdge.edgeType = this.otherNodeType != null ? tempEdge.edgeType + ":" + this.otherNodeType : tempEdge.edgeType;
    const observableTemp = this.visNetworkService.deleteEdge(this.graphpodMeta['uuid'], tempEdge.edgeType, tempEdge.id, this.dsId).subscribe({
      next: (response: any) => {
        if (response == true) {
          this.edges.remove([this.edgeRightClicked])
        }
      },
      error: (err: any) => {
        let message = "Some Error Occured";
        if (err != null && err.error.message != null) {
          message = err.error.message;
        }
        this.isError = true;
        this.errorContent = message;
        setTimeout(() => {
          this.isError = false;
        }, 5000);
        //this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
      }
    });
    this.addSubscribe(observableTemp);
  }

  private addSubscribe(subscriber: any): void {
    if (subscriber != null && subscriber instanceof Subscriber) {
      this.subscriptions.push(subscriber);
    }
  }

  public setMaxHeight(height){
    this.vizNetworkStyleObj.height = height;
  }

  public setMinHeight(height){
    this.vizNetworkStyleObj.height = height;
  }

  public setZIndexForRightPanel(): void{
   this.fromGenAI = true;
  }

  ngOnDestroy(): void {
    // Method for Unsubscribing Observable
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
