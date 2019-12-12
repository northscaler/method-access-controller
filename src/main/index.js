'use strict'

const MethodAccessController = require('./MethodAccessController')
MethodAccessController.defaultSecurityPolicy = require('./default-security-policy')

module.exports = MethodAccessController
