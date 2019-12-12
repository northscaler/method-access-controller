# method-access-controller

This library allows you to secure methods on classes.
Its fundamental capability is to be able to answer security questions like "Can tellers close accounts?", assuming closing an account means to call the `close()` method on an instance of class `Account`.
The observant reader might correctly recognize this as role-based access control, which is true.
The role names (or "types") are manifested as strings, and the securables are methods on classes.

This module exports a class called `MethodAccessController`.
It takes in its constructor a `SecurityPolicy`, which is an array of `SecurityPolicyEntry` objects.
A `SecurityPolicyEntry` is an object that looks like this:
```javascript
const entry = {
  roles: /role names regex here/,
  classes: /class names regex here/,
  methods: /method names regex here/,
  strategy: true // values are true, false, a function, or a string
}
```

* If the `strategy` is the boolean literal `true`, then access is granted.
* If the `strategy` is the boolean literal `false`, then access is expicitly denied.
* If the `strategy` is a `function`, then it must be of the form `({role, clazz, method, data}): boolean` and will be invoked with the current role name, class name & method name in question.
* If the `strategy` is a `string`, then it is `require()`ed, expected to return a `function`, and invoked as above.

A single denial vetoes all grants, and the absence of any grants results in denial.

## Usage

This class can be used standalone, but it's really intended to be used in conjunction with an AOP implementation (shameless plug & tip-o-the-hat to [@northscaler/aspectify](https://www.npmjs.com/package/@northscaler/aspectify)) that can intercept method invocations with `before` advice.
In this manner, access control decisions can be made if user information is available to the advice that delegates to a `MethodAccessController`.

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
