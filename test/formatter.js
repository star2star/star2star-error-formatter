//formatError Test

const assert = require("assert");
const mocha = require("mocha");
const describe = mocha.describe;
const it = mocha.it;

const formatter = require("../src/formatter");

describe("formatter", function () {

  it("test formatError", function (done) {
    const errObj = new Error('npm run test error');
    const returnedObject = formatter.formatError(errObj);
    // console.log(returnedObject);
    assert.equal(returnedObject.hasOwnProperty("code"), true, "formatError failed."); 
    done();
  });
});