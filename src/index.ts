
/* IMPORT */

import find = require ( 'lodash/find' );
import forEach = require ( 'lodash/forEach' );
import isArray = require ( 'lodash/isArray' );
import isFunction = require ( 'lodash/isFunction' );
import isObject = require ( 'lodash/isObject' );
import isPlainObject = require ( 'lodash/isPlainObject' );
import isString = require ( 'lodash/isString' );
import isUndefined = require ( 'lodash/isUndefined' );
import lowerFirst = require ( 'lodash/lowerFirst' );
import reduce = require ( 'lodash/reduce' );
import transform = require ( 'lodash/transform' );
import upperFirst = require ( 'lodash/upperFirst' );
import gql from 'graphql-tag';
import Mongease from 'mongease';

/* MONGEASE GRAPHQL BUILDER */

//TODO: Add subscription support
//TODO: Test it

const Builder = {

  /* MAKE */

  make ( what: 'query' | 'mutation' | 'subscription', resolver: string, string = false ) {

    const What = upperFirst ( what ),
          item = find ( Mongease._parsed, `config.resolvers.${What}.${resolver}` );

    if ( isUndefined ( item ) ) throw new Error ( '[mongease-graphql-builder] Missing resolver, did you forget to add the MongeaseGraphQL plugin?' );

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

    const wrapperArgs = reduce ( data.args, ( acc, type, name ) => acc.concat ([ `$${name}: ${type}` ]), [] as string[] ),
          wrapperCall = wrapperArgs.length ? `( ${wrapperArgs.join ( ', ' )} )` : '',
          resolverArgs = reduce ( data.args, ( acc, type, name ) => acc.concat ([ `${name}: $${name}` ]), [] as string[] ),
          resolverCall = resolverArgs.length ? `( ${resolverArgs.join ( ', ' )} )` : '',
          prop = lowerFirst ( type ),
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

    if ( isString ( type ) ) {

      return Builder._expandType ( Mongease.getSchema ( type ) );

    } else if ( isArray ( type ) ) {

      if ( type.length ) return [Builder._expandType ( type[0] )];

    } else if ( isPlainObject ( type ) ) {

      if ( type.hasOwnProperty ( 'type' ) ) {

        return Builder._expandType ( type.type );

      } else {

        return transform ( type, ( acc, val, key: string ) => {

          acc[key] = Builder._expandType ( val );

        }, {} );

      }

    } else if ( isFunction ( type ) && 'modelName' in type ) {

      return Builder._expandType ( Mongease.getSchema ( type.modelName ) );

    } else if ( isObject ( type ) && 'childSchemas' in type && 'obj' in type ) { // Is a Mongoose's Schema

      return Builder._expandType ( type.obj );

    }

    return type;

  },

  _getFields ( type ) {

    function nullify ( obj ) {
      return forEach ( obj, ( val, key: string ) => {
        obj[key] = isPlainObject ( val )
                     ? nullify ( val )
                     : isArray ( val ) && val.length && isPlainObject ( val[0] )
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

export = Object.assign ( Builder, { default: Builder } );
