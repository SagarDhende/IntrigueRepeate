import { Component } from '@angular/core';
import { Subscriber, Subscription } from 'rxjs';
import { AppConfigService } from '../app-config.service';
import { SettingService } from './setting.service';
import { CommonService } from '../shared/services/common.service';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SessionService } from '../shared/services/session.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})


export class SettingComponent {
  protected profileForm: FormGroup;
  protected user: any;
  protected userUuid: any;
  protected nameDisabled: boolean;
  protected emailDisabled: boolean;
  protected submitDisabled: boolean;
  protected breadcrumb: any;
  protected repass: boolean = false;

  /** @description Array For Unsubscription Of Observable */
  private subscriptions: Subscription[] = [];
  private version: string;

  constructor(private router: Router, private formBuilder: FormBuilder, private spinner: NgxSpinnerService,private configService: AppConfigService,
     private settingsService: SettingService, private messageService: MessageService, private commonService: CommonService, private sessionService: SessionService) { }


  ngOnInit(): void {
    this.nameDisabled = false;
    this.emailDisabled = false;
    this.submitDisabled = true;
    this.breadcrumb = [{ title: 'Settings', url: false }, { title: 'Profile', url: false }]
    this.userUuid = this.sessionService.getData();

    this.profileForm = this.formBuilder.group({
      name: [null, Validators.required],
      dname: [null, Validators.required],
      password: [null, Validators.required],
      repassword: [{ value: null, disabled: true }, Validators.required],
      fname: [null, [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      mname: [null, Validators.pattern(/^[a-zA-Z]*$/)],
      lname: [null, [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      email: [null, [Validators.required, Validators.pattern(/^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/)]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.profileForm.valueChanges.subscribe(() => {
      this.submitDisabled = !this.areAllFieldsFilled();
    })

    const observableTemp = this.commonService.getOnyByUuidAndVersion('user', this.userUuid.userUuid, this.version).subscribe({
      next: (res: any) => {
        // res = res.meta
        this.user = res;
        if (res.name) {
          this.nameDisabled = true;
        }
        if (res.emailId) {
          this.emailDisabled = true;
        }
        this.profileForm.patchValue({
          name: res.name,
          dname: res.displayName,
          password: res.password,
          repassword: "",
          fname: res.firstName,
          mname: res.middleName,
          lname: res.lastName,
          email: res.emailId[0].emailId
        })
      }
    });
    this.addSubscribe(observableTemp);
  }

  protected inputChange(): void {
    this.repass = false;
    this.submitDisabled = true;
    this.profileForm.controls['repassword'].disable();
    if (this.user.displayName != this.profileForm.value.dname ||
      this.user.password != this.profileForm.value.password ||
      this.user.firstName != this.profileForm.value.fname ||
      this.user.middleName != this.profileForm.value.mname ||
      this.user.lastName != this.profileForm.value.lname) {
      this.submitDisabled = false;
    }
    if (this.user.password != this.profileForm.value.password) {
      this.repass = true;
      this.profileForm.controls['repassword'].enable();
    }
  }
  protected profileSubmit(): void {
    if ((this.profileForm.value.password == this.profileForm.value.repassword || this.user.password == this.profileForm.value.password) && (this.profileForm.valid)) {
      this.user.displayName = this.profileForm.value.dname;
      this.user.password = this.profileForm.value.password;
      this.user.firstName = this.profileForm.value.fname;
      this.user.middleName = this.profileForm.value.mname;
      this.user.lastName = this.profileForm.value.lname;
      const observableTemp = this.settingsService.postUserDetails(this.user).subscribe({
        next: (response: any) => {
          if ((response != null && response != undefined && response != false) && response) {
            /*comment out toaster messages*/
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile Updated' });
            this.getUserById(response);
          } else {
            /*comment out toaster messages*/
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Some Error Occured' });
          }
        }
      });
      this.addSubscribe(observableTemp);
    }
  }

  protected refreshClick() {
    this.spinner.show("profileSpinner");

    const observableTemp = this.commonService.getOnyByUuidAndVersion('user', this.userUuid.userUuid, this.version).subscribe({
      next: (res: any) => {
        observableTemp.unsubscribe();
      },
      error: (error) => { }
    });
    setTimeout(() => {
      this.spinner.hide("profileSpinner");
    }, 2000);
  }

  protected navigateToDashboard() {
    this.router.navigate(['/home']);
  }


  private passwordMatchValidator(formGroup: FormGroup) {
    const passwordControl = formGroup.get('password');
    const confirmPasswordControl = formGroup.get('repassword');

    if (passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ passwordMismatch: true });
    } else {
      confirmPasswordControl.setErrors(null);
    }
  }

  private areAllFieldsFilled(): boolean {
    const controls = this.profileForm.controls;
    const isPasswordMatch = controls['password'].value === controls['repassword'].value;
    return (
      controls['name'].value &&
      controls['dname'].value &&
      controls['password'].value &&
      controls['repassword'].value &&
      controls['fname'].value &&
      controls['lname'].value &&
      controls['email'].value &&
      isPasswordMatch

    );
  }
  private getUserById(id: any): void {
    const observableTemp = this.settingsService.getUserById(id).subscribe({
      next: (response: any) => {
        console.log('user data', response)
        this.user = response;
      }
    });
    this.addSubscribe(observableTemp);
  }

  private addSubscribe(subscriber: any): void {
    if (subscriber != null && subscriber instanceof Subscriber) {
      this.subscriptions.push(subscriber);
    }
  }

  ngOnDestroy(): void {
    // Method for Unsubscribing Observable
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
