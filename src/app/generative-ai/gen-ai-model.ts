import { GraphpodResultView } from "../shared/models/API/graphpod-result-view.model";
import { IGraphpod } from "../shared/models/API/graphpod.model";
import { IColStructure } from "../shared/models/col-structure.model";

export enum ResponseType {
    TABLE = "table",
    GRAPH = "graph",
  }   
  
export enum RagType {
    GRAPH = "GRAPH",
    VECTORDB = "VECTORDB",
}

 export interface IDataObject {
    question: string;
    sqlQuery: string;
    isQueryBtnShow: boolean;
    isDataInProgress: boolean;
    isDataError: boolean;
    isDataFetched: boolean;
    isDataNoRecords: boolean;
    requestId: string;
    responseType: string;
    linkAnalysisResult: GraphpodResultView;
    errorTitle: string;
    errorContent: string;
    messageHead: string;
    spinnerId: string;
    tableRows: [];
    tableCols: IColStructure[];
    tempTableRows: [];
    isLike: boolean;
    isDislike: boolean;
    flagged: boolean;
    isDeleted: boolean;
    length: number;
    selectedOptions: IColStructure[];
    graphpodMeta: IGraphpod;
    searchText: string
    currentDateAndTimeForQuestion: any;
    currentDateAndTimeForAnswer: any
  }
  
  export interface IDocuument{
    question: string;
    answer: string;
    isGenAIInProgress: boolean;
    isGenAIError: boolean;
    isGenAICompleted: boolean;
    isGenAINoAnswer: boolean;
    currentDateAndTimeForQuestion: any;
    currentDateAndTimeForAnswer: any;
    requestId: string;
    isLike: boolean;
    isDislike: boolean;
    flagged: boolean;
    isDeleted: boolean;
    errorTitle: string;
    errorContent: string;
    messageHead: string;
  }

export interface IDocumentRequestObject {
   categoryInfo:{
      ref: {
        type: string | null;
        uuid: string | null;
    }
    }
    docInfo: {
        ref: {
            type: string | null;
            uuid: string | null;
        }
    }
    userInput: string;
}

export interface IDatasourceRequestObject {
  dbName: {
      ref: {
          type: string | null;
          uuid: string | null;
      };
  };
  userInput: string;
}

export interface IDatapodRequestObject {
  sourceTableName: {
      ref: {
          type: string | null;
          uuid: string | null;
      };
  };
  userInput: string;
}

export class sourceTable{
    ref: Ref
}

export class Ref {
  type: string | null;
  uuid: string | null;
}

export class DatapodRequestObject implements IDatapodRequestObject {
  sourceTableName: sourceTable
  userInput: string;
}

export class DataSourceRequestObject implements IDatasourceRequestObject {
  dbName: sourceTable
  userInput: string;
}

  export class DataObject implements IDataObject {
    question: string;
    sqlQuery: string;
    isQueryBtnShow: boolean;
    isDataInProgress: boolean;
    isDataError: boolean;
    isDataFetched: boolean;
    isDataNoRecords: boolean;
    requestId: string;
    responseType: string;
    linkAnalysisResult: GraphpodResultView;
    errorTitle: string;
    errorContent: string;
    messageHead: string;
    spinnerId: string;
    graphpodMeta: IGraphpod
    tableRows: [];
    tableCols: [];
    isLike: boolean;
    isDislike: boolean;
    flagged: boolean;
    isDeleted: boolean;
    length: number;
    selectedOptions: []
    tempTableRows: [];
    searchText: string;
    currentDateAndTimeForQuestion: any;
    currentDateAndTimeForAnswer: any
  }

  export class DocumentObject {
    question: string;
    answer: string;
    isGenAIInProgress: boolean;
    isGenAIError: boolean;
    isGenAICompleted: boolean;
    isGenAINoAnswer: boolean;
    currentDateAndTimeForQuestion: any;
    currentDateAndTimeForAnswer: any;
    requestId: string;
    isLike: boolean;
    isDislike: boolean;
    flagged: boolean;
    isDeleted: boolean;
    errorTitle: string;
    errorContent: string;
    messageHead: string;
  }

