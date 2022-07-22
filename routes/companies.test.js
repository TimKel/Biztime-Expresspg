process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app');
const { createData } = require('../_test_common')
const db = require('../db');

beforeEach(createData);

afterAll(async () => {
    await db.end()
})

describe("GET /", function(){
    test("Get list of companies", async function(){
        const response = await request(app).get("/companies/");
        // expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "companies": [
                {code: "apple", description: "Maker of OSX.", name: "Apple"},
                {code: "ibm", description: "Big blue.", name: "IBM"}
            ]
        })
    })

    test("It should return 404 for absent comps", async function () {
        const response = await request(app).get("/companies/blargh");
        expect(response.status).toEqual(404);
      })
})

describe(" GET /apple", function(){
    test("Get specifics of one company", async function(){
        const response = await request(app).get("/companies/apple");
        expect(response.body).toEqual({
            "company": {
                code: "apple", description: "Maker of OSX.", name: "Apple",
            "invoices": [
                1,
                2
            ]}
            }
        )
    })

    test("It should return 500 for conflict", async function () {
        const response = await request(app)
            .post("/companies")
            .send({name: "Apple", description: "Huh?"});
    
        expect(response.status).toEqual(500);
      })
})

describe("PATCH /", function () {

    test("It should update company", async function () {
      const response = await request(app)
          .patch("/companies/apple")
          .send({name: "AppleEdit", description: "NewDescrip"});
  
      expect(response.body).toEqual(
          {
            "company": {
              code: "apple",
              name: "AppleEdit",
              description: "NewDescrip",
            }
          }
      );
    });
  
    test("It should return 404 for no-such-comp", async function () {
      const response = await request(app)
          .put("/companies/blargh")
          .send({name: "Blargh"});
  
      expect(response.status).toEqual(404);
    });
  });
  
  
describe("DELETE /", function () {
  
    test("It should delete company", async function () {
      const response = await request(app)
          .delete("/companies/apple");
  
      expect(response.body).toEqual({msg: "Deleted"});
    });
  
    test("It should return 404 for no-such-comp", async function () {
      const response = await request(app)
          .delete("/companies/blargh");
  
      expect(response.status).toEqual(404);
    });
  });
  