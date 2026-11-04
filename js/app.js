function inside(lo,la,poly){var c=false;for(var i=0,j=poly.length-1;i<poly.length;j=i++){var a=poly[i],b=poly[j];if((a[1]>la)!=(b[1]>la)&&lo<(b[0]-a[0])*(la-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function onland(lo,la){return KEC.some(function(k){return inside(lo,la,k.r)})}
var seed=7;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}
function f(n){return n.toLocaleString("en-US")}
var sel=-1,mode="k";

/* ---------- Ship tiers by grand total of ship calls (domestic + international) ---------- */
function tier(t){return t>20000?3:t>10000?2:t>5000?1:0}
var TL=["\u2264 5,000","> 5,000","> 10,000","> 20,000"],TN=["Small boat","Ferry","Large ship","Container ship"];
var TW=[22,14,30,36];            // icon width (px) per tier, height = 2 x width
var HS=[0,46,60,78];             // pulsing halo around the port per tier
function shipSVG(t,c,deg){
 var b='stroke="#fff" stroke-width="1.1"',s='';
 if(t==0){
  s='<path d="M0-9C3.5-5.5 4.5-1 4.5 7V9.5H-4.5V7C-4.5-1-3.5-5.5 0-9Z" fill="'+c+'" '+b+'/><rect x="-2" y="0" width="4" height="5" rx="1" fill="#fff" opacity=".9"/>';
 }else if(t==1){
  s='<path d="M0-14C5-10 6.5-3 6.5 10V14H-6.5V10C-6.5-3-5-10 0-14Z" fill="'+c+'" '+b+'/><rect x="-4" y="-4" width="8" height="7" rx="1.5" fill="#fff" opacity=".9"/><rect x="-3" y="4.5" width="6" height="5" rx="1" fill="#fff" opacity=".75"/><rect x="-1.2" y="-9" width="2.4" height="3" rx=".8" fill="#fff" opacity=".9"/>';
 }else if(t==2){
  s='<path d="M0-18C5.5-13 7-4 7 14V18H-7V14C-7-4-5.5-13 0-18Z" fill="'+c+'" '+b+'/>';
  [-11,-5.5,0].forEach(function(y,i){s+='<rect x="-5" y="'+y+'" width="10" height="4.6" rx=".6" fill="'+(i==1?'#ffe08a':'#fff')+'" opacity=".92"/>'});
  s+='<rect x="-4.6" y="8" width="9.2" height="6.5" rx="1" fill="#fff"/><rect x="-2.6" y="9.6" width="5.2" height="2" fill="'+c+'" opacity=".7"/>';
 }else{
  s='<path d="M-3.5 21L-6.5 24M3.5 21L6.5 24" stroke="#fff" stroke-width="1.2" opacity=".7" fill="none"/><path d="M0-23C6.5-17 8-5 8 17V22H-8V17C-8-5-6.5-17 0-23Z" fill="'+c+'" '+b+'/>';
  var fl=['#ffffff','#ffe08a','#cfe6f5'];
  for(var r=0;r<5;r++)for(var q=0;q<2;q++)s+='<rect x="'+(-6.6+q*6.7)+'" y="'+(-15+r*6)+'" width="6.1" height="5.2" rx=".5" fill="'+fl[(r+q*2)%3]+'" opacity=".93"/>';
  s+='<rect x="-6" y="15.5" width="12" height="5" rx="1" fill="#fff"/><rect x="-3.5" y="16.8" width="7" height="2" fill="'+c+'" opacity=".75"/>';
 }
 var w=TW[t];
 return '<div style="transform:rotate('+deg+'deg);width:'+w+'px;height:'+(2*w)+'px"><svg width="'+w+'" height="'+(2*w)+'" viewBox="-12 -24 24 48" style="display:block;overflow:visible">'+s+'</svg></div>';
}

/* ---------- Leaflet map with OpenStreetMap basemap ---------- */
var map=L.map("map",{zoomControl:false}).setView([1.11,104.03],11);
L.control.zoom({position:"bottomright"}).addTo(map);
var osm=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map);
var gmaps=L.tileLayer("https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",{maxZoom:20,subdomains:"0123",attribution:"&copy; Google Maps"});
var gsat=L.tileLayer("https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",{maxZoom:20,subdomains:"0123",attribution:"&copy; Google Satellite"});
var distLayer=L.layerGroup(KEC.map(function(k){return L.polygon(k.r.map(function(p){return[p[1],p[0]]}),{color:"#8a7f5f",weight:1,fillColor:"#e6e2d3",fillOpacity:.12,interactive:false})})).addTo(map);
var RS={color:"#0b5cab",weight:1.6,opacity:.55,dashArray:"6 5"},RH={color:"#0b5cab",weight:3.5,opacity:.95,dashArray:null};
var routeLines=RT.map(function(r){return L.polyline(r.c,RS).bindTooltip(r.n,{sticky:true})});
var routeLayer=L.layerGroup(routeLines).addTo(map);
L.control.layers({"OpenStreetMap":osm,"Google Maps":gmaps,"Google Satellite":gsat},{"Shipping routes":routeLayer,"District boundaries":distLayer},{position:"topright",collapsed:true}).addTo(map);
/* north arrow */
var NorthCtl=L.Control.extend({options:{position:"bottomleft"},onAdd:function(){var d=L.DomUtil.create("div","north");d.innerHTML='<svg width="44" height="54" viewBox="0 0 44 54"><circle cx="22" cy="31" r="21" fill="#fff" fill-opacity=".92" stroke="#14202b" stroke-width="1"/><path d="M22 12L30 40L22 34L14 40Z" fill="#14202b"/><path d="M22 12L22 34L14 40Z" fill="#fff" stroke="#14202b" stroke-width="1"/><text x="22" y="9" text-anchor="middle" font-size="13" font-weight="700" fill="#14202b" stroke="#fff" stroke-width="2.5" paint-order="stroke" font-family="system-ui,sans-serif">N</text></svg>';return d}});
new NorthCtl().addTo(map);
map.fitBounds(L.latLngBounds(P.map(function(p){return[p.lat,p.lon]})),{padding:[60,60]});
var shipLayer=L.layerGroup().addTo(map),portLayer=L.layerGroup().addTo(map);

/* ---------- Ships sailing out and in along the routes ---------- */
var anim=null,ships=[];
function trunc(c,mx){var out=[c[0]],cum=[0],L=0;for(var i=1;i<c.length;i++){var dl=Math.hypot(c[i][0]-c[i-1][0],c[i][1]-c[i-1][1]);if(L+dl>=mx){var r=(mx-L)/dl;out.push([c[i-1][0]+(c[i][0]-c[i-1][0])*r,c[i-1][1]+(c[i][1]-c[i-1][1])*r]);cum.push(mx);L=mx;break}L+=dl;out.push(c[i]);cum.push(L)}return{c:out,cum:cum,L:L}}
function at(r,s){var i=1;while(i<r.cum.length-1&&r.cum[i]<s)i++;var a=r.c[i-1],b=r.c[i],sg=(r.cum[i]-r.cum[i-1])||1e-9,u=Math.max(0,Math.min(1,(s-r.cum[i-1])/sg));return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI]}
function tick(now){
 ships.forEach(function(s){
  var u=(s.ph+now/1000/s.T)%1,q=at(s.r,(s.out?u:1-u)*s.r.L),el=s.m.getElement();
  s.m.setLatLng([q[0],q[1]]);
  if(el&&el.firstChild)el.firstChild.style.transform="rotate("+(q[2]+(s.out?0:180)).toFixed(0)+"deg)";
  s.m.setOpacity(Math.min(1,Math.min(u,1-u)/.1));
 });
 anim=requestAnimationFrame(tick);
}
function draw(){
 if(anim){cancelAnimationFrame(anim);anim=null}
 ships=[];shipLayer.clearLayers();portLayer.clearLayers();
 seed=7+(sel+1)*131;
 /* highlight the routes of the selected port */
 var hot={};if(sel>=0)PR[sel].forEach(function(o){hot[o.r]=1});
 routeLines.forEach(function(l,i){l.setStyle(hot[i]?RH:RS);if(hot[i])l.bringToFront()});
 P.forEach(function(p,k){
  var tot=p.d+p.i,tt=tier(tot),A=mode=="k"?p.d:p.pd,T=A+(mode=="k"?p.i:p.pi);
  /* ships: 10 / 20 / 30 / 40 by grand total, moving out and in along the port's routes */
  if(k==sel&&mode=="k"&&PR[k].length){
   var m=[10,20,30,40][tt],rs=PR[k].map(function(o){var c=RT[o.r].c.slice();if(o.rev)c.reverse();return trunc(c,.3)});var lg=rs.filter(function(r){return r.L>=.02});if(lg.length)rs=lg;var cnt=rs.map(function(_,j){return Math.floor(m/rs.length)+(j<m%rs.length?1:0)});
   rs.forEach(function(r,j){
    for(var n=0;n<cnt[j];n++){
     var dm=rnd()<p.d/tot,w=TW[1],out=n%2==0;
     var mk=L.marker(r.c[0],{interactive:false,keyboard:false,icon:L.divIcon({className:"shp",iconSize:[w,2*w],iconAnchor:[w/2,w],html:shipSVG(1,dm?"var(--dom)":"var(--intl)",0)})}).addTo(shipLayer);
     ships.push({m:mk,r:r,out:out,ph:(n+rnd()*.5)/cnt[j],T:30+r.L*110+rnd()*20});
    }
   });
  }
  /* port marker: donut (domestic vs international) */
  var rr=mode=="k"?9:5+Math.sqrt(T/1000)*.25,C=2*Math.PI*rr,dl=C*A/T,s=2*(rr+12);
  var html='<div class="pm" style="width:'+s+'px;height:'+s+'px">'+
   '<svg width="'+s+'" height="'+s+'" viewBox="'+(-s/2)+' '+(-s/2)+' '+s+' '+s+'"><circle r="'+(rr+3)+'" fill="var(--card)"/><circle r="'+rr+'" fill="none" stroke="var(--intl)" stroke-width="7"/><circle r="'+rr+'" fill="none" stroke="var(--dom)" stroke-width="7" stroke-dasharray="'+dl.toFixed(2)+' '+C.toFixed(2)+'" transform="rotate(-90)"/>'+
   (k==sel?'<circle r="'+(rr+6)+'" fill="none" stroke="var(--ac)" stroke-width="3"/>':'')+'</svg><span class="pl'+(k==sel?' on':'')+'">'+p.n+'</span></div>';
  var mk2=L.marker([p.lat,p.lon],{keyboard:false,title:p.n,zIndexOffset:k==sel?2000:1000,icon:L.divIcon({className:"pmk",html:html,iconSize:[s,s],iconAnchor:[s/2,s/2]})});
  mk2.on("click",function(){pick(sel==k?-1:k)});
  mk2.addTo(portLayer);
 });
 if(ships.length)anim=requestAnimationFrame(tick);
}

/* ---------- Charts ---------- */
function pie(a,b,la,lb){
 var t=a+b,C=2*Math.PI*40,pa=(a/t*100).toFixed(1),pb=(b/t*100).toFixed(1);
 return '<div class="pie"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="var(--intl)" stroke-width="18"/><circle cx="50" cy="50" r="40" fill="none" stroke="var(--dom)" stroke-width="18" stroke-dasharray="'+(C*a/t).toFixed(2)+' '+C.toFixed(2)+'" transform="rotate(-90 50 50)"/><text x="50" y="48" text-anchor="middle" font-size="9" fill="var(--mut)">Total</text><text x="50" y="60" text-anchor="middle" font-size="11" font-weight="700" fill="var(--tx)">'+f(t)+'</text></svg><ul><li><i class="dot" style="background:var(--dom)"></i>'+la+': <b>'+f(a)+'</b> ('+pa+'%)</li><li><i class="dot" style="background:var(--intl)"></i>'+lb+': <b>'+f(b)+'</b> ('+pb+'%)</li></ul></div>';
}
var MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function cf(n){return n>=1e6?(n/1e6).toFixed(1).replace(/\.0$/,"")+"M":n>=1e3?(n/1e3).toFixed(n>=1e4?0:1).replace(/\.0$/,"")+"k":""+n}
/* wide stacked bar chart, sized for the full map width */
function bars(a,b,la,lb){
 var mx=0,i,s='',L0=48,R0=632,T0=16,B0=186,st=(R0-L0)/12,bw=30;
 for(i=0;i<12;i++)mx=Math.max(mx,a[i]+b[i]);
 var mg=Math.pow(10,Math.floor(Math.log10(mx||1))),nm=[1,1.5,2,2.5,3,4,5,6,8,10].find(function(v){return v*mg>=mx})*mg;
 function y(v){return T0+(B0-T0)*(1-v/nm)}
 [0,.25,.5,.75,1].forEach(function(q){s+='<line x1="'+L0+'" x2="'+R0+'" y1="'+y(nm*q)+'" y2="'+y(nm*q)+'" stroke="var(--bd)"/><text x="'+(L0-6)+'" y="'+(y(nm*q)+3.5)+'" text-anchor="end" font-size="10" fill="var(--mut)">'+cf(nm*q)+'</text>'});
 for(i=0;i<12;i++){var x=L0+i*st+(st-bw)/2,hA=(B0-T0)*a[i]/nm,hB=(B0-T0)*b[i]/nm;
  s+='<g><title>'+MO[i]+' - '+la+': '+f(a[i])+' | '+lb+': '+f(b[i])+' | Total: '+f(a[i]+b[i])+'</title><rect x="'+x.toFixed(1)+'" y="'+y(a[i]).toFixed(1)+'" width="'+bw+'" height="'+hA.toFixed(1)+'" fill="var(--dom)"/><rect x="'+x.toFixed(1)+'" y="'+y(a[i]+b[i]).toFixed(1)+'" width="'+bw+'" height="'+hB.toFixed(1)+'" fill="var(--intl)"/><text x="'+(x+bw/2).toFixed(1)+'" y="'+(y(a[i]+b[i])-4).toFixed(1)+'" text-anchor="middle" font-size="9" fill="var(--mut)">'+cf(a[i]+b[i])+'</text><text x="'+(x+bw/2).toFixed(1)+'" y="'+(B0+16)+'" text-anchor="middle" font-size="10.5" fill="var(--mut)">'+MO[i]+'</text></g>'}
 return '<svg class="bar" viewBox="0 0 640 208" role="img" aria-label="Monthly stacked bar chart">'+s+'</svg>'}
function allMonths(){
 var o={cd:[],ci:[],pd:[],pi:[]};
 Object.keys(o).forEach(function(k){for(var i=0;i<12;i++)o[k][i]=P.reduce(function(s,p){return s+p.m[k][i]},0)});
 return o}
function renderCharts(){
 var p=sel>=0?P[sel]:null,m=p?p.m:allMonths();
 var ship='<div class="bt">Ship calls per month</div>'+bars(m.cd,m.ci,"Domestic","International");
 var pax='<div class="bt">Passengers per month</div>'+bars(m.pd,m.pi,"Domestic","International");
 document.getElementById("charts").innerHTML='<div class="chead"><h2 style="margin:0">Monthly breakdown (Jan-Dec): '+(p?p.n:'All ports')+'</h2><span class="lg"><i class="dot" style="background:var(--dom)"></i>Domestic &nbsp; <i class="dot" style="background:var(--intl)"></i>International</span></div>'+(mode=="k"?ship+pax:pax+ship)+(p?'':'<small class="n">No port selected: showing the sum of all ports. Click a port to see its own months.</small>');
}

/* ---------- Side panel ---------- */
function sect(t,a,b,la,lb){return '<h2 style="margin-top:14px">'+t+'</h2>'+pie(a,b,la,lb)}
function pies(p){var c=sect("Ship calls - annual total",p.d,p.i,"Domestic (Indonesian-flagged)","International (foreign-flagged)"),x=sect("Passengers - annual total",p.pd,p.pi,"Domestic","International");return mode=="k"?c+x:x+c}
function info(p){var tot=p.d+p.i,tt=tier(tot);return '<div style="color:var(--mut);font-size:12px;margin:-4px 0 8px">'+p.t+'</div><span class="badge '+(tt?'hi':'lo')+'">Grand total '+TL[tt]+' ship calls</span><div class="kv"><div><b>'+f(tot)+'</b><span>Ship calls (annual grand total)</span></div><div><b>'+f(p.pd+p.pi)+'</b><span>Passengers (annual)</span></div></div>'+pies(p)+'<small class="n">Data source: BP Batam, year 2025 (ship calls and passengers); routes from JALUR_KAPAL.geojson. Pies show the annual total; monthly bars are below the map. Domestic = Indonesian-flagged ships, international = foreign-flagged. Basemap &copy; OpenStreetMap contributors.</small>'}
var HINT='<p style="color:var(--mut)">Click a port on the map (or its name above) to see ships, annual totals, and the monthly bar charts below the map.</p>';

function pick(k){sel=k;render();if(k>=0)map.flyTo([P[k].lat,P[k].lon],Math.max(map.getZoom(),12),{duration:.7})}
function render(){
 document.getElementById("chips").innerHTML=P.map(function(x,k){return '<button class="chip'+(k==sel?' on':'')+'" data-k="'+k+'">'+x.n+'</button>'}).join("");
 document.querySelectorAll("#chips .chip").forEach(function(e){e.onclick=function(){pick(+e.dataset.k)}});
 var d=document.getElementById("detail"),h=document.getElementById("pn");
 if(sel<0){h.textContent="Ports";d.innerHTML=HINT}else{h.textContent=P[sel].n;d.innerHTML=info(P[sel])}
 renderCharts();draw();
}
document.querySelectorAll('[name=md]').forEach(function(e){e.onchange=function(){mode=e.value;render()}});
render();
