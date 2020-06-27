'use strict'

const DEFAULT_SECURITY_POLICY = require('./default-security-policy')

const strategyNotAFunctionError = () => {
  const e = new Error('E_STRATEGY_NOT_A_FUNCTION')
  e.code = e.message
  return e
}

/**
 * Class that determines whether roles can invoke methods on classes, given a security policy defined at design time and given optional contextual data.
 * Roles and scopes are synonymous in this implementation.
 */
class MethodAccessController {
  /**
   * @param {SecurityPolicy} [policy] The security policy; defaults to a policy that grants all roles permission to invoke all methods on all classes.
   */
  constructor (policy) {
    policy = policy || DEFAULT_SECURITY_POLICY
    this._policy = policy
  }

  /**
   * @deprecated
   * @see MethodAccessController#permits
   */
  grants ({ role, clazz, method, data }) {
    return this.permits({ role, clazz, method, data })
  }

  /**
   * Returns `true` if the given `role` is allowed to invoke the given `method` on the given `class`, given optional contextual `data` and the current security policy.
   * @param {object} arg The argument being deconstructed.
   * @param {string|string[]} arg.role The role or roles attempting to invoke `method` on an instance of `class`.
   * @param {string} arg.clazz The name of the class whose method is being invoked by `role`.
   * @param {string} arg.method The name of the method on an instance of `class` being invoked by `role`.
   * @param {any} [arg.data] Optional contextual data that can be used by the underlying access control strategy.
   * @return {boolean} Whether or not the `role` is allowed to invoke `method` on `class`.
   */
  permits ({ role, clazz, method, data }) {
    if (Array.isArray(role)) {
      return !role.map(it => this.denies({ role: it, clazz, method, data })).includes(true) &&
        role.map(it => this.permits({ role: it, clazz, method, data })).includes(true)
    }

    const entries = this._findEntries({ role, clazz, method })

    return !this._denies({ entries, role, clazz, method, data }) &&
      this._permits({ entries, role, clazz, method, data })
  }

  /**
   * Returns `true` if the given `role` is explicitly prevented from invoking the given `method` on the given `class`, given optional contextual `data` and the current security policy.
   * @param {object} arg The argument being deconstructed.
   * @param {string|string[]} arg.role The role or roles attempting to invoke `method` on an instance of `class`.
   * @param {string} arg.clazz The name of the class whose method is being invoked by `role`.
   * @param {string} arg.method The name of the method on an instance of `class` being invoked by `role`.
   * @param {any} [arg.data] Optional contextual data that can be used by the underlying access control strategy.
   * @return {boolean} Whether or not the `role` is explicitly prevented from invoking `method` on `class`.
   */
  denies ({ role, clazz, method, data }) {
    if (Array.isArray(role)) {
      const results = role.map(it => this.denies({ role: it, clazz, method, data }))
      return results.includes(true)
    }

    return this._denies({
      role, clazz, method, data, entries: this._findEntries({ role, clazz, method })
    })
  }

  _permits ({ entries, role, clazz, method, data }) {
    return this._interrogate({ entries, role, clazz, method, data, permit: true })
  }

  _denies ({ entries, role, clazz, method, data }) {
    return this._interrogate({ entries, role, clazz, method, data, permit: false })
  }

  _interrogate ({ entries, role, clazz, method, data, permit }) {
    for (const it of entries) {
      if (typeof it.strategy === 'boolean') {
        if (it.strategy === permit) return true
        continue
      }

      const strategy = (typeof it.strategy === 'string') ? require(it.strategy) : it.strategy

      if (typeof strategy === 'function') {
        const permitted = strategy({ role, clazz, method, data })
        if (permit && permitted) return true
        if (!permit && !permitted) return false
      } else {
        throw strategyNotAFunctionError()
      }
    }

    return false
  }

  _findEntries ({ role, clazz, method }) {
    return this._policy.filter(it =>
      it?.roles.test(role) && it?.classes.test(clazz) && it?.methods.test(method)
    )
  }
}

module.exports = MethodAccessController
