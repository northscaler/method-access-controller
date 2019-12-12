/* global describe, it */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const uuid = require('uuid/v4')

const MethodAccessController = require('../../main/MethodAccessController')

describe('unit tests of StaticRbacRepository', () => {
  it('should grant Admin', () => {
    const controller = new MethodAccessController()
    const rcm = { role: ['Admin'], clazz: 'Foo', method: 'bar' }

    expect(controller.denies(rcm)).to.be.false()
    expect(controller.grants(rcm)).to.be.true()
  })

  it('should deny unknown role', () => {
    const policy = [{
      roles: /^Manager$/,
      classes: /^.*$/,
      methods: /^.*$/,
      strategy: true
    }]
    const controller = new MethodAccessController(policy)
    const rcm = { role: [uuid()], clazz: 'Foo', method: 'bar' }

    expect(controller.denies(rcm)).to.be.false()
    expect(controller.grants(rcm)).to.be.false()
  })

  it('should deny', () => {
    const clazz = 'Foo'
    const method = 'bar'
    const role = 'Cowboy'
    const controller = new MethodAccessController([{
      classes: new RegExp(`^${clazz}$`),
      methods: new RegExp(`^${method}$`),
      roles: new RegExp(`^${role}$`),
      strategy: false
    }])

    const rcm = { role: [role], clazz, method }

    expect(controller.denies(rcm)).to.be.true()
    expect(controller.grants(rcm)).to.be.false()
  })

  it('should deny with a single denial', () => {
    const clazz = 'Foo'
    const method = 'bar'
    const role = 'Cowboy'
    const controller = new MethodAccessController([{
      classes: new RegExp(`^${clazz}$`),
      methods: new RegExp(`^${method}$`),
      roles: new RegExp(`^${role}$`),
      strategy: true
    }, {
      classes: new RegExp(`^${clazz}$`),
      methods: new RegExp(`^${method}$`),
      roles: new RegExp(`^${role}$`),
      strategy: true
    }, {
      classes: new RegExp(`^${clazz}$`),
      methods: new RegExp(`^${method}$`),
      roles: new RegExp(`^${role}$`),
      strategy: false
    }])

    const rcm = { role: [role], clazz, method }

    expect(controller.denies(rcm)).to.be.true()
    expect(controller.grants(rcm)).to.be.false()
  })

  it('should work with custom strategy', () => {
    const clazz = 'Account'
    const method = 'close'
    const manager = 'Manager'
    const owner = 'Owner'
    const strategy = it => it?.role === manager || it?.role === owner

    const controller = new MethodAccessController([{
      classes: new RegExp(`^${clazz}$`),
      methods: new RegExp(`^${method}$`),
      roles: new RegExp('^.*$'),
      strategy
    }])

    const rcm = { role: [manager, owner], clazz, method }

    expect(controller.denies(rcm)).to.be.false()
    expect(controller.grants(rcm)).to.be.true()

    expect(controller.denies({ role: 'TELLER', clazz, method })).to.be.false()
    expect(controller.grants({ role: 'TELLER', clazz, method })).to.be.false()
  })

  it('should work with crazy custom strategy', () => {
    const clazz = 'Account'
    const method = 'close'
    const manager = 'MANAGER'
    // Managers can only close accounts on even calendar days
    const strategy = it => it?.role === manager && it?.data?.dayOfMonth % 2 === 0

    const controller = new MethodAccessController([{
      classes: new RegExp(`^${clazz}$`),
      methods: new RegExp(`^${method}$`),
      roles: new RegExp('^.*$'),
      strategy
    }])

    let dayOfMonth = 1
    expect(controller.denies({ role: manager, clazz, method, data: { dayOfMonth } })).to.be.false()
    expect(controller.grants({ role: manager, clazz, method, data: { dayOfMonth } })).to.be.false()

    expect(controller.denies({ role: 'TELLER', clazz, method, data: { dayOfMonth } })).to.be.false()
    expect(controller.grants({ role: 'TELLER', clazz, method, data: { dayOfMonth } })).to.be.false()

    dayOfMonth = 2
    expect(controller.denies({ role: manager, clazz, method, data: { dayOfMonth } })).to.be.false()
    expect(controller.grants({ role: manager, clazz, method, data: { dayOfMonth } })).to.be.true()

    expect(controller.denies({ role: 'TELLER', clazz, method, data: { dayOfMonth } })).to.be.false()
    expect(controller.grants({ role: 'TELLER', clazz, method, data: { dayOfMonth } })).to.be.false()
  })

  it('should grant when one role of many is granted', () => {
    const policy = [
      {
        roles: /^Manager$/,
        classes: /^.*$/,
        methods: /^.*$/,
        strategy: true
      },
      {
        roles: /^Teller$/,
        classes: /^Foo$/,
        methods: /^snafu$/,
        strategy: true
      }
    ]
    const controller = new MethodAccessController(policy)
    const rcm = { role: ['Teller', 'Manager'], clazz: 'Foo', method: 'bar' }

    expect(controller.denies(rcm)).to.be.false()
    expect(controller.grants(rcm)).to.be.true()
  })

  it('should deny when a role among many is denied', () => {
    const policy = [
      {
        roles: /^Dummy$/,
        classes: /^.*$/,
        methods: /^.*$/,
        strategy: false
      },
      {
        roles: /^Teller$/,
        classes: /^Foo$/,
        methods: /^bar$/,
        strategy: true
      }
    ]
    const controller = new MethodAccessController(policy)
    const rcm = { role: ['Teller', 'Dummy'], clazz: 'Foo', method: 'bar' }

    expect(controller.denies(rcm)).to.be.true()
    expect(controller.grants(rcm)).to.be.false()
  })

  it('should work with a custom strategy', function () {
    const strategy = it => it.role === 'MANAGER' || it.data?.balance < 10000
    // the above strategy assumes data is the Account instance
    const context = {}

    class Account {
      constructor (id, balance /* ... */) {
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

      close () {
        // begin security check
        const roles = context.user?.roles

        if (roles && !roles.map(role => this.controller.grants({
          role,
          clazz: 'Account',
          method: 'close',
          data: this // this allows the strategy to check the account's balance
        })).includes(true)) {
          const e = new Error('E_ACCESS_DENIED')
          e.context = { user: context.user, roles: context.user?.roles, clazz: 'Account', method: 'close' }
          throw e
        }
        // end security check

        this.open = false // or whatever
      }
    }

    context.user = { roles: ['TELLER'] }
    const hi = new Account(uuid(), 20000)
    const lo = new Account(uuid(), 1)

    expect(() => hi.close()).to.throw()
    lo.close()

    context.user.roles = ['MANAGER']
    hi.close()
    lo.close()

    context.user.roles = ['TELLER', 'MANAGER']
    hi.close()
    lo.close()
  })
})
