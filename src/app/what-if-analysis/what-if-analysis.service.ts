import { Injectable } from '@angular/core';
import { SessionService } from '../shared/services/session.service';
import { AppConfigService } from '../app-config.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { ScenarioMode } from './scenario-mode.enum';
import { ScenarioInfo } from './scenario-info.model';
import { any } from 'underscore';


@Injectable({
  providedIn: 'root'
})
export class WhatIfAnalysisService {
  // result summary detail
  constructor(private http: HttpClient, private appConfigService: AppConfigService, private sessionService: SessionService, private fb: FormBuilder) { }

  public getInputDownloadURL(uuid: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    const httpOptions = {
      observe: 'response' as 'body'
    };
    let url = baseUrl + controllerUrl + "/whatifanalysis/" + uuid + "/download/input";
    return this.http.get(url,{ observe: 'response', responseType: 'arraybuffer' }).pipe(
        catchError((response) => {
          return this.sessionService.handleError(response);
        }
        )
      )
  }


  public analysisLoadSession = function (uuid: string, version: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/" + uuid + "/session/load?version=" + version;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getAnalysisSessionInput = function (uuid: string, version: string) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/" + uuid + "/session/input?version=" + version;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getAnalysisSessionDetail = function (uuid: string, version: string, scenarioId: number) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/" + uuid + "/session/detail?version=" + version + "&scenarioId=" + scenarioId;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getAnalysisSessionSummary = function (uuid: string, version: string, scenarioId: number) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/" + uuid + "/session/summary?version=" + version + "&scenarioId=" + scenarioId;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getAnalysisSessionOverview = function (uuid: string, version: string, sessionId: number) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/" + uuid + "/session/overview?version=" + version + "&scenarioId=" + sessionId;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getAnalyisisBySaveSession(): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/list?saveSession=true";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response)
    }))
  }

  public getAllVersionByUuid(saveSession: string, uuid: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/" + uuid + "/list?saveSession=" + saveSession;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response)
    }))
  }

  public deleteScenario = function (uuid: string, version: string, scenarioId: number) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/" + uuid + "/delete?version=" + version + "&scenarioId=" + scenarioId;
    return this.http.put(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }));
  }

  public getBusinessRuleBySource(type: string, uuid: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/rule/" + type + "/" + uuid + "/list";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response)
    }))
  }

  public getRuleResultDownloadURL(uuid: string, version: string, scenarioId: number): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    const httpOptions = {
      observe: 'response' as 'body'
    };
    let url =  baseUrl + controllerUrl +"/whatifanalysis/" + uuid + "/download/result?scenarioId=" + scenarioId + "&version=" + version;
    return this.http.get(url,{ observe: 'response', responseType: 'arraybuffer' }).pipe(
      catchError((response) => {
        return this.sessionService.handleError(response);
      }
      )
    )
  }

  public getPriviewResult(uuid: string, version: string, type: string): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/" + uuid + "/input";
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public ruleExecute(uuid: string, version: string, type: string, data: any, scenarioId: number) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/" + uuid + "/execute?version=&scenarioId=" + scenarioId;
    return this.http.post(url, data).pipe(catchError((respose) => {
      return this.sessionService.handleError(respose);
    }))
  }

  public ruleResult(uuid: string, version: string, type: string, scenarioId: number): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/" + uuid + "/summary/result?scenarioId=" + scenarioId + "&version=" + version;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public ruleDetailResult(uuid: string, version: string, type: string, scenarioId: number): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/" + uuid + "/result?scenarioId=" + scenarioId;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public ruleSummaryResult(uuid: string, version: string, type: string, scenarioId: number): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/" + uuid + "/summary?scenarioId=" + scenarioId;
    return this.http.get(url).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public ruleOverViewResult(uuid: string, version: string, type: string, data: any, scenarioId: number): Observable<any> {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/" + uuid + "/overview?scenarioId=" + scenarioId;
    return this.http.post(url, data).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }

  public getHistogramChartStructure() {
    let histogramChartStructure: any = {
      json: [],
      keys: {
        x: 'bucket',
        value: ['frequency']
      },
      colors: {
        frequency: "#36a3f7"
      },
      type: 'bar'
    }
    return histogramChartStructure
  }

  public getSeverityChartStructure() {
    let severityChartStructure: any = {
      json: [],
      keys: {
        value: ['infoCount', "highCount", "medCount", "lowCount"]
      },
      names: {
        infoCount: 'Info',
        highCount: 'High',
        medCount: 'Med',
        lowCount: 'Low'

      },
      type: 'donut',
      colors: {
        lowCount: '#4fbfa3',
        highCount: '#dc3545',
        medCount: '#fec135',
        infoCount: "#36a3f7"
      }
    }
    return severityChartStructure;
  }

  public getScenarioDefaultValue = function () {
    let scenarioInfo: ScenarioInfo = {
      "id": 0,
      "name": "Scenario 1",
      isHeaderEdit: false,
      isShowTabEdit: false,
      inputBusinessRuleForm: new FormGroup({
        selectedRule: new FormControl({ value: '', disabled: true })
      }),
      ruleSeverityData: this.getSeverityChartStructure(),
      ruleSHData: this.getHistogramChartStructure(),
      isRuleExecutionInprogess: false,
      isRuleExecutionError: false,
      isRuleExecutionSuccess: false,
      isRuleOverViewResultInprogess: false,
      isRuleOverviewResultError: false,
      ruleOverViewErrorContent: any,
      isRuleDetailResltInprogess: false,
      isRuleDetailResultError: false,
      isRuleDetailResultSuccess: false,
      isRuleDetailNoRecord: false,
      pTableDetailResultHeight: "",
      ruleDetailResultCols: [],
      ruleDetailResult: [],
      isRuleSummaryResultInprogess: false,
      isRuleSummaryResultError: false,
      pTableSummaryHeight: "",
      ruleSummaryResultCols: [],
      ruleSummaryResult: [],
      isRuleSummaryResultNoRecord: false,
      isRuleSummarySuccess: false,

      isRuleResltInprogess: false,
      isRuleResultError: false,
      isRuleResultSuccess: false,
      isRuleResultNoRecord: false,
      pTableResultHeight: "",
      ruleResultCols: [],
      ruleResult: [],
      ruleResultErrorContent: any,
      thresholdType: "NUMERIC",
      lowValue: 25,
      medValue: 50,
      highValue: 75,
      lowOptions: this.sliderDefaultOption,
      medOptions: this.sliderDefaultOption,
      heighOptions: this.sliderDefaultOption,
      scenarioMode: ScenarioMode.MEMORY,
      ruleParamForm: this.fb.group({ rows: this.fb.array([]) }),
      severityTab: [],
      overViewTabCol: [{ "id": "0", "name": "Severity", "isShow": true, isExpand: false }, { "id": "1", "name": "Score Histogram", "isShow": true, isExpand: false }, { "id": "2", "name": "Set Thresholds", "isShow": true, isExpand: false }],
      isTabReady: false,
    };
    return scenarioInfo;
  }

  public analysisSaveSession = function (uuid: string, version: string, data: any) {
    let baseUrl = this.appConfigService.getBaseUrl();
    let controllerUrl = this.appConfigService.getBaseControllerUrl();
    let url = baseUrl + controllerUrl + "/whatifanalysis/" + uuid + "/session/save?version=" + version;
    return this.http.post(url, data).pipe(catchError((response) => {
      return this.sessionService.handleError(response);
    }))
  }
}
