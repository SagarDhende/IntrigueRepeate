export class Pagination {
    rows:number;
    offset:number;
    totalRecords:number;
    
    constructor(rows:number,offset:number,totalRecords:number){
      this.rows=rows;
      this.offset=offset
      this.totalRecords=totalRecords;
    }
  }