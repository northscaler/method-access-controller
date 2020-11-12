'use strict';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYWluL3R5cGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBRUE7Ozs7Ozs7Ozs7Ozs7QUFhQTs7Ozs7Ozs7Ozs7OztBQWFBIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnXG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiByb2xlIGNhbiBpbnZva2UgdGhlIGdpdmVuIG1ldGhvZCBvbiBhbiBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gY2xhc3MuXG4gKiBJZiBtZXRob2RzIGFyZSBhY2Nlc3NvcnMgd2l0aCBwcm9wZXJ0eSBuYW1lIGB4YCwgdGhlbiB0aGUgbWV0aG9kIG5hbWUgaXMgYGdldCAke3h9YCBvciBgc2V0ICR7eH1gLlxuICpcbiAqIEBmdW5jdGlvbiBHcmFudHNEZWNpc2lvbkZuXG4gKiBAcGFyYW0ge09iamVjdH0gYXJnIFRoZSBhcmd1bWVudCB0byBiZSBkZWNvbnN0cnVjdGVkLlxuICogQHBhcmFtIHtzdHJpbmd9IGFyZy5yb2xlIFRoZSAqKm5hbWUgb2YgdGhlIHJvbGUqKiB0aGF0IG11c3QgYmUgZ3JhbnRlZCBhbmQgbm90IGV4cGxpY2l0bHkgZGVuaWVkIHRoZSBhYmlsaXR5IHRvIGludm9rZSB0aGUgbWV0aG9kIG5hbWVkIGBhcmcubWV0aG9kYCBvbiB0aGUgY2xhc3MgbmFtZWQgYGFyZy5jbGF6emAsIGdpdmVuIG9wdGlvbmFsIGBhcmcuZGF0YWAuXG4gKiBAcGFyYW0ge3N0cmluZ30gYXJnLmNsYXp6IFRoZSAqKm5hbWUgb2YgdGhlIGNsYXNzKiogYW4gaW5zdGFuY2Ugb2Ygd2hpY2ggaXMgaGF2aW5nIGl0cyBtZXRob2QgYGFyZy5tZXRob2RgIGludm9rZWQgYnkgcm9sZSBgYXJnLnJvbGVgLCBnaXZlbiBvcHRpb25hbCBgYXJnLmRhdGFgLlxuICogQHBhcmFtIHtzdHJpbmd9IGFyZy5tZXRob2QgVGhlICoqbmFtZSBvZiB0aGUgbWV0aG9kKiogb24gdGhlIGNsYXNzIGFjY2VzcyB0byB3aGljaCBpcyBiZWluZyBjb250cm9sbGVkLlxuICogQHBhcmFtIHthbnl9IFthcmcuZGF0YV0gT3B0aW9uYWwsIGFyYml0cmFyeSBkYXRhIHRoYXQgbWF5IGJlIHVzZWQgdG8gbWFrZSBhbiBhY2Nlc3MgY29udHJvbCBkZWNpc2lvbi5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgYGFyZy5yb2xlYCBpcyBncmFudGVkIGFuZCBub3QgZXhwbGljaXRseSBkZW5pZWQgdGhlIGFiaWxpdHkgdG8gaW52b2tlIHRoZSBtZXRob2QgbmFtZWQgYGFyZy5tZXRob2RgIG9uIHRoZSBjbGFzcyBuYW1lZCBgYXJnLmNsYXp6YCwgZ2l2ZW4gb3B0aW9uYWwgYGFyZy5kYXRhYC5cbiAqL1xuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gcm9sZSBpcyBleHBsaWNpdGx5IGRlbmllZCB0aGUgYWJpbGl0eSB0byBpbnZva2UgdGhlIGdpdmVuIG1ldGhvZCBvbiBhbiBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gY2xhc3MuXG4gKiBJZiBtZXRob2RzIGFyZSBhY2Nlc3NvcnMgd2l0aCBwcm9wZXJ0eSBuYW1lIGB4YCwgdGhlbiB0aGUgbWV0aG9kIG5hbWUgaXMgYGdldCAke3h9YCBvciBgc2V0ICR7eH1gLlxuICpcbiAqIEBmdW5jdGlvbiBEZW5pZXNEZWNpc2lvbkZuXG4gKiBAcGFyYW0ge09iamVjdH0gYXJnIFRoZSBhcmd1bWVudCB0byBiZSBkZWNvbnN0cnVjdGVkLlxuICogQHBhcmFtIHtzdHJpbmd9IGFyZy5yb2xlIFRoZSAqKm5hbWUgb2YgdGhlIHJvbGUqKiB0aGF0IGlzIGV4cGxpY2l0bHkgZGVuaWVkIHRoZSBhYmlsaXR5IHRvIGludm9rZSB0aGUgbWV0aG9kIG5hbWVkIGBhcmcubWV0aG9kYCBvbiB0aGUgY2xhc3MgbmFtZWQgYGFyZy5jbGF6emAsIGdpdmVuIG9wdGlvbmFsIGBhcmcuZGF0YWAuXG4gKiBAcGFyYW0ge3N0cmluZ30gYXJnLmNsYXp6IFRoZSAqKm5hbWUgb2YgdGhlIGNsYXNzKiogYW4gaW5zdGFuY2Ugb2Ygd2hpY2ggaXMgaGF2aW5nIGl0cyBtZXRob2QgYGFyZy5tZXRob2RgIGludm9rZWQgYnkgcm9sZSBgYXJnLnJvbGVgLCBnaXZlbiBvcHRpb25hbCBgYXJnLmRhdGFgLlxuICogQHBhcmFtIHtzdHJpbmd9IGFyZy5tZXRob2QgVGhlICoqbmFtZSBvZiB0aGUgbWV0aG9kKiogb24gdGhlIGNsYXNzIGFjY2VzcyB0byB3aGljaCBpcyBiZWluZyBjb250cm9sbGVkLlxuICogQHBhcmFtIHthbnl9IFthcmcuZGF0YV0gT3B0aW9uYWwsIGFyYml0cmFyeSBkYXRhIHRoYXQgbWF5IGJlIHVzZWQgdG8gbWFrZSBhbiBhY2Nlc3MgY29udHJvbCBkZWNpc2lvbi5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgYGFyZy5yb2xlYCBpcyBleHBsaWNpdGx5IGRlbmllZCB0aGUgYWJpbGl0eSB0byBpbnZva2UgdGhlIG1ldGhvZCBuYW1lZCBgYXJnLm1ldGhvZGAgb24gdGhlIGNsYXNzIG5hbWVkIGBhcmcuY2xhenpgLCBnaXZlbiBvcHRpb25hbCBgYXJnLmRhdGFgLlxuICovXG5cbi8qKlxuICogQHR5cGVkZWYgQWNjZXNzQ29udHJvbFN0cmF0ZWd5XG4gKiBAdHlwZSB7T2JqZWN0fVxuICogQHByb3BlcnR5IHtHcmFudHNEZWNpc2lvbkZufSBncmFudHNcbiAqIEBwcm9wZXJ0eSB7RGVuaWVzRGVjaXNpb25Gbn0gZGVuaWVzXG4gKi9cbiJdfQ==