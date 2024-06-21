import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-responsive-popup';
import { GraphpodResultView } from 'src/app/shared/models/API/graphpod-result-view.model';
import { IGraphpod } from 'src/app/shared/models/API/graphpod.model';
import { HelperService } from 'src/app/shared/services/helper.service';
import { LeafletMapService } from './leaflet-map.service';


@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrl: './leaflet-map.component.scss'
})
export class LeafletMapComponent implements OnInit {

  @Input('graphpodMeta') public graphpodMeta: IGraphpod;
  @Input() public options: any;
  @Input('graphResult') mapResult: GraphpodResultView;
  @ViewChild('leafletMapEleRef') private leafletMapEleRef: ElementRef;
  private leafletMap: any;
  private optionsSpec: any = {
    layers: [
      {
        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        className: null // Class for grayscale view  
      },
      {
        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        className: 'grayscale-layer'
      },
    ],
    zoom: 5,
  };
  private nodes: any = [];
  protected isMaximized: boolean = false;
  constructor(private helperService: HelperService, private leafletMapService: LeafletMapService) { }
  ngOnInit(): void {
    /*this.mapResult = {
      "nodes": [
        {
          "id": "82",
          "label": "5431-8076-366",
          "nBPropertyId": null,
          "nHPropertyId": null,
          "nIPropertyId": null,
          "niType": null,
          "nodeIcon": null,
          "nodeIndex": null,
          "nodeName": "82",
          "nodeProperties": "{\"account_number\" : \"'5431-8076-366'\",\"id\" : \"'5431-8076-366'\",\"interest_type\" : \"'Simple'\",\"load_id\" : \"0\",\"primary_iden_doc_id\" : \"'P458-69-1733'\",\"account_status_id\" : \"'101'\",\"account_type_id\" : \"'102'\",\"product_type_id\" : \"'101'\",\"monthly_deposit_amount\" : \"0\",\"pin_number\" : \"4944\",\"currency_code\" : \"'EUR'\",\"primary_iden_doc\" : \"'DL'\",\"account_id\" : \"'9907712963'\",\"nationality\" : \"'American'\",\"account_open_date\" : \"'2009-04-17'\",\"name\" : \"'5431-8076-366'\",\"interest_rate\" : \"0.5\",\"current_balance\" : \"16900\",\"opening_balance\" : \"50500\",\"customer_id\" : \"'37856901'\",\"secondary_iden_doc\" : \"'SSN'\",\"secondary_iden_doc_id\" : \"'230-03-1994'\",\"longitude\" : \"76.39336\",\"latitude\" : \"10.141244\"}",
          "nodeSize": null,
          "nodeType": "Account"
        },
        {
          "id": "321",
          "label": "Raja",
          "nBPropertyId": null,
          "nHPropertyId": null,
          "nIPropertyId": null,
          "niType": null,
          "nodeIcon": null,
          "nodeIndex": null,
          "nodeName": "321",
          "nodeProperties": "{\"commute_distance_miles\" : \"27\",\"load_id\" : \"0\",\"address_id\" : \"'4759'\",\"last_name\" : \"'Alvarado'\",\"profile_picture\" : \"'/app/framework/profile/37856901.jpg'\",\"load_date\" : \"'2017-03-01'\",\"title\" : \"'Mr'\",\"date_first_purchase\" : \"'2009-05-18'\",\"ssn\" : \"'173-99-4810'\",\"branch_id\" : \"'398627'\",\"phone\" : \"'+1 (224)-740-2040'\",\"name\" : \"'Raja'\",\"customer_id\" : \"'37856901'\",\"first_name\" : \"'Raja'\",\"latitude\" : \"19.00727\",\"longitude\" : \"72.897423\"}",
          "nodeSize": null,
          "nodeType": "Customer"
        }
      ],
      "edges": [
        {
          "id": "2129",
          "eHPropertyId": "null",
          "edgeIndex": "null",
          "edgeName": "101",
          "edgeProperties": "{\"account_number\" : \"5431-8076-366\",\"interest_type\" : \"Simple\",\"load_id\" : \"0\",\"primary_iden_doc_id\" : \"P458-69-1733\",\"account_status_id\" : \"101\",\"account_type_id\" : \"102\",\"product_type_id\" : \"101\",\"load_date\" : \"2017-03-01\",\"currency_code\" : \"EUR\",\"monthly_deposit_amount\" : \"0\",\"pin_number\" : \"4944\",\"primary_iden_doc\" : \"DL\",\"account_id\" : \"9907712963\",\"nationality\" : \"American\",\"branch_id\" : \"398627\",\"edgeName\" : \"101\",\"account_open_date\" : \"2009-04-17\",\"current_balance\" : \"16900\",\"interest_rate\" : \"0.5\",\"opening_balance\" : \"50500\",\"customer_id\" : \"37856901\",\"secondary_iden_doc\" : \"SSN\",\"secondary_iden_doc_id\" : \"230-03-1994\"}",
          "edgeSequence": "0",
          "edgeType": "Has Account",
          "value": null,
          "sourceDisplayId": "321",
          "targetDisplayId": "82"
        }
      ]
    }*/
  }
  ngAfterViewInit(): void {
    this.render();
  }

