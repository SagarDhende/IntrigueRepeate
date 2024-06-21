export interface IBaseEntity {

    id: string;
    uuid: string;
    version: string;
    name: string;
    displayName: string;
    desc?: string;
    createdOn: string;
    tags: string[];
    active: string;
    locked: string;
    published: string;
}
