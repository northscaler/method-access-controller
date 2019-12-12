'use strict'

/**
 * An entry in a security policy.
 *
 * @typedef SecurityPolicyEntry
 * @type {Object}
 * @property {RegExp} roles A regular expression matching the names of roles that will be invoking methods whose names match property `methods` on classes whose names match `classes`.
 * @property {RegExp} classes A regular expression identifying names of classes whose method invocations will be controlled.
 * @property {RegExp} methods A regular expression identifying names of methods on classes whose names match property `classes`.
 * @property {(boolean|AccessControlStrategy|string)} strategy If `strategy` is one of the boolean literals `true` or `false`, then access is statically granted or denied, respectively.
 * If `strategy` is an {@link AccessControlStrategy}, then it will be invoked to determine whether access is allowed.
 * If `strategy` is a string, it is treated as a module, `require`d, and expected to export a function of type {@link AccessControlStrategy}.
 */

/**
 * A security policy, which is simply an array of {@link SecurityPolicyEntry}s.
 *
 * @typedef {SecurityPolicyEntry[]} SecurityPolicy
 */

/**
 * The default security policy, permitting all roles the ability to call all methods on all classes.
 *
 * @type SecurityPolicy
 */
const policy = [
  {
    roles: /^.*$/,
    classes: /^.*$/,
    methods: /^.*$/,
    strategy: true
  }
]

module.exports = Object.freeze(policy)