  /**
   * @description - call this function for set max height
   */
  public setMaxHeight(): void {
    this.isMaximized = true;
  }

  /**
   * @description - call this function for set min height
   */
  public setMinHeight(): void {
    this.isMaximized = false;
  }

  /**
   * @param latitude  - Initile latitude center coordinates
   * @param longitude - Initile longitude center coordinates
   */
  private addMap(latitude: any, longitude: any): any {
    const mapOptions: L.MapOptions = {
      center: L.latLng(latitude, longitude),
      zoom: 13,
    };
    const refElement = this.leafletMapEleRef.nativeElement;
    this.leafletMap = L.map(refElement, mapOptions)
  }

  /** 
   * @param titleLayer  
   * @returns L.tilteLater Object
   */
  private addLayer(titleLayer: any): any {
    return L.tileLayer(titleLayer.url, {
      attribution: titleLayer.attribution,
      className: titleLayer.className
    });
  }

  /**
   * 
   * @param iconClass - fontAwesome class
   * @returns L.divIcon Object
   */
  private addDivIcon(iconClass: any): any {
    let tempIcon = L.divIcon({
      className: 'custom-div-icon',
      html: "<div class='marker-pin'><i class='" + iconClass + "' style='font-size:20px;color:white'></div>",
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    return tempIcon;
  }

  /**
   * 
   * @param id 
   * @param latitude 
   * @param longitude 
   * @param iconClass      - fontawsome icon class 
   * @param bgColor        - background Color 
   * @param highlightColor 
   */
  private addCircleMaker(id: any, latitude: any, longitude: any, iconClass: any, bgColor: any, highlightColor: any, popupData: any): void {
    var popup = L.responsivePopup({ hasTip: true }).setContent(popupData);

    let divIcon = this.addDivIcon(iconClass);
    let marker = L.marker([latitude, longitude], {
      icon: divIcon
    }).addTo(this.leafletMap);

    let circleMarker = L.circleMarker([latitude, longitude], {
      color: highlightColor != null ? highlightColor : bgColor,
      fillColor: bgColor != null ? bgColor : '#f03',
      fillOpacity: 1,
      radius: 20,
    }).bindPopup(popup).addTo(this.leafletMap);
  }


  /**
   * 
   * @param sourceLinePoints - polyLine starting point
   * @param targetLinePoints - polyLine ending point
   * @param popupData          
   * @param highlightColor   - fill color
   */
  private addPolyLine(sourceLinePoints: any, targetLinePoints: any, popupData: any, highlightColor: any): void {
    var popup = L.responsivePopup({ hasTip: true }).setContent(popupData);
    var polyline = L.polyline([sourceLinePoints, targetLinePoints], {
      color: highlightColor,
      weight: 2
    }).bindPopup(popup).addTo(this.leafletMap);
  }

  /**
   * @description - call function for map render
   */
  private render(): void {
    let latitude = null;
    let longitude = null;
    let centerCoordinate = this.getCenterCoordinates(this.mapResult);
    if (centerCoordinate != null && centerCoordinate.latitude != null && centerCoordinate.longitude != null) {
      latitude = centerCoordinate.latitude;
      longitude = centerCoordinate.longitude;
    }
    this.addMap(latitude, longitude);
    let layer = this.addLayer(this.optionsSpec.layers[0]);
    layer.addTo(this.leafletMap);
    this.getData(this.mapResult);
    L.control.scale({ maxWidth: 240, metric: true, position: 'bottomleft' }).addTo(this.leafletMap);
    let baseMaps = {
      "Street View": this.addLayer(this.optionsSpec.layers[0]),
      "Gray Scale": this.addLayer(this.optionsSpec.layers[1])
    };
    L.control.layers(baseMaps).addTo(this.leafletMap);

  }

  /**
   * 
   * @param data -- mpa data node and edges
   */
  private getData(data: any): void {
    let polylinePointsArray = [];

    if (data != null && data.nodes != null) {
      for (let i = 0; i < data.nodes.length; i++) {
        let lagLogVale = this.getLatLogValue(data.nodes[i].nodeProperties);
        let latitude = lagLogVale.latitude;
        let longitude = lagLogVale.longitude;
        if (latitude != null && longitude != null) {
          this.nodes.push(data.nodes[i]);
          let nodeType = this.helperService.convertStringArrayToArray(data.nodes[i].nodeType.replace(/[\[\] ]+/g, ''))[0];
          data.nodes[i].nodeType = nodeType;
          let index = null;
          if (data.nodes[i].nodeIndex == null) {
            index = this.getIndexByNodeType(this.graphpodMeta, nodeType);
            data.nodes[i].nodeIndex = index;
          }
          let tempHighlight = this.getNodeHighlight(this.graphpodMeta, data.nodes[i].nHPropertyId, data.nodes[i].nodeProperties, data.nodes[i].nodeIndex);
          let tempIcon = this.leafletMapService.getIcon(this.graphpodMeta, data.nodes[i].nHPropertyId, data.nodes[i].nodeIndex);
          let bgColor = this.graphpodMeta.nodeInfo[data.nodes[i].nodeIndex].nodeBackgroundColor;
          let title = nodeType + " - " + data.nodes[i].id;
          let popupData = this.getPopupData(title, data.nodes[i].nodeProperties);
          this.addCircleMaker(data.nodes[i].id, latitude, longitude, tempIcon, bgColor, tempHighlight, popupData);
        }
        console.log(this.nodes);
      }
    }
    if (data != null && data.edges != null) {
      for (let i = 0; i < data.edges.length; i++) {
        let popupData = this.getPopupData(data.edges[i].id, data.edges[i].edgeProperties);
        let sourceNodeIndex = this.helperService.isItemExist(data.nodes, data.edges[i].sourceDisplayId, 'id');
        let targetNodeIndex = this.helperService.isItemExist(data.nodes, data.edges[i].targetDisplayId, 'id');
        let sourceLatLogValue = this.getLatLogValue(data.nodes[sourceNodeIndex].nodeProperties);
        let targetLatLogValue = this.getLatLogValue(data.nodes[targetNodeIndex].nodeProperties);
        let sourceLinePoints = new Array();
        let targetLinePoints = new Array();

        if (data.edges[i].edgeIndex == null || data.edges[i].edgeIndex == "null") {
          let sourceIndex = this.helperService.isItemExist(this.nodes, data.edges[i].sourceDisplayId, "id");
          let targetIndex = this.helperService.isItemExist(this.nodes, data.edges[i].targetDisplayId, "id");
          if (sourceIndex == -1 || targetIndex == -1) {
            continue;
          }
          let index = this.getIndexByEdgeType(this.graphpodMeta, data.edges[i].edgeType, data.nodes[sourceIndex].nodeType, data.nodes[targetIndex].nodeType);
          data.edges[i].edgeIndex = index;
        }
        let tempEdgeHighlight = this.getEdgeHighlight(this.graphpodMeta, data.edges[i].eHPropertyId, data.edges[i].edgeProperties, data.edges[i].edgeIndex);

        if (sourceLatLogValue.latitude != null && sourceLatLogValue.longitude != null) {
          sourceLinePoints.push(sourceLatLogValue.latitude);
          sourceLinePoints.push(sourceLatLogValue.longitude);
          polylinePointsArray.push(sourceLinePoints);
        }
        if (targetLatLogValue.latitude != null && targetLatLogValue.longitude != null) {
          targetLinePoints.push(targetLatLogValue.latitude);
          targetLinePoints.push(targetLatLogValue.longitude);
          polylinePointsArray.push(targetLinePoints);
        }
        this.addPolyLine(sourceLinePoints, targetLinePoints, popupData, tempEdgeHighlight);
      }
    }
  }

  /**
   * 
   * @param title  --- popup title
   * @param properties  --- object key value pair
   * @returns 
   */
  private getPopupData(title: any, properties: any) {
    let data = "<h4>" + title + "</h4><hr>";
    let temProperties = this.helperService.convertStringObjectToArray(properties);
    if (temProperties != null) {
      temProperties.sort(this.helperService.sortAlphaNum('name'));
      let isFound = this.helperService.isItemExist(temProperties, 'id', "name");
      if (isFound != -1) {
        var removedObject = temProperties.splice(isFound, 1)[0];
        temProperties.unshift(removedObject);
      }
      data += "<table class='table table-bordered table-striped mb-0'>";
      for (let i = 0; i < temProperties.length; i++) {
        data += "<tr><td class='td-word-wrap'><b>" + temProperties[i].name + "</b></td><td class='td-word-wrap'>" + temProperties[i].value + "</td></tr>";
      }
      data += "</table>";
    }
    return data;
  }


  private getIndexByNodeType(graphpodMeta: IGraphpod, nodeType: string): string {
    if (graphpodMeta != null && graphpodMeta.nodeInfo != null) {
      for (let i = 0; i < graphpodMeta.nodeInfo.length; i++) {
        if (nodeType == graphpodMeta.nodeInfo[i].nodeType) {
          return i.toString();
        }
      }
    }
    return ""
  }

  private getNodeHighlight(graphpod: IGraphpod, nHPropertyId: string, nodeProperties: string, nodeIndex: string) {
    try {
      var result = null;
      if (nHPropertyId == null && graphpod.nodeInfo[nodeIndex].highlightInfo != null) {
        let tempNodeProperties = this.helperService.convertStringObjectToJson(nodeProperties);
        let attrName = graphpod.nodeInfo[nodeIndex].highlightInfo.propertyId.attrDispName;
        nHPropertyId = tempNodeProperties[attrName];
      }

      if (graphpod.nodeInfo[nodeIndex].highlightInfo != null) {
        var tempPInfo = graphpod.nodeInfo[nodeIndex].highlightInfo.propertyInfo;
        var tempType = graphpod.nodeInfo[nodeIndex].highlightInfo.type;
        for (var i = 0; i < tempPInfo.length; i++) {
          if (tempType == 'numerical') {
            if (tempPInfo[i].endRange != null
              && nHPropertyId >= tempPInfo[i].startRange
              && nHPropertyId <= tempPInfo[i].endRange) {
              result = tempPInfo[i].propertyValue;
              break;
            }
            if (tempPInfo[i].endRange == null
              && nHPropertyId >= tempPInfo[i].startRange) {
              result = tempPInfo[i].propertyValue;
              break;
            }

          } else {
            if (nHPropertyId == tempPInfo[i].propertyName) {
              result = tempPInfo[i].propertyValue;
              break;
            }
          }
        }
      }
      if (result != null) {
        return result;
      }
      else {
        let bgColor = graphpod.nodeInfo[nodeIndex].nodeBackgroundColor;
        let color = this.leafletMapService.bgDarkMap[bgColor];
        if (typeof color != 'undefined') {
          return color.dark_color;
        }
        //return 'black';
        return 'grey';
      }
    } catch (e) {
      console.log("not fount" + e);
      return "";
    }
  }

  private getIndexByEdgeType(graphpodData: any, edgeType: string, sorurceNodeType: string, targetNodeType: string): any {
    let tempEdgeArray = [];
    if (graphpodData != null && graphpodData.edgeInfo != null) {
      for (let i = 0; i < graphpodData.edgeInfo.length; i++) {
        if (edgeType == graphpodData.edgeInfo[i].edgeType) {
          graphpodData.edgeInfo[i].index = i;
          tempEdgeArray.push(graphpodData.edgeInfo[i]);
        }
      }
    }
    if (tempEdgeArray != null && tempEdgeArray.length > 0) {
      for (let i = 0; i < tempEdgeArray.length; i++) {
        let tempSourceType = tempEdgeArray[i].sourceNodeType != null ? tempEdgeArray[i].sourceNodeType.trim() : null;
        let tempTargetType = tempEdgeArray[i].targetNodeType != null ? tempEdgeArray[i].targetNodeType.trim() : null;

        if ((tempSourceType == sorurceNodeType.trim() && tempTargetType == targetNodeType.trim())
          || tempTargetType == sorurceNodeType.trim() && tempSourceType == targetNodeType.trim()) {
          return tempEdgeArray[i].index;
        }
      }
    }
  }

  private getEdgeHighlight(graphpod: IGraphpod, eHPropertyId: string, edgeProperties: string, edgeIndex: string) {
    try {
      var result = null;
      if ((eHPropertyId == null || eHPropertyId == "null") && graphpod.edgeInfo[edgeIndex].highlightInfo != null) {
        let tempEdgeProperties = this.helperService.convertStringObjectToJson(edgeProperties);
        let attrName = graphpod.edgeInfo[edgeIndex].highlightInfo.propertyId.attrDispName;
        eHPropertyId = tempEdgeProperties[attrName];
      }
      if (graphpod.edgeInfo[edgeIndex].highlightInfo != null) {
        var tempPInfo = graphpod.edgeInfo[edgeIndex].highlightInfo.propertyInfo;
        var tempType = graphpod.edgeInfo[edgeIndex].highlightInfo.type;
        for (var i = 0; i < tempPInfo.length; i++) {
          if (tempType == 'numerical') {

            if (tempPInfo[i].endRange != null
              && eHPropertyId >= tempPInfo[i].startRange
              && eHPropertyId <= tempPInfo[i].endRange) {
              result = tempPInfo[i].propertyValue;
              break;
            }
            if (tempPInfo[i].endRange == null
              && eHPropertyId >= tempPInfo[i].startRange) {

              result = tempPInfo[i].propertyValue;
              break;
            }
          } else {
            if (eHPropertyId == tempPInfo[i].propertyName) {
              result = tempPInfo[i].propertyValue;
              break;
            }
          }
        }
      }
      if (result != null) {
        return result;
      } else {
        return "#a5abb6"//"#6ac6ff";//'#cccccc';
      }
    } catch (e) {
      return "#a5abb6"//"#6ac6ff";//"#cccccc"
    }
  }

  private getCenterCoordinates(mapResult: any): any {
    let lagLogVale = null;
    if (mapResult != null && mapResult.nodes != null) {
      for (let i = 0; i < mapResult.nodes.length; i++) {
        lagLogVale = this.getLatLogValue(mapResult.nodes[i].nodeProperties);
        if (lagLogVale != null && lagLogVale.latitude != null && lagLogVale.longitude != null) {
          break;
        }
      }
    }
    return lagLogVale;
  }

  private getLatLogValue(poperty: any) {
    let result = null;
    let tempProperty = this.helperService.convertStringToJson(poperty);
    if (tempProperty != null) {
      let latitude = tempProperty["latitude"] || tempProperty["lat"] || tempProperty["Latitude"];
      latitude = latitude != null ? latitude.split(" ")[0] : null;
      let longitude = tempProperty["longitude"] || tempProperty["long"] || tempProperty["lon"] || tempProperty["Longitude"];
      longitude = longitude != null ? longitude.split(" ")[0] : null;
      result = {};
      result.latitude = latitude;
      result.longitude = longitude;
    }
    return result;
  }

}
