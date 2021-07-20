var SvelteObjectExplorerCustomElementIIFE=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function r(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}let a,s=!1;function l(t,e,n,o){for(;t<e;){const r=t+(e-t>>1);n(r)<=o?t=r+1:e=r}return t}function c(t,e){s?(!function(t){if(t.hydrate_init)return;t.hydrate_init=!0;const e=t.childNodes,n=new Int32Array(e.length+1),o=new Int32Array(e.length);n[0]=-1;let r=0;for(let t=0;t<e.length;t++){const i=l(1,r+1,(t=>e[n[t]].claim_order),e[t].claim_order)-1;o[t]=n[i]+1;const a=i+1;n[a]=t,r=Math.max(a,r)}const i=[],a=[];let s=e.length-1;for(let t=n[r]+1;0!=t;t=o[t-1]){for(i.push(e[t-1]);s>=t;s--)a.push(e[s]);s--}for(;s>=0;s--)a.push(e[s]);i.reverse(),a.sort(((t,e)=>t.claim_order-e.claim_order));for(let e=0,n=0;e<a.length;e++){for(;n<i.length&&a[e].claim_order>=i[n].claim_order;)n++;const o=n<i.length?i[n]:null;t.insertBefore(a[e],o)}}(t),(void 0===t.actual_end_child||null!==t.actual_end_child&&t.actual_end_child.parentElement!==t)&&(t.actual_end_child=t.firstChild),e!==t.actual_end_child?t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling):e.parentNode!==t&&t.appendChild(e)}function u(t,e,n){s&&!n?c(t,e):(e.parentNode!==t||n&&e.nextSibling!==n)&&t.insertBefore(e,n||null)}function p(t){t.parentNode.removeChild(t)}function d(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function h(t){return document.createElement(t)}function g(t){return document.createTextNode(t)}function f(){return g(" ")}function m(){return g("")}function x(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function w(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function b(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function v(t){const e={};for(const n of t)e[n.name]=n.value;return e}function $(t){a=t}function y(t){(function(){if(!a)throw new Error("Function called outside component initialization");return a})().$$.on_mount.push(t)}const k=[],_=[],R=[],E=[],C=Promise.resolve();let A=!1;function T(t){R.push(t)}let N=!1;const S=new Set;function L(){if(!N){N=!0;do{for(let t=0;t<k.length;t+=1){const e=k[t];$(e),M(e.$$)}for($(null),k.length=0;_.length;)_.pop()();for(let t=0;t<R.length;t+=1){const e=R[t];S.has(e)||(S.add(e),e())}R.length=0}while(k.length);for(;E.length;)E.pop()();A=!1,N=!1,S.clear()}}function M(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(T)}}const j=new Set;let H,U;function P(){H={r:0,c:[],p:H}}function D(){H.r||o(H.c),H=H.p}function O(t,e){t&&t.i&&(j.delete(t),t.i(e))}function z(t,e,n,o){if(t&&t.o){if(j.has(t))return;j.add(t),H.c.push((()=>{j.delete(t),o&&(n&&t.d(1),o())})),t.o(e)}}function B(t){t&&t.c()}function Y(t,n,i,a){const{fragment:s,on_mount:l,on_destroy:c,after_update:u}=t.$$;s&&s.m(n,i),a||T((()=>{const n=l.map(e).filter(r);c?c.push(...n):o(n),t.$$.on_mount=[]})),u.forEach(T)}function I(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function F(t,e){-1===t.$$.dirty[0]&&(k.push(t),A||(A=!0,C.then(L)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function J(e,r,i,l,c,u,d=[-1]){const h=a;$(e);const g=e.$$={fragment:null,ctx:null,props:u,update:t,not_equal:c,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(h?h.$$.context:r.context||[]),callbacks:n(),dirty:d,skip_bound:!1};let f=!1;if(g.ctx=i?i(e,r.props||{},((t,n,...o)=>{const r=o.length?o[0]:n;return g.ctx&&c(g.ctx[t],g.ctx[t]=r)&&(!g.skip_bound&&g.bound[t]&&g.bound[t](r),f&&F(e,t)),n})):[],g.update(),f=!0,o(g.before_update),g.fragment=!!l&&l(g.ctx),r.target){if(r.hydrate){s=!0;const t=function(t){return Array.from(t.childNodes)}(r.target);g.fragment&&g.fragment.l(t),t.forEach(p)}else g.fragment&&g.fragment.c();r.intro&&O(e.$$.fragment),Y(e,r.target,r.anchor,r.customElement),s=!1,L()}$(h)}"function"==typeof HTMLElement&&(U=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){const{on_mount:t}=this.$$;this.$$.on_disconnect=t.map(e).filter(r);for(const t in this.$$.slotted)this.appendChild(this.$$.slotted[t])}attributeChangedCallback(t,e,n){this[t]=n}disconnectedCallback(){o(this.$$.on_disconnect)}$destroy(){I(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}});var V='<svg\nwidth="100%" \nxmlns="http://www.w3.org/2000/svg"\nxmlns:xlink="http://www.w3.org/1999/xlink"\naria-hidden="true"\nfocusable="false"\nstyle="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);\ntransform: rotate(360deg);"\npreserveAspectRatio="xMidYMid meet"\nviewBox="0 0 12 12">\n<g fill="none"><path d="M2.22 4.47a.75.75 0 0 1 1.06 0L6 7.19l2.72-2.72a.75.75 0 0 1 1.06 1.06L6.53 8.78a.75.75 0 0 1-1.06 0L2.22 5.53a.75.75 0 0 1 0-1.06z" fill="currentColor"/></g>\n<rect x="0" y="0" width="12" height="12" fill="rgba(0, 0, 0, 0)" />\n</svg>',W='<svg\nwidth="100%" \nxmlns="http://www.w3.org/2000/svg"\nxmlns:xlink="http://www.w3.org/1999/xlink"\naria-hidden="true"\nfocusable="false"\nstyle="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);\ntransform: rotate(360deg);"\npreserveAspectRatio="xMidYMid meet"\nviewBox="0 0 12 12">\n<g fill="none"><path d="M4.47 2.22a.75.75 0 0 0 0 1.06L7.19 6L4.47 8.72a.75.75 0 0 0 1.06 1.06l3.25-3.25a.75.75 0 0 0 0-1.06L5.53 2.22a.75.75 0 0 0-1.06 0z" fill="currentColor"/></g>\n<rect x="0" y="0" width="12" height="12" fill="rgba(0, 0, 0, 0)" />\n</svg>',q='<svg\nwidth="100%" \nxmlns="http://www.w3.org/2000/svg"\nxmlns:xlink="http://www.w3.org/1999/xlink"\naria-hidden="true"\nfocusable="false"\nstyle="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);\ntransform: rotate(360deg);"\npreserveAspectRatio="xMidYMid meet"\nviewBox="0 0 12 12">\n<g fill="none"><path d="M2.22 7.53a.75.75 0 0 0 1.06 0L6 4.81l2.72 2.72a.75.75 0 0 0 1.06-1.06L6.53 3.22a.75.75 0 0 0-1.06 0L2.22 6.47a.75.75 0 0 0 0 1.06z" fill="currentColor"/></g>\n<rect x="0" y="0" width="12" height="12" fill="rgba(0, 0, 0, 0)" />\n</svg>';function X(e){let n,o,r=q+"";return{c(){n=g("Show\n        "),o=h("span"),w(o,"class","smaller")},m(t,e){u(t,n,e),u(t,o,e),o.innerHTML=r},p:t,d(t){t&&p(n),t&&p(o)}}}function G(e){let n,o,r=V+"";return{c(){n=g("Hide\n        "),o=h("span"),w(o,"class","smaller")},m(t,e){u(t,n,e),u(t,o,e),o.innerHTML=r},p:t,d(t){t&&p(n),t&&p(o)}}}function K(e){let n,o,i,a;function s(t,e){return t[0]?G:X}let l=s(e),c=l(e);return{c(){n=h("div"),c.c(),this.c=t,w(n,"class",o=(e[0]?"toggle toggleShow":"toggle toggleHide")+" toggle"+e[1]+(e[2]?e[3]?" noFade":" fade":" noFade"))},m(t,o){u(t,n,o),c.m(n,null),i||(a=x(n,"mousedown",(function(){r(e[4])&&e[4].apply(this,arguments)})),i=!0)},p(t,[r]){l===(l=s(e=t))&&c?c.p(e,r):(c.d(1),c=l(e),c&&(c.c(),c.m(n,null))),15&r&&o!==(o=(e[0]?"toggle toggleShow":"toggle toggleHide")+" toggle"+e[1]+(e[2]?e[3]?" noFade":" fade":" noFade"))&&w(n,"class",o)},i:t,o:t,d(t){t&&p(n),c.d(),i=!1,a()}}}function Q(t,e,n){let{toggle:o}=e,{tabposition:r}=e,{fade:i}=e,{hovering:a}=e,{doToggle:s}=e;return t.$$set=t=>{"toggle"in t&&n(0,o=t.toggle),"tabposition"in t&&n(1,r=t.tabposition),"fade"in t&&n(2,i=t.fade),"hovering"in t&&n(3,a=t.hovering),"doToggle"in t&&n(4,s=t.doToggle)},[o,r,i,a,s]}class Z extends U{constructor(t){super(),J(this,{target:this.shadowRoot,props:v(this.attributes),customElement:!0},Q,K,i,{toggle:0,tabposition:1,fade:2,hovering:3,doToggle:4}),t&&(t.target&&u(t.target,this,t.anchor),t.props&&(this.$set(t.props),L()))}static get observedAttributes(){return["toggle","tabposition","fade","hovering","doToggle"]}get toggle(){return this.$$.ctx[0]}set toggle(t){this.$set({toggle:t}),L()}get tabposition(){return this.$$.ctx[1]}set tabposition(t){this.$set({tabposition:t}),L()}get fade(){return this.$$.ctx[2]}set fade(t){this.$set({fade:t}),L()}get hovering(){return this.$$.ctx[3]}set hovering(t){this.$set({hovering:t}),L()}get doToggle(){return this.$$.ctx[4]}set doToggle(t){this.$set({doToggle:t}),L()}}function tt(e){let n,o,i;return{c(){n=h("button"),n.textContent="Reset",this.c=t,w(n,"class","reset")},m(t,a){u(t,n,a),o||(i=x(n,"mouseup",(function(){r(e[0])&&e[0].apply(this,arguments)})),o=!0)},p(t,[n]){e=t},i:t,o:t,d(t){t&&p(n),o=!1,i()}}}function et(t,e,n){let{reset:o}=e;return t.$$set=t=>{"reset"in t&&n(0,o=t.reset)},[o]}customElements.define("svelte-object-explorer-tab-button",Z);class nt extends U{constructor(t){super(),J(this,{target:this.shadowRoot,props:v(this.attributes),customElement:!0},et,tt,i,{reset:0}),t&&(t.target&&u(t.target,this,t.anchor),t.props&&(this.$set(t.props),L()))}static get observedAttributes(){return["reset"]}get reset(){return this.$$.ctx[0]}set reset(t){this.$set({reset:t}),L()}}function ot(t){let e,n,o;return{c(){e=h("button"),e.textContent="Pause",w(e,"class","pause")},m(i,a){u(i,e,a),n||(o=x(e,"mouseup",(function(){r(t[1])&&t[1].apply(this,arguments)})),n=!0)},p(e,n){t=e},d(t){t&&p(e),n=!1,o()}}}function rt(t){let e,n,o;return{c(){e=h("button"),e.textContent="un-Pause",w(e,"class","pause")},m(i,a){u(i,e,a),n||(o=x(e,"mouseup",(function(){r(t[2])&&t[2].apply(this,arguments)})),n=!0)},p(e,n){t=e},d(t){t&&p(e),n=!1,o()}}}function it(e){let n;function o(t,e){return t[0]?rt:ot}let r=o(e),i=r(e);return{c(){i.c(),n=m(),this.c=t},m(t,e){i.m(t,e),u(t,n,e)},p(t,[e]){r===(r=o(t))&&i?i.p(t,e):(i.d(1),i=r(t),i&&(i.c(),i.m(n.parentNode,n)))},i:t,o:t,d(t){i.d(t),t&&p(n)}}}function at(t,e,n){let{isPaused:o}=e,{pause:r}=e,{unpause:i}=e;return t.$$set=t=>{"isPaused"in t&&n(0,o=t.isPaused),"pause"in t&&n(1,r=t.pause),"unpause"in t&&n(2,i=t.unpause)},[o,r,i]}customElements.define("svelte-object-explorer-reset-button",nt);class st extends U{constructor(t){super(),J(this,{target:this.shadowRoot,props:v(this.attributes),customElement:!0},at,it,i,{isPaused:0,pause:1,unpause:2}),t&&(t.target&&u(t.target,this,t.anchor),t.props&&(this.$set(t.props),L()))}static get observedAttributes(){return["isPaused","pause","unpause"]}get isPaused(){return this.$$.ctx[0]}set isPaused(t){this.$set({isPaused:t}),L()}get pause(){return this.$$.ctx[1]}set pause(t){this.$set({pause:t}),L()}get unpause(){return this.$$.ctx[2]}set unpause(t){this.$set({unpause:t}),L()}}function lt(t){let e,n,o,r,i,a,s,l,d,m,x,v,$,y=t[0].dataChanges+"",k=t[0].viewChanges+"",_=t[0].formatted+"",R=t[1]!==t[2]&&ct(t);return{c(){e=g("Data Changes("),n=h("span"),o=g(y),r=g(") View Changes("),i=h("span"),a=g(k),s=g(") "),R&&R.c(),l=f(),d=h("br"),m=g("\n    Last Updated("),x=h("span"),v=g(_),$=g(")"),w(n,"class","cache_data"),w(i,"class","cache_view"),w(x,"class","cache_last")},m(t,p){u(t,e,p),u(t,n,p),c(n,o),u(t,r,p),u(t,i,p),c(i,a),u(t,s,p),R&&R.m(t,p),u(t,l,p),u(t,d,p),u(t,m,p),u(t,x,p),c(x,v),u(t,$,p)},p(t,e){1&e&&y!==(y=t[0].dataChanges+"")&&b(o,y),1&e&&k!==(k=t[0].viewChanges+"")&&b(a,k),t[1]!==t[2]?R?R.p(t,e):(R=ct(t),R.c(),R.m(l.parentNode,l)):R&&(R.d(1),R=null),1&e&&_!==(_=t[0].formatted+"")&&b(v,_)},d(t){t&&p(e),t&&p(n),t&&p(r),t&&p(i),t&&p(s),R&&R.d(t),t&&p(l),t&&p(d),t&&p(m),t&&p(x),t&&p($)}}}function ct(t){let e,n,o,r;return{c(){e=g("Rate Limited: "),n=h("span"),o=g(t[1]),r=g("ms"),w(n,"class","cache_ratelimit")},m(t,i){u(t,e,i),u(t,n,i),c(n,o),u(t,r,i)},p(t,e){2&e&&b(o,t[1])},d(t){t&&p(e),t&&p(n),t&&p(r)}}}function ut(e){let n,o=e[0]&&e[0].dataChanges&&e[0].viewChanges&&e[0].formatted&&lt(e);return{c(){o&&o.c(),n=m(),this.c=t},m(t,e){o&&o.m(t,e),u(t,n,e)},p(t,[e]){t[0]&&t[0].dataChanges&&t[0].viewChanges&&t[0].formatted?o?o.p(t,e):(o=lt(t),o.c(),o.m(n.parentNode,n)):o&&(o.d(1),o=null)},i:t,o:t,d(t){o&&o.d(t),t&&p(n)}}}function pt(t,e,n){let{cache:o}=e,{ratelimit:r}=e,{ratelimitDefault:i}=e;return t.$$set=t=>{"cache"in t&&n(0,o=t.cache),"ratelimit"in t&&n(1,r=t.ratelimit),"ratelimitDefault"in t&&n(2,i=t.ratelimitDefault)},[o,r,i]}customElements.define("svelte-object-explorer-pause-button",st);class dt extends U{constructor(t){super(),J(this,{target:this.shadowRoot,props:v(this.attributes),customElement:!0},pt,ut,i,{cache:0,ratelimit:1,ratelimitDefault:2}),t&&(t.target&&u(t.target,this,t.anchor),t.props&&(this.$set(t.props),L()))}static get observedAttributes(){return["cache","ratelimit","ratelimitDefault"]}get cache(){return this.$$.ctx[0]}set cache(t){this.$set({cache:t}),L()}get ratelimit(){return this.$$.ctx[1]}set ratelimit(t){this.$set({ratelimit:t}),L()}get ratelimitDefault(){return this.$$.ctx[2]}set ratelimitDefault(t){this.$set({ratelimitDefault:t}),L()}}function ht(t){let e,n=t[0].expandable&&gt(t);return{c(){n&&n.c(),e=m()},m(t,o){n&&n.m(t,o),u(t,e,o)},p(t,o){t[0].expandable?n?n.p(t,o):(n=gt(t),n.c(),n.m(e.parentNode,e)):n&&(n.d(1),n=null)},d(t){n&&n.d(t),t&&p(e)}}}function gt(t){let e,n;function o(t,n){return(null==e||3&n)&&(e=!!t[1].includes(t[0].indexRef)),e?mt:ft}let r=o(t,-1),i=r(t);return{c(){i.c(),n=m()},m(t,e){i.m(t,e),u(t,n,e)},p(t,e){r===(r=o(t,e))&&i?i.p(t,e):(i.d(1),i=r(t),i&&(i.c(),i.m(n.parentNode,n)))},d(t){i.d(t),t&&p(n)}}}function ft(e){let n,o,r,i=W+"";return{c(){n=h("span"),w(n,"class","smallest dataArrow")},m(t,a){u(t,n,a),n.innerHTML=i,o||(r=x(n,"mousedown",e[5]),o=!0)},p:t,d(t){t&&p(n),o=!1,r()}}}function mt(e){let n,o,r,i=V+"";return{c(){n=h("span"),w(n,"class","smallest white dataArrow")},m(t,a){u(t,n,a),n.innerHTML=i,o||(r=x(n,"mousedown",e[4]),o=!0)},p:t,d(t){t&&p(n),o=!1,r()}}}function xt(e){let n,o=e[0]&&ht(e);return{c(){o&&o.c(),n=m(),this.c=t},m(t,e){o&&o.m(t,e),u(t,n,e)},p(t,[e]){t[0]?o?o.p(t,e):(o=ht(t),o.c(),o.m(n.parentNode,n)):o&&(o.d(1),o=null)},i:t,o:t,d(t){o&&o.d(t),t&&p(n)}}}function wt(t,e,n){let{row:o}=e,{rowsToShow:r}=e,{rowContract:i}=e,{rowExpand:a}=e;return t.$$set=t=>{"row"in t&&n(0,o=t.row),"rowsToShow"in t&&n(1,r=t.rowsToShow),"rowContract"in t&&n(2,i=t.rowContract),"rowExpand"in t&&n(3,a=t.rowExpand)},[o,r,i,a,()=>i(o.indexRef),()=>a(o.indexRef)]}customElements.define("svelte-object-explorer-cache-display",dt);class bt extends U{constructor(t){super(),J(this,{target:this.shadowRoot,props:v(this.attributes),customElement:!0},wt,xt,i,{row:0,rowsToShow:1,rowContract:2,rowExpand:3}),t&&(t.target&&u(t.target,this,t.anchor),t.props&&(this.$set(t.props),L()))}static get observedAttributes(){return["row","rowsToShow","rowContract","rowExpand"]}get row(){return this.$$.ctx[0]}set row(t){this.$set({row:t}),L()}get rowsToShow(){return this.$$.ctx[1]}set rowsToShow(t){this.$set({rowsToShow:t}),L()}get rowContract(){return this.$$.ctx[2]}set rowContract(t){this.$set({rowContract:t}),L()}get rowExpand(){return this.$$.ctx[3]}set rowExpand(t){this.$set({rowExpand:t}),L()}}function vt(t){let e;function n(t,e){return"Tag"===t[0].type?yt:$t}let o=n(t),r=o(t);return{c(){r.c(),e=m()},m(t,n){r.m(t,n),u(t,e,n)},p(t,i){o===(o=n(t))&&r?r.p(t,i):(r.d(1),r=o(t),r&&(r.c(),r.m(e.parentNode,e)))},d(t){r.d(t),t&&p(e)}}}function $t(t){let e,n,o;function r(t,e){return t[1]?_t:kt}let i=r(t),a=i(t),s=t[0].type&&"ARRAY+OBJECT"!==t[0].type&&"ARRAY+SUB_ARRAY"!==t[0].type&&Tt(t),l=t[0].len&&Nt(t);return{c(){e=h("span"),a.c(),n=f(),s&&s.c(),o=f(),l&&l.c()},m(t,r){u(t,e,r),a.m(e,null),c(e,n),s&&s.m(e,null),c(e,o),l&&l.m(e,null)},p(t,c){i===(i=r(t))&&a?a.p(t,c):(a.d(1),a=i(t),a&&(a.c(),a.m(e,n))),t[0].type&&"ARRAY+OBJECT"!==t[0].type&&"ARRAY+SUB_ARRAY"!==t[0].type?s?s.p(t,c):(s=Tt(t),s.c(),s.m(e,o)):s&&(s.d(1),s=null),t[0].len?l?l.p(t,c):(l=Nt(t),l.c(),l.m(e,null)):l&&(l.d(1),l=null)},d(t){t&&p(e),a.d(),s&&s.d(),l&&l.d()}}}function yt(t){let e,n=t[0].tag+"";return{c(){e=g(n)},m(t,n){u(t,e,n)},p(t,o){1&o&&n!==(n=t[0].tag+"")&&b(e,n)},d(t){t&&p(e)}}}function kt(t){let e,n,o,r,i,a=" ".repeat(t[0].indent)+"",s=t[0].val+"",l="key"in t[0]&&""!==t[0].key&&Rt(t),d="string"===t[0].type&&Et(),x=t[0].is_last_multiline&&(!t[0].type||"string"===t[0].type)&&Ct();return{c(){e=g(a),l&&l.c(),n=f(),d&&d.c(),o=h("span"),r=g(s),x&&x.c(),i=m(),w(o,"class","val")},m(t,a){u(t,e,a),l&&l.m(t,a),u(t,n,a),d&&d.m(t,a),u(t,o,a),c(o,r),x&&x.m(t,a),u(t,i,a)},p(t,c){1&c&&a!==(a=" ".repeat(t[0].indent)+"")&&b(e,a),"key"in t[0]&&""!==t[0].key?l?l.p(t,c):(l=Rt(t),l.c(),l.m(n.parentNode,n)):l&&(l.d(1),l=null),"string"===t[0].type?d||(d=Et(),d.c(),d.m(o.parentNode,o)):d&&(d.d(1),d=null),1&c&&s!==(s=t[0].val+"")&&b(r,s),!t[0].is_last_multiline||t[0].type&&"string"!==t[0].type?x&&(x.d(1),x=null):x||(x=Ct(),x.c(),x.m(i.parentNode,i))},d(t){t&&p(e),l&&l.d(t),t&&p(n),d&&d.d(t),t&&p(o),x&&x.d(t),t&&p(i)}}}function _t(t){let e,n,o,r,i=" ".repeat(t[0].indent)+"",a=t[0].val.substring(0,t[0].val.length-t[0].bracket)+"",s="key"in t[0]&&""!==t[0].key&&At(t);return{c(){e=g(i),s&&s.c(),n=f(),o=h("span"),r=g(a),w(o,"class","val")},m(t,i){u(t,e,i),s&&s.m(t,i),u(t,n,i),u(t,o,i),c(o,r)},p(t,o){1&o&&i!==(i=" ".repeat(t[0].indent)+"")&&b(e,i),"key"in t[0]&&""!==t[0].key?s?s.p(t,o):(s=At(t),s.c(),s.m(n.parentNode,n)):s&&(s.d(1),s=null),1&o&&a!==(a=t[0].val.substring(0,t[0].val.length-t[0].bracket)+"")&&b(r,a)},d(t){t&&p(e),s&&s.d(t),t&&p(n),t&&p(o)}}}function Rt(t){let e,n,o,r=t[0].key+"";return{c(){e=h("span"),n=g(r),o=g(":"),w(e,"class","key")},m(t,r){u(t,e,r),c(e,n),u(t,o,r)},p(t,e){1&e&&r!==(r=t[0].key+"")&&b(n,r)},d(t){t&&p(e),t&&p(o)}}}function Et(t){let e;return{c(){e=h("span"),e.textContent='"',w(e,"class","white")},m(t,n){u(t,e,n)},d(t){t&&p(e)}}}function Ct(t){let e;return{c(){e=h("span"),e.textContent='"',w(e,"class","white")},m(t,n){u(t,e,n)},d(t){t&&p(e)}}}function At(t){let e,n,o,r=t[0].key+"";return{c(){e=h("span"),n=g(r),o=g(":"),w(e,"class","key")},m(t,r){u(t,e,r),c(e,n),u(t,o,r)},p(t,e){1&e&&r!==(r=t[0].key+"")&&b(n,r)},d(t){t&&p(e),t&&p(o)}}}function Tt(t){let e,n,o=t[0].type+"";return{c(){e=h("span"),n=g(o),w(e,"class","type")},m(t,o){u(t,e,o),c(e,n)},p(t,e){1&e&&o!==(o=t[0].type+"")&&b(n,o)},d(t){t&&p(e)}}}function Nt(t){let e,n,o,r,i,a=t[0].len+"";return{c(){e=h("span"),n=g("("),o=g(a),r=g(")"),w(e,"class",i="len"+(t[1]?" grey":""))},m(t,i){u(t,e,i),c(e,n),c(e,o),c(e,r)},p(t,n){1&n&&a!==(a=t[0].len+"")&&b(o,a),2&n&&i!==(i="len"+(t[1]?" grey":""))&&w(e,"class",i)},d(t){t&&p(e)}}}function St(e){let n,o=e[0]&&vt(e);return{c(){o&&o.c(),n=m(),this.c=t},m(t,e){o&&o.m(t,e),u(t,n,e)},p(t,[e]){t[0]?o?o.p(t,e):(o=vt(t),o.c(),o.m(n.parentNode,n)):o&&(o.d(1),o=null)},i:t,o:t,d(t){o&&o.d(t),t&&p(n)}}}function Lt(t,e,n){let{row:o}=e,{isExpanded:r=!1}=e;return t.$$set=t=>{"row"in t&&n(0,o=t.row),"isExpanded"in t&&n(1,r=t.isExpanded)},[o,r]}customElements.define("svelte-object-explorer-chevron-buttons",bt);class Mt extends U{constructor(t){super(),J(this,{target:this.shadowRoot,props:v(this.attributes),customElement:!0},Lt,St,i,{row:0,isExpanded:1}),t&&(t.target&&u(t.target,this,t.anchor),t.props&&(this.$set(t.props),L()))}static get observedAttributes(){return["row","isExpanded"]}get row(){return this.$$.ctx[0]}set row(t){this.$set({row:t}),L()}get isExpanded(){return this.$$.ctx[1]}set isExpanded(t){this.$set({isExpanded:t}),L()}}customElements.define("svelte-object-explorer-row-text",Mt);var jt={domParser:function(t){function e(t){if(t&&t.nodeName&&"SCRIPT"!==t.nodeName&&"SVELTE-OBJECT-EXPLORER"!==t.nodeName&&(!t.className||t.className&&!t.className.includes("svelte-object-explorer-wrapper "))){const e="#text"===t.nodeName?t.nodeValue:"",r=n(t)?t.dataset.svelteExplorerTag:t.nodeName;return e||{class:t.className,"svelte-explorer-tag":r,children:n(t)&&"#if"!==r.substring(0,3)&&"#each"!==r.substring(0,5)&&"#await"!==r.substring(0,6)?[]:o(t),textContent:e}}return null}function n(t){return t.dataset&&t.dataset.svelteExplorerTag}function o(t){return[...t.childNodes].map(e).filter((t=>null!==t))}return e(t||document.body)}};function Ht(t,e){const n=function(t,e,n){return e||o(t);function o(t){return null===t?"null":r(t)}function r(t){return"object"==typeof t?i(t):typeof t}function i(t){return Array.isArray(t)?a(t):s(t)}function a(t){return t.length>10?"ARRAY+":"array"}function s(t){const e=["class","svelte-explorer-tag","children","textContent"];return l(t,["start","end","sub_array"])?"ARRAY+OBJECT":l(t,e)?"HTML":c(t)?"Node":"object"}function l(t,e){return e.filter((e=>e in t)).length===e.length}function c(t){return"object"==typeof Node?t instanceof Node:t&&"object"==typeof t&&"number"==typeof t.nodeType&&"string"==typeof t.nodeName}}(t.val,t.type,t.key),o={...t,type:n},r={object:Ut,array:Pt,"ARRAY+":Dt,"ARRAY+OBJECT":Ot,"ARRAY+SUB_ARRAY":zt,symbol:Yt,function:Bt,HTML:Ft,Node:It};["string","number","boolean","null","undefined"].includes(n)&&function(t,e){const{key:n,val:o,level:r,...i}=t;o&&""+o.length>38-2*r?function(t,e){const{key:n,val:o,level:r}=t,i=(""+n).length,a=new RegExp("[^]{1,"+(38-i-2*r)+"}","gi"),s=(""+o).match(a),l=(t,e)=>e?"":t.type;let c=t;const u=(t,o,a)=>{const s=o?"":n,u=o?i+r+3:r+1;c={...c,key:s,val:t,indent:u,is_last_multiline:o===a.length-1,type:l(c,o)},e.push(c,e)};s.map(u)}(t,e):e.push({...i,key:n,val:o,indent:2*r,is_last_multiline:!0})}(o,e),n in r&&r[n](o,e)}function Ut(t,e){const n=Object.entries(t.val);e.push(Vt(t,n.length,"{}","object")),n.forEach((([n,o],r)=>Ht(qt(t,n,o,r),e))),e.push(Wt(t,"{}"))}function Pt(t,e){let n=t.val;e.push(Vt(t,n.length,"[]",t.type));for(let o=0;o<n.length;o++)Ht(qt(t,o,n[o],o),e);e.push(Wt(t,"[]"))}function Dt(t,e){const n=Jt(t.val);Ot({...t,val:n},e)}function Ot(t,e){const n=t.val;e.push(Vt(t,n.end+1,"[]",t.type)),zt(qt(t,"long arrays are chunked",n.sub_array,1),e,n.start),e.push(Wt(t,"[]"))}function zt(t,e,n){let o=t.val;for(let i=0;i<o.length;i++){const a=r(o[i],n+i),s=o[i],l=t.indexRef+"."+i;Ht({...t,key:a,val:s,indexRef:l},e)}function r(t,e){return void 0!==t&&void 0!==t.start?"{"+t.start+".."+t.end+"}":e}}function Bt(t,e){const{key:n,val:o,level:r,...i}=t,a=(""+o).split("\n"),s=a[0]&&"f"===a[0].substring(0,1)?"function":"arrow fn";e.push(Vt(t,a.length,"{}",s));for(let n=0;n<a.length;n++){const o=a[n].trim();o.length&&Ht(qt(t,n,o,n),e)}e.push(Wt(t,"{}"))}function Yt(t,e){const{key:n,val:o,level:r}=t;let i=o.toString();"Symbol()"!==i&&(i=`Symbol('${i.substring(7,i.length-1)}')`),e.push({...t,key:n,val:i,indent:2*r})}function It(t,e){const n=jt.domParser(t.val);Ft({...t,val:n},e)}function Ft(t,e){const{key:n,val:o,level:r,...i}=t,a=t.val.textContent,s=t.val.children,l=t.val["svelte-explorer-tag"].toLowerCase(),c=["#","/",":"].includes(l[0]),u="<"+l,p=c?">":"</"+l+">",d=c?u+p:u+">"+p,h=a.length?1:0;if(s.length||h)e.push(Vt(t,s.length,d,"HTML",p.length)),h&&Ht(qt(t,"",a,0),e),s.map(((n,o)=>Ht(qt(t,o+h,n,o+h),e))),e.push(Wt(t,d,p.length));else{const t=2*r;e.push({...i,key:n,val:d,indent:t})}}function Jt(t=[],e={}){const n={recurrence_count:0,recurrence_max:4,array_length_max:10,...e},o=n.recurrence_count,r=n.array_length_max,i=n.recurrence_max,a=function(t){return Array.isArray(t)?{start:0,end:t.length-1,sub_array:t}:t}(t);return a.sub_array.length>r?function(t,e,o){return t.length>r&&o<i?(e.sub_array=t,Jt(e,{...n,recurrence_count:o+1})):(e.sub_array=t,e)}(function(t){let e=[];for(let n=0;n<t.sub_array.length;n+=r){const o=s(t,n),r=l(n,o,t.sub_array.slice(n,o+1));e.push(r),e=c(e)}return e}(a),a,o):t;function s(t,e){let n=e+r-1,o=t.sub_array.length-1;return n>o&&(n=o),n}function l(t,e,n){const o=n[0],r=n[n.length-1],i=void 0!==o.start&&void 0!==r.end;return{start:i?n[0].start:t,end:i?n[n.length-1].end:e,sub_array:n}}function c(t){let e=t[t.length-1],n=1===e.sub_array.length,o=e.sub_array[0].start,r=e.sub_array[0].end;return n&&o===e.start&&r===e.end&&(t[t.length-1]=t[t.length-1].sub_array[0]),t}}function Vt(t,e,n,o,r=1){return{...t,val:n,indent:2*t.level,type:o,bracket:r,expandable:!0,len:e}}function Wt(t,e,n=1){const o=e.substring(e.length-n,e.length);return{...t,key:"",val:o,indent:2*t.level,type:"",bracket:n}}function qt(t,e,n,o){return{indexRef:t.indexRef+"."+o,parentIndexRef:t.indexRef,index:o,key:e,val:n,level:t.level+1}}function Xt(t,e){var n=t.key.toUpperCase(),o=e.key.toUpperCase();return n<o?-1:n>o?1:0}var Gt={transform_data:function(t){let e=[],n={key:"Svelte Object Explorer",val:t.value,class:"",valType:""};return n.childRows=function({key:t,val:e}){let n=[];return Ht({indexRef:"0.0",parentIndexRef:"0",key:t,val:e,level:0},n),n}(n),e.push(n),e.sort(Xt),e=e.map(((t,e)=>({...t,index:e}))),e},getOpenIndex:function(t,e){let n=null;if(open&&t&&t[0]&&t[0].childRows){t[0].childRows.map((t=>{e===t.key&&t.expandable&&(n=t.indexRef)}))}return n},formatDate:function(t){return t.toDateString()+" "+t.getUTCHours()+":"+t.getUTCMinutes()+":"+t.getUTCSeconds()+":"+t.getUTCMilliseconds()}};function Kt(t,e,n){const o=t.slice();return o[30]=e[n],o[32]=n,o}function Qt(t,e,n){const o=t.slice();return o[33]=e[n],o}function Zt(t){let e,n,r,i,a,s,l,g,f;n=new nt({props:{reset:t[15]}}),r=new st({props:{isPaused:t[4],pause:t[14],unpause:t[13]}}),i=new dt({props:{cache:t[9],ratelimit:t[0],ratelimitDefault:re}});let m=t[8],b=[];for(let e=0;e<m.length;e+=1)b[e]=ne(Kt(t,m,e));const v=t=>z(b[t],1,1,(()=>{b[t]=null}));return{c(){e=h("div"),B(n.$$.fragment),B(r.$$.fragment),B(i.$$.fragment),a=h("table");for(let t=0;t<b.length;t+=1)b[t].c();w(e,"id","svelteObjectExplorer"),w(e,"class",s="tree"+(t[3]?"":" tree-hide")+(t[2]?t[5]?" noFade":" fade":" noFade"))},m(o,s){u(o,e,s),Y(n,e,null),Y(r,e,null),Y(i,e,null),c(e,a);for(let t=0;t<b.length;t+=1)b[t].m(a,null);l=!0,g||(f=[x(e,"mouseover",t[23]),x(e,"mouseleave",t[24])],g=!0)},p(t,n){const o={};16&n[0]&&(o.isPaused=t[4]),r.$set(o);const c={};if(512&n[0]&&(c.cache=t[9]),1&n[0]&&(c.ratelimit=t[0]),i.$set(c),6592&n[0]){let e;for(m=t[8],e=0;e<m.length;e+=1){const o=Kt(t,m,e);b[e]?(b[e].p(o,n),O(b[e],1)):(b[e]=ne(o),b[e].c(),O(b[e],1),b[e].m(a,null))}for(P(),e=m.length;e<b.length;e+=1)v(e);D()}(!l||44&n[0]&&s!==(s="tree"+(t[3]?"":" tree-hide")+(t[2]?t[5]?" noFade":" fade":" noFade")))&&w(e,"class",s)},i(t){if(!l){O(n.$$.fragment,t),O(r.$$.fragment,t),O(i.$$.fragment,t);for(let t=0;t<m.length;t+=1)O(b[t]);l=!0}},o(t){z(n.$$.fragment,t),z(r.$$.fragment,t),z(i.$$.fragment,t),b=b.filter(Boolean);for(let t=0;t<b.length;t+=1)z(b[t]);l=!1},d(t){t&&p(e),I(n),I(r),I(i),d(b,t),g=!1,o(f)}}}function te(t){let e,n,r,i,a,s,l;function c(){return t[20](t[33])}function d(){return t[21](t[33],t[30])}return n=new Mt({props:{row:t[33],isExpanded:t[33].expandable&&t[6].includes(t[33].indexRef)}}),r=new bt({props:{row:t[33],rowsToShow:t[6],rowContract:t[11],rowExpand:t[12]}}),{c(){e=h("div"),B(n.$$.fragment),B(r.$$.fragment),w(e,"class",i=t[7]===t[33].indexRef||t[33].parentIndexRef.startsWith(t[7])?"row hoverRow":"row")},m(t,o){u(t,e,o),Y(n,e,null),Y(r,e,null),a=!0,s||(l=[x(e,"mouseover",c),x(e,"mousedown",d)],s=!0)},p(o,s){t=o;const l={};256&s[0]&&(l.row=t[33]),320&s[0]&&(l.isExpanded=t[33].expandable&&t[6].includes(t[33].indexRef)),n.$set(l);const c={};256&s[0]&&(c.row=t[33]),64&s[0]&&(c.rowsToShow=t[6]),r.$set(c),(!a||384&s[0]&&i!==(i=t[7]===t[33].indexRef||t[33].parentIndexRef.startsWith(t[7])?"row hoverRow":"row"))&&w(e,"class",i)},i(t){a||(O(n.$$.fragment,t),O(r.$$.fragment,t),a=!0)},o(t){z(n.$$.fragment,t),z(r.$$.fragment,t),a=!1},d(t){t&&p(e),I(n),I(r),s=!1,o(l)}}}function ee(t){let e,n,o=t[6].includes(t[33].parentIndexRef)&&(!t[33].bracket||t[33].bracket&&(t[33].expandable||t[6].includes(t[33].indexRef))),r=o&&te(t);return{c(){r&&r.c(),e=m()},m(t,o){r&&r.m(t,o),u(t,e,o),n=!0},p(t,n){320&n[0]&&(o=t[6].includes(t[33].parentIndexRef)&&(!t[33].bracket||t[33].bracket&&(t[33].expandable||t[6].includes(t[33].indexRef)))),o?r?(r.p(t,n),320&n[0]&&O(r,1)):(r=te(t),r.c(),O(r,1),r.m(e.parentNode,e)):r&&(P(),z(r,1,1,(()=>{r=null})),D())},i(t){n||(O(r),n=!0)},o(t){z(r),n=!1},d(t){r&&r.d(t),t&&p(e)}}}function ne(t){let e,n,o,r,i,a,s,l=t[30].childRows,f=[];for(let e=0;e<l.length;e+=1)f[e]=ee(Qt(t,l,e));const m=t=>z(f[t],1,1,(()=>{f[t]=null}));return{c(){e=h("tr"),n=h("td"),o=h("pre");for(let t=0;t<f.length;t+=1)f[t].c();r=g("\n                              "),w(n,"class","treeVal"),w(e,"class","treeVal")},m(l,p){u(l,e,p),c(e,n),c(n,o);for(let t=0;t<f.length;t+=1)f[t].m(o,null);c(o,r),i=!0,a||(s=x(e,"mouseout",t[22]),a=!0)},p(t,e){if(6592&e[0]){let n;for(l=t[30].childRows,n=0;n<l.length;n+=1){const i=Qt(t,l,n);f[n]?(f[n].p(i,e),O(f[n],1)):(f[n]=ee(i),f[n].c(),O(f[n],1),f[n].m(o,r))}for(P(),n=l.length;n<f.length;n+=1)m(n);D()}},i(t){if(!i){for(let t=0;t<l.length;t+=1)O(f[t]);i=!0}},o(t){f=f.filter(Boolean);for(let t=0;t<f.length;t+=1)z(f[t]);i=!1},d(t){t&&p(e),d(f,t),a=!1,s()}}}function oe(e){let n,o,r,i;o=new Z({props:{toggle:e[3],tabposition:e[1],fade:e[2],hovering:e[5],doToggle:e[10]}});let a=e[3]&&Zt(e);return{c(){n=h("div"),B(o.$$.fragment),r=f(),a&&a.c(),this.c=t,w(n,"class","svelte-object-explorer-wrapper")},m(t,e){u(t,n,e),Y(o,n,null),c(n,r),a&&a.m(n,null),i=!0},p(t,e){const r={};8&e[0]&&(r.toggle=t[3]),2&e[0]&&(r.tabposition=t[1]),4&e[0]&&(r.fade=t[2]),32&e[0]&&(r.hovering=t[5]),o.$set(r),t[3]?a?(a.p(t,e),8&e[0]&&O(a,1)):(a=Zt(t),a.c(),O(a,1),a.m(n,null)):a&&(P(),z(a,1,1,(()=>{a=null})),D())},i(t){i||(O(o.$$.fragment,t),O(a),i=!0)},o(t){z(o.$$.fragment,t),z(a),i=!1},d(t){t&&p(n),I(o),a&&a.d()}}}let re=100;function ie(t,e,n){let o="",{value:r}=e,{tabposition:i="top"}=e,{open:a=null}=e,{fade:s=!1}=e,{ratelimit:l=re}=e,{initialtogglestate:c=!0}=e,u=!1,p=!1,d=!1,h=["0","0.0"],g=[],f="none",m=c,x=[],w={dataChanges:0,viewChanges:0,dataUpdated:new Date,viewUpdated:new Date,formatted:"",value:null};function b(t){n(19,h=h.filter((e=>e!==t))),h.push(t)}y((async()=>{n(6,g=h),setInterval((()=>{!function(){if(m){if(window&&window.svelteobjectexplorer){const t=window.svelteobjectexplorer;"value"in t&&n(16,r=t.value),"open"in t&&n(17,a=t.open),"fade"in t&&n(2,s=t.fade),"tabposition"in t&&n(1,i=t.tabposition),"ratelimit"in t&&n(0,l=t.ratelimit)}let t=r||jt.domParser();const e=JSON.stringify(t);if(e!==o&&(n(9,w.dataUpdated=new Date,w),n(9,w.dataChanges=w.dataChanges+1,w),o=e),w.dataUpdated-w.viewUpdated>l&&!u&&(n(9,w.value=t,w),n(9,w.viewChanges=w.viewChanges+1,w),n(9,w.viewUpdated=new Date,w),n(9,w.dataUpdated=w.viewUpdated,w),n(9,w.formatted=Gt.formatDate(w.viewUpdated),w),o=JSON.stringify(w.value),n(8,x=Gt.transform_data(w))),!d){let t=Gt.getOpenIndex(x,a);t&&(b(t),h.includes(t)&&(d=!0))}}}()}),l)}));return t.$$set=t=>{"value"in t&&n(16,r=t.value),"tabposition"in t&&n(1,i=t.tabposition),"open"in t&&n(17,a=t.open),"fade"in t&&n(2,s=t.fade),"ratelimit"in t&&n(0,l=t.ratelimit),"initialtogglestate"in t&&n(18,c=t.initialtogglestate)},t.$$.update=()=>{524296&t.$$.dirty[0]&&m&&n(6,g=h),1&t.$$.dirty[0]&&null===l&&n(0,l=re)},[l,i,s,m,u,p,g,f,x,w,function(){n(3,m=!m)},function(t){n(19,h=h.filter((e=>!e.startsWith(t))))},b,function(){n(4,u=!1)},function(){n(4,u=!0)},function(){n(9,w.viewChanges=1,w),n(9,w.dataChanges=1,w)},r,a,c,h,t=>n(7,f=t.indexRef),(t,e)=>console.log(t.indexRef,e.childRows,g),()=>n(7,f=null),()=>n(5,p=!0),()=>n(5,p=!1)]}class ae extends U{constructor(t){super(),this.shadowRoot.innerHTML='<style>.svelte-object-explorer-wrapper{position:fixed;top:0px;left:0px;width:100vw;height:100vh;padding:0px;margin:0px;z-index:100000000000000000 !important;pointer-events:none;font-family:"Roboto", "Arial", sans-serif !important}.fade{opacity:0.3 !important}.noFade{opacity:1 !important}.tree{pointer-events:all;transition:0.2s;position:fixed;right:0px;top:0px;width:500px;height:100vh;background-color:#aaa;z-index:10000000;overflow:auto;font-size:small;margin:0;font-size:14px;line-height:1.3em;-webkit-box-shadow:-4px 4px 10px 0px rgba(0, 0, 0, 0.15);-moz-box-shadow:-4px 4px 10px 0px rgba(0, 0, 0, 0.15);box-shadow:-4px 4px 10px 0px rgba(0, 0, 0, 0.15)}.tree-hide{right:-500px;transition:0.2s}.treeVal{min-height:10px;overflow-wrap:break-word;max-width:480px;overflow:auto;background-color:#666 !important;color:white}.toggle:hover{pointer-events:all;opacity:1}.toggle{pointer-events:all;cursor:pointer;position:fixed;width:70px;height:20px;text-align:center;transform:rotate(-90deg);background-color:#aaa;z-index:10000000;margin:0;font-size:14px;line-height:1.3em}.toggletop{top:25px}.togglemiddle{top:calc(50vh - 25px)}.togglebottom{bottom:25px}.toggleShow{pointer-events:all;transition:0.2s;right:475px}.toggleHide{pointer-events:all;transition:0.2s;right:-25px}.accordion{background-color:#666 !important;color:white}.icon1{width:15px;height:15px}.smaller{width:15px;height:15px;display:inline-block;position:relative;top:2px}.smallest{width:15px;height:15px;display:inline-block;position:relative;top:1px;left:0px !important;color:green}.link{cursor:pointer}.link:hover{background-color:#888}.row{background-color:#999;position:relative;padding-left:15px;display:block;white-space:pre;height:1.5em}.row:nth-child(even){background-color:#aaa}.dataArrow{position:absolute;left:0px;cursor:pointer}.dataArrow:hover{color:black}.len{color:black;position:absolute;right:70px;top:0px}.type{color:green;position:absolute;top:0px;right:5px}.nopointer{cursor:pointer;user-select:none}.hoverRow{background-color:#68f !important}.toggleShowAll,.copyToClipbord{display:inline}.reset{position:absolute;top:3px;right:50px}button.pause{position:absolute;top:3px;right:3px}.smallest{width:15px;height:15px;display:inline-block;position:relative;top:1px;left:0px !important;color:green}.dataArrow{position:absolute;left:0px;cursor:pointer}.dataArrow:hover{color:black}.white{color:white}.len{color:black;position:absolute;right:70px;top:0px}.type{color:green;position:absolute;top:0px;right:5px}.grey{color:#666}.white{color:white}.val{color:black}.svelte-object-explorer-wrapper{position:fixed;top:0px;left:0px;width:100vw;height:100vh;padding:0px;margin:0px;z-index:100000000000000000 !important;pointer-events:none;font-family:"Roboto", "Arial", sans-serif !important}.fade{opacity:0.3 !important}.noFade{opacity:1 !important}.tree{pointer-events:all;transition:0.2s;position:fixed;right:0px;top:0px;width:500px;height:100vh;background-color:#aaa;z-index:10000000;overflow:auto;font-size:small;margin:0;font-size:14px;line-height:1.3em;-webkit-box-shadow:-4px 4px 10px 0px rgba(0, 0, 0, 0.15);-moz-box-shadow:-4px 4px 10px 0px rgba(0, 0, 0, 0.15);box-shadow:-4px 4px 10px 0px rgba(0, 0, 0, 0.15)}.tree-hide{right:-500px;transition:0.2s}.tree table{table-layout:fixed;width:480px}.tree tr:nth-child(odd){background-color:#ccc}.treeVal{min-height:10px;overflow-wrap:break-word;max-width:480px;overflow:auto;background-color:#666 !important;color:white}pre{margin:0px;white-space:normal;padding:0px}.row{background-color:#999;position:relative;padding-left:15px;display:block;white-space:pre;height:1.5em}.row:nth-child(even){background-color:#aaa}.hoverRow{background-color:#68f !important}<style>',J(this,{target:this.shadowRoot,props:v(this.attributes),customElement:!0},ie,oe,i,{value:16,tabposition:1,open:17,fade:2,ratelimit:0,initialtogglestate:18},[-1,-1]),t&&(t.target&&u(t.target,this,t.anchor),t.props&&(this.$set(t.props),L()))}static get observedAttributes(){return["value","tabposition","open","fade","ratelimit","initialtogglestate"]}get value(){return this.$$.ctx[16]}set value(t){this.$set({value:t}),L()}get tabposition(){return this.$$.ctx[1]}set tabposition(t){this.$set({tabposition:t}),L()}get open(){return this.$$.ctx[17]}set open(t){this.$set({open:t}),L()}get fade(){return this.$$.ctx[2]}set fade(t){this.$set({fade:t}),L()}get ratelimit(){return this.$$.ctx[0]}set ratelimit(t){this.$set({ratelimit:t}),L()}get initialtogglestate(){return this.$$.ctx[18]}set initialtogglestate(t){this.$set({initialtogglestate:t}),L()}}customElements.define("svelte-object-explorer",ae);return new ae({target:document.body})}();
//# sourceMappingURL=index.js.map
