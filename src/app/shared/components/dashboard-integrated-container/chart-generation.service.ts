import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, map, of, switchMap } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';
import { ChartTypes } from './chart-types';

@Injectable({
  providedIn: 'root'
})
export class ChartGenerationService {
  baseUrl = this.appConfigService.getBaseUrl();

  public readonly colorPalette = {
    "Palette 1": ["#4a4e4d", "#0e9aa7", "#3da4ab", "#f6cd61", "#fe8a71"],
    "Palette 2": ["#008744", "#0057e7", "#d62d20", "#ffa700", "#29a8ab"],
    "Palette 3": ["#edc951", "#eb6841", "#cc2a36", "#4f372d", "#00a0b0"],
    "Palette 4": ["#F6BDC0", "#F1959B", "#F07470", "#EA4C46", "#DC1C13"],
    "Palette 5": ["#C5E8B7", "#ABE098", "#83D475", "#57C84D", "#2EB62C"],
    "Palette 6": ["#57C84D", "#2EB62C", "#F07470", "#EA4C46", "#DC1C13"],
    "Palette 7": ["#dfff11", "#66ff00", "#ff08e8", "#fe01b1", "#be03fd", "#ff000d", "#ffcf09", "#8f00f1", "#fffc00", "#08ff08", "#ffcf00", "#fc8427"],
    "Palette 8": ["#fd933b", "#2e747d", "#b92f83", "#472f61", "#e6de0d", "#f9392c"],
    Standard: ["#73c6b6", "#f8c471", "#d98880", "#7dcea0", "#c39bd3", "#f1948a", "#bb8fce", "#7fb3d5", "#85c1e9", "#76d7c4", "#82e0aa", "#f7dc6f", "#f0b27a", "#e59866"] //Don't change key value
  }

  public readonly chartTypeMapping = {
    [ChartTypes.BAR_CHART]: 'bar',
    [ChartTypes.PIE_CHART]: 'pie',
    [ChartTypes.DONUT_CHART]: 'pie',
    [ChartTypes.BAR_LINE_CHART]: 'line',
    [ChartTypes.AREA_CHART]: 'line',
    [ChartTypes.BUBBLE_CHART]: 'scatter',
    [ChartTypes.DATA_GRID]: 'grid',
    [ChartTypes.SCATTER_CHART]: 'scatter',
    [ChartTypes.INDONESIA_MAP]: 'map',
    [ChartTypes.USA_MAP]: 'map',
    [ChartTypes.WORLD_MAP]: 'map',
    [ChartTypes.WORLD_MAP_BUBBLE]: 'map',
    [ChartTypes.STACKED_BAR_CHART]: 'bar',
    [ChartTypes.SCATTER_3D]: 'scatter3D'
  }

