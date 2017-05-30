const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();
const app = require('../server').app;
const authDB = require('../db').auth;

process.env.NODE_ENV = 'test';

describe('Auth', () => {
  beforeEach((done) => {
    authDB.truncateTable()
      .then(() => done())
      .catch(done);
  });

  it('it should let you create an account', (done) => {
    const user = {
      username: 'User',
      password: 'supersecretpassword'
    };
    chai.request(app)
      .post('/api/auth/register')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('registered');
        res.body.registered.should.eql(true);
        done();
    });
  });

  it('it should not let you create two accounts with the same name', (done) => {
    const user = {
      username: 'User',
      password: 'supersecretpassword'
    };
    chai.request(app)
      .post('/api/auth/register')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('registered');
        res.body.registered.should.eql(true);
        chai.request(app)
          .post('/api/auth/register')
          .send(user)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('registered');
            res.body.registered.should.eql(false);
            done();
        });
    });
  });

  it('it should let you login', (done) => {
    const user = {
      username: 'User',
      password: 'supersecretpassword'
    };
    chai.request(app)
      .post('/api/auth/register')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('registered');
        res.body.registered.should.eql(true);
        chai.request(app)
          .post('/api/auth/login')
          .send(user)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('loggedIn');
            res.body.loggedIn.should.eql(true);
            done();
        });
    });
  });
});