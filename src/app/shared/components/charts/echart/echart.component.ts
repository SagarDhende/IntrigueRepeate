import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import 'echarts-gl';
import { ThemeConfig } from 'src/app/app-config';
import { SubjectService } from 'src/app/shared/services/subject.service';
import * as indonesiaData from 'src/assets/maps_geo/indonesia.json'
import * as usaData from 'src/assets/maps_geo/usa.json';
import * as worldMapData from 'src/assets/maps_geo/world.json';
import { ChartTypes } from '../../dashboard-integrated-container/chart-types';
import { ChartGenerationService } from '../../dashboard-integrated-container/chart-generation.service';
import { AppConfig } from 'src/app/layout/service/app.layout.service';
@Component({
  selector: 'app-echart',
  templateUrl: './echart.component.html',
  styleUrls: ['./echart.component.scss']
})
export class EchartComponent implements OnInit, OnChanges {
  @Input() options;
  @Input() chartId;
  @Input() refresh = 0;
  @ViewChild('contextMenu') contextMenu: ElementRef;

  private colors = {
    0: '#98543',
    1: '#43524',
    2: '#70233',
    3: '#bcbcbc',
    4: '#eeffee',
    5: '#ff0000',
    6: '#fff000',
  };

  private colorPalette = this.chartGenerationService.colorPalette;
  private chart = null;
  clickedParam: any;
  
