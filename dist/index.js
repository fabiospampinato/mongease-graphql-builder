/* IMPORT */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var graphql_tag_1 = require("graphql-tag");
var mongease_1 = require("mongease");
/* MONGEASE GRAPHQL BUILDER */
//TODO: Add subscription support
//TODO: Test it
var Builder = {
    /* MAKE */
    make: function (what, resolver, string) {
        if (string === void 0) { string = false; }
        var What = _.upperFirst(what), item = _.find(mongease_1.default._parsed, "config.resolvers." + What + "." + resolver);
        if (_.isUndefined(item))
            throw new Error('[mongease-graphql-builder] Missing resolver, did you forget to add the MongeaseGraphQL plugin?');
        var type = item['model'].modelName, data = item['config'].resolvers[What][resolver], str = Builder._toString(what, type, resolver, data);
        return string ? str : Builder._toGQL(str);
    },
    query: function (resolver, string) {
        if (string === void 0) { string = false; }
        return Builder.make('query', resolver, string);
    },
    mutation: function (resolver, string) {
        if (string === void 0) { string = false; }
        return Builder.make('mutation', resolver, string);
    },
    subscription: function (resolver, string) {
        if (string === void 0) { string = false; }
        return Builder.make('subscription', resolver, string);
    },
    /* UTILITIES */
    _toString: function (what, type, resolver, data) {
        var wrapperArgs = _.reduce(data.args, function (acc, type, name) { return acc.concat(["$" + name + ": " + type]); }, []), wrapperCall = wrapperArgs.length ? "( " + wrapperArgs.join(', ') + " )" : '', resolverArgs = _.reduce(data.args, function (acc, type, name) { return acc.concat([name + ": $" + name]); }, []), resolverCall = resolverArgs.length ? "( " + resolverArgs.join(', ') + " )" : '', prop = _.lowerFirst(type), fields = Builder._getFields(Builder._expandType(data.type || type));
        return "\n      " + what + " " + wrapperCall + " {\n        " + prop + ": " + resolver + " " + resolverCall + " " + fields + "\n      }\n    ";
    },
    _toGQL: function (string) {
        return (_a = ["", ""], _a.raw = ["", ""], graphql_tag_1.default(_a, string));
        var _a;
    },
    _expandType: function (type) {
        if (_.isString(type)) {
            return Builder._expandType(mongease_1.default.getSchema(type));
        }
        else if (_.isArray(type)) {
            if (type.length)
                return [Builder._expandType(type[0])];
        }
        else if (_.isPlainObject(type)) {
            if (type.hasOwnProperty('type')) {
                return Builder._expandType(type.type);
            }
            else {
                return _.transform(type, function (acc, val, key) {
                    acc[key] = Builder._expandType(val);
                }, {});
            }
        }
        else if (_.isFunction(type) && 'modelName' in type) {
            return Builder._expandType(mongease_1.default.getSchema(type.modelName));
        }
        else if (_.isObject(type) && 'childSchemas' in type && 'obj' in type) {
            return Builder._expandType(type.obj);
        }
        return type;
    },
    _getFields: function (type) {
        function nullify(obj) {
            return _.forEach(obj, function (val, key) {
                obj[key] = _.isPlainObject(val)
                    ? nullify(val)
                    : _.isArray(val) && val.length && _.isPlainObject(val[0])
                        ? nullify(val[0])
                        : '';
            });
        }
        return JSON.stringify(nullify(type), undefined, 2)
            .replace(/": "(.*)"/g, '')
            .replace(/"|:|,|\[|\]/g, '');
    }
};
/* EXPORT */
exports.default = Builder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsWUFBWTs7O0FBRVosMEJBQTRCO0FBQzVCLDJDQUE4QjtBQUM5QixxQ0FBZ0M7QUFFaEMsOEJBQThCO0FBRTlCLGdDQUFnQztBQUNoQyxlQUFlO0FBRWYsSUFBTSxPQUFPLEdBQUc7SUFFZCxVQUFVO0lBRVYsSUFBSSxZQUFHLElBQTJDLEVBQUUsUUFBZ0IsRUFBRSxNQUFjO1FBQWQsdUJBQUEsRUFBQSxjQUFjO1FBRWxGLElBQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUcsSUFBSSxDQUFFLEVBQzVCLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFHLGtCQUFRLENBQUMsT0FBTyxFQUFFLHNCQUFvQixJQUFJLFNBQUksUUFBVSxDQUFFLENBQUM7UUFFakYsRUFBRSxDQUFDLENBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBRyxJQUFJLENBQUcsQ0FBQztZQUFDLE1BQU0sSUFBSSxLQUFLLENBQUcsZ0dBQWdHLENBQUUsQ0FBQztRQUVuSixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUM5QixJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFDL0MsR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUcsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFFLENBQUM7UUFFN0QsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBRyxHQUFHLENBQUUsQ0FBQztJQUUvQyxDQUFDO0lBRUQsS0FBSyxZQUFHLFFBQWdCLEVBQUUsTUFBYztRQUFkLHVCQUFBLEVBQUEsY0FBYztRQUV0QyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRyxPQUFP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