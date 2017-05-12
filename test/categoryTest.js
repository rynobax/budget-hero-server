const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();
const app = require('../server').app;
const db = require('../db');

process.env.NODE_ENV = 'test';

describe('Category', (done) => {
  beforeEach((done) => {
    db.category.truncateTable()
    .then(() => done())
    .catch(done);
  });
  
  describe('/GET category', () => {
    it('it should GET all the category items', (done) => {
      chai.request(app)
        .get('/api/category')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });
  
  describe('/POST budget', () => {
    it('it should POST a category item', (done) => {
      const category = {
        name: 'Rent',
        type: 'VALUE',
        amount: 500,
        period: 'MONTHLY'
      };
      chai.request(app)
        .post('/api/category')
        .send(category)
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
    // TODO: No repeat names
  });
  
  describe('/PUT/:id category', () => {
    it('it should UPDATE a category item given the id', (done) => {
      const category = {
        name: 'Savings',
        type: 'VALUE',
        amount: 10,
        period: 'WEEKLY' 
      }
      db.category.addItem(category).then((category) => {
        chai.request(app)
          .put('/api/category/' + category._id)
          .send({name: 'Spending', type: 'PERCENT', amount: 10})
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('number');
            res.body.should.eql(1);
            done();
          });
      })
      .catch(done);
    });
  });
  
  describe('/DELETE/:id category', () => {
    it('it should DELETE a categoy given the id', (done) => {
      const category = {
        name: "Savings",
        type: 'VALUE',
        amount: 10,
      };
      db.category.addItem(category).then((category) => {
        chai.request(app)
          .delete('/api/category/' + category._id)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('number');
            res.body.should.eql(1);
            done();
          });
      })
      .catch(done);
    });
  });
});
