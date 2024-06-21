export interface RefObject {
    type: string; 
    uuid?: string; 
 }
  
export interface Operand {
    ref: RefObject;
    attributeId?: string; 
    attributeType?: string; 
    value: any; 
  }
  
export interface FilterObject {
    display_seq: number;
    logicalOperator: string;
    operator: string;
    operand: Operand[];
  }
  
export interface FinalFilterObject {
    filterInfoHolder: FilterObject[];
  }

export class FinalObj implements FinalFilterObject{
      filterInfoHolder: FilterObject[];
 }


