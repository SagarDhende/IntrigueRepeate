import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { DashboardIntegratedContainerService } from './dashboard-integrated-container.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
// import { MenuItem } from 'primeng/api';

import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { SidebarAccordionComponent } from 'ng-sidebar-accordion';
import { INextConfig } from '../../models/next-config.model';
import { NextConfig, ThemeConfig } from 'src/app/app-config';
import { CommonService } from '../../services/common.service';
import { MetaType } from '../../enums/api/meta-type.enum';
import { ChartTypes } from './chart-types';
import { Messages } from './messages';
import { ChartGenerationService } from './chart-generation.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { FilterType } from './filter-type-enum';
import { SubjectService } from '../../services/subject.service';
import { HelperService } from '../../services/helper.service';
import { AppConfig } from 'src/app/layout/service/app.layout.service';
@Component({
  selector: 'app-dashboard-integrated-container',
  templateUrl: './dashboard-integrated-container.component.html',
  styleUrls: ['./dashboard-integrated-container.component.scss']
})
export class DashboardIntegratedContainerComponent implements OnInit {
  @Input() id: string;
  @Input() version:string;
  
  isMaximized: boolean = false;
  pages: any[] = [];
  pages2: any[] = [];
  dashboard: any;
  
  maximized: boolean = false;

  private colorPalette = this.chartGenerationService.colorPalette;
  chartTypeMapping = this.chartGenerationService.chartTypeMapping;
  chartTypeInterchangeMapping = this.chartGenerationService.chartTypeInterchangeMapping;

  pageSizeOptions: { name: string }[] = this.chartGenerationService.pageSizeOptions;
  pageSize: string = 'A2'
  pageOrientationOptions = ['PORTRAIT', 'LANDSCAPE']
  pageOrientation = 'PORTRAIT'
  isoSizes = this.chartGenerationService.isoSizes;
  downloadPdfTitle = '';
  downloadTypeOptions = [
    { id: 1, name: 'PNG Image' },
    { id: 2, name: 'CSV' },
    // { id: 3, name: 'PDF' }
  ]
  downloadTypeOptions2 = [{ id: 2, name: 'CSV' }, { id: 3, name: 'PDF' }]
  downloadType = 1;
  width = this.getIsoSize(this.pageSize).WIDTH_IN;
  height = this.getIsoSize(this.pageSize).HEIGHT_IN;
  dashboardFileName = '';
  dashboardOrientation: 'PORTRAIT' | 'LANDSCAPE' = 'PORTRAIT';
  dashboardPageSize = 'A2';
  dashboardWidth = this.getIsoSize(this.dashboardPageSize).WIDTH_IN;
  dashboardHeight = this.getIsoSize(this.dashboardPageSize).HEIGHT_IN;
  dashboardPages = [];
  selectedPageIndex: number = 0;
  panelOpen: boolean = false;
  nextConfig: INextConfig;
  filterRequired: boolean = false;
  isDashboardFilter: boolean = false;
  isPageFilter: boolean = false;
  filters: any[] = [];
  pageFilters: any[] = [];
  searchApplied: boolean = false;
  themeConfig: AppConfig;
  @ViewChild('contextMenu') contextMenu: ElementRef;
  contextMenuPosition = { x: '0px', y: '0px' };
  clickedTd: any;
  dashboardMeta: any;
  pageFilterApplied: boolean = true;
  protected activeTab: 1;

  constructor(
    private dashboardIntegratedService: DashboardIntegratedContainerService,
    private spinner: NgxSpinnerService,
    private commonService: CommonService, private chartGenerationService: ChartGenerationService, private sanitizer: DomSanitizer,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private subjectShareService: SubjectService,
    private helperService: HelperService) {
    // this.nextConfig = NextConfig.config;
    // this.themeConfig = NextConfig.config;
    // this.subjectShareService.themeBehaviour.asObservable().subscribe({
    //   next: (response: ThemeConfig) => {
    //     this.themeConfig = null;
    //     this.themeConfig = response;
    //   }
    // })commented by Mangesh old theme config

    const observableTemp=this.subjectShareService.themeBehaviour.asObservable().subscribe({
      next: (response: AppConfig) => {
        this.themeConfig = null;
        this.themeConfig = response;
      }
    });
    // this.addSubscribe(observableTemp);
  }

