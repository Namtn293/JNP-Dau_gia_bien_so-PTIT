// export interface IPagination<T> {
//   page: number;
//   pageSize: number;
//   records: T[];
//   totalPages: number;
//   totalRecords: number;
// }

// export interface IResponse<T> {
//   code: string;
//   data: T;
//   message: string;
// }

// export interface IResponse<T> {
//   success: boolean;
//   data: T;
//   message: string;
//   error :any;
// }

// export interface IResponsePagination<T> extends IResponse<IPagination<T>> {}

export interface IResponse<T> {
  code: number;
  success: boolean;
  message: string;
  messages?: string[] | null;
  data: T;
}

export interface IMetaData {
  page: number;
  pageSize: number;
  total: number;
  totalPage: number;
}

export interface IResponsePagination<T> {
  code: number;
  success: boolean;
  message: string;
  messages?: string[] | null;
  data: T[];
  metaData: IMetaData | null;
}

export interface ISingleFileRequest {
  contextType: string;
  contextId?: string;
  folderId?: string;
  file: string;
}