import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AppConfig, LayoutService } from "./service/app.layout.service";
import { SessionService } from '../shared/services/session.service';
import { SubjectService } from '../shared/services/subject.service';
import { ILogin } from '../login/auth.model';
import { Subscription } from 'rxjs';
import { AppConfigService } from '../app-config.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit, OnDestroy {

  @ViewChild('menubutton') public menuButton!: ElementRef;
  @ViewChild('topbarmenubutton') public topbarMenuButton!: ElementRef;
  @ViewChild('topbarmenu') public menu!: ElementRef;
  protected session: ILogin;
  protected menuItems!: MenuItem[];
  protected userName: any;
  protected currentItem: boolean = false;
  protected logo = './assets/layout/images/';
  protected subscriptions: Subscription; //Array used for unsubscribing observales  
  protected themeConfig: AppConfig;
  protected isUserLocked:boolean=false;
  protected password:string;
  protected themeSettingVisible:boolean=false;

  
  constructor(public layoutService: LayoutService, private sessionService: SessionService, private subjectShare: SubjectService,
    private appConfigService: AppConfigService
  ) {
    this.themeSettingVisible = this.appConfigService.themeSettingVisible;
  }

  protected openModal(): void {
    this.currentItem = true;
  }

  protected handleModalClose(): void {
    this.currentItem = false;
  }

  protected handleModalEscape(): void {
    this.currentItem = true; 
  }

  ngOnInit() {
    this.setLogo()
    this.session = this.sessionService.getData();
    this.userName = this.session.userName;
    // this.isConfigSettings=this.appConfigService.isConfigSetting
    this.isUserLocked=false;
    this.menuItems = [
      // {
      //   label: 'Profile',
      //   icon: 'pi pi-fw pi-user'
      // },
      {
        label: 'About Us',
        icon: 'pi pi-fw pi-info'
      },
      {
        label: 'Lock Screen',
        icon: 'pi pi-fw pi-lock'
      },
      {
        label: 'Logout',
        icon: 'pi pi-fw pi-sign-out',
        command: (event) => this.logout()
      }
    ];
  }
  protected lockScreen(){
      this.isUserLocked = true;
  }

  private setLogo(){
    const observableTemp=this.subjectShare.themeBehaviour.asObservable().subscribe({
      next: (response: AppConfig) => {
        this.logo='./assets/layout/images/'
       if(response.colorScheme.includes('light')){
        this.logo = this.logo + 'logo-dark.png'
       }
       else{
        this.logo = this.logo + 'logo-light.png'
       }
      }
    });
    //this.addSubscribe(observableTemp);
  }
  
  protected logout() {
    this.sessionService.logout();
  }

  protected menuItemClicked(label: string) {
    if (label === 'Logout') {
      this.logout();
    } else if (label === 'About Us') {
      this.openModal();
    } else  if (label === 'Lock Screen'){
      this.lockScreen();
    }
  }

  protected unsubscribeAboutUs(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAboutUs();
  }

  protected onConfigButtonClick() {
    this.layoutService.showConfigSidebar();
}
  protected isUserLockedChanged(isUserLockedChanged) {
    this.isUserLocked = isUserLockedChanged;
  }
  public toggleButtonVisibility() {
    this.appConfigService.setButtonVisibility(!this.themeSettingVisible);
    this.themeSettingVisible = this.appConfigService.themeSettingVisible;
  }
}