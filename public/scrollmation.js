var app=function(t){"use strict";function e(){}const o=t=>t;function n(t,e){for(const o in e)t[o]=e[o];return t}function r(t){return t()}function s(){return Object.create(null)}function i(t){t.forEach(r)}function c(t){return"function"==typeof t}function l(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}const a="undefined"!=typeof window;let u=a?()=>window.performance.now():()=>Date.now(),p=a?t=>requestAnimationFrame(t):e;const d=new Set;function f(t){d.forEach(e=>{e.c(t)||(d.delete(e),e.f())}),0!==d.size&&p(f)}function h(t,e){t.appendChild(e)}function m(t,e,o){t.insertBefore(e,o||null)}function $(t){t.parentNode.removeChild(t)}function g(t){return document.createElement(t)}function b(){return t=" ",document.createTextNode(t);var t}function x(t,e,o,n){return t.addEventListener(e,o,n),()=>t.removeEventListener(e,o,n)}function y(t,e,o){null==o?t.removeAttribute(e):t.getAttribute(e)!==o&&t.setAttribute(e,o)}function P(t,e,o,n){t.style.setProperty(e,o,n?"important":"")}let w,v;function E(){if(void 0===w){w=!1;try{"undefined"!=typeof window&&window.parent&&window.parent.document}catch(t){w=!0}}return w}function S(t,e){const o=getComputedStyle(t),n=(parseInt(o.zIndex)||0)-1;"static"===o.position&&(t.style.position="relative");const r=g("iframe");r.setAttribute("style",`display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${n};`),r.setAttribute("aria-hidden","true"),r.tabIndex=-1;const s=E();let i;return s?(r.src="data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}<\/script>",i=x(window,"message",t=>{t.source===r.contentWindow&&e()})):(r.src="about:blank",r.onload=()=>{i=x(r.contentWindow,"resize",e)}),h(t,r),()=>{(s||i&&r.contentWindow)&&i(),$(r)}}function k(t){v=t}function j(){if(!v)throw new Error("Function called outside component initialization");return v}function _(){const t=j();return(e,o)=>{const n=t.$$.callbacks[e];if(n){const r=function(t,e){const o=document.createEvent("CustomEvent");return o.initCustomEvent(t,!1,!1,e),o}(e,o);n.slice().forEach(e=>{e.call(t,r)})}}}const T=[],A=[],C=[],I=[],H=Promise.resolve();let R=!1;function z(t){C.push(t)}let O=!1;const D=new Set;function L(){if(!O){O=!0;do{for(let t=0;t<T.length;t+=1){const e=T[t];k(e),M(e.$$)}for(T.length=0;A.length;)A.pop()();for(let t=0;t<C.length;t+=1){const e=C[t];D.has(e)||(D.add(e),e())}C.length=0}while(T.length);for(;I.length;)I.pop()();R=!1,O=!1,D.clear()}}function M(t){if(null!==t.fragment){t.update(),i(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(z)}}const N=new Set;function W(t,e){-1===t.$$.dirty[0]&&(T.push(t),R||(R=!0,H.then(L)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function q(t,o,n,l,a,u,p=[-1]){const d=v;k(t);const f=o.props||{},h=t.$$={fragment:null,ctx:null,props:u,update:e,not_equal:a,bound:s(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(d?d.$$.context:[]),callbacks:s(),dirty:p,skip_bound:!1};let m=!1;if(h.ctx=n?n(t,f,(e,o,...n)=>{const r=n.length?n[0]:o;return h.ctx&&a(h.ctx[e],h.ctx[e]=r)&&(!h.skip_bound&&h.bound[e]&&h.bound[e](r),m&&W(t,e)),o}):[],h.update(),m=!0,i(h.before_update),h.fragment=!!l&&l(h.ctx),o.target){if(o.hydrate){const t=function(t){return Array.from(t.childNodes)}(o.target);h.fragment&&h.fragment.l(t),t.forEach($)}else h.fragment&&h.fragment.c();o.intro&&((g=t.$$.fragment)&&g.i&&(N.delete(g),g.i(b))),function(t,e,o){const{fragment:n,on_mount:s,on_destroy:l,after_update:a}=t.$$;n&&n.m(e,o),z(()=>{const e=s.map(r).filter(c);l?l.push(...e):i(e),t.$$.on_mount=[]}),a.forEach(z)}(t,o.target,o.anchor),L()}var g,b;k(d)}let F;"function"==typeof HTMLElement&&(F=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){for(const t in this.$$.slotted)this.appendChild(this.$$.slotted[t])}attributeChangedCallback(t,e,o){this[t]=o}$destroy(){!function(t,e){const o=t.$$;null!==o.fragment&&(i(o.on_destroy),o.fragment&&o.fragment.d(e),o.on_destroy=o.fragment=null,o.ctx=[])}(this,1),this.$destroy=e}$on(t,e){const o=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return o.push(e),()=>{const t=o.indexOf(e);-1!==t&&o.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}});const B=[];function G(t){const e=t-1;return e*e*e+1}function J(t){return"[object Date]"===Object.prototype.toString.call(t)}function K(t,e){if(t===e||t!=t)return()=>t;const o=typeof t;if(o!==typeof e||Array.isArray(t)!==Array.isArray(e))throw new Error("Cannot interpolate values of different type");if(Array.isArray(t)){const o=e.map((e,o)=>K(t[o],e));return t=>o.map(e=>e(t))}if("object"===o){if(!t||!e)throw new Error("Object cannot be null");if(J(t)&&J(e)){t=t.getTime();const o=(e=e.getTime())-t;return e=>new Date(t+e*o)}const o=Object.keys(e),n={};return o.forEach(o=>{n[o]=K(t[o],e[o])}),t=>{const e={};return o.forEach(o=>{e[o]=n[o](t)}),e}}if("number"===o){const o=e-t;return e=>t+e*o}throw new Error(`Cannot interpolate ${o} values`)}function Q(t,r={}){const s=function(t,o=e){let n;const r=[];function s(e){if(l(t,e)&&(t=e,n)){const e=!B.length;for(let e=0;e<r.length;e+=1){const o=r[e];o[1](),B.push(o,t)}if(e){for(let t=0;t<B.length;t+=2)B[t][0](B[t+1]);B.length=0}}}return{set:s,update:function(e){s(e(t))},subscribe:function(i,c=e){const l=[i,c];return r.push(l),1===r.length&&(n=o(s)||e),i(t),()=>{const t=r.indexOf(l);-1!==t&&r.splice(t,1),0===r.length&&(n(),n=null)}}}}(t);let i,c=t;function a(e,l){if(null==t)return s.set(t=e),Promise.resolve();c=e;let a=i,h=!1,{delay:m=0,duration:$=400,easing:g=o,interpolate:b=K}=n(n({},r),l);if(0===$)return a&&(a.abort(),a=null),s.set(t=c),Promise.resolve();const x=u()+m;let y;return i=function(t){let e;return 0===d.size&&p(f),{promise:new Promise(o=>{d.add(e={c:t,f:o})}),abort(){d.delete(e)}}}(o=>{if(o<x)return!0;h||(y=b(t,e),"function"==typeof $&&($=$(t,e)),h=!0),a&&(a.abort(),a=null);const n=o-x;return n>$?(s.set(t=e),!1):(s.set(t=y(g(n/$))),!0)}),i.promise}return{set:a,update:(e,o)=>a(e(c,t),o),subscribe:s.subscribe}}function U(t){let e,o,n,r,s;return{c(){e=g("div"),o=g("slot"),n=b(),r=g("div"),r.textContent=" ",y(r,"class","scrollmation-scroll-spacer"),y(e,"class","scrollmation-fg"),P(e,"margin-top",t[4]+t[0]+"px"),P(e,"margin-bottom",t[4]+t[1]+"px"),z(()=>t[18].call(e))},m(i,c){m(i,e,c),h(e,o),h(e,n),h(e,r),s=S(e,t[18].bind(e))},p(t,o){17&o[0]&&P(e,"margin-top",t[4]+t[0]+"px"),18&o[0]&&P(e,"margin-bottom",t[4]+t[1]+"px")},d(t){t&&$(e),s()}}}function V(t){let o,n,r,s,c=!t[6]&&U(t);return{c(){o=g("div"),c&&c.c(),this.c=e,y(o,"class","scrollmation-container"),P(o,"opacity",t[6]?0:1),z(()=>t[20].call(o))},m(e,i){m(e,o,i),c&&c.m(o,null),t[19](o),n=S(o,t[20].bind(o)),r||(s=[x(o,"scroll",t[7]),x(o,"wheel",t[8])],r=!0)},p(t,e){t[6]?c&&(c.d(1),c=null):c?c.p(t,e):(c=U(t),c.c(),c.m(o,null)),64&e[0]&&P(o,"opacity",t[6]?0:1)},i:e,o:e,d(e){e&&$(o),c&&c.d(),t[19](null),n(),r=!1,i(s)}}}function X(t,o,n){let r,s=e,i=()=>(s(),s=function(t,...o){if(null==t)return e;const n=t.subscribe(...o);return n.unsubscribe?()=>n.unsubscribe():n}(R,t=>n(30,r=t)),R);t.$$.on_destroy.push(()=>s());const c=j(),l=_(),a=(t,e)=>{l(t,e),c.dispatchEvent&&c.dispatchEvent(new CustomEvent(t,{detail:e,bubbles:!0,cancelable:!0,composed:!0}))};let u,p,d,f,h,m,$,g=0,b=!1,x=!0,y={},{startpos:P=0}=o,{homepos:w=0}=o,{endpos:v=0}=o,{duration:E=900}=o,{easing:S=G}=o,{isprevnav:k=!1}=o,{scrolltoposition:T=null}=o,{jumptoposition:C=null}=o,{pgId:I=0}=o;let H,{progress:R=Q(0,{duration:E,easing:S})}=o;async function z(t){return await O(t,!1)}async function O(t="home",e=!0){if(t){switch(t){case"offscreen":m=f+100;break;case"start":m=0;break;case"end":m=f;break;case"beforeStart":m=1;break;case"beforeEnd":m=f-1;break;default:m=H}e?(n(22,b=!0),await R.set(m),n(22,b=!1)):await R.set(m,{duration:0})}}return i(),t.$$set=t=>{"startpos"in t&&n(0,P=t.startpos),"homepos"in t&&n(9,w=t.homepos),"endpos"in t&&n(1,v=t.endpos),"duration"in t&&n(10,E=t.duration),"easing"in t&&n(11,S=t.easing),"isprevnav"in t&&n(12,k=t.isprevnav),"scrolltoposition"in t&&n(13,T=t.scrolltoposition),"jumptoposition"in t&&n(14,C=t.jumptoposition),"pgId"in t&&n(15,I=t.pgId),"progress"in t&&i(n(2,R=t.progress))},t.$$.update=()=>{1077936128&t.$$.dirty[0]&&b&&n(5,d.scrollTop=r,d),27&t.$$.dirty[0]&&n(23,f=p+u+v+P),529&t.$$.dirty[0]&&n(29,H=p-w+P),18874368&t.$$.dirty[0]&&n(26,$=g-h),8192&t.$$.dirty[0]&&O(T),16384&t.$$.dirty[0]&&z(C),32768&t.$$.dirty[0]&&async function(t){setTimeout(async()=>{k?await O("beforeEnd",!1):await O("beforeStart",!1),n(6,x=!1),await O("home")},200)}(),618659864&t.$$.dirty[0]&&(y={contentHeight:u,containerHeight:p,scrollPosPx:g,endScrollPosPx:f,startScrollPosPx:0,homeScrollPos:H,scrollDir:$,animatingScroll:b})},[P,v,R,u,p,d,x,async function(t){n(24,h=g),n(21,g=t.target.scrollTop),b||R.set(g,{duration:0});let e=null;h!==g&&(a("scroll",y),g===f&&(e="next"),0===g&&(e="prev"),g===H&&(e="home"),a(e,y))},function(t){b&&t.preventDefault()},w,E,S,k,T,C,I,z,O,function(){u=this.clientHeight,n(3,u)},function(t){A[t?"unshift":"push"](()=>{d=t,n(5,d),n(22,b),n(30,r)})},function(){p=this.clientHeight,n(4,p)}]}class Y extends F{constructor(t){super(),this.shadowRoot.innerHTML="<style>.scrollmation-container{width:100%;height:100%;overflow:auto;scrollbar-width:none;overscroll-behavior:none}.scrollmation-container::-webkit-scrollbar{display:none}.scrollmation-scroll-spacer{height:1px}</style>",q(this,{target:this.shadowRoot},X,V,l,{startpos:0,homepos:9,endpos:1,duration:10,easing:11,isprevnav:12,scrolltoposition:13,jumptoposition:14,pgId:15,progress:2,jumpToPos:16,scrollToPos:17},[-1,-1]),t&&(t.target&&m(t.target,this,t.anchor),t.props&&(this.$set(t.props),L()))}static get observedAttributes(){return["startpos","homepos","endpos","duration","easing","isprevnav","scrolltoposition","jumptoposition","pgId","progress","jumpToPos","scrollToPos"]}get startpos(){return this.$$.ctx[0]}set startpos(t){this.$set({startpos:t}),L()}get homepos(){return this.$$.ctx[9]}set homepos(t){this.$set({homepos:t}),L()}get endpos(){return this.$$.ctx[1]}set endpos(t){this.$set({endpos:t}),L()}get duration(){return this.$$.ctx[10]}set duration(t){this.$set({duration:t}),L()}get easing(){return this.$$.ctx[11]}set easing(t){this.$set({easing:t}),L()}get isprevnav(){return this.$$.ctx[12]}set isprevnav(t){this.$set({isprevnav:t}),L()}get scrolltoposition(){return this.$$.ctx[13]}set scrolltoposition(t){this.$set({scrolltoposition:t}),L()}get jumptoposition(){return this.$$.ctx[14]}set jumptoposition(t){this.$set({jumptoposition:t}),L()}get pgId(){return this.$$.ctx[15]}set pgId(t){this.$set({pgId:t}),L()}get progress(){return this.$$.ctx[2]}set progress(t){this.$set({progress:t}),L()}get jumpToPos(){return this.$$.ctx[16]}get scrollToPos(){return this.$$.ctx[17]}}return customElements.define("scroll-mation",Y),t.default=Y,t.fullRangePx=({endScrollPosPx:t,startScrollPosPx:e})=>t-e,t.toEndPx=({endScrollPosPx:t,scrollPosPx:e})=>t-e,t.toEndRatio=({scrollPosPx:t,endScrollPosPx:e,homeScrollPos:o})=>(t-e)/(o-e),t.toHomePx=({homeScrollPos:t,scrollPosPx:e})=>t-e,t.toHomeRatio=({homeScrollPos:t,scrollPosPx:e,startScrollPosPx:o})=>(t-e)/(t-o),t.toRangeRatio=({scrollPosPx:t,endScrollPosPx:e,startScrollPosPx:o})=>(t-e)/(o-e),t.toStartPx=({startScrollPosPx:t,scrollPosPx:e})=>t-e,t.toStartRatio=({homeScrollPos:t,scrollPosPx:e,startScrollPosPx:o})=>(e-o)/(t-o),t}({});
//# sourceMappingURL=scrollmation.js.map