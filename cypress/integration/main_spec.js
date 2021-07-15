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
const customElement = "/CustomElement";
const svelteComponent = "/SvelteComponent";
const umdModule = "/UMDmodule";
const test_urls = [customElement, svelteComponent, umdModule];

test_urls.forEach((url, site_index) => {
    describe.only(url + ": " + "Toggle Main panel", function () {
        it("Panel is visible", function () {
            cy.viewport(1000, 600);
            cy.visit(url);
            cy.get("div.tree");
        });

        it("Hide button is visible", function () {
            cy.get("div.toggle.toggleShow");
        });

        it("Clicking hide button, hides panel", function () {
            cy.get("div.toggle.toggleShow").click();
            cy.get("div.toggle.toggleHide");
            cy.get("div.tree").should("not.exist");
        });

        it("Show button is visible", function () {
            cy.get("div.toggle.toggleHide");
        });

        it("Clicking show button, shows panel", function () {
            cy.get("div.toggle.toggleHide").click();
            cy.wait(500);
            cy.get("div.tree");
        });
    });

    describe(url + ": " + "Toggle panel objects", function () {
        it("Count of data rows should be 30 (22 rows + multilines)", function () {
            cy.viewport(1000, 600);
            cy.visit(url);
            cy.get("div.row").should("have.length", 30);
            cy.get("span.len").first().contains("(22)");
        });

        it("List of child types should match test data", function () {
            const types = [o, h, s, s, a, a, A, o, n, n, b, b, N, u, S, S, F, F, f, o, n, o, n];
            for (let i = 0; i < types.length; i++) {
                cy.get("span.type").eq(i).contains(types[i]);
            }
        });

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

    describe(url + ": " + "Prop options", function () {
        describe(url + ": " + "Open", function () {
            it("Open = null, No panels are open", function () {
                cy.viewport(1000, 600);
                cy.visit(url);
                wait_based_on_url(site_index);
                //item 'longstring' with no panels open above it, should be in original position
                nthSelectorEqualsText(3, "div.row span.key", "longstring");
            });

            it("Open = 'string1', is not an object or array so no panels are open", function () {
                cy.viewport(1000, 600);
                cy.visit(url + "?open=string1");
                wait_based_on_url(site_index);
                //item 'longstring' with no panels open above it, should be in original position
                nthSelectorEqualsText(3, "div.row span.key", "longstring");
            });

            it("Open = 'bananaman', is not a valid reference so no panels are open", function () {
                cy.viewport(1000, 600);
                cy.visit(url + "?open=bananaman");
                wait_based_on_url(site_index);
                //item 'longstring' with no panels open above it, should be in original position
                nthSelectorEqualsText(3, "div.row span.key", "longstring");
            });

            it("Open = 'html', is an object, so it is open, so longstring is further down", function () {
                cy.viewport(1000, 600);
                cy.visit(url + "?open=html");
                wait_based_on_url(site_index);
                //item 'longstring' after expanded 'html' should be further down
                nthSelectorEqualsText(15, "div.row span.key", "longstring");
            });
        });

        describe(url + ": " + "Fade", function () {
            describe(url + ": " + "Fade = true", function () {
                it("Panel is visible with 0.3 opacity when NOT mouseover", function () {
                    cy.viewport(1000, 600);
                    cy.visit(url + "?fade=true");
                    cy.get("div.tree").should("have.css", "opacity", "0.3");
                });

                it("Panel is visible with 1 opacity when mouseover (simulates a hover)", function () {
                    cy.viewport(1000, 600);
                    cy.visit(url + "?fade=true");
                    cy.get("#svelteObjectExplorer").trigger("mouseover").wait(1000).should("have.css", "opacity", "1");
                });
            });

            describe(url + ": " + "Fade = false", function () {
                it("Panel is visible with 1 opacity when NOT mouseover", function () {
                    cy.viewport(1000, 600);
                    cy.visit(url);
                    cy.get("div.tree").should("have.css", "opacity", "1");
                });

                it("Panel is visible with 1 opacity when mouseover (simulates a hover)", function () {
                    cy.viewport(1000, 600);
                    cy.visit(url);
                    cy.get("#svelteObjectExplorer").trigger("mouseover").wait(1000).should("have.css", "opacity", "1");
                });
            });
        });

        describe(url + ": " + "tabPosition", function () {
            it("The 'Show' Panel is in the top, because of prop 'tabPosition=top'", function () {
                cy.viewport(1000, 600);
                cy.visit(url + "?tabPosition=top");
                cy.get("div.toggle.toggleShow.toggletop");
            });
            it("The 'Show' Panel is in the middle, because of prop 'tabPosition=middle'", function () {
                cy.viewport(1000, 600);
                cy.visit(url + "?tabPosition=middle");
                cy.get("div.toggle.toggleShow.togglemiddle");
            });
            it("The 'Show' Panel is in the bottom, because of prop 'tabPosition=bottom'", function () {
                cy.viewport(1000, 600);
                cy.visit(url + "?tabPosition=bottom");
                cy.get("div.toggle.toggleShow.togglebottom");
            });
        });

        describe(url + ": " + "rateLimit", function () {
            describe(
                url + ": " + "rateLimit = default 100. Autocounter should increase cache automatically each second",
                function () {
                    callAutomaticCounterTests(url, 100, 0, 1100, "not.");
                }
            );
            describe(url + ": " + "rateLimit = 500. Autocounter should still increase cache each second", function () {
                callAutomaticCounterTests(url, 500, 250, 1100, "");
            });
            describe(url + ": " + "rateLimit = 2000. Autocounter should increase cache each 2 seconds", function () {
                callAutomaticCounterTests(url, 2000, 500, 3000, "");
            });
        });
    });

    describe(url + ": " + "Panel data updates when App data updates", function () {
        it("Manual: Clicking counter buttons should change the manual counter", function () {
            cy.viewport(1000, 600);
            cy.visit(url);
            wait_based_on_url(site_index);

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

        describe(url + ": " + "Automatic: Data updates when paused and un-paused, compared to view", function () {
            it("data and view are the same on page load", function () {
                cy.viewport(1000, 600);
                cy.visit(url);
                cy.wait(2000);
                cy.get(".reset").click();
                cy.get("span.cache_view")
                    .invoke("text")
                    .then((count1) => {
                        nthSelectorEqualsText(0, "span.cache_data", count1);
                        nthSelectorEqualsText(0, "span.cache_view", count1);
                    });
            });
            it("after 2 seconds of pausing, data has increased, but view should not", function () {
                cy.viewport(1000, 600);
                cy.visit(url);
                cy.wait(1000);
                //pause
                cy.get(".reset").click();
                cy.get("button.pause").click();
                cy.get("span.cache_data")
                    .invoke("text")
                    .then((count1) => {
                        cy.wait(2000);
                        cy.get("span.cache_data")
                            .invoke("text")
                            .then((count2) => {
                                expect(Number.parseInt(count2)).to.be.greaterThan(Number.parseInt(count1));
                            });
                    });
                cy.get("span.cache_view")
                    .invoke("text")
                    .then((count1) => {
                        cy.wait(2000);
                        cy.get("span.cache_view")
                            .invoke("text")
                            .then((count2) => {
                                expect(Number.parseInt(count2)).to.be.equal(Number.parseInt(count1));
                            });
                    });
            });
            it("both data and view will update after unpause", function () {
                cy.viewport(1000, 600);
                cy.visit(url);
                cy.wait(1000);
                //pause
                cy.get(".reset").click();
                cy.get("button.pause").click();
                cy.get("span.cache_data")
                    .invoke("text")
                    .then((count1) => {
                        cy.wait(2000);
                        //this unpause should also affect the view in block below
                        cy.get("button.pause").click();
                        cy.wait(2000);
                        cy.get("span.cache_data")
                            .invoke("text")
                            .then((count2) => {
                                expect(Number.parseInt(count2)).to.be.greaterThan(Number.parseInt(count1));
                            });
                    });
                cy.get("span.cache_view")
                    .invoke("text")
                    .then((count1) => {
                        cy.wait(4000);
                        cy.get("span.cache_view")
                            .invoke("text")
                            .then((count2) => {
                                expect(Number.parseInt(count2)).to.be.greaterThan(Number.parseInt(count1));
                            });
                    });
            });
        });
    });
});
function callAutomaticCounterTests(url, rate, before, after, not) {
    const full_url = rate === 100 ? url : url + "?rateLimit=" + rate;
    it(`data before rate:${rate} is same`, function () {
        testAutomaticCounter(full_url, "span.cache_data", before, false, not);
    });
    it(`view before rate:${rate} is same`, function () {
        testAutomaticCounter(full_url, "span.cache_view", before, false, not);
    });
    it(`data after rate:${rate} is different`, function () {
        testAutomaticCounter(full_url, "span.cache_data", after, true, not);
    });
    it(`view after rate:${rate} is different`, function () {
        testAutomaticCounter(full_url, "span.cache_view", after, true, not);
    });
}

function testAutomaticCounter(url, selector, wait, should_be_greater, not_visible = "") {
    cy.viewport(1000, 600);
    cy.visit(url);
    cy.wait(2000);
    cy.get(".reset").click();
    cy.get(selector)
        .invoke("text")
        .then((count1) => {
            //wait then get same value, it should be greater(or equal)
            cy.wait(wait);
            cy.get(selector)
                .invoke("text")
                .then((count2) => {
                    if (should_be_greater) expect(Number.parseInt(count2)).to.be.greaterThan(Number.parseInt(count1));
                    else expect(count2).to.be.equal(count1);

                    if (not_visible) cy.get("span.cache_ratelimit").should("not.exist");
                    else cy.get("span.cache_ratelimit");
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

function wait_based_on_url(url) {
    if (url !== customElement) cy.wait(1000);
}
