export interface IFilterCase {
    case_type: string;
    case_id: string;
    app_uuid: string;
    rule_exec_uuid: string;
    rule_exec_version: any;
    rule_exec_time: string;
    rule_uuid: string;
    rule_version: any;
    rule_name: string;
    entity_type: string;
    entity_id: string;
    score: number;
    threshold_type: string;
    threshold_limit: number;
    severity: string;
    param_info: string;
    business_date: string;
    filter_expr: string;
    version: any;
    status: string;
    assigned_to: string;
}