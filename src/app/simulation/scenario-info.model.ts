import { FormGroup } from "@angular/forms";

export interface ScenarioInfo {

    id: number;
    name: string;
    isHeaderEdit: boolean;
    isShowTabEdit: boolean;
    isGSExecutionInprogess: boolean;
    isGSExecutionError: boolean;
    isGSExecutionSuccess: boolean;
    graphSimulateForm: FormGroup;
    ruleParamForm: FormGroup;
    isSimulateRunBtnShow:boolean;
    isSimulateRunBtnDisabled:boolean;
    errorContent:any
    outputInfo:SimulateOutputInfo[];
    
}

export interface SimulateOutputInfo{
    outputId:number;
    title:string;
    ngxSpinnerName:string
    isOutputInprogess:boolean;
    isOutputError:boolean;
    isOutputSuccess:boolean;
    isOutoutNoRecord:boolean;
    errorContent:any
    result:any,
    cols:any,
    type:any
    pTableHeight:any
}
