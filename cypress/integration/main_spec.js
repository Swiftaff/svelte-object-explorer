const o = "object";
const h = "HTML";
const s = "string";
const a = "array";
const A = "ARRAY+";
const n = "number";
const b = "boolean";
const N = "null";
const u = "undefined";
const S = "symbol";
const F = "arrow fn";
const f = "function";

describe("Toggle Main panel", function () {
    it("Panel is visible", function () {
        cy.viewport(1000, 600);
        cy.visit("http://localhost:5000/");
        cy.get("div.tree");
    });

    it("Hide button is visible", function () {
        cy.get("div.toggle.toggleShow");
    });

    it("Clicking hide button, hides panel", function () {
        cy.get("div.toggle.toggleShow").click();
        cy.get("div.toggle.toggleHide");
    });

    it("Show button is visible", function () {
        cy.get("div.toggle.toggleHide");
    });

    it("Clicking show button, shows panel", function () {
        cy.get("div.toggle.toggleHide").click();
        cy.get("div.tree.tree-hide").should("not.be.visible");
    });
});

describe("Toggle panel objects", function () {
    it("Count of data rows should be 30 (22 rows + multilines)", function () {
        cy.viewport(1000, 600);
        cy.visit("http://localhost:5000");
        cy.get("div.row").should("have.length", 30);
        cy.get("span.len").first().contains("(22)");
    });

    it("List of child types should match test data", function () {
        const types = [o, h, s, s, a, a, A, o, n, n, b, b, N, u, S, S, F, F, f, o, n, o, n];
        for (let i = 0; i < types.length; i++) {
            cy.get("span.type").eq(i).contains(types[i]);
        }
    });

    // no longer works this way
    //it("Test object should be open due to 'open' prop being set to 'variousTypes', showing 12 subitems", function () {
    //    cy.get("div.row").should("have.length", 50);
    //});

    it("Clicking first sub-item 'HTML' expand arrow, should expand item, showing 12 children of correct type", function () {
        cy.get("button.pause").click();
        cy.get("span.dataArrow").eq(1).click();
        cy.get("span.len").eq(1).contains("(12)");
        cy.get("span.type").eq(1).contains("HTML");
        const types = [o, h, h, h, h, h, h, h, h, h, h, h, h, h, s];
        for (let i = 0; i < types.length; i++) {
            cy.get("span.type").eq(i).contains(types[i]);
        }
    });
});

describe("Prop options", function () {
    // no longer works this way
    /*
    describe("Open", function () {
        
        it("Open = 'variousTypes', 1 correct panel is open", function () {
            cy.viewport(1000, 600);
            cy.visit("http://localhost:5000?open=variousTypes");
            cy.get("tr.accordion.open").should("have.length", 1).contains("variousTypes");
        });

        it("Open = null, No panels are open", function () {
            cy.viewport(1000, 600);
            cy.visit("http://localhost:5000");
            cy.get("tr.accordion.open").should("not.exist");
        });

        it("Open = 'customStoreValue', is not an object or array so no panels are open", function () {
            cy.viewport(1000, 600);
            cy.visit("http://localhost:5000?open=customStoreValue");
            cy.get("tr.accordion.open").should("not.exist");
        });

        it("Open = 'bananaman', is not a valid reference so no panels are open", function () {
            cy.viewport(1000, 600);
            cy.visit("http://localhost:5000?open=bananaman");
            cy.get("tr.accordion.open").should("not.exist");
        });
    });
    */

    describe("Fade", function () {
        describe("Fade = true", function () {
            it("Panel is visible with 0.3 opacity when NOT mouseover", function () {
                cy.viewport(1000, 600);
                cy.visit("http://localhost:5000?fade=true");
                cy.get("div.tree").should("have.css", "opacity", "0.3");
            });

            it("Panel is visible with 1 opacity when mouseover (simulates a hover)", function () {
                cy.viewport(1000, 600);
                cy.visit("http://localhost:5000?fade=true");
                cy.get("#svelteObjectExplorer").trigger("mouseover").wait(1000).should("have.css", "opacity", "1");
            });
        });

        describe("Fade = false", function () {
            it("Panel is visible with 1 opacity when NOT mouseover", function () {
                cy.viewport(1000, 600);
                cy.visit("http://localhost:5000");
                cy.get("div.tree").should("have.css", "opacity", "1");
            });

            it("Panel is visible with 1 opacity when mouseover (simulates a hover)", function () {
                cy.viewport(1000, 600);
                cy.visit("http://localhost:5000");
                cy.get("#svelteObjectExplorer").trigger("mouseover").wait(1000).should("have.css", "opacity", "1");
            });
        });
    });

    describe("tabPosition", function () {
        it("The 'Show' Panel is in the top, because of prop 'tabPosition=top'", function () {
            cy.viewport(1000, 600);
            cy.visit("http://localhost:5000?tabPosition=top");
            cy.get("div.toggle.toggleShow.toggletop");
        });
        it("The 'Show' Panel is in the middle, because of prop 'tabPosition=middle'", function () {
            cy.viewport(1000, 600);
            cy.visit("http://localhost:5000?tabPosition=middle");
            cy.get("div.toggle.toggleShow.togglemiddle");
        });
        it("The 'Show' Panel is in the bottom, because of prop 'tabPosition=bottom'", function () {
            cy.viewport(1000, 600);
            cy.visit("http://localhost:5000?tabPosition=bottom");
            cy.get("div.toggle.toggleShow.togglebottom");
        });
    });

    describe("rateLimit", function () {
        it("rateLimit = default 100. Autocounter should increase automatically each second", function () {
            cy.get("span.cache_ratelimit").should("not.be.visible");
            //testAutomaticCounter("http://localhost:5000", "span.cache_data", 0, 50, true);
            testAutomaticCounter("http://localhost:5000", "span.cache_view", 0, 1500, true);
        });
        it("rateLimit = 500. Autocounter should still increase automatically", function () {
            testAutomaticCounter("http://localhost:5000?rateLimit=500", "span.cache_data", 0, 1500, true, () => {
                cy.get("span.cache_ratelimit").should("be.visible");
            });
            testAutomaticCounter("http://localhost:5000?rateLimit=500", "span.cache_view", 0, 1500, true);
        });
        it("rateLimit = 2000. Autocounter should not increase in this period", function () {
            testAutomaticCounter("http://localhost:5000?rateLimit=2000", "span.cache_data", 0, 500, false, () => {
                cy.get("span.cache_ratelimit").should("be.visible");
            });
            testAutomaticCounter("http://localhost:5000?rateLimit=2000", "span.cache_view", 0, 500, false);
        });
    });
});

