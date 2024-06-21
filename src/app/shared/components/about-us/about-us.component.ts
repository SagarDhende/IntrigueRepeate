import { Component, EventEmitter, HostListener, Input, NgZone, OnInit, Output } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { CommonService } from '../../services/common.service';
import { AppConfigService } from 'src/app/app-config.service';
import { Subscriber, Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [DialogModule, ButtonModule],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})

export class AboutUsComponent implements OnInit {

  @Input() displayAboutUsModal: boolean;
  @Output() closeModal: EventEmitter<any> = new EventEmitter<any>(); 
  @Output() unsubscribeAboutUs: EventEmitter<any> = new EventEmitter<any>();
  @Output() escapeModal: EventEmitter<any> = new EventEmitter<any>();
  protected licenseDetail: any;
  protected currentYear: string;
  protected lightLogo = "./assets/layout/images/logo-square-dark.png";
  protected subscriptions: Subscription[] = []; //Array used for unsubscribing observales  
  protected conpanyInfo = {
    companyName:  "",
    companyLink: ""
  }
  constructor(public sessionService: SessionService, private commonService: CommonService,
    private configService: AppConfigService, private location: Location, private zone: NgZone) { }
  
  ngOnInit(): void {
    this.conpanyInfo.companyName = this.configService.getOrgSetting().companyName
    this.conpanyInfo.companyLink = this.configService.getOrgSetting().companyLink
    this.getLicenseInfo();
    var d = new Date();
    this.currentYear = d.getFullYear().toString();
    this.getLicenseInfo();
  }

  protected closeAboutUsModal(data?: any): any {
    this.closeModal.emit();
    this.unsubscribeAboutUs.emit();
    console.log("destroying modal popup on close");
  }

  protected handleClickOutside(event: MouseEvent) {
    
    // if (!this.isClickInsideModal(event.target as HTMLElement)) {
      this.closeAboutUsModal();
      this.unsubscribeAboutUs.emit();
    // }
  }

  @HostListener('document:keydown', ['$event'])
  protected handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      console.log('Esc key pressed');
      this.closeAboutUsModal();
    }
  }

  private isClickInsideModal(target: HTMLElement): any {
    return target.closest('.bg-dialog-color');
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

  ngOnDestroy() {
    //Method used for unsubscribing observables
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }


}
