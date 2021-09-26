<script>
    import SvelteObjectExplorer from "../../../../Index.svelte";
    import SvelteValue from "../../../../Value.svelte";
</script>

<SvelteObjectExplorer />
<div>
    <div>
        <div>
            <div>
                <div>
                    <div><SvelteValue />Deeply Nested Content 1</div>
                </div>
            </div>
        </div>
    </div>
    <div>
        <div>
            <div>
                <div>
                    <div><SvelteValue value="testy" />Deeply Nested Content 2</div>
                </div>
            </div>
        </div>
    </div>
    <div>
        <div>
            <div>
                <div>
                    <div><SvelteValue name="test" value={{ testy: "testy" }} />Deeply Nested Content 3</div>
                </div>
            </div>
        </div>
    </div>
    <div>
        <div>
            <div>
                <div>
                    <div>
                        <SvelteValue value={{ testy: "testy" }} name="test" other-attr="test" />Deeply Nested Content 4
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
