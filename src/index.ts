
/* IMPORT */

import * as _ from 'lodash';
import gql from 'graphql-tag';
import Mongease from 'mongease';

/* MONGEASE GRAPHQL BUILDER */

//TODO: Add subscription support
//TODO: Test it

const Builder = {

  /* MAKE */

  make ( what: 'query' | 'mutation' | 'subscription', resolver: string, string = false ) {

    const What = _.upperFirst ( what ),
          item = _.find ( Mongease._parsed, `config.resolvers.${What}.${resolver}` );

    if ( _.isUndefined ( item ) ) throw new Error ( '[mongease-graphql-builder] Missing resolver, did you forget to add the MongeaseGraphQL plugin?' );

    const type = item['model'].modelName,
          data = item['config'].resolvers[What][resolver],
          str = Builder._toString ( what, type, resolver, data );

    return string ? str : Builder._toGQL ( str );

  },

  query ( resolver: string, string = false ) {

    return Builder.make ( 'query', resolver, string );

  },

  mutation ( resolver: string, string = false ) {

    return Builder.make ( 'mutation', resolver, string );

  },

  subscription ( resolver: string, string = false ) {

    return Builder.make ( 'subscription', resolver, string );

  },

  /* UTILITIES */

  _toString ( what: string, type: string, resolver: string, data ): string { //TODO: We should probably do some memoization here

    const wrapperArgs = _.reduce ( data.args, ( acc, type, name ) => acc.concat ([ `$${name}: ${type}` ]), [] as string[] ),
          wrapperCall = wrapperArgs.length ? `( ${wrapperArgs.join ( ', ' )} )` : '',
          resolverArgs = _.reduce ( data.args, ( acc, type, name ) => acc.concat ([ `${name}: $${name}` ]), [] as string[] ),
          resolverCall = resolverArgs.length ? `( ${resolverArgs.join ( ', ' )} )` : '',
          prop = _.lowerFirst ( type ),
          fields = Builder._getFields ( Builder._expandType ( data.type || type ) );

    return `
      ${what} ${resolver} ${wrapperCall} {
        ${prop}: ${resolver} ${resolverCall} ${fields}
      }
    `;

  },

  _toGQL ( string ) {

    return gql`${string}`;

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

        return _.transform ( type, ( acc, val, key: string ) => {

          acc[key] = Builder._expandType ( val );

        }, {} );

      }

    } else if ( _.isFunction ( type ) && 'modelName' in type ) {

      return Builder._expandType ( Mongease.getSchema ( type.modelName ) );

    } else if ( _.isObject ( type ) && 'childSchemas' in type && 'obj' in type ) { // Is a Mongoose's Schema

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
