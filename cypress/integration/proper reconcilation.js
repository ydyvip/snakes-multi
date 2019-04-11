
var copy = require("../../copyobj.js");

describe("collisions", function(){

  it("there should be proper reconcilation even setTimeout break sequence of input", function(){

    cy.visit("http://localhost:3004/");

    cy.get(':nth-child(1) > .input').type("user6");
    cy.get(':nth-child(2) > .input').type("123456a");
    cy.get('.btn').click();

    cy.request("http://localhost:5000/join");

    cy.get("div.room img[src='img/circle-24-on.svg']").should("have.length", 5);

    cy.get('.btn').click();

    cy.wait(4000); // for round start

    cy.window({timeout: 15000}).its("player.speed").should("to.eq", 50);

    cy.wait(3950);

    cy.get("canvas").trigger("keydown", "top", {code: "ArrowRight", force: true});

    cy.wait(1000);

    cy.get("canvas").trigger("keyup", "top", {code: "ArrowRight", force: true});


  })

})
