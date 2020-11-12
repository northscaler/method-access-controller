'use strict';

const DEFAULT_SECURITY_POLICY = require('./default-security-policy');

const strategyNotAFunctionError = () => {
  const e = new Error('E_STRATEGY_NOT_A_FUNCTION');
  e.code = e.message;
  return e;
};
/**
 * Class that determines whether roles can invoke methods on classes, given a security policy defined at design time and given optional contextual data.
 * Roles and scopes are synonymous in this implementation.
 */


class MethodAccessController {
  /**
   * @param {SecurityPolicy} [policy] The security policy; defaults to a policy that grants all roles permission to invoke all methods on all classes.
   */
  constructor(policy) {
    policy = policy || DEFAULT_SECURITY_POLICY;
    this._policy = policy;
  }
  /**
   * @deprecated
   * @see MethodAccessController#permits
   */


  grants({
    role,
    clazz,
    method,
    data
  }) {
    return this.permits({
      role,
      clazz,
      method,
      data
    });
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


  permits({
    role,
    clazz,
    method,
    data
  }) {
    if (Array.isArray(role)) {
      return !role.map(it => this.denies({
        role: it,
        clazz,
        method,
        data
      })).includes(true) && role.map(it => this.permits({
        role: it,
        clazz,
        method,
        data
      })).includes(true);
    }

    const entries = this._findEntries({
      role,
      clazz,
      method
    });

    return !this._denies({
      entries,
      role,
      clazz,
      method,
      data
    }) && this._permits({
      entries,
      role,
      clazz,
      method,
      data
    });
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


  denies({
    role,
    clazz,
    method,
    data
  }) {
    if (Array.isArray(role)) {
      const results = role.map(it => this.denies({
        role: it,
        clazz,
        method,
        data
      }));
      return results.includes(true);
    }

    return this._denies({
      role,
      clazz,
      method,
      data,
      entries: this._findEntries({
        role,
        clazz,
        method
      })
    });
  }

  _permits({
    entries,
    role,
    clazz,
    method,
    data
  }) {
    return this._interrogate({
      entries,
      role,
      clazz,
      method,
      data,
      permit: true
    });
  }

  _denies({
    entries,
    role,
    clazz,
    method,
    data
  }) {
    return this._interrogate({
      entries,
      role,
      clazz,
      method,
      data,
      permit: false
    });
  }

  _interrogate({
    entries,
    role,
    clazz,
    method,
    data,
    permit
  }) {
    for (const it of entries) {
      if (typeof it.strategy === 'boolean') {
        if (it.strategy === permit) return true;
        continue;
      }

      const strategy = typeof it.strategy === 'string' ? require(it.strategy) : it.strategy;

      if (typeof strategy === 'function') {
        const permitted = strategy({
          role,
          clazz,
          method,
          data
        });
        if (permit && permitted) return true;
        if (!permit && !permitted) return false;
      } else {
        throw strategyNotAFunctionError();
      }
    }

    return false;
  }

  _findEntries({
    role,
    clazz,
    method
  }) {
    return this._policy.filter(it => (it === null || it === void 0 ? void 0 : it.roles.test(role)) && (it === null || it === void 0 ? void 0 : it.classes.test(clazz)) && (it === null || it === void 0 ? void 0 : it.methods.test(method)));
  }

}

module.exports = MethodAccessController;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYWluL01ldGhvZEFjY2Vzc0NvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsiREVGQVVMVF9TRUNVUklUWV9QT0xJQ1kiLCJyZXF1aXJlIiwic3RyYXRlZ3lOb3RBRnVuY3Rpb25FcnJvciIsImUiLCJFcnJvciIsImNvZGUiLCJtZXNzYWdlIiwiTWV0aG9kQWNjZXNzQ29udHJvbGxlciIsImNvbnN0cnVjdG9yIiwicG9saWN5IiwiX3BvbGljeSIsImdyYW50cyIsInJvbGUiLCJjbGF6eiIsIm1ldGhvZCIsImRhdGEiLCJwZXJtaXRzIiwiQXJyYXkiLCJpc0FycmF5IiwibWFwIiwiaXQiLCJkZW5pZXMiLCJpbmNsdWRlcyIsImVudHJpZXMiLCJfZmluZEVudHJpZXMiLCJfZGVuaWVzIiwiX3Blcm1pdHMiLCJyZXN1bHRzIiwiX2ludGVycm9nYXRlIiwicGVybWl0Iiwic3RyYXRlZ3kiLCJwZXJtaXR0ZWQiLCJmaWx0ZXIiLCJyb2xlcyIsInRlc3QiLCJjbGFzc2VzIiwibWV0aG9kcyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLE1BQU1BLHVCQUF1QixHQUFHQyxPQUFPLENBQUMsMkJBQUQsQ0FBdkM7O0FBRUEsTUFBTUMseUJBQXlCLEdBQUcsTUFBTTtBQUN0QyxRQUFNQyxDQUFDLEdBQUcsSUFBSUMsS0FBSixDQUFVLDJCQUFWLENBQVY7QUFDQUQsRUFBQUEsQ0FBQyxDQUFDRSxJQUFGLEdBQVNGLENBQUMsQ0FBQ0csT0FBWDtBQUNBLFNBQU9ILENBQVA7QUFDRCxDQUpEO0FBTUE7Ozs7OztBQUlBLE1BQU1JLHNCQUFOLENBQTZCO0FBQzNCOzs7QUFHQUMsRUFBQUEsV0FBVyxDQUFFQyxNQUFGLEVBQVU7QUFDbkJBLElBQUFBLE1BQU0sR0FBR0EsTUFBTSxJQUFJVCx1QkFBbkI7QUFDQSxTQUFLVSxPQUFMLEdBQWVELE1BQWY7QUFDRDtBQUVEOzs7Ozs7QUFJQUUsRUFBQUEsTUFBTSxDQUFFO0FBQUVDLElBQUFBLElBQUY7QUFBUUMsSUFBQUEsS0FBUjtBQUFlQyxJQUFBQSxNQUFmO0FBQXVCQyxJQUFBQTtBQUF2QixHQUFGLEVBQWlDO0FBQ3JDLFdBQU8sS0FBS0MsT0FBTCxDQUFhO0FBQUVKLE1BQUFBLElBQUY7QUFBUUMsTUFBQUEsS0FBUjtBQUFlQyxNQUFBQSxNQUFmO0FBQXVCQyxNQUFBQTtBQUF2QixLQUFiLENBQVA7QUFDRDtBQUVEOzs7Ozs7Ozs7OztBQVNBQyxFQUFBQSxPQUFPLENBQUU7QUFBRUosSUFBQUEsSUFBRjtBQUFRQyxJQUFBQSxLQUFSO0FBQWVDLElBQUFBLE1BQWY7QUFBdUJDLElBQUFBO0FBQXZCLEdBQUYsRUFBaUM7QUFDdEMsUUFBSUUsS0FBSyxDQUFDQyxPQUFOLENBQWNOLElBQWQsQ0FBSixFQUF5QjtBQUN2QixhQUFPLENBQUNBLElBQUksQ0FBQ08sR0FBTCxDQUFTQyxFQUFFLElBQUksS0FBS0MsTUFBTCxDQUFZO0FBQUVULFFBQUFBLElBQUksRUFBRVEsRUFBUjtBQUFZUCxRQUFBQSxLQUFaO0FBQW1CQyxRQUFBQSxNQUFuQjtBQUEyQkMsUUFBQUE7QUFBM0IsT0FBWixDQUFmLEVBQStETyxRQUEvRCxDQUF3RSxJQUF4RSxDQUFELElBQ0xWLElBQUksQ0FBQ08sR0FBTCxDQUFTQyxFQUFFLElBQUksS0FBS0osT0FBTCxDQUFhO0FBQUVKLFFBQUFBLElBQUksRUFBRVEsRUFBUjtBQUFZUCxRQUFBQSxLQUFaO0FBQW1CQyxRQUFBQSxNQUFuQjtBQUEyQkMsUUFBQUE7QUFBM0IsT0FBYixDQUFmLEVBQWdFTyxRQUFoRSxDQUF5RSxJQUF6RSxDQURGO0FBRUQ7O0FBRUQsVUFBTUMsT0FBTyxHQUFHLEtBQUtDLFlBQUwsQ0FBa0I7QUFBRVosTUFBQUEsSUFBRjtBQUFRQyxNQUFBQSxLQUFSO0FBQWVDLE1BQUFBO0FBQWYsS0FBbEIsQ0FBaEI7O0FBRUEsV0FBTyxDQUFDLEtBQUtXLE9BQUwsQ0FBYTtBQUFFRixNQUFBQSxPQUFGO0FBQVdYLE1BQUFBLElBQVg7QUFBaUJDLE1BQUFBLEtBQWpCO0FBQXdCQyxNQUFBQSxNQUF4QjtBQUFnQ0MsTUFBQUE7QUFBaEMsS0FBYixDQUFELElBQ0wsS0FBS1csUUFBTCxDQUFjO0FBQUVILE1BQUFBLE9BQUY7QUFBV1gsTUFBQUEsSUFBWDtBQUFpQkMsTUFBQUEsS0FBakI7QUFBd0JDLE1BQUFBLE1BQXhCO0FBQWdDQyxNQUFBQTtBQUFoQyxLQUFkLENBREY7QUFFRDtBQUVEOzs7Ozs7Ozs7OztBQVNBTSxFQUFBQSxNQUFNLENBQUU7QUFBRVQsSUFBQUEsSUFBRjtBQUFRQyxJQUFBQSxLQUFSO0FBQWVDLElBQUFBLE1BQWY7QUFBdUJDLElBQUFBO0FBQXZCLEdBQUYsRUFBaUM7QUFDckMsUUFBSUUsS0FBSyxDQUFDQyxPQUFOLENBQWNOLElBQWQsQ0FBSixFQUF5QjtBQUN2QixZQUFNZSxPQUFPLEdBQUdmLElBQUksQ0FBQ08sR0FBTCxDQUFTQyxFQUFFLElBQUksS0FBS0MsTUFBTCxDQUFZO0FBQUVULFFBQUFBLElBQUksRUFBRVEsRUFBUjtBQUFZUCxRQUFBQSxLQUFaO0FBQW1CQyxRQUFBQSxNQUFuQjtBQUEyQkMsUUFBQUE7QUFBM0IsT0FBWixDQUFmLENBQWhCO0FBQ0EsYUFBT1ksT0FBTyxDQUFDTCxRQUFSLENBQWlCLElBQWpCLENBQVA7QUFDRDs7QUFFRCxXQUFPLEtBQUtHLE9BQUwsQ0FBYTtBQUNsQmIsTUFBQUEsSUFEa0I7QUFDWkMsTUFBQUEsS0FEWTtBQUNMQyxNQUFBQSxNQURLO0FBQ0dDLE1BQUFBLElBREg7QUFDU1EsTUFBQUEsT0FBTyxFQUFFLEtBQUtDLFlBQUwsQ0FBa0I7QUFBRVosUUFBQUEsSUFBRjtBQUFRQyxRQUFBQSxLQUFSO0FBQWVDLFFBQUFBO0FBQWYsT0FBbEI7QUFEbEIsS0FBYixDQUFQO0FBR0Q7O0FBRURZLEVBQUFBLFFBQVEsQ0FBRTtBQUFFSCxJQUFBQSxPQUFGO0FBQVdYLElBQUFBLElBQVg7QUFBaUJDLElBQUFBLEtBQWpCO0FBQXdCQyxJQUFBQSxNQUF4QjtBQUFnQ0MsSUFBQUE7QUFBaEMsR0FBRixFQUEwQztBQUNoRCxXQUFPLEtBQUthLFlBQUwsQ0FBa0I7QUFBRUwsTUFBQUEsT0FBRjtBQUFXWCxNQUFBQSxJQUFYO0FBQWlCQyxNQUFBQSxLQUFqQjtBQUF3QkMsTUFBQUEsTUFBeEI7QUFBZ0NDLE1BQUFBLElBQWhDO0FBQXNDYyxNQUFBQSxNQUFNLEVBQUU7QUFBOUMsS0FBbEIsQ0FBUDtBQUNEOztBQUVESixFQUFBQSxPQUFPLENBQUU7QUFBRUYsSUFBQUEsT0FBRjtBQUFXWCxJQUFBQSxJQUFYO0FBQWlCQyxJQUFBQSxLQUFqQjtBQUF3QkMsSUFBQUEsTUFBeEI7QUFBZ0NDLElBQUFBO0FBQWhDLEdBQUYsRUFBMEM7QUFDL0MsV0FBTyxLQUFLYSxZQUFMLENBQWtCO0FBQUVMLE1BQUFBLE9BQUY7QUFBV1gsTUFBQUEsSUFBWDtBQUFpQkMsTUFBQUEsS0FBakI7QUFBd0JDLE1BQUFBLE1BQXhCO0FBQWdDQyxNQUFBQSxJQUFoQztBQUFzQ2MsTUFBQUEsTUFBTSxFQUFFO0FBQTlDLEtBQWxCLENBQVA7QUFDRDs7QUFFREQsRUFBQUEsWUFBWSxDQUFFO0FBQUVMLElBQUFBLE9BQUY7QUFBV1gsSUFBQUEsSUFBWDtBQUFpQkMsSUFBQUEsS0FBakI7QUFBd0JDLElBQUFBLE1BQXhCO0FBQWdDQyxJQUFBQSxJQUFoQztBQUFzQ2MsSUFBQUE7QUFBdEMsR0FBRixFQUFrRDtBQUM1RCxTQUFLLE1BQU1ULEVBQVgsSUFBaUJHLE9BQWpCLEVBQTBCO0FBQ3hCLFVBQUksT0FBT0gsRUFBRSxDQUFDVSxRQUFWLEtBQXVCLFNBQTNCLEVBQXNDO0FBQ3BDLFlBQUlWLEVBQUUsQ0FBQ1UsUUFBSCxLQUFnQkQsTUFBcEIsRUFBNEIsT0FBTyxJQUFQO0FBQzVCO0FBQ0Q7O0FBRUQsWUFBTUMsUUFBUSxHQUFJLE9BQU9WLEVBQUUsQ0FBQ1UsUUFBVixLQUF1QixRQUF4QixHQUFvQzdCLE9BQU8sQ0FBQ21CLEVBQUUsQ0FBQ1UsUUFBSixDQUEzQyxHQUEyRFYsRUFBRSxDQUFDVSxRQUEvRTs7QUFFQSxVQUFJLE9BQU9BLFFBQVAsS0FBb0IsVUFBeEIsRUFBb0M7QUFDbEMsY0FBTUMsU0FBUyxHQUFHRCxRQUFRLENBQUM7QUFBRWxCLFVBQUFBLElBQUY7QUFBUUMsVUFBQUEsS0FBUjtBQUFlQyxVQUFBQSxNQUFmO0FBQXVCQyxVQUFBQTtBQUF2QixTQUFELENBQTFCO0FBQ0EsWUFBSWMsTUFBTSxJQUFJRSxTQUFkLEVBQXlCLE9BQU8sSUFBUDtBQUN6QixZQUFJLENBQUNGLE1BQUQsSUFBVyxDQUFDRSxTQUFoQixFQUEyQixPQUFPLEtBQVA7QUFDNUIsT0FKRCxNQUlPO0FBQ0wsY0FBTTdCLHlCQUF5QixFQUEvQjtBQUNEO0FBQ0Y7O0FBRUQsV0FBTyxLQUFQO0FBQ0Q7O0FBRURzQixFQUFBQSxZQUFZLENBQUU7QUFBRVosSUFBQUEsSUFBRjtBQUFRQyxJQUFBQSxLQUFSO0FBQWVDLElBQUFBO0FBQWYsR0FBRixFQUEyQjtBQUNyQyxXQUFPLEtBQUtKLE9BQUwsQ0FBYXNCLE1BQWIsQ0FBb0JaLEVBQUUsSUFDM0IsQ0FBQUEsRUFBRSxTQUFGLElBQUFBLEVBQUUsV0FBRixZQUFBQSxFQUFFLENBQUVhLEtBQUosQ0FBVUMsSUFBVixDQUFldEIsSUFBZixPQUF3QlEsRUFBeEIsYUFBd0JBLEVBQXhCLHVCQUF3QkEsRUFBRSxDQUFFZSxPQUFKLENBQVlELElBQVosQ0FBaUJyQixLQUFqQixDQUF4QixNQUFtRE8sRUFBbkQsYUFBbURBLEVBQW5ELHVCQUFtREEsRUFBRSxDQUFFZ0IsT0FBSixDQUFZRixJQUFaLENBQWlCcEIsTUFBakIsQ0FBbkQsQ0FESyxDQUFQO0FBR0Q7O0FBM0YwQjs7QUE4RjdCdUIsTUFBTSxDQUFDQyxPQUFQLEdBQWlCL0Isc0JBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IERFRkFVTFRfU0VDVVJJVFlfUE9MSUNZID0gcmVxdWlyZSgnLi9kZWZhdWx0LXNlY3VyaXR5LXBvbGljeScpXG5cbmNvbnN0IHN0cmF0ZWd5Tm90QUZ1bmN0aW9uRXJyb3IgPSAoKSA9PiB7XG4gIGNvbnN0IGUgPSBuZXcgRXJyb3IoJ0VfU1RSQVRFR1lfTk9UX0FfRlVOQ1RJT04nKVxuICBlLmNvZGUgPSBlLm1lc3NhZ2VcbiAgcmV0dXJuIGVcbn1cblxuLyoqXG4gKiBDbGFzcyB0aGF0IGRldGVybWluZXMgd2hldGhlciByb2xlcyBjYW4gaW52b2tlIG1ldGhvZHMgb24gY2xhc3NlcywgZ2l2ZW4gYSBzZWN1cml0eSBwb2xpY3kgZGVmaW5lZCBhdCBkZXNpZ24gdGltZSBhbmQgZ2l2ZW4gb3B0aW9uYWwgY29udGV4dHVhbCBkYXRhLlxuICogUm9sZXMgYW5kIHNjb3BlcyBhcmUgc3lub255bW91cyBpbiB0aGlzIGltcGxlbWVudGF0aW9uLlxuICovXG5jbGFzcyBNZXRob2RBY2Nlc3NDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7U2VjdXJpdHlQb2xpY3l9IFtwb2xpY3ldIFRoZSBzZWN1cml0eSBwb2xpY3k7IGRlZmF1bHRzIHRvIGEgcG9saWN5IHRoYXQgZ3JhbnRzIGFsbCByb2xlcyBwZXJtaXNzaW9uIHRvIGludm9rZSBhbGwgbWV0aG9kcyBvbiBhbGwgY2xhc3Nlcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yIChwb2xpY3kpIHtcbiAgICBwb2xpY3kgPSBwb2xpY3kgfHwgREVGQVVMVF9TRUNVUklUWV9QT0xJQ1lcbiAgICB0aGlzLl9wb2xpY3kgPSBwb2xpY3lcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKiBAc2VlIE1ldGhvZEFjY2Vzc0NvbnRyb2xsZXIjcGVybWl0c1xuICAgKi9cbiAgZ3JhbnRzICh7IHJvbGUsIGNsYXp6LCBtZXRob2QsIGRhdGEgfSkge1xuICAgIHJldHVybiB0aGlzLnBlcm1pdHMoeyByb2xlLCBjbGF6eiwgbWV0aG9kLCBkYXRhIH0pXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGdpdmVuIGByb2xlYCBpcyBhbGxvd2VkIHRvIGludm9rZSB0aGUgZ2l2ZW4gYG1ldGhvZGAgb24gdGhlIGdpdmVuIGBjbGFzc2AsIGdpdmVuIG9wdGlvbmFsIGNvbnRleHR1YWwgYGRhdGFgIGFuZCB0aGUgY3VycmVudCBzZWN1cml0eSBwb2xpY3kuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBhcmcgVGhlIGFyZ3VtZW50IGJlaW5nIGRlY29uc3RydWN0ZWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfHN0cmluZ1tdfSBhcmcucm9sZSBUaGUgcm9sZSBvciByb2xlcyBhdHRlbXB0aW5nIHRvIGludm9rZSBgbWV0aG9kYCBvbiBhbiBpbnN0YW5jZSBvZiBgY2xhc3NgLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXJnLmNsYXp6IFRoZSBuYW1lIG9mIHRoZSBjbGFzcyB3aG9zZSBtZXRob2QgaXMgYmVpbmcgaW52b2tlZCBieSBgcm9sZWAuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcmcubWV0aG9kIFRoZSBuYW1lIG9mIHRoZSBtZXRob2Qgb24gYW4gaW5zdGFuY2Ugb2YgYGNsYXNzYCBiZWluZyBpbnZva2VkIGJ5IGByb2xlYC5cbiAgICogQHBhcmFtIHthbnl9IFthcmcuZGF0YV0gT3B0aW9uYWwgY29udGV4dHVhbCBkYXRhIHRoYXQgY2FuIGJlIHVzZWQgYnkgdGhlIHVuZGVybHlpbmcgYWNjZXNzIGNvbnRyb2wgc3RyYXRlZ3kuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBgcm9sZWAgaXMgYWxsb3dlZCB0byBpbnZva2UgYG1ldGhvZGAgb24gYGNsYXNzYC5cbiAgICovXG4gIHBlcm1pdHMgKHsgcm9sZSwgY2xhenosIG1ldGhvZCwgZGF0YSB9KSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocm9sZSkpIHtcbiAgICAgIHJldHVybiAhcm9sZS5tYXAoaXQgPT4gdGhpcy5kZW5pZXMoeyByb2xlOiBpdCwgY2xhenosIG1ldGhvZCwgZGF0YSB9KSkuaW5jbHVkZXModHJ1ZSkgJiZcbiAgICAgICAgcm9sZS5tYXAoaXQgPT4gdGhpcy5wZXJtaXRzKHsgcm9sZTogaXQsIGNsYXp6LCBtZXRob2QsIGRhdGEgfSkpLmluY2x1ZGVzKHRydWUpXG4gICAgfVxuXG4gICAgY29uc3QgZW50cmllcyA9IHRoaXMuX2ZpbmRFbnRyaWVzKHsgcm9sZSwgY2xhenosIG1ldGhvZCB9KVxuXG4gICAgcmV0dXJuICF0aGlzLl9kZW5pZXMoeyBlbnRyaWVzLCByb2xlLCBjbGF6eiwgbWV0aG9kLCBkYXRhIH0pICYmXG4gICAgICB0aGlzLl9wZXJtaXRzKHsgZW50cmllcywgcm9sZSwgY2xhenosIG1ldGhvZCwgZGF0YSB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBnaXZlbiBgcm9sZWAgaXMgZXhwbGljaXRseSBwcmV2ZW50ZWQgZnJvbSBpbnZva2luZyB0aGUgZ2l2ZW4gYG1ldGhvZGAgb24gdGhlIGdpdmVuIGBjbGFzc2AsIGdpdmVuIG9wdGlvbmFsIGNvbnRleHR1YWwgYGRhdGFgIGFuZCB0aGUgY3VycmVudCBzZWN1cml0eSBwb2xpY3kuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBhcmcgVGhlIGFyZ3VtZW50IGJlaW5nIGRlY29uc3RydWN0ZWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfHN0cmluZ1tdfSBhcmcucm9sZSBUaGUgcm9sZSBvciByb2xlcyBhdHRlbXB0aW5nIHRvIGludm9rZSBgbWV0aG9kYCBvbiBhbiBpbnN0YW5jZSBvZiBgY2xhc3NgLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXJnLmNsYXp6IFRoZSBuYW1lIG9mIHRoZSBjbGFzcyB3aG9zZSBtZXRob2QgaXMgYmVpbmcgaW52b2tlZCBieSBgcm9sZWAuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcmcubWV0aG9kIFRoZSBuYW1lIG9mIHRoZSBtZXRob2Qgb24gYW4gaW5zdGFuY2Ugb2YgYGNsYXNzYCBiZWluZyBpbnZva2VkIGJ5IGByb2xlYC5cbiAgICogQHBhcmFtIHthbnl9IFthcmcuZGF0YV0gT3B0aW9uYWwgY29udGV4dHVhbCBkYXRhIHRoYXQgY2FuIGJlIHVzZWQgYnkgdGhlIHVuZGVybHlpbmcgYWNjZXNzIGNvbnRyb2wgc3RyYXRlZ3kuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBgcm9sZWAgaXMgZXhwbGljaXRseSBwcmV2ZW50ZWQgZnJvbSBpbnZva2luZyBgbWV0aG9kYCBvbiBgY2xhc3NgLlxuICAgKi9cbiAgZGVuaWVzICh7IHJvbGUsIGNsYXp6LCBtZXRob2QsIGRhdGEgfSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJvbGUpKSB7XG4gICAgICBjb25zdCByZXN1bHRzID0gcm9sZS5tYXAoaXQgPT4gdGhpcy5kZW5pZXMoeyByb2xlOiBpdCwgY2xhenosIG1ldGhvZCwgZGF0YSB9KSlcbiAgICAgIHJldHVybiByZXN1bHRzLmluY2x1ZGVzKHRydWUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2Rlbmllcyh7XG4gICAgICByb2xlLCBjbGF6eiwgbWV0aG9kLCBkYXRhLCBlbnRyaWVzOiB0aGlzLl9maW5kRW50cmllcyh7IHJvbGUsIGNsYXp6LCBtZXRob2QgfSlcbiAgICB9KVxuICB9XG5cbiAgX3Blcm1pdHMgKHsgZW50cmllcywgcm9sZSwgY2xhenosIG1ldGhvZCwgZGF0YSB9KSB7XG4gICAgcmV0dXJuIHRoaXMuX2ludGVycm9nYXRlKHsgZW50cmllcywgcm9sZSwgY2xhenosIG1ldGhvZCwgZGF0YSwgcGVybWl0OiB0cnVlIH0pXG4gIH1cblxuICBfZGVuaWVzICh7IGVudHJpZXMsIHJvbGUsIGNsYXp6LCBtZXRob2QsIGRhdGEgfSkge1xuICAgIHJldHVybiB0aGlzLl9pbnRlcnJvZ2F0ZSh7IGVudHJpZXMsIHJvbGUsIGNsYXp6LCBtZXRob2QsIGRhdGEsIHBlcm1pdDogZmFsc2UgfSlcbiAgfVxuXG4gIF9pbnRlcnJvZ2F0ZSAoeyBlbnRyaWVzLCByb2xlLCBjbGF6eiwgbWV0aG9kLCBkYXRhLCBwZXJtaXQgfSkge1xuICAgIGZvciAoY29uc3QgaXQgb2YgZW50cmllcykge1xuICAgICAgaWYgKHR5cGVvZiBpdC5zdHJhdGVneSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIGlmIChpdC5zdHJhdGVneSA9PT0gcGVybWl0KSByZXR1cm4gdHJ1ZVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBzdHJhdGVneSA9ICh0eXBlb2YgaXQuc3RyYXRlZ3kgPT09ICdzdHJpbmcnKSA/IHJlcXVpcmUoaXQuc3RyYXRlZ3kpIDogaXQuc3RyYXRlZ3lcblxuICAgICAgaWYgKHR5cGVvZiBzdHJhdGVneSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb25zdCBwZXJtaXR0ZWQgPSBzdHJhdGVneSh7IHJvbGUsIGNsYXp6LCBtZXRob2QsIGRhdGEgfSlcbiAgICAgICAgaWYgKHBlcm1pdCAmJiBwZXJtaXR0ZWQpIHJldHVybiB0cnVlXG4gICAgICAgIGlmICghcGVybWl0ICYmICFwZXJtaXR0ZWQpIHJldHVybiBmYWxzZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgc3RyYXRlZ3lOb3RBRnVuY3Rpb25FcnJvcigpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBfZmluZEVudHJpZXMgKHsgcm9sZSwgY2xhenosIG1ldGhvZCB9KSB7XG4gICAgcmV0dXJuIHRoaXMuX3BvbGljeS5maWx0ZXIoaXQgPT5cbiAgICAgIGl0Py5yb2xlcy50ZXN0KHJvbGUpICYmIGl0Py5jbGFzc2VzLnRlc3QoY2xhenopICYmIGl0Py5tZXRob2RzLnRlc3QobWV0aG9kKVxuICAgIClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1ldGhvZEFjY2Vzc0NvbnRyb2xsZXJcbiJdfQ==