describe("Panel data updates when App data updates", function () {
    it("Manual: Clicking counter buttons should change the manual counter", function () {
        cy.viewport(1000, 600);
        cy.visit("http://localhost:5000/");

        //customStoreValue is initially set to 0
        nthSelectorEqualsText(22, "div.row span.key", "customStoreValue");
        nthSelectorEqualsText(28, "div.row span.val", "0"); // 22 + 6 multi-lines from longstring

        //click increase button twice, should equal 2
        cy.get("#incr").click();
        cy.get("#incr").click();
        cy.wait(1000);
        nthSelectorEqualsText(28, "div.row span.val", "2");

        //click decrease button once, should equal 1
        cy.get("#decr").click();
        cy.wait(1000);
        nthSelectorEqualsText(28, "div.row span.val", "1");

        //click reset button once, should equal 0 again
        cy.get("#decr").click();
        cy.wait(1000);
        nthSelectorEqualsText(28, "div.row span.val", "0");
    });

    describe("Automatic: Data updates when paused and un-paused, compared to view", function () {
        it("only data updates after pause, not view", function () {
            cy.viewport(1000, 600);
            cy.visit("http://localhost:5000/");

            //pause
            cy.get("button.pause").click();
            nthSelectorEqualsText(0, "span.cache_data", "1");
            nthSelectorEqualsText(0, "span.cache_view", "0");
            cy.wait(1100);
            nthSelectorEqualsText(0, "span.cache_data", "2");
            nthSelectorEqualsText(0, "span.cache_view", "0");
            cy.wait(1100);
            nthSelectorEqualsText(0, "span.cache_data", "3");
            nthSelectorEqualsText(0, "span.cache_view", "0");
        });
        it("both data and view will update after unpause", function () {
            cy.get("button.pause").click();
            cy.wait(1100);
            nthSelectorEqualsText(0, "span.cache_data", "4");
            nthSelectorEqualsText(0, "span.cache_view", "2");
            cy.wait(1100);
            nthSelectorEqualsText(0, "span.cache_data", "5");
            nthSelectorEqualsText(0, "span.cache_view", "3");
        });
    });
});

function testAutomaticCounter(url, selector, firstWait, secondWait, should_be_greater, callback) {
    cy.viewport(1000, 600);
    cy.visit(url);
    if (callback) callback();
    cy.get(selector)
        .invoke("text")
        .then((count1) => {
            //wait a bit then get same value, it should be the same since rateLimit is in place
            cy.wait(firstWait);
            cy.get(selector)
                .invoke("text")
                .then((count2) => {
                    expect(Number.parseInt(count2)).to.be.equal(Number.parseInt(count1));

                    //wait a bit more get same value, it should be greater
                    cy.wait(secondWait);
                    cy.get(selector)
                        .invoke("text")
                        .then((count3) => {
                            if (should_be_greater)
                                expect(Number.parseInt(count3)).to.be.greaterThan(Number.parseInt(count1));
                            else expect(Number.parseInt(count3)).to.be.equal(Number.parseInt(count1));
                        });
                });
        });
}

function nthSelectorEqualsText(n, selector, compare_text) {
    cy.get(selector)
        .eq(n)
        .invoke("text")
        .then((text) => {
            expect(text).to.equal(compare_text);
        });
}
