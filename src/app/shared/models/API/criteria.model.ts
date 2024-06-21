export interface ICriteria {
    transaction_id: string;
    direction: string;
    account_id: string;
    customer_id: string;
    transaction_type_code: string;
    transaction_channel_code: string;
    transaction_date: number;
    transaction_country: string;
    originator_country: string;
    beneficiary_country: string;
    trans_amount: number;
    check_num: string;
    device_type: string;
    originator_name: string;
    originator_login: string;
    originator_ip: string;
    originator_ip_country: string;
    originator_ip_lat: string;
    originator_ip_long: string;
    load_date: string;
    load_id: number;
}