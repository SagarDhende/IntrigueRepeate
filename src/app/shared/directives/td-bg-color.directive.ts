import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { AppConfigService } from 'src/app/app-config.service';

@Directive({
  selector: '[tdColor]',
  standalone: true
})
export class TdBgColorDirective implements OnInit {

  @Input('tdColor') key = '';
  @Input('tdValues') tdValues: any;

  constructor(private el: ElementRef, public appConfigService: AppConfigService, private renderer: Renderer2) {
  }

  ngOnInit() {
    this.getSeverityBGColor(this.key, this.tdValues)
  }
  private getSeverityBGColor(key: string, tdValues: any) {
    switch (key) {
      case 'notification':
        this.renderer.setStyle(this.el.nativeElement, 'background-color', this.appConfigService.getNotificationBgColor(tdValues));
        break;
      case 'severity':
        this.renderer.setStyle(this.el.nativeElement, 'background-color', this.appConfigService.getSeverityBGColor(tdValues));
        break;
      case 'notificationStatus':
        this.renderer.setStyle(this.el.nativeElement, 'background-color', this.appConfigService.getNodificationStatusBgColor(tdValues));
        break;
      case 'notificationStatusText':
        this.renderer.setProperty(this.el.nativeElement, 'innerText', this.appConfigService.getNodificationStatusCaption(tdValues));
        this.renderer.setProperty(this.el.nativeElement, 'pTooltip', this.appConfigService.getNodificationStatusCaption(tdValues));
        break;
      case 'notificationText':
        this.renderer.setProperty(this.el.nativeElement, 'innerText', this.appConfigService.getNotificationCaption(tdValues));
        this.renderer.setProperty(this.el.nativeElement, 'pTooltip', this.appConfigService.getNotificationCaption(tdValues));
        break;
    }
  }
}