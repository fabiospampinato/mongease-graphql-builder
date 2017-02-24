/* IMPORT */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var graphql_tag_1 = require("graphql-tag");
var mongoose_1 = require("mongoose");
var mongease_1 = require("mongease");
var mongease_graphql_1 = require("mongease-graphql");
/* MONGEASE GRAPHQL BUILDER */
//TODO: Add subscription support
//TODO: Test it
var Builder = {
    /* MAKE */
    make: function (what, name, string) {
        if (string === void 0) { string = false; }
        var What = _.upperFirst(what), item = _.find(mongease_graphql_1.default._parsed, "resolvers." + What + "." + name);
        if (_.isUndefined(item))
            throw new Error('[mongease-graphql-builder] Missing resolver, did you forget to add the MongeaseGraphQL plugin?');
        var type = item['model'].modelName, resolver = item['data'].resolvers[What][name], str = Builder._toString(what, type, name, resolver);
        return string ? str : Builder._toGQL(str);
    },
    query: function (name, string) {
        if (string === void 0) { string = false; }
        return Builder.make('query', name, string);
    },
    mutation: function (name, string) {
        if (string === void 0) { string = false; }
        return Builder.make('mutation', name, string);
    },
    /* UTILITIES */
    _toString: function (what, type, name, resolver) {
        var wrapperArgs = _.reduce(resolver.args, function (acc, type, name) { return acc.concat(["$" + name + ": " + type]); }, []), wrapperCall = wrapperArgs.length ? "( " + wrapperArgs.join(', ') + " )" : '()', resolverArgs = _.reduce(resolver.args, function (acc, type, name) { return acc.concat([name + ": $" + name]); }, []), resolverCall = resolverArgs.length ? "( " + resolverArgs.join(', ') + " )" : '()', prop = _.lowerFirst(type), fields = Builder._getFields(Builder._expandType(resolver.type || type));
        return "\n      " + what + " " + wrapperCall + " {\n        " + prop + ": " + name + " " + resolverCall + " " + fields + "\n      }\n    ";
    },
    _toGQL: function (string) {
        return graphql_tag_1.default(string);
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
                _.forOwn(type, function (val, key) { return type[key] = Builder._expandType(val); });
            }
        }
        else if (_.isFunction(type) && 'modelName' in type) {
            return Builder._expandType(mongease_1.default.getSchema(type.modelName));
        }
        else if (type instanceof mongoose_1.default.Schema) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsWUFBWTs7O0FBRVosMEJBQTRCO0FBQzVCLDJDQUE4QjtBQUM5QixxQ0FBZ0M7QUFDaEMscUNBQWdDO0FBQ2hDLHFEQUErQztBQUUvQyw4QkFBOEI7QUFFOUIsZ0NBQWdDO0FBQ2hDLGVBQWU7QUFFZixJQUFNLE9BQU8sR0FBRztJQUVkLFVBQVU7SUFFVixJQUFJLFlBQUcsSUFBMkMsRUFBRSxJQUFZLEVBQUUsTUFBYztRQUFkLHVCQUFBLEVBQUEsY0FBYztRQUU5RSxJQUFNLElBQUksR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFHLElBQUksQ0FBRSxFQUM1QixJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBRywwQkFBZSxDQUFDLE9BQU8sRUFBRSxlQUFhLElBQUksU0FBSSxJQUFNLENBQUUsQ0FBQztRQUU3RSxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUMsV0FBVyxDQUFHLElBQUksQ0FBRyxDQUFDO1lBQUMsTUFBTSxJQUFJLEtBQUssQ0FBRyxnR0FBZ0csQ0FBRSxDQUFDO1FBRW5KLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQzlCLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUM3QyxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBRyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUUsQ0FBQztRQUU3RCxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFHLEdBQUcsQ0FBRSxDQUFDO0lBRS9DLENBQUM7SUFFRCxLQUFLLFlBQUcsSUFBWSxFQUFFLE1BQWM7UUFBZCx1QkFBQSxFQUFBLGNBQWM7UUFFbEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUcsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUUsQ0FBQztJQUVoRCxDQUFDO0lBRUQsUUFBUSxZQUFHLElBQVksRUFBRSxNQUFjO1FBQWQsdUJBQUEsRUFBQSxjQUFjO1FBRXJDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFHLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFFLENBQUM7SUFFbkQsQ0FBQztJQUVELGVBQWU7SUFFZixTQUFTLEVBQVQsVUFBWSxJQUFZLEVBQUUsSUFBWSxFQUFFLElBQVksRUFBRSxRQUFRO1FBRTVELElBQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxVQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxJQUFNLE9BQUEsR0FBRyxDQUFDLE1BQU0sQ0FBRSxDQUFFLE1BQUksSUFBSSxVQUFLLElBQU0sQ0FBRSxDQUFDLEVBQXBDLENBQW9DLEVBQUUsRUFBYyxDQUFFLEVBQ3JILFdBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxHQUFHLE9BQUssV0FBVyxDQUFDLElBQUksQ0FBRyxJQUFJLENBQUUsT0FBSSxHQUFHLElBQUksRUFDNUUsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxVQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxJQUFNLE9BQUEsR0FBRyxDQUFDLE1BQU0sQ0FBRSxDQUFLLElBQUksV0FBTSxJQUFNLENBQUUsQ0FBQyxFQUFwQyxDQUFvQyxFQUFFLEVBQWMsQ0FBRSxFQUN0SCxZQUFZLEdBQUcsWUFBWSxDQUFDLE1BQU0sR0FBRyxPQUFLLFlBQVksQ0FBQyxJQUFJLENBQUcsSUFBSSxDQUFFLE9BQUksR0FBRyxJQUFJLEVBQy9FLElBQUksR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFHLElBQUksQ0FBRSxFQUM1QixNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBRyxPQUFPLENBQUMsV0FBVyxDQUFHLFFBQVEsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFFLENBQUUsQ0FBQztRQUVwRixNQUFNLENBQUMsYUFDSCxJQUFJLFNBQUksV0FBVyxvQkFDakIsSUFBSSxVQUFLLElBQUksU0FBSSxZQUFZLFNBQUksTUFBTSxvQkFFNUMsQ0FBQztJQUVKLENBQUM7SUFFRCxNQUFNLFlBQUcsTUFBTTtRQUViLE1BQU0sQ0FBQyxxQkFBRyxDQUFHLE1BQU0sQ0FBRSxDQUFDO0lBRXhCLENBQUM7SUFFRCxXQUFXLFlBQUcsSUFBSTtRQUVoQixFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUMsUUFBUSxDQUFHLElBQUksQ0FBRyxDQUFDLENBQUMsQ0FBQztZQUUxQixNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBRyxrQkFBUSxDQUFDLFNBQVMsQ0FBRyxJQUFJLENBQUUsQ0FBRSxDQUFDO1FBRTdELENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBRyxJQUFJLENBQUcsQ0FBQyxDQUFDLENBQUM7WUFFaEMsRUFBRSxDQUFDLENBQUUsSUFBSSxDQUFDLE1BQU8sQ0FBQztnQkFBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDLENBQUM7UUFFOUQsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUMsYUFBYSxDQUFHLElBQUksQ0FBRyxDQUFDLENBQUMsQ0FBQztZQUV0QyxFQUFFLENBQUMsQ0FBRSxJQUFJLENBQUMsY0FBYyxDQUFHLE1BQU0sQ0FBRyxDQUFDLENBQUMsQ0FBQztnQkFFckMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUcsSUFBSSxDQUFDLElBQUksQ0FBRSxDQUFDO1lBRTNDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFFTixDQUFDLENBQUMsTUFBTSxDQUFHLElBQUksRUFBRSxVQUFFLEdBQUcsRUFBRSxHQUFXLElBQU0sT0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBRyxHQUFHLENBQUUsRUFBdkMsQ0FBdUMsQ0FBRSxDQUFDO1lBRXJGLENBQUM7UUFFSCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQyxVQUFVLENBQUcsSUFBSSxDQUFFLElBQUksV0FBVyxJQUFJLElBQUssQ0FBQyxDQUFDLENBQUM7WUFFMUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUcsa0JBQVEsQ0FBQyxTQUFTLENBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFFLENBQUM7UUFFdkUsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBRSxJQUFJLFlBQVksa0JBQVEsQ0FBQyxNQUFPLENBQUMsQ0FBQyxDQUFDO1lBRTdDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFHLElBQUksQ0FBQyxHQUFHLENBQUUsQ0FBQztRQUUxQyxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztJQUVkLENBQUM7SUFFRCxVQUFVLFlBQUcsSUFBSTtRQUVmLGlCQUFtQixHQUFHO1lBQ3BCLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFHLEdBQUcsRUFBRSxVQUFFLEdBQUcsRUFBRSxHQUFXO2dCQUN4QyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBRyxHQUFHLENBQUU7c0JBQ25CLE9BQU8sQ0FBRyxHQUFHLENBQUU7c0JBQ2YsQ0FBQyxDQUFDLE9BQU8sQ0FBRyxHQUFHLENBQUUsSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFFOzBCQUMzRCxPQUFPLENBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFFOzBCQUNsQixFQUFFLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUcsT0FBTyxDQUFHLElBQUksQ0FBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUU7YUFDNUMsT0FBTyxDQUFHLFlBQVksRUFBRSxFQUFFLENBQUU7YUFDNUIsT0FBTyxDQUFHLGNBQWMsRUFBRSxFQUFFLENBQUUsQ0FBQztJQUU3QyxDQUFDO0NBRUYsQ0FBQztBQUVGLFlBQVk7QUFFWixrQkFBZSxPQUFPLENBQUMifQ==