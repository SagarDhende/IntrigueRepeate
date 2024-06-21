export enum Format {
    CSV = "CSV",
    EXCEL = "EXCEL",
    PDF = "PDF",
    PSV = "PSV",
    TSV = "TSV"
  }
  
  export enum Layout {
    LANDSCAPE = "LANDSCAPE",
    PORTRAIT = "PORTRAIT",
  }

  export interface IDownloadOptions{
    url: string;
    payload: any;
    type: string
  }
  
  export class DownloadOptions implements IDownloadOptions {
    url: string;
    payload: any;
    type: string;
  }