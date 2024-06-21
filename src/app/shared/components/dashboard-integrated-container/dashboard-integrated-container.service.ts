import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { AppConfigService } from "src/app/app-config.service";

@Injectable({
  providedIn: "root",
})
export class DashboardIntegratedContainerService {
  baseUrl = this.appConfigService.getBaseUrl();
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) { }

  public execute(uuid: string, pageId, filterInfo) {
    // return this.http.post(this.baseUrl + this.appConfigService.getBaseControllerUrl() + '/dashboard/' + uuid + '/execute', filterInfo)
    return this.http.post(this.baseUrl + "/dashboard/execute?action=view&uuid=" + uuid + "&type=dashboard&pageId=" + pageId + "&dashboardExecUuid=", filterInfo)

  }
  getOne(uuid: string, version: string, pageId) {
    // return this.http.get(this.baseUrl + this.appConfigService.getBaseControllerUrl() + '/meta/dashboardexecview/' + uuid + '/' + version)
    return this.http.get(this.baseUrl + "/dashboard/getOneByUuidAndVersion?action=view&uuid=" + uuid + "&version=" + version + "&type=dashboardexecview&pageId=" + pageId)
  }
  getVispod(uuid: string, version: string, vizpodId: string) {
    return this.http.get(this.baseUrl + this.appConfigService.getBaseControllerUrl() + '/dashboard/' + uuid + '/vizpod/' + vizpodId + '?vizpodVersion=' + version + '&level=')
    // return this.http.get(this.baseUrl + this.appConfigService.getBaseControllerUrl() + '/dashboard/b3d973d3-245a-47a9-84de-3e628a23505c/vizpod/33e1beab-ef73-48fb-8493-7210f1ad821e?vizpodExecVersion=1686668118490&level=')
    // return this.http.get(this.baseUrl + "/framework/vizpod/getVizpodResults?type=vizexec&uuid=6a343ea6-71a5-4c5e-b56f-f45a9f3e7b0a&version=1688651206376&action=view&snapshotFlag=N&refreshFlag=N&level=")
    // let res = {
    //   "c8cbf5e8-48af-4653-b626-3f2823b2664c": [
    //     { fm_trans_count: 4452, transaction_country: "USA" },
    //     { fm_trans_count: 960, transaction_country: "CAN" },
    //     { fm_trans_count: 640, transaction_country: "KOR" },
    //   ],
    //   "b832f4ba-4217-4dbf-bf6a-9e552f807ade": [
    //     { transaction_type_code: "CA", fm_trans_count: 3020 },
    //     { transaction_type_code: "WR", fm_trans_count: 3020 },
    //     { transaction_type_code: "CHECK", fm_trans_count: 12 },
    //   ],
    //   "c355ce17-1266-4008-a9bf-1580e43aa89c": [
    //     {
    //       COUNT_alert_id: 2,
    //       rule_name: "Suspicious Account Activity Alerts_copy",
    //     },
    //     { COUNT_alert_id: 4, rule_name: "Suspicious Account Activity Alerts" },
    //   ],
    //   "3208a75a-db52-468f-b59a-9ed64db1b4b8": [
    //     { COUNT_alert_id: 3, entity_id: "3350413019" },
    //     { COUNT_alert_id: 3, entity_id: "9907712963" },
    //   ],
    //   "3475c831-c50d-4e0b-8cb8-8c0b88d7ad1f": [
    //     { country: "USA", non_alert_count: 1132, alert_count: 109 },
    //     { country: "CAN", non_alert_count: 1238, alert_count: 129 },
    //     { country: "USA", non_alert_count: 45, alert_count: 12 },
    //   ],
    // };
    // return of(res[id]);
  }
  downloadVizpod(uuid: string, version: string, vizpodId: string) {
    return this.http.get(this.baseUrl + this.appConfigService.getBaseControllerUrl() + '/dashboard/' + uuid + '/vizpod/' + vizpodId + '/download?version=' + version + '&rows=10&format=CSV&saveOnRefresh=undefined', { responseType: 'blob' })
  }
  getDashboardMeta(uuid: string) {
    return this.http.get(this.baseUrl + this.appConfigService.getBaseControllerUrl() + '/meta/dashboard/' + uuid)
  }
  // JS APIs
  getAttributeData(datapodUuid: string, attributeId: string, type: string, dataType: string) {
    if (type == 'datapod')
      return this.http.get(this.baseUrl + '/' + dataType + '/getAttributeValues1?action=view&type=' + type + '&datapodUUID=' + datapodUuid + '&attributeId=' + attributeId + '&sortOrder=null&applyDistinct=null')
    else
      return this.http.get(this.baseUrl + '/' + dataType + '/getAttributeValues?action=view&type=' + type + '&uuid=' + datapodUuid + '&attributeId=' + attributeId + '&sortOrder=null&applyDistinct=null')
  }
}
