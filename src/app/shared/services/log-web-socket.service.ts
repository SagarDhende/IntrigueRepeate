import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class LogWebSocketService {

  private rxStomp: any;
  constructor(private appConfigService: AppConfigService) { }

  public deactivate():void {
    this.rxStomp.deactivate();
  }

  public getLogs(data: any):Observable<any>{
    this.activate();
    this.sendData(data);
    return this.rxStomp
      .watch({ destination: "/topic/logReply" + data.uuid })
  }

  private activate(): void {
    let wsURL = this.appConfigService.getWSBaseUrl();
    wsURL= wsURL+"/log";
    this.rxStomp = new RxStomp();
    this.rxStomp.configure({
      brokerURL: wsURL,
    });
    this.rxStomp.activate();
  }

  private sendData(data: any):void {
    this.rxStomp.publish({
      destination: "/framework/data",
      body: JSON.stringify(data),
    });
  }
}
