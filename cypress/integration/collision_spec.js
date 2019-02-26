
var copy = require("../../copyobj.js");

describe("collisions", function(){

  it("server should emit kill event once", function(){

    cy.visit("http://localhost:3004/");

    cy.get(':nth-child(1) > .input').type("user6");
    cy.get(':nth-child(2) > .input').type("123456a");
    cy.get('.btn').click();

    cy.request("http://localhost:5000/join");

    cy.get("div.room img[src='img/circle-24-on.svg']").should("have.length", 5);

    cy.get('.btn').click();

    cy.window().its("player.speed").should("to.eq", 50);

    cy.wait(800);

    cy.get("canvas").trigger("keydown", "top", {code: "ArrowRight", force: true});

    cy.window().its("player.speed").should("to.eq", 0);

    cy.window().its("player").then((player)=>{

      const spy = cy.spy(player, "clearFurtherPaths");
      cy.wait(2000).then(()=>{
        expect(spy).to.be.calledOnce
      })


    })

  })

})
