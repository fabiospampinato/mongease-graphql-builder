
/* IMPORT */

import * as _ from 'lodash';
import gql from 'graphql-tag';
import Mongoose from 'mongoose';
import Mongease from 'mongease';
import MongeaseGraphQL from 'mongease-graphql';

/* MONGEASE GRAPHQL BUILDER */

//TODO: Add subscription support
//TODO: Test it

const Builder = {

  /* MAKE */

  make ( what: 'query' | 'mutation' | 'subscription', name: string, string = false ) {

    const What = _.upperFirst ( what ),
          item = _.find ( MongeaseGraphQL._parsed, `resolvers.${What}.${name}` );

    if ( _.isUndefined ( item ) ) throw new Error ( '[mongease-graphql-builder] Missing resolver, did you forget to add the MongeaseGraphQL plugin?' );

    const type = item['model'].modelName,
          resolver = item['data'].resolvers[What][name],
          str = Builder._toString ( what, type, name, resolver );

    return string ? str : Builder._toGQL ( str );

  },

  query ( name: string, string = false ) {

    return Builder.make ( 'query', name, string );

  },

  mutation ( name: string, string = false ) {

    return Builder.make ( 'mutation', name, string );
  },

  subscription ( resolver: string, string = false ) {

    return Builder.make ( 'subscription', resolver, string );

  },

  /* UTILITIES */

  _toString ( what: string, type: string, name: string, resolver ): string { //TODO: We should probably do some memoization here

    const wrapperArgs = _.reduce ( resolver.args, ( acc, type, name ) => acc.concat ([ `$${name}: ${type}` ]), [] as string[] ),
          wrapperCall = wrapperArgs.length ? `( ${wrapperArgs.join ( ', ' )} )` : '()',
          resolverArgs = _.reduce ( resolver.args, ( acc, type, name ) => acc.concat ([ `${name}: $${name}` ]), [] as string[] ),
          resolverCall = resolverArgs.length ? `( ${resolverArgs.join ( ', ' )} )` : '()',
          prop = _.lowerFirst ( type ),
          fields = Builder._getFields ( Builder._expandType ( resolver.type || type ) );

    return `
      ${what} ${wrapperCall} {
        ${prop}: ${name} ${resolverCall} ${fields}
      }
    `;

  },

  _toGQL ( string ) {

    return gql ( string );

  },

  _expandType ( type ) { //TODO: Maybe create a module out of it

    if ( _.isString ( type ) ) {

      return Builder._expandType ( Mongease.getSchema ( type ) );

    } else if ( _.isArray ( type ) ) {

      if ( type.length ) return [Builder._expandType ( type[0] )];

    } else if ( _.isPlainObject ( type ) ) {

      if ( type.hasOwnProperty ( 'type' ) ) {

        return Builder._expandType ( type.type );

      } else {

        _.forOwn ( type, ( val, key: string ) => type[key] = Builder._expandType ( val ) );

      }

    } else if ( _.isFunction ( type ) && 'modelName' in type ) {

      return Builder._expandType ( Mongease.getSchema ( type.modelName ) );

    } else if ( type instanceof Mongoose.Schema ) {

      return Builder._expandType ( type.obj );

    }

    return type;

  },

  _getFields ( type ) {

    function nullify ( obj ) {
      return _.forEach ( obj, ( val, key: string ) => {
        obj[key] = _.isPlainObject ( val )
                     ? nullify ( val )
                     : _.isArray ( val ) && val.length && _.isPlainObject ( val[0] )
                       ? nullify ( val[0] )
                       : '';
      });
    }

    return JSON.stringify ( nullify ( type ), undefined, 2 )
               .replace ( /": "(.*)"/g, '' )
               .replace ( /"|:|,|\[|\]/g, '' );

  }

};

/* EXPORT */

export default Builder;
