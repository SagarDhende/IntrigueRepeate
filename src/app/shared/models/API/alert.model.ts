export interface IAlert {
    alert_id: string;
    app_uuid: string;
    rule_exec_uuid: string;
    rule_exec_version: number;
    rule_exec_time: string;
    rule_uuid: string;
    rule_version: number;
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
    version: number;
    owner: string;
    user_group:string
}