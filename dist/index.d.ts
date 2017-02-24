declare const Builder: {
    make(what: "query" | "mutation" | "subscription", name: string, string?: boolean): any;
    query(name: string, string?: boolean): any;
    mutation(name: string, string?: boolean): any;
    _toString(what: string, type: string, name: string, resolver: any): string;
    _toGQL(string: any): any;
    _expandType(type: any): any;
    _getFields(type: any): string;
};
export default Builder;
