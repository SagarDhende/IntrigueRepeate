import { IAttributeRefHolder } from "./atribute-ref-holder-model";
import { IProperty } from "./property.model";

export interface IHighlight {
	type: string;
	propertyId: IAttributeRefHolder;
	propertyType: string; //CUSTOM, DEFAULT
	propertyDefaultValue: string;
	propertyInfo: IProperty[];

}
