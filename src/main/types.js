'use strict'

/**
 * Returns whether the given role can invoke the given method on an instance of the given class.
 * If methods are accessors with property name `x`, then the method name is `get ${x}` or `set ${x}`.
 *
 * @function GrantsDecisionFn
 * @param {Object} arg The argument to be deconstructed.
 * @param {string} arg.role The **name of the role** that must be granted and not explicitly denied the ability to invoke the method named `arg.method` on the class named `arg.clazz`, given optional `arg.data`.
 * @param {string} arg.clazz The **name of the class** an instance of which is having its method `arg.method` invoked by role `arg.role`, given optional `arg.data`.
 * @param {string} arg.method The **name of the method** on the class access to which is being controlled.
 * @param {any} [arg.data] Optional, arbitrary data that may be used to make an access control decision.
 * @return {boolean} Whether `arg.role` is granted and not explicitly denied the ability to invoke the method named `arg.method` on the class named `arg.clazz`, given optional `arg.data`.
 */

/**
 * Returns whether the given role is explicitly denied the ability to invoke the given method on an instance of the given class.
 * If methods are accessors with property name `x`, then the method name is `get ${x}` or `set ${x}`.
 *
 * @function DeniesDecisionFn
 * @param {Object} arg The argument to be deconstructed.
 * @param {string} arg.role The **name of the role** that is explicitly denied the ability to invoke the method named `arg.method` on the class named `arg.clazz`, given optional `arg.data`.
 * @param {string} arg.clazz The **name of the class** an instance of which is having its method `arg.method` invoked by role `arg.role`, given optional `arg.data`.
 * @param {string} arg.method The **name of the method** on the class access to which is being controlled.
 * @param {any} [arg.data] Optional, arbitrary data that may be used to make an access control decision.
 * @return {boolean} Whether `arg.role` is explicitly denied the ability to invoke the method named `arg.method` on the class named `arg.clazz`, given optional `arg.data`.
 */

/**
 * @typedef AccessControlStrategy
 * @type {Object}
 * @property {GrantsDecisionFn} grants
 * @property {DeniesDecisionFn} denies
 */
