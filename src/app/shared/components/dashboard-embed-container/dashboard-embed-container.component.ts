import { Component, Input, OnInit } from '@angular/core';
import { AppConfigService } from 'src/app/app-config.service';
import { MetaType } from '../../enums/api/meta-type.enum';
import { CommonService } from '../../services/common.service';
import { DashboardEmbedContainerService } from './dashboard-embed-container.service';

@Component({
  selector: 'app-dashboard-embed-container',
  templateUrl: './dashboard-embed-container.component.html',
  styleUrls: ['./dashboard-embed-container.component.scss']
})
export class DashboardEmbedContainerComponent implements OnInit {
  private dashboardData: any;
  errorTitle: string;
  errorContent: any;
  isError: boolean;
  ErrorContent: any;
  constructor(
    private dashboardEmbedContainerService: DashboardEmbedContainerService,
    private appConfigService: AppConfigService,
    private commonService: CommonService) { }

  url: string = "/app/index.html#!/dashboard/{{id}}?embed=true&token={{token}}";
  @Input() id: string;
  @Input() filters: { key: string, value: string }[];
  @Input() spinner;
  @Input() version;
  @Input() customUrl: any = null;
  private filterParam: any[] = [];
  isURLReady: boolean = false;

  ngOnInit(): void { }
  ngAfterViewInit() {
    //let baseUrl = "http://localhost:8081";
    //let baseUrl = "https://dev.inferyx.com/framework";
    if (this.customUrl == null) {
      let baseUrl = this.appConfigService.getBaseUrl();
      this.url = baseUrl + this.url;
      this.url = this.url.replace("{{id}}", this.id);
      console.log(this.filters)
      if (this.filters && this.filters.length) {
        this.commonService.getOnyByUuidAndVersion(MetaType.DASHBOARD, this.id, this.version).subscribe(res => {
          if (res.filterInfo && res.filterInfo.length) {
            try {
              this.filters.forEach(f => {
                console.log(res.filterInfo.filter(val => val.attrName === f.key))
                this.filterParam.push(
                  {
                    ref: res.filterInfo.filter(val => val.attrName === f.key)[0].ref,
                    attrId: res.filterInfo.filter(val => val.attrName === f.key)[0].attrId,
                    value: f.value
                  }
                );
              })
              console.log(this.filterParam)
              if (this.filterParam.length) {
                this.url = this.url + `&filterInfo=${btoa(JSON.stringify(this.filterParam))}`
              }
            } catch (error) {

            }
          }
          this.getApplicationToken();
        })
      }
      else {
        this.getApplicationToken();
      }
    } else {
      this.url =this.customUrl;
      this.isURLReady = true;
    }
  }

  private getApplicationToken() {
    this.isURLReady = false;
    this.dashboardEmbedContainerService.getApplicationToken().subscribe({
      next: (response: any) => {
        this.isURLReady = false;
        if (response != null) {
          this.url = this.url.replace("{{token}}", response.token);
          if (localStorage.getItem('theme') == 'body-dark' || localStorage.getItem('theme') == 'dark')
            this.url = this.url + '&darkmode=true';
          if (localStorage.getItem('theme') == 'body-light' || localStorage.getItem('theme') == 'light')
            this.url = this.url + '&darkmode=false';
          this.isURLReady = true;
        }
      },
      error: (response: any) => {
        this.errorTitle = 'Operation Failed';
        this.errorContent = response.error;
        this.isError = true;
        this.ErrorContent = response != null && response.error != null ? response.error : response;
      }
    });
  }


}
