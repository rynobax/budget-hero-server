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
      .then(db.budget.truncateTable)
      .then(() => done())
      .catch(done);
  });
  
  describe('/GET category', () => {
    it('it should GET all the category items', (done) => {const category = {
        name: 'Utilities'
      };
      db.category.addItem(category).then(() => {
        chai.request(app)
          .get('/api/category')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(1);
            done();
          });
      });
    });
  });
  
  describe('/POST budget', () => {
    it('it should POST a category item', (done) => {
      const category = {
        name: 'Rent'
      };
      chai.request(app)
        .post('/api/category')
        .send(category)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('name');
          done();
        });
    });

    it('it should NOT POST a category item with no name', (done) => {
      const category = {
        name: ''
      };
      chai.request(app)
        .post('/api/category')
        .send(category)
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });

    it('it should NOT POST a category item with an identical name', (done) => {
      const category = {
        name: 'Utilities'
      };
      db.category.addItem(category).then(() => {
        chai.request(app)
          .post('/api/category')
          .send(category)
          .end((err, res) => {
            res.should.have.status(500);
            done();
          });
      })
      .catch(console.error);
    });
  });
  
  describe('/PUT/:id category', () => {
    it('it should UPDATE a category item given the id', (done) => {
      const category = {
        name: 'Savings'
      }
      db.category.addItem(category).then((category) => {
        chai.request(app)
          .put('/api/category/' + category._id)
          .send({name: 'Spending'})
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('number');
            res.body.should.eql(1);
            done();
          });
      })
      .catch(done);
    });

    it('it should NOT UPDATE a category to no name', (done) => {
      const category = {
        name: 'Savings'
      }
      db.category.addItem(category).then((category) => {
        chai.request(app)
          .put('/api/category/' + category._id)
          .send({name: ''})
          .end((err, res) => {
            res.should.have.status(500);
            done();
          });
      })
      .catch(done);
    });

    it('it should NOT UPDATE a category with the reserved name ' + db.category.NO_CATEGORY_NAME, (done) => {
      const category = {
        name: 'Savings'
      }
      db.category.addItem(category).then((category) => {
        chai.request(app)
          .put('/api/category/' + category._id)
          .send({name: db.category.NO_CATEGORY_NAME})
          .end((err, res) => {
            res.should.have.status(500);
            done();
          });
      })
      .catch(done);
    });
  });
  
  describe('/DELETE/:id category', () => {
    it('it should DELETE a category given the id', (done) => {
      const category = {
        name: 'Savings'
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

    it('it should NOT DELETE a category with items in it', (done) => {
      const category = {
        name: 'Savings'
      };
      db.category.addItem(category).then((category) => {
        const savingsId = category._id;
        const budget1 = {
          name: 'Savings',
          type: 'PERCENT',
          amount: 10,
          category: savingsId
        };
        const budget2 = {
          name: 'Spending',
          type: 'PERCENT',
          amount: 20,
          category: 'SpendingID'
        };
        Promise.all([db.budget.addItem(budget1), db.budget.addItem(budget2)])
          .then(() => {
            chai.request(app)
              .delete('/api/category/' + savingsId)
              .end((err, res) => {
                res.should.have.status(500);
                done();
              });
        });
      })
      .catch(done);
    });
  });
});