  public readonly chartTypeInterchangeMapping = {
    [ChartTypes.BAR_CHART]: [ChartTypes.BAR_CHART, ChartTypes.PIE_CHART, ChartTypes.DONUT_CHART, ChartTypes.BAR_LINE_CHART, ChartTypes.AREA_CHART, ChartTypes.BUBBLE_CHART, ChartTypes.SCATTER_CHART],
    [ChartTypes.PIE_CHART]: [ChartTypes.BAR_CHART, ChartTypes.PIE_CHART, ChartTypes.DONUT_CHART, ChartTypes.BAR_LINE_CHART, ChartTypes.AREA_CHART, ChartTypes.BUBBLE_CHART, ChartTypes.SCATTER_CHART],
    [ChartTypes.DONUT_CHART]: [ChartTypes.BAR_CHART, ChartTypes.PIE_CHART, ChartTypes.DONUT_CHART, ChartTypes.BAR_LINE_CHART, ChartTypes.AREA_CHART, ChartTypes.BUBBLE_CHART, ChartTypes.SCATTER_CHART],
    [ChartTypes.BAR_LINE_CHART]: [ChartTypes.BAR_CHART, ChartTypes.PIE_CHART, ChartTypes.DONUT_CHART, ChartTypes.BAR_LINE_CHART, ChartTypes.AREA_CHART, ChartTypes.BUBBLE_CHART, ChartTypes.SCATTER_CHART],
    [ChartTypes.AREA_CHART]: [ChartTypes.BAR_CHART, ChartTypes.PIE_CHART, ChartTypes.DONUT_CHART, ChartTypes.BAR_LINE_CHART, ChartTypes.AREA_CHART, ChartTypes.BUBBLE_CHART, ChartTypes.SCATTER_CHART],
    [ChartTypes.BUBBLE_CHART]: [ChartTypes.BAR_CHART, ChartTypes.PIE_CHART, ChartTypes.DONUT_CHART, ChartTypes.BAR_LINE_CHART, ChartTypes.AREA_CHART, ChartTypes.BUBBLE_CHART, ChartTypes.SCATTER_CHART],
    [ChartTypes.DATA_GRID]: [ChartTypes.DATA_GRID],
    [ChartTypes.STACKED_BAR_CHART]: [ChartTypes.STACKED_BAR_CHART],
    [ChartTypes.SCATTER_CHART]: [ChartTypes.BAR_CHART, ChartTypes.PIE_CHART, ChartTypes.DONUT_CHART, ChartTypes.BAR_LINE_CHART, ChartTypes.AREA_CHART, ChartTypes.BUBBLE_CHART, ChartTypes.SCATTER_CHART]
  }

