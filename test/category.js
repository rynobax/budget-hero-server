const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const app = require('../server').app;
const db = require('../db');

process.env.NODE_ENV = 'test';

describe('Budget', () => {
  beforeEach((done) => {
    db.budget.truncateTable();
  });
  describe('/GET budget', () => {
    it('it should GET all the budget items', (done) => {
      chai.request(app)
        .get('/api/budget')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
      });
    });
  describe('/POST budget', () => {
    it('it should POST a value budget item', (done) => {
      const budget = {
        name: 'Rent',
        type: 'VALUE',
        amount: 500,
        period: 'MONTHLY'
      };
      chai.request(app)
        .post('/api/budget')
        .send(budget)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('name');
          res.body.should.have.property('type');
          res.body.should.have.property('amount');
          res.body.should.have.property('period');
        done();
      });
    });
  it('it should POST a percentage budget item', (done) => {
    const budget = {
      name: 'Savings',
      type: 'PERCENT',
      amount: 10,
    };
    chai.request(app)
      .post('/api/budget')
      .send(budget)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('name');
        res.body.should.have.property('type');
        res.body.should.have.property('amount');
        done();
      });
    });
    // TODO: Category testing
  });
  describe('/PUT/:id budget', () => {
      it('it should UPDATE a budget item given the id', (done) => {
        const budget = {
          name: 'Savings',
          type: 'VALUE',
          amount: 10,
          period: 'WEEKLY' 
        }
        db.budget.addItem(budget).then((err, budget) => {
          chai.request(app)
            .put('/api/budget/' + budget._id)
            .send({name: 'Spending', type: 'PERCENT', amount: 10})
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.book.should.have.property('name').eql('Spending');
              res.body.book.should.have.property('type').eql('PERCENT');
              res.body.book.should.have.property('amount').eql(10);
              done();
            });
        })
        .catch(done);
      });
  });
 /*
  * Test the /DELETE/:id route
  */
  describe('/DELETE/:id book', () => {
    it('it should DELETE a book given the id', (done) => {
      const budget = {
        name: "Savings",
        type: VALUE,
        amount: 10,
      }
      db.budget.addItem(budget).then((err, budget) => {
        chai.request(app)
          .delete('/api/budget/' + budget._id)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('number');
            res.body.should.eql(1);
            done();
          });
        });
      });
  });
});
