/// <reference types="jquery" />
export declare module Adapter {
    interface IRequestAdapterOptions {
        data: {};
        type: string;
        url: string;
        limit?: number;
        order?: string;
        offset?: number;
        success?: (response: string | {}) => any;
        error?: (xhr: Adapter.Request, textStatus: string | string[], errorThrown: string | Error | (string | Error)[]) => any;
    }
    class Request {
        options: IRequestAdapterOptions;
        constructor(options?: IRequestAdapterOptions);
        protected formatOptions(options: IRequestAdapterOptions): IRequestAdapterOptions;
        protected formatResponse(response: any): any;
        setRequestHeader(headerName: string, headerValue: string): Request;
    }
    class Adapter {
        options: {};
        private requestBind;
        constructor(options?: {});
        protected formatOptions(options: {}): {};
        load(): void;
        protected getRequestInstance(options?: IRequestAdapterOptions): Request;
    }
    class DefaultAdapter extends Adapter {
        protected getRequestInstance(options?: IRequestAdapterOptions): Request;
    }
    class DefaultRequest extends Request {
        requestList: JQueryXHR[];
        private originalData;
        constructor(options: IRequestAdapterOptions);
        protected doRequest(options: IRequestAdapterOptions): void;
        setRequestHeader(headerName: string, headerValue: string): Request;
        protected formatOptions(options: IRequestAdapterOptions): IRequestAdapterOptions;
        private dispatchResult;
    }
}
export default Adapter;