  ngOnInit(): void {
    this.getDashboardMeta();
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.contextMenu?.nativeElement.contains(event.target)) {
      this.hideContextMenu();
    }
  }

  // Refresh dashboard by Get Meta -> Execute -> Get One by uuid -> Get Vizpods
  public refreshDashboard() {
    this.dashboard = null;
    this.pages2 = []
    this.dashboardPages = [];
    this.getDashboardMeta();
  }

  // Get isoSize for selected pageSize from "isoSizes"
  public getIsoSize(pageSize: string) {
    return this.isoSizes.filter(x => x.SIZE == pageSize)[0]
  }

  public hideContextMenu() {
    if (this.contextMenu) {
      this.contextMenu.nativeElement.style.display = 'none';
    }

  }

  /***********Start Filter*******************************************************************************************************************************/
  public panelToggle(): any {
    if (this.panelOpen) {
      this.panelClose();
    } else {
      this.panelOpen = true;
    }

  }

  public panelClose(): any {
    this.panelOpen = false;
  }

  public applyFilter(): void {
    this.searchApplied = true;
    this.pageFilterApplied = true;
    let filterInfo = { filterInfo: [] };
    this.filters.forEach((filter: any) => {
      let item: any = {};
      if (filter.selected != null) {
        switch (filter.filterType) {
          case FilterType.DATE:
          case FilterType.CALENDAR: {
            let value = this.ngbDateParserFormatter.format(filter.selected);
            item.attrId = filter.attrId;
            item.ref = { type: filter.ref.type, uuid: filter.ref.uuid };
            item.value = value;
            break;
          };
          case FilterType.SINGLE: {
            item.attrId = filter.attrId;
            item.ref = { type: filter.ref.type, uuid: filter.ref.uuid };
            item.value = filter.selected[0].value;
            break;
          };
          case FilterType.MULTIPLE:
          default: {
            const value = filter.selected.reduce((result: any, item: any, index: number) => {
              if (index === 0)
                return item.value;
              else
                return result + ',' + item.value;
            }, '');
            item.attrId = filter.attrId;
            item.ref = { type: filter.ref.type, uuid: filter.ref.uuid };
            item.value = value;
            break;
          }
        }
        filterInfo.filterInfo.push(item);
      }
    });
    this.panelOpen = false;
    this.executeDashboard(this.dashboardMeta.pageInfo[this.selectedPageIndex].pageId, filterInfo);
  }

  // Make filters for dashboard
  private makeFilters(filterInfo, firstSelect) {
    console.log(filterInfo)
    this.filters = [];
    const observables = [];
    filterInfo.forEach(filter => {
      if (filter.filterType == 'SINGLE' || filter.filterType == 'CALENDAR' || filter.filterType == 'DATE') {
        filter = { ...filter, ...{ selected: null, emptyFilterMessage: Messages.LOADING } }
      }
      else {
        filter = { ...filter, ...{ selected: [], emptyFilterMessage: Messages.LOADING } }
      }
      this.filters.push(filter)
      observables.push(this.getAttributeData(filter, this.filters.length - 1, firstSelect))
    });
    forkJoin(observables).subscribe(
      (responses) => {
        // All attribute data requests have completed here
        this.applyFilter()
      },
      (error) => {
        // Handle errors here
        console.error('Error:', error);
      }
    );
  }

  // Get attribute details for each filter
  private getAttributeData(filter: any, filterIndex: number, firstSelect: boolean) {
    return this.dashboardIntegratedService.getAttributeData(filter.ref.uuid, filter.attrId, filter.ref.type, filter.ref.type)
      .pipe(
        catchError((error) => {
          console.error('Error:', error);
          // Handle errors here, for example, set empty data or a specific error message
          this.filters[filterIndex].emptyFilterMessage = Messages.ERROR_LOADING_DATA;
          return of(null); // Return an observable to avoid cancelling the outer observable
        }),
        switchMap((response: any) => {
          if (response.length == 0) {
            this.filters[filterIndex].emptyFilterMessage = Messages.NO_RECORD_FOUND;
          }
          this.filters[filterIndex] = { ...this.filters[filterIndex], ...{ data: response } };
          if (firstSelect) {
            if (this.filters[filterIndex].filterType == FilterType.DATE || this.filters[filterIndex].filterType == FilterType.CALENDAR) {
              this.filters[filterIndex].selected = this.setNgbDateFromString(this.filters[filterIndex].data[0].value);
            } else if (filter.filterType == FilterType.MULTIPLE) {
              this.filters[filterIndex].selected = [this.filters[filterIndex].data[0]];
            }
            else {
              this.filters[filterIndex].selected.push(this.filters[filterIndex].data[0]);
            }
            console.log(this.filters[filterIndex]);
          }
          return of(response); // Return the response to the outer observable
        })
      );
  }
  private setNgbDateFromString(dateString: string): NgbDate | null {
    try {
      const parsedDate = this.ngbDateParserFormatter.parse(dateString);
      if (parsedDate) {
        return NgbDate.from(parsedDate);
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
    return null;
  }

  /***********End Filter*********************************************************************************************************************************/


  /**********Start Dashboard Execute*********************************************************************************************************************/

  // Handle dashboard page change event
  public pageChange(event) {
    let page = this.pages2[event.index]
    this.selectedPageIndex = event.index;
    console.log(page)
    if (!page.firstLoad) {
      page.rows.forEach((row, rowIndex) => {
        row.cols.forEach((col, colIndex) => {
          if (col.section.vizExecInfo)
            this.getVizpodData(this.id, this.selectedPageIndex, rowIndex, col.section.vizExecInfo.version, colIndex, col.section, false)
        });
      });
      page.firstLoad = true;
    }

    let pageInfo = this.dashboardMeta.pageInfo[event.index]
    this.pageFilters.push({ [pageInfo.pageId]: pageInfo.filterInfo })
    if (pageInfo.filterInfo && pageInfo.filterInfo.length) {
      this.isPageFilter = true;
      this.isDashboardFilter = false;
      this.filterRequired = true;
      this.panelOpen = true;
      this.pageFilterApplied = false;
      this.makeFilters(pageInfo.filterInfo, this.dashboardMeta.refreshOnOpen == 'Y' ? true : false)
    } else {
      this.executeDashboard(this.dashboardMeta.pageInfo[this.selectedPageIndex].pageId);
    }
  }

  // Get dashboard meta properties
  private getDashboardMeta() {
    debugger
    this.spinner.show('dashboardSpinner')
    this.dashboardIntegratedService.getDashboardMeta(this.id).subscribe((response: any) => {
      console.log(response)
      this.dashboardMeta = response;

      let currentPage = 0;
      this.dashboardMeta.pageInfo.forEach((info, infoIndex) => {
        let _page2: any = {}
        _page2['pageTitle'] = info.pageTitle;
        _page2['rows'] = []
        _page2['firstLoad'] = false
        info.sectionInfo.forEach((section, sectionIndex) => {
          section['isMaximized'] = false;
          section['isGrid'] = false;
          section['isGridChart'] = false;
          section['chartData'] = undefined;
          console.log(`Section ${sectionIndex} - colNo: ${section.colNo}, rowNo: ${section.rowNo}`);

          // this.getVizpodData(this.id, infoIndex, sectionIndex, section.vizExecInfo.version)
          if (!_page2.rows.filter(x => x.rowNo == section.rowNo).length) {
            _page2.rows.push({ rowNo: section.rowNo, cols: [{ colNo: section.colNo, section: section }], colSize: 1 })
            // if (currentPage == 0)
            // this.getVizpodData(this.id, infoIndex, _page2.rows.length - 1, section.vizExecInfo.version, 0, section, false)
          } else if (_page2.rows.filter(x => x.rowNo == section.rowNo).length) {
            let filteredRow = _page2.rows[_page2.rows.findIndex(x => x.rowNo == section.rowNo)]
            filteredRow.cols.push({
              colNo: section.colNo, section: section
            })
            filteredRow.colSize = filteredRow.colSize + 1
            // if (currentPage == 0)
            // this.getVizpodData(this.id, infoIndex, _page2.rows.length - 1, section.vizExecInfo.version, filteredRow.cols.length - 1, section, false)
          }
        })
        currentPage = currentPage + 1;
        // this.pages.push(_page)
        if (!this.selectedPageIndex) {
          this.pages2.push(_page2)
          if (this.pages2.length) {
            this.pages2[0].firstLoad = true;
          }
        }
        this.dashboardPages.push(_page2.pageTitle)
        console.log(this.pages2)
        this.spinner.hide('dashboardSpinner')

      });


      if (response.type == 'DETAIL') {
        this.filterRequired = true;
        this.panelOpen = true;
        if (response.filterInfo && response.filterInfo.length) {
          this.isDashboardFilter = true;
          this.isPageFilter = false;
          this.spinner.hide('dashboardSpinner')
          this.makeFilters(response.filterInfo, this.dashboardMeta.refreshOnOpen == 'Y' ? true : false)
        }
        else {
          let pageInfo = response.pageInfo[this.selectedPageIndex]
          this.pageFilters.push({ [pageInfo.pageId]: pageInfo.filterInfo })
          if (pageInfo.filterInfo && pageInfo.filterInfo.length) {
            this.isPageFilter = true;
            this.isDashboardFilter = false;
            this.makeFilters(pageInfo.filterInfo, this.dashboardMeta.refreshOnOpen == 'Y' ? true : false)
          }
          console.log(pageInfo.filterInfo)
          console.log(this.filters)
          console.log(this.pageFilters)
          this.executeDashboard(response.pageInfo[0].pageId);
        }
      }
      else {
        console.log(response.type)
        response.pageInfo.forEach((pageInfo) => {
          this.pageFilters.push({ [pageInfo.pageId]: pageInfo.filterInfo })
          if (pageInfo.filterInfo && pageInfo.filterInfo.length) {
            this.isPageFilter = true;
            this.isDashboardFilter = false;
            // this.makeFilters(pageInfo.filterInfo)
          }
        });
        this.filterRequired = false;
        this.searchApplied = true;
        console.log(this.filters)
        console.log(this.pageFilters)
        this.executeDashboard(response.pageInfo[0].pageId);
      }
    })
  }

  // Execute dashboard by id and filters
  private executeDashboard(pageId, filterInfo?) {
    debugger
    this.spinner.show('dashboardSpinner')
    if (!filterInfo) {
      filterInfo = {}
    }
    this.dashboardIntegratedService.execute(this.id, pageId, filterInfo).subscribe((resp: any) => {
      let response: any = resp
      this.dashboardIntegratedService.getOne(response.uuid, response.version, pageId).subscribe((res) => {
        this.dashboard = res;
        this.spinner.hide('dashboardSpinner')
        this.dashboardFileName = this.dashboard.dashboard.name;
        // let currentPage = 0;
        this.dashboard.pageInfoView.forEach((info, infoIndex) => {
          let _page2: any = {}
          _page2['pageTitle'] = info.pageTitle;
          _page2['rows'] = []
          _page2['firstLoad'] = false
          info.sectionViewInfo.forEach((section, sectionIndex) => {
            section['isMaximized'] = false;
            section['isGrid'] = false;
            section['isGridChart'] = false;
            section['chartData'] = undefined;
            // this.getVizpodData(this.id, infoIndex, sectionIndex, section.vizExecInfo.version)
            if (!_page2.rows.filter(x => x.rowNo == section.rowNo).length) {
              _page2.rows.push({ rowNo: section.rowNo, cols: [{ colNo: section.colNo, section: section }], colSize: 1 })
              // if (currentPage == 0)
              this.getVizpodData(this.id, infoIndex, _page2.rows.length - 1, section.vizExecInfo.version, 0, section, false)
            } else if (_page2.rows.filter(x => x.rowNo == section.rowNo).length) {
              let filteredRow = _page2.rows[_page2.rows.findIndex(x => x.rowNo == section.rowNo)]
              filteredRow.cols.push({
                colNo: section.colNo, section: section
              })
              filteredRow.colSize = filteredRow.colSize + 1
              // if (currentPage == 0)
              this.getVizpodData(this.id, infoIndex, _page2.rows.length - 1, section.vizExecInfo.version, filteredRow.cols.length - 1, section, false)
            }
          })
          // currentPage = currentPage + 1;
          this.pages2[this.selectedPageIndex] = _page2;
          console.log(this.pages2)
          // this.pages.push(_page)
          // if (!this.selectedPageIndex) {
          //   this.pages2.push(_page2)
          //   if (this.pages2.length) {
          //     this.pages2[0].firstLoad = true;
          //   }
          // }
          // this.dashboardPages.push(_page2.pageTitle)


        });

      })

    })
  }

  // Get Individual vizpod data
  private getVizpodData(id: string, pageIndex: number, rowIndex: number, version: string, colIndex: number, section, refresh: boolean) {
    var changesCount = 0;
    if (refresh) {
      changesCount = section.chartData.changes + 1;
    }

    section.chartData = {
      title: section.name,
      chartType: section.vizpodInfo.type,
      data: [],
      dimensions: [],
      series: [],
      changes: changesCount,
      colorPalette:
        section.vizpodInfo.colorPalette,
      colNames: [],
      colNamesFiltered: [],
      chartMessage: Messages.LOADING,
      menuOptions: false,
      headerMenuOptions: false,
      dragDisabled: true,
      isDrilDown: section.vizpodInfo.isDrilDown,
      vizpodInfo: section.vizpodInfo,
      vizExecInfo: section.vizExecInfo,
      level: 0,
      section: section
    }

    this.spinner.show('spinner_' + pageIndex + '_' + rowIndex + '_' + colIndex,)
    this.dashboardIntegratedService.getVispod(id, version, section.vizExecInfo.uuid).subscribe((res: any) => {
      this.spinner.hide('spinner_' + pageIndex + '_' + rowIndex + '_' + colIndex,)
      section.chartData.dataResponse = JSON.parse(JSON.stringify(res.data));
      section.chartData.data = JSON.parse(JSON.stringify(res.data));
      if (res.data) {
        switch (section.vizpodInfo.type) {
          case ChartTypes.NETWORK_GRAPH:
            section.isNetwork = true;
            section.isGridChart = true;
            if (res.data.nodes) {
              if (!res.data.nodes.length) {
                section.chartData.chartMessage = Messages.NO_DATA_FOUND
              } else {
                this.getOnyByUuidAndVersion(section, section.vizpodInfo.source.ref.uuid, MetaType.GRAPHPOD)
              }
            } else {
              section.chartData.chartMessage = Messages.NO_DATA_FOUND
            }
            break;
          case ChartTypes.SCORE_CARD:
            section.isScoreCard = true;
            section.isGridChart = true;

            if (!res.data.length) {
              section.chartData.chartMessage = Messages.NO_DATA_FOUND
            } else {
              section.chartData.data = res.data;
              section.chartData.chartMessage = '';
            }
            break;
          case ChartTypes.FORM_CARD:
            section.isFormCard = true;
            section.isGridChart = true;
            if (!res.data.length) {
              section.chartData.chartMessage = Messages.NO_DATA_FOUND
            } else {
              section.chartData.data = res.data;
              section.chartData.chartMessage = '';
            }
            break;
          case ChartTypes.IMAGE:
            section.isImage = true;
            section.isGridChart = true;
            if (!res.data.length) {
              section.chartData.chartMessage = Messages.NO_DATA_FOUND
            } else {
              section.chartData.data = res.data;
              this.chartGenerationService.getImageData(section.chartData.data[0][section.vizpodInfo.values[0].attributeName]).subscribe(res => {
                section.chartData.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(res);
              })
              section.chartData.chartMessage = '';
            }
            break;
          case ChartTypes.TIMELINE:
            section.isTimeLine = true;
            section.isGridChart = true;
            if (!res.data.length) {
              section.chartData.chartMessage = Messages.NO_DATA_FOUND
            } else {
              section.chartData.data = res.data;
              section.chartData.chartMessage = '';
            }
            break;
          case ChartTypes.SANKEY:
            section.isSankey = true;
            section.isGridChart = true;
            if (!res.data) {
              section.chartData.chartMessage = Messages.NO_DATA_FOUND
            } else {
              section.chartData.data = res.data;
              section.chartData.chartMessage = '';
            }
            break;
          default:
            if (res.data.length) {
              Object.keys(res.data[0]).forEach(element => {
                section.chartData.colNames.push({ name: element, visible: true });
                section.chartData.colNamesFiltered.push({ name: element, visible: true });
                section.chartData.chooseCols = section.chartData.colNamesFiltered;
              })
              section.chartData.chartMessage = '';
            }
            else {
              section.chartData.chartMessage = Messages.NO_DATA_FOUND
            }
        }
      }else { 
        section.chartData.chartMessage = Messages.NO_DATA_FOUND
      }


      section.chartData.changes = section.chartData.changes + 1;
      section.spinner = false;

      if (section.chartData.chartType == ChartTypes.BAR_CHART) {
        section.chartData.dimensions.push(section.vizpodInfo.keys[0].attributeName)
      }
      else {
        section.vizpodInfo.keys.forEach(key => {
          section.chartData.dimensions.push(key.attributeName)
        });
      }
      
      let chartType = this.chartTypeMapping[section.chartData.chartType]
      section.vizpodInfo.values.forEach(value => {
        let seriesItem: any = {
          id: (value.function ? value.function + '_' : '') + (value.attributeName ? value.attributeName : value.ref.name),
          name: (value.function ? value.function + '_' : '') + (value.attributeName ? value.attributeName : value.ref.name),
          type: chartType
        }
        seriesItem = this.chartGenerationService.getAdditionalParams(section.chartData.chartType, seriesItem, section)
        section.chartData.dimensions.push((value.function ? value.function + '_' : '') + (value.attributeName ? value.attributeName : value.ref.name))
        if (seriesItem.length) {
          section.chartData.series = seriesItem;
        } else if (section.chartData.chartType == ChartTypes.SCATTER_3D) {
          section.chartData.series = [seriesItem];
        } else {
          section.chartData.series.push(seriesItem)
        }
      });
    })
  }

  /**********End Dashboard Execute***********************************************************************************************************************/


  /***********Start Dashboard Icons**********************************************************************************************************************/

  // Material CDK Drag and Drop for Vizpods
  public drop(event: CdkDragDrop<string[]>, pageIndex: number) {
    console.log(event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex, event.previousContainer.id, event.container.id)
    if (event.previousContainer.id == event.container.id) {
      console.log(event)
      console.log(event.container.data, event.previousIndex, event.currentIndex)
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
    else {
      console.log(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex)
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }

    this.pages2.forEach(page => {
      page.rows.forEach((row, rowIndex) => {
        if (row.colSize != row.cols.length) {
          row.colSize = row.cols.length;
          row.cols.forEach((col, colIndex) => {
            this.refreshVizpod(pageIndex, col, rowIndex, colIndex, col.section)
          });
        }
      });
    })
    console.log(this.pages2[pageIndex]);
  }

  // Download the complete dashboard
  public downloadDashboard() {
    this.dashboardMeta.downloadOptions = false;
    var pdfElement = document.getElementById('dashboardContainer');
    // width: Math.round(pdfElement.scrollWidth / 96),
    let options: any = {
      orientation: (this.dashboardOrientation || 'portrait').toLowerCase(),
      unit: 'in',
      format:
        this.dashboardPageSize == 'CUSTOM' ?
          [this.dashboardWidth + 0.2, this.dashboardHeight + 1] :
          (this.dashboardPageSize || 'a2').toLowerCase(),
    }
    var pdf = new jspdf.jsPDF(options);


    // pdfElement.style.width = '1024px';
    const hideUnwantedElements = function (t) {
      const elementsToHide = document.querySelectorAll('.hideWhilePdfGeneration');
      if (t) {
        elementsToHide.forEach(e => {
          e.classList.add('hidden');
        })
      } else {
        elementsToHide.forEach(e => {
          e.classList.remove('hidden');
        })
      }
    }
    this.dashboardPages.forEach((element, pageIndex) => {
      this.draw(element, pageIndex, pdfElement, pdf)
    })
  }
  // Draw dashboard and save as pdf
  private draw(element, pageIndex, pdfElement, pdf) {

    const wait = 1000;
    setTimeout(() => {
      html2canvas(pdfElement, {
        allowTaint: true,
      }).then((canvas) => {
        var imgData = canvas.toDataURL('image/jpeg, 1.0');

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const pdfHeightOriginal = pdf.internal.pageSize.getHeight();
        setTimeout(() => {
          pdf.addImage(imgData, 'jpeg', 0, 0, pdfWidth, (pdfHeightOriginal < pdfHeight ? pdfHeightOriginal : pdfHeight) - 0);

          pdf.save((this.dashboardFileName || 'InferyxDashboard') + '.pdf')
          pdfElement.style.width = '100%';
        }, 1000)
      })
    }, wait);

  }
  /***********End Dashboard Icons**************************************************************************************************************************/

  /***********Start Vizpod Icons**************************************************************************************************************************/
  // Refresh Individual Vizpod
  public refreshVizpod(pageIndex: number, col, rowIndex: number, colIndex: number, section) {
    this.getVizpodData(this.id, pageIndex, rowIndex, section.vizExecInfo.version, colIndex, section, true)
  }
  // Change chart type based on "chartTypeInterchangeMapping"
  public changeChartType(section, item) {
    section.chartData.chartType = item.value
    console.log(section)
    section.chartData.colName = [];
    section.chartData.colNamesFiltered = [];
    if (section.chartData.data.length) {
      Object.keys(section.chartData.data[0]).forEach(element => {
        section.chartData.colNames.push({ name: element, visible: true })
        section.chartData.colNamesFiltered.push({ name: element, visible: true })
      })
      section.chartData.chartMessage = '';
    }
    else {
      section.chartData.chartMessage = Messages.NO_DATA_FOUND
    }
    // section.chartData.changes = section.chartData.changesCount + 1;
    section.spinner = false;
    section.chartData.dimensions = []
    section.chartData.series = []
    if (section.chartData.chartType == ChartTypes.BAR_CHART) {
      section.chartData.dimensions.push(section.vizpodInfo.keys[0].attributeName)
    }
    else {
      section.vizpodInfo.keys.forEach(key => {
        section.chartData.dimensions.push(key.attributeName)
      });
    }
    let chartType = this.chartTypeMapping[section.chartData.chartType]
    section.vizpodInfo.values.forEach(value => {
      let seriesItem = {
        id: value.attributeName,
        name: value.attributeName,
        type: chartType
      }
      seriesItem = this.chartGenerationService.getAdditionalParams(section.chartData.chartType, seriesItem, section)

      section.chartData.dimensions.push(value.attributeName)
      section.chartData.series.push(seriesItem)
      // res.forEach(dataVal => {
      //   section.chartData.dimensions.push(dataVal[value.attributeName])

      // });
    });
    console.log(section)
    section.chartData.changes = section.chartData.changes + 1;
    // console.log(section)
  }
  // drillUp 
  public drillUp(section: any) {
    this.chartGenerationService.drill('UP', section.chartData).subscribe(opt => {
      console.log(opt)
      if (opt) {
        section.chartData = opt;
        section.chartData.changes = section.chartData.changes + 1;
      }
    })
  }

  // Download Vizpod csv from API
  public downloadVizpod(pageIndex: number, rowIndex: number, colIndex: number) {
    let section = this.pages2[pageIndex].rows[rowIndex].cols[colIndex].section;
    this.dashboardIntegratedService.downloadVizpod(this.id, section.version,
      section.uuid).subscribe((res: any) => {

        const csv = res;
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = this.downloadPdfTitle + '.csv';
        link.click();
      });
  }
  // Download Chart dialog submit
  public downloadChartUsingOptions(pageIndex: number, rowIndex: number, colIndex: number) {
    let section = this.pages2[pageIndex].rows[rowIndex].cols[colIndex].section;
    section.chartData.headerMenuOptions = false;
    setTimeout(() => {
      if (this.downloadType == 1) {
        this.exportDivToPNG('chart_panel_' + pageIndex + '_' + rowIndex + '_' + colIndex, this.downloadPdfTitle);
      }
      if (this.downloadType == 2) {
        this.downloadVizpod(pageIndex, rowIndex, colIndex);
      }
      if (this.downloadType == 3) {
        this.exportFilteredPdf(rowIndex, colIndex);
      }
    }, 200);
  }
  // Convert currently visible data to pdf and Download
  private exportFilteredPdf(rowIndex: number, colIndex: number) {
    let gridId = 'chart_grid__' + rowIndex + '_' + colIndex;
    const grid = document.getElementById(gridId);
    if (!grid) {
      console.error('Table not found.');
      return;
    }

    const gridHTML = grid.outerHTML;
    const content = `
        <html>
        <head>
          <title>Export to PDF</title>
          <style>
            /* Add any necessary CSS styles here */
          </style>
        </head>
        <body>
          ${gridHTML}
        </body>
        </html>
      `;

    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    newWindow?.focus();

  }
  // Convert Div to canvas and download as PNG
  private exportDivToPNG(id: string, name: string) {
    const divToExport = document.getElementById(id);
    setTimeout(() => {

      if (!divToExport) {
        console.error('Div not found.');
        return;
      }

      html2canvas(divToExport).then(canvas => {
        // Convert canvas to data URL
        const imgData = canvas.toDataURL('image/png');

        // Create a temporary link element to download the PNG image
        const link = document.createElement('a');
        link.href = imgData;
        link.download = name + '.png';
        link.click();

        // Clean up the temporary link element
        link.remove();
      });
    }, 200);
  }
  /***********End Vizpod Icons***************************************************************************************************************************/

  /***********Start Grid *********************************************************************************************************************************/
  public onChangeColumn(section: any): void {
    section.chartData.colNamesFiltered.filter((col: any) => {
      let isColPresent = this.helperService.isItemExist(section.chartData.chooseCols, col.name, 'name');
      col.visible = isColPresent != -1 ? true : false;
    })
  }

  // get column from vizpod keys and values for grid
  public getGridColumn(item: any, section: any): any {
    let column = section.vizpodInfo.keys.filter(x => x.attributeName == item.name)
    if (column.length) {
      return column[0]
    } else {
      return section.vizpodInfo.values.filter(x => x.attributeName == item.name)[0]
    }
  }

  public onTdRightClick(event: any, section: any, clicked): void {
    // Prevent the default browser context menu
    event.preventDefault();
    console.log(event)
    this.contextMenuPosition.x = event.layerX + 30 + 'px';
    this.contextMenuPosition.y = event.layerY + 30 + 'px';
    this.showContextMenu();
    this.clickedTd = section;
    console.log(clicked, section)
    if (section.chartData['clickedParam'])
      section.chartData['clickedParam'] = { ...section.chartData['clickedParam'], ...{ [clicked.name]: clicked.item[clicked.name] } };
    else
      section.chartData['clickedParam'] = { [clicked.name]: clicked.item[clicked.name] }
  }

  public onContextMenuClick(event: MouseEvent): void {
    // handle context menu item clicks
    const optionClicked = (event.target as HTMLElement).innerText;
    if (optionClicked === 'Drill-to-Detail') {
      alert('Option 1 clicked!');
    } else if (optionClicked === 'Drill-Down') {
      // if (this.options.level > 0) {
      this.chartGenerationService.drill('DOWN', this.clickedTd.chartData).subscribe(opt => {
        console.log(opt)
        if (opt) {
          this.clickedTd.chartData = opt;
          console.log(this.clickedTd.chartData)
        }
      })
    }
    this.hideContextMenu();
  }

  private showContextMenu(): void {
    // logic to show context menu
    this.contextMenu.nativeElement.style.top = this.contextMenuPosition.y;
    this.contextMenu.nativeElement.style.left = this.contextMenuPosition.x;
    this.contextMenu.nativeElement.style.display = 'block';
  }


  /***********End Grid ***********************************************************************************************************************************/

  /***********Start Score Card******************************************************************************************************************************/
  // Returns score card background color
  public getScoreCardBgColor(palette: any): any {
    if (this.chartGenerationService.colorPalette[palette]) {
      return this.chartGenerationService.colorPalette[palette][2]
    } else {
      return '#' + palette;
    }
  }
  /***********End Score Card********************************************************************************************************************************/

  /***********Start Network Graph**************************************************************************************************************************/
  // Get One bye Uuid and Version for graphpod meta
  private getOnyByUuidAndVersion(section, entityUuid: string, type: string) {
    this.commonService.getOnyByUuidAndVersion(type, entityUuid, '').subscribe({
      next: (response) => {
        console.log(response)
        section.graphpodMeta = response;
        section.chartData.chartMessage = '';
      },
      error: (response) => {
        // this.isLinkAnalysisError = true;
        // this.linkAnalysisErrorContent = response != null && response.error != null ? response.error : response;
        // this.spinner.hide("alert-graph-analysis");

      }
    })
  }
  /***********End Network Graph****************************************************************************************************************************/




  // Convert currently visible data to csv and Download---NOT Using
  /*public exportFilteredCsv(chartData) {
    let toExport = []
    chartData.data.forEach(data => {
      let newData = {};
      chartData.colNamesFiltered.forEach(colName => {
        debugger
        Object.keys(data).forEach(key => {
          if (key == colName.name) {
            newData = { ...newData, ...{ [key]: data[key] } }
          }
        })
      });
      toExport.push(newData)
    });
    const csvContent = this.chartGenerationService.jsonToCSVString(toExport);

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = chartData.title + '.csv';
    a.click();

    window.URL.revokeObjectURL(url);
  }*/
}
