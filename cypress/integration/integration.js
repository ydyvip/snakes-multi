
var copy = require("../../copyobj.js");

describe("collisions", function(){

  it("test to egzamine behaviour when input is triggered before qc and reduced after qc - and at fast pace", function(){

    cy.visit("http://localhost:3006/");

    cy.get(':nth-child(1) > .input').type("user6");
    cy.get(':nth-child(2) > .input').type("123456a");
    cy.get('.btn').click();

    cy.request("http://localhost:3007/join");

    cy.get("div.room img[src='img/circle-24-on.svg']").should("have.length", 5);

    cy.get('.btn').click();

    cy.wait(4000); // for round start

    cy.window({timeout: 15000}).its("player.speed").should("to.eq", 50);

    cy.wait(3700); // 1 sec before qc

    //cy.wait(4100); // for qc + 100ms

    var tm_wait = 10;

    cy.get("canvas").trigger("keydown", "top", {code: "ArrowLeft", force: true});
    cy.wait(tm_wait);
    cy.get("canvas").trigger("keydown", "top", {code: "ArrowRight", force: true});
    cy.wait(tm_wait);
    cy.get("canvas").trigger("keyup", "top", {code: "ArrowLeft", force: true});
    cy.wait(tm_wait);
    cy.get("canvas").trigger("keydown", "top", {code: "ArrowLeft", force: true});
    cy.wait(tm_wait);
    cy.get("canvas").trigger("keyup", "top", {code: "ArrowRight", force: true});
    cy.wait(tm_wait);
    cy.get("canvas").trigger("keydown", "top", {code: "ArrowRight", force: true});
    cy.wait(tm_wait);
    cy.get("canvas").trigger("keyup", "top", {code: "ArrowLeft", force: true});
    cy.wait(tm_wait);
    cy.get("canvas").trigger("keydown", "top", {code: "ArrowLeft", force: true});
    cy.wait(tm_wait);
    cy.get("canvas").trigger("keyup", "top", {code: "ArrowRight", force: true});
    cy.wait(tm_wait);
    cy.get("canvas").trigger("keydown", "top", {code: "ArrowRight", force: true});
    cy.wait(tm_wait);
    cy.get("canvas").trigger("keyup", "top", {code: "ArrowLeft", force: true});
    cy.wait(tm_wait);
    cy.get("canvas").trigger("keydown", "top", {code: "ArrowLeft", force: true});
    cy.wait(tm_wait);
    cy.get("canvas").trigger("keyup", "top", {code: "ArrowRight", force: true});
    cy.wait(tm_wait);
    cy.get("canvas").trigger("keydown", "top", {code: "ArrowRight", force: true});
    cy.wait(tm_wait);
    cy.get("canvas").trigger("keyup", "top", {code: "ArrowRight", force: true});
    cy.wait(tm_wait);
    cy.get("canvas").trigger("keyup", "top", {code: "ArrowLeft", force: true});
    cy.wait(tm_wait);

    cy.wait(60000);

  })

})
