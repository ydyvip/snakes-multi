
var copy = require("../../copyobj.js");

describe("collisions", function(){

  it("in curpath-curpath collision case, input of both players can reject collision (mutual rejecting)", function(){

    cy.visit("http://localhost:3006/");

    cy.get(':nth-child(1) > .input').type("user6");
    cy.get(':nth-child(2) > .input').type("123456a");
    cy.get('.btn').click();

    cy.request("http://localhost:3007/join");

    cy.get("div.room img[src='img/circle-24-on.svg']").should("have.length", 5);

    cy.get('.btn').click();

    cy.wait(4000); // for round start

    cy.window({timeout: 15000}).its("player.speed").should("to.eq", 50);

    cy.wait(3900); // for last moment before collision

    //cy.get("canvas").trigger("keydown", "top", {code: "ArrowLeft", force: true});

  })

})
