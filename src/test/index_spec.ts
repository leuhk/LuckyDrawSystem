import 'mocha'
import chai from 'chai'
import chaiHttp from 'chai-http'

import app from '../index'
chai.use(chaiHttp)
import { expect } from 'chai'

describe('App', () => {
  describe('POST JPEG', () => {
    it('should return a jpeg file', (done) => {
      chai
        .request(app)
        .post('/to_jpeg')
        .attach('image', __dirname + '/test.png')
        .end((err, res) => {
          expect(res.status).to.equal(200)
          expect(res.header['content-type']).to.have.string('image/jpeg')
          done()
        })
    })
    it('should return a error when empty params', (done) => {
      chai
        .request(app)
        .post('/to_jpeg')
        .end((err, res) => {
          expect(res.status).to.equal(400)
          expect(res.body).to.have.an('object')
          expect(res.body).to.have.property('error')
          expect(res.body.error).to.equal('input file must be a png image')
          done()
        })
    })
  })
})
