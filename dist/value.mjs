function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function r(t){return"function"==typeof t}function s(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function c(t,e,n){t.insertBefore(e,n||null)}function u(t){t.parentNode.removeChild(t)}function a(t){const e={};for(const n of t)e[n.name]=n.value;return e}let l;function i(t){l=t}const f=[],d=[],$=[],h=[],p=Promise.resolve();let m=!1;function g(t){$.push(t)}let b=!1;const _=new Set;function v(){if(!b){b=!0;do{for(let t=0;t<f.length;t+=1){const e=f[t];i(e),x(e.$$)}for(i(null),f.length=0;d.length;)d.pop()();for(let t=0;t<$.length;t+=1){const e=$[t];_.has(e)||(_.add(e),e())}$.length=0}while(f.length);for(;h.length;)h.pop()();m=!1,b=!1,_.clear()}}function x(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(g)}}const y=new Set;function k(t,e){-1===t.$$.dirty[0]&&(f.push(t),m||(m=!0,p.then(v)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function E(s,c,a,f,d,$,h,p=[-1]){const m=l;i(s);const b=s.$$={fragment:null,ctx:null,props:$,update:t,not_equal:d,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(c.context||(m?m.$$.context:[])),callbacks:n(),dirty:p,skip_bound:!1,root:c.target||m.$$.root};h&&h(b.root);let _=!1;if(b.ctx=a?a(s,c.props||{},((t,e,...n)=>{const o=n.length?n[0]:e;return b.ctx&&d(b.ctx[t],b.ctx[t]=o)&&(!b.skip_bound&&b.bound[t]&&b.bound[t](o),_&&k(s,t)),e})):[],b.update(),_=!0,o(b.before_update),b.fragment=!!f&&f(b.ctx),c.target){if(c.hydrate){const t=function(t){return Array.from(t.childNodes)}(c.target);b.fragment&&b.fragment.l(t),t.forEach(u)}else b.fragment&&b.fragment.c();c.intro&&((x=s.$$.fragment)&&x.i&&(y.delete(x),x.i(E))),function(t,n,s,c){const{fragment:u,on_mount:a,on_destroy:l,after_update:i}=t.$$;u&&u.m(n,s),c||g((()=>{const n=a.map(e).filter(r);l?l.push(...n):o(n),t.$$.on_mount=[]})),i.forEach(g)}(s,c.target,c.anchor,c.customElement),v()}var x,E;i(m)}let w;function C(e){let n;return{c(){var e;e="svelte-explorer-expand",n=document.createElement(e),this.c=t},m(t,o){c(t,n,o),e[2](n)},p:t,i:t,o:t,d(t){t&&u(n),e[2](null)}}}function j(t,e,n){let o,{value:r}=e;return t.$$set=t=>{"value"in t&&n(1,r=t.value)},t.$$.update=()=>{3&t.$$.dirty&&o&&n(0,o["svelte-explorer-value"]=r,o)},[o,r,function(t){d[t?"unshift":"push"]((()=>{o=t,n(0,o),n(1,r)}))}]}"function"==typeof HTMLElement&&(w=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){const{on_mount:t}=this.$$;this.$$.on_disconnect=t.map(e).filter(r);for(const t in this.$$.slotted)this.appendChild(this.$$.slotted[t])}attributeChangedCallback(t,e,n){this[t]=n}disconnectedCallback(){o(this.$$.on_disconnect)}$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}});class M extends w{constructor(t){super(),E(this,{target:this.shadowRoot,props:a(this.attributes),customElement:!0},j,C,s,{value:1},null),t&&(t.target&&c(t.target,this,t.anchor),t.props&&(this.$set(t.props),v()))}static get observedAttributes(){return["value"]}get value(){return this.$$.ctx[1]}set value(t){this.$$set({value:t}),v()}}customElements.define("svelte-object-explorer-value",M);export{M as default};
//# sourceMappingURL=value.mjs.map