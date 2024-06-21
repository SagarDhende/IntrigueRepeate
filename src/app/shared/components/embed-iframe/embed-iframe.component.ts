
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-embed-iframe',
  templateUrl: './embed-iframe.component.html',
  styleUrls: ['./embed-iframe.component.scss']
})
export class EmbedIframeComponent implements OnInit, AfterViewInit {

  @Input() public url: string;
  @Input() public spinnerActive:any;

  protected urlSafe: SafeResourceUrl;
  protected isUrlReady: boolean;
  
  @ViewChild("iframe") private iframe: ElementRef;
 
  constructor(private sanitizer: DomSanitizer, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    window.addEventListener('message', (e) => {
      const data = e.data;
      this.iframe.nativeElement.height = (e.data + 50).toString() + 'px';
    });
    this.setUrl();
  }
  ngAfterViewInit(): void { }

  setUrl() {
    this.urlSafe = null;
    this.isUrlReady = false;
    this.spinner.show("embedDashboard");
      this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
        this.spinner.hide("embedDashboard");
        this.isUrlReady = true;
  }

  ngOnDestroy(): void {

  }
}
