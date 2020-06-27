# method-access-controller

This library allows you to secure methods on classes.
Its fundamental capability is to be able to answer security questions like "Can tellers close accounts?", assuming closing an account means to call the `close()` method on an instance of class `Account`.
This is known as role-based access control (RBAC), more specifically, _role type-based_ access control, where static types of roles are used to determine access, as opposed to role _instances_.

## Concepts
The following describes the relationship between the fundamental concepts in security (principal, securable, action, and access control entry) and their relationship to the concepts implemented in this library.

There are four elements required in the determination of access:
* __principal__:  The actor, user or system attempting to perform some action on a securable.
* __securable__:  The thing being secured.
* __action__:  The action being performed with respect to a securable.
* __access control entry__:  the binding of the principal, securable and action together along with the "permitted" (or "denied") boolean, or some other access control strategy.

An optional fifth element is contextual data at the point of access control.

Here are the mappings to those fundamental concepts in this library.
* __principal__: a role name as a atring.
This is also known as a scope in some security descriptions.
* __securable__: a method on a class.
* __action__: the particular method being invoked at the time of access determination.
* __access control entry__: the security policy given to the constructor of the `MethodAccessController`.

## `MethodAccessController`
This module exports a class called `MethodAccessController`.
It takes in its constructor a `SecurityPolicy`, which is an array of `SecurityPolicyEntry` objects.
A `SecurityPolicyEntry` is an object that looks like this:
```javascript
const entry = {
  roles: /role names regex/,
  classes: /class names regex/,
  methods: /method names regex/,
  strategy: true // values are true, false, a function, or a string
}
```

* If the `strategy` is the boolean literal `true`, then access is permitted.
* If the `strategy` is the boolean literal `false`, then access is expicitly denied.
* If the `strategy` is a `function`, then it must be of the form `({role, clazz, method, data}): boolean` and will be invoked with the current role name, class name, method name and the contextual data, respectively.
* If the `strategy` is a `string`, then it is `require()`ed, expected to return a `function` in form above, and invoked.

A single denial vetoes all permissions, and the absence of any permissions results in denial.

## Usage

This class can be used standalone, but it's really intended to be used in conjunction with a decorator or an AOP implementation (shameless plug & tip-o-the-hat to [@northscaler/aspectify](https://www.npmjs.com/package/@northscaler/aspectify)) that can intercept method invocations with `before` advice.
In this manner, access control decisions can be made if user information is available to the decorator or to the advice that delegates to a `MethodAccessController`.
You might consider using [@northscaler/continuation-local-storage](https://www.npmjs.com/package/@northscaler/continuation-local-storage) to put said user information into such a place.

It's not really recommended, but in the absence of AOP, you'd use it in the following ways.

### Static Security Policies

```javascript
const context = require('...') // some means to get user from JWT or whatever

class Account {
  constructor(id, balance, /* ... */) {
    this.id = id
    this.balance = balance
    // ...
    this.controller = new MethodAccessController(require('./account-rbac-policy.json'))
  }
  
  // ...

  close() {
    // begin security check
    const roles = context.user?.roles

    if (roles && !roles.map(role => this.controller.grants({
      role,
      clazz: 'Account',
      method: 'close',
      data: this
    })).includes(true)) {
      const e = new Error('E_ACCESS_DENIED')
      e.context = { user: context.user, roles: context.user?.roles, clazz: 'Account', method: 'close'}
      throw e
    }
    // end security check

    this.open = false // or whatever
  }
}
```

### Dynamic (or Algorithmic) Security Policies

You can use custom logic in your access control strategies.
Here's one that only lets `MANAGER`s close big `Account`s.

```javascript
const strategy = it => it.role === 'MANAGER' || it.data?.balance < 10000
// the above strategy assumes data is the Account instance

class Account {
  constructor(id, balance, /* ... */) {
    this.id = id
    this.balance = balance
    // ...
    this.controller = new MethodAccessController([{
      classes: /^Account$/,
      methods: /^close$/,
      roles: /^.+$/,
      strategy
    }])
  }
  
  // ...

  close() {
    // begin security check
    const roles = context.user?.roles

    if (roles && !roles.map(role => this.controller.grants({
      role,
      clazz: 'Account',
      method: 'close',
      data: this // this allows the strategy to check the account's balance
    })).includes(true)) {
      const e = new Error('E_ACCESS_DENIED')
      e.context = { user: context.user, roles: context.user?.roles, clazz: 'Account', method: 'close'}
      throw e
    }
    // end security check

    this.open = false // or whatever
  }
}
```
