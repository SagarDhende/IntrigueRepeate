import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { SubjectService } from '../shared/services/subject.service';
import { HelperService } from '../shared/services/helper.service';
import { SessionService } from '../shared/services/session.service';
import { ILogin } from '../login/auth.model';
import { CommonService } from '../shared/services/common.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    protected session: ILogin;
    logo='./assets/layout/images/footer-logo.png'
    model: any[] = [];
    tempModel:any[] = [];
    tempArray:any[] = []
    constructor(public layoutService: LayoutService, private subjectService: SubjectService,
        private helperService: HelperService, private sessionService: SessionService, private commonService: CommonService,
        private router: Router) { }

    ngOnInit() {
        this.session = this.sessionService.getData()
        this.model = [
            {
                label: '',
                items: [
                    { label: 'Application Manager', icon: 'fas fa-desktop', routerLink: ['/application-manager'] },
                    { label: 'Setting', icon: 'pi pi-fw pi-setting', routerLink: ['/case'] },
                ]
            },
        ];
        this.tempArray = [
            {
                label: '',
                items: [
                    { label: 'Application Manager', icon: 'fas fa-desktop', routerLink: ['/application-manager'] },
                    { label: 'Setting', icon: 'pi pi-fw pi-setting', routerLink: ['/case'] },
                ]
            },
        ];
        this.getNavigationItem();
    }

    private getNavigationItem(): void {
        this.tempModel = [{
            label: '',
            items: [
                { id: 'data-visualization', label: 'Home', icon: 'fa-solid fa-house', routerLink: ['/home'] },
                { id: 'data-visualization', label: 'Dashboard', icon: 'fas fa-th-large', routerLink: ['/dashboard'] },
                { id: 'data-visualization', label: 'Reports', icon: 'fa-regular fa-newspaper', routerLink: ['/reports'] },
                { id: 'data-preparation', label: 'Datasets', icon: 'fa-solid fa-database', routerLink: ['/datasets'],routerLinkActiveOptions:{exact: false} },
                { id: 'business-rules', label: 'Rules', icon: 'fa-solid fa-business-time', routerLink: ['/rules'] },
                { id: 'alert-generation', label: 'Alerts', icon: 'fa-solid fa-triangle-exclamation', routerLink: ['/alerts'], routerLinkActiveOptions:{exact: false}  },
                { id: "case-management", label: 'Cases', icon: 'fas fa-briefcase', routerLink: ['/cases'],routerLinkActiveOptions:{exact: false},hidden:false},
                { id: "entity-resolution", label: 'Entities', icon: 'fas fa-users', routerLink: ['/entities'], items: [] },
                { id: 'link-analysis', label: 'Link Analysis', icon: 'fa-solid fa-share-nodes', routerLink: ['/link-analysis'] },
                { id: 'data-science', label: 'Generative AI', icon: 'fa-solid fa-robot', routerLink: ['/generative-ai'] },
                { id: 'what-if-analysis', label: 'What-if Analysis', icon: 'fa-solid fa-flask', routerLink: ['/what-if-analysis']},
                { id: 'simulation', label: 'Simulation', icon: 'fa-solid fa-snowflake', routerLink: ['/simulation'] },
                { id: 'data-pipeline', label: 'Data Pipeline', icon: 'fa fa-random', routerLink: ['/data-pipeline'] },
                { id: 'admin', label: 'Setup', icon: 'fa-solid fa-gear', items:[
                    {label: 'Organization'},
                    {label: 'User'},]},
                ]
        }];
        this.getApplication();
    }
    
    private setDynamicLHSCount(response) {
        if(response != null){
            response.forEach(element => {
                this.model[0].items.forEach((item, index) => {
                    if (item.items) {
                        item.items.forEach((subItem, i) => {
                            if (subItem.label === element.type) {
                                this.model[0].items[index].items[i].count = element.count;
                            }
                        });
                    } else {
                        if (item.label === element.type) {
                            this.model[0].items[index].count = element.count;
                        }
                    }
         })
        })
        }
    }
 
    private getApplication(): void {
        this.subjectService.application$.subscribe({
            next: (response: any) => {
                if(response !=null){
                    this.tempArray[0].items = []
                    if (response != null && response.applicationMenu != null && response.applicationMenu.length) {
                    for (let i = 0; i < response.applicationMenu.length; i++) {
                    if(response.applicationMenu[i].active == "Y"){
                        let applicationMenuInfo: any = {};
                        if(response.applicationMenu[i].type == 'default'){
                        let index = this.helperService.isItemExist(this.tempModel[0].items, response.applicationMenu[i].name, 'label');  
                        if(index != -1){
                            this.tempArray[0].items.push(this.tempModel[0].items[index]) 
                        }
                        }
                        else if(response.applicationMenu[i].type == 'custom' && response.applicationMenu[i].level == 'single'){
                            applicationMenuInfo.id = response.applicationMenu[i].name + "_" + response.applicationMenu[i].menuId;
                            applicationMenuInfo.label = response.applicationMenu[i].name;
                            applicationMenuInfo.icon = response.applicationMenu[i].icon;
                            const encodedData = btoa(response.applicationMenu[i].url); // encode a string   
                            applicationMenuInfo.routerLink = ["/custom-menu/" + encodedData];
                            this.tempArray[0].items.push(applicationMenuInfo)
                        }
                        else if(response.applicationMenu[i].type == 'custom' && response.applicationMenu[i].level == 'multi'){
                            applicationMenuInfo.id = response.applicationMenu[i].name + "_" + response.applicationMenu[i].menuId;
                            applicationMenuInfo.label = response.applicationMenu[i].name;
                            applicationMenuInfo.icon = response.applicationMenu[i].icon;
                            applicationMenuInfo.items = [];
                            if(response.applicationMenu[i].subMenu != null && response.applicationMenu[i].subMenu.length) {
                            for (let j = 0; j < response.applicationMenu[i].subMenu.length; j++) {
                                let subMenuInfo: any = {};
                                subMenuInfo.id = response.applicationMenu[i].subMenu[j].name;
                                subMenuInfo.label = response.applicationMenu[i].subMenu[j].name;
                                const encodedData = btoa(response.applicationMenu[i].subMenu[j].url); // encode a string        
                                subMenuInfo.routerLink = ["/custom-menu/" + encodedData];
                                applicationMenuInfo.items.push(subMenuInfo);
                            }
                         }
                         this.tempArray[0].items.push(applicationMenuInfo)
                      }
                    }
                }
              }
              this.model = this.tempArray
              this.getEntity()
            }
            },
            error: (response: any) => {

            }
        })
    }

    private getLHSCount(){
        const observableTemp=this.commonService.getLhsCounts().subscribe({
          next: (response: any) => {
           this.setDynamicLHSCount(response)
            }
        ,error: (response) => {
          console.log(response);
        },
        complete: () => {
          observableTemp.unsubscribe();
        }
      })
    }

    private getEntity(): void {
        const observableTemp = this.commonService.getEntity().subscribe({
          next: (response) => {
           let entity = [];
            if (response != null && response.length > 0) {
                for (let i = 0; i < response.length; i++) {
                    if (response[i].enableMenu == "Y") {
                        let entityItem: any = {};
                        entityItem.label = response[i].name;
                        entityItem.routerLink = ['/entities',response[i].name, response[i].uuid];
                        entity.push(entityItem);
                    }
                }
                let index = this.helperService.isItemExist(this.tempArray[0].items, 'Entities', 'label');
                if(index != -1)
                this.tempArray[0].items[index].items = entity;
            }
            this.model = this.tempArray;
            this.navigateToFirstItem()
            this.getLHSCount()
          },
          error: (response) => {
            console.log(response);
          },
          complete: () => {
            observableTemp.unsubscribe();
          }
        });
      }

  private navigateToFirstItem(): void{
    let tempArr = this.tempArray[0].items
    for (let i = 0; i < tempArr.length; i++) {
        if (tempArr[i].items == undefined || tempArr[i].items == null) {
            this.router.navigate(tempArr[i].routerLink);  
            break;
        }
    }
  }

}