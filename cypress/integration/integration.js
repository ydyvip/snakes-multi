var copy = require("../../copyobj.js");

describe("collisions", function(){

  it("when collision is rejected due to new input, in the next cycle of loop we should force collision to emit if it was detected again", function(){

    cy.visit("http://localhost:3006/");

    cy.get(':nth-child(1) > .input').type("user6");
    cy.get(':nth-child(2) > .input').type("123456a");
    cy.get('.btn').click();

    cy.request("http://localhost:3007/join");

    cy.get("div.room img[src='img/circle-24-on.svg']").should("have.length", 5);

    cy.get('.btn').click();

    cy.wait(4000); // for round start

    cy.window({timeout: 15000}).its("player.speed").should("to.eq", 50);

    cy.wait(5218);

    cy.get("canvas").trigger("keydown", "top", {code: "ArrowLeft", force: true});

    cy.wait(10);

    cy.get("canvas").trigger("keyup", "top", {code: "ArrowLeft", force: true});
    cy.wait(10);
    cy.get("canvas").trigger("keydown", "top", {code: "ArrowRight", force: true});
    cy.wait(10);
    cy.get("canvas").trigger("keyup", "top", {code: "ArrowRight", force: true});
    cy.wait(10);
    cy.get("canvas").trigger("keydown", "top", {code: "ArrowLeft", force: true});
    cy.wait(10);
    cy.get("canvas").trigger("keyup", "top", {code: "ArrowLeft", force: true});
    cy.wait(10);
    cy.get("canvas").trigger("keydown", "top", {code: "ArrowRight", force: true});
    cy.wait(10);
    cy.get("canvas").trigger("keyup", "top", {code: "ArrowRight", force: true});
    cy.wait(10);
    cy.get("canvas").trigger("keydown", "top", {code: "ArrowLeft", force: true});
    cy.wait(10);
    cy.get("canvas").trigger("keyup", "top", {code: "ArrowLeft", force: true});
    return;
    cy.get("canvas").trigger("keydown", "top", {code: "ArrowRight", force: true});

    cy.get("canvas").trigger("keyup", "top", {code: "ArrowRight", force: true});

    cy.get("canvas").trigger("keydown", "top", {code: "ArrowLeft", force: true});

    cy.get("canvas").trigger("keyup", "top", {code: "ArrowLeft", force: true});

    cy.get("canvas").trigger("keydown", "top", {code: "ArrowRight", force: true});

    cy.get("canvas").trigger("keyup", "top", {code: "ArrowRight", force: true});

    cy.get("canvas").trigger("keydown", "top", {code: "ArrowLeft", force: true});

    cy.get("canvas").trigger("keyup", "top", {code: "ArrowLeft", force: true});

    cy.get("canvas").trigger("keydown", "top", {code: "ArrowRight", force: true});

    cy.get("canvas").trigger("keyup", "top", {code: "ArrowRight", force: true});

    cy.get("canvas").trigger("keydown", "top", {code: "ArrowLeft", force: true});

    cy.get("canvas").trigger("keyup", "top", {code: "ArrowLeft", force: true});

    cy.get("canvas").trigger("keydown", "top", {code: "ArrowRight", force: true});

    cy.get("canvas").trigger("keyup", "top", {code: "ArrowRight", force: true});

    cy.get("canvas").trigger("keydown", "top", {code: "ArrowLeft", force: true});

    cy.get("canvas").trigger("keyup", "top", {code: "ArrowLeft", force: true});
    /*



    cy.get("canvas").trigger("keydown", "top", {code: "ArrowLeft", force: true});

    cy.wait(500);

    cy.get("canvas").trigger("keyup", "top", {code: "ArrowLeft", force: true});

    */

  })

})
