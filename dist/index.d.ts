declare const Builder: {
    make(what: "query" | "mutation" | "subscription", resolver: string, string?: boolean): any;
    query(resolver: string, string?: boolean): any;
    mutation(resolver: string, string?: boolean): any;
    subscription(resolver: string, string?: boolean): any;
    _toString(what: string, type: string, resolver: string, data: any): string;
    _toGQL(string: any): any;
    _expandType(type: any): any;
    _getFields(type: any): string;
};
export default Builder;
