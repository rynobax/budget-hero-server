let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let app = require('../server').app;

process.env.NODE_ENV = 'test';

describe('Budget', () => {
    beforeEach((done) => {
        // Empty DB
    });
  describe('/GET budget', () => {
      it('it should GET all the budget items', (done) => {
            chai.request(server)
            .get('/book')
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
        let budget = {
            name: "Rent",
            type: VALUE,
            amount: 500,
            period: MONTHLY
        }
            chai.request(server)
            .post('/book')
            .send(book)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Book successfully added!');
                res.body.book.should.have.property('title');
                res.body.book.should.have.property('author');
                res.body.book.should.have.property('pages');
                res.body.book.should.have.property('year');
              done();
            });
      });
      it('it should POST a percentage budget item', (done) => {
        let budget = {
            name: "Savings",
            type: VALUE,
            amount: 10,
        }
            chai.request(server)
            .post('/book')
            .send(book)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Book successfully added!');
                res.body.book.should.have.property('title');
                res.body.book.should.have.property('author');
                res.body.book.should.have.property('pages');
                res.body.book.should.have.property('year');
              done();
            });
      });
      // TODO: Category testing
  });
  describe('/PUT/:id book', () => {
      it('it should UPDATE a budget item given the id', (done) => {
        let budget = {
            name: "Savings",
            type: VALUE,
            amount: 10,
        }
        book.save((err, book) => {
                chai.request(server)
                .put('/book/' + book.id)
                .send({title: "The Chronicles of Narnia", author: "C.S. Lewis", year: 1950, pages: 778})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Book updated!');
                    res.body.book.should.have.property('year').eql(1950);
                  done();
                });
          });
      });
  });
 /*
  * Test the /DELETE/:id route
  */
  describe('/DELETE/:id book', () => {
      it('it should DELETE a book given the id', (done) => {
        let budget = {
            name: "Savings",
            type: VALUE,
            amount: 10,
        }
        book.save((err, book) => {
                chai.request(server)
                .delete('/book/' + book.id)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Book successfully deleted!');
                    res.body.result.should.have.property('ok').eql(1);
                    res.body.result.should.have.property('n').eql(1);
                  done();
                });
          });
      });
  });
});
