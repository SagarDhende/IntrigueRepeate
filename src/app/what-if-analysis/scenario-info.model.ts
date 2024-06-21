import { Options } from "@angular-slider/ngx-slider/options";
import { FormGroup } from "@angular/forms";
import { ScenarioMode } from "./scenario-mode.enum"; 

export interface ScenarioInfo {
    id: number,
    name: string,
    isHeaderEdit: boolean
    isShowTabEdit: boolean,
    isRuleExecutionInprogess: boolean;
    isRuleExecutionError: boolean,
    isRuleExecutionSuccess: boolean,

    isRuleDetailResltInprogess: boolean;
    isRuleDetailResultError: boolean;
    isRuleDetailResultSuccess: boolean;
    isRuleDetailNoRecord: boolean;
    pTableDetailResultHeight: string;
    ruleDetailResultCols: any[];
    ruleDetailResult: any[];

    ruleSeverityData: any;
    ruleSHData: any;
    isRuleOverViewResultInprogess: boolean;
    isRuleOverviewResultError: boolean;
    ruleOverViewErrorContent: any;

    isRuleSummaryResultInprogess: boolean;
    isRuleSummaryResultError: boolean;
    pTableSummaryHeight: string;
    ruleSummaryResultCols: any[];
    ruleSummaryResult: any[];
    isRuleSummaryResultNoRecord: boolean;
    isRuleSummarySuccess: boolean;

    isRuleResltInprogess: boolean;
    isRuleResultError: boolean;
    isRuleResultSuccess: boolean;
    isRuleResultNoRecord: boolean;
    pTableResultHeight: string;
    ruleResultCols: any[];
    ruleResult: any[];
    ruleResultErrorContent: any;

    inputBusinessRuleForm: FormGroup;
    thresholdType: string;
    lowValue: number
    medValue: number
    highValue: number
    lowOptions: Options
    medOptions: Options
    heighOptions: Options
    ruleParamForm: FormGroup;
    scenarioMode: ScenarioMode;
    overViewTabCol: any[];
    severityTab: any[];
    isTabReady: boolean;

}