  constructor(private elm: ElementRef, private subjectShareService: SubjectService, private chartGenerationService: ChartGenerationService) { }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refresh']) {
      if (changes['refresh'].firstChange) {
        // this.makeChart();
      }
      else {
        if (this.chart)
          echarts.dispose(this.chart)
        this.makeChart()
      }
    }
  }

  ngOnInit(): void {
  }

  private makeChart() {
    if (
      this.options.chartType == ChartTypes.BAR_CHART ||
      this.options.chartType == ChartTypes.STACKED_BAR_CHART ||
      this.options.chartType == ChartTypes.PIE_CHART ||
      this.options.chartType == ChartTypes.BAR_LINE_CHART ||
      this.options.chartType == ChartTypes.DONUT_CHART ||
      this.options.chartType == ChartTypes.BUBBLE_CHART ||
      this.options.chartType == ChartTypes.AREA_CHART ||
      this.options.chartType == ChartTypes.SCATTER_CHART ||
      this.options.chartType == ChartTypes.INDONESIA_MAP ||
      this.options.chartType == ChartTypes.USA_MAP ||
      this.options.chartType == ChartTypes.WORLD_MAP ||
      this.options.chartType == ChartTypes.WORLD_MAP_BUBBLE ||
      this.options.chartType == ChartTypes.HEAT_MAP ||
      this.options.chartType == ChartTypes.HEAT_MAP_2 ||
      this.options.chartType == ChartTypes.TREE_HEAT_MAP ||
      this.options.chartType == ChartTypes.SCATTER_3D
    ) {
      let tempTheme = {} as ThemeConfig;
      tempTheme.bodyBackground = 'body-light'
      this.subjectShareService.themeBehaviour.asObservable().subscribe({
        next: (response: AppConfig) => {
          if (this.chart) {
            echarts.dispose(this.chart)
          }
          let theme = 'light';
          // if (response.bodyBackground != 'body-dark') {
          //   theme = 'light';
          // }
          // else if (response.bodyBackground == 'body-dark') {
          //   theme = 'dark';
          // }
          const chartElement = window.document.getElementById('_id_' + this.chartId) as HTMLDivElement;
          if (this.options.chartType == ChartTypes.INDONESIA_MAP) {
            echarts.registerMap('Indonesia', indonesiaData as any);
          }
          if (this.options.chartType == ChartTypes.USA_MAP) {
            echarts.registerMap('Usa', usaData as any);
          }
          if (this.options.chartType == ChartTypes.WORLD_MAP || this.options.chartType == ChartTypes.WORLD_MAP_BUBBLE) {
            echarts.registerMap('World', worldMapData as any);
          }
          let options: any = {
            // title: {
            //   text: this.options.title,
            // },
            tooltip: {
              trigger: 'item',
              axisPointer: {
                type: 'shadow',
              },
            },
            legend: {},
            grid: {
              left: '3%',
              right: '4%',
              bottom: '10%',
              containLabel: true,
              width: "100%",
            },
            width: "100%",
            yAxis: this.options.xAxis,
            xAxis: this.options.yAxis,
            dataset: {
              dimensions: this.options.dimensions,
              source: this.options.data,
            },
          }
          if (this.options.chartType != ChartTypes.STACKED_BAR_CHART && this.options.chartType != ChartTypes.SCATTER_3D) {
            options = { ...options, ...{ series: this.getSeries(this.options.series, this.options.colorPalette) } }
          } else if (this.options.chartType == ChartTypes.SCATTER_3D) {
            console.log(this.options)
            options = {
              grid3D: {},
              xAxis3D: {
                type: 'category'
              },
              yAxis3D: {},
              zAxis3D: {},
              dataset: {
                dimensions: this.options.dimensions,
                source: this.options.data
              }, series: this.options.series
            }
          }
          else {
            options = { ...options, ...{ series: this.options.series } }
          }
          
          if (this.options.chartType == ChartTypes.INDONESIA_MAP || this.options.chartType == ChartTypes.USA_MAP) {
            delete options.tooltip.axisPointer;
            options.tooltip = {
              ...options.tooltip, ...{
                "formatter": function (params) {
                  return params.name + ': ' + params.value;
                }
              }
            }
            options = {
              ...options, ...{
                "visualMap": {
                  "min": 0,
                  "max": 38000000,
                  "show": false,
                  "inRange": {
                    "color": this.colorPalette[this.options.colorPalette]
                  }
                }
              }
            }
            console.log(options)
          }
          else if (this.options.chartType == ChartTypes.WORLD_MAP) {
            delete options.tooltip.axisPointer;
            options.tooltip = {
              ...options.tooltip, ...{
                "formatter": function (params) {
                  return params.name + ': ' + params.value;
                }
              }
            }
            options = {
              ...options, ...{
                "visualMap": {
                  "min": 0,
                  "max": 10000000,
                  "show": false,
                  "inRange": {
                    "color": this.colorPalette[this.options.colorPalette]
                  }
                }
              }

            }
          }
          else if (this.options.chartType == ChartTypes.WORLD_MAP_BUBBLE) {
            delete options.tooltip.axisPointer;
            delete options.series[0].data
            options = {
              ...options, ...{
                geo: {
                  map: 'World',
                  roam: true,
                  itemStyle: {
                    areaColor: '#e7e8ea'
                  }
                }
              }
            }
            // options.tooltip = {
            //   ...options.tooltip, ...{
            //     "formatter": function (params) {
            //       return params.name + ': ' + params.value;
            //     }
            //   }
            // }
            // options = {
            //   ...options, ...{
            //     "visualMap": {
            //       "min": 0,
            //       "max": 10000000,
            //       "show": false,
            //       "inRange": {
            //         "color": this.colorPalette[this.options.colorPalette]
            //       }
            //     }
            //   }
            // }
            console.log(options)

          }
          else if (this.options.chartType == ChartTypes.HEAT_MAP || this.options.chartType == ChartTypes.HEAT_MAP_2) {
            let data = this.options.data;
            const heatmapData = data.map(item => {
              let arr = []
              this.options.dimensions.forEach(dimension => {
                arr.push(item[dimension])
              })
              return arr;
            });
            options = {

              tooltip: {
                position: 'top'
              },
              xAxis: {
                type: 'category',
                data: data.map(item => item[this.options.dimensions[0]]),
                splitArea: {
                  show: true
                }
              },
              yAxis: {
                type: 'category',
                data: [...new Set(data.map(item => item[this.options.dimensions[1]]))],  // Extract unique nationalities
                splitArea: {
                  show: true
                }
              },
              visualMap: {
                min: 0,
                max: Math.max(...data.map(item => item[this.options.dimensions[2]])),
                show: false,
                calculable: true
              },
              series: [{
                name: this.options.dimensions[2],
                type: 'heatmap',
                data: heatmapData,
                label: {
                  show: false
                },
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }
              }]
            };
            if (this.options.chartType == ChartTypes.HEAT_MAP_2) {
              options.visualMap = { ...options.visualMap, ...{ color: this.colorPalette[this.options.colorPalette] } }
              console.log(options)
            }
          }
          else if (this.options.chartType == ChartTypes.TREE_HEAT_MAP) {
            options = {
              tooltip: {
                formatter: (info) => {
                  var value = info.value;
                  var treePathInfo = info.treePathInfo;
                  var treePath = [];
                  for (var i = 1; i < treePathInfo.length; i++) {
                    treePath.push(treePathInfo[i].name);
                  }
                  return [
                    '<div class="tooltip-title">' +
                    echarts.format.encodeHTML(treePath.join('/')) +
                    '</div>',
                    this.options.valueName + ': ' + echarts.format.addCommas(value)
                  ].join('');
                }
              }, color: this.colorPalette[this.options.colorPalette],
              series: [
                {
                  type: 'treemap',
                  data: this.options.data,
                  visibleMin: 300,
                  label: {
                    show: true,
                    formatter: '{b}'
                  },
                  itemStyle: {
                    borderColor: '#fff'
                  },
                  levels: this.getLevelOption(),
                }
              ]
            };
          }
          console.log(this.options)
          console.log(options)
          console.log(this.chartId)
          setTimeout(() => {

            this.chart = echarts.init(window.document.getElementById('_id_' + this.chartId), theme);
            this.chart.setOption(options)
          }, 1000);
          if (this.options.isDrilDown == 'Y') {
            chartElement.addEventListener('contextmenu', this.showContextMenu.bind(this));
            this.chart.on('contextmenu', (params) => {
              // 'params' contains information about the clicked section
              // console.log(params.name);  // This will give the name of the clicked section
              // console.log(params.value); // This will give the value of the clicked section
              // console.log(params.data);  // This will give the entire data object of the clicked section
              this.options['clickedParam'] = params.data;
            });
            document.addEventListener('click', this.hideContextMenu.bind(this));
          }
        }
      })
    }
  }
  private getSeries(series, palette) {
    series.forEach((element, i) => {
      series[i] = { ...element, ...{ color: this.colorPalette[palette] } }
    });
    return series
  }
  private getLevelOption() {
    return [
      {
        itemStyle: {
          borderWidth: 0,
          gapWidth: 5
        }
      },
      {
        itemStyle: {
          gapWidth: 1
        }
      },
      {
        colorSaturation: [0.35, 0.5],
        itemStyle: {
          gapWidth: 1,
          borderColorSaturation: 0.6
        }
      }
    ];
  }

  public showContextMenu(event: MouseEvent) {
    event.preventDefault();
    console.log(event)
    this.contextMenu.nativeElement.style.left = `${event.offsetX}px`;
    this.contextMenu.nativeElement.style.top = `${event.offsetY}px`;
    this.contextMenu.nativeElement.style.display = 'block';
  }

  public hideContextMenu() {
    this.contextMenu.nativeElement.style.display = 'none';
  }

  public onContextMenuClick(event: MouseEvent) {
    const optionClicked = (event.target as HTMLElement).innerText;
    if (optionClicked === 'Drill-to-Detail') {
      alert('Option 1 clicked!');
    } else if (optionClicked === 'Drill-Down') {
      // if (this.options.level > 0) {
      this.chartGenerationService.drill('DOWN', this.options).subscribe(opt => {
        console.log(opt)
        if (opt) {
          this.options = opt;
          console.log(this.options)
          this.makeChart();
        }
      })
    }
    this.hideContextMenu();
  }
}
