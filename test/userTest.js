const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();
const app = require('../src/app').app;
const userDB = require('../src/db').user;
const tokenDB = require('../src/db').token;

process.env.NODE_ENV = 'test';

describe('User', () => {
  beforeEach(function(done){
    userDB.truncateTable()
      .then(() => done())
      .catch((err) => {console.log(err); done();});
  });

  it('it should let you create an account', (done) => {
    const user = {
      username: 'Username',
      password: 'supersecretpassword'
    };
    chai.request(app)
      .post('/api/user/register')
      .send(user)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('registered');
        res.body.registered.should.eql(true);
        done();
    });
  });

  it('it should not let you create two accounts with the same name', (done) => {
    const user = {
      username: 'Username',
      password: 'supersecretpassword'
    };
    chai.request(app)
      .post('/api/user/register')
      .send(user)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('registered');
        res.body.registered.should.eql(true);
        chai.request(app)
          .post('/api/user/register')
          .send(user)
          .end((err, res) => {
            should.not.exist(err);
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
      username: 'Username',
      password: 'supersecretpassword'
    };
    chai.request(app)
      .post('/api/user/register')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('registered');
        res.body.registered.should.eql(true);
        chai.request(app)
          .post('/api/user/login')
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

  it('it should let you logout', (done) => {
    const user = {
      username: 'Username',
      password: 'supersecretpassword'
    };
    const agent = chai.request.agent(app);
    agent.post('/api/user/register')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('registered');
        res.body.registered.should.eql(true);
        agent.post('/api/user/login')
          .send(user)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('loggedIn');
            res.body.loggedIn.should.eql(true);
            agent.post('/api/user/logout')
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('loggedOut');
                res.body.loggedOut.should.eql(true);
                done();
              });
        });
    });
  });
  
  it('it should identify you', (done) => {
    const user = {
      username: 'UseRnaMe',
      password: 'supersecretpassword'
    };
    const agent = chai.request.agent(app);
    agent.post('/api/user/register')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('registered');
        res.body.registered.should.eql(true);
        agent.post('/api/user/login')
          .send(user)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('loggedIn');
            res.body.loggedIn.should.eql(true);
            agent.post('/api/user/identity')
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('identified');
                res.body.identified.should.eql(true);
                res.body.identity.username.should.eql(user.username);
                done();
              });
        });
    });
  });
});
