export interface ICase {
    app_uuid: string;
    case_id: string;
    alert_id: string;
    entity_type: string;
    entity_id: string;
    version: number;
    case_type: string;
    rule_exec_uuid: string;
    rule_exec_version: number;
    rule_exec_time: string;
    rule_uuid: string;
    rule_version: number;
    rule_name: string;
    score: number;
    threshold_type: string;
    threshold_limit: number;
    severity: string;
    param_info: string;
    business_date: string;
    filter_expr: string;
}