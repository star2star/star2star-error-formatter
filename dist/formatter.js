/* global require process module*/
"use strict";

const uuidv4 = require("uuid/v4");
/**
 * @description This function standardizes error responses to objects containing "code", "message", "trace_id", and "details properties"
 * @param {object} error - standard javascript error object, or request-promise error object
 * @returns {Object} - error object formatted to standard
 */


const formatError = error => {
  // defaults ensure we always get a compatbile format back
  let message = "unspecified error";
  const returnedObject = {
    "code": undefined,
    "message": message,
    "trace_id": uuidv4(),
    "details": []
  };

  try {
    if (error) {
      // request-promise errors, non 2xx or 3xx response
      if (error.hasOwnProperty("name") && error.name === "StatusCodeError") {
        // just pass along what we got back from API
        if (error.hasOwnProperty("response") && error.response.hasOwnProperty("body")) {
          // for external systems that don't follow our standards, try to return something ...
          if (typeof error.response.body === "string") {
            try {
              const parsedBody = JSON.parse(error.response.body);
              error.response.body = parsedBody;
            } catch (e) {
              const body = error.response.body;
              error.response.body = {
                "message": body
              };
            }
          }

          returnedObject.code = error.response.body.hasOwnProperty("code") && error.response.body.code && error.response.body.code.toString().length === 3 ? error.response.body.code : returnedObject.code;
          returnedObject.message = error.response.body.hasOwnProperty("message") && error.response.body.message && error.response.body.message.length > 0 ? error.response.body.message : returnedObject.message;
          returnedObject.trace_id = error.response.body.hasOwnProperty("trace_id") && error.response.body.trace_id && error.response.body.trace_id.length > 0 ? error.response.body.trace_id : returnedObject.trace_id; //make sure details is an array of objects or strings

          if (error.response.body.hasOwnProperty("details") && Array.isArray(error.response.body.details)) {
            const filteredDetails = error.response.body.details.filter(detail => {
              return typeof detail === "object" && detail !== null || typeof detail === "string";
            }).map(detail => {
              if (typeof detail === "object") {
                return JSON.stringify(detail);
              }

              return detail;
            });
            returnedObject.details = filteredDetails;
          }
        } // in case we didn't get a body, or the body was missing the code, try to get code from the http response code


        if (error.hasOwnProperty("statusCode") && error.statusCode.toString().length === 3) {
          // we did not get a code out of the response body
          if (!returnedObject.code) {
            returnedObject.code = error.statusCode;
          } else if (returnedObject.code.toString() !== error.statusCode.toString()) {
            // record a mismatch between the http response code and the "code" property returned in the respose body 
            returnedObject.message = "".concat(returnedObject.code, " - ").concat(returnedObject.message); // make the code property match the actual http response code

            returnedObject.code = error.statusCode;
          }
        } // in case we didn't get a trace_id in the body, it should match the one we sent so use that instead


        if (error.hasOwnProperty("options") && error.options.hasOwnProperty("headers") && error.options.headers.hasOwnProperty("trace") && error.options.headers.trace.toString().length > 0) {
          returnedObject.trace_id = error.options.headers.trace;
        } // some problem making request, general JS errors, or already formatted from nested call

      } else {
        returnedObject.code = error.hasOwnProperty("code") && error.code && error.code.toString().length === 3 ? error.code : returnedObject.code;
        returnedObject.message = error.hasOwnProperty("message") && error.message && error.message.toString().length > 0 ? error.message : returnedObject.message;
        returnedObject.trace_id = error.hasOwnProperty("trace_id") && error.trace_id && error.trace_id.toString().length > 0 ? error.trace_id : returnedObject.trace_id; //make sure details is an array of objects

        if (error.hasOwnProperty("details") && Array.isArray(error.details)) {
          const filteredDetails = error.details.filter(detail => {
            return typeof detail === "object" && detail !== null || typeof detail === "string";
          }).map(detail => {
            if (typeof detail === "object") {
              return JSON.stringify(detail);
            }

            return detail;
          });
          returnedObject.details = filteredDetails;
        }
      } //if error is just a string, set it as the message


      if (typeof error === "string" && error.length > 0) {
        returnedObject.message = error;
      }
    } // we did not get a code anywhere to use a default internal server error


    if (!returnedObject.code) {
      returnedObject.code = 500;
    }

    return returnedObject;
  } catch (error) {
    // something blew up formatting or parsing somewhere. try to handle it....
    returnedObject.code = 500;
    returnedObject.message = error.hasOwnProperty("message") ? error.message : "formatter error";
    returnedObject.details = [{
      "location": "formatError() star2star-error-formatter"
    }, error];
    return returnedObject;
  }
};

module.exports = {
  formatError
};