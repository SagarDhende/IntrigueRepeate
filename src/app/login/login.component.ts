import { HttpRequest, HttpResponse } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { LoginService } from './login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../shared/services/session.service';
import { Session, SocialSSO } from './auth.model';
import { AppConfig, LayoutService } from '../layout/service/app.layout.service';
import { SubjectService } from '../shared/services/subject.service';
import { AppConfigService } from '../app-config.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  protected password!: string;
  loginForm!: FormGroup;
  isSubmitted = false;
  message: any;
  logo = './assets/layout/images/';
  protected actionInProgress:boolean=false;

  protected cardLeftHeading: any = {
    title: "Welcome to ",
    description:"Quis vel eros donec ac odio tempor orci dapibus. In hac habitasse platea dictumst quisque.",
    visibility: "visible"
  }
  protected cardLeftIcons:any=[
    { 
    title: "Unlimited Inbox",
    description: "Tincidunt nunc pulvinar sapien et. Vitae purus faucibus ornare suspendisse sed nisi lacus sed viverra." },
    { 
      title: "Premium Security", description: "Scelerisque purus semper eget duis at tellus at urna. Sed risus pretium quam vulputate." 
    },
    { 
    title: "Cloud Backups Inbox", description: "Egestas sed tempus urna et. Auctor elit sed vulputate mi sit amet mauris commodo." 
    }
  ]
  socialSso: SocialSSO;
  private rememberMe: boolean = false;
  private username: string = '';
  constructor(private sessionService: SessionService, private formBuilder: FormBuilder,
    private router: Router, private loginService: LoginService, private layoutService: LayoutService, 
    private subjectService: SubjectService, private appConfigService:AppConfigService,
    private socialAuthService:SocialAuthService,private ngZone:NgZone) { }

  ngOnInit() {
    this.setLogo()
    this.cardLeftHeading.title = this.cardLeftHeading.title  + this.appConfigService.getOrgSetting().title
    this.subjectService.themeBehaviour.next(this.layoutService.config());
    console.log(this.layoutService.config().theme);
    this.loginForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe:[false]
    });
    
    this.socialSso=this.appConfigService.getSocialSso();

    const rememberMeValue = localStorage.getItem('rememberMe');
    if (rememberMeValue) {
      this.rememberMe = JSON.parse(rememberMeValue);
      if (this.rememberMe) {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
          this.username = savedUsername;
          this.loginForm.patchValue({ userName: savedUsername });
        }
      }
    }
  }
  protected toggleRememberMe(): void {
    this.rememberMe = !this.rememberMe;
    if (this.rememberMe) {
      const userName = this.loginForm.get('userName').value;
      localStorage.setItem('username', userName);
    } else {
      localStorage.removeItem('username');
    }
    localStorage.setItem('rememberMe', JSON.stringify(this.rememberMe));
  }

  private setLogo(){
    const observableTemp=this.subjectService.themeBehaviour.asObservable().subscribe({
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
  
  images: { url: string; title: string; description: string }[] = [
    {
      url: 'https://www.inferyx.com/assets/images/solutions/solutions-overview.jpg',
      title: 'Unlimited Inbox',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    {
      url: 'https://blocks.primeng.org/assets/images/blocks/illustration/security.svg',
      title: 'Data Security',
      description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    },
    {
      url: 'https://www.inferyx.com/assets/images/platform/platform_arch_diagram.png',
      title: 'Cloud Backup Williams',
      description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    }
  ];

  protected get loginFormControls() { return this.loginForm.controls; }

  protected isFieldInvalid(field: string): boolean {
    if (this.loginForm) {
      const control = this.loginForm.get(field);
      return control.invalid && (control.touched || this.isSubmitted);
    }
    return true;
  }


  protected validateUser(userName: string, password: string): void {
    this.actionInProgress=true
    this.isSubmitted = true;
    if(this.loginForm.valid){
    this.loginService.validateUser(userName, password).subscribe({
      next: (response: HttpRequest<any>) => {
       
        console.log(response);
        let sessionDetail: Session;
        console.log(sessionDetail)
        sessionDetail = new Session();
        sessionDetail.message = response.headers.get('message');
        sessionDetail.sessionId = response.headers.get('sessionid');
        sessionDetail.userName = response.headers.get('username');
        sessionDetail.userUuid = response.headers.get("useruuid");
        let status = response.headers.get('status');
        if (status != null && status == "true") {
          this.subjectService.application$.next(null);
          this.sessionService.setData(sessionDetail);
          this.router.navigate(['/application-manager']);

          if (this.rememberMe) {
            localStorage.setItem('username', userName);
          }
        } else {
          this.message = [
            { severity: 'error', summary: '', detail: sessionDetail.message }];
        }

      },
      error: (response) => {

      }
    });
  }
  }

  protected onSubmit() {
    const userName = this.loginForm.get('userName').value;
    const password = this.loginForm.get('password').value;
    this.validateUser(userName, password);

  }

  private validateEmailToken(email: any, token: any) {
    console.log("inside validate email");

    this.loginService.validateEmailToken(email, token).subscribe({
      next: (response: HttpResponse<any>) => {

        this.ngZone.run(() => {
          try {
            console.log(response.headers);
            let sessionDetail: Session;
            sessionDetail = new Session();
            sessionDetail.message = response.headers.get('message');
            sessionDetail.sessionId = response.headers.get('sessionid');
            sessionDetail.userName = response.headers.get('username');
            sessionDetail.userUuid = response.headers.get("useruuid");
            let status = response.headers.get('status');
            if (status != null && status == "true") {
              this.sessionService.setData(sessionDetail);

              // this.store.dispatch(new Login({ data: sessionDetail }));
              // localStorage.setItem("user", JSON.stringify(sessionDetail));

              // this._cookieService.set("JSESSIONID", sessionDetail.sessionId.toString()); 

              // if (this.rememberMe) {   //status != null && status == "true" use instead of true
              //   localStorage.setItem('remember', this.loginForm.value["userName"]);
              // }
              // else {
              //   localStorage.removeItem('remember');
              //   this.sessionService.clear();
              // }
              this.router.navigate(["application-manager"])
            }
            else {
              this.message = [
                { severity: 'error', summary: '', detail: sessionDetail.message }];
            }
          }
          catch (e) {
            console.log(e);
          }
        })
      },
      error: error => console.log("sdfsd" + error),
      complete: () => console.log(this.message)
    })
  }

  protected googleSignin(googleWrapper: any) {
    googleWrapper.click();
    this.socialAuthService.authState.subscribe((user) => {
      console.log(user);
        this.validateEmailToken(user.email, user.idToken);
    });
  }
 
}
