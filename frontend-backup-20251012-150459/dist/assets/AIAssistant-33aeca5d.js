import{j as e,a as t}from"./index-1d0874ba.js";import{r as a}from"./react-vendor-6b652a3b.js";import{b as s,a as i}from"./services-eeeaa494.js";import{B as r,m as n,s as o,h as l,Z as c,l as d,j as p,t as m,u,v as g}from"./ui-vendor-2b835a18.js";import"./auth-vendor-5b17ef46.js";import"./utils-vendor-267562bf.js";let h,y,f,b={data:""},x=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,v=/\/\*[^]*?\*\/|  +/g,w=/\n+/g,N=(e,t)=>{let a="",s="",i="";for(let r in e){let n=e[r];"@"==r[0]?"i"==r[1]?a=r+" "+n+";":s+="f"==r[1]?N(n,r):r+"{"+N(n,"k"==r[1]?"":t)+"}":"object"==typeof n?s+=N(n,t?t.replace(/([^,])+/g,e=>r.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):r):null!=n&&(r=/^--/.test(r)?r:r.replace(/[A-Z]/g,"-$&").toLowerCase(),i+=N.p?N.p(r,n):r+":"+n+";")}return a+(t&&i?t+"{"+i+"}":i)+s},k={},S=e=>{if("object"==typeof e){let t="";for(let a in e)t+=a+S(e[a]);return t}return e};function j(e){let t=this||{},a=e.call?e(t.p):e;return((e,t,a,s,i)=>{let r=S(e),n=k[r]||(k[r]=(e=>{let t=0,a=11;for(;t<e.length;)a=101*a+e.charCodeAt(t++)>>>0;return"go"+a})(r));if(!k[n]){let t=r!==e?e:(e=>{let t,a,s=[{}];for(;t=x.exec(e.replace(v,""));)t[4]?s.shift():t[3]?(a=t[3].replace(w," ").trim(),s.unshift(s[0][a]=s[0][a]||{})):s[0][t[1]]=t[2].replace(w," ").trim();return s[0]})(e);k[n]=N(i?{["@keyframes "+n]:t}:t,a?"":"."+n)}let o=a&&k.g?k.g:null;return a&&(k.g=k[n]),l=k[n],c=t,d=s,(p=o)?c.data=c.data.replace(p,l):-1===c.data.indexOf(l)&&(c.data=d?l+c.data:c.data+l),n;var l,c,d,p})(a.unshift?a.raw?((e,t,a)=>e.reduce((e,s,i)=>{let r=t[i];if(r&&r.call){let e=r(a),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;r=t?"."+t:e&&"object"==typeof e?e.props?"":N(e,""):!1===e?"":e}return e+s+(null==r?"":r)},""))(a,[].slice.call(arguments,1),t.p):a.reduce((e,a)=>Object.assign(e,a&&a.call?a(t.p):a),{}):a,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||b})(t.target),t.g,t.o,t.k)}j.bind({g:1});let _=j.bind({k:1});function $(e,t){let a=this||{};return function(){let s=arguments;function i(r,n){let o=Object.assign({},r),l=o.className||i.className;a.p=Object.assign({theme:y&&y()},o),a.o=/ *go\d+/.test(l),o.className=j.apply(a,s)+(l?" "+l:""),t&&(o.ref=n);let c=e;return e[0]&&(c=o.as||e,delete o.as),f&&c[0]&&f(o),h(c,o)}return t?t(i):i}}var A=(e,t)=>(e=>"function"==typeof e)(e)?e(t):e,D=(()=>{let e=0;return()=>(++e).toString()})(),E=(()=>{let e;return()=>{if(void 0===e&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),z="default",C=(e,t)=>{let{toastLimit:a}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,a)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:s}=t;return C(e,{type:e.toasts.find(e=>e.id===s.id)?1:0,toast:s});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(e=>e.id===i||void 0===i?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let r=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+r}))}}},I=[],O={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},T={},U=(e,t=z)=>{T[t]=C(T[t]||O,e),I.forEach(([e,a])=>{e===t&&a(T[t])})},M=e=>Object.keys(T).forEach(t=>U(e,t)),P=(e=z)=>t=>{U(t,e)},L=e=>(t,a)=>{let s=((e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(null==a?void 0:a.id)||D()}))(t,e,a);return P(s.toasterId||(e=>Object.keys(T).find(t=>T[t].toasts.some(t=>t.id===e)))(s.id))({type:2,toast:s}),s.id},F=(e,t)=>L("blank")(e,t);F.error=L("error"),F.success=L("success"),F.loading=L("loading"),F.custom=L("custom"),F.dismiss=(e,t)=>{let a={type:3,toastId:e};t?P(t)(a):M(a)},F.dismissAll=e=>F.dismiss(void 0,e),F.remove=(e,t)=>{let a={type:4,toastId:e};t?P(t)(a):M(a)},F.removeAll=e=>F.remove(void 0,e),F.promise=(e,t,a)=>{let s=F.loading(t.loading,{...a,...null==a?void 0:a.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let i=t.success?A(t.success,e):void 0;return i?F.success(i,{id:s,...a,...null==a?void 0:a.success}):F.dismiss(s),e}).catch(e=>{let i=t.error?A(t.error,e):void 0;i?F.error(i,{id:s,...a,...null==a?void 0:a.error}):F.dismiss(s)}),e};var H,q,K,R,B=_`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,J=_`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Q=_`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,Z=$("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${B} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${J} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${Q} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,G=_`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,V=$("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${G} 1s linear infinite;
`,Y=_`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,W=_`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,X=$("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Y} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${W} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,ee=$("div")`
  position: absolute;
`,te=$("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,ae=_`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,se=$("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ae} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,ie=({toast:e})=>{let{icon:t,type:s,iconTheme:i}=e;return void 0!==t?"string"==typeof t?a.createElement(se,null,t):t:"blank"===s?null:a.createElement(te,null,a.createElement(V,{...i}),"loading"!==s&&a.createElement(ee,null,"error"===s?a.createElement(Z,{...i}):a.createElement(X,{...i})))},re=e=>`\n0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}\n100% {transform: translate3d(0,0,0) scale(1); opacity:1;}\n`,ne=e=>`\n0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}\n100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}\n`,oe=$("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,le=$("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`;a.memo(({toast:e,position:t,style:s,children:i})=>{let r=e.height?((e,t)=>{let a=e.includes("top")?1:-1,[s,i]=E()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[re(a),ne(a)];return{animation:t?`${_(s)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${_(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},n=a.createElement(ie,{toast:e}),o=a.createElement(le,{...e.ariaProps},A(e.message,e));return a.createElement(oe,{className:e.className,style:{...r,...s,...e.style}},"function"==typeof i?i({icon:n,message:o}):a.createElement(a.Fragment,null,n,o))}),H=a.createElement,N.p=q,h=H,y=K,f=R,j`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var ce=F;const de=()=>{var h;const[y,f]=a.useState([{id:"1",text:"مرحباً! أنا Amrikyy، مساعد الذكاء الاصطناعي الخاص بك. كيف يمكنني مساعدتك في تخطيط رحلتك القادمة؟",isUser:!1,timestamp:new Date,suggestions:["أريد تخطيط رحلة إلى اليابان","ما هي أفضل الأوقات للسفر إلى أوروبا؟","ساعدني في إدارة ميزانيتي للسفر","اقترح علي وجهات مثيرة للاهتمام"]}]),[b,x]=a.useState(""),[v,w]=a.useState(!1),[N,k]=a.useState(!1),[S,j]=a.useState(""),[_,$]=a.useState(""),[A,D]=a.useState(null),[E,z]=a.useState(!1),[C,I]=a.useState(!0),[O,T]=a.useState(null),[U,M]=a.useState(!1),[P,L]=a.useState(!0),[F,q]=a.useState(null),[K,R]=a.useState([]),[B,J]=a.useState(!1),[Q]=a.useState(`session_${Date.now()}`),Z=e=>{e.forEach(e=>{switch(e){case"show_trip_planner":confirm("هل تريد الذهاب إلى صفحة تخطيط الرحلات؟")&&(window.location.href="/app/planner");break;case"show_destinations":confirm("هل تريد استعراض الوجهات المتاحة؟")&&(window.location.href="/app/destinations");break;case"show_budget_tracker":ce("هل تريد مراجعة الميزانية؟",{icon:"💰",duration:5e3})}})},G=async()=>{var e,t;if(!b.trim())return;const a={id:Date.now().toString(),text:b,isUser:!0,timestamp:new Date};f(e=>[...e,a]);try{await s.track({type:"chat_message",payload:{length:b.length}})}catch{}x(""),k(!0);try{if(P){const a=await fetch("/api/qfo/process",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:"user_123",sessionId:Q,message:b,platform:"web",context:{currentPage:window.location.pathname,previousMessages:y.slice(-5)},syncAcrossPlatforms:!0})}),i=await a.json();if(!i.success)throw new Error(i.error||"QFO processing failed");{const a={id:(Date.now()+1).toString(),text:i.response.message||"تم إكمال طلبك بنجاح!",isUser:!1,timestamp:new Date,intent:i.response.intent?{intent:i.response.intent,confidence:i.response.confidence}:void 0,suggestions:["أخبرني المزيد","ما هي الخطوة التالية؟","اقتراح آخر"]};f(e=>[...e,a]),i.response.gamification&&q(i.response.gamification),(null==(e=i.response.predictions)?void 0:e.length)>0&&R(i.response.predictions),(null==(t=i.response.blockchain)?void 0:t.verified)&&J(!0);try{await s.track({type:"qfo_success",payload:{intent:i.response.intent}})}catch{}}}else{const e=await(async e=>{M(!0);try{const t=await fetch("/api/ai/predict-intent",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:e,context:{currentPage:"ai-assistant",previousIntent:null==O?void 0:O.intent,conversationDepth:y.length}})}),a=await t.json();if(a.success)return T(a.result),a.result.confidence>.7&&Z(a.result.actions),a.result}catch(t){}finally{M(!1)}return null})(b),t=y.slice(-5).map(e=>({role:e.isUser?"user":"assistant",content:e.text})),{data:a}=await i.sendMessage(b,{useTools:C,conversationHistory:t}),s={id:(Date.now()+1).toString(),text:(null==a?void 0:a.success)?a.reply:"عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",isUser:!1,timestamp:new Date,intent:e,suggestions:a.success?["أخبرني المزيد عن هذا الاقتراح","ما هي التكلفة المتوقعة؟","متى أفضل وقت للزيارة؟","أريد خيارات أخرى"]:["حاول مرة أخرى","اتصل بالدعم الفني","استخدم خيارات أخرى"]};f(e=>[...e,s])}k(!1)}catch(r){const e={id:(Date.now()+1).toString(),text:"عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",isUser:!1,timestamp:new Date,suggestions:["حاول مرة أخرى","تحقق من الاتصال","اتصل بالدعم الفني"]};f(t=>[...t,e]),k(!1)}};return e("div",{className:"space-y-6",children:[e("div",{className:"flex items-center space-x-4",children:[t("div",{className:"p-3 maya-gradient rounded-xl",children:t(r,{className:"w-8 h-8 text-white"})}),e("div",{children:[t("h2",{className:"text-3xl font-bold maya-text",children:"Maya AI Assistant"}),t("p",{className:"text-gray-600 mt-1",children:"Your intelligent travel companion"})]})]}),e("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[e(n.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},className:"bg-white rounded-2xl p-6 shadow-lg",children:[e("div",{className:"flex items-center space-x-3 mb-4",children:[t("div",{className:"p-2 bg-blue-100 rounded-lg",children:t(o,{className:"w-6 h-6 text-blue-600"})}),t("h3",{className:"text-lg font-semibold text-gray-800",children:"Smart Recommendations"})]}),t("p",{className:"text-gray-600 text-sm",children:"Get personalized travel suggestions based on your preferences and budget."})]}),e(n.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.1},className:"bg-white rounded-2xl p-6 shadow-lg",children:[e("div",{className:"flex items-center space-x-3 mb-4",children:[t("div",{className:"p-2 bg-green-100 rounded-lg",children:t(l,{className:"w-6 h-6 text-green-600"})}),t("h3",{className:"text-lg font-semibold text-gray-800",children:"Safety Insights"})]}),t("p",{className:"text-gray-600 text-sm",children:"Real-time safety information and travel advisories for your destinations."})]}),e(n.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.2},className:"bg-white rounded-2xl p-6 shadow-lg",children:[e("div",{className:"flex items-center space-x-3 mb-4",children:[t("div",{className:"p-2 bg-purple-100 rounded-lg",children:t(c,{className:"w-6 h-6 text-purple-600"})}),t("h3",{className:"text-lg font-semibold text-gray-800",children:"Instant Planning"})]}),t("p",{className:"text-gray-600 text-sm",children:"Quick itinerary creation and real-time travel assistance."})]})]}),O&&O.confidence>.5&&e(n.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},className:"mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg",children:[e("div",{className:"flex items-center justify-between",children:[e("div",{className:"flex items-center gap-2",children:[t(d,{className:"w-4 h-4 text-blue-600"}),e("span",{className:"text-sm font-medium text-blue-900",children:["فهمت:"," ","plan_trip"===O.intent?"تخطيط رحلة":"budget_inquiry"===O.intent?"استفسار عن الميزانية":"destination_info"===O.intent?"معلومات عن الوجهة":O.intent]})]}),e("span",{className:"text-xs text-blue-600",children:[Math.round(100*O.confidence),"% دقة"]})]}),(null==(h=O.matchedKeywords)?void 0:h.length)>0&&t("div",{className:"mt-2 flex flex-wrap gap-1",children:O.matchedKeywords.map((e,a)=>t("span",{className:"px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded",children:e},a))})]}),P&&e("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 mb-6",children:[F&&e(n.div,{initial:{opacity:0,scale:.9},animate:{opacity:1,scale:1},className:"bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200",children:[e("div",{className:"flex items-center gap-2 mb-2",children:[t(p,{className:"w-5 h-5 text-yellow-600"}),e("span",{className:"font-semibold text-yellow-900",children:["Level ",F.level]})]}),t("p",{className:"text-sm text-yellow-700",children:F.points_earned&&`+${F.points_earned} نقطة`})]}),K.length>0&&e(n.div,{initial:{opacity:0,scale:.9},animate:{opacity:1,scale:1},className:"bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200",children:[e("div",{className:"flex items-center gap-2 mb-2",children:[t(o,{className:"w-5 h-5 text-purple-600"}),t("span",{className:"font-semibold text-purple-900",children:"اقتراحات ذكية"})]}),t("p",{className:"text-sm text-purple-700",children:K[0].title})]}),B&&e(n.div,{initial:{opacity:0,scale:.9},animate:{opacity:1,scale:1},className:"bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200",children:[e("div",{className:"flex items-center gap-2 mb-2",children:[t(l,{className:"w-5 h-5 text-green-600"}),t("span",{className:"font-semibold text-green-900",children:"موثق"})]}),t("p",{className:"text-sm text-green-700",children:"تم التحقق على Blockchain"})]})]}),e("div",{className:"bg-white rounded-2xl shadow-lg overflow-hidden",children:[e("div",{className:"h-96 overflow-y-auto p-6 space-y-4",children:[y.map((a,s)=>t(n.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.1*s},className:"flex "+(a.isUser?"justify-end":"justify-start"),children:e("div",{className:"max-w-xs lg:max-w-md px-4 py-3 rounded-2xl "+(a.isUser?"bg-blue-500 text-white":"bg-gray-100 text-gray-800"),children:[t("p",{className:"text-sm",children:a.text}),t("p",{className:"text-xs opacity-70 mt-1",children:a.timestamp.toLocaleTimeString()}),a.suggestions&&t("div",{className:"mt-3 space-y-2",children:a.suggestions.map((e,a)=>t(n.button,{onClick:()=>(e=>{x(e)})(e),className:"block w-full text-left text-xs bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 transition-colors",whileHover:{scale:1.02},whileTap:{scale:.98},children:e},a))})]})},a.id)),N&&t(n.div,{initial:{opacity:0},animate:{opacity:1},className:"flex justify-start",children:t("div",{className:"bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl",children:e("div",{className:"flex items-center space-x-2",children:[e("div",{className:"flex space-x-1",children:[t("div",{className:"w-2 h-2 bg-gray-400 rounded-full animate-bounce"}),t("div",{className:"w-2 h-2 bg-gray-400 rounded-full animate-bounce",style:{animationDelay:"0.1s"}}),t("div",{className:"w-2 h-2 bg-gray-400 rounded-full animate-bounce",style:{animationDelay:"0.2s"}})]}),t("span",{className:"text-sm",children:"Maya is typing..."})]})})})]}),e("div",{className:"border-t p-4",children:[e("div",{className:"flex items-center space-x-3",children:[t(n.button,{onClick:()=>{w(!v)},className:"p-2 rounded-lg transition-colors "+(v?"bg-red-100 text-red-600":"bg-gray-100 text-gray-600 hover:bg-gray-200"),whileHover:{scale:1.1},whileTap:{scale:.9},children:t(v?m:u,{className:"w-5 h-5"})}),t("input",{type:"text",value:b,onChange:e=>x(e.target.value),onKeyPress:e=>"Enter"===e.key&&G(),placeholder:"Ask Maya anything about your travel...",className:"flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"}),t(n.button,{onClick:G,disabled:!b.trim(),className:"p-3 maya-gradient text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",whileHover:{scale:1.05},whileTap:{scale:.95},children:t(g,{className:"w-5 h-5"})})]}),e("div",{className:"mt-3 grid grid-cols-1 md:grid-cols-3 gap-3",children:[t("input",{type:"url",value:S,onChange:e=>j(e.target.value),placeholder:"Image URL (optional)",className:"px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"}),t("input",{type:"url",value:_,onChange:e=>$(e.target.value),placeholder:"Video URL (optional)",className:"px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"}),t(n.button,{onClick:async()=>{if(S||_){z(!0),D(null);try{const{data:e}=await i.analyzeMedia({prompt:b||"Analyze this media for trip planning.",imageUrls:S?[S]:[],videoUrl:_||null,options:{enableKvCacheOffload:!0,attentionImpl:"flash-attn-3"}});D((null==e?void 0:e.analysis)||"No analysis available")}catch(H){D("Failed to analyze media.")}finally{z(!1)}}},disabled:E||!S&&!_,className:"px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60",whileHover:{scale:1.02},whileTap:{scale:.98},children:E?"Analyzing…":"Analyze Media"})]}),A&&t("div",{className:"mt-3 p-3 bg-purple-50 border border-purple-100 rounded-lg text-sm text-purple-900 whitespace-pre-wrap",children:A})]})]})]})};export{de as default};
