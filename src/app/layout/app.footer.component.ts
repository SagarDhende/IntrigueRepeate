import { Component, OnInit } from '@angular/core';
import { LayoutService } from "./service/app.layout.service";
import { AppConfigService } from '../app-config.service';

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html'
})
export class AppFooterComponent implements OnInit {
    protected conpanyInfo = {
        companyName:  "",
        companyLink: "",
        version: ""
     }

    constructor(public layoutService: LayoutService, private appConfigService: AppConfigService) { }

    ngOnInit(): void {
    this.conpanyInfo.companyName = this.appConfigService.getOrgSetting().companyName
    this.conpanyInfo.companyLink = this.appConfigService.getOrgSetting().companyLink
    this.conpanyInfo.version = this.appConfigService.getOrgSetting().version     
}

    
}
