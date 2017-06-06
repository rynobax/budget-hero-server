const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();
const app = require('../src/app').app;
const budgetDB = require('../src/db').budget;
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
    })
  });
  beforeEach((done) => {
    budgetDB.truncateTable()
      .then(() => {
        done();
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
      agent.post('/api/budget')
        .send(budget)
        .end((err, res) => {
          should.not.exist(err);
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
      agent.post('/api/budget')
        .send(budget)
        .end((err, res) => {
          should.not.exist(err);
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
      agent.post('/api/budget')
        .send(budget)
        .end((err, res) => {
          agent.post('/api/budget')
            .send(repeatBudget)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.have.property('added');
              res.body.should.have.property('error');
              res.body.added.should.eql(false);
              res.body.error.should.be.a('string');
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
      agent.post('/api/budget')
        .send(budget)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('added');
          res.body.should.have.property('error');
          res.body.added.should.eql(false);
          res.body.error.should.be.a('string');
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
      agent.post('/api/budget')
        .send(budget)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('added');
          res.body.should.have.property('error');
          res.body.added.should.eql(false);
          res.body.error.should.be.a('string');
          done();
        });
    });
  });
  
  describe('/GET budget', () => {
    it('it should GET all the budget items', (done) => {
      const budget = {
        name: 'Savings',
        category: 'Personal',
        amount: 10,
        period: 'WEEKLY',
      };
      const budget2 = {
        name: 'Spending',
        category: 'Personal',
        amount: 10,
        period: 'WEEKLY'
      };
      agent.post('/api/budget')
        .send(budget)
        .end((err, res) => {
          should.not.exist(err);
          agent.post('/api/budget')
            .send(budget2)
            .end((err, res) => {
              should.not.exist(err);
              agent.get('/api/budget')
                .end((err, res) => {
                  should.not.exist(err);
                  res.should.have.status(200);
                  res.body.should.be.a('array');
                  const category = res.body[0];
                  category.should.be.a('object');
                  category.name.should.eql('PERSONAL');
                  category.items.should.be.a('array');
                  category.items.length.should.eql(2);
                  const item = category.items[0];
                  item.should.have.property('name');
                  item.should.have.property('amount');
                  done();
                });
            });
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
      agent.post('/api/budget')
        .send(budget)
        .end((err, res) => {
          agent
            .put('/api/budget/' + budgetDB._id)
            .send({name: 'Spending', category: 'Personal', amount: 10, period: 'PERCENT'})
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('updated');
              res.body.updated.should.eql(true);
              done();
            });
        });
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
      agent.post('/api/budget')
        .send(repeatBudget)
        .end((err, res) => {
          should.not.exist(err);
          agent.post('/api/budget')
            .send(repeatBudget)
            .end((err, res) => {
              agent.put('/api/budget/' + budgetDB._id)
                .send({name: 'Spending', category: 'Personal', amount: 10, period: 'WEEKLY'})
                .end((err, res) => {
                  should.not.exist(err);
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('updated');
                  res.body.should.have.property('error');
                  res.body.updated.should.eql(false);
                  res.body.error.should.be.a('string');
                  done();
                });
            });
        });
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
      agent.post('/api/budget')
        .send(budget)
        .end((err, res) => {
          should.not.exist(err);
          agent.put('/api/budget/' + budgetDB._id)
            .send(replacementBudget)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('updated');
              res.body.updated.should.eql(false);
              res.body.error.should.be.a('string');
              done();
            });
        });
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
      agent.post('/api/budget')
        .send(budget)
        .end((err, res) => {
          should.not.exist(err);
          agent
            .delete('/api/budget/' + budgetDB._id)
            .end((err, res) => {
            should.not.exist(err);
              res.should.have.status(200);
              res.body.should.have.property('deleted');
              res.body.deleted.should.eql(true);
              done();
            });
        });
    });
  });
});