  public readonly pageSizeOptions: { name: string }[] = [{ name: 'A0' }, { name: 'A1' }, { name: 'A2' }, { name: 'A3' }, { name: 'B0' }, { name: 'B1' }, { name: 'B2' }, { name: 'B3' }, { name: 'LETTER' }, { name: 'LEGAL' }, { name: 'CUSTOM' }];
  public readonly isoSizes = [
    {
      "SIZE": "LETTER",
      "WIDTH (mm)": "215.9",
      "HEIGHT (mm)": "279.4",
      "WIDTH_IN": "8.5",
      "HEIGHT_IN": "11"
    },
    {
      "SIZE": "LEGAL",
      "WIDTH (mm)": "215.9",
      "HEIGHT (mm)": "355.6",
      "WIDTH_IN": "8.5",
      "HEIGHT_IN": "14"
    },
    {
      "SIZE": "A0",
      "WIDTH (mm)": "841",
      "HEIGHT (mm)": "1,189",
      "WIDTH_IN": "33.11",
      "HEIGHT_IN": "46.81"
    },
    {
      "SIZE": "A1",
      "WIDTH (mm)": "594",
      "HEIGHT (mm)": "841",
      "WIDTH_IN": "23.39",
      "HEIGHT_IN": "33.11"
    },
    {
      "SIZE": "A2",
      "WIDTH (mm)": "420",
      "HEIGHT (mm)": "594",
      "WIDTH_IN": "16.54",
      "HEIGHT_IN": "23.39"
    },
    {
      "SIZE": "A3",
      "WIDTH (mm)": "297",
      "HEIGHT (mm)": "420",
      "WIDTH_IN": "11.69",
      "HEIGHT_IN": "16.54"
    },
    {
      "SIZE": "A4",
      "WIDTH (mm)": "210",
      "HEIGHT (mm)": "297",
      "WIDTH_IN": "8.27",
      "HEIGHT_IN": "11.69"
    },
    {
      "SIZE": "A5",
      "WIDTH (mm)": "148",
      "HEIGHT (mm)": "210",
      "WIDTH_IN": "5.83",
      "HEIGHT_IN": "8.27"
    },
    {
      "SIZE": "A6",
      "WIDTH (mm)": "105",
      "HEIGHT (mm)": "148",
      "WIDTH_IN": "4.13",
      "HEIGHT_IN": "5.83"
    },
    {
      "SIZE": "A7",
      "WIDTH (mm)": "74",
      "HEIGHT (mm)": "105",
      "WIDTH_IN": "2.91",
      "HEIGHT_IN": "4.13"
    },
    {
      "SIZE": "B0",
      "WIDTH (mm)": "1,028",
      "HEIGHT (mm)": "1,456",
      "WIDTH_IN": "40.48",
      "HEIGHT_IN": "57.32"
    },
    {
      "SIZE": "B1",
      "WIDTH (mm)": "707",
      "HEIGHT (mm)": "1,000",
      "WIDTH_IN": "28.66",
      "HEIGHT_IN": "40.48"
    },
    {
      "SIZE": "B2",
      "WIDTH (mm)": "514",
      "HEIGHT (mm)": "728",
      "WIDTH_IN": "20.24",
      "HEIGHT_IN": "28.66"
    },
    {
      "SIZE": "B3",
      "WIDTH (mm)": "364",
      "HEIGHT (mm)": "514",
      "WIDTH_IN": "14.33",
      "HEIGHT_IN": "20.24"
    },
    {
      "SIZE": "B4",
      "WIDTH (mm)": "257",
      "HEIGHT (mm)": "364",
      "WIDTH_IN": "10.12",
      "HEIGHT_IN": "14.33"
    },
    {
      "SIZE": "B5",
      "WIDTH (mm)": "182",
      "HEIGHT (mm)": "257",
      "WIDTH_IN": "7.17",
      "HEIGHT_IN": "10.12"
    },
    {
      "SIZE": "B6",
      "WIDTH (mm)": "128",
      "HEIGHT (mm)": "182",
      "WIDTH_IN": "5.04",
      "HEIGHT_IN": "7.17"
    }
  ]
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) { }



  public getImageData(filePath: string): Observable<any> {
    return this.http.get(this.baseUrl + '/file/download?fileType=VIZPOD&fileName=' + filePath, { responseType: 'blob' }).pipe(
      switchMap(blob => this.blobToBase64(blob)),
      catchError(err => {
        console.error("Error converting blob to base64:", err);
        return of('Error');
      })
    );
  }



  // Convert JSON data to CSV
  public jsonToCSVString(jsonData: any[]): string {
    const header = Object.keys(jsonData[0]).join(',') + '\n';
    const rows = jsonData.map(obj => Object.values(obj).join(',')).join('\n');
    return header + rows;
  }

  // Tree structure generation for Echarts Tree Heatmap
  public toTreeStructure(data: any[], hierarchy: string[], section) {
    const tree = { name: "root", value: 0, children: [] };

    data.forEach(item => {
      let currentLevel = tree;

      hierarchy.forEach((key, index) => {
        const currentKeyValue: string = item[key as keyof typeof item];

        // Check if the current key value already exists in the children
        let childNode = (currentLevel.children || []).find(child => child.name === currentKeyValue);

        if (!childNode) {
          childNode = { name: currentKeyValue, value: 0 };
          currentLevel.children = currentLevel.children || [];
          currentLevel.children.push(childNode);
        }

        if (index === hierarchy.length - 1) {
          // Leaf node
          childNode.value += item[section.vizpodInfo.values[0].attributeName];
        } else {
          // For non-leaf nodes, update the total value
          childNode.value += item[section.vizpodInfo.values[0].attributeName];
        }

        currentLevel = childNode;
      });
    });

    return tree.children;
  }
  // Get Additional properties for echarts chart types
  public getAdditionalParams(type, seriesItem, section) {
    let chartData = section.chartData;
    switch (type) {
      case ChartTypes.DONUT_CHART:
        seriesItem = {
          ...seriesItem, ...{
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
          }
        }
        chartData.data = []

        chartData.dataResponse.forEach(item => {
          let mergedRow = chartData.data.filter(x => x[chartData.dimensions[0]] == item[chartData.dimensions[0]])
          if (mergedRow.length) {

            mergedRow[0][chartData.dimensions[1]] = mergedRow[0][chartData.dimensions[1]] + item[chartData.dimensions[1]]

          } else {
            chartData.data.push(item)
          }
        })

        chartData.xAxis = {
          type: 'category', axisLine: { show: false }
        }
        chartData.yAxis = { axisLine: { show: false } }
        break;
      case ChartTypes.PIE_CHART:
        seriesItem = {
          ...seriesItem, ...{
            radius: '70%',
          }
        }
        chartData.data = []

        chartData.dataResponse.forEach(item => {
          let mergedRow = chartData.data.filter(x => x[chartData.dimensions[0]] == item[chartData.dimensions[0]])
          if (mergedRow.length) {

            mergedRow[0][chartData.dimensions[1]] = mergedRow[0][chartData.dimensions[1]] + item[chartData.dimensions[1]]

          } else {
            chartData.data.push(item)
          }
        })
        console.log(chartData.data)
        console.log('0000-------------------------------------------')
        chartData.xAxis = {
          type: 'category', axisLine: { show: false }
        }
        chartData.yAxis = { axisLine: { show: false } }
        break;
      case ChartTypes.AREA_CHART:
        seriesItem = {
          ...seriesItem, ...{
            areaStyle: {}
          }
        }
        chartData.data = []

        chartData.dataResponse.forEach(item => {
          let mergedRow = chartData.data.filter(x => x[chartData.dimensions[0]] == item[chartData.dimensions[0]])
          if (mergedRow.length) {

            mergedRow[0][chartData.dimensions[1]] = mergedRow[0][chartData.dimensions[1]] + item[chartData.dimensions[1]]

          } else {
            chartData.data.push(item)
          }
        })
        chartData.xAxis = {
        }
        chartData.yAxis = {
          type: 'category'
        }
        break;
      case ChartTypes.BUBBLE_CHART:
        seriesItem = {
          ...seriesItem, ...{
            symbolSize: (val: number[]) => { return Math.sqrt(val[seriesItem.name]) / 35 },
          }
        }
        chartData.data = JSON.parse(JSON.stringify(chartData.dataResponse));
        chartData.xAxis = {
          type: 'category'
        }
        chartData.yAxis = {}
        break;
      case ChartTypes.DATA_GRID:
        section.isGrid = true;
        section.isGridChart = true;
        if (section.chartData.isDrilDown == 'Y') {
          chartData.data = []
          chartData.dataResponse.forEach(element => {
            let item = {}
            item = { ...item, ...{ [section.vizpodInfo.keys[0].attributeName]: element[section.vizpodInfo.keys[0].attributeName] } }
            item = { ...item, ...{ [section.vizpodInfo.values[0].attributeName]: element[section.vizpodInfo.values[0].attributeName] } }
            chartData.data.push(item);
            console.log(chartData, '-------------------------------------------------------------')
            chartData.dimensions = [];
            chartData.dimensions = [{ name: section.vizpodInfo.keys[0].attributeName, visible: true }, { name: section.vizpodInfo.values[0].attributeName, visible: true }]
            chartData.colNames = [{ name: section.vizpodInfo.keys[0].attributeName, visible: true }, { name: section.vizpodInfo.values[0].attributeName, visible: true }]
            chartData.colNamesFiltered = [{ name: section.vizpodInfo.keys[0].attributeName, visible: true }, { name: section.vizpodInfo.values[0].attributeName, visible: true }]
            chartData.chooseCols = chartData.colNamesFiltered
          });
        } else {
          chartData.data = JSON.parse(JSON.stringify(chartData.dataResponse));
        }
        break;
      case ChartTypes.PIVOT_TABLE:
        section.isGrid = true;
        section.isGridChart = true;
        chartData.data = JSON.parse(JSON.stringify(chartData.dataResponse));
        section.vizpodInfo.groups.forEach(group => {
          section.chartData.colNames.forEach((col, i) => {
            if (col.name == group.attributeName) {
              section.chartData.colNames.splice(i, 1);
              section.chartData.colNamesFiltered.splice(i, 1);
            }
          });
        });
        break;
      case ChartTypes.BAR_CHART:
        if (section.vizpodInfo.layout == 'HORIZONTAL') {
          chartData.xAxis = {
            type: 'category'
          }
          chartData.yAxis = {}
        } else {
          chartData.yAxis = {
            type: 'category'
          }
          chartData.xAxis = {}
        }
        chartData.data = JSON.parse(JSON.stringify(chartData.dataResponse));
        break;
      case ChartTypes.STACKED_BAR_CHART:

        let groupName = section.vizpodInfo.groups[0].attributeName;
        let keyName = section.vizpodInfo.keys[0].attributeName;
        let groups = [
          ...new Set(section.chartData.data.map((item) => item[groupName]))
        ];
        let uniqueCodes = [
          ...new Set(section.chartData.data.map((item) => item[keyName]))
        ];
        let sums = {};
        for (let data of section.chartData.data) {
          if (!sums[data[groupName]]) {
            sums[data[groupName]] = {};
          }
          if (!sums[data[groupName]][data[keyName]]) {
            sums[data[groupName]][data[keyName]] = 0;
          }
          sums[data[groupName]][data[keyName]] +=
            data.opening_balance;
        }
        seriesItem = uniqueCodes.map((status, index) => {
          return {
            name: status,
            type: "bar",
            stack: "total",
            itemStyle: {
              color: this.colorPalette[chartData.colorPalette][index % this.colorPalette[chartData.colorPalette].length]
            },
            emphasis: {
              focus: "series"
            },
            data: groups.map((product: any) => sums[product] && sums[product][status] ? sums[product][status] : 0)
          };
        });

        section.chartData.legend = {
          data: uniqueCodes
        };
        if (section.vizpodInfo.layout == 'HORIZONTAL') {
          chartData.xAxis = {
            type: 'category',
            data: groups
          }
          chartData.yAxis = {}
        } else {
          chartData.yAxis = {
            type: 'category',
            data: groups
          }
          chartData.xAxis = {}
        }
        chartData.data = JSON.parse(JSON.stringify(chartData.dataResponse));
        break;
      case ChartTypes.SCATTER_CHART:
        chartData.data = JSON.parse(JSON.stringify(chartData.dataResponse));
        chartData.xAxis = {
        }
        chartData.yAxis = {
          type: 'category'
        }

        break;
      case ChartTypes.NETWORK_GRAPH:
        chartData.data = JSON.parse(JSON.stringify(chartData.dataResponse));
        break;
      case ChartTypes.INDONESIA_MAP:
        seriesItem = { ...seriesItem, ...{ mapType: 'Indonesia', "left": "20%", "right": "20%" } }
        break;
      case ChartTypes.USA_MAP:
        seriesItem = { ...seriesItem, ...{ mapType: 'Usa', "left": "20%", top: "0%", bottom: "0%" } }
        break;
      case ChartTypes.WORLD_MAP:
        seriesItem = { ...seriesItem, ...{ mapType: 'World', "left": "0%", "right": "0%" } }
        break;
      case ChartTypes.WORLD_MAP_BUBBLE:
        seriesItem = { ...seriesItem, ...{ type: 'pie', coordinateSystem: 'geo', symbolSize: (val: number[]) => { return Math.sqrt(val[seriesItem.name]) / 7.5 }, } }
        break;
      case ChartTypes.TREE_HEAT_MAP:
        section.isGridChart = true;
        // chartData.data = JSON.parse(JSON.stringify(chartData.dataResponse));
        let keys = []
        section.vizpodInfo.keys.forEach(key => {
          keys.push(key.attributeName)
        });
        chartData.keys = keys;
        chartData.valueName = section.vizpodInfo.values[0].attributeName;
        chartData.data = this.toTreeStructure(chartData.dataResponse, keys, section);
        break;
      case ChartTypes.SCATTER_3D:
        chartData = {
          ...chartData, ...{
            grid3D: {},
            xAxis3D: {
              type: 'category'
            },
            yAxis3D: {},
            zAxis3D: {},
          }
        }
        seriesItem = {
          type: this.chartTypeMapping[ChartTypes.SCATTER_3D],
          symbolSize: 2.5,
          encode: {
            x: section.vizpodInfo.values[0].attributeName,
            y: section.vizpodInfo.values[1].attributeName,
            z: section.vizpodInfo.values[2].attributeName,
            tooltip: [0, 1, 2, 3, 4]
          }
        }
        chartData.data = JSON.parse(JSON.stringify(chartData.dataResponse));
        break;
      default:
        chartData.data = JSON.parse(JSON.stringify(chartData.dataResponse));
        chartData.xAxis = {
          type: 'category'
        }
        chartData.yAxis = {}
    }
    return seriesItem
  }



  public drill(type: 'UP' | 'DOWN', options): any {
    let opt = new Subject();
    if ((options.level < options.vizpodInfo.keys.length - 1 && type == 'DOWN') || (type == 'UP' && options.level > 0)) {

      let levels = [];
      let filterInfo = [];
      if (type == 'DOWN') {
        options.level = options.level + 1;
      } else {
        options.level = options.level - 1;
      }
      for (let index = 0; index < options.level; index++) {
        const element = options.vizpodInfo.keys[index];
        levels.push(element.attributeName);
        console.log(options)
        filterInfo.push({ ref: element.ref, attrId: element.attributeId, value: options.clickedParam[element.attributeName] })
      }
      levels.push(options.vizpodInfo.keys[options.level].attributeName)
      // }
      // else {
      //   options.level = options.level + 1;
      //   const element = options.vizpodInfo.keys[0];
      //   level = element.attributeName;
      //   filterInfo.push({ ref: element.ref, attrId: element.attributeId, value: this.clickedParam[element.attributeName] })
      // }
      let level = '';
      levels.forEach((element, i) => {
        if (i == 0) {
          level = element
        }
        else if (i > 0 && i < levels.length) {
          level = level + ',' + element
        }
      });

      this.getDrillDownDetails(options.vizExecInfo.uuid, options.vizExecInfo.version, level, filterInfo).subscribe(response => {
        console.log(response)
        options.data = response;
        options.dataResponse = response;
        options.section.chartData.data = response;
        options.section.chartData.data = []
        options.dimensions = [];

        options.dimensions.push(options.vizpodInfo.keys.filter(x => x.attributeName == levels[levels.length - 1])[0].attributeName)

        options.dimensions.push(options.vizpodInfo.values[0].attributeName)
        options.colNames = [];
        options.colNamesFiltered = [];
        options.dimensions.forEach(element => {
          options.colNames.push({ name: element });
          options.colNamesFiltered.push({ name: element });
        });
        options.section.chartData.dataResponse.forEach(item => {
          let mergedRow = options.section.chartData.data.filter(x => x[options.section.chartData.dimensions[0]] == item[options.section.chartData.dimensions[0]])
          if (mergedRow.length) {

            mergedRow[0][options.section.chartData.dimensions[1]] = mergedRow[0][options.section.chartData.dimensions[1]] + item[options.section.chartData.dimensions[1]]

          } else {
            options.section.chartData.data.push(item)
          }
        })
        // options.section.chartData.series[0] = this.chartGenerationService.getAdditionalParams(options.section.chartData.chartType, options.section.chartData.series[0], options.section)

        console.log(options)
        opt.next(options);
      })
    }
    return opt;
  }

  // Get Drill-Down details
  private getDrillDownDetails(uuid: string, version: string, level: string, filterInfo: any[]) {
    return this.http.post(this.baseUrl + '/vizpod/getVizpodResults?type=vizexec&uuid=' + uuid + '&version=' + version + '&action=view&snapshotFlag=N&refreshFlag=Y&level=' + level, { "filterInfo": filterInfo });
  }
  private blobToBase64(blob: Blob): Observable<string> {
    return new Observable<string>((observer) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        observer.next(reader.result as string);
        observer.complete();
      };
      reader.onerror = (err) => {
        observer.error(err);
      };
      reader.readAsDataURL(blob);
    });
  }
}
