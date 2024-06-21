import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { AppConfigService } from 'src/app/app-config.service';

@Component({
  selector: 'app-dashboard-containter',
  templateUrl: './dashboard-containter.component.html',
  styleUrl: './dashboard-containter.component.scss'
})
export class DashboardContainterComponent implements OnInit, AfterViewInit {

  @Input({ required: true }) public id: string;
  @Input() public option: any;
  @Input() spinner:any;

  
  protected errorPosition: string;
  protected messageHead: string;
  protected errorContent: string;
  protected errorTitle: string;
  protected isTokenError: boolean;
  protected isTokenConfig:boolean;
  protected url: string;
  protected isUrlReady: boolean

  constructor(private commonService: CommonService,private appConfigService:AppConfigService) { }

  ngOnInit(): void {
    this.isUrlReady = false;
    this.errorTitle = 'Operation Failed';
    this.messageHead = 'Operation Failed';
    this.url = "/app/index.html#!/dashboard/{{id}}?embed=true&token={{token}}&darkmode=false";
  }

  ngAfterViewInit(): void {
    let baseUrl = this.appConfigService.getBaseUrl();
    //let baseUrl = "https://dev.inferyx.com/framework";
    this.url = baseUrl + this.url;
    this.url = this.url.replace("{{id}}", this.id);
    this.getApplicationToken();
  }

  private getApplicationToken(): void {
    this.isTokenError=false;
    this.isTokenConfig=false;
    this.commonService.getApplicationToken().subscribe({
      next: (response: any) =>{
        if (response != null) {
          this.url = this.url.replace("{{token}}", response.token);
          this.isUrlReady = true;
          this.isTokenConfig=true;
        }
      },
      error: (response: any) => {
        this.isTokenError=true;
        this.errorContent=response
      }
    })
  }

}
