const validator = require('common/helpers/validator');
const Promise = require('bluebird');
const _ = require('lodash');
const exceptions = require('common/exceptions');

class UserController {
  constructor(model) {
    this.model = model;
    this.jsonSchema = model.getJsonSchema();
    this.registerUser  = this.registerUser.bind(this);
    this.validateLogin  = this.validateLogin.bind(this);
    this.getUser  = this.getUser.bind(this);
    this.populateParamsUserId  = this.populateParamsUserId.bind(this);
    this.populateTokenUser  = this.populateTokenUser.bind(this);
  }

  registerUser(req, res, next) {
    const input = _.cloneDeep(req.body);
    validator.buildParams({ input, schema: this.jsonSchema.postSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.postSchema }))
      .then(input => this.model.createUser(input))
      .then(result => res.send(result))
      .catch(error => next(error));
  }

  validateLogin(req, res, next) {
    const input = _.cloneDeep(req.body);
    validator.buildParams({ input, schema: this.jsonSchema.loginSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.loginSchema }))
      .then(input => this.model.verifyLogin(input.email, input.password))
      .then(result => (req.user = result))
      .then(() => next())
      .catch(error => next(error));
  }

  getUser(req, res, next) {
    this.model.getUser(req.params.userId).then(result => res.send(result));
  }

  populateParamsUserId (req, res, next) {
    this.model.getUser(req.params.userId).then((userData) => {
      req.userId = userData;
      next();
    })
  }

  populateTokenUser(req, res, next) {
    this.model.getUser(req.authToken.userId).then((userData) => {
      if(!userData) next(new exceptions.UnAuthorized());
      else {
        req.user = userData;
        next()
      }
    });
  }
}

module.exports = UserController;