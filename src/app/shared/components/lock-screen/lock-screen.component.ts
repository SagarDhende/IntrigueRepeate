import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AppConfigService } from 'src/app/app-config.service';
import { CommonService } from '../../services/common.service';
import { Subscriber, Subscription } from 'rxjs';
import { SessionService } from '../../services/session.service';
import { ILogin } from 'src/app/login/auth.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { SubjectService } from '../../services/subject.service';
import { AppConfig } from 'src/app/layout/service/app.layout.service';
import { PasswordModule } from 'primeng/password';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'app-lock-screen',
  standalone: true,
  imports: [ButtonModule,DialogModule,FormsModule,CommonModule,DividerModule,PasswordModule,MessagesModule],
  templateUrl: './lock-screen.component.html',
  styleUrl: './lock-screen.component.scss'
})
export class LockScreenComponent {
  constructor(private configService:AppConfigService,private commonService:CommonService,
    private sessionService:SessionService,private appConfigService:AppConfigService,private subjectService:SubjectService){

  }

  @Input() public isUserLocked:boolean;
  @Output() public isUserLockedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  protected conpanyInfo = {
    companyName:  "",
    companyLink: ""
  } 
  protected currentYear: string;
  protected licenseDetail: any;
  protected subscriptions: Subscription[] = [];
  protected userName: any;
  protected session: ILogin;
  protected password:string;
  protected logo = './assets/layout/images/';
  protected showErrorMessage:any;

  ngOnInit(): void {
    this.setLogo()
    this.session = this.sessionService.getData();
    this.cardLeftHeading.title = this.cardLeftHeading.title  + this.appConfigService.getOrgSetting().title
    this.userName = this.session.userName;
    this.conpanyInfo.companyName = this.configService.getOrgSetting().companyName
    this.conpanyInfo.companyLink = this.configService.getOrgSetting().companyLink
    this.getLicenseInfo();
    var d = new Date();
    this.currentYear = d.getFullYear().toString();
    this.getLicenseInfo();
  }
  protected cardLeftHeading: any = {
    title: "Welcome to ",
    visibility: "visible"
  }
  protected getLicenseInfo() {
    const observableTemp = this.commonService.getLicenseInfo().subscribe({
      next: (response) => {
        this.licenseDetail = response;
        this.getFrameworkVersion();
      },
      error: (response) => {
      }
    });
    this.addSubscribe(observableTemp);
  }
  protected getFrameworkVersion() {
    this.licenseDetail.licenseVersion = this.configService.version;

  }
  private addSubscribe(subscriber: any): void {
    if (subscriber != null && subscriber instanceof Subscriber) {
      this.subscriptions.push(subscriber);
    }
  }
  protected logout():void{
    this.sessionService.logout();
  }
  protected unlockUser():void {
    if (this.password?.length > 0) {
      this.sessionService.unlockUser(this.userName, this.password).subscribe({
        next: (res: any) => {
          if (res == true) {
            // this.isUserLocked = false;
            this.isUserLockedChange.emit(false)
          }
          else {
            this.showErrorMessage = [{ severity: 'error', detail: 'Incorrect Password' }];
          }
        }
      });
    }
  }
  private setLogo(){
    this.subjectService.themeBehaviour.asObservable().subscribe({
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
  }
}