const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();
const app = require('../src/app').app;
const incomeDB = require('../src/db').income;
const userDB = require('../src/db').user;

process.env.NODE_ENV = 'test';

describe('Budget', () => {
  const agent = chai.request.agent(app);
  before(function(done){
    const user = {username: 'Username', password: 'Password'};
    userDB.truncateTable().then(() => {
      agent.post('/api/user/register')
        .send(user)
        .end((err, res) => {
          should.not.exist(err);
          agent
            .post('/api/user/login')
            .send(user)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.cookie('session-token');
              done();
            });
        });
    }).catch(console.error);
  });
  
  describe('/GET income', () => {
    it('it should GET an income', (done) => {
      agent.get('/api/income')
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('income');
          res.body.income.should.have.property('period');
          res.body.income.should.have.property('amount');
          done();
      });
    });
  });
  
  describe('/PUT income', () => {
    it('it should PUT an income', (done) => {
      const data = {
        income:{
          amount: 50000,
          period: 'YEARLY'
        }
      };
      agent.put('/api/income')
        .send(data)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('updated');
          res.body.updated.should.eql(true);
          done();
      });
    });
  });
});
