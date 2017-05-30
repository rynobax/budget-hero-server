const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();
const app = require('../server').app;
const budgetDB = require('../db').budget;

process.env.NODE_ENV = 'test';

describe('Budget', () => {
  beforeEach((done) => {
    budgetDB.truncateTable()
      .then(() => done())
      .catch(done);
  });
  
  describe('/GET budget', () => {
    it('it should GET all the budget items', (done) => {
      const budget = {
        name: 'Savings',
        category: 'Personal',
        amount: 10,
        period: 'WEEKLY' 
      };
      const budget2 = {
        name: 'Spending',
        category: 'Personal',
        amount: 10,
        period: 'WEEKLY' 
      };
      budgetDB.addItem(budget).then(budgetDB.addItem(budget2)).then(() => {
        chai.request(app)
          .get('/api/budget')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            const category = res.body[0];
            category.should.be.a('object');
            category.name.should.eql('Personal');
            category.items.should.be.a('array');
            category.items.length.should.eql(2);
            const item = category.items[0];
            item.should.have.property('name');
            item.should.have.property('amount');
            done();
          });
      })
      .catch(done);
    });
  });
  
  describe('/POST budget', () => {
    it('it should POST a value budget item', (done) => {
      const budget = {
        name: 'Rent',
        category: 'Bill',
        amount: 500,
        period: 'MONTHLY'
      };
      chai.request(app)
        .post('/api/budget')
        .send(budget)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('added');
          res.body.should.have.property('item');
          res.body.added.should.eql(true);
        done();
      });
    });
    
    it('it should POST a percentage budget item', (done) => {
      const budget = {
        name: 'Savings',
        category: 'Personal',
        period: 'PERCENT',
        amount: 10,
      };
      chai.request(app)
        .post('/api/budget')
        .send(budget)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('added');
          res.body.should.have.property('item');
          res.body.added.should.eql(true);
          done();
        });
    });
    
    it('it should NOT POST an item with an identical name', (done) => {
      const budget = {
        name: 'Savings',
        category: 'Personal',
        period: 'PERCENT',
        amount: 10,
      };
      const repeatBudget = {
        name: 'Savings',
        category: 'Personal',
        amount: 10,
      };
      budgetDB.addItem(budget).then(() => {
        chai.request(app)
          .post('/api/budget')
          .send(repeatBudget)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property('added');
            res.body.should.have.property('error');
            res.body.added.should.eql(false);
            done();
          });
      });
    });
    
    it('it should NOT POST a budget item with name missing', (done) => {
      const budget = {
        category: 'Personal',
        amount: 10,
        period: 'WEEKLY'
      };
      chai.request(app)
        .post('/api/budget')
        .send(budget)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('added');
          res.body.should.have.property('error');
          res.body.added.should.eql(false);
          done();
        });
    });
    
    it('it should NOT POST a budget item with an empty name', (done) => {
      const budget = {
        name: '',
        category: 'Personal',
        period: 'PERCENT',
        amount: 10,
      };
      chai.request(app)
        .post('/api/budget')
        .send(budget)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('added');
          res.body.should.have.property('error');
          res.body.added.should.eql(false);
          done();
        });
    });
  });
  
  describe('/PUT/:id budget', () => {
    it('it should UPDATE a budget item given the id', (done) => {
      const budget = {
        name: 'Savings',
        category: 'Personal',
        amount: 10,
        period: 'WEEKLY' 
      };
      budgetDB.addItem(budget).then((budget) => {
        chai.request(app)
          .put('/api/budget/' + budgetDB._id)
          .send({name: 'Spending', category: 'Personal', amount: 10, period: 'PERCENT'})
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('updated');
            res.body.updated.should.eql(true);
            done();
          });
      })
      .catch(done);
    });

    it('it should NOT UPDATE a budget item to an identical name', (done) => {
      const budget = {
        name: 'Savings',
        category: 'Personal',
        amount: 10,
        period: 'WEEKLY' 
      };
      const repeatBudget = {
        name: 'Spending',
        category: 'Personal',
        amount: 10,
        period: 'WEEKLY' 
      };
      budgetDB.addItem(repeatBudget).then(() => {
        budgetDB.addItem(budget).then((budget) => {
          chai.request(app)
            .put('/api/budget/' + budgetDB._id)
            .send({name: 'Spending', category: 'Personal', amount: 10, period: 'WEEKLY'})
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('updated');
              res.body.should.have.property('error');
              res.body.updated.should.eql(false);
              done();
            });
        });
      }).catch(done);
    });

    it('it should NOT UPDATE a budget item with an empty name', (done) => {
      const budget = {
        name: 'Spending',
        category: 'Personal',
        amount: 10,
        period: 'WEEKLY' 
      };
      const replacementBudget = {
        name: '', 
        category: 'Personal', 
        amount: 10, 
        period: 'PERCENT'
      };
      budgetDB.addItem(budget).then((budget) => {
        chai.request(app)
          .put('/api/budget/' + budgetDB._id)
          .send(replacementBudget)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('updated');
            res.body.updated.should.eql(false);
            done();
          });
      })
      .catch(done);
    });
  });

  describe('/DELETE/:id book', () => {
    it('it should DELETE a book given the id', (done) => {
      const budget = {
        name: "Savings",
        category: 'Personal',
        period: 'MONTHLY',
        amount: 10,
      };
      budgetDB.addItem(budget).then((budget) => {
        chai.request(app)
          .delete('/api/budget/' + budgetDB._id)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property('deleted');
            res.body.deleted.should.eql(true);
            done();
          });
        })
        .catch(done);
      });
  });
});
