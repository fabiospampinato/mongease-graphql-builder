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
        return "\n      " + what + " " + resolver + " " + wrapperCall + " {\n        " + prop + ": " + resolver + " " + resolverCall + " " + fields + "\n      }\n    ";
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