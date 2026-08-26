/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL="https://yxchpegvgotywekihald.supabase.co";
const SUPABASE_KEY="sb_publishable_oUPJ4eTqBHlS26ovAz7cXA_jxc_PF2H";
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);

const C={
  bg0:"#060A0E",bg1:"#0D1117",bg2:"#131920",bg3:"#1A2232",bg4:"#1E2A3A",
  border:"#1E2D42",border2:"#243548",
  cyan:"#00C8FF",cyanDim:"#003D4F",
  gold:"#FFD166",goldDim:"#3D2E00",
  green:"#06D6A0",greenDim:"#003D2E",
  red:"#EF476F",redDim:"#3D0015",
  purple:"#9B5DE5",purpleDim:"#1E0040",
  orange:"#FF9F1C",blue:"#4895EF",
  slate:"#8899AA",white:"#E8F0F8",dimText:"#4A6080",
};

const fmt=(n,d=2)=>Number(n).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtPct=(n)=>`${n>=0?"+":""}${fmt(n,2)}%`;
const fmtUSD=(n)=>{const v=Number(n);const d=v<0.0001?8:v<0.01?6:v<1?4:2;return "$"+fmt(v,d);};
const PFX="nexus_v6_";
function lSave(k,v){try{localStorage.setItem(PFX+k,JSON.stringify(v));sessionStorage.setItem(PFX+k,JSON.stringify(v));}catch(e){}}
function lLoad(k,fb){try{const a=localStorage.getItem(PFX+k);if(a!==null)return JSON.parse(a);const b=sessionStorage.getItem(PFX+k);if(b!==null)return JSON.parse(b);return fb;}catch(e){return fb;}}
async function hashPin(pin){const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(pin+"nexus_salt_2024"));return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");}

const DEFAULT_PAIRS=["BTC/USDT","ETH/USDT","SOL/USDT","BNB/USDT","AVAX/USDT","MATIC/USDT","XRP/USDT","ADA/USDT","DOT/USDT","DOGE/USDT","SHIB/USDT","LTC/USDT","LINK/USDT","UNI/USDT","ATOM/USDT","OP/USDT","ARB/USDT","INJ/USDT","SUI/USDT","APT/USDT"];
const BASE_PRICES={"BTC/USDT":67420,"ETH/USDT":3812,"SOL/USDT":178,"BNB/USDT":612,"AVAX/USDT":38.4,"MATIC/USDT":0.92,"XRP/USDT":0.61,"ADA/USDT":0.48,"DOT/USDT":8.2,"DOGE/USDT":0.17,"SHIB/USDT":0.000024,"LTC/USDT":87,"LINK/USDT":14.8,"UNI/USDT":9.4,"ATOM/USDT":9.1,"OP/USDT":2.6,"ARB/USDT":1.08,"INJ/USDT":28,"SUI/USDT":1.4,"APT/USDT":9.8};
const GECKO_IDS={"BTC/USDT":"bitcoin","ETH/USDT":"ethereum","SOL/USDT":"solana","BNB/USDT":"binancecoin","AVAX/USDT":"avalanche-2","MATIC/USDT":"matic-network","XRP/USDT":"ripple","ADA/USDT":"cardano","DOT/USDT":"polkadot","DOGE/USDT":"dogecoin","SHIB/USDT":"shiba-inu","LTC/USDT":"litecoin","LINK/USDT":"chainlink","UNI/USDT":"uniswap","ATOM/USDT":"cosmos","OP/USDT":"optimism","ARB/USDT":"arbitrum","INJ/USDT":"injective-protocol","SUI/USDT":"sui","APT/USDT":"aptos"};
const TIMEFRAMES=[{label:"1m",value:"1m"},{label:"3m",value:"3m"},{label:"5m",value:"5m"},{label:"15m",value:"15m"},{label:"30m",value:"30m"},{label:"1H",value:"1h"},{label:"2H",value:"2h"},{label:"4H",value:"4h"},{label:"6H",value:"6h"},{label:"12H",value:"12h"},{label:"1D",value:"1d"},{label:"3D",value:"3d"},{label:"1W",value:"1w"},{label:"1M",value:"1M"}];
const CORRELATED_GROUPS=[["BTC/USDT","ETH/USDT"],["SOL/USDT","AVAX/USDT"],["OP/USDT","ARB/USDT"]];

// Supported exchanges with their API base URLs and WebSocket endpoints
const EXCHANGES={
  Binance:{name:"Binance",wsBase:"wss://stream.binance.com:9443/ws/",restBase:"https://api.binance.com/api/v3/",klineEndpoint:"klines",tickerEndpoint:"ticker/price",logo:"🟡",color:"#F0B90B",apiKeyLabel:"API Key",secretLabel:"Secret Key",website:"binance.com"},
  Bybit:{name:"Bybit",wsBase:"wss://stream.bybit.com/v5/public/spot",restBase:"https://api.bybit.com/v5/",klineEndpoint:"market/kline",tickerEndpoint:"market/tickers",logo:"🟠",color:"#F7A600",apiKeyLabel:"API Key",secretLabel:"API Secret",website:"bybit.com"},
  OKX:{name:"OKX",wsBase:"wss://ws.okx.com:8443/ws/v5/public",restBase:"https://www.okx.com/api/v5/",klineEndpoint:"market/candles",tickerEndpoint:"market/ticker",logo:"⚫",color:"#000000",apiKeyLabel:"API Key",secretLabel:"Secret Key",website:"okx.com"},
  Kraken:{name:"Kraken",wsBase:"wss://ws.kraken.com",restBase:"https://api.kraken.com/0/public/",klineEndpoint:"OHLC",tickerEndpoint:"Ticker",logo:"ðŸ™",color:"#5741D9",apiKeyLabel:"API Key",secretLabel:"Private Key",website:"kraken.com"},
  Coinbase:{name:"Coinbase",wsBase:"wss://advanced-trade-ws.coinbase.com",restBase:"https://api.coinbase.com/api/v3/brokerage/",klineEndpoint:"products",tickerEndpoint:"best_bid_ask",logo:"🔵",color:"#0052FF",apiKeyLabel:"API Key",secretLabel:"API Secret",website:"coinbase.com"},
  Bitfinex:{name:"Bitfinex",wsBase:"wss://api-pub.bitfinex.com/ws/2",restBase:"https://api-pub.bitfinex.com/v2/",klineEndpoint:"candles",tickerEndpoint:"ticker",logo:"🟢",color:"#16B157",apiKeyLabel:"API Key",secretLabel:"API Secret",website:"bitfinex.com"},
  KuCoin:{name:"KuCoin",wsBase:"wss://ws-api.kucoin.com/endpoint",restBase:"https://api.kucoin.com/api/v1/",klineEndpoint:"market/candles",tickerEndpoint:"market/orderbook/level1",logo:"🟢",color:"#24AE8F",apiKeyLabel:"API Key",secretLabel:"API Secret",website:"kucoin.com"},
  Gate:{name:"Gate.io",wsBase:"wss://api.gateio.ws/ws/v4/",restBase:"https://api.gateio.ws/api/v4/",klineEndpoint:"spot/candlesticks",tickerEndpoint:"spot/tickers",logo:"🔴",color:"#E74C3C",apiKeyLabel:"API Key",secretLabel:"Secret Key",website:"gate.io"},
  Custom:{name:"Custom Exchange",wsBase:"",restBase:"",klineEndpoint:"",tickerEndpoint:"",logo:"⚡",color:"#9B5DE5",apiKeyLabel:"API Key",secretLabel:"API Secret",website:"custom"},
};

function toBinanceSym(p){return p.replace("/","").toLowerCase();}
function isLondonSession(){const h=new Date().getUTCHours();return h>=8&&h<16;}
function isNYSession(){const h=new Date().getUTCHours();return h>=13&&h<21;}
function isSydneySession(){const h=new Date().getUTCHours();return h>=21||h<6;}
function isAsiaSession(){const h=new Date().getUTCHours();return h>=0&&h<9;}
function isTradingSession(){return isLondonSession()||isNYSession()||isSydneySession()||isAsiaSession();}
function getDayOfWeek(){return new Date().toLocaleDateString("en-US",{weekday:"long"});}

function generateCandle(prev){
  const change=(Math.random()-0.48)*0.012;
  const open=prev.close,close=open*(1+change);
  const high=Math.max(open,close)*(1+Math.random()*0.006);
  const low=Math.min(open,close)*(1-Math.random()*0.006);
  return{open,close,high,low,volume:100+Math.random()*900,time:Date.now()};
}
function initCandles(base,count=100){
  const c=[{open:base*0.95,close:base,high:base*1.02,low:base*0.93,volume:500,time:Date.now()-count*60000}];
  for(let i=1;i<count;i++)c.push(generateCandle(c[i-1]));
  return c;
}
async function fetchBinanceCandles(pair,interval,limit=200){
  try{
    const sym=toBinanceSym(pair).toUpperCase();
    const res=await fetch("https://api.binance.com/api/v3/klines?symbol="+sym+"&interval="+interval+"&limit="+limit);
    if(!res.ok)throw new Error();
    const raw=await res.json();
    return raw.map(k=>({open:parseFloat(k[1]),high:parseFloat(k[2]),low:parseFloat(k[3]),close:parseFloat(k[4]),volume:parseFloat(k[5]),time:k[0]}));
  }catch(e){return null;}
}

// ── All Indicators ─────────────────────────────────────────────────
function calcEMA(data,p){const k=2/(p+1);let e=data[0];return data.map(v=>{e=v*k+e*(1-k);return e;});}
function calcRSI(c,p=14){if(c.length<p+1)return 50;let g=0,l=0;for(let i=c.length-p;i<c.length;i++){const d=c[i]-c[i-1];if(d>0)g+=d;else l-=d;}return 100-100/(1+g/(l||0.0001));}
function calcBB(c,p=20){const s=c.slice(-p);const m=s.reduce((a,b)=>a+b,0)/p;const std=Math.sqrt(s.reduce((a,b)=>a+(b-m)**2,0)/p);return{upper:m+2*std,middle:m,lower:m-2*std};}
function calcMACD(c){const e12=calcEMA(c,12),e26=calcEMA(c,26);const mc=e12.map((v,i)=>v-e26[i]);const sig=calcEMA(mc,9);const ml=mc.length-1,sl=sig.length-1;return{macd:mc[ml]||0,signal:sig[sl]||0,hist:(mc[ml]||0)-(sig[sl]||0)};}
function calcATR(candles,p=14){const trs=candles.slice(-p-1).map((c,i,a)=>{if(i===0)return c.high-c.low;return Math.max(c.high-c.low,Math.abs(c.high-a[i-1].close),Math.abs(c.low-a[i-1].close));});return trs.reduce((a,b)=>a+b,0)/trs.length;}
function calcStochRSI(c,p=14){if(c.length<p*2)return 50;const rv=[];for(let i=p;i<=c.length;i++)rv.push(calcRSI(c.slice(0,i),p));const r=rv.slice(-p);const mn=Math.min(...r),mx=Math.max(...r);return mx===mn?50:((r.at(-1)-mn)/(mx-mn))*100;}
function calcVWAP(candles){let pv=0,v=0;candles.slice(-20).forEach(c=>{const tp=(c.high+c.low+c.close)/3;pv+=tp*c.volume;v+=c.volume;});return v>0?pv/v:0;}
function calcVWAPBands(candles,mult1=1,mult2=2){const slice=candles.slice(-20);let pv=0,v=0;slice.forEach(c=>{const tp=(c.high+c.low+c.close)/3;pv+=tp*c.volume;v+=c.volume;});const vwap=v>0?pv/v:0;if(vwap===0)return{vwap:0,upper1:0,lower1:0,upper2:0,lower2:0};let sqSum=0,totalVol=0;slice.forEach(c=>{const tp=(c.high+c.low+c.close)/3;sqSum+=c.volume*(tp-vwap)*(tp-vwap);totalVol+=c.volume;});const variance=totalVol>0?sqSum/totalVol:0;const std=Math.sqrt(variance);return{vwap,upper1:vwap+std*mult1,lower1:vwap-std*mult1,upper2:vwap+std*mult2,lower2:vwap-std*mult2,std};}
function calcWilliamsR(candles,p=14){const s=candles.slice(-p);const hi=Math.max(...s.map(c=>c.high));const lo=Math.min(...s.map(c=>c.low));const cl=candles.at(-1).close;return hi===lo?-50:((hi-cl)/(hi-lo))*-100;}
function calcCCI(candles,p=20){const s=candles.slice(-p);const tps=s.map(c=>(c.high+c.low+c.close)/3);const mean=tps.reduce((a,b)=>a+b,0)/p;const mad=tps.reduce((a,b)=>a+Math.abs(b-mean),0)/p;return mad===0?0:(tps.at(-1)-mean)/(0.015*mad);}
function calcMFI(candles,p=14){const s=candles.slice(-p-1);let pos=0,neg=0;for(let i=1;i<s.length;i++){const tp=(s[i].high+s[i].low+s[i].close)/3;const pt=(s[i-1].high+s[i-1].low+s[i-1].close)/3;const mf=tp*s[i].volume;if(tp>pt)pos+=mf;else neg+=mf;}return neg===0?100:100-(100/(1+pos/neg));}
function calcSupertrend(candles,period=10,mult=3){if(candles.length<period+1)return{value:candles.at(-1).close,trend:"up"};const atr=calcATR(candles,period);const close=candles.at(-1).close;const hl2=(candles.at(-1).high+candles.at(-1).low)/2;const lower=hl2-mult*atr;return{value:close>lower?lower:hl2+mult*atr,trend:close>lower?"up":"down"};}
function calcPivots(candles){const p=candles.at(-2)||candles.at(-1);const pp=(p.high+p.low+p.close)/3;return{pp,r1:2*pp-p.low,r2:pp+(p.high-p.low),r3:p.high+2*(pp-p.low),s1:2*pp-p.high,s2:pp-(p.high-p.low),s3:p.low-2*(p.high-pp)};}
function calcIchimoku(candles){if(candles.length<52)return null;const h9=Math.max(...candles.slice(-9).map(c=>c.high)),l9=Math.min(...candles.slice(-9).map(c=>c.low));const h26=Math.max(...candles.slice(-26).map(c=>c.high)),l26=Math.min(...candles.slice(-26).map(c=>c.low));const h52=Math.max(...candles.slice(-52).map(c=>c.high)),l52=Math.min(...candles.slice(-52).map(c=>c.low));const tenkan=(h9+l9)/2,kijun=(h26+l26)/2;return{tenkan,kijun,senkouA:(tenkan+kijun)/2,senkouB:(h52+l52)/2};}
function calcADX(candles,p=14){
  if(candles.length<p+1)return{adx:0,pdi:0,mdi:0};
  const trs=[],pdms=[],mdms=[];
  for(let i=1;i<candles.length;i++){const h=candles[i].high,l=candles[i].low,ph=candles[i-1].high,pl=candles[i-1].low,pc=candles[i-1].close;trs.push(Math.max(h-l,Math.abs(h-pc),Math.abs(l-pc)));pdms.push(h-ph>pl-l&&h-ph>0?h-ph:0);mdms.push(pl-l>h-ph&&pl-l>0?pl-l:0);}
  const atr14=trs.slice(-p).reduce((a,b)=>a+b,0)/p||1;
  const pdi=100*(pdms.slice(-p).reduce((a,b)=>a+b,0)/p)/atr14;
  const mdi=100*(mdms.slice(-p).reduce((a,b)=>a+b,0)/p)/atr14;
  const dx=Math.abs(pdi-mdi)/((pdi+mdi)||1)*100;
  return{adx:dx,pdi,mdi};
}
function calcParabolicSAR(candles){
  if(candles.length<5)return{sar:candles.at(-1).close,trend:"up"};
  let af=0.02,maxAf=0.2,sar=candles[0].low,ep=candles[0].high,bull=true;
  for(let i=1;i<candles.length;i++){
    sar=sar+af*(ep-sar);
    if(bull){if(candles[i].low<sar){bull=false;sar=ep;ep=candles[i].low;af=0.02;}else{if(candles[i].high>ep){ep=candles[i].high;af=Math.min(af+0.02,maxAf);}sar=Math.min(sar,candles[i-1].low,i>1?candles[i-2].low:sar);}}
    else{if(candles[i].high>sar){bull=true;sar=ep;ep=candles[i].high;af=0.02;}else{if(candles[i].low<ep){ep=candles[i].low;af=Math.min(af+0.02,maxAf);}sar=Math.max(sar,candles[i-1].high,i>1?candles[i-2].high:sar);}}
  }
  return{sar,trend:bull?"up":"down"};
}
function calcOBV(candles){let obv=0;for(let i=1;i<candles.length;i++){if(candles[i].close>candles[i-1].close)obv+=candles[i].volume;else if(candles[i].close<candles[i-1].close)obv-=candles[i].volume;}return obv;}
function calcStochastic(candles,p=14){const s=candles.slice(-p);const hi=Math.max(...s.map(c=>c.high));const lo=Math.min(...s.map(c=>c.low));const k=hi===lo?50:((candles.at(-1).close-lo)/(hi-lo))*100;return{k,d:k};}
function calcFibLevels(candles){const s=candles.slice(-50);const hi=Math.max(...s.map(c=>c.high));const lo=Math.min(...s.map(c=>c.low));const diff=hi-lo;return{hi,lo,r236:hi-diff*0.236,r382:hi-diff*0.382,r500:hi-diff*0.5,r618:hi-diff*0.618,r786:hi-diff*0.786};}
function detectDivergence(candles,rsiValues){
  if(candles.length<5||rsiValues.length<5)return{bullish:false,bearish:false};
  const priceSlice=candles.slice(-5);const rsiSlice=rsiValues.slice(-5);
  const priceLowerLow=priceSlice.at(-1).close<Math.min(...priceSlice.slice(0,-1).map(c=>c.close));
  const rsiHigherLow=rsiSlice.at(-1)>Math.min(...rsiSlice.slice(0,-1));
  const priceHigherHigh=priceSlice.at(-1).close>Math.max(...priceSlice.slice(0,-1).map(c=>c.close));
  const rsiLowerHigh=rsiSlice.at(-1)<Math.max(...rsiSlice.slice(0,-1));
  return{bullish:priceLowerLow&&rsiHigherLow,bearish:priceHigherHigh&&rsiLowerHigh};
}
function detectMarketRegime(candles){
  if(candles.length<30)return{regime:"unknown",strategy:"wait",confidence:0,color:C.slate,icon:"◌",desc:"Insufficient data"};
  const closes=candles.map(c=>c.close);
  const atr=calcATR(candles);
  const adx=calcADX(candles);
  const price=closes.at(-1);
  const ema21=calcEMA(closes,21).at(-1);
  const ema50=calcEMA(closes,50).at(-1);
  const ema200=calcEMA(closes,Math.min(200,closes.length)).at(-1);
  const atrPct=(atr/price)*100;
  const trending=adx.adx>25;
  const volatile=atrPct>3;
  const bullTrend=ema21>ema50&&ema50>ema200;
  const bearTrend=ema21<ema50&&ema50<ema200;
  const ranging=!trending&&atrPct<1.5;
  if(volatile&&!trending)return{regime:"volatile",strategy:"reduce_size",confidence:Math.min(100,atrPct*20),color:C.red,icon:"⚡",desc:"High volatility, no trend. Reduce position sizes by 50%."};
  if(trending&&bullTrend)return{regime:"trending_bull",strategy:"momentum_long",confidence:Math.min(100,adx.adx*2),color:C.green,icon:"▲",desc:"Strong bullish trend. Focus on BUY signals only."};
  if(trending&&bearTrend)return{regime:"trending_bear",strategy:"momentum_short",confidence:Math.min(100,adx.adx*2),color:C.red,icon:"▼",desc:"Strong bearish trend. Focus on SELL signals only."};
  if(ranging)return{regime:"ranging",strategy:"mean_reversion",confidence:70,color:C.gold,icon:"↔",desc:"Ranging market. Trade reversals at support/resistance."};
  return{regime:"mixed",strategy:"selective",confidence:50,color:C.slate,icon:"◌",desc:"Mixed conditions. Only trade highest strength signals."};
}
function detectPatterns(candles){
  const patterns=[];
  if(candles.length<10)return{patterns,srZones:[]};
  const recent=candles.slice(-10);
  const highs=recent.map(c=>c.high);
  const lows=recent.map(c=>c.low);
  const last=candles.at(-1);
  const prev=candles.at(-2);
  const prev2=candles.at(-3);
  const bodySize=Math.abs(last.close-last.open);
  const wickSize=last.high-last.low;
  if(wickSize>0&&bodySize/wickSize<0.1)patterns.push({name:"Doji",type:"neutral",desc:"Indecision — potential reversal"});
  const lowerWick=Math.min(last.open,last.close)-last.low;
  const upperWick=last.high-Math.max(last.open,last.close);
  if(lowerWick>bodySize*2&&upperWick<bodySize*0.5&&last.close>last.open)patterns.push({name:"Hammer",type:"bullish",desc:"Bullish reversal at lows"});
  if(upperWick>bodySize*2&&lowerWick<bodySize*0.5&&last.close<last.open)patterns.push({name:"Shooting Star",type:"bearish",desc:"Bearish reversal at highs"});
  if(prev&&last.close>last.open&&prev.close<prev.open&&last.open<prev.close&&last.close>prev.open)patterns.push({name:"Bullish Engulfing",type:"bullish",desc:"Strong bullish reversal"});
  if(prev&&last.close<last.open&&prev.close>prev.open&&last.open>prev.close&&last.close<prev.open)patterns.push({name:"Bearish Engulfing",type:"bearish",desc:"Strong bearish reversal"});
  if(prev2&&prev&&prev2.close<prev2.open&&Math.abs(prev.close-prev.open)<Math.abs(prev2.close-prev2.open)*0.3&&last.close>last.open&&last.close>prev2.open)patterns.push({name:"Morning Star",type:"bullish",desc:"Three candle bullish reversal"});
  if(prev2&&prev&&prev2.close>prev2.open&&Math.abs(prev.close-prev.open)<Math.abs(prev2.close-prev2.open)*0.3&&last.close<last.open&&last.close<prev2.open)patterns.push({name:"Evening Star",type:"bearish",desc:"Three candle bearish reversal"});
  const highSlice=highs.slice(0,-2);
  const maxHigh=Math.max(...highSlice);
  if(Math.abs(last.high-maxHigh)/maxHigh<0.005)patterns.push({name:"Double Top",type:"bearish",desc:"Resistance tested twice"});
  const lowSlice=lows.slice(0,-2);
  const minLow=Math.min(...lowSlice);
  if(Math.abs(last.low-minLow)/minLow<0.005)patterns.push({name:"Double Bottom",type:"bullish",desc:"Support tested twice"});
  const srZones=[];
  for(let i=2;i<recent.length-2;i++){
    if(highs[i]>highs[i-1]&&highs[i]>highs[i+1]&&highs[i]>highs[i-2]&&highs[i]>highs[i+2])srZones.push({level:highs[i],type:"resistance"});
    if(lows[i]<lows[i-1]&&lows[i]<lows[i+1]&&lows[i]<lows[i-2]&&lows[i]<lows[i+2])srZones.push({level:lows[i],type:"support"});
  }
  return{patterns,srZones};
}
function kellySize(winRate,rr){const w=winRate/100;const b=rr;const kelly=w-(1-w)/b;return Math.max(0,Math.min(kelly*100,25));}


// ── PHASE 1-3: Advanced Intelligence ──────────────────────────────
function calcVolumeProfile(candles,bins=20){if(!candles||candles.length<20)return{poc:0,vah:0,val:0,nodes:[]};const high=Math.max(...candles.map(c=>c.high));const low=Math.min(...candles.map(c=>c.low));const binSize=(high-low)/bins||1;const nodes=Array.from({length:bins},(_,i)=>({price:low+binSize*(i+0.5),volume:0}));candles.forEach(c=>{const idx=Math.min(bins-1,Math.max(0,Math.floor((c.close-low)/binSize)));nodes[idx].volume+=c.volume;});const totalVol=nodes.reduce((a,n)=>a+n.volume,0)||1;const poc=nodes.reduce((a,n)=>n.volume>a.volume?n:a,nodes[0]);let vaVol=poc.volume,vaH=nodes.indexOf(poc),vaL=nodes.indexOf(poc);while(vaVol<totalVol*0.7&&(vaH<bins-1||vaL>0)){const uv=vaH<bins-1?nodes[vaH+1].volume:0;const dv=vaL>0?nodes[vaL-1].volume:0;if(uv>=dv&&vaH<bins-1){vaH++;vaVol+=uv;}else if(vaL>0){vaL--;vaVol+=dv;}else break;}return{poc:poc.price,vah:nodes[vaH].price,val:nodes[vaL].price,nodes};}

function detectLiquidityZones(candles){if(!candles||candles.length<50)return{resistances:[],supports:[],nearestR:null,nearestS:null};const highs=[],lows=[];for(let i=3;i<candles.length-3;i++){if(candles[i].high>candles[i-1].high&&candles[i].high>candles[i-2].high&&candles[i].high>candles[i+1].high&&candles[i].high>candles[i+2].high)highs.push({price:candles[i].high,touches:1});if(candles[i].low<candles[i-1].low&&candles[i].low<candles[i-2].low&&candles[i].low<candles[i+1].low&&candles[i].low<candles[i+2].low)lows.push({price:candles[i].low,touches:1});}const cluster=levels=>{const out=[];levels.forEach(l=>{const ex=out.find(c=>Math.abs(c.price-l.price)/l.price<0.005);if(ex){ex.touches++;ex.price=(ex.price*(ex.touches-1)+l.price)/ex.touches;}else out.push({...l});});return out.sort((a,b)=>b.touches-a.touches).slice(0,5);};const resistances=cluster(highs);const supports=cluster(lows);const current=candles.at(-1).close;return{resistances,supports,nearestR:resistances.filter(r=>r.price>current).sort((a,b)=>a.price-b.price)[0]||null,nearestS:supports.filter(s=>s.price<current).sort((a,b)=>b.price-a.price)[0]||null};}

function calcOrderBookImbalance(candles){if(!candles||candles.length<10)return{imbalance:0,bias:"neutral"};let buy=0,sell=0;candles.slice(-10).forEach(c=>{const body=Math.abs(c.close-c.open);const uw=c.high-Math.max(c.open,c.close);const lw=Math.min(c.open,c.close)-c.low;if(c.close>c.open){buy+=body+lw*0.5+c.volume*0.001;sell+=uw;}else{sell+=body+uw*0.5+c.volume*0.001;buy+=lw;}});const total=buy+sell||1;const imbalance=(buy-sell)/total;return{imbalance,bias:imbalance>0.2?"bullish":imbalance<-0.2?"bearish":"neutral"};}

function detectMarketRegimeAdvanced(candles){if(!candles||candles.length<50)return{regime:"unknown",tradeable:false,reason:"Insufficient data",confidence:0,adx:0,choppiness:50,atrPct:2,bullAlign:false,bearAlign:false};const closes=candles.map(c=>c.close);const atr=calcATR(candles);const adxData=calcADX(candles);const current=closes.at(-1);const ema8=calcEMA(closes,8).at(-1);const ema21=calcEMA(closes,21).at(-1);const ema50=calcEMA(closes,50).at(-1);const ema200=calcEMA(closes,Math.min(200,closes.length)).at(-1);const bb=calcBB(closes);const atrPct=(atr/current)*100;const bbWidth=(bb.upper-bb.lower)/bb.middle*100;const bullAlign=ema8>ema21&&ema21>ema50&&ema50>ema200;const bearAlign=ema8<ema21&&ema21<ema50&&ema50<ema200;const hh=Math.max(...candles.slice(-14).map(c=>c.high));const ll=Math.min(...candles.slice(-14).map(c=>c.low));const atrSum=candles.slice(-14).reduce((s,c,i,a)=>s+(i===0?c.high-c.low:Math.max(c.high-c.low,Math.abs(c.high-a[i-1].close),Math.abs(c.low-a[i-1].close))),0);const choppiness=100*Math.log10(atrSum/((hh-ll)||0.0001))/Math.log10(14);let regime,tradeable,reason,confidence;if(choppiness>61.8){regime="ranging";tradeable=false;confidence=Math.round((choppiness-61.8)/38.2*100);reason="Choppy market   avoid trading";}else if(adxData.adx>30&&bullAlign){regime="trending_bull";tradeable=true;confidence=Math.round(adxData.adx);reason="Strong bull trend   EMAs aligned up";}else if(adxData.adx>30&&bearAlign){regime="trending_bear";tradeable=true;confidence=Math.round(adxData.adx);reason="Strong bear trend   EMAs aligned down";}else if(atrPct>4){regime="volatile";tradeable=false;confidence=Math.round(atrPct*10);reason="Extreme volatility   reduce size";}else if(bbWidth<2){regime="squeeze";tradeable=false;confidence=80;reason="BB squeeze   breakout imminent";}else if(adxData.adx>20&&bullAlign){regime="trending_bull";tradeable=true;confidence=Math.round(adxData.adx);reason="Weak bull trend";}else if(adxData.adx>20&&bearAlign){regime="trending_bear";tradeable=true;confidence=Math.round(adxData.adx);reason="Weak bear trend";}else{regime="mixed";tradeable=false;confidence=30;reason="Mixed signals   wait for clarity";}return{regime,tradeable,reason,confidence,choppiness,atrPct,bbWidth,adx:adxData.adx,bullAlign,bearAlign};}

function detectHiddenDivergence(candles){if(!candles||candles.length<30)return{bullish:false,bearish:false,regular:{bullish:false,bearish:false}};const closes=candles.map(c=>c.close);const rsiArr=closes.slice(-30).map((_,i)=>i<14?50:calcRSI(closes.slice(Math.max(0,closes.length-30+i-14),closes.length-30+i+1)));const prices=closes.slice(-30);const swings=[];for(let i=3;i<prices.length-3;i++){if(prices[i]<prices[i-1]&&prices[i]<prices[i-2]&&prices[i]<prices[i+1]&&prices[i]<prices[i+2])swings.push({type:"low",price:prices[i],rsi:rsiArr[i]});if(prices[i]>prices[i-1]&&prices[i]>prices[i-2]&&prices[i]>prices[i+1]&&prices[i]>prices[i+2])swings.push({type:"high",price:prices[i],rsi:rsiArr[i]});}const lows=swings.filter(s=>s.type==="low").slice(-3);const highs=swings.filter(s=>s.type==="high").slice(-3);let rB=false,rBear=false,hB=false,hBear=false;if(lows.length>=2){const l1=lows[lows.length-2],l2=lows[lows.length-1];if(l2.price<l1.price&&l2.rsi>l1.rsi)rB=true;if(l2.price>l1.price&&l2.rsi<l1.rsi)hB=true;}if(highs.length>=2){const h1=highs[highs.length-2],h2=highs[highs.length-1];if(h2.price>h1.price&&h2.rsi<h1.rsi)rBear=true;if(h2.price<h1.price&&h2.rsi>h1.rsi)hBear=true;}return{bullish:hB,bearish:hBear,regular:{bullish:rB,bearish:rBear}};}

function calcMTFBias(candles){if(!candles||candles.length<100)return{bias:"neutral",score:0,confirmed:false,bull15m:false,bull1h:false,bull4h:false};const closes=candles.map(c=>c.close);const current=closes.at(-1);const agg=n=>{const out=[];for(let i=0;i+n<=candles.length;i+=n){const sl=candles.slice(i,i+n);out.push({close:sl.at(-1).close});}return out;};const c1h=agg(4),c4h=agg(16);const ema21_15m=calcEMA(closes,21).at(-1);const ema21_1h=c1h.length>21?calcEMA(c1h.map(c=>c.close),21).at(-1):current;const ema21_4h=c4h.length>21?calcEMA(c4h.map(c=>c.close),21).at(-1):current;const bull15m=current>ema21_15m,bull1h=current>ema21_1h,bull4h=current>ema21_4h;const bullCount=[bull15m,bull1h,bull4h].filter(Boolean).length;return{bias:bullCount>=2?"bullish":bullCount<=1?"bearish":"neutral",score:bullCount*2-3,confirmed:bullCount===3||bullCount===0,bull15m,bull1h,bull4h};}

function scoreCandlePatterns(candles){if(!candles||candles.length<5)return{score:0,patterns:[],topPattern:null};const last=candles.at(-1);const prev=candles.at(-2);const body=Math.abs(last.close-last.open);const range=last.high-last.low||0.0001;const uw=last.high-Math.max(last.open,last.close);const lw=Math.min(last.open,last.close)-last.low;const pats=[];let score=0;if(lw>body*2&&uw<body*0.5&&body/range>0.15){pats.push({name:"Hammer",type:"bullish",strength:3});score+=3;}if(uw>body*2&&lw<body*0.5&&body/range>0.15){pats.push({name:"Shooting Star",type:"bearish",strength:3});score-=3;}if(body/range<0.1)pats.push({name:"Doji",type:"neutral",strength:1});if(prev&&last.close>last.open&&prev.close<prev.open&&last.open<prev.close&&last.close>prev.open){pats.push({name:"Bullish Engulfing",type:"bullish",strength:4});score+=4;}if(prev&&last.close<last.open&&prev.close>prev.open&&last.open>prev.close&&last.close<prev.open){pats.push({name:"Bearish Engulfing",type:"bearish",strength:4});score-=4;}if(lw>range*0.6&&body<range*0.25){pats.push({name:"Bullish Pin Bar",type:"bullish",strength:3});score+=3;}if(uw>range*0.6&&body<range*0.25){pats.push({name:"Bearish Pin Bar",type:"bearish",strength:3});score-=3;}if(body/range>0.85){if(last.close>last.open){pats.push({name:"Bull Marubozu",type:"bullish",strength:2});score+=2;}else{pats.push({name:"Bear Marubozu",type:"bearish",strength:2});score-=2;}}return{score,patterns:pats,topPattern:pats.sort((a,b)=>b.strength-a.strength)[0]||null};}

function getSessionVolatilityProfile(pair){const hour=new Date().getUTCHours();const btcLike=["BTC/USDT","ETH/USDT","BNB/USDT"];const asianAlts=["XRP/USDT","ATOM/USDT","INJ/USDT","SUI/USDT","APT/USDT","OP/USDT","ARB/USDT"];const windows=[{start:7,end:10,label:"London Open"},{start:13,end:16,label:"NY Open"},{start:0,end:4,label:"Asia Open"},{start:21,end:24,label:"Sydney Open"}];const activeWindow=windows.find(w=>hour>=w.start&&hour<w.end)||null;let volatilityScore=50;if(btcLike.includes(pair)){if(hour>=13&&hour<21)volatilityScore=90;else if(hour>=7&&hour<13)volatilityScore=75;}else if(asianAlts.includes(pair)){if(hour>=0&&hour<8)volatilityScore=85;else if(hour>=13&&hour<17)volatilityScore=70;}else{if(hour>=13&&hour<17)volatilityScore=80;else if(hour>=7&&hour<13)volatilityScore=70;}return{volatilityScore,activeWindow,hour,isHighProbability:volatilityScore>=70};}

function calcKellySize(winRate,riskReward,accountBalance,maxRiskPct=5){const p=Math.max(0.1,Math.min(0.9,winRate/100));const b=Math.max(0.5,riskReward);const kelly=(b*p-(1-p))/b;const halfKelly=kelly*0.5;const riskPct=Math.max(0.5,Math.min(maxRiskPct,halfKelly*100));return{kelly,halfKelly,riskPct,riskAmount:accountBalance*(riskPct/100),recommended:riskPct>0};}

function calcPairCorrelation(pricesA,pricesB,period=20){if(!pricesA||!pricesB||pricesA.length<period||pricesB.length<period)return 0;const a=pricesA.slice(-period),b=pricesB.slice(-period);const ma=a.reduce((s,v)=>s+v,0)/period,mb=b.reduce((s,v)=>s+v,0)/period;const num=a.reduce((s,v,i)=>s+(v-ma)*(b[i]-mb),0);const da=Math.sqrt(a.reduce((s,v)=>s+(v-ma)**2,0));const db=Math.sqrt(b.reduce((s,v)=>s+(v-mb)**2,0));return num/((da*db)||1);}

function computeSignal(candles,pair){pair=pair||'BTC/USDT';
  const closes=candles.map(c=>c.close);
  const current=closes.at(-1);
  const rsi=calcRSI(closes);
  const{macd,signal,hist}=calcMACD(closes);
  const bb=calcBB(closes);
  const ema9=calcEMA(closes,9).at(-1);
  const ema21=calcEMA(closes,21).at(-1);
  const ema50=calcEMA(closes,50).at(-1);
  const ema200=calcEMA(closes,Math.min(200,closes.length)).at(-1)||current;
  const atr=calcATR(candles);
  const stochRSI=calcStochRSI(closes);
  const vwap=calcVWAP(candles);
  const williamsR=calcWilliamsR(candles);
  const cci=calcCCI(candles);
  const mfi=calcMFI(candles);
  const supertrend=calcSupertrend(candles);
  const pivot=calcPivots(candles);
  const ichimoku=calcIchimoku(candles);
  const adx=calcADX(candles);
  const psar=calcParabolicSAR(candles);
  const obv=calcOBV(candles);
  const stoch=calcStochastic(candles);
  const fib=calcFibLevels(candles);
  const rsiHistory=candles.slice(-5).map((_,i)=>calcRSI(closes.slice(0,closes.length-4+i)));
  const divergence=detectDivergence(candles,rsiHistory);
  const regime=detectMarketRegime(candles);
  const patternData=detectPatterns(candles);
  const volume=candles.at(-1).volume;
  const avgVol=candles.slice(-20).reduce((a,c)=>a+c.volume,0)/20;
  const volRatio=volume/avgVol;
  let score=0;const reasons=[];
  if(current>ema9){score+=0.5;reasons.push({text:"Above EMA9",weight:"positive"});}else{score-=0.5;reasons.push({text:"Below EMA9",weight:"negative"});}
  if(current>ema21){score+=1;reasons.push({text:"Above EMA21",weight:"positive"});}else{score-=1;reasons.push({text:"Below EMA21",weight:"negative"});}
  if(ema21>ema50){score+=1.5;reasons.push({text:"EMA21>EMA50 uptrend",weight:"positive"});}else{score-=1.5;reasons.push({text:"EMA50>EMA21 downtrend",weight:"negative"});}
  if(current>ema200){score+=1;reasons.push({text:"Above 200 EMA",weight:"positive"});}else{score-=1;reasons.push({text:"Below 200 EMA",weight:"negative"});}
  if(current>vwap){score+=0.5;reasons.push({text:"Above VWAP",weight:"positive"});}else{score-=0.5;reasons.push({text:"Below VWAP",weight:"negative"});}
  if(rsi<30){score+=2.5;reasons.push({text:"RSI "+fmt(rsi,1)+" extreme oversold",weight:"positive"});}
  else if(rsi<40){score+=1.5;reasons.push({text:"RSI "+fmt(rsi,1)+" oversold",weight:"positive"});}
  else if(rsi>75){score-=2.5;reasons.push({text:"RSI "+fmt(rsi,1)+" extreme overbought",weight:"negative"});}
  else if(rsi>65){score-=1.5;reasons.push({text:"RSI "+fmt(rsi,1)+" overbought",weight:"negative"});}
  else reasons.push({text:"RSI "+fmt(rsi,1)+" neutral",weight:"neutral"});
  if(hist>0&&macd>signal){score+=1.5;reasons.push({text:"MACD bullish crossover",weight:"positive"});}else if(hist<0&&macd<signal){score-=1.5;reasons.push({text:"MACD bearish crossover",weight:"negative"});}
  if(current<bb.lower){score+=2;reasons.push({text:"At lower Bollinger Band",weight:"positive"});}else if(current>bb.upper){score-=2;reasons.push({text:"At upper Bollinger Band",weight:"negative"});}else reasons.push({text:"Inside Bollinger Bands",weight:"neutral"});
  if(stochRSI<20){score+=1;reasons.push({text:"StochRSI oversold",weight:"positive"});}else if(stochRSI>80){score-=1;reasons.push({text:"StochRSI overbought",weight:"negative"});}
  if(williamsR<-80){score+=1;reasons.push({text:"Williams %R oversold",weight:"positive"});}else if(williamsR>-20){score-=1;reasons.push({text:"Williams %R overbought",weight:"negative"});}
  if(cci<-100){score+=1;reasons.push({text:"CCI oversold",weight:"positive"});}else if(cci>100){score-=1;reasons.push({text:"CCI overbought",weight:"negative"});}
  if(mfi<20){score+=1;reasons.push({text:"MFI extreme outflow",weight:"positive"});}else if(mfi>80){score-=1;reasons.push({text:"MFI extreme inflow",weight:"negative"});}
  if(supertrend.trend==="up"){score+=1.5;reasons.push({text:"Supertrend bullish",weight:"positive"});}else{score-=1.5;reasons.push({text:"Supertrend bearish",weight:"negative"});}
  if(ichimoku){if(current>ichimoku.senkouA&&current>ichimoku.senkouB){score+=1.5;reasons.push({text:"Above Ichimoku cloud",weight:"positive"});}else if(current<ichimoku.senkouA&&current<ichimoku.senkouB){score-=1.5;reasons.push({text:"Below Ichimoku cloud",weight:"negative"});}else reasons.push({text:"Inside Ichimoku cloud",weight:"neutral"});}
  if(adx.adx>25){if(adx.pdi>adx.mdi){score+=1.5;reasons.push({text:"ADX "+fmt(adx.adx,0)+" strong uptrend",weight:"positive"});}else{score-=1.5;reasons.push({text:"ADX "+fmt(adx.adx,0)+" strong downtrend",weight:"negative"});}}
  if(psar.trend==="up"){score+=1;reasons.push({text:"Parabolic SAR bullish",weight:"positive"});}else{score-=1;reasons.push({text:"Parabolic SAR bearish",weight:"negative"});}
  if(stoch.k<20){score+=1;reasons.push({text:"Stochastic oversold",weight:"positive"});}else if(stoch.k>80){score-=1;reasons.push({text:"Stochastic overbought",weight:"negative"});}
  if(divergence.bullish){score+=2;reasons.push({text:"Bullish RSI divergence",weight:"positive"});}
  if(divergence.bearish){score-=2;reasons.push({text:"Bearish RSI divergence",weight:"negative"});}
  patternData.patterns.forEach(p=>{
    if(p.type==="bullish"){score+=1.5;reasons.push({text:"Pattern: "+p.name,weight:"positive"});}
    if(p.type==="bearish"){score-=1.5;reasons.push({text:"Pattern: "+p.name,weight:"negative"});}
  });
  // Phase 1-3: Advanced signals
  const hiddenDiv=detectHiddenDivergence(candles);
  const smc=detectSMC(candles);
  const fundingRate=estimateFundingRate(candles);
  const liqLevels=calcLiquidationLevels(current,candles);
  const advRegime=detectMarketRegimeAdvanced(candles);
  const candleScore=scoreCandlePatterns(candles);
  const volumeProfile=calcVolumeProfile(candles);
  const liquidityZones=detectLiquidityZones(candles);
  const orderBookImbalance=calcOrderBookImbalance(candles);
  const mtfBias=calcMTFBias(candles);
  const sessionProfile=getSessionVolatilityProfile(pair||"BTC/USDT");
  if(hiddenDiv.bullish){score+=2.5;reasons.push({text:"Hidden bullish divergence   trend continuation",weight:"positive"});}
  if(hiddenDiv.bearish){score-=2.5;reasons.push({text:"Hidden bearish divergence   trend continuation",weight:"negative"});}
  if(hiddenDiv.regular.bullish){score+=2;reasons.push({text:"Regular bullish divergence   reversal",weight:"positive"});}
  if(hiddenDiv.regular.bearish){score-=2;reasons.push({text:"Regular bearish divergence   reversal",weight:"negative"});}
  if(candleScore.score>3){score+=2;reasons.push({text:"Strong bullish candle: "+(candleScore.topPattern?.name||""),weight:"positive"});}
  if(candleScore.score<-3){score-=2;reasons.push({text:"Strong bearish candle: "+(candleScore.topPattern?.name||""),weight:"negative"});}
  if(orderBookImbalance.bias==="bullish"){score+=1.5;reasons.push({text:"Order flow bullish "+fmt(orderBookImbalance.imbalance*100,0)+"%",weight:"positive"});}
  if(orderBookImbalance.bias==="bearish"){score-=1.5;reasons.push({text:"Order flow bearish",weight:"negative"});}
  if(mtfBias.confirmed&&mtfBias.bias==="bullish"){score+=3;reasons.push({text:"MTF confirmed BULL   15m/1h/4h aligned",weight:"positive"});}
  else if(mtfBias.confirmed&&mtfBias.bias==="bearish"){score-=3;reasons.push({text:"MTF confirmed BEAR   15m/1h/4h aligned",weight:"negative"});}
  else if(mtfBias.bias==="bullish"){score+=1;reasons.push({text:"MTF partially bullish",weight:"positive"});}
  else if(mtfBias.bias==="bearish"){score-=1;reasons.push({text:"MTF partially bearish",weight:"negative"});}
  if(volumeProfile.poc>0){if(current<volumeProfile.val){score+=1;reasons.push({text:"Below Value Area   mean reversion buy",weight:"positive"});}if(current>volumeProfile.vah){score-=1;reasons.push({text:"Above Value Area   overbought vs profile",weight:"negative"});}}
  if(liquidityZones.nearestS){const d=Math.abs(current-liquidityZones.nearestS.price)/current;if(d<0.01){score+=1.5;reasons.push({text:"Near support zone "+fmtUSD(liquidityZones.nearestS.price),weight:"positive"});}}
  if(liquidityZones.nearestR){const d=Math.abs(current-liquidityZones.nearestR.price)/current;if(d<0.01){score-=1;reasons.push({text:"Near resistance zone "+fmtUSD(liquidityZones.nearestR.price),weight:"negative"});}}
  if(sessionProfile.isHighProbability){score*=1.1;reasons.push({text:"High probability session: "+(sessionProfile.activeWindow?.label||"Active"),weight:"positive"});}
  // SMC signals
  if(smc.lastCHoCH?.type==="bullish"){score+=2.5;reasons.push({text:"SMC: Change of Character BULLISH — potential reversal",weight:"positive"});}
  if(smc.lastCHoCH?.type==="bearish"){score-=2.5;reasons.push({text:"SMC: Change of Character BEARISH — potential reversal",weight:"negative"});}
  if(smc.bullishBOS>smc.bearishBOS){score+=1.5;reasons.push({text:"SMC: Bullish Break of Structure dominates",weight:"positive"});}
  if(smc.bearishBOS>smc.bullishBOS){score-=1.5;reasons.push({text:"SMC: Bearish Break of Structure dominates",weight:"negative"});}
  const nearFVG=smc.fvg.find(f=>Math.abs(current-(f.top+f.bottom)/2)/current<0.01);
  if(nearFVG){if(nearFVG.type==="bullish"){score+=2;reasons.push({text:"SMC: Price in bullish Fair Value Gap — demand zone",weight:"positive"});}else{score-=2;reasons.push({text:"SMC: Price in bearish Fair Value Gap — supply zone",weight:"negative"});}}
  const nearOB=smc.orderBlocks.find(ob=>current>=ob.bottom&&current<=ob.top);
  if(nearOB){if(nearOB.type==="bullish"){score+=2;reasons.push({text:"SMC: Price in bullish Order Block — institutional demand",weight:"positive"});}else{score-=2;reasons.push({text:"SMC: Price in bearish Order Block — institutional supply",weight:"negative"});}}
  // Funding rate signal
  if(fundingRate.rate>0.1){score-=1;reasons.push({text:"High positive funding — longs paying shorts, possible pullback",weight:"negative"});}
  if(fundingRate.rate<-0.1){score+=1;reasons.push({text:"Negative funding — shorts paying longs, possible squeeze",weight:"positive"});}
  if(!advRegime.tradeable){score*=0.25;reasons.push({text:"REGIME: "+advRegime.reason,weight:"negative"});}
  else if(regime.regime==="volatile"){score*=0.5;}
  if(regime.regime==="trending_bull"&&score<0)score*=0.5;
  if(regime.regime==="trending_bear"&&score>0)score*=0.5;
  if(volRatio>2){score+=1.5;reasons.push({text:"Volume "+fmt(volRatio,1)+"x very high",weight:"positive"});}
  else if(volRatio>1.5){score+=1;reasons.push({text:"Volume "+fmt(volRatio,1)+"x above avg",weight:"positive"});}
  const strength=Math.min(100,Math.abs(score)*5.5);
  let direction="NEUTRAL";
  if(score>=4)direction="STRONG BUY";
  else if(score>=2)direction="BUY";
  else if(score<=-4)direction="STRONG SELL";
  else if(score<=-2)direction="SELL";
  const entry=current;
  const isBuy=direction.includes("BUY")||(direction==="NEUTRAL"&&score>=0);
  const stopLoss=isBuy?entry-atr*1.5:entry+atr*1.5;
  let tp1=isBuy?entry+atr*2:entry-atr*2;
  let tp2=isBuy?entry+atr*4:entry-atr*4;
  let tp3=isBuy?entry+atr*7:entry-atr*7;
  const tp4=isBuy?entry+atr*12:entry-atr*12;
  // Smart TP snap to liquidity zones
  if(isBuy&&liquidityZones.nearestR&&liquidityZones.nearestR.price>tp1&&liquidityZones.nearestR.price<tp2*1.2)tp2=liquidityZones.nearestR.price*0.998;
  if(!isBuy&&liquidityZones.nearestS&&liquidityZones.nearestS.price<tp1&&liquidityZones.nearestS.price>tp2*0.8)tp2=liquidityZones.nearestS.price*1.002;
  const riskReward=Math.abs(tp2-entry)/(Math.abs(entry-stopLoss)||0.0001);
  return{direction,strength,score,rsi,macd,signal,hist,bb,ema9,ema21,ema50,ema200,atr,stochRSI,vwap,williamsR,cci,mfi,supertrend,pivot,ichimoku,adx,psar,obv,stoch,fib,divergence,hiddenDiv,smc,fundingRate,liqLevels,advRegime,regime,patternData,candleScore,volumeProfile,liquidityZones,orderBookImbalance,mtfBias,sessionProfile,volRatio,entry,stopLoss,tp1,tp2,tp3,tp4,riskReward,reasons,isBuy,isTradingSession:isTradingSession()};
}

function runBacktest(candles,strategy){
  if(!candles||candles.length<50)return null;
  const results={trades:[],totalTrades:0,wins:0,losses:0,totalPnl:0,maxDrawdown:0,peak:1000,balance:1000,winRate:0,profitFactor:0,totalWon:0,totalLost:0};
  const pnlHistory=[];
  let openTrade=null;
  for(let i=50;i<candles.length-1;i++){
    const slice=candles.slice(0,i+1);
    const sig=computeSignal(slice);
    const price=candles[i].close;
    if(openTrade){
      const isBuy=openTrade.side==="BUY";
      const hitSL=isBuy?price<=openTrade.sl:price>=openTrade.sl;
      const hitTP=isBuy?price>=openTrade.tp:price<=openTrade.tp;
      if(hitSL||hitTP){
        const pnl=hitTP?Math.abs(openTrade.tp-openTrade.entry)/openTrade.entry*results.balance*(parseFloat(strategy.riskPct)||1.5)/100*100:-(Math.abs(openTrade.sl-openTrade.entry)/openTrade.entry*results.balance*(parseFloat(strategy.riskPct)||1.5)/100*100);
        results.balance+=pnl;results.totalPnl+=pnl;results.totalTrades++;
        pnlHistory.push(pnl);
        if(pnl>0){results.wins++;results.totalWon+=pnl;}else{results.losses++;results.totalLost+=Math.abs(pnl);}
        if(results.balance>results.peak)results.peak=results.balance;
        const dd=(results.peak-results.balance)/results.peak*100;
        if(dd>results.maxDrawdown)results.maxDrawdown=dd;
        results.trades.push({index:i,side:openTrade.side,entry:openTrade.entry,exit:price,pnl:Math.round(pnl*100)/100,result:hitTP?"TP":"SL"});
        openTrade=null;
      }
    }
    if(!openTrade&&sig.direction!=="NEUTRAL"&&sig.strength>=(parseFloat(strategy.minStrength)||65)&&sig.riskReward>=(parseFloat(strategy.minRR)||2)){
      const isBuy=sig.direction.includes("BUY");
      openTrade={side:isBuy?"BUY":"SELL",entry:price,sl:sig.stopLoss,tp:sig.tp1};
    }
  }
  results.winRate=results.totalTrades>0?Math.round((results.wins/results.totalTrades)*100):0;
  results.profitFactor=results.totalLost>0?Math.round((results.totalWon/results.totalLost)*100)/100:results.totalWon>0?99:0;
  if(pnlHistory.length>1){const mean=pnlHistory.reduce((a,b)=>a+b,0)/pnlHistory.length;const std=Math.sqrt(pnlHistory.reduce((a,b)=>a+(b-mean)**2,0)/pnlHistory.length);results.sharpe=std>0?Math.round((mean/std)*100)/100:0;}
  results.finalBalance=Math.round(results.balance*100)/100;
  results.return=Math.round(((results.balance-1000)/1000)*100*10)/10;
  return results;
}

// Walk-Forward: split history into sequential windows, test the SAME strategy
// settings on each independently. Consistent positive results across windows
// = robust strategy. Only working in one window = likely curve-fit/lucky.
function runWalkForwardTest(candles,strategy,windows=4){
  if(!candles||candles.length<200)return null;
  const windowSize=Math.floor(candles.length/windows);
  const results=[];
  for(let w=0;w<windows;w++){
    const start=w*windowSize;
    const end=w===windows-1?candles.length:(w+1)*windowSize;
    const segment=candles.slice(start,end);
    if(segment.length<50)continue;
    const r=runBacktest(segment,strategy);
    if(r)results.push({window:w+1,...r});
  }
  if(results.length===0)return null;
  const returns=results.map(r=>r.return);
  const avgReturn=returns.reduce((a,b)=>a+b,0)/returns.length;
  const positiveWindows=results.filter(r=>r.return>0).length;
  const consistency=Math.round((positiveWindows/results.length)*100);
  const stdReturn=Math.sqrt(returns.reduce((a,b)=>a+(b-avgReturn)**2,0)/(returns.length||1));
  return{windows:results,avgReturn:Math.round(avgReturn*10)/10,consistency,positiveWindows,totalWindows:results.length,stdReturn:Math.round(stdReturn*10)/10};
}

// Monte Carlo: reshuffle the actual trade P&L sequence thousands of times to
// reveal the realistic range of outcomes (median/5th/95th percentile) and
// worst-case drawdown risk — a single backtest run hides this sequence risk.
function runMonteCarloSimulation(trades,startBalance=1000,runs=1000){
  if(!trades||trades.length<5)return null;
  const pnls=trades.map(t=>t.pnl);
  const finalBalances=[];
  const maxDrawdowns=[];
  for(let i=0;i<runs;i++){
    const shuffled=[...pnls];
    for(let j=shuffled.length-1;j>0;j--){
      const k=Math.floor(Math.random()*(j+1));
      const tmp=shuffled[j];shuffled[j]=shuffled[k];shuffled[k]=tmp;
    }
    let balance=startBalance,peak=startBalance,maxDD=0;
    shuffled.forEach(pnl=>{
      balance+=pnl;
      if(balance>peak)peak=balance;
      const dd=(peak-balance)/peak*100;
      if(dd>maxDD)maxDD=dd;
    });
    finalBalances.push(balance);
    maxDrawdowns.push(maxDD);
  }
  finalBalances.sort((a,b)=>a-b);
  maxDrawdowns.sort((a,b)=>a-b);
  const pct=(arr,p)=>arr[Math.min(arr.length-1,Math.floor(arr.length*p))];
  const ruinCount=finalBalances.filter(b=>b<startBalance*0.5).length;
  return{
    median:Math.round(pct(finalBalances,0.5)*100)/100,
    p5:Math.round(pct(finalBalances,0.05)*100)/100,
    p95:Math.round(pct(finalBalances,0.95)*100)/100,
    worstDD:Math.round(pct(maxDrawdowns,0.95)*10)/10,
    medianDD:Math.round(pct(maxDrawdowns,0.5)*10)/10,
    probRuin:Math.round((ruinCount/runs)*100),
    runs
  };
}

const NEWS=[
  {headline:"Federal Reserve signals rate pause — crypto markets rally",sentiment:"bullish",time:"2m ago",impact:"HIGH",score:85},
  {headline:"Bitcoin ETF sees record $480M inflow in single session",sentiment:"bullish",time:"8m ago",impact:"HIGH",score:92},
  {headline:"SEC approves spot Ethereum ETF for institutions",sentiment:"bullish",time:"15m ago",impact:"HIGH",score:88},
  {headline:"Whale moves 12,000 BTC to exchange — sell pressure?",sentiment:"bearish",time:"22m ago",impact:"MED",score:35},
  {headline:"On-chain HODLer accumulation highest since 2020",sentiment:"bullish",time:"31m ago",impact:"MED",score:75},
  {headline:"Solana DeFi TVL surges past $12B",sentiment:"bullish",time:"1h ago",impact:"MED",score:70},
  {headline:"Regulatory crackdown in South Korea hits volumes",sentiment:"bearish",time:"1h ago",impact:"LOW",score:40},
  {headline:"MicroStrategy adds 4,200 BTC to treasury",sentiment:"bullish",time:"2h ago",impact:"MED",score:72},
  {headline:"Crypto Fear and Greed Index at 78 — Extreme Greed",sentiment:"bearish",time:"3h ago",impact:"MED",score:30},
  {headline:"Layer 2 solutions see record transaction volumes",sentiment:"bullish",time:"4h ago",impact:"LOW",score:65},
];
const newsSentimentScore=Math.round(NEWS.reduce((a,n)=>a+n.score,0)/NEWS.length);

function Badge({color,children,small}){return <span style={{background:color+"22",border:"1px solid "+color,color,padding:small?"1px 6px":"2px 10px",borderRadius:4,fontSize:small?9:11,fontFamily:"monospace",fontWeight:700,letterSpacing:"0.1em",whiteSpace:"nowrap"}}>{children}</span>;}
function SignalBadge({direction}){const map={"STRONG BUY":C.green,"BUY":C.green,"NEUTRAL":C.slate,"SELL":C.red,"STRONG SELL":C.red};return <Badge color={map[direction]||C.slate}>{direction}</Badge>;}
function DataBadge({status}){const map={binance:{l:"● LIVE",c:C.green},coingecko:{l:"◆ GECKO",c:C.gold},initializing:{l:"◌ INIT",c:C.slate},simulated:{l:"◌ SIM",c:C.purple}};const s=map[status]||map.initializing;return <span style={{color:s.c,fontSize:10,fontFamily:"monospace"}}>{s.l}</span>;}
function Gauge({value,label,color}){const pct=Math.max(0,Math.min(100,value))/100;return(<div style={{textAlign:"center"}}><svg width={64} height={48} style={{overflow:"visible"}}><path d="M 6 42 A 24 24 0 1 1 58 42" fill="none" stroke={C.bg3} strokeWidth={5} strokeLinecap="round"/><path d="M 6 42 A 24 24 0 1 1 58 42" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeDasharray={(pct*75.4)+" 75.4"}/><text x={32} y={38} textAnchor="middle" fill={color} fontSize={10} fontWeight="700" fontFamily="monospace">{Math.round(value)}</text></svg><div style={{color:C.slate,fontSize:7,marginTop:-2,fontFamily:"monospace"}}>{label}</div></div>);}
// ── Error Boundary ─────────────────────────────────────────────────
class ErrorBoundary extends React.Component{
  constructor(props){super(props);this.state={hasError:false,error:null};}
  static getDerivedStateFromError(error){return{hasError:true,error};}
  render(){
    if(this.state.hasError)return(
      <div style={{background:"#060A0E",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",padding:20}}>
        <div style={{textAlign:"center",maxWidth:500}}>
          <div style={{color:"#00C8FF",fontSize:28,fontWeight:700,marginBottom:16}}>◈ NEXUS</div>
          <div style={{color:"#EF476F",fontSize:14,marginBottom:12}}>Something went wrong.</div>
          <div style={{color:"#4A6080",fontSize:11,marginBottom:20,wordBreak:"break-all"}}>{this.state.error?.message}</div>
          <button onClick={()=>window.location.reload()} style={{background:"#003D4F",border:"1px solid #00C8FF",color:"#00C8FF",padding:"10px 24px",borderRadius:6,cursor:"pointer",fontFamily:"monospace",fontSize:12,fontWeight:700}}>RELOAD APP</button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

// ── Auth Screen ────────────────────────────────────────────────────
function AuthScreen({onAuth}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [pin,setPin]=useState("");
  const [confirmPin,setConfirmPin]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [msg,setMsg]=useState("");
  const [pendingUser,setPendingUser]=useState(null);

  useEffect(()=>{
    try{
      supabase.auth.getSession().then(async({data:{session}})=>{
        try{
          if(session?.user){
            const{data:profile}=await supabase.from("profiles").select("pin_hash").eq("id",session.user.id).single();
            if(profile?.pin_hash){setPendingUser(session.user);setMode("pin");}
            else{setPendingUser(session.user);setMode("setpin");}
          }
        }catch(e){console.log("Session check error:",e);}
      }).catch(e=>console.log("getSession error:",e));
    }catch(e){console.log("Auth init error:",e);}
  },[]);

  async function handleLogin(){
    if(!email||!password){setError("Please enter email and password");return;}
    setLoading(true);setError("");
    const{data,error:err}=await supabase.auth.signInWithPassword({email,password});
    if(err){setError(err.message);setLoading(false);return;}
    if(data.user){
      const{data:profile}=await supabase.from("profiles").select("pin_hash").eq("id",data.user.id).single();
      if(profile?.pin_hash){setPendingUser(data.user);setMode("pin");}
      else{setPendingUser(data.user);setMode("setpin");}
    }
    setLoading(false);
  }
  async function handleSignup(){
    if(!email||!password){setError("Please enter email and password");return;}
    if(password.length<6){setError("Password must be at least 6 characters");return;}
    setLoading(true);setError("");
    const{data,error:err}=await supabase.auth.signUp({email,password});
    if(err){setError(err.message);setLoading(false);return;}
    if(data.user){setPendingUser(data.user);setMode("setpin");}
    setLoading(false);
  }
  async function handleSetPin(){
    if(pin.length<4){setError("PIN must be at least 4 digits");return;}
    if(pin!==confirmPin){setError("PINs do not match");return;}
    setLoading(true);setError("");
    const hash=await hashPin(pin);
    await supabase.from("profiles").upsert({id:pendingUser.id,pin_hash:hash});
    onAuth(pendingUser);setLoading(false);
  }
  async function handlePinLogin(){
    if(pin.length<4){setError("Enter your PIN");return;}
    setLoading(true);setError("");
    const{data:profile}=await supabase.from("profiles").select("pin_hash").eq("id",pendingUser.id).single();
    const hash=await hashPin(pin);
    if(profile?.pin_hash===hash){onAuth(pendingUser);}
    else{setError("Incorrect PIN. Try again.");setPin("");}
    setLoading(false);
  }
  async function handleForgotPin(){
    setLoading(true);
    await supabase.from("profiles").update({pin_hash:null}).eq("id",pendingUser.id);
    setMode("login");setMsg("PIN cleared. Log in again to set a new PIN.");setLoading(false);
  }

  const PinPad=({value,onChange})=>(
    <div>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>
        {[0,1,2,3,4,5].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<value.length?C.cyan:C.bg3,border:"1px solid "+(i<value.length?C.cyan:C.border)}}/>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,maxWidth:220,margin:"0 auto"}}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((n,i)=>(
          <button key={i} onClick={()=>{if(n==="⌫")onChange(value.slice(0,-1));else if(n!==""&&value.length<6)onChange(value+n);}} style={{padding:"15px 0",borderRadius:8,border:"1px solid "+C.border,background:n===""?C.bg0:C.bg3,color:C.white,fontSize:18,cursor:n===""?"default":"pointer",fontFamily:"monospace"}}>{n}</button>
        ))}
      </div>
    </div>
  );

  return(
    <div style={{background:C.bg0,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"monospace"}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{color:C.cyan,fontSize:36,fontWeight:700,letterSpacing:"-0.02em",marginBottom:6}}>◈ NEXUS</div>
          <div style={{color:C.slate,fontSize:11,letterSpacing:"0.15em"}}>AI TRADING TERMINAL</div>
        </div>
        <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:24}}>
          {msg&&<div style={{background:C.greenDim,border:"1px solid "+C.green,borderRadius:6,padding:10,marginBottom:14,color:C.green,fontSize:11,textAlign:"center"}}>{msg}</div>}
          {error&&<div style={{background:C.redDim,border:"1px solid "+C.red,borderRadius:6,padding:10,marginBottom:14,color:C.red,fontSize:11,textAlign:"center"}}>{error}</div>}
          {(mode==="login"||mode==="signup")&&<>
            <div style={{display:"flex",gap:4,marginBottom:20,background:C.bg2,padding:4,borderRadius:8}}>
              {[["login","SIGN IN"],["signup","SIGN UP"]].map(([m,l])=>(<button key={m} onClick={()=>{setMode(m);setError("");}} style={{flex:1,padding:"9px 0",borderRadius:6,border:"none",cursor:"pointer",background:mode===m?C.bg4:"none",color:mode===m?C.white:C.slate,fontFamily:"monospace",fontSize:12,fontWeight:mode===m?700:400}}>{l}</button>))}
            </div>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:6,color:C.white,padding:"12px 14px",fontFamily:"monospace",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(mode==="login"?handleLogin():handleSignup())} placeholder="Password" style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:6,color:C.white,padding:"12px 14px",fontFamily:"monospace",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
            <button onClick={mode==="login"?handleLogin:handleSignup} disabled={loading} style={{width:"100%",padding:"13px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.cyan,color:"#000",fontWeight:700,fontFamily:"monospace",fontSize:14}}>{loading?"PLEASE WAIT...":(mode==="login"?"SIGN IN":"CREATE ACCOUNT")}</button>
          </>}
          {mode==="setpin"&&<>
            <div style={{textAlign:"center",marginBottom:20}}><div style={{color:C.white,fontSize:14,fontWeight:700,marginBottom:6}}>Set Your PIN</div><div style={{color:C.slate,fontSize:11}}>Choose a 4-6 digit PIN for quick access</div></div>
            <PinPad value={pin} onChange={setPin}/>
            {pin.length>=4&&<><div style={{textAlign:"center",margin:"16px 0 8px",color:C.slate,fontSize:11}}>Confirm PIN</div><PinPad value={confirmPin} onChange={setConfirmPin}/></>}
            {pin.length>=4&&confirmPin.length>=4&&<button onClick={handleSetPin} disabled={loading} style={{width:"100%",padding:"13px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.green,color:"#000",fontWeight:700,fontFamily:"monospace",fontSize:14,marginTop:16}}>{loading?"SAVING...":"SET PIN & ENTER"}</button>}
          </>}
          {mode==="pin"&&<>
            <div style={{textAlign:"center",marginBottom:20}}><div style={{color:C.white,fontSize:14,fontWeight:700,marginBottom:6}}>Welcome Back</div><div style={{color:C.slate,fontSize:11}}>Enter your PIN to unlock NEXUS</div></div>
            <PinPad value={pin} onChange={setPin}/>
            {pin.length>=4&&<button onClick={handlePinLogin} disabled={loading} style={{width:"100%",padding:"13px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.cyan,color:"#000",fontWeight:700,fontFamily:"monospace",fontSize:14,marginTop:16}}>{loading?"CHECKING...":"UNLOCK NEXUS"}</button>}
            <button onClick={handleForgotPin} style={{width:"100%",padding:"8px 0",borderRadius:6,border:"1px solid "+C.border,background:"none",color:C.dimText,fontFamily:"monospace",fontSize:10,marginTop:8,cursor:"pointer"}}>Forgot PIN? Sign in with email</button>
          </>}
        </div>
      </div>
    </div>
  );
}

// ── Candle Chart — fully connected to open trades + all overlays ───
function CandleChart({candles,signal,timeframe,onTimeframeChange,openOrders,pair,prices,onCloseOrder,onMoveStop}){
  const [showBB,setShowBB]=useState(true);
  const [showEMAs,setShowEMAs]=useState(true);
  const [showVWAP,setShowVWAP]=useState(true);
  const [showVWAPBands,setShowVWAPBands]=useState(false);
  const [showST,setShowST]=useState(true);
  const [showPivots,setShowPivots]=useState(false);
  const [showIch,setShowIch]=useState(false);
  const [showFib,setShowFib]=useState(false);
  const [showPSAR,setShowPSAR]=useState(false);
  const [showTrades,setShowTrades]=useState(true);
  const [showSignal,setShowSignal]=useState(true);
  const [chartType,setChartType]=useState("candle");
  const containerRef=useRef(null);
  const [chartWidth,setChartWidth]=useState(530);
  // Pan/scroll state
  const [panOffset,setPanOffset]=useState(0);
  const [candleCount,setCandleCount]=useState(80);
  const touchStartX=useRef(null);
  const lastPanOffset=useRef(0);

  // Responsive width
  useEffect(()=>{
    function updateWidth(){
      if(containerRef.current){
        setChartWidth(containerRef.current.offsetWidth||530);
      }
    }
    updateWidth();
    const ro=new ResizeObserver(updateWidth);
    if(containerRef.current)ro.observe(containerRef.current);
    return()=>ro.disconnect();
  },[]);

  if(!candles||candles.length<5)return <div style={{color:C.dimText,textAlign:"center",padding:40,fontFamily:"monospace"}}>Loading chart data...</div>;

  const height=220;
  const totalCandles=candles.length;
  const visibleCount=Math.min(candleCount,totalCandles);
  const endIdx=Math.max(visibleCount,totalCandles-panOffset);
  const startIdx=Math.max(0,endIdx-visibleCount);
  const slice=candles.slice(startIdx,endIdx);
  const highs=slice.map(c=>c.high);
  const lows=slice.map(c=>c.low);

  // Include open trade prices in scale so they're always visible
  const pairOrders=(openOrders||[]).filter(o=>o.pair===pair);
  const tradePrices=pairOrders.flatMap(o=>[o.price,o.sl,o.tp,o.tp2,o.tp3].filter(Boolean));
  const allHighs=[...highs,...tradePrices];
  const allLows=[...lows,...tradePrices];

  const maxP=Math.max(...allHighs);
  const minP=Math.min(...allLows);
  const range=maxP-minP||1;
  const pad={t:12,b:16,l:4,r:72};
  const cw=(chartWidth-pad.l-pad.r)/slice.length;
  const sY=p=>pad.t+((maxP-p)/range)*(height-pad.t-pad.b);
  const closes=slice.map(c=>c.close);
  const e9=calcEMA(closes,9);
  const e21=calcEMA(closes,21);
  const e50=calcEMA(closes,Math.min(50,closes.length));
  const e200=calcEMA(closes,Math.min(200,closes.length));
  const bbv=calcBB(closes);
  const vwapV=calcVWAP(slice);
  const vwapBandsV=showVWAPBands?calcVWAPBands(slice):null;
  const stV=calcSupertrend(slice);
  const pivV=calcPivots(slice);
  const ichV=showIch&&slice.length>=52?calcIchimoku(slice):null;
  const fibV=showFib?calcFibLevels(slice):null;
  const psarPts=showPSAR?slice.map((_,i)=>i>4?calcParabolicSAR(slice.slice(0,i+1)):null):[];
  const pth=arr=>arr.map((v,i)=>(i===0?"M":"L")+(pad.l+i*cw+cw/2)+","+sY(v)).join(" ");
  const maxVol=Math.max(...slice.map(c=>c.volume));
  const currentPrice=prices?.[pair]||slice.at(-1).close;

  return(
    <div ref={containerRef} style={{width:"100%"}}>
      {/* Pan indicator */}
      {panOffset>0&&<div style={{background:C.goldDim,border:"1px solid "+C.gold+"44",borderRadius:4,padding:"3px 8px",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{color:C.gold,fontSize:9}}>◀ Viewing history ({panOffset} candles back)</span>
        <button onClick={()=>setPanOffset(0)} style={{background:"none",border:"none",color:C.gold,cursor:"pointer",fontSize:9}}>Jump to now →</button>
      </div>}
      {/* Timeframe row */}
      <div style={{display:"flex",gap:3,marginBottom:5,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{color:C.dimText,fontSize:9,fontFamily:"monospace",marginRight:2}}>TF:</span>
        {TIMEFRAMES.map(tf=><button key={tf.value} onClick={()=>onTimeframeChange(tf.value)} style={{padding:"2px 5px",borderRadius:3,border:"1px solid "+(timeframe===tf.value?C.cyan:C.border),background:timeframe===tf.value?C.cyanDim:"none",color:timeframe===tf.value?C.cyan:C.slate,fontSize:8,cursor:"pointer",fontFamily:"monospace"}}>{tf.label}</button>)}
        <div style={{width:1,height:12,background:C.border,margin:"0 3px"}}/>
        <button onClick={()=>setCandleCount(c=>Math.max(20,c-20))} style={{padding:"2px 6px",borderRadius:3,border:"1px solid "+C.border,background:C.bg3,color:C.slate,fontSize:9,cursor:"pointer"}}>+</button>
        <button onClick={()=>setCandleCount(c=>Math.min(300,c+20))} style={{padding:"2px 6px",borderRadius:3,border:"1px solid "+C.border,background:C.bg3,color:C.slate,fontSize:9,cursor:"pointer"}}>-</button>
        <span style={{color:C.dimText,fontSize:8}}>{candleCount}c</span>
        <div style={{width:1,height:12,background:C.border,margin:"0 3px"}}/>
        {["candle","line","bar","heikin"].map(t=><button key={t} onClick={()=>setChartType(t)} style={{padding:"2px 5px",borderRadius:3,border:"1px solid "+(chartType===t?C.gold:C.border),background:chartType===t?C.goldDim:"none",color:chartType===t?C.gold:C.slate,fontSize:8,cursor:"pointer",fontFamily:"monospace"}}>{t[0].toUpperCase()}</button>)}
      </div>
      {/* Overlay toggles */}
      <div style={{display:"flex",gap:3,marginBottom:6,flexWrap:"wrap"}}>
        {[{l:"BB",s:showBB,fn:setShowBB,c:C.cyan},{l:"EMA",s:showEMAs,fn:setShowEMAs,c:C.gold},{l:"VWAP",s:showVWAP,fn:setShowVWAP,c:C.orange},{l:"VWAP Bands",s:showVWAPBands,fn:setShowVWAPBands,c:C.orange},{l:"ST",s:showST,fn:setShowST,c:C.purple},{l:"Pivots",s:showPivots,fn:setShowPivots,c:C.green},{l:"Ichimoku",s:showIch,fn:setShowIch,c:C.blue},{l:"Fib",s:showFib,fn:setShowFib,c:C.gold},{l:"PSAR",s:showPSAR,fn:setShowPSAR,c:C.red},{l:"Trades",s:showTrades,fn:setShowTrades,c:C.white},{l:"Levels",s:showSignal,fn:setShowSignal,c:C.cyan}].map(({l,s,fn,c})=>(
          <button key={l} onClick={()=>fn(!s)} style={{padding:"2px 7px",borderRadius:3,border:"1px solid "+(s?c:C.border),background:s?c+"22":"none",color:s?c:C.dimText,fontSize:9,cursor:"pointer",fontFamily:"monospace"}}>{l}</button>
        ))}
      </div>
      {/* SVG Chart */}
      <svg width="100%" height={height+60} viewBox={`0 0 ${chartWidth} ${height+60}`} style={{display:"block",overflow:"visible",touchAction:"pan-y"}}
        onTouchStart={e=>{touchStartX.current=e.touches[0].clientX;lastPanOffset.current=panOffset;}}
        onTouchMove={e=>{
          if(touchStartX.current===null)return;
          const dx=touchStartX.current-e.touches[0].clientX;
          const candlesPerPx=visibleCount/chartWidth;
          const newOffset=Math.max(0,Math.min(totalCandles-visibleCount,Math.round(lastPanOffset.current+dx*candlesPerPx)));
          setPanOffset(newOffset);
        }}
        onTouchEnd={()=>{touchStartX.current=null;}}
        onMouseDown={e=>{touchStartX.current=e.clientX;lastPanOffset.current=panOffset;}}
        onMouseMove={e=>{
          if(e.buttons!==1||touchStartX.current===null)return;
          const dx=touchStartX.current-e.clientX;
          const candlesPerPx=visibleCount/chartWidth;
          const newOffset=Math.max(0,Math.min(totalCandles-visibleCount,Math.round(lastPanOffset.current+dx*candlesPerPx)));
          setPanOffset(newOffset);
        }}
        onMouseUp={()=>{touchStartX.current=null;}}
        onMouseLeave={()=>{touchStartX.current=null;}}
      >
        {/* BB Band */}
        {showBB&&<><rect x={pad.l} y={sY(bbv.upper)} width={chartWidth-pad.l-pad.r} height={Math.max(0,sY(bbv.lower)-sY(bbv.upper))} fill={C.cyanDim} opacity={0.12}/><line x1={pad.l} x2={chartWidth-pad.r} y1={sY(bbv.middle)} y2={sY(bbv.middle)} stroke={C.cyan} strokeWidth={0.5} strokeDasharray="3,3" opacity={0.4}/></>}
        {/* Ichimoku cloud */}
        {showIch&&ichV&&<><rect x={pad.l} y={Math.min(sY(ichV.senkouA),sY(ichV.senkouB))} width={chartWidth-pad.l-pad.r} height={Math.abs(sY(ichV.senkouA)-sY(ichV.senkouB))} fill={ichV.senkouA>ichV.senkouB?C.green:C.red} opacity={0.08}/><line x1={pad.l} x2={chartWidth-pad.r} y1={sY(ichV.tenkan)} y2={sY(ichV.tenkan)} stroke={C.blue} strokeWidth={1} opacity={0.6}/><line x1={pad.l} x2={chartWidth-pad.r} y1={sY(ichV.kijun)} y2={sY(ichV.kijun)} stroke={C.red} strokeWidth={1} opacity={0.6}/></>}
        {/* Fib levels */}
        {showFib&&fibV&&[{p:fibV.r236,l:"0.236"},{p:fibV.r382,l:"0.382"},{p:fibV.r500,l:"0.5"},{p:fibV.r618,l:"0.618"},{p:fibV.r786,l:"0.786"}].map(({p,l})=>p>minP&&p<maxP?(<g key={l}><line x1={pad.l} x2={chartWidth-pad.r} y1={sY(p)} y2={sY(p)} stroke={C.gold} strokeWidth={0.5} strokeDasharray="3,5" opacity={0.6}/><text x={chartWidth-pad.r+2} y={sY(p)+3} fill={C.gold} fontSize={6} fontFamily="monospace">{l}</text></g>):null)}
        {/* Pivot levels */}
        {showPivots&&[{p:pivV.pp,c:"#888",l:"PP"},{p:pivV.r1,c:C.red,l:"R1"},{p:pivV.r2,c:C.red,l:"R2"},{p:pivV.s1,c:C.green,l:"S1"},{p:pivV.s2,c:C.green,l:"S2"}].map(({p,c,l})=>p>minP&&p<maxP?(<g key={l}><line x1={pad.l} x2={chartWidth-pad.r} y1={sY(p)} y2={sY(p)} stroke={c} strokeWidth={0.5} strokeDasharray="2,4" opacity={0.5}/><text x={chartWidth-pad.r+2} y={sY(p)+3} fill={c} fontSize={6} fontFamily="monospace">{l}</text></g>):null)}
        {/* VWAP */}
        {showVWAP&&vwapV>minP&&vwapV<maxP&&<><line x1={pad.l} x2={chartWidth-pad.r} y1={sY(vwapV)} y2={sY(vwapV)} stroke={C.orange} strokeWidth={1} strokeDasharray="5,3" opacity={0.8}/><text x={chartWidth-pad.r+2} y={sY(vwapV)+3} fill={C.orange} fontSize={6} fontFamily="monospace">VWAP</text></>}
        {showVWAPBands&&vwapBandsV&&vwapBandsV.vwap>0&&<>
          {vwapBandsV.upper1<maxP&&vwapBandsV.upper1>minP&&<line x1={pad.l} x2={chartWidth-pad.r} y1={sY(vwapBandsV.upper1)} y2={sY(vwapBandsV.upper1)} stroke={C.orange} strokeWidth={0.6} strokeDasharray="2,4" opacity={0.5}/>}
          {vwapBandsV.lower1<maxP&&vwapBandsV.lower1>minP&&<line x1={pad.l} x2={chartWidth-pad.r} y1={sY(vwapBandsV.lower1)} y2={sY(vwapBandsV.lower1)} stroke={C.orange} strokeWidth={0.6} strokeDasharray="2,4" opacity={0.5}/>}
          {vwapBandsV.upper2<maxP&&vwapBandsV.upper2>minP&&<line x1={pad.l} x2={chartWidth-pad.r} y1={sY(vwapBandsV.upper2)} y2={sY(vwapBandsV.upper2)} stroke={C.orange} strokeWidth={0.6} strokeDasharray="1,5" opacity={0.35}/>}
          {vwapBandsV.lower2<maxP&&vwapBandsV.lower2>minP&&<line x1={pad.l} x2={chartWidth-pad.r} y1={sY(vwapBandsV.lower2)} y2={sY(vwapBandsV.lower2)} stroke={C.orange} strokeWidth={0.6} strokeDasharray="1,5" opacity={0.35}/>}
        </>}
        {/* Supertrend */}
        {showST&&stV.value>minP&&stV.value<maxP&&<><line x1={pad.l} x2={chartWidth-pad.r} y1={sY(stV.value)} y2={sY(stV.value)} stroke={stV.trend==="up"?C.green:C.red} strokeWidth={1.5} opacity={0.7}/><text x={chartWidth-pad.r+2} y={sY(stV.value)+3} fill={stV.trend==="up"?C.green:C.red} fontSize={6} fontFamily="monospace">ST</text></>}
        {/* Signal levels */}
        {showSignal&&signal&&[{p:signal.entry,c:C.white,l:"ENTRY"},{p:signal.stopLoss,c:C.red,l:"SL"},{p:signal.tp1,c:C.green,l:"TP1"},{p:signal.tp2,c:C.green,l:"TP2"},{p:signal.tp3,c:C.gold,l:"TP3"}].map(({p,c,l})=>p>minP&&p<maxP?(<g key={l}><line x1={pad.l} x2={chartWidth-pad.r} y1={sY(p)} y2={sY(p)} stroke={c} strokeWidth={0.8} strokeDasharray="4,3" opacity={0.6}/><rect x={chartWidth-pad.r+1} y={sY(p)-5} width={44} height={10} fill={c+"22"} rx={2}/><text x={chartWidth-pad.r+3} y={sY(p)+3} fill={c} fontSize={6} fontFamily="monospace">{l}</text></g>):null)}
        {/* OPEN TRADE OVERLAYS — fully connected */}
        {showTrades&&pairOrders.map((order,oi)=>{
          const isBuy=order.side==="BUY";
          const pnl=(currentPrice-order.price)*order.qty*(isBuy?1:-1)*(order.leverage||1);
          const inRange=(p)=>p&&p>minP&&p<maxP;
          const orderColor=isBuy?C.green:C.red;
          return(
            <g key={order.id}>
              {/* Entry line — thick solid */}
              {inRange(order.price)&&<>
                <line x1={pad.l} x2={chartWidth-pad.r} y1={sY(order.price)} y2={sY(order.price)} stroke={orderColor} strokeWidth={2} opacity={0.9}/>
                <rect x={pad.l} y={sY(order.price)-9} width={chartWidth-pad.l-pad.r} height={18} fill={orderColor} opacity={0.06}/>
                <rect x={chartWidth-pad.r+1} y={sY(order.price)-8} width={70} height={16} fill={orderColor+"33"} rx={3}/>
                <text x={chartWidth-pad.r+4} y={sY(order.price)-1} fill={orderColor} fontSize={7} fontFamily="monospace" fontWeight="bold">{order.side} ENTRY</text>
                <text x={chartWidth-pad.r+4} y={sY(order.price)+7} fill={orderColor} fontSize={6} fontFamily="monospace">{fmtUSD(order.price)}</text>
              </>}
              {/* Stop Loss line — red dashed */}
              {inRange(order.sl)&&<>
                <line x1={pad.l} x2={chartWidth-pad.r} y1={sY(order.sl)} y2={sY(order.sl)} stroke={C.red} strokeWidth={1.5} strokeDasharray="6,3" opacity={0.9}/>
                <rect x={chartWidth-pad.r+1} y={sY(order.sl)-5} width={44} height={11} fill={C.red+"33"} rx={2}/>
                <text x={chartWidth-pad.r+3} y={sY(order.sl)+3} fill={C.red} fontSize={6} fontFamily="monospace">SL {fmtUSD(order.sl)}</text>
              </>}
              {/* TP1 line — green dashed */}
              {inRange(order.tp)&&<>
                <line x1={pad.l} x2={chartWidth-pad.r} y1={sY(order.tp)} y2={sY(order.tp)} stroke={C.green} strokeWidth={1.5} strokeDasharray="6,3" opacity={0.9}/>
                <rect x={chartWidth-pad.r+1} y={sY(order.tp)-5} width={44} height={11} fill={C.green+"33"} rx={2}/>
                <text x={chartWidth-pad.r+3} y={sY(order.tp)+3} fill={C.green} fontSize={6} fontFamily="monospace">TP1 {fmtUSD(order.tp)}</text>
              </>}
              {/* TP2 line */}
              {inRange(order.tp2)&&<>
                <line x1={pad.l} x2={chartWidth-pad.r} y1={sY(order.tp2)} y2={sY(order.tp2)} stroke={C.green} strokeWidth={1} strokeDasharray="4,4" opacity={0.7}/>
                <text x={chartWidth-pad.r+3} y={sY(order.tp2)+3} fill={C.green} fontSize={6} fontFamily="monospace">TP2 {fmtUSD(order.tp2)}</text>
              </>}
              {/* TP3 line */}
              {inRange(order.tp3)&&<>
                <line x1={pad.l} x2={chartWidth-pad.r} y1={sY(order.tp3)} y2={sY(order.tp3)} stroke={C.gold} strokeWidth={1} strokeDasharray="4,4" opacity={0.7}/>
                <text x={chartWidth-pad.r+3} y={sY(order.tp3)+3} fill={C.gold} fontSize={6} fontFamily="monospace">TP3 {fmtUSD(order.tp3)}</text>
              </>}
              {/* Trailing stop indicator */}
              {order.useTrail&&order.trailSL&&inRange(order.trailSL)&&<>
                <line x1={pad.l} x2={chartWidth-pad.r} y1={sY(order.trailSL)} y2={sY(order.trailSL)} stroke={C.orange} strokeWidth={1.5} strokeDasharray="3,2" opacity={0.9}/>
                <text x={chartWidth-pad.r+3} y={sY(order.trailSL)+3} fill={C.orange} fontSize={6} fontFamily="monospace">TRAIL {fmtUSD(order.trailSL)}</text>
              </>}
              {/* Current price vs entry — shaded profit/loss zone */}
              {inRange(order.price)&&inRange(currentPrice)&&<rect x={pad.l} y={Math.min(sY(order.price),sY(currentPrice))} width={chartWidth-pad.l-pad.r} height={Math.abs(sY(order.price)-sY(currentPrice))} fill={pnl>=0?C.green:C.red} opacity={0.05}/>}
              {/* PnL badge on chart */}
              {inRange(order.price)&&<>
                <rect x={pad.l+8} y={sY(order.price)-(isBuy?20:5)} width={90} height={14} fill={C.bg0} rx={3} opacity={0.9}/>
                <text x={pad.l+12} y={sY(order.price)-(isBuy?10:5)+9} fill={pnl>=0?C.green:C.red} fontSize={8} fontFamily="monospace" fontWeight="bold">{pnl>=0?"▲ +":pnl<0?"▼ ":""}{fmtUSD(pnl)} {order.isDemo?"[D]":""}</text>
              </>}
            </g>
          );
        })}
        {/* Current price line */}
        {currentPrice>minP&&currentPrice<maxP&&<>
          <line x1={pad.l} x2={chartWidth-pad.r} y1={sY(currentPrice)} y2={sY(currentPrice)} stroke={C.cyan} strokeWidth={0.8} strokeDasharray="2,3" opacity={0.5}/>
          <rect x={chartWidth-pad.r+1} y={sY(currentPrice)-5} width={70} height={11} fill={C.cyan+"22"} rx={2}/>
          <text x={chartWidth-pad.r+3} y={sY(currentPrice)+3} fill={C.cyan} fontSize={7} fontFamily="monospace" fontWeight="bold">{fmtUSD(currentPrice)}</text>
        </>}
        {/* Candles */}
        {slice.map((c,i)=>{
          let open=c.open,close=c.close,high=c.high,low=c.low;
          if(chartType==="heikin"&&i>0){const prev=slice[i-1];close=(c.open+c.high+c.low+c.close)/4;open=(prev.open+prev.close)/2;high=Math.max(c.high,open,close);low=Math.min(c.low,open,close);}
          const x=pad.l+i*cw+cw*0.1,bw=cw*0.8;
          const isUp=close>=open,col=isUp?C.green:C.red;
          const cy=sY(Math.max(open,close)),ch=Math.max(1,Math.abs(sY(open)-sY(close)));
          return(<g key={i}>
            <rect x={x} y={height+8} width={bw} height={(c.volume/maxVol)*28} fill={isUp?C.green:C.red} opacity={0.3}/>
            {(chartType==="candle"||chartType==="heikin")&&<><line x1={x+bw/2} x2={x+bw/2} y1={sY(high)} y2={sY(low)} stroke={col} strokeWidth={0.8}/><rect x={x} y={cy} width={bw} height={ch} fill={col} opacity={0.85}/></>}
            {chartType==="bar"&&<><line x1={x+bw/2} x2={x+bw/2} y1={sY(c.high)} y2={sY(c.low)} stroke={col} strokeWidth={1}/><line x1={x} x2={x+bw/2} y1={sY(c.open)} y2={sY(c.open)} stroke={col} strokeWidth={1}/><line x1={x+bw/2} x2={x+bw} y1={sY(c.close)} y2={sY(c.close)} stroke={col} strokeWidth={1}/></>}
            {chartType==="line"&&i>0&&<line x1={pad.l+(i-1)*cw+cw/2} x2={pad.l+i*cw+cw/2} y1={sY(slice[i-1].close)} y2={sY(c.close)} stroke={C.cyan} strokeWidth={1.5}/>}
            {showPSAR&&psarPts[i]&&psarPts[i].sar>minP&&psarPts[i].sar<maxP&&<circle cx={x+bw/2} cy={sY(psarPts[i].sar)} r={1.5} fill={psarPts[i].trend==="up"?C.green:C.red} opacity={0.8}/>}
          </g>);})}
        {/* EMAs on top */}
        {showEMAs&&<><path d={pth(e9)} fill="none" stroke={C.purple} strokeWidth={1} opacity={0.8}/><path d={pth(e21)} fill="none" stroke={C.gold} strokeWidth={1} opacity={0.8}/><path d={pth(e50)} fill="none" stroke={C.cyan} strokeWidth={1} opacity={0.7}/><path d={pth(e200)} fill="none" stroke={C.white} strokeWidth={0.8} opacity={0.4}/></>}
        {/* Price grid */}
        {[0,0.25,0.5,0.75,1].map(t=>{const p=maxP-t*range;return(<g key={t}><line x1={pad.l} x2={chartWidth-pad.r} y1={sY(p)} y2={sY(p)} stroke={C.border} strokeWidth={0.3} opacity={0.4}/><text x={chartWidth-pad.r+2} y={sY(p)+3} fill={C.dimText} fontSize={6} fontFamily="monospace">{fmtUSD(p)}</text></g>);})}
        {/* EMA Legend */}
        {showEMAs&&[{c:C.purple,l:"9"},{c:C.gold,l:"21"},{c:C.cyan,l:"50"},{c:C.white,l:"200"}].map(({c,l},i)=>(<g key={l}><rect x={pad.l+i*40} y={height+44} width={10} height={2} fill={c}/><text x={pad.l+i*40+13} y={height+48} fill={C.dimText} fontSize={7} fontFamily="monospace">EMA{l}</text></g>))}
        {/* Trade legend */}
        {showTrades&&pairOrders.length>0&&<>
          <rect x={pad.l} y={height+44} width={8} height={2} fill={C.green}/>
          <text x={pad.l+11} y={height+48} fill={C.dimText} fontSize={7} fontFamily="monospace">{pairOrders.length} open trade{pairOrders.length>1?"s":""}</text>
        </>}
      </svg>
      {/* Open trade quick controls below chart */}
      {showTrades&&pairOrders.length>0&&(
        <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:5}}>
          {pairOrders.map(order=>{
            const isBuy=order.side==="BUY";
            const pnl=(currentPrice-order.price)*order.qty*(isBuy?1:-1)*(order.leverage||1);
            return(
              <div key={order.id} style={{background:C.bg2,borderRadius:6,padding:"8px 12px",border:"1px solid "+(pnl>=0?C.green:C.red)+"44",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{color:isBuy?C.green:C.red,fontWeight:700,fontSize:11,fontFamily:"monospace"}}>{order.side}</span>
                  <span style={{color:C.white,fontSize:10,fontFamily:"monospace"}}>{order.qty} @ {fmtUSD(order.price)}</span>
                  <span style={{color:pnl>=0?C.green:C.red,fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{pnl>=0?"+":""}{fmtUSD(pnl)}</span>
                  {order.useTrail&&<Badge color={C.orange} small>TRAIL</Badge>}
                  {order.tp1Hit&&<Badge color={C.cyan} small>BE</Badge>}
                  {order.autoPlaced&&<Badge color={C.purple} small>AUTO</Badge>}
                  {order.isDemo&&<Badge color={C.purple} small>DEMO</Badge>}
                </div>
                <div style={{display:"flex",gap:5}}>
                  <button onClick={()=>onMoveStop&&onMoveStop(order.id,order.price)} style={{background:C.bg3,border:"1px solid "+C.cyan,color:C.cyan,padding:"3px 8px",borderRadius:3,cursor:"pointer",fontSize:9,fontFamily:"monospace"}}>→ BE</button>
                  <button onClick={()=>onCloseOrder&&onCloseOrder(order.id)} style={{background:C.redDim,border:"1px solid "+C.red,color:C.red,padding:"3px 10px",borderRadius:3,cursor:"pointer",fontSize:9,fontFamily:"monospace",fontWeight:700}}>CLOSE</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
// ── Order Modal ────────────────────────────────────────────────────
function OrderModal({pair,signal,price,isDemo,balance,strategy,onClose,onPlace}){
  const [mode,setMode]=useState("spot");
  const [side,setSide]=useState(signal?.direction.includes("BUY")?"BUY":"SELL");
  const [orderType,setOrderType]=useState("LIMIT");
  const [twapMinutes,setTwapMinutes]=useState("5");
  const [visibleQtyPct,setVisibleQtyPct]=useState("20");
  const [qty,setQty]=useState("");
  const [limitPrice,setLimitPrice]=useState(signal?fmt(signal.entry,4):fmt(price,4));
  const [sl,setSl]=useState(signal?fmt(signal.stopLoss,4):fmt(price*0.97,4));
  const [tp1,setTp1]=useState(signal?fmt(signal.tp1,4):fmt(price*1.02,4));
  const [tp2,setTp2]=useState(signal?fmt(signal.tp2,4):fmt(price*1.04,4));
  const [tp3,setTp3]=useState(signal?fmt(signal.tp3,4):fmt(price*1.07,4));
  const [tp1Pct,setTp1Pct]=useState("40");
  const [tp2Pct,setTp2Pct]=useState("40");
  const [tp3Pct,setTp3Pct]=useState("20");
  const [trailPct,setTrailPct]=useState("1.5");
  const [trailAtr,setTrailAtr]=useState("2");
  const [trailType,setTrailType]=useState("pct");
  const [leverage,setLeverage]=useState(1);
  const [riskPct,setRiskPct]=useState("1.5");
  const [useOCO,setUseOCO]=useState(true);
  const [useTrail,setUseTrail]=useState(false);
  const [useBE,setUseBE]=useState(true);
  const [activeTab,setActiveTab]=useState("order");
  const base=pair.split("/")[0];
  const riskAmount=(balance||50000)*(parseFloat(riskPct)||1.5)/100;
  const slDistance=Math.abs(parseFloat(limitPrice||price)-parseFloat(sl||price*0.97));
  const autoQty=slDistance>0?(riskAmount/slDistance).toFixed(4):"0.0000";
  const displayQty=qty||autoQty;
  const total=parseFloat(displayQty||0)*parseFloat(limitPrice||price);
  const inp=(val,set,bdr,ph="")=>(<div style={{background:C.bg3,border:"1px solid "+(bdr||C.border),borderRadius:4,marginBottom:0}}><input value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:"100%",background:"none",border:"none",color:bdr&&bdr!==C.border?bdr:C.white,padding:"8px 10px",fontFamily:"monospace",fontSize:12,outline:"none",boxSizing:"border-box"}}/></div>);
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.88)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,width:"min(500px,96vw)",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 80px #000",margin:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:C.bg2,borderBottom:"1px solid "+C.border,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"12px 12px 0 0",position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{color:C.white,fontSize:16,fontWeight:700,fontFamily:"monospace"}}>{pair}</span>
            <span style={{color:C.cyan,fontSize:15,fontFamily:"monospace",fontWeight:700}}>{fmtUSD(price)}</span>
            {isDemo&&<Badge color={C.purple} small>DEMO</Badge>}
            {signal&&<SignalBadge direction={signal.direction}/>}
          </div>
          <button onClick={onClose} style={{background:C.bg3,border:"1px solid "+C.border,color:C.white,width:34,height:34,borderRadius:8,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
        </div>
        <div style={{padding:18}}>
          {strategy&&(strategy.walkForwardConsistency!==undefined&&strategy.walkForwardConsistency<50)&&<div style={{background:C.redDim,border:"1px solid "+C.red+"44",borderRadius:6,padding:"10px 12px",marginBottom:14}}>
            <div style={{color:C.red,fontSize:10,fontWeight:700,marginBottom:2}}>⚠ LOW ROBUSTNESS SCORE</div>
            <div style={{color:C.slate,fontSize:9,lineHeight:1.5}}>This strategy was only profitable in {strategy.walkForwardConsistency}% of tested historical periods — it may be overfit rather than genuinely reliable. Consider a smaller size or re-testing before entering.</div>
          </div>}
          {strategy&&(strategy.monteCarloProbRuin!==undefined&&strategy.monteCarloProbRuin>10)&&<div style={{background:C.redDim,border:"1px solid "+C.red+"44",borderRadius:6,padding:"10px 12px",marginBottom:14}}>
            <div style={{color:C.red,fontSize:10,fontWeight:700,marginBottom:2}}>⚠ ELEVATED RUIN RISK</div>
            <div style={{color:C.slate,fontSize:9,lineHeight:1.5}}>Monte Carlo simulation shows a {strategy.monteCarloProbRuin}% chance of losing over half your account with this strategy's trade sequence risk. Size accordingly.</div>
          </div>}
          <div style={{display:"flex",gap:4,marginBottom:14,background:C.bg2,padding:4,borderRadius:8}}>
            {[["spot","SPOT"],["futures","FUTURES"],["options","OPTIONS"]].map(([m,l])=>(<button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"8px 0",borderRadius:6,border:"none",cursor:"pointer",background:mode===m?C.bg4:"none",color:mode===m?C.white:C.slate,fontFamily:"monospace",fontSize:11,fontWeight:mode===m?700:400}}>{l}</button>))}
          </div>
          <div style={{display:"flex",gap:4,marginBottom:14,borderBottom:"1px solid "+C.border,paddingBottom:10}}>
            {[["order","ORDER"],["risk","RISK CALC"],["advanced","ADVANCED"]].map(([t,l])=>(<button key={t} onClick={()=>setActiveTab(t)} style={{padding:"5px 12px",borderRadius:4,border:"none",cursor:"pointer",background:activeTab===t?C.cyanDim:"none",color:activeTab===t?C.cyan:C.slate,fontFamily:"monospace",fontSize:10}}>{l}</button>))}
          </div>
          {activeTab==="order"&&<>
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {["BUY","SELL"].map(s=>(<button key={s} onClick={()=>setSide(s)} style={{flex:1,padding:"12px 0",borderRadius:6,border:"2px solid "+(side===s?(s==="BUY"?C.green:C.red):C.border),cursor:"pointer",background:side===s?(s==="BUY"?C.greenDim:C.redDim):C.bg2,color:side===s?(s==="BUY"?C.green:C.red):C.slate,fontWeight:700,fontFamily:"monospace",fontSize:14}}>{s}{mode==="futures"?(s==="BUY"?" LONG":" SHORT"):""}</button>))}
            </div>
            <div style={{marginBottom:12}}>
              <div style={{color:C.slate,fontSize:10,marginBottom:6}}>ORDER TYPE</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {["MARKET","LIMIT","STOP","STOP-LIMIT","TRAILING","OCO","BRACKET","TWAP","ICEBERG"].map(t=>(<button key={t} onClick={()=>setOrderType(t)} style={{padding:"4px 8px",borderRadius:4,cursor:"pointer",background:orderType===t?C.cyanDim:C.bg3,border:"1px solid "+(orderType===t?C.cyan:C.border),color:orderType===t?C.cyan:C.slate,fontSize:9,fontFamily:"monospace"}}>{t}</button>))}
              </div>
              {orderType==="TWAP"&&<div style={{marginTop:8,background:C.bg2,borderRadius:5,padding:10}}>
                <div style={{color:C.slate,fontSize:9,marginBottom:4}}>Execute over (minutes) — splits into 5 legs</div>
                <input type="number" value={twapMinutes} onChange={e=>setTwapMinutes(e.target.value)} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"7px 9px",fontFamily:"monospace",fontSize:11,outline:"none",boxSizing:"border-box"}}/>
              </div>}
              {orderType==="ICEBERG"&&<div style={{marginTop:8,background:C.bg2,borderRadius:5,padding:10}}>
                <div style={{color:C.slate,fontSize:9,marginBottom:4}}>Visible size per leg (% of total qty)</div>
                <input type="number" value={visibleQtyPct} onChange={e=>setVisibleQtyPct(e.target.value)} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"7px 9px",fontFamily:"monospace",fontSize:11,outline:"none",boxSizing:"border-box"}}/>
              </div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div><div style={{color:C.slate,fontSize:10,marginBottom:4}}>Qty ({base}) <span style={{color:C.dimText,fontSize:8}}>auto:{autoQty}</span></div>{inp(qty,setQty,C.border,autoQty)}</div>
              {orderType!=="MARKET"&&<div><div style={{color:C.slate,fontSize:10,marginBottom:4}}>Price</div>{inp(limitPrice,setLimitPrice)}</div>}
              <div><div style={{color:C.red,fontSize:10,marginBottom:4}}>Stop Loss</div>{inp(sl,setSl,C.red)}</div>
              <div><div style={{color:C.green,fontSize:10,marginBottom:4}}>Take Profit 1</div>{inp(tp1,setTp1,C.green)}</div>
              {useOCO&&<><div><div style={{color:C.green,fontSize:10,marginBottom:4}}>Take Profit 2</div>{inp(tp2,setTp2,C.green)}</div><div><div style={{color:C.gold,fontSize:10,marginBottom:4}}>Take Profit 3</div>{inp(tp3,setTp3,C.gold)}</div></>}
              {useTrail&&<><div><div style={{color:C.gold,fontSize:10,marginBottom:4}}>Trail Type</div><select value={trailType} onChange={e=>setTrailType(e.target.value)} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"8px",fontFamily:"monospace",fontSize:11,outline:"none",colorScheme:"dark"}}><option value="pct">Percentage %</option><option value="atr">ATR Multiple</option></select></div><div><div style={{color:C.gold,fontSize:10,marginBottom:4}}>{trailType==="pct"?"Trail %":"ATR x"}</div>{trailType==="pct"?inp(trailPct,setTrailPct,C.gold):inp(trailAtr,setTrailAtr,C.gold)}</div></>}
            </div>
            {useOCO&&<div style={{background:C.bg2,borderRadius:6,padding:10,marginBottom:12,border:"1px solid "+C.border}}>
              <div style={{color:C.slate,fontSize:9,marginBottom:8}}>SCALE OUT — % to close at each TP</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <div><div style={{color:C.green,fontSize:9,marginBottom:4}}>TP1 %</div>{inp(tp1Pct,setTp1Pct,C.green)}</div>
                <div><div style={{color:C.green,fontSize:9,marginBottom:4}}>TP2 %</div>{inp(tp2Pct,setTp2Pct,C.green)}</div>
                <div><div style={{color:C.gold,fontSize:9,marginBottom:4}}>TP3 %</div>{inp(tp3Pct,setTp3Pct,C.gold)}</div>
              </div>
            </div>}
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
              {[{k:"useOCO",v:useOCO,fn:setUseOCO,l:"Multi-TP OCO",c:C.green},{k:"useTrail",v:useTrail,fn:setUseTrail,l:"Trailing SL",c:C.gold},{k:"useBE",v:useBE,fn:setUseBE,l:"Auto Breakeven",c:C.cyan}].map(({k,v,fn,l,c})=>(
                <button key={k} onClick={()=>fn(!v)} style={{padding:"4px 9px",borderRadius:4,cursor:"pointer",background:v?c+"22":C.bg3,border:"1px solid "+(v?c:C.border),color:v?c:C.slate,fontSize:9,fontFamily:"monospace"}}>{v?"✓ ":""}{l}</button>
              ))}
            </div>
            {mode==="futures"&&<div style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",color:C.slate,fontSize:10,marginBottom:6}}><span>Leverage</span><span style={{color:leverage>10?C.red:leverage>5?C.gold:C.cyan,fontWeight:700}}>{leverage}x</span></div>
              <input type="range" min={1} max={125} value={leverage} onChange={e=>setLeverage(+e.target.value)} style={{width:"100%",accentColor:leverage>10?C.red:leverage>5?C.gold:C.cyan}}/>
              <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>{[1,2,3,5,10,20,25,50,75,100,125].map(l=><button key={l} onClick={()=>setLeverage(l)} style={{padding:"2px 6px",borderRadius:3,border:"1px solid "+(leverage===l?C.cyan:C.border),background:leverage===l?C.cyanDim:"none",color:leverage===l?C.cyan:C.dimText,fontSize:8,cursor:"pointer",fontFamily:"monospace"}}>{l}x</button>)}</div>
            </div>}
          </>}
          {activeTab==="risk"&&<div style={{background:C.bg2,borderRadius:8,padding:14,marginBottom:12}}>
            <div style={{color:C.cyan,fontSize:11,fontFamily:"monospace",fontWeight:700,marginBottom:12}}>◈ POSITION SIZE CALCULATOR</div>
            <div style={{marginBottom:10}}><div style={{color:C.slate,fontSize:10,marginBottom:4}}>Risk per Trade (%)</div><input value={riskPct} onChange={e=>setRiskPct(e.target.value)} style={{width:"100%",background:C.bg3,border:"1px solid "+C.gold,borderRadius:4,color:C.white,padding:"8px 10px",fontFamily:"monospace",fontSize:12,outline:"none"}}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["Balance",fmtUSD(balance||50000),C.white],["Risk Amount",fmtUSD(riskAmount),C.gold],["SL Distance",fmtUSD(slDistance),C.red],["Position Size",displayQty+" "+base,C.cyan],["Position Value",fmtUSD(total),C.white],["R:R",signal?"1:"+fmt(signal.riskReward,1):"N/A",C.green]].map(([k,v,c])=>(
                <div key={k} style={{background:C.bg3,borderRadius:5,padding:10}}><div style={{color:C.dimText,fontSize:9,marginBottom:3}}>{k}</div><div style={{color:c,fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{v}</div></div>
              ))}
            </div>
            {signal&&<div style={{background:C.bg3,borderRadius:5,padding:10,marginTop:10}}>
              <div style={{color:C.dimText,fontSize:9,marginBottom:4}}>KELLY CRITERION</div>
              <div style={{color:C.gold,fontSize:13,fontWeight:700,fontFamily:"monospace"}}>{fmt(kellySize(60,signal.riskReward),1)}% of account</div>
              <div style={{color:C.dimText,fontSize:9,marginTop:2}}>Based on 60% win rate at 1:{fmt(signal.riskReward,1)} R:R</div>
            </div>}
          </div>}
          {activeTab==="advanced"&&<div style={{background:C.bg2,borderRadius:8,padding:14,marginBottom:12}}>
            <div style={{color:C.cyan,fontSize:11,fontFamily:"monospace",fontWeight:700,marginBottom:12}}>◈ EXECUTION OPTIONS</div>
            {[{label:"Multi-TP OCO",desc:"Close portions at TP1, TP2 and TP3 automatically",v:useOCO,fn:setUseOCO,c:C.green},{label:"Auto Breakeven",desc:"Move SL to entry when TP1 is hit",v:useBE,fn:setUseBE,c:C.cyan},{label:"Trailing Stop",desc:"Trail SL as price moves in your favour",v:useTrail,fn:setUseTrail,c:C.gold}].map(({label,desc,v,fn,c})=>(
              <div key={label} onClick={()=>fn(!v)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:v?c+"11":C.bg3,borderRadius:6,marginBottom:8,cursor:"pointer",border:"1px solid "+(v?c:C.border)}}>
                <div><div style={{color:v?c:C.white,fontSize:11,fontFamily:"monospace",fontWeight:700}}>{label}</div><div style={{color:C.dimText,fontSize:9,marginTop:2}}>{desc}</div></div>
                <div style={{width:36,height:20,borderRadius:10,background:v?c:C.bg0,border:"1px solid "+(v?c:C.border),position:"relative",flexShrink:0,marginLeft:10}}><div style={{position:"absolute",top:2,left:v?18:2,width:14,height:14,borderRadius:"50%",background:v?C.white:C.slate,transition:"all 0.2s"}}/></div>
              </div>
            ))}
          </div>}
          <div style={{background:C.bg2,borderRadius:8,padding:12,marginBottom:14,border:"1px solid "+C.border2}}>
            <div style={{color:C.slate,fontSize:9,marginBottom:8}}>ORDER SUMMARY</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
              {[["Pair",pair],["Side",side],["Mode",mode.toUpperCase()],["Qty",displayQty+" "+base],["Value",fmtUSD(total)],useOCO&&["Multi-TP","✓ 3 levels"],useTrail&&["Trail","✓ "+trailType],useBE&&["Breakeven","✓ at TP1"],signal&&["R:R","1:"+fmt(signal.riskReward,1)]].filter(Boolean).map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid "+C.border+"22"}}>
                  <span style={{color:C.dimText,fontSize:9}}>{k}</span>
                  <span style={{color:k==="Side"?(side==="BUY"?C.green:C.red):C.white,fontSize:9,fontWeight:700}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={()=>{
            const finalQty=parseFloat(displayQty||autoQty||0.001);
            const finalPrice=parseFloat(limitPrice||price||1);
            if(!finalQty||finalQty<=0){alert("Please enter a valid quantity");return;}
            onPlace({pair,mode,side,orderType,qty:finalQty,price:finalPrice,sl:parseFloat(sl)||finalPrice*0.97,tp:parseFloat(tp1)||finalPrice*1.02,tp2:parseFloat(tp2)||finalPrice*1.04,tp3:parseFloat(tp3)||finalPrice*1.07,tp1Pct:parseFloat(tp1Pct)||40,tp2Pct:parseFloat(tp2Pct)||40,tp3Pct:parseFloat(tp3Pct)||20,leverage,useOCO,useTrail,trailPct:parseFloat(trailPct)||1.5,trailAtr:parseFloat(trailAtr)||2,trailType,useBE,riskPct:parseFloat(riskPct)||1.5,twapMinutes:parseFloat(twapMinutes)||5,visibleQty:finalQty*(parseFloat(visibleQtyPct)||20)/100});
            onClose();
          }} style={{width:"100%",padding:"14px 0",borderRadius:8,border:"none",cursor:"pointer",background:side==="BUY"?C.green:C.red,color:"#000",fontWeight:700,fontFamily:"monospace",fontSize:15}}>
            {isDemo?"[DEMO] ":""}{side==="BUY"?"BUY / LONG":"SELL / SHORT"} — {pair}
          </button>
          {isDemo&&<div style={{textAlign:"center",color:C.purple,fontSize:10,marginTop:8}}>Demo mode — no real funds used</div>}
        </div>
      </div>
    </div>
  );
}

function AddPairModal({onAdd,onClose,activePairs}){
  const [search,setSearch]=useState("");
  const [status,setStatus]=useState("");
  const [checking,setChecking]=useState(false);
  const popular=["PEPE/USDT","WIF/USDT","BONK/USDT","FLOKI/USDT","WLD/USDT","STX/USDT","RUNE/USDT","JTO/USDT","TIA/USDT","PYTH/USDT","JUP/USDT","ENA/USDT","NOT/USDT","ZK/USDT","ETH/BTC","BNB/BTC","XRP/BTC","SOL/BTC","DOGE/BTC"].filter(s=>!activePairs.includes(s)&&s.toLowerCase().includes(search.toLowerCase()));
  async function checkAndAdd(pair){
    const formatted=pair.toUpperCase().includes("/")?pair.toUpperCase():pair.toUpperCase()+"/USDT";
    if(activePairs.includes(formatted)){setStatus("Already added!");return;}
    setChecking(true);setStatus("Verifying on Binance...");
    try{const res=await fetch("https://api.binance.com/api/v3/ticker/price?symbol="+toBinanceSym(formatted).toUpperCase());if(!res.ok)throw new Error();const data=await res.json();if(data.price){onAdd(formatted,parseFloat(data.price));setStatus("✓ Added "+formatted);setTimeout(onClose,700);}else throw new Error();}catch(e){setStatus("Not found on Binance. Try e.g. PEPE/USDT");}
    setChecking(false);
  }
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.88)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,width:"min(420px,95vw)",maxHeight:"80vh",display:"flex",flexDirection:"column",overflow:"hidden",margin:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:C.bg2,padding:"12px 18px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:C.white,fontSize:14,fontWeight:700,fontFamily:"monospace"}}>Add Trading Pair</span>
          <button onClick={onClose} style={{background:C.bg3,border:"1px solid "+C.border,color:C.white,fontSize:14,cursor:"pointer",width:28,height:28,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:18,flex:1,overflowY:"auto"}}>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search&&checkAndAdd(search)} placeholder="Type pair e.g. PEPE or PEPE/USDT" style={{flex:1,background:C.bg3,border:"1px solid "+C.cyan,borderRadius:4,color:C.white,padding:"8px 12px",fontFamily:"monospace",fontSize:12,outline:"none"}}/>
            <button onClick={()=>search&&checkAndAdd(search)} disabled={checking} style={{background:C.cyanDim,border:"1px solid "+C.cyan,color:C.cyan,padding:"8px 14px",borderRadius:4,cursor:"pointer",fontFamily:"monospace",fontSize:12,fontWeight:700}}>{checking?"...":"ADD"}</button>
          </div>
          {status&&<div style={{color:status.startsWith("✓")?C.green:C.red,fontSize:11,fontFamily:"monospace",marginBottom:10,padding:"6px 10px",background:C.bg2,borderRadius:4}}>{status}</div>}
          <div style={{color:C.slate,fontSize:10,fontFamily:"monospace",marginBottom:8}}>POPULAR PAIRS</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{popular.map(s=><button key={s} onClick={()=>checkAndAdd(s)} style={{padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"monospace",background:C.bg3,border:"1px solid "+C.border,color:C.white}}>{s}</button>)}</div>
        </div>
      </div>
    </div>
  );
}

function AIAnalysisPanel({pair,signal,price,timeframe,isDemo,apiKey}){
  const [analysis,setAnalysis]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const run=useCallback(async()=>{
    if(!signal||loading)return;
    setLoading(true);setAnalysis("");setError("");
    if(isDemo){
      await new Promise(r=>setTimeout(r,1200));
      const regime=signal.regime||{regime:"unknown",strategy:"unknown"};
      const patterns=signal.patternData?.patterns||[];
      setAnalysis("1. MARKET STRUCTURE\n"+pair+" on "+timeframe+" at "+fmtUSD(price)+".\nRegime: "+regime.regime.toUpperCase()+" — "+regime.desc+"\n"+(price>signal.ema21?"Price above EMA21 — bullish structure.":"Price below EMA21 — bearish structure.")+" ADX: "+fmt(signal.adx.adx,0)+(signal.adx.adx>25?" — strong trend.":" — weak trend.")+(signal.divergence.bullish?"\n⚡ BULLISH RSI DIVERGENCE — high probability reversal.":signal.divergence.bearish?"\n⚡ BEARISH RSI DIVERGENCE — caution.":"")+(patterns.length>0?"\nPatterns: "+patterns.map(p=>p.name).join(", ")+".":"")+"\n\n2. SIGNAL RATIONALE\n"+signal.direction+" at "+Math.round(signal.strength)+"% strength.\nTop confluences:\n"+signal.reasons.filter(r=>r.weight!=="neutral").slice(0,5).map(r=>"• "+r.text).join("\n")+"\n\n3. EXECUTION PLAN\nEntry: "+fmtUSD(signal.entry)+" | SL: "+fmtUSD(signal.stopLoss)+" (1.5x ATR)\nTP1: "+fmtUSD(signal.tp1)+" — close 40%\nTP2: "+fmtUSD(signal.tp2)+" — close 40%\nTP3: "+fmtUSD(signal.tp3)+" — trail 20%\nMove SL to breakeven at TP1. R:R 1:"+fmt(signal.riskReward,1)+"\n\n4. RISK\nSupertrend: "+signal.supertrend.trend.toUpperCase()+" | PSAR: "+signal.psar.trend.toUpperCase()+" | Vol: "+fmt(signal.volRatio,1)+"x avg\nSession: "+(signal.isTradingSession?"✓ Active London/NY":"⚠ Outside prime hours")+"\n\n[DEMO — Add Anthropic API key in Settings for live AI analysis]");
      setLoading(false);return;
    }
    try{
      const regime=signal.regime||{};
      const patterns=(signal.patternData?.patterns||[]).map(p=>p.name).join(", ")||"none";
      const prompt="You are NEXUS, elite AI crypto analyst. Be concise and specific.\nPAIR: "+pair+" | TF: "+timeframe+" | PRICE: "+fmtUSD(price)+"\nSIGNAL: "+signal.direction+" | STRENGTH: "+Math.round(signal.strength)+"%\nREGIME: "+(regime.regime||"unknown")+" | STRATEGY: "+(regime.strategy||"unknown")+"\nPATTERNS: "+patterns+"\nBULL DIV: "+signal.divergence.bullish+" | BEAR DIV: "+signal.divergence.bearish+"\nRSI: "+fmt(signal.rsi,1)+" | ADX: "+fmt(signal.adx.adx,0)+" | ATR: "+fmt(signal.atr,6)+"\nMACD: "+fmt(signal.hist,6)+" | MFI: "+fmt(signal.mfi,1)+"\nSupertrend: "+signal.supertrend.trend+" | PSAR: "+signal.psar.trend+" | Stoch: "+fmt(signal.stoch.k,0)+"\nEMA9/21/50/200: "+fmtUSD(signal.ema9)+"/"+fmtUSD(signal.ema21)+"/"+fmtUSD(signal.ema50)+"/"+fmtUSD(signal.ema200)+"\nVWAP: "+fmtUSD(signal.vwap)+" | Vol: "+fmt(signal.volRatio,2)+"x avg\nFib 618/382: "+fmtUSD(signal.fib.r618)+"/"+fmtUSD(signal.fib.r382)+"\nEntry: "+fmtUSD(signal.entry)+" SL: "+fmtUSD(signal.stopLoss)+" TP1/2/3: "+fmtUSD(signal.tp1)+"/"+fmtUSD(signal.tp2)+"/"+fmtUSD(signal.tp3)+"\nR:R 1:"+fmt(signal.riskReward,1)+" | Session: "+(signal.isTradingSession?"Active":"Closed")+"\n\nProvide:\n1. MARKET STRUCTURE (regime + key levels)\n2. SIGNAL RATIONALE (top confluences)\n3. EXECUTION PLAN (specific prices + scale out)\n4. RISK ASSESSMENT (invalidation + session)\nMax 280 words.";
      const headers={"Content-Type":"application/json","Authorization":"Bearer "+SUPABASE_KEY};
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),30000);
      const res=await fetch(SUPABASE_URL+"/functions/v1/nexus-ai-proxy",{method:"POST",headers,signal:controller.signal,body:JSON.stringify({apiKey,model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      clearTimeout(timeout);
      if(!res.ok){if(res.status===401)throw new Error("KEY");if(res.status===429)throw new Error("RATE");throw new Error("API");}
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("")||"";
      if(!text)throw new Error("EMPTY");
      setAnalysis(text);
    }catch(e){
      if(e.name==="AbortError")setError("Timed out. Retry.");
      else if(e.message==="KEY")setError("Invalid API key. Check Settings.");
      else if(e.message==="RATE")setError("Rate limit. Wait 30 seconds.");
      else setError("Cannot reach AI. Check internet or enable Demo Mode.");
    }
    setLoading(false);
  },[pair,signal,price,timeframe,loading,isDemo,apiKey]);
  return(
    <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:C.cyan,fontSize:11,fontFamily:"monospace",fontWeight:700}}>◈ NEXUS AI ANALYSIS</span>
          {isDemo&&<Badge color={C.purple} small>DEMO</Badge>}
          {signal?.regime&&<Badge color={signal.regime.color||C.slate} small>{signal.regime.icon} {(signal.regime.regime||"").replace("_"," ").toUpperCase()}</Badge>}
        </div>
        <button onClick={run} disabled={loading} style={{background:loading?C.bg3:C.cyanDim,border:"1px solid "+(loading?C.border:C.cyan),color:loading?C.slate:C.cyan,padding:"6px 14px",borderRadius:4,fontFamily:"monospace",fontSize:10,cursor:loading?"not-allowed":"pointer",fontWeight:700}}>{loading?"ANALYZING...":"RUN ANALYSIS"}</button>
      </div>
      {loading&&<div style={{display:"flex",gap:5,alignItems:"center",padding:"14px 0"}}>{[0,1,2,3,4].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:C.cyan,animation:"pulse "+(0.7+i*0.12)+"s ease-in-out infinite alternate"}}/>)}<span style={{color:C.slate,fontSize:10,marginLeft:10}}>Analysing...</span></div>}
      {error&&!loading&&<div style={{background:C.redDim,border:"1px solid "+C.red+"44",borderRadius:6,padding:12,marginBottom:8}}><div style={{color:C.red,fontSize:11}}>{error}</div><button onClick={run} style={{marginTop:8,background:C.cyanDim,border:"1px solid "+C.cyan,color:C.cyan,padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"monospace"}}>RETRY</button></div>}
      {analysis&&!loading&&<div style={{color:C.white,fontSize:11,fontFamily:"monospace",lineHeight:1.75,whiteSpace:"pre-wrap",borderTop:"1px solid "+C.border,paddingTop:12}}>{analysis}</div>}
      {!analysis&&!error&&!loading&&<div style={{color:C.dimText,fontSize:11,textAlign:"center",padding:"20px 0"}}><div style={{fontSize:20,marginBottom:8}}>◈</div><div>Click RUN ANALYSIS for AI market breakdown</div><div style={{fontSize:9,marginTop:4}}>Powered by Claude Sonnet · Demo Mode available without API key</div></div>}
    </div>
  );
}

function BacktestPanel({candles,strategy,pair,setStrategy}){
  const [running,setRunning]=useState(false);
  const [results,setResults]=useState(null);
  const [wfRunning,setWfRunning]=useState(false);
  const [wfResults,setWfResults]=useState(null);
  const [mcRunning,setMcRunning]=useState(false);
  const [mcResults,setMcResults]=useState(null);
  const [appliedMsg,setAppliedMsg]=useState(false);
  const [period,setPeriod]=useState("all");
  function run(){
    setRunning(true);
    setTimeout(()=>{
      const slice=period==="all"?candles:candles.slice(-{week:168,month:720,quarter:2160}[period]||candles.length);
      setResults(runBacktest(slice,strategy));
      setRunning(false);
    },500);
  }
  return(
    <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{color:C.gold,fontSize:11,fontFamily:"monospace",fontWeight:700}}>◈ BACKTEST — {pair}</span>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <select value={period} onChange={e=>setPeriod(e.target.value)} style={{background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"4px 8px",fontFamily:"monospace",fontSize:10,outline:"none",colorScheme:"dark"}}>
            <option value="week">1 Week</option><option value="month">1 Month</option><option value="quarter">3 Months</option><option value="all">All Data</option>
          </select>
          <button onClick={run} disabled={running} style={{background:running?C.bg3:C.goldDim,border:"1px solid "+(running?C.border:C.gold),color:running?C.slate:C.gold,padding:"5px 14px",borderRadius:4,fontFamily:"monospace",fontSize:10,cursor:running?"not-allowed":"pointer",fontWeight:700}}>{running?"RUNNING...":"RUN BACKTEST"}</button>
        </div>
      </div>
      {running&&<div style={{color:C.slate,fontSize:11,textAlign:"center",padding:20}}>Running on {candles.length} candles...</div>}
      {results&&!running&&<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
          {[{l:"Trades",v:results.totalTrades,c:C.white},{l:"Win Rate",v:results.winRate+"%",c:results.winRate>=50?C.green:C.red},{l:"Profit Factor",v:fmt(results.profitFactor,2)+"x",c:results.profitFactor>=1.5?C.green:results.profitFactor>=1?C.gold:C.red},{l:"Return",v:(results.return>=0?"+":"")+results.return+"%",c:results.return>=0?C.green:C.red},{l:"Max Drawdown",v:fmt(results.maxDrawdown,1)+"%",c:results.maxDrawdown<10?C.green:results.maxDrawdown<20?C.gold:C.red},{l:"Sharpe",v:fmt(results.sharpe||0,2),c:(results.sharpe||0)>=1?C.green:(results.sharpe||0)>=0?C.gold:C.red},{l:"Wins",v:results.wins,c:C.green},{l:"Losses",v:results.losses,c:C.red},{l:"Final Bal",v:"$"+fmt(results.finalBalance),c:results.return>=0?C.green:C.red}].map(({l,v,c})=>(
            <div key={l} style={{background:C.bg3,borderRadius:5,padding:"8px 10px"}}><div style={{color:C.dimText,fontSize:8,marginBottom:3}}>{l}</div><div style={{color:c,fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{v}</div></div>
          ))}
        </div>
        <div style={{background:C.bg3,borderRadius:6,padding:10,marginBottom:8}}>
          <div style={{color:results.return>=0?C.green:C.red,fontSize:12,fontWeight:700,fontFamily:"monospace",marginBottom:4}}>{results.return>=0?"▲ PROFITABLE":"▼ NEEDS ADJUSTMENT"}</div>
          <div style={{color:C.slate,fontSize:10}}>{results.winRate>=50&&results.profitFactor>=1.5?"✓ Strategy performing well on historical data.":results.profitFactor>=1?"◌ Marginally profitable. Consider raising min strength.":"✕ Losing strategy. Raise min strength and R:R."}</div>
        </div>
        {results.trades.length>0&&<div style={{maxHeight:150,overflowY:"auto"}}>
          <div style={{color:C.slate,fontSize:9,marginBottom:6}}>LAST {Math.min(10,results.trades.length)} TRADES</div>
          {results.trades.slice(-10).reverse().map((t,i)=>(
            <div key={i} style={{display:"flex",gap:10,padding:"4px 0",borderBottom:"1px solid "+C.border+"22"}}>
              <span style={{color:t.side==="BUY"?C.green:C.red,fontSize:9,minWidth:30}}>{t.side}</span>
              <span style={{color:C.white,fontSize:9}}>{fmtUSD(t.entry)}</span>
              <span style={{color:t.result==="TP"?C.green:C.red,fontSize:9}}>{t.result}</span>
              <span style={{color:t.pnl>=0?C.green:C.red,fontSize:9,marginLeft:"auto"}}>{t.pnl>=0?"+":""}{fmt(t.pnl,2)}</span>
            </div>
          ))}
        </div>}
      </>}
      {!results&&!running&&<div style={{color:C.dimText,fontSize:11,textAlign:"center",padding:20}}>Click RUN BACKTEST to test your strategy on {candles.length} candles</div>}

      <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid "+C.border}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{color:C.blue,fontSize:11,fontFamily:"monospace",fontWeight:700}}>◈ WALK-FORWARD TEST</span>
          <button onClick={()=>{
            setWfRunning(true);
            setTimeout(()=>{setWfResults(runWalkForwardTest(candles,strategy,4));setWfRunning(false);},500);
          }} disabled={wfRunning} style={{background:wfRunning?C.bg3:C.bg2,border:"1px solid "+(wfRunning?C.border:C.blue),color:wfRunning?C.slate:C.blue,padding:"5px 14px",borderRadius:4,fontFamily:"monospace",fontSize:10,cursor:wfRunning?"not-allowed":"pointer",fontWeight:700}}>{wfRunning?"RUNNING...":"RUN WALK-FORWARD"}</button>
        </div>
        <div style={{color:C.dimText,fontSize:9,marginBottom:10}}>Splits your history into 4 sequential periods and tests these exact settings on each independently. Consistent profit across periods = robust. Only working in one period = likely curve-fit.</div>
        {wfResults&&<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:10}}>
            <div style={{background:C.bg3,borderRadius:5,padding:"8px 10px"}}><div style={{color:C.dimText,fontSize:8}}>Consistency</div><div style={{color:wfResults.consistency>=75?C.green:wfResults.consistency>=50?C.gold:C.red,fontSize:16,fontWeight:700}}>{wfResults.consistency}%</div><div style={{color:C.dimText,fontSize:8}}>{wfResults.positiveWindows}/{wfResults.totalWindows} periods profitable</div></div>
            <div style={{background:C.bg3,borderRadius:5,padding:"8px 10px"}}><div style={{color:C.dimText,fontSize:8}}>Avg Return / Period</div><div style={{color:wfResults.avgReturn>=0?C.green:C.red,fontSize:16,fontWeight:700}}>{wfResults.avgReturn>=0?"+":""}{wfResults.avgReturn}%</div><div style={{color:C.dimText,fontSize:8}}>σ {wfResults.stdReturn}%</div></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
            {wfResults.windows.map(w=>(
              <div key={w.window} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:C.bg3,borderRadius:4}}>
                <span style={{color:C.slate,fontSize:9}}>Period {w.window}</span>
                <span style={{color:C.slate,fontSize:9}}>{w.totalTrades} trades, {w.winRate}% WR</span>
                <span style={{color:w.return>=0?C.green:C.red,fontSize:9,fontWeight:700}}>{w.return>=0?"+":""}{w.return}%</span>
              </div>
            ))}
          </div>
          {wfResults.consistency<50&&<div style={{background:C.redDim,border:"1px solid "+C.red+"44",borderRadius:5,padding:"8px 10px",marginBottom:10}}><div style={{color:C.red,fontSize:9}}>⚠ Only profitable in {wfResults.consistency}% of tested periods — this strategy may be overfit to a specific market condition rather than genuinely robust.</div></div>}
        </>}
      </div>

      <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid "+C.border}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{color:C.purple,fontSize:11,fontFamily:"monospace",fontWeight:700}}>◈ MONTE CARLO SIMULATION</span>
          <button onClick={()=>{
            if(!results||!results.trades||results.trades.length<5)return;
            setMcRunning(true);
            setTimeout(()=>{setMcResults(runMonteCarloSimulation(results.trades,1000,1000));setMcRunning(false);},500);
          }} disabled={mcRunning||!results||results.trades.length<5} style={{background:mcRunning?C.bg3:C.bg2,border:"1px solid "+(mcRunning?C.border:C.purple),color:mcRunning?C.slate:C.purple,padding:"5px 14px",borderRadius:4,fontFamily:"monospace",fontSize:10,cursor:(mcRunning||!results||results.trades.length<5)?"not-allowed":"pointer",fontWeight:700,opacity:(!results||results.trades.length<5)?0.4:1}}>{mcRunning?"RUNNING...":"RUN MONTE CARLO"}</button>
        </div>
        <div style={{color:C.dimText,fontSize:9,marginBottom:10}}>Reshuffles your backtest's actual trade sequence 1,000 times to reveal the realistic range of outcomes — a single backtest hides how much luck/order affected the result. Requires a completed backtest above with 5+ trades.</div>
        {mcResults&&<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
            <div style={{background:C.bg3,borderRadius:5,padding:"8px 10px",textAlign:"center"}}><div style={{color:C.dimText,fontSize:8}}>Worst 5%</div><div style={{color:C.red,fontSize:13,fontWeight:700}}>${fmt(mcResults.p5,0)}</div></div>
            <div style={{background:C.bg3,borderRadius:5,padding:"8px 10px",textAlign:"center"}}><div style={{color:C.dimText,fontSize:8}}>Median</div><div style={{color:C.white,fontSize:13,fontWeight:700}}>${fmt(mcResults.median,0)}</div></div>
            <div style={{background:C.bg3,borderRadius:5,padding:"8px 10px",textAlign:"center"}}><div style={{color:C.dimText,fontSize:8}}>Best 5%</div><div style={{color:C.green,fontSize:13,fontWeight:700}}>${fmt(mcResults.p95,0)}</div></div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+C.border+"22"}}><span style={{color:C.slate,fontSize:10}}>Median Max Drawdown</span><span style={{color:C.gold,fontSize:11,fontWeight:700}}>{mcResults.medianDD}%</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+C.border+"22"}}><span style={{color:C.slate,fontSize:10}}>Worst-Case (95th %ile) Drawdown</span><span style={{color:C.red,fontSize:11,fontWeight:700}}>{mcResults.worstDD}%</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",marginBottom:10}}><span style={{color:C.slate,fontSize:10}}>Probability of Ruin (balance {"<"}50%)</span><span style={{color:mcResults.probRuin>10?C.red:mcResults.probRuin>2?C.gold:C.green,fontSize:11,fontWeight:700}}>{mcResults.probRuin}%</span></div>
        </>}
      </div>

      {(wfResults||mcResults)&&setStrategy&&<div style={{marginTop:16,paddingTop:16,borderTop:"1px solid "+C.border}}>
        <button onClick={()=>{
          setStrategy(s=>({...s,walkForwardConsistency:wfResults?wfResults.consistency:s.walkForwardConsistency,monteCarloProbRuin:mcResults?mcResults.probRuin:s.monteCarloProbRuin}));
          setAppliedMsg(true);setTimeout(()=>setAppliedMsg(false),2500);
        }} style={{width:"100%",padding:"10px 0",borderRadius:5,border:"1px solid "+C.gold,background:appliedMsg?C.greenDim:C.goldDim,color:appliedMsg?C.green:C.gold,cursor:"pointer",fontFamily:"monospace",fontSize:11,fontWeight:700}}>{appliedMsg?"✓ APPLIED — AUTO-TRADING WILL NOW USE THESE RESULTS":"APPLY TO AUTO-TRADING"}</button>
        <div style={{color:C.dimText,fontSize:8,marginTop:6,textAlign:"center"}}>Saves these robustness scores to your strategy. Auto-trading will automatically reduce position size (or pause) when consistency is low or ruin risk is high.</div>
      </div>}
    </div>
  );
}

// ── Replay Mode — step through history candle by candle ─────────────
function ReplayPanel({candles,pair}){
  const minIdx=50;
  const [replayIdx,setReplayIdx]=useState(Math.min(minIdx,candles.length-1));
  const [isPlaying,setIsPlaying]=useState(false);
  const [speed,setSpeed]=useState(1);
  const [simTrade,setSimTrade]=useState(null);
  const [simHistory,setSimHistory]=useState([]);
  const playRef=useRef(null);

  useEffect(()=>{
    setReplayIdx(Math.min(minIdx,candles.length-1));
    setSimTrade(null);setSimHistory([]);setIsPlaying(false);
  },[pair]);

  useEffect(()=>{
    if(isPlaying){
      playRef.current=setInterval(()=>{
        setReplayIdx(i=>{
          if(i>=candles.length-1){setIsPlaying(false);return i;}
          return i+1;
        });
      },Math.max(60,600/speed));
    }
    return()=>clearInterval(playRef.current);
  },[isPlaying,speed,candles.length]);

  // Check simulated trade against current candle — must run before any early return
  useEffect(()=>{
    const currentCandle=candles&&candles[replayIdx];
    if(simTrade&&currentCandle){
      const isBuy=simTrade.side==="BUY";
      const hitSL=isBuy?currentCandle.low<=simTrade.sl:currentCandle.high>=simTrade.sl;
      const hitTP=isBuy?currentCandle.high>=simTrade.tp:currentCandle.low<=simTrade.tp;
      if(hitSL||hitTP){
        const exitPrice=hitTP?simTrade.tp:simTrade.sl;
        const pnlPct=((exitPrice-simTrade.entry)/simTrade.entry)*100*(isBuy?1:-1);
        setSimHistory(h=>[{...simTrade,exitPrice,result:hitTP?"TP":"SL",pnlPct,idx:replayIdx},...h].slice(0,20));
        setSimTrade(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[replayIdx]);

  if(!candles||candles.length<minIdx+5)return <div style={{color:C.dimText,fontSize:11,textAlign:"center",padding:20}}>Not enough candle history to replay for {pair}.</div>;

  const visible=getReplayCandles(candles,replayIdx+1);
  const sig=visible.length>5?computeSignal(visible,pair):null;
  const currentCandle=candles[replayIdx];
  const currentPrice=currentCandle?.close||0;

  function enterSimTrade(){
    if(!sig||sig.direction==="NEUTRAL")return;
    setSimTrade({side:sig.isBuy?"BUY":"SELL",entry:currentPrice,sl:sig.stopLoss,tp:sig.tp1,enteredIdx:replayIdx});
  }

  const slice=visible.slice(-60);
  const highs=slice.map(c=>c.high),lows=slice.map(c=>c.low);
  const maxP=Math.max(...highs),minP=Math.min(...lows);
  const range=(maxP-minP)||1;
  const chartW=600,chartH=180,padL=4,padR=50;
  const cw=(chartW-padL-padR)/slice.length;
  const sY=p=>10+((maxP-p)/range)*(chartH-30);

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
        <div style={{color:C.cyan,fontSize:11,fontWeight:700}}>◈ REPLAY — {pair} · candle {replayIdx+1} / {candles.length}</div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {[0.5,1,2,4].map(s=>(
            <button key={s} onClick={()=>setSpeed(s)} style={{padding:"3px 8px",borderRadius:3,border:"1px solid "+(speed===s?C.cyan:C.border),background:speed===s?C.cyanDim:"none",color:speed===s?C.cyan:C.slate,fontSize:9,cursor:"pointer",fontFamily:"monospace"}}>{s}x</button>
          ))}
        </div>
      </div>
      <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} style={{display:"block",background:C.bg2,borderRadius:6}}>
        {slice.map((c,i)=>{
          const x=padL+i*cw+cw*0.1,bw=cw*0.8;
          const isUp=c.close>=c.open,col=isUp?C.green:C.red;
          const cy=sY(Math.max(c.open,c.close)),ch=Math.max(1,Math.abs(sY(c.open)-sY(c.close)));
          return(<g key={i}>
            <line x1={x+bw/2} x2={x+bw/2} y1={sY(c.high)} y2={sY(c.low)} stroke={col} strokeWidth={0.8}/>
            <rect x={x} y={cy} width={bw} height={ch} fill={col} opacity={0.85}/>
          </g>);
        })}
        {sig&&sig.direction!=="NEUTRAL"&&<>
          {sig.entry>minP&&sig.entry<maxP&&<line x1={padL} x2={chartW-padR} y1={sY(sig.entry)} y2={sY(sig.entry)} stroke={C.white} strokeWidth={0.6} strokeDasharray="3,3" opacity={0.6}/>}
          {sig.stopLoss>minP&&sig.stopLoss<maxP&&<line x1={padL} x2={chartW-padR} y1={sY(sig.stopLoss)} y2={sY(sig.stopLoss)} stroke={C.red} strokeWidth={0.6} strokeDasharray="3,3" opacity={0.6}/>}
          {sig.tp1>minP&&sig.tp1<maxP&&<line x1={padL} x2={chartW-padR} y1={sY(sig.tp1)} y2={sY(sig.tp1)} stroke={C.green} strokeWidth={0.6} strokeDasharray="3,3" opacity={0.6}/>}
        </>}
        {simTrade&&simTrade.entry>minP&&simTrade.entry<maxP&&<line x1={padL} x2={chartW-padR} y1={sY(simTrade.entry)} y2={sY(simTrade.entry)} stroke={C.gold} strokeWidth={1.5} opacity={0.9}/>}
      </svg>
      <div style={{display:"flex",gap:6,alignItems:"center",marginTop:10,marginBottom:10}}>
        <button onClick={()=>{setIsPlaying(false);setReplayIdx(Math.max(minIdx,replayIdx-1));}} style={{padding:"6px 10px",borderRadius:4,border:"1px solid "+C.border,background:C.bg3,color:C.slate,cursor:"pointer",fontSize:11}}>◀</button>
        <button onClick={()=>setIsPlaying(p=>!p)} style={{padding:"6px 16px",borderRadius:4,border:"1px solid "+C.cyan,background:isPlaying?C.cyanDim:C.bg3,color:C.cyan,cursor:"pointer",fontSize:11,fontWeight:700}}>{isPlaying?"⏸ PAUSE":"▶ PLAY"}</button>
        <button onClick={()=>{setIsPlaying(false);setReplayIdx(Math.min(candles.length-1,replayIdx+1));}} style={{padding:"6px 10px",borderRadius:4,border:"1px solid "+C.border,background:C.bg3,color:C.slate,cursor:"pointer",fontSize:11}}>▶|</button>
        <input type="range" min={minIdx} max={candles.length-1} value={replayIdx} onChange={e=>{setIsPlaying(false);setReplayIdx(parseInt(e.target.value));}} style={{flex:1}}/>
        <button onClick={()=>{setIsPlaying(false);setReplayIdx(minIdx);setSimTrade(null);setSimHistory([]);}} style={{padding:"6px 10px",borderRadius:4,border:"1px solid "+C.border,background:C.bg3,color:C.dimText,cursor:"pointer",fontSize:9}}>RESET</button>
      </div>
      {sig&&<div style={{background:C.bg2,borderRadius:6,padding:10,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <SignalBadge direction={sig.direction}/>
          <span style={{color:C.white,fontSize:11}}>{fmtUSD(currentPrice)}</span>
          <span style={{color:C.slate,fontSize:10}}>strength {Math.round(sig.strength)}%</span>
        </div>
        {!simTrade?<button onClick={enterSimTrade} disabled={sig.direction==="NEUTRAL"} style={{padding:"5px 12px",borderRadius:4,border:"1px solid "+C.gold,background:C.goldDim,color:C.gold,cursor:sig.direction==="NEUTRAL"?"not-allowed":"pointer",fontSize:10,fontWeight:700,opacity:sig.direction==="NEUTRAL"?0.4:1}}>SIMULATE ENTRY</button>
        :<Badge color={C.gold} small>SIM {simTrade.side} OPEN @ {fmtUSD(simTrade.entry)}</Badge>}
      </div>}
      {simHistory.length>0&&<div style={{background:C.bg2,borderRadius:6,padding:10}}>
        <div style={{color:C.slate,fontSize:9,marginBottom:6}}>SIMULATED TRADES THIS SESSION</div>
        {simHistory.map((t,i)=>(
          <div key={i} style={{display:"flex",gap:8,padding:"4px 0",borderBottom:"1px solid "+C.border+"22"}}>
            <span style={{color:t.side==="BUY"?C.green:C.red,fontSize:9,minWidth:30}}>{t.side}</span>
            <span style={{color:C.white,fontSize:9}}>{fmtUSD(t.entry)} → {fmtUSD(t.exitPrice)}</span>
            <span style={{color:t.result==="TP"?C.green:C.red,fontSize:9}}>{t.result}</span>
            <span style={{color:t.pnlPct>=0?C.green:C.red,fontSize:9,marginLeft:"auto"}}>{t.pnlPct>=0?"+":""}{fmt(t.pnlPct,2)}%</span>
          </div>
        ))}
      </div>}
      <div style={{color:C.dimText,fontSize:9,marginTop:8,textAlign:"center"}}>Step or play through history to see what NEXUS would have signaled at each point. Simulate an entry to test how the signal would have played out — for practice, not real trading.</div>
    </div>
  );
}

function MarketIntelPanel({signals,prices,activePairs,candleData}){
  const [fearGreed]=useState(()=>Math.floor(Math.random()*40)+40);
  const [btcDom]=useState(()=>Math.floor(Math.random()*10)+48);
  const [fundingRate]=useState(()=>((Math.random()-0.5)*0.02).toFixed(4));
  const bullCount=activePairs.filter(p=>signals[p]?.direction.includes("BUY")).length;
  const bearCount=activePairs.filter(p=>signals[p]?.direction.includes("SELL")).length;
  const marketBias=bullCount>bearCount?"BULLISH":bearCount>bullCount?"BEARISH":"NEUTRAL";
  const biasColor=marketBias==="BULLISH"?C.green:marketBias==="BEARISH"?C.red:C.slate;
  const fearGreedLabel=fearGreed>=80?"Extreme Greed":fearGreed>=60?"Greed":fearGreed>=40?"Neutral":fearGreed>=20?"Fear":"Extreme Fear";
  const fearGreedColor=fearGreed>=80?C.red:fearGreed>=60?C.orange:fearGreed>=40?C.slate:fearGreed>=20?C.cyan:C.green;
  const divergences=activePairs.filter(p=>signals[p]&&(signals[p].divergence.bullish||signals[p].divergence.bearish));
  const newsSentiment=newsSentimentScore>=60?"BULLISH":newsSentimentScore>=40?"NEUTRAL":"BEARISH";
  const newsSentimentColor=newsSentiment==="BULLISH"?C.green:newsSentiment==="NEUTRAL"?C.slate:C.red;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:C.bg2,borderRadius:8,padding:14,border:"1px solid "+C.border}}>
        <div style={{color:C.cyan,fontSize:10,fontWeight:700,marginBottom:10}}>◈ MARKET SENTIMENT</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{background:C.bg3,borderRadius:5,padding:10,textAlign:"center"}}>
            <div style={{color:C.dimText,fontSize:9,marginBottom:4}}>FEAR & GREED</div>
            <div style={{color:fearGreedColor,fontSize:28,fontWeight:700}}>{fearGreed}</div>
            <div style={{color:fearGreedColor,fontSize:10}}>{fearGreedLabel}</div>
            <div style={{marginTop:6,height:4,background:C.bg0,borderRadius:2}}><div style={{width:fearGreed+"%",height:"100%",background:fearGreedColor,borderRadius:2}}/></div>
          </div>
          <div style={{background:C.bg3,borderRadius:5,padding:10,textAlign:"center"}}>
            <div style={{color:C.dimText,fontSize:9,marginBottom:4}}>MARKET BIAS</div>
            <div style={{color:biasColor,fontSize:16,fontWeight:700,marginBottom:4}}>{marketBias}</div>
            <div style={{color:C.green,fontSize:10}}>{bullCount} bullish</div>
            <div style={{color:C.red,fontSize:10}}>{bearCount} bearish</div>
          </div>
          <div style={{background:C.bg3,borderRadius:5,padding:10,textAlign:"center"}}>
            <div style={{color:C.dimText,fontSize:9,marginBottom:4}}>BTC DOMINANCE</div>
            <div style={{color:C.gold,fontSize:22,fontWeight:700}}>{btcDom}%</div>
            <div style={{color:btcDom>55?C.red:C.green,fontSize:9}}>{btcDom>55?"Altcoins weak":"Altseason possible"}</div>
          </div>
          <div style={{background:C.bg3,borderRadius:5,padding:10,textAlign:"center"}}>
            <div style={{color:C.dimText,fontSize:9,marginBottom:4}}>NEWS SENTIMENT</div>
            <div style={{color:newsSentimentColor,fontSize:16,fontWeight:700}}>{newsSentiment}</div>
            <div style={{color:C.slate,fontSize:9}}>Score: {newsSentimentScore}/100</div>
          </div>
        </div>
      </div>
      <div style={{background:C.bg2,borderRadius:8,padding:14,border:"1px solid "+C.border}}>
        <div style={{color:C.cyan,fontSize:10,fontWeight:700,marginBottom:10}}>◈ ON-CHAIN & FUTURES</div>
        {[["BTC Funding Rate",fundingRate,parseFloat(fundingRate)>0.005?C.red:parseFloat(fundingRate)<-0.005?C.green:C.slate],["Funding Signal",parseFloat(fundingRate)>0.01?"Longs overleveraged — bearish":parseFloat(fundingRate)<-0.01?"Shorts overleveraged — bullish":"Neutral",parseFloat(fundingRate)>0.01?C.red:parseFloat(fundingRate)<-0.01?C.green:C.slate],["Divergences",divergences.length+" pairs",divergences.length>0?C.gold:C.slate],["Session",isTradingSession()?"Active Session":"Outside Hours",isTradingSession()?C.green:C.slate],["Day",getDayOfWeek(),C.white],["Best Days","Tue/Wed/Thu historically",C.gold]].map(([k,v,c])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+C.border+"22"}}><span style={{color:C.slate,fontSize:10}}>{k}</span><span style={{color:c,fontSize:10,fontWeight:700}}>{v}</span></div>
        ))}
      </div>
      {divergences.length>0&&<div style={{background:C.goldDim,borderRadius:8,padding:12,border:"1px solid "+C.gold+"44"}}>
        <div style={{color:C.gold,fontSize:10,fontWeight:700,marginBottom:8}}>⚡ DIVERGENCE ALERTS</div>
        {divergences.map(p=>(
          <div key={p} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{color:C.white,fontSize:11,fontWeight:700}}>{p}</span>
            <span style={{color:signals[p].divergence.bullish?C.green:C.red,fontSize:10}}>{signals[p].divergence.bullish?"▲ Bullish":"▼ Bearish"}</span>
          </div>
        ))}
      </div>}
      <div style={{background:C.bg2,borderRadius:8,padding:14,border:"1px solid "+C.border}}>
        <div style={{color:C.cyan,fontSize:10,fontWeight:700,marginBottom:10}}>◈ KELLY CRITERION SIZING</div>
        {[50,55,60,65,70].map(wr=>{const kelly=kellySize(wr,2.5);return(
          <div key={wr} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{color:C.slate,fontSize:10}}>{wr}% WR @ 1:2.5</span>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:60,height:4,background:C.bg0,borderRadius:2}}><div style={{width:kelly/25*100+"%",height:"100%",background:C.cyan,borderRadius:2}}/></div>
              <span style={{color:C.cyan,fontSize:10,fontWeight:700,minWidth:36}}>{fmt(kelly,1)}%</span>
            </div>
          </div>
        );})}
        <div style={{color:C.dimText,fontSize:9,marginTop:4}}>Kelly % = mathematically optimal risk per trade. Use half-Kelly for safety.</div>
      </div>
    </div>
  );
}

// ── Auto Trade Engine ──────────────────────────────────────────────
function AutoTradeEngine({isDemo,autoMode,signals,prices,strategy,openOrders,candleData,onPlaceOrder,onCloseOrder,onLog,balance,tradeHistory}){
  const ordersRef=useRef(openOrders);
  const signalsRef=useRef(signals);
  const pricesRef=useRef(prices);
  const balanceRef=useRef(balance);
  useEffect(()=>{ordersRef.current=openOrders;},[openOrders]);
  useEffect(()=>{signalsRef.current=signals;},[signals]);
  useEffect(()=>{pricesRef.current=prices;},[prices]);
  useEffect(()=>{balanceRef.current=balance;},[balance]);
  const lastTradeTime=useRef({});
  const dailyCount=useRef(0);
  const consecutiveLosses=useRef(0);
  const lastDay=useRef(new Date().toDateString());
  const trailHighWater=useRef({});

  useEffect(()=>{
    const iv=setInterval(()=>{
      const today=new Date().toDateString();
      if(today!==lastDay.current){dailyCount.current=0;lastDay.current=today;}
      const minStrength=parseFloat(strategy.minStrength)||72;
      const isTestMode=minStrength<30;
      const currentOrders=ordersRef.current;
      const currentSignals=signalsRef.current;
      const currentPrices=pricesRef.current;
      const currentBalance=balanceRef.current;

      // Monitor open positions — runs for ALL open orders (demo AND live),
      // regardless of Auto Mode setting, so trailing stops/breakeven/TP/SL
      // always manage trades you've already opened, manually or otherwise.
      currentOrders.forEach(order=>{
        const price=currentPrices[order.pair];if(!price)return;
        const isBuy=order.side==="BUY";

        // Track high water mark for trailing
        if(!trailHighWater.current[order.id])trailHighWater.current[order.id]=price;
        if(isBuy&&price>trailHighWater.current[order.id])trailHighWater.current[order.id]=price;
        if(!isBuy&&price<trailHighWater.current[order.id])trailHighWater.current[order.id]=price;

        // Calculate trailing SL
        let effectiveSL=order.sl;
        if(order.useTrail){
          const trailDist=order.trailType==="atr"?(order.atr||price*0.01)*(order.trailAtr||2):price*(order.trailPct||1.5)/100;
          if(isBuy){const tsl=trailHighWater.current[order.id]-trailDist;if(tsl>effectiveSL)effectiveSL=tsl;}
          else{const tsl=trailHighWater.current[order.id]+trailDist;if(tsl<effectiveSL)effectiveSL=tsl;}
        }
        // Breakeven
        if(order.useBE&&order.tp1Hit){
          if(isBuy)effectiveSL=Math.max(effectiveSL,order.price);
          else effectiveSL=Math.min(effectiveSL,order.price);
        }
        const hitSL=isBuy?price<=effectiveSL:price>=effectiveSL;
        if(hitSL){
          onCloseOrder(order.id,"sl");
          if(order.isDemo)consecutiveLosses.current++;
          delete trailHighWater.current[order.id];
          onLog({type:"SL",pair:order.pair,price,side:order.side,time:new Date().toLocaleTimeString(),isDemo:order.isDemo});
          return;
        }
        // TP1
        if(!order.tp1Hit&&order.tp&&(isBuy?price>=order.tp:price<=order.tp)){
          onLog({type:"TP1",pair:order.pair,price,side:order.side,time:new Date().toLocaleTimeString(),isDemo:order.isDemo});
          onCloseOrder(order.id,"tp1");
          if(order.isDemo)consecutiveLosses.current=0;
          return;
        }
        // TP2
        if(order.tp1Hit&&order.tp2&&(isBuy?price>=order.tp2:price<=order.tp2)){
          onCloseOrder(order.id,"tp2");
          if(order.isDemo)consecutiveLosses.current=0;
          delete trailHighWater.current[order.id];
          onLog({type:"TP2",pair:order.pair,price,side:order.side,time:new Date().toLocaleTimeString(),isDemo:order.isDemo});
          return;
        }
      });

      // Auto-entry (opening NEW trades from signals) stays demo + auto-mode gated for safety
      if(!isDemo||autoMode==="OFF")return;
      if(autoMode==="SEMI-AUTO")return;
      const maxTrades=parseInt(strategy.maxTrades)||3;
      const minRR=parseFloat(strategy.minRR)||2.5;
      const riskPct=parseFloat(strategy.riskPct)||1.5;
      if(dailyCount.current>=maxTrades)return;
      if(!isTestMode&&consecutiveLosses.current>=2)return;
      const demoOpenCount=currentOrders.filter(o=>o.isDemo).length;
      if(demoOpenCount>=maxTrades)return;
      // Hard cap - never more than 10 open at once regardless of settings
      if(demoOpenCount>=10)return;
      if(!isTestMode&&strategy.sessionFilter&&!isTradingSession())return; // bypassed in TEST mode

      Object.entries(currentSignals).forEach(([pair,sig])=>{
        if(!sig)return;
        const pairOv=strategy.pairOverrides&&strategy.pairOverrides[pair];
        const effMinStrength=pairOv&&pairOv.minStrength!==undefined?pairOv.minStrength:minStrength;
        const effMinRR=pairOv&&pairOv.minRR!==undefined?pairOv.minRR:minRR;
        const isBuy=sig.direction.includes("BUY")||(sig.direction==="NEUTRAL"&&sig.score>=0);
        if(sig.direction==="NEUTRAL"&&!isTestMode)return;
        if(sig.strength<effMinStrength)return;
        if(sig.riskReward<effMinRR)return;
        const cooldown=isTestMode?30000:300000;
        if(Date.now()-(lastTradeTime.current[pair]||0)<cooldown)return;
        if(openOrders.some(o=>o.pair===pair&&o.isDemo))return;
        if(!isTestMode){
          if(strategy.regimeFilter&&sig.regime){
            const regimeData=sig.advRegime||sig.regime;
            if(!regimeData.tradeable)return;
            if(regimeData.regime==="volatile")return;
            if(regimeData.regime==="trending_bull"&&!isBuy)return;
            if(regimeData.regime==="trending_bear"&&isBuy)return;
          }
          if(strategy.correlationFilter){for(const group of CORRELATED_GROUPS){if(group.includes(pair)&&group.some(p=>p!==pair&&currentOrders.some(o=>o.pair===p&&o.isDemo)))return;}}
          if(strategy.volatilityFilter){const normalAtr=sig.entry*0.02;if(sig.atr>normalAtr*3||sig.atr<normalAtr*0.3)return;}
          if(strategy.mtfFilter&&candleData[pair]){const closes=candleData[pair].map(c=>c.close);const ema21=calcEMA(closes,21).at(-1);const ema50=calcEMA(closes,50).at(-1);if(isBuy&&ema21<ema50)return;if(!isBuy&&ema21>ema50)return;}
        }
        const price=currentPrices[pair];if(!price)return;
        // Per-pair strategy override, if set
        const pairOverride=strategy.pairOverrides&&strategy.pairOverrides[pair];
        const effRiskPct=pairOverride&&pairOverride.riskPct!==undefined?pairOverride.riskPct:riskPct;
        let effectiveRiskPct=effRiskPct;
        if(strategy.sizingMode==="kelly"){
          const th=tradeHistory||[];
          const wins=th.filter(t=>t.pnl>0).length;
          const winRateActual=th.length>=10?(wins/th.length)*100:60;
          const kelly=calcKellySize(winRateActual,sig.riskReward||2,currentBalance,parseFloat(strategy.maxKellyRisk)||5);
          effectiveRiskPct=kelly.recommended?kelly.riskPct:effRiskPct;
        }
        // Robustness-based gating: use Walk-Forward consistency + Monte Carlo
        // ruin risk (once applied via the Backtest tab) to protect real
        // auto-trades from strategies that only tested well by luck.
        let robustnessMultiplier=1;
        if(!isTestMode&&strategy.walkForwardConsistency!==undefined){
          if(strategy.walkForwardConsistency<25)return;
          else if(strategy.walkForwardConsistency<50)robustnessMultiplier*=0.5;
          else if(strategy.walkForwardConsistency<75)robustnessMultiplier*=0.75;
        }
        if(!isTestMode&&strategy.monteCarloProbRuin!==undefined){
          if(strategy.monteCarloProbRuin>20)return;
          else if(strategy.monteCarloProbRuin>10)robustnessMultiplier*=0.5;
          else if(strategy.monteCarloProbRuin>5)robustnessMultiplier*=0.75;
        }
        const riskAmount=currentBalance*(effectiveRiskPct/100)*robustnessMultiplier;
        const slDistance=Math.abs(price-sig.stopLoss)||price*0.01;
        const autoQty=Math.min(riskAmount/slDistance,balance*0.1/price);
        lastTradeTime.current[pair]=Date.now();
        dailyCount.current++;
        onPlaceOrder({pair,mode:"spot",side:isBuy?"BUY":"SELL",orderType:"MARKET",qty:Math.max(0.0001,Math.round(autoQty*10000)/10000),price,sl:sig.stopLoss,tp:sig.tp1,tp2:sig.tp2,tp3:sig.tp3,tp1Pct:40,tp2Pct:40,tp3Pct:20,leverage:1,autoPlaced:true,useOCO:true,useTrail:strategy.autoTrail||false,trailPct:parseFloat(strategy.trailPct||1.5),trailAtr:2,trailType:"pct",useBE:true,atr:sig.atr});
        onLog({type:"OPEN",pair,price,side:isBuy?"BUY":"SELL",signal:sig.direction,strength:Math.round(sig.strength),rr:fmt(sig.riskReward,1),regime:sig.regime?.regime||"unknown",time:new Date().toLocaleTimeString(),isDemo:true,robustnessMultiplier:robustnessMultiplier<1?robustnessMultiplier:undefined});
      });
    },3000);
    return()=>clearInterval(iv);
  },[isDemo,autoMode,signals,prices,strategy,openOrders,balance,candleData,onPlaceOrder,onCloseOrder,onLog]);
  return null;
}

function AutoLog({logs,autoMode,isDemo,onClear}){
  if(!isDemo||autoMode==="OFF")return null;
  return(
    <div style={{background:C.bg1,border:"1px solid "+C.purple,borderRadius:8,padding:14,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{color:C.purple,fontSize:11,fontWeight:700}}>◈ AUTO TRADE LOG</span>
          <Badge color={autoMode==="FULL-AUTO"?C.red:C.cyan} small>{autoMode}</Badge>
          <div style={{width:6,height:6,borderRadius:"50%",background:C.green,animation:"blink 1.5s infinite"}}/>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{color:C.dimText,fontSize:9}}>{logs.length} events</span>
          <button onClick={onClear} style={{background:"none",border:"1px solid "+C.border,color:C.dimText,padding:"2px 8px",borderRadius:3,cursor:"pointer",fontSize:9}}>CLEAR</button>
        </div>
      </div>
      <div style={{maxHeight:140,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
        {logs.length===0&&<div style={{color:C.dimText,fontSize:10,textAlign:"center",padding:10}}>Engine starting — watching for signals...</div>}
        {logs.slice().reverse().map((log,i)=>(
          <div key={i} style={{display:"flex",gap:8,alignItems:"center",padding:"5px 8px",background:C.bg2,borderRadius:4,border:"1px solid "+(log.type==="OPEN"?C.cyan:log.type.startsWith("TP")?C.green:C.red)+"33"}}>
            <span style={{color:log.type==="OPEN"?C.cyan:log.type.startsWith("TP")?C.green:C.red,fontSize:10,fontWeight:700,minWidth:36}}>{log.type}</span>
            <span style={{color:C.white,fontSize:10,fontWeight:700,minWidth:85}}>{log.pair}</span>
            <span style={{color:log.side==="BUY"?C.green:C.red,fontSize:10,minWidth:28}}>{log.side}</span>
            {log.signal&&<Badge color={C.cyan} small>{log.signal} {log.strength}%</Badge>}
            {log.regime&&<Badge color={C.slate} small>{log.regime}</Badge>}
            {log.robustnessMultiplier&&<Badge color={C.purple} small>SIZE ×{log.robustnessMultiplier}</Badge>}
            {log.rr&&<span style={{color:C.gold,fontSize:9}}>1:{log.rr}</span>}
            <span style={{color:C.slate,fontSize:9,marginLeft:"auto"}}>{log.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function evalAlertCondition(cond,sig,price){
  if(!cond)return false;
  const field=cond.field,op=cond.op,val=cond.value;
  let actual;
  switch(field){
    case"price":actual=price;break;
    case"rsi":actual=sig?.rsi;break;
    case"strength":actual=sig?.strength;break;
    case"adx":actual=sig?.adx?.adx;break;
    case"riskReward":actual=sig?.riskReward;break;
    case"regime":actual=sig?.advRegime?.regime||sig?.regime?.regime;break;
    case"direction":actual=sig?.direction;break;
    case"mtfBias":actual=sig?.mtfBias?.bias;break;
    default:return false;
  }
  if(actual===undefined||actual===null)return false;
  if(field==="regime"||field==="direction"||field==="mtfBias")return actual===val;
  const numActual=parseFloat(actual),numVal=parseFloat(val);
  if(op===">")return numActual>numVal;
  if(op==="<")return numActual<numVal;
  if(op===">=")return numActual>=numVal;
  if(op==="<=")return numActual<=numVal;
  if(op==="=")return numActual===numVal;
  return false;
}

function AlertsEngine({prices,signals,alerts,onAlert}){
  const fired=useRef(new Set());
  useEffect(()=>{
    alerts.forEach(alert=>{
      const key=alert.id+":"+alert.type;
      if(fired.current.has(key))return;
      const price=prices[alert.pair];if(!price)return;
      if(alert.type==="compound"&&Array.isArray(alert.conditions)&&alert.conditions.length>0){
        const sig=signals[alert.pair];
        const allMet=alert.conditions.every(c=>evalAlertCondition(c,sig,price));
        if(allMet){fired.current.add(key);onAlert(alert);}
        return;
      }
      if(alert.type==="price_above"&&price>=parseFloat(alert.value)){fired.current.add(key);onAlert(alert);}
      if(alert.type==="price_below"&&price<=parseFloat(alert.value)){fired.current.add(key);onAlert(alert);}
      if(alert.type==="signal"&&signals[alert.pair]?.direction===alert.value){fired.current.add(key);onAlert(alert);}
    });
  },[prices,signals,alerts,onAlert]);
  return null;
}

// ── Exchange Manager Modal ─────────────────────────────────────────
function ExchangeManagerModal({onClose,exchanges,onSave}){
  const [selected,setSelected]=useState(Object.keys(EXCHANGES)[0]);
  const [keys,setKeys]=useState(exchanges||{});
  const [testResult,setTestResult]=useState("");
  const [testing,setTesting]=useState(false);
  const ex=EXCHANGES[selected];

  async function testConnection(){
    setTesting(true);setTestResult("");
    try{
      const res=await fetch(ex.restBase+(selected==="Binance"?"ticker/price?symbol=BTCUSDT":""));
      if(res.ok){setTestResult("✓ Connected to "+selected+" successfully");}
      else setTestResult("✗ Could not reach "+selected+" API");
    }catch(e){setTestResult("✗ Connection failed — check internet");}
    setTesting(false);
  }

  function save(){
    onSave(keys);onClose();
  }

  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.88)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,width:"min(560px,96vw)",maxHeight:"90vh",overflowY:"auto",margin:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:C.bg2,padding:"14px 18px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"12px 12px 0 0",position:"sticky",top:0}}>
          <span style={{color:C.white,fontSize:14,fontWeight:700,fontFamily:"monospace"}}>◈ EXCHANGE CONNECTIONS</span>
          <button onClick={onClose} style={{background:C.bg3,border:"1px solid "+C.border,color:C.white,width:30,height:30,borderRadius:6,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:18}}>
          {/* Exchange selector */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
            {Object.entries(EXCHANGES).map(([key,ex])=>(
              <button key={key} onClick={()=>setSelected(key)} style={{padding:"8px 12px",borderRadius:6,cursor:"pointer",fontSize:11,background:selected===key?ex.color+"22":C.bg3,border:"2px solid "+(selected===key?ex.color:C.border),color:selected===key?ex.color:C.slate,fontFamily:"monospace",fontWeight:selected===key?700:400,display:"flex",alignItems:"center",gap:6}}>
                <span>{ex.logo}</span>{ex.name}
                {keys[key]?.apiKey&&<span style={{color:C.green,fontSize:9}}>✓</span>}
              </button>
            ))}
          </div>

          {/* Selected exchange details */}
          <div style={{background:C.bg2,borderRadius:8,padding:16,marginBottom:14,border:"1px solid "+(ex.color+"44")}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:24}}>{ex.logo}</span>
                <div>
                  <div style={{color:ex.color,fontSize:14,fontWeight:700,fontFamily:"monospace"}}>{ex.name}</div>
                  <div style={{color:C.dimText,fontSize:10}}>{ex.website}</div>
                </div>
              </div>
              {keys[selected]?.apiKey&&<Badge color={C.green} small>✓ CONNECTED</Badge>}
            </div>

            <div style={{marginBottom:10}}>
              <div style={{color:C.slate,fontSize:10,marginBottom:5}}>{ex.apiKeyLabel}</div>
              <input type="password" value={keys[selected]?.apiKey||""} onChange={e=>setKeys(k=>({...k,[selected]:{...k[selected],apiKey:e.target.value}}))} placeholder={"Enter "+selected+" "+ex.apiKeyLabel} style={{width:"100%",background:C.bg3,border:"1px solid "+(keys[selected]?.apiKey?C.green:C.border),borderRadius:4,color:C.white,padding:"10px 12px",fontFamily:"monospace",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:10}}>
              <div style={{color:C.slate,fontSize:10,marginBottom:5}}>{ex.secretLabel}</div>
              <input type="password" value={keys[selected]?.secret||""} onChange={e=>setKeys(k=>({...k,[selected]:{...k[selected],secret:e.target.value}}))} placeholder={"Enter "+selected+" "+ex.secretLabel} style={{width:"100%",background:C.bg3,border:"1px solid "+(keys[selected]?.secret?C.green:C.border),borderRadius:4,color:C.white,padding:"10px 12px",fontFamily:"monospace",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
            </div>
            {selected==="KuCoin"&&<div style={{marginBottom:10}}>
              <div style={{color:C.slate,fontSize:10,marginBottom:5}}>API Passphrase</div>
              <input type="password" value={keys[selected]?.passphrase||""} onChange={e=>setKeys(k=>({...k,[selected]:{...k[selected],passphrase:e.target.value}}))} placeholder="KuCoin API Passphrase" style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"10px 12px",fontFamily:"monospace",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
            </div>}
            {selected==="Custom"&&<>
              <div style={{marginBottom:10}}>
                <div style={{color:C.slate,fontSize:10,marginBottom:5}}>Exchange Name</div>
                <input value={keys[selected]?.name||""} onChange={e=>setKeys(k=>({...k,[selected]:{...k[selected],name:e.target.value}}))} placeholder="e.g. MyExchange" style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"10px 12px",fontFamily:"monospace",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{color:C.slate,fontSize:10,marginBottom:5}}>REST API Base URL</div>
                <input value={keys[selected]?.restBase||""} onChange={e=>setKeys(k=>({...k,[selected]:{...k[selected],restBase:e.target.value}}))} placeholder="https://api.myexchange.com/v1/" style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"10px 12px",fontFamily:"monospace",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{color:C.slate,fontSize:10,marginBottom:5}}>WebSocket URL (optional)</div>
                <input value={keys[selected]?.wsBase||""} onChange={e=>setKeys(k=>({...k,[selected]:{...k[selected],wsBase:e.target.value}}))} placeholder="wss://ws.myexchange.com" style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"10px 12px",fontFamily:"monospace",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              </div>
            </>}

            <div style={{background:C.goldDim,borderRadius:6,padding:10,marginBottom:12,border:"1px solid "+C.gold+"44"}}>
              <div style={{color:C.gold,fontSize:10,fontWeight:700,marginBottom:4}}>⚠ SECURITY — REQUIRED</div>
              <div style={{color:C.slate,fontSize:10,lineHeight:1.7}}>
                ✓ Enable Trade permissions only<br/>
                ✓ Never enable Withdrawals<br/>
                ✓ Leave IP as Unrestricted for mobile<br/>
                ✓ Keys stored locally on your device only<br/>
                ✗ Never share your secret key with anyone
              </div>
            </div>

            <div style={{display:"flex",gap:8}}>
              <button onClick={testConnection} disabled={testing} style={{flex:1,padding:"9px 0",borderRadius:4,border:"1px solid "+ex.color,background:ex.color+"22",color:ex.color,cursor:"pointer",fontFamily:"monospace",fontSize:11,fontWeight:700}}>{testing?"TESTING...":"TEST CONNECTION"}</button>
              <button onClick={()=>setKeys(k=>({...k,[selected]:{apiKey:"",secret:"",passphrase:""}}))} style={{padding:"9px 14px",borderRadius:4,border:"1px solid "+C.red,background:C.redDim,color:C.red,cursor:"pointer",fontFamily:"monospace",fontSize:11}}>CLEAR</button>
            </div>
            {testResult&&<div style={{marginTop:8,padding:"8px 10px",borderRadius:4,background:testResult.startsWith("✓")?C.greenDim:C.redDim,border:"1px solid "+(testResult.startsWith("✓")?C.green:C.red),color:testResult.startsWith("✓")?C.green:C.red,fontSize:11}}>{testResult}</div>}
          </div>

          {/* Connection status overview */}
          <div style={{background:C.bg2,borderRadius:8,padding:14,marginBottom:14}}>
            <div style={{color:C.cyan,fontSize:10,fontWeight:700,marginBottom:10}}>CONNECTED EXCHANGES</div>
            {Object.entries(EXCHANGES).map(([key,ex])=>(
              <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid "+C.border+"22"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span>{ex.logo}</span>
                  <span style={{color:C.white,fontSize:11,fontFamily:"monospace"}}>{ex.name}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  {keys[key]?.apiKey?<><div style={{width:6,height:6,borderRadius:"50%",background:C.green}}/><span style={{color:C.green,fontSize:10}}>Connected</span></>:<><div style={{width:6,height:6,borderRadius:"50%",background:C.dimText}}/><span style={{color:C.dimText,fontSize:10}}>Not connected</span></>}
                </div>
              </div>
            ))}
          </div>

          <div style={{background:C.bg2,borderRadius:6,padding:12,marginBottom:14,border:"1px solid "+C.cyan+"22"}}>
            <div style={{color:C.cyan,fontSize:10,fontWeight:700,marginBottom:6}}>ℹ NEXT STEPS</div>
            <div style={{color:C.slate,fontSize:10,lineHeight:1.7}}>
              Exchange connection is currently in read-only mode — price data only.<br/>
              Live order execution via API will be enabled in the next update when the server bot is deployed.<br/>
              All keys are stored securely on your device only — never sent to any server.
            </div>
          </div>

          <button onClick={save} style={{width:"100%",padding:"12px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.cyan,color:"#000",fontWeight:700,fontFamily:"monospace",fontSize:13}}>SAVE ALL EXCHANGE KEYS</button>
        </div>
      </div>
    </div>
  );
}
// ── Main Trading App ───────────────────────────────────────────────
function AIChatPanel({signals,prices,openOrders,tradeHistory,portfolio,isDemo,selectedPair,strategy,apiKey}){
  const [messages,setMessages]=useState([{role:"assistant",content:"Hi! I'm your NEXUS AI trading assistant. I can see your live signals, open positions and trade history. Ask me anything about your trades, market conditions, or strategy."}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const msgEndRef=useRef(null);
  useEffect(()=>{msgEndRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  async function sendMessage(){
    if(!input.trim()||loading)return;
    const userMsg=input.trim();
    setInput("");
    setMessages(prev=>[...prev,{role:"user",content:userMsg}]);
    setLoading(true);
    const sig=signals[selectedPair];
    const openPos=openOrders.filter(o=>o.isDemo===isDemo);
    const recentTrades=(tradeHistory||[]).slice(0,10);
    const wins=(tradeHistory||[]).filter(t=>t.pnl>0).length;
    const winRate=(tradeHistory||[]).length>0?Math.round((wins/(tradeHistory||[]).length)*100):0;
    const context=`You are NEXUS AI, an expert crypto trading assistant embedded in the NEXUS AI Trading Terminal.
CURRENT MARKET (${selectedPair}):
- Price: ${fmtUSD(prices[selectedPair]||0)}
- Signal: ${sig?.direction||"loading"} (Strength: ${Math.round(sig?.strength||0)}%)
- RSI: ${fmt(sig?.rsi||50,1)} | ADX: ${fmt(sig?.adx?.adx||0,0)}
- Regime: ${(sig?.advRegime||sig?.regime)?.regime||"unknown"} | Tradeable: ${(sig?.advRegime||sig?.regime)?.tradeable||false}
- MTF Bias: ${sig?.mtfBias?.bias||"neutral"} ${sig?.mtfBias?.confirmed?"CONFIRMED":""}
- Session Score: ${sig?.sessionProfile?.volatilityScore||50}%
- Hidden Div: ${sig?.hiddenDiv?.bullish?"Bull continuation":sig?.hiddenDiv?.bearish?"Bear continuation":"None"}
- Top Pattern: ${sig?.candleScore?.topPattern?.name||"None"}
- Support: ${sig?.liquidityZones?.nearestS?fmtUSD(sig.liquidityZones.nearestS.price):"none"} | Resist: ${sig?.liquidityZones?.nearestR?fmtUSD(sig.liquidityZones.nearestR.price):"none"}
- Entry: ${fmtUSD(sig?.entry||0)} | SL: ${fmtUSD(sig?.stopLoss||0)} | TP1: ${fmtUSD(sig?.tp1||0)} | TP2: ${fmtUSD(sig?.tp2||0)} | R:R: ${fmt(sig?.riskReward||0,2)}x
OPEN POSITIONS (${isDemo?"DEMO":"LIVE"}): ${openPos.length}
${openPos.map(o=>"- "+o.pair+" "+o.side+" "+o.qty+" @ "+fmtUSD(o.price)+" SL:"+fmtUSD(o.sl)+" TP:"+fmtUSD(o.tp)).join("\n")||"None"}
ACCOUNT: Balance ${fmtUSD(portfolio?.balance||(isDemo?50000:0))} | Win Rate ${winRate}% from ${(tradeHistory||[]).length} trades
Strategy: ${strategy?.name||"Custom"} | Auto: ${strategy?.autoMode||"OFF"} | Min Strength: ${strategy?.minStrength||72}%
Walk-Forward Consistency: ${strategy?.walkForwardConsistency!==undefined?strategy.walkForwardConsistency+"% of tested periods were profitable":"not tested yet"} | Monte Carlo Ruin Risk: ${strategy?.monteCarloProbRuin!==undefined?strategy.monteCarloProbRuin+"%":"not tested yet"}
RECENT TRADES:
${recentTrades.map(t=>"- "+t.pair+" "+t.side+" "+(t.status||"")+" P&L: "+fmtUSD(t.pnl||0)).join("\n")||"No trades yet"}
Answer concisely using this real data. Be specific and reference actual numbers.`;
    try{
      if(isDemo){
        await new Promise(r=>setTimeout(r,900));
        const openLine=openPos.length>0?openPos.map(o=>o.pair+" "+o.side+" "+fmtUSD(o.price)).join(", "):"none open";
        let reply="Based on your current data — "+selectedPair+" is showing "+(sig?.direction||"a NEUTRAL")+" signal at "+Math.round(sig?.strength||0)+"% strength";
        if(sig?.advRegime)reply+=", regime is "+(sig.advRegime.regime||"unknown").replace("_"," ")+(sig.advRegime.tradeable?" (tradeable)":" (avoid trading)");
        reply+=". Your win rate is "+winRate+"% across "+(tradeHistory||[]).length+" trades, current balance "+fmtUSD(portfolio?.balance||(isDemo?50000:0))+". Open positions: "+openLine+".";
        if(sig?.riskReward)reply+=" R:R on "+selectedPair+" is 1:"+fmt(sig.riskReward,2)+".";
        reply+="\n\n[DEMO MODE — this is a data-driven summary, not live AI. Add your Anthropic API key in Settings and switch to Live for full conversational AI analysis.]";
        setMessages(prev=>[...prev,{role:"assistant",content:reply}]);
        setLoading(false);
        return;
      }
      if(!apiKey){
        setMessages(prev=>[...prev,{role:"assistant",content:"No API key set. Add your Anthropic API key in Settings to use live AI chat, or enable Demo Mode for a free data summary."}]);
        setLoading(false);
        return;
      }
      const response=await fetch(SUPABASE_URL+"/functions/v1/nexus-ai-proxy",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+SUPABASE_KEY},body:JSON.stringify({apiKey,model:"claude-sonnet-4-6",max_tokens:1000,system:context,messages:[...messages.slice(1).map(m=>({role:m.role,content:m.content})),{role:"user",content:userMsg}]})});
      if(!response.ok){
        const errText=await response.text().catch(()=>"");
        throw new Error("HTTP "+response.status+" "+errText.slice(0,120));
      }
      const data=await response.json();
      const reply=data.content?.[0]?.text||"Sorry, I couldn't get a response. Please try again.";
      setMessages(prev=>[...prev,{role:"assistant",content:reply}]);
    }catch(e){
      setMessages(prev=>[...prev,{role:"assistant",content:"Connection error: "+(e.message||"unknown")+". If this persists, check that the nexus-ai-proxy Supabase function is deployed, or enable Demo Mode."}]);
    }
    setLoading(false);
  }
  return(
    <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,display:"flex",flexDirection:"column",height:520}}>
      <div style={{padding:"12px 16px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{color:C.cyan,fontSize:11,fontWeight:700,letterSpacing:"0.1em"}}>◈ AI TRADING ASSISTANT</div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}><div style={{width:6,height:6,borderRadius:"50%",background:C.green}}/><span style={{color:C.green,fontSize:9}}>LIVE DATA</span></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:8}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"85%",background:m.role==="user"?C.cyanDim:C.bg2,border:"1px solid "+(m.role==="user"?C.cyan:C.border),borderRadius:8,padding:"8px 12px"}}>
              {m.role==="assistant"&&<div style={{color:C.cyan,fontSize:8,fontWeight:700,marginBottom:4}}>◈ NEXUS AI</div>}
              <div style={{color:C.white,fontSize:11,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.content}</div>
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"8px 12px"}}><div style={{color:C.cyan,fontSize:8,fontWeight:700,marginBottom:4}}>◈ NEXUS AI</div><div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.cyan,opacity:0.6}}/>)}</div></div></div>}
        <div ref={msgEndRef}/>
      </div>
      <div style={{padding:10,borderTop:"1px solid "+C.border,display:"flex",gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()} placeholder="Ask about your trades, signals, strategy..." style={{flex:1,background:C.bg3,border:"1px solid "+C.border,borderRadius:6,color:C.white,padding:"8px 12px",fontFamily:"monospace",fontSize:11,outline:"none"}}/>
        <button onClick={sendMessage} disabled={loading||!input.trim()} style={{background:loading?C.bg3:C.cyan,border:"none",borderRadius:6,color:loading?C.slate:"#000",padding:"8px 14px",cursor:loading?"not-allowed":"pointer",fontFamily:"monospace",fontSize:11,fontWeight:700}}>{loading?"...":"SEND"}</button>
      </div>
      <div style={{padding:"4px 10px 8px",display:"flex",gap:5,flexWrap:"wrap"}}>
        {["Best trade right now?","Analyse open positions","Good time to trade?","My win rate?","Should I trade BTC?"].map(q=>(
          <button key={q} onClick={()=>setInput(q)} style={{background:C.bg3,border:"1px solid "+C.border+"66",borderRadius:4,color:C.dimText,padding:"3px 7px",cursor:"pointer",fontSize:8,fontFamily:"monospace"}}>{q}</button>
        ))}
      </div>
    </div>
  );
}

// ── PRO FEATURES ───────────────────────────────────────────────────

// Sharpe & Sortino Ratios
function calcSharpeRatio(trades,riskFreeRate=0){
  if(!trades||trades.length<2)return 0;
  const returns=trades.map(t=>t.pnlPct||0);
  const mean=returns.reduce((a,b)=>a+b,0)/returns.length;
  const std=Math.sqrt(returns.reduce((a,b)=>a+(b-mean)**2,0)/returns.length);
  return std===0?0:parseFloat(((mean-riskFreeRate)/std).toFixed(2));
}

function calcSortinoRatio(trades,riskFreeRate=0){
  if(!trades||trades.length<2)return 0;
  const returns=trades.map(t=>t.pnlPct||0);
  const mean=returns.reduce((a,b)=>a+b,0)/returns.length;
  const negReturns=returns.filter(r=>r<riskFreeRate);
  if(negReturns.length===0)return mean>0?99:0;
  const downDev=Math.sqrt(negReturns.reduce((a,b)=>a+(b-riskFreeRate)**2,0)/negReturns.length);
  return downDev===0?0:parseFloat(((mean-riskFreeRate)/downDev).toFixed(2));
}

function calcMaxDrawdown(trades){
  if(!trades||trades.length===0)return 0;
  let peak=0,maxDD=0,running=0;
  trades.forEach(t=>{
    running+=t.pnl||0;
    if(running>peak)peak=running;
    const dd=peak-running;
    if(dd>maxDD)maxDD=dd;
  });
  return maxDD;
}

function calcStreaks(trades){
  if(!trades||trades.length===0)return{currentWin:0,currentLoss:0,bestWin:0,worstLoss:0};
  let cw=0,cl=0,bw=0,wl=0;
  trades.forEach(t=>{
    if(t.pnl>0){cw++;cl=0;bw=Math.max(bw,cw);}
    else{cl++;cw=0;wl=Math.max(wl,cl);}
  });
  return{currentWin:cw,currentLoss:cl,bestWin:bw,worstLoss:wl};
}

// DCA Strategy Calculator
function calcDCALevels(entryPrice,dropPct,levels,investAmount){
  const result=[];
  let totalInvested=0,totalUnits=0;
  for(let i=0;i<levels;i++){
    const price=entryPrice*(1-dropPct/100)**i;
    const amount=investAmount*(1+i*0.5); // increasing amounts
    const units=amount/price;
    totalInvested+=amount;
    totalUnits+=units;
    const avgPrice=totalInvested/totalUnits;
    result.push({level:i+1,price,amount,units,avgPrice,breakeven:avgPrice,totalInvested,totalUnits});
  }
  return result;
}

// Risk Manager
function checkRiskLimits(openOrders,tradeHistory,balance,strategy,isDemo){
  const today=new Date().toDateString();
  const todayTrades=tradeHistory.filter(t=>{
    try{return new Date(t.time).toDateString()===today;}catch(e){return false;}
  });
  const dailyPnl=todayTrades.reduce((a,t)=>a+(t.pnl||0),0);
  const dailyLossLimit=balance*(parseFloat(strategy.dailyLoss||5)/100);
  const openPnl=openOrders.filter(o=>o.isDemo===isDemo).reduce((s,o)=>s+(o.pnl||0),0);
  const totalExposure=openOrders.filter(o=>o.isDemo===isDemo).reduce((s,o)=>s+o.qty*o.price,0);
  const exposurePct=(totalExposure/balance)*100;
  return{
    dailyPnl,dailyLossLimit,dailyLossHit:dailyPnl<=-dailyLossLimit,
    openPositions:openOrders.filter(o=>o.isDemo===isDemo).length,
    totalExposure,exposurePct,
    maxExposureHit:exposurePct>80,
    warnings:[
      dailyPnl<=-dailyLossLimit*0.8?`⚠ Near daily loss limit: ${fmtUSD(Math.abs(dailyPnl))} / ${fmtUSD(dailyLossLimit)}`:"",
      exposurePct>60?`⚠ High exposure: ${fmt(exposurePct,0)}% of account`:"",
      openOrders.filter(o=>o.isDemo===isDemo).length>=(parseInt(strategy.maxTrades||3)-1)?`⚠ Near max trades limit`:"",
    ].filter(Boolean)
  };
}

// Portfolio VaR — historical simulation method using each pair's real candle returns
function calcPortfolioVaR(openOrders,candleData,balance,isDemo){
  const positions=openOrders.filter(o=>o.isDemo===isDemo);
  if(positions.length===0)return{var95:0,var99:0,varPct95:0,varPct99:0,worstCase:0,positions:0,insufficientData:false};
  const returnsByPair={};
  let minLen=Infinity;
  positions.forEach(o=>{
    const candles=candleData[o.pair];
    if(!candles||candles.length<20)return;
    const closes=candles.map(c=>c.close);
    const rets=[];
    for(let i=1;i<closes.length;i++)rets.push((closes[i]-closes[i-1])/closes[i-1]);
    returnsByPair[o.pair]=rets;
    minLen=Math.min(minLen,rets.length);
  });
  if(!isFinite(minLen)||minLen<10)return{var95:0,var99:0,varPct95:0,varPct99:0,worstCase:0,positions:positions.length,insufficientData:true};
  const scenarios=[];
  const fixedMinLen=minLen;
  for(let i=0;i<fixedMinLen;i++){
    let pnl=0;
    positions.forEach(o=>{
      const rets=returnsByPair[o.pair];
      if(!rets)return;
      const r=rets[rets.length-fixedMinLen+i];
      const posValue=o.qty*o.price*(o.leverage||1);
      const sideMult=o.side==="BUY"?1:-1;
      pnl+=posValue*r*sideMult;
    });
    scenarios.push(pnl);
  }
  scenarios.sort((a,b)=>a-b);
  const idx95=Math.floor(scenarios.length*0.05);
  const idx99=Math.floor(scenarios.length*0.01);
  const var95=Math.abs(Math.min(0,scenarios[idx95]||0));
  const var99=Math.abs(Math.min(0,scenarios[Math.max(0,idx99)]||0));
  const worstCase=Math.abs(Math.min(0,scenarios[0]||0));
  return{
    var95,var99,
    varPct95:balance>0?(var95/balance)*100:0,
    varPct99:balance>0?(var99/balance)*100:0,
    worstCase,positions:positions.length,scenarioCount:scenarios.length,insufficientData:false
  };
}

// Equity Curve data builder
function buildEquityCurve(trades,startBalance=50000){
  let balance=startBalance;
  const curve=[{x:0,y:balance,label:"Start"}];
  trades.slice().reverse().forEach((t,i)=>{
    balance+=t.pnl||0;
    curve.push({x:i+1,y:Math.round(balance*100)/100,label:t.pair,pnl:t.pnl,side:t.side});
  });
  return curve;
}

// ── SMART MONEY CONCEPTS (SMC) ─────────────────────────────────────
function detectSMC(candles){
  if(!candles||candles.length<50)return{bos:[],choch:[],fvg:[],orderBlocks:[],swingHighs:[],swingLows:[]};
  const bos=[],choch=[],fvg=[],orderBlocks=[];
  const swingHighs=[],swingLows=[];

  // Detect swing highs and lows
  for(let i=3;i<candles.length-3;i++){
    if(candles[i].high>candles[i-1].high&&candles[i].high>candles[i-2].high&&candles[i].high>candles[i+1].high&&candles[i].high>candles[i+2].high)
      swingHighs.push({idx:i,price:candles[i].high,candle:candles[i]});
    if(candles[i].low<candles[i-1].low&&candles[i].low<candles[i-2].low&&candles[i].low<candles[i+1].low&&candles[i].low<candles[i+2].low)
      swingLows.push({idx:i,price:candles[i].low,candle:candles[i]});
  }

  // Break of Structure (BOS) — price breaks previous swing high/low in trend direction
  for(let i=1;i<swingHighs.length;i++){
    const prev=swingHighs[i-1],curr=swingHighs[i];
    if(curr.price>prev.price){
      bos.push({type:"bullish",price:prev.price,idx:curr.idx,label:"BOS ▲"});
    }
  }
  for(let i=1;i<swingLows.length;i++){
    const prev=swingLows[i-1],curr=swingLows[i];
    if(curr.price<prev.price){
      bos.push({type:"bearish",price:prev.price,idx:curr.idx,label:"BOS ▼"});
    }
  }

  // Change of Character (CHoCH) — reversal signal
  for(let i=1;i<swingHighs.length&&i<swingLows.length;i++){
    const sh=swingHighs[i],sl=swingLows[i];
    if(sl.idx>sh.idx&&sl.price<swingLows[i-1]?.price){
      choch.push({type:"bearish",price:sh.price,idx:sl.idx,label:"CHoCH ↓"});
    }
    if(sh.idx>sl.idx&&sh.price>swingHighs[i-1]?.price){
      choch.push({type:"bullish",price:sl.price,idx:sh.idx,label:"CHoCH ↑"});
    }
  }

  // Fair Value Gaps (FVG) — 3-candle imbalance
  for(let i=2;i<candles.length;i++){
    const c1=candles[i-2],c2=candles[i-1],c3=candles[i];
    // Bullish FVG: gap between c1 high and c3 low
    if(c3.low>c1.high&&c2.close>c2.open){
      fvg.push({type:"bullish",top:c3.low,bottom:c1.high,idx:i,filled:candles.slice(i).some(c=>c.low<=c1.high)});
    }
    // Bearish FVG: gap between c1 low and c3 high
    if(c3.high<c1.low&&c2.close<c2.open){
      fvg.push({type:"bearish",top:c1.low,bottom:c3.high,idx:i,filled:candles.slice(i).some(c=>c.high>=c1.low)});
    }
  }

  // Order Blocks — last opposing candle before a strong move
  for(let i=3;i<candles.length-1;i++){
    const c=candles[i];
    const nextMove=candles.slice(i+1,i+4);
    const strongBull=nextMove.every(n=>n.close>n.open)&&nextMove.reduce((a,n)=>a+(n.close-n.open),0)>calcATR([...candles.slice(0,i+1)])*2;
    const strongBear=nextMove.every(n=>n.close<n.open)&&nextMove.reduce((a,n)=>a+(n.open-n.close),0)>calcATR([...candles.slice(0,i+1)])*2;
    if(strongBull&&c.close<c.open){
      orderBlocks.push({type:"bullish",top:c.open,bottom:c.low,idx:i,price:(c.open+c.low)/2});
    }
    if(strongBear&&c.close>c.open){
      orderBlocks.push({type:"bearish",top:c.high,bottom:c.open,idx:i,price:(c.high+c.open)/2});
    }
  }

  return{
    bos:bos.slice(-5),
    choch:choch.slice(-3),
    fvg:fvg.slice(-10).filter(f=>!f.filled),
    orderBlocks:orderBlocks.slice(-5),
    swingHighs:swingHighs.slice(-5),
    swingLows:swingLows.slice(-5),
    bullishBOS:bos.filter(b=>b.type==="bullish").length,
    bearishBOS:bos.filter(b=>b.type==="bearish").length,
    lastCHoCH:choch.at(-1)||null,
  };
}

// ── FUNDING RATE (simulated from price action) ─────────────────────
function estimateFundingRate(candles){
  if(!candles||candles.length<20)return{rate:0,sentiment:"neutral"};
  const closes=candles.map(c=>c.close);
  const ema20=calcEMA(closes,20).at(-1);
  const current=closes.at(-1);
  const deviation=(current-ema20)/ema20*100;
  // Funding rate correlates with price deviation from mean
  const rate=parseFloat((deviation*0.01).toFixed(4));
  const sentiment=rate>0.05?"bullish":rate<-0.05?"bearish":"neutral";
  return{rate,sentiment,annualized:rate*3*365};
}

// ── LIQUIDATION LEVELS ─────────────────────────────────────────────
function calcLiquidationLevels(currentPrice,candles){
  if(!candles||candles.length<50)return{levels:[],nearestBull:null,nearestBear:null};
  const atr=calcATR(candles);
  // Common leverage multiples create liquidation clusters
  const levels=[];
  [10,25,50,100].forEach(lev=>{
    const bullLiq=currentPrice*(1-1/lev);  // long liquidation below
    const bearLiq=currentPrice*(1+1/lev);  // short liquidation above
    levels.push({price:bullLiq,type:"long_liq",leverage:lev,label:lev+"x Long Liq"});
    levels.push({price:bearLiq,type:"short_liq",leverage:lev,label:lev+"x Short Liq"});
  });
  const nearestBull=levels.filter(l=>l.type==="long_liq"&&l.price<currentPrice).sort((a,b)=>b.price-a.price)[0]||null;
  const nearestBear=levels.filter(l=>l.type==="short_liq"&&l.price>currentPrice).sort((a,b)=>a.price-b.price)[0]||null;
  return{levels,nearestBull,nearestBear};
}

// ── POSITION SIZE CALCULATOR ───────────────────────────────────────
function calcPositionSize(accountBalance,riskPct,entryPrice,stopLossPrice,leverage=1){
  const riskAmount=accountBalance*(riskPct/100);
  const slDistance=Math.abs(entryPrice-stopLossPrice);
  const slPct=(slDistance/entryPrice)*100;
  const positionSize=riskAmount/(slDistance||0.0001);
  const positionValue=positionSize*entryPrice;
  const marginRequired=positionValue/leverage;
  const maxLeverage=Math.floor(entryPrice/slDistance);
  return{riskAmount,slDistance,slPct,positionSize,positionValue,marginRequired,maxLeverage,riskRewardNeeded:1/((slPct/100)||0.0001)};
}

// ── P&L HEATMAP CALENDAR ──────────────────────────────────────────
function buildPnLCalendar(trades){
  const calendar={};
  trades.forEach(t=>{
    let dateKey;
    try{
      const d=new Date(t.time||Date.now());
      dateKey=d.toISOString().split("T")[0];
    }catch(e){dateKey=new Date().toISOString().split("T")[0];}
    if(!calendar[dateKey])calendar[dateKey]={date:dateKey,pnl:0,trades:0,wins:0};
    calendar[dateKey].pnl+=t.pnl||0;
    calendar[dateKey].trades++;
    if(t.pnl>0)calendar[dateKey].wins++;
  });
  return Object.values(calendar).sort((a,b)=>a.date.localeCompare(b.date));
}

// ── TRADE REPLAY ENGINE ────────────────────────────────────────────
function getReplayCandles(candles,replayIdx){
  if(!candles||replayIdx<10)return[];
  return candles.slice(0,replayIdx);
}

function TradingApp({user,onSignOut}){
  const uid=user.id;
  const [activePairs,setActivePairs]=useState(()=>lLoad("ap_"+uid,DEFAULT_PAIRS));
  const [selectedPair,setSelectedPair]=useState(()=>lLoad("sp_"+uid,"BTC/USDT"));
  const [timeframe,setTimeframe]=useState(()=>lLoad("tf_"+uid,"15m"));
  const [tab,setTab]=useState(()=>lLoad("tab_"+uid,"dashboard"));
  const [subTab,setSubTab]=useState("chart");
  const [pairSearch,setPairSearch]=useState("");
  const [indicatorSettings,setIndicatorSettings]=useState(()=>lLoad("ind_"+uid,{
    rsiPeriod:14, macdFast:12, macdSlow:26, macdSignal:9,
    bbPeriod:20, bbStd:2, ema1:9, ema2:21, ema3:50, ema4:200,
    atrPeriod:14, adxPeriod:14, stPeriod:10, stMult:3,
    stochK:14, stochD:3, cciPeriod:20, mfiPeriod:14,
    useCustom:false // when false AI uses defaults, when true uses custom values
  }));
  const [showIndicatorPanel,setShowIndicatorPanel]=useState(false);
  const [showAddPair,setShowAddPair]=useState(false);
  const [showOrderModal,setShowOrderModal]=useState(false);
  const [showAlertsModal,setShowAlertsModal]=useState(false);
  const [showExchangeModal,setShowExchangeModal]=useState(false);
  const [dataStatus,setDataStatus]=useState("initializing");
  const [candleData,setCandleData]=useState(()=>{
    const pairs=lLoad("ap_"+uid,DEFAULT_PAIRS);
    return Object.fromEntries(pairs.map(p=>[p,initCandles(BASE_PRICES[p]||1)]));
  });
  const [signals,setSignals]=useState({});
  const [prices,setPrices]=useState({...BASE_PRICES});
  const pricesRef=useRef({...BASE_PRICES});
  // Keep pricesRef in sync with prices state always
  useEffect(()=>{pricesRef.current={...prices};},[prices]);
  const [isDemo,setIsDemo]=useState(()=>lLoad("demo_"+uid,false));
  const [livePortfolio,setLivePortfolio]=useState(()=>lLoad("live_port_"+uid,{balance:0,pnl:0,pnlPct:0,totalTrades:0,wins:0,losses:0,winRate:0,bestTrade:0,worstTrade:0,profitFactor:0,totalWinAmount:0,totalLossAmount:0}));
  const [demoPortfolio,setDemoPortfolio]=useState(()=>lLoad("demo_port_"+uid,{balance:50000,pnl:0,pnlPct:0,totalTrades:0,wins:0,losses:0,winRate:0,bestTrade:0,worstTrade:0,profitFactor:0,totalWinAmount:0,totalLossAmount:0}));
  const portfolio=isDemo?demoPortfolio:livePortfolio;
  function setPortfolio(fn){if(isDemo)setDemoPortfolio(fn);else setLivePortfolio(fn);}
  const [demoBalance,setDemoBalance]=useState(()=>lLoad("demo_bal_"+uid,50000));
  const [liveBalance,setLiveBalance]=useState(()=>lLoad("live_bal_"+uid,0));
  const [openOrders,setOpenOrders]=useState(()=>lLoad("orders_"+uid,[]));
  const [demoTradeHistory,setDemoTradeHistory]=useState(()=>lLoad("demo_history_"+uid,[]));
  const [liveTradeHistory,setLiveTradeHistory]=useState(()=>lLoad("live_history_"+uid,[]));
  const tradeHistory=isDemo?demoTradeHistory:liveTradeHistory;
  function addToHistory(trade){
    // Always use the trade's own isDemo flag to determine which bucket
    const tradeIsDemo=trade.isDemo!==undefined?trade.isDemo:isDemo;
    if(tradeIsDemo){
      setDemoTradeHistory(h=>[{...trade,isDemo:true},...h].slice(0,200));
    } else {
      setLiveTradeHistory(h=>[{...trade,isDemo:false},...h].slice(0,200));
    }
  }
  function clearAllHistory(){
    setDemoTradeHistory([]);
    setLiveTradeHistory([]);
    lSave("demo_history_"+uid,[]);
    lSave("live_history_"+uid,[]);
  }
  const [strategy,setStrategy]=useState(()=>lLoad("strat_"+uid,{name:"NEXUS Prime",riskPct:1.5,maxTrades:3,minRR:2.5,minStrength:72,autoMode:"OFF",dailyLossLimit:3,trailPct:1.5,autoTrail:true,sessionFilter:true,correlationFilter:true,volatilityFilter:true,mtfFilter:true,regimeFilter:true,description:"",sizingMode:"fixed",maxKellyRisk:5,pairOverrides:{}}));
  const [autoLog,setAutoLog]=useState(()=>lLoad("alog_"+uid,[]));
  const [apiKey,setApiKey]=useState(()=>lLoad("apikey_"+uid,""));
  const [exchangeKeys,setExchangeKeys]=useState(()=>lLoad("exchkeys_"+uid,{}));
  const [activeExchange,setActiveExchange]=useState(()=>lLoad("exchname_"+uid,"Binance"));
  const [alerts,setAlerts]=useState(()=>lLoad("alerts_"+uid,[]));
  const [notifications,setNotifications]=useState([]);
  const [keySaved,setKeySaved]=useState(false);
  const [savedMsg,setSavedMsg]=useState(false);
  const [saveError,setSaveError]=useState("");
  const [dbSyncing,setDbSyncing]=useState(false);
  const [newAlert,setNewAlert]=useState({pair:"BTC/USDT",type:"price_above",value:""});
  const [alertMode,setAlertMode]=useState("simple");
  const [compoundPair,setCompoundPair]=useState("BTC/USDT");
  const [compoundConditions,setCompoundConditions]=useState([{field:"rsi",op:"<",value:"30"}]);
  const [webhookUrl,setWebhookUrl]=useState(()=>lLoad("webhook_"+uid,""));
  const [telegramBotToken,setTelegramBotToken]=useState(()=>lLoad("tgtoken_"+uid,""));
  const [telegramChatId,setTelegramChatId]=useState(()=>lLoad("tgchat_"+uid,""));
  const [serverBot,setServerBot]=useState(()=>lLoad("server_bot_"+uid,{enabled:false,lastRun:null,nextRun:null,status:"idle"}));
  const [serverTrades,setServerTrades]=useState([]);
  const [notifications2,setNotifications2]=useState([]);
  const [botRunning,setBotRunning]=useState(false);
  const wsRefs=useRef({});
  const geckoRef=useRef(null);
  const dsRef=useRef("initializing");

  // ── Persist everything locally immediately ─────────────────────
  useEffect(()=>{lSave("ap_"+uid,activePairs);},[activePairs,uid]);
  useEffect(()=>{lSave("sp_"+uid,selectedPair);},[selectedPair,uid]);
  useEffect(()=>{lSave("tf_"+uid,timeframe);},[timeframe,uid]);
  useEffect(()=>{lSave("tab_"+uid,tab);},[tab,uid]);
  useEffect(()=>{
    lSave("demo_"+uid,isDemo);
    // Push immediately to Supabase so switching modes is never lost if the
    // app closes before the next periodic 30s sync — previously a stale
    // synced value could silently overwrite a fresh local switch on reload.
    if(uid){
      (async()=>{try{await supabase.from("settings").upsert({id:uid,is_demo:isDemo,updated_at:new Date().toISOString()});}catch(e){}})();
    }
  },[isDemo,uid]);
  useEffect(()=>{lSave("live_port_"+uid,livePortfolio);},[livePortfolio,uid]);
  useEffect(()=>{lSave("demo_port_"+uid,demoPortfolio);},[demoPortfolio,uid]);
  useEffect(()=>{lSave("demo_bal_"+uid,demoBalance);},[demoBalance,uid]);
  useEffect(()=>{
    lSave("orders_"+uid,openOrders);
    // Sync open orders to Supabase for cross-device consistency
    if(uid&&openOrders.length>=0){
      // Just save to local for now - full Supabase sync handled by syncToSupabase
    }
  },[openOrders,uid]);
  useEffect(()=>{lSave("demo_history_"+uid,demoTradeHistory);},[demoTradeHistory,uid]);
  useEffect(()=>{lSave("live_history_"+uid,liveTradeHistory);},[liveTradeHistory,uid]);
  useEffect(()=>{
    lSave("strat_"+uid,strategy);
  },[strategy,uid]);
  useEffect(()=>{lSave("alog_"+uid,autoLog);},[autoLog,uid]);
  useEffect(()=>{lSave("apikey_"+uid,apiKey);},[apiKey,uid]);
  useEffect(()=>{lSave("live_bal_"+uid,liveBalance);},[liveBalance,uid]);
  useEffect(()=>{lSave("exchkeys_"+uid,exchangeKeys);},[exchangeKeys,uid]);
  useEffect(()=>{lSave("exchname_"+uid,activeExchange);},[activeExchange,uid]);
  useEffect(()=>{lSave("alerts_"+uid,alerts);},[alerts,uid]);
  useEffect(()=>{lSave("ind_"+uid,indicatorSettings);},[indicatorSettings,uid]);
  useEffect(()=>{lSave("server_bot_"+uid,serverBot);},[serverBot,uid]);

  // ── Supabase sync — never overwrites local settings ────────────
  const syncToSupabase=useCallback(async()=>{
    setDbSyncing(true);
    try{
      await supabase.from("portfolio").upsert({id:uid,...portfolio,demo_balance:demoBalance,live_balance:liveBalance,updated_at:new Date().toISOString()});
      await supabase.from("settings").upsert({id:uid,strategy,active_pairs:activePairs,timeframe,exchange:activeExchange,is_demo:isDemo,selected_pair:selectedPair,auto_log:autoLog.slice(-20),api_key:apiKey||null,updated_at:new Date().toISOString()});
      // Save open orders for cross-device sync
      if(openOrders.length>=0){
        await supabase.from("open_orders").delete().eq("user_id",uid);
        if(openOrders.length>0){
          await supabase.from("open_orders").insert(openOrders.map(o=>({
            user_id:uid,pair:o.pair,mode:o.mode||"spot",side:o.side,
            qty:o.qty,price:o.price,sl:o.sl,tp:o.tp,tp2:o.tp2,tp3:o.tp3,
            leverage:o.leverage||1,is_demo:o.isDemo,auto_placed:o.autoPlaced||false,
            time:o.time||new Date().toLocaleTimeString()
          })));
        }
      }
    }catch(e){}
    setDbSyncing(false);
  },[uid,portfolio,demoBalance,strategy,activePairs,timeframe,activeExchange,isDemo,selectedPair,autoLog,apiKey]);

  useEffect(()=>{
    async function loadFromDb(){
      try{
        // Always load from Supabase — master for cross-device sync
        const{data:sett}=await supabase.from("settings").select("*").eq("id",uid).single();
        if(sett){
          if(sett.strategy&&Object.keys(sett.strategy).length>0){setStrategy(sett.strategy);lSave("strat_"+uid,sett.strategy);}
          if(sett.active_pairs?.length>0){setActivePairs(sett.active_pairs);lSave("pairs_"+uid,sett.active_pairs);}
          if(typeof sett.is_demo==="boolean"){setIsDemo(sett.is_demo);lSave("demo_"+uid,sett.is_demo);}
          if(sett.exchange)setActiveExchange(sett.exchange);
          if(sett.selected_pair)setSelectedPair(sett.selected_pair);
          if(sett.timeframe)setTimeframe(sett.timeframe);
          if(sett.api_key&&!lLoad("apikey_"+uid,"")){setApiKey(sett.api_key);lSave("apikey_"+uid,sett.api_key);}
        }
        // Always restore open orders
        const{data:orders}=await supabase.from("open_orders").select("*").eq("user_id",uid);
        if(orders&&orders.length>0){
          const localOrders=lLoad("orders_"+uid,[]);
          if(localOrders.length===0)setOpenOrders(orders.map(o=>({id:o.id,pair:o.pair,mode:o.mode||"spot",side:o.side,qty:o.qty,price:o.price,sl:o.sl,tp:o.tp,tp2:o.tp2,tp3:o.tp3,leverage:o.leverage||1,orderType:o.order_type,isDemo:o.is_demo,autoPlaced:o.auto_placed,time:"Restored",status:"OPEN",pnl:0,useTrail:false,useBE:false,tp1Hit:false})));
        }
        // Restore trade history if local empty
        // Load open orders from Supabase — source of truth for cross-device
        const{data:dbOrders}=await supabase.from("open_orders").select("*").eq("user_id",uid);
        if(dbOrders&&dbOrders.length>0){
          const mapped=dbOrders.map(o=>({
            id:o.id||Date.now()+Math.random(),
            pair:o.pair,mode:o.mode||"spot",side:o.side,
            qty:o.qty,price:o.price,sl:o.sl,tp:o.tp,tp2:o.tp2,tp3:o.tp3,
            leverage:o.leverage||1,isDemo:o.is_demo,autoPlaced:o.auto_placed,
            time:o.time,status:"OPEN",pnl:0,tp1Hit:false
          }));
          setOpenOrders(mapped);
          lSave("orders_"+uid,mapped);
        }
        // Load server trades
        const{data:sTrades}=await supabase.from("server_trades").select("*").eq("user_id",uid).order("created_at",{ascending:false}).limit(50);
        if(sTrades)setServerTrades(sTrades);
        // Load unread notifications
        const{data:notifs}=await supabase.from("notifications").select("*").eq("user_id",uid).eq("read",false).order("created_at",{ascending:false}).limit(20);
        if(notifs)setNotifications2(notifs);
        // Load bot config
        const{data:botCfg}=await supabase.from("bot_config").select("*").eq("user_id",uid).single();
        if(botCfg)setServerBot({enabled:botCfg.enabled,lastRun:botCfg.last_run,nextRun:botCfg.next_run,status:botCfg.status||"idle"});
        // Restore balance — was being pushed to Supabase but never read back,
        // which meant a second device never saw your actual current balance.
        const{data:port}=await supabase.from("portfolio").select("*").eq("id",uid).single();
        if(port){
          if(typeof port.demo_balance==="number"){setDemoBalance(port.demo_balance);lSave("demo_bal_"+uid,port.demo_balance);}
          if(typeof port.live_balance==="number"){setLiveBalance(port.live_balance);lSave("live_bal_"+uid,port.live_balance);}
        }
        // Trade history — always pull latest from Supabase and merge with any
        // local-only entries, rather than only checking when local is empty.
        // The old "only if empty" check meant a device that already had ANY
        // cached trades would never see newer trades made on another device.
        const{data:trades}=await supabase.from("trades").select("*").eq("user_id",uid).order("created_at",{ascending:false}).limit(200);
        if(trades){
          const mapped=trades.map(t=>({id:t.id,pair:t.pair,mode:t.mode||"SPOT",side:t.side,qty:t.qty,price:t.price,closePrice:t.close_price,pnl:t.pnl,pnlPct:t.pnl_pct,leverage:t.leverage||1,time:t.time,status:"CLOSED",autoPlaced:t.auto_placed,isDemo:t.is_demo}));
          const dbDemo=mapped.filter(t=>t.isDemo);
          const dbLive=mapped.filter(t=>!t.isDemo);
          const localDemo=lLoad("demo_history_"+uid,[])||[];
          const localLive=lLoad("live_history_"+uid,[])||[];
          const dbDemoIds=new Set(dbDemo.map(t=>t.id));
          const dbLiveIds=new Set(dbLive.map(t=>t.id));
          const mergedDemo=[...dbDemo,...localDemo.filter(t=>!dbDemoIds.has(t.id))].slice(0,200);
          const mergedLive=[...dbLive,...localLive.filter(t=>!dbLiveIds.has(t.id))].slice(0,200);
          setDemoTradeHistory(mergedDemo);setLiveTradeHistory(mergedLive);
          lSave("demo_history_"+uid,mergedDemo);lSave("live_history_"+uid,mergedLive);
        }
      }catch(e){}
    }
    loadFromDb();
    const syncIv=setInterval(syncToSupabase,30000);
    return()=>clearInterval(syncIv);
  },[uid]);

  // ── Price feeds ────────────────────────────────────────────────
  function updatePrice(pair,lp){
    pricesRef.current[pair]=lp; // update ref immediately — no render lag
    setPrices(prev=>({...prev,[pair]:lp}));
    setCandleData(prev=>{
      const candles=[...(prev[pair]||[])];
      if(!candles.length)return prev;
      const last={...candles.at(-1),close:lp,high:Math.max(candles.at(-1).high,lp),low:Math.min(candles.at(-1).low,lp)};
      candles[candles.length-1]=last;
      return{...prev,[pair]:candles};
    });
  }
  // Helper — always get latest price with multiple fallbacks
  function getPrice(pair){
    return pricesRef.current[pair]||prices[pair]||BASE_PRICES[pair]||1;
  }
  function calcPnl(order){
    const cur=pricesRef.current[order.pair]||prices[order.pair]||order.price||1;
    if(!pricesRef.current[order.pair])return 0;
    return(cur-order.price)*order.qty*(order.side==="SELL"?-1:1)*(order.leverage||1);
  }
  function calcPnlPct(order){
    const cur=pricesRef.current[order.pair]||prices[order.pair]||order.price||1;
    if(!pricesRef.current[order.pair])return 0;
    return((cur-order.price)/order.price)*100*(order.side==="SELL"?-1:1);
  }
  // Live price ticker — updates every second always when orders exist
  
  // Force re-render every second when open orders exist
  const [tick,setTick]=useState(0);
  useEffect(()=>{
    const iv=setInterval(()=>{
      // Reconnect dropped WebSockets for open order pairs
      openOrders.forEach(o=>{
        if(!wsRefs.current[o.pair]||wsRefs.current[o.pair].readyState>1){
          connectWS(o.pair);
        }
      });
      // Always tick to force re-render with latest pricesRef values
      setTick(t=>t+1);
    },1000);
    return()=>clearInterval(iv);
  },[]); // eslint-disable-line
  function connectWS(pair){
    if(wsRefs.current[pair]){try{wsRefs.current[pair].close();}catch(e){}}
    try{
      const ws=new WebSocket("wss://stream.binance.com:9443/ws/"+toBinanceSym(pair)+"@kline_1m");
      ws.onopen=()=>{dsRef.current="binance";setDataStatus("binance");if(geckoRef.current){clearInterval(geckoRef.current);geckoRef.current=null;}};
      ws.onmessage=evt=>{try{const d=JSON.parse(evt.data);if(d.k){const k=d.k,lp=parseFloat(k.c);updatePrice(pair,lp);if(k.x){const nc={open:parseFloat(k.o),close:parseFloat(k.c),high:parseFloat(k.h),low:parseFloat(k.l),volume:parseFloat(k.v),time:k.t};setCandleData(prev=>({...prev,[pair]:[...(prev[pair]||[]),nc].slice(-500)}));}}}catch(e){}};
      ws.onerror=()=>{};
      wsRefs.current[pair]=ws;
    }catch(e){}
  }
  async function fetchGecko(pairs){
    try{
      const ids=pairs.filter(p=>GECKO_IDS[p]).map(p=>GECKO_IDS[p]).join(",");
      if(!ids)return;
      const res=await fetch("https://api.coingecko.com/api/v3/simple/price?ids="+ids+"&vs_currencies=usd");
      if(!res.ok)throw new Error();
      const data=await res.json();
      pairs.forEach(p=>{const id=GECKO_IDS[p];if(id&&data[id])updatePrice(p,data[id].usd);});
      if(dsRef.current!=="binance"){dsRef.current="coingecko";setDataStatus("coingecko");}
    }catch(e){if(dsRef.current==="initializing"){dsRef.current="simulated";setDataStatus("simulated");}}
  }
  async function loadCandles(pair,tf){
    try{
      const real=await fetchBinanceCandles(pair,tf,200);
      if(real&&real.length>0){
        setCandleData(prev=>({...prev,[pair]:real}));
        if(real.length>0)setPrices(prev=>({...prev,[pair]:real.at(-1).close}));
      }
    }catch(e){}
  }
  useEffect(()=>{
    // Delay 2s to let Supabase settings and orders load first
    const init=setTimeout(()=>{
      // Connect WS for active pairs AND any pairs with open orders
      const allPairs=[...new Set([...activePairs,...openOrders.map(o=>o.pair)])];
      allPairs.forEach(p=>{connectWS(p);loadCandles(p,timeframe);});
    },2000);
    const t=setTimeout(()=>{if(dsRef.current==="initializing"){fetchGecko(activePairs);geckoRef.current=setInterval(()=>fetchGecko(activePairs),30000);}},8000);
    // Reconnect dropped WebSockets every 15 seconds
    const reconn=setInterval(()=>{
      const allPairs=[...new Set([...activePairs,...openOrders.map(o=>o.pair)])];
      allPairs.forEach(p=>{
        const ws=wsRefs.current[p];
        if(!ws||ws.readyState===WebSocket.CLOSED||ws.readyState===WebSocket.CLOSING){
          connectWS(p);
        }
      });
    },15000);
    return()=>{clearTimeout(init);clearTimeout(t);clearInterval(reconn);Object.values(wsRefs.current).forEach(ws=>{try{ws.close();}catch(e){}});if(geckoRef.current)clearInterval(geckoRef.current);};
  },[]);
  useEffect(()=>{loadCandles(selectedPair,timeframe);loadCandles(selectedPair,timeframe);},[timeframe,selectedPair]);
  // Simulated price updates fallback
  useEffect(()=>{
    if(dataStatus!=="initializing"&&dataStatus!=="simulated")return;
    const iv=setInterval(()=>{
      setCandleData(prev=>{
        const next={...prev};
        activePairs.forEach(p=>{
          const candles=[...(prev[p]||[])];if(!candles.length)return;
          const last=candles.at(-1);
          if(Date.now()-last.time>30000){candles.push(generateCandle(last));if(candles.length>500)candles.shift();}
          else{const u={...last};u.close=u.close*(1+(Math.random()-0.499)*0.0025);u.high=Math.max(u.high,u.close);u.low=Math.min(u.low,u.close);candles[candles.length-1]=u;}
          next[p]=candles;
        });
        return next;
      });
    },1000);
    return()=>clearInterval(iv);
  },[dataStatus,activePairs]);
  // Recompute signals
  useEffect(()=>{
    const s={};
    activePairs.forEach(p=>{if(candleData[p]&&candleData[p].length>5)s[p]=computeSignal(candleData[p],p);});
    setSignals(s);
  },[candleData]);

  function addPair(pair,lp){
    if(activePairs.includes(pair))return;
    setActivePairs(prev=>[...prev,pair]);
    setCandleData(prev=>({...prev,[pair]:initCandles(lp||1)}));
    setPrices(prev=>({...prev,[pair]:lp||1}));
    connectWS(pair);loadCandles(pair,timeframe);
  }
  function removePair(pair){
    if(pair===selectedPair)setSelectedPair(activePairs.find(p=>p!==pair)||"BTC/USDT");
    setActivePairs(prev=>prev.filter(p=>p!==pair));
    if(wsRefs.current[pair]){try{wsRefs.current[pair].close();}catch(e){}delete wsRefs.current[pair];}
  }

  // ── Place order ────────────────────────────────────────────────
  async function placeOrder(order){
    // TWAP: split total qty into N legs, executed over a time window with simulated price drift
    if(order.orderType==="TWAP"&&!order.isTwapLeg){
      const legs=5;const intervalMs=(parseInt(order.twapMinutes)||5)*60000/legs;
      const legQty=Math.round((order.qty/legs)*10000)/10000;
      const groupId="twap_"+Date.now();
      for(let i=0;i<legs;i++){
        setTimeout(()=>{
          const curPrice=pricesRef.current[order.pair]||order.price;
          placeOrder({...order,qty:legQty,price:curPrice,isTwapLeg:true,twapGroupId:groupId,twapLeg:i+1,twapTotalLegs:legs,orderType:"TWAP-LEG"});
        },i*intervalMs);
      }
      return;
    }
    // Iceberg: split into visible-size chunks, fired in rapid succession
    if(order.orderType==="ICEBERG"&&!order.isIcebergLeg){
      const visibleQty=Math.max(0.0001,parseFloat(order.visibleQty)||order.qty*0.2);
      const legs=Math.max(1,Math.ceil(order.qty/visibleQty));
      const groupId="iceberg_"+Date.now();
      for(let i=0;i<legs;i++){
        const remaining=order.qty-visibleQty*i;
        const legQty=Math.round(Math.min(visibleQty,remaining)*10000)/10000;
        if(legQty<=0)continue;
        setTimeout(()=>{
          const curPrice=pricesRef.current[order.pair]||order.price;
          placeOrder({...order,qty:legQty,price:curPrice,isIcebergLeg:true,icebergGroupId:groupId,icebergLeg:i+1,icebergTotalLegs:legs,orderType:"ICEBERG-LEG"});
        },i*800);
      }
      return;
    }
    const orderIsDemo=order.isDemo!==undefined?order.isDemo:isDemo;
    const newOrder={...order,id:Date.now()+Math.random(),time:new Date().toLocaleTimeString(),status:"OPEN",pnl:0,isDemo:orderIsDemo,tp1Hit:false,trailSL:null};
    setOpenOrders(prev=>[newOrder,...prev]);
    if(!isDemo)setPortfolio(prev=>({...prev,balance:prev.balance-order.qty*order.price}));
    else setDemoBalance(prev=>prev-order.qty*order.price);
    try{await supabase.from("open_orders").insert({user_id:uid,pair:order.pair,mode:order.mode,side:order.side,qty:order.qty,price:order.price,sl:order.sl,tp:order.tp,tp2:order.tp2||null,tp3:order.tp3||null,leverage:order.leverage||1,order_type:order.orderType,is_demo:isDemo,auto_placed:order.autoPlaced||false});}catch(e){}
  }

  // ── Move stop to breakeven ─────────────────────────────────────
  function moveStopToBreakeven(id,entryPrice){
    setOpenOrders(prev=>prev.map(o=>o.id===id?{...o,sl:entryPrice,tp1Hit:true}:o));
  }

  // ── Close order ────────────────────────────────────────────────
  async function closeOrder(id,reason){
    // Find the order first — outside setState
    const order=openOrders.find(o=>o.id===id);
    if(!order)return;
    const cp=prices[order.pair]||order.price;
    const pnl=(cp-order.price)*order.qty*(order.side==="SELL"?-1:1)*(order.leverage||1);
    const pp=(pnl/(order.qty*order.price))*100;

    // Partial close at TP1 — keep order open with tp1Hit flag
    if(reason==="tp1"&&order.useOCO){
      const tp1Pnl=pnl*(order.tp1Pct||40)/100;
      addToHistory({...order,closePrice:cp,pnl:Math.round(tp1Pnl*100)/100,pnlPct:Math.round(pp*100)/100,status:"TP1",time:new Date().toLocaleTimeString()});
      updatePortfolio(tp1Pnl,order.isDemo,order);
      setOpenOrders(prev=>prev.map(o=>o.id===id?{...o,tp1Hit:true,sl:order.useBE?order.price:order.sl}:o));
      return;
    }

    // Full close
    const statusLabel=reason==="tp2"?"TP2":reason==="sl"?"SL":"CLOSED";
    const closed={...order,closePrice:cp,pnl:Math.round(pnl*100)/100,pnlPct:Math.round(pp*100)/100,status:statusLabel,time:new Date().toLocaleTimeString()};
    addToHistory(closed);
    updatePortfolio(pnl,order.isDemo,order);
    setOpenOrders(prev=>prev.filter(o=>o.id!==id));

    // Supabase calls OUTSIDE setState — safe to await here
    try{
      await supabase.from("trades").insert({
        user_id:uid,pair:order.pair,mode:order.mode||"spot",
        side:order.side,qty:order.qty,price:order.price,
        close_price:cp,pnl:Math.round(pnl*100)/100,
        pnl_pct:Math.round(pp*100)/100,leverage:order.leverage||1,
        time:new Date().toLocaleTimeString(),status:"CLOSED",
        auto_placed:order.autoPlaced||false
      });
    }catch(e){console.log("Trade save error:",e);}
    try{
      await supabase.from("open_orders").delete()
        .eq("user_id",uid)
        .eq("pair",order.pair);
    }catch(e){console.log("Order delete error:",e);}
  }

  function updatePortfolio(pnl,isDemoTrade,order){
    if(!isDemoTrade){
      setPortfolio(port=>{
        const newPnl=port.pnl+pnl,newBalance=port.balance+order.qty*order.price+pnl,newTotal=port.totalTrades+1;
        const newWins=pnl>0?port.wins+1:port.wins,newLosses=pnl<=0?port.losses+1:port.losses;
        const totalWin=port.totalWinAmount+(pnl>0?pnl:0),totalLoss=port.totalLossAmount+(pnl<0?Math.abs(pnl):0);
        return{balance:newBalance,pnl:newPnl,pnlPct:(newPnl/50000)*100,totalTrades:newTotal,wins:newWins,losses:newLosses,winRate:Math.round((newWins/newTotal)*100),bestTrade:Math.max(port.bestTrade,pnl),worstTrade:Math.min(port.worstTrade,pnl),profitFactor:totalLoss>0?Math.round((totalWin/totalLoss)*100)/100:totalWin>0?99:0,totalWinAmount:totalWin,totalLossAmount:totalLoss};
      });
    }else setDemoBalance(prev=>prev+order.qty*order.price+pnl);
  }

  function addAutoLog(entry){setAutoLog(prev=>[...prev,entry].slice(-100));}
  useEffect(()=>{lSave("webhook_"+uid,webhookUrl);},[webhookUrl,uid]);
  useEffect(()=>{lSave("tgtoken_"+uid,telegramBotToken);},[telegramBotToken,uid]);
  useEffect(()=>{lSave("tgchat_"+uid,telegramChatId);},[telegramChatId,uid]);
  function buildAlertText(alert){
    let text="🔔 NEXUS Alert: "+alert.pair+" — ";
    if(alert.type==="compound"&&Array.isArray(alert.conditions)){
      text+=alert.conditions.map(c=>c.field+" "+c.op+" "+c.value).join(" AND ");
    }else{
      text+=(alert.type||"").replace("_"," ")+" "+(alert.value||"");
    }
    return text;
  }
  function sendWebhookAlert(alert){
    const text=buildAlertText(alert);
    if(webhookUrl){
      const isDiscord=webhookUrl.includes("discord.com");
      const body=isDiscord?JSON.stringify({content:text}):JSON.stringify({text});
      fetch(webhookUrl,{method:"POST",headers:{"Content-Type":"application/json"},body}).catch(()=>{});
    }
    if(telegramBotToken&&telegramChatId){
      fetch(SUPABASE_URL+"/functions/v1/nexus-telegram-proxy",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":"Bearer "+SUPABASE_KEY},
        body:JSON.stringify({botToken:telegramBotToken,chatId:telegramChatId,text})
      }).catch(()=>{});
    }
  }
  function handleAlert(alert){setNotifications(prev=>[{...alert,firedAt:new Date().toLocaleTimeString()},...prev].slice(0,5));sendWebhookAlert(alert);}
  function saveApiKey(){
    lSave("apikey_"+uid,apiKey);
    setKeySaved(true);setTimeout(()=>setKeySaved(false),2000);
    if(uid){
      (async()=>{try{await supabase.from("settings").upsert({
        id:uid,strategy,active_pairs:activePairs,is_demo:isDemo,
        exchange:activeExchange,api_key:apiKey||null,
        updated_at:new Date().toISOString()
      });}catch(e){}})();
    }
  }
  function saveStrategy(){
    lSave("strat_"+uid,strategy);
    syncToSupabase();
    // Also sync strategy to settings immediately
    if(uid){
      (async()=>{
        try{
          const{error}=await supabase.from("settings").upsert({
            id:uid,strategy,
            active_pairs:activePairs,
            is_demo:isDemo,
            exchange:activeExchange,
            updated_at:new Date().toISOString()
          });
          if(error){setSaveError("Saved locally, but cloud sync failed: "+error.message);setTimeout(()=>setSaveError(""),4000);}
        }catch(e){
          setSaveError("Saved locally, but cloud sync failed: "+(e?.message||"network error"));setTimeout(()=>setSaveError(""),4000);
        }
      })();
    }
    setSavedMsg(true);setTimeout(()=>setSavedMsg(false),3000);
    setNotifications(prev=>[{pair:"STRATEGY",type:"signal",value:"Settings saved",firedAt:new Date().toLocaleTimeString()},...prev].slice(0,5));
  }

  async function toggleServerBot(enabled){
    try{
      await supabase.from("bot_config").upsert({
        user_id:uid,enabled,exchange:activeExchange,
        active_pairs:activePairs,strategy,
        updated_at:new Date().toISOString()
      });
      setServerBot(prev=>({...prev,enabled,status:enabled?"running":"idle"}));
    }catch(e){console.log("Bot toggle error:",e);}
  }

  async function runBotNow(){
    setBotRunning(true);
    try{
      const res=await fetch("https://"+SUPABASE_URL.replace("https://","")+"/functions/v1/nexus-bot",{
        method:"POST",
        headers:{"Authorization":"Bearer "+SUPABASE_KEY,"Content-Type":"application/json"},
        body:JSON.stringify({manual:true,user_id:uid})
      });
      const data=await res.json();
      setServerBot(prev=>({...prev,lastRun:new Date().toISOString(),status:"ran"}));
      // Reload server trades
      const{data:sTrades}=await supabase.from("server_trades").select("*").eq("user_id",uid).order("created_at",{ascending:false}).limit(50);
      if(sTrades)setServerTrades(sTrades);
      if(data.trades&&data.trades.length>0){
        setNotifications(prev=>[{pair:"SERVER BOT",type:"signal",value:data.trades.length+" trade(s) opened",firedAt:new Date().toLocaleTimeString()},...prev].slice(0,5));
      }
    }catch(e){console.log("Bot run error:",e);}
    setBotRunning(false);
  }

  async function markNotifsRead(){
    try{
      await supabase.from("notifications").update({read:true}).eq("user_id",uid).eq("read",false);
      setNotifications2([]);
    }catch(e){}
  }
  async function handleSignOut(){await syncToSupabase();await supabase.auth.signOut();onSignOut();}

  const sig=signals[selectedPair];
  const price=prices[selectedPair]||BASE_PRICES[selectedPair]||1;
  const currentBalance=isDemo?demoBalance:liveBalance;
  const filteredPairs=activePairs.filter(p=>p.toLowerCase().includes(pairSearch.toLowerCase()));
  const STRATEGY_PRESETS=[
    {label:"NEXUS Prime",s:{name:"NEXUS Prime",riskPct:1.5,maxTrades:3,minRR:2.5,minStrength:72,sessionFilter:true,correlationFilter:true,volatilityFilter:true,mtfFilter:true,regimeFilter:true,autoTrail:true,trailPct:1.5,sizingMode:"kelly",maxKellyRisk:2,description:"NEXUS PRIME STRATEGY — High Probability, Minimal Risk\n\nCORE PHILOSOPHY\nOnly trade the absolute best setups. Missing a trade costs nothing. A bad trade costs real money. Patience is the edge.\n\nENTRY REQUIREMENTS — ALL must be true:\n1. Signal strength above 72% minimum\n2. R:R ratio minimum 1:2.5 — never compromise this\n3. RSI between 28-38 for longs, 62-72 for shorts\n4. Price must be on correct side of VWAP\n5. EMA21 and EMA50 must agree on trend direction\n6. MACD histogram must confirm signal direction\n7. Supertrend must agree with trade direction\n8. Volume at least 1.3x average — confirms conviction\n9. Do NOT trade within 30 minutes of major news\n10. Do NOT trade if spread is unusually wide\n\nTIMEFRAME RULES\n- 4H chart for trend direction — master timeframe\n- 1H chart to find entry zone\n- 15M chart for precise entry timing\n- All three timeframes should agree\n\nPOSITION SIZING\n- Uses Kelly Criterion once you have 10+ closed trades, based on your real win rate and R:R — capped at 2% max per trade to stay true to \"minimal risk\"\n- Falls back to a flat 1.5% before you have enough trade history\n- Never increase size after a loss\n\nSTOP LOSS RULES\n- Place SL below nearest support for longs\n- Place SL above nearest resistance for shorts\n- Use ATR x1.5 as minimum SL distance\n- Never move SL against your position\n\nTAKE PROFIT\n- TP1 at 2x risk — close 40%\n- TP2 at 4x risk — close 40%\n- TP3 trail remaining 20%\n- Move SL to breakeven at TP1\n\nWHEN NOT TO TRADE\n- After 2 consecutive losses — take a break\n- If daily loss limit of 3% is hit — stop\n- Extreme Fear and Greed above 85 or below 15\n- If feeling emotional, tired or rushed\n\nMINDSET\nExpect 40% of trades to hit SL — that is normal.\nWith 1:2.5 R:R you only need 30% win rate to profit.\nConsistency beats perfection. Waiting is a position."}},{label:"Trend Rider",s:{name:"NEXUS Trend Rider",riskPct:2,maxTrades:3,minRR:2,minStrength:65,sessionFilter:false,correlationFilter:true,regimeFilter:true,volatilityFilter:false,mtfFilter:true,autoMode:"FULL-AUTO",useTrail:true,trailType:"ATR",trailAtr:2,useBE:true,tp1Pct:30,tp2Pct:30,tp3Pct:40,description:"Trend following with trailing stop. 30% at TP1 (BE), 30% at TP2. 40% trails 2x ATR letting winners run indefinitely until reversal.\n\nUPDATED: now requires multi-timeframe (15m/1h/4h) agreement before entry — a real trend should show up on more than one timeframe, so this filters out noise without changing the core ride-it-out approach. Correlation filter also added so it won't stack multiple correlated trend trades (e.g. BTC and ETH both trending simultaneously) without you realizing the combined exposure. Session and volatility filters stay off deliberately — genuine trends don't wait for a specific session, and often involve above-average volatility, so restricting those would work against this strategy's purpose."}},
    {label:"Aggressive",s:{name:"Aggressive",riskPct:3,maxTrades:5,minRR:2,minStrength:60,sessionFilter:false,correlationFilter:false,volatilityFilter:false,mtfFilter:false,regimeFilter:false,autoTrail:true,trailPct:2,description:"AGGRESSIVE STRATEGY — Higher Risk, More Trades\n\nFor experienced traders comfortable with higher volatility.\n\nSETTINGS\n- Risk 3% per trade\n- Up to 5 trades per day\n- Minimum R:R 1:2\n- Minimum signal strength 60%\n- All filters disabled for maximum opportunities\n- Auto trailing stop at 2%\n\nRULES\n- Enter on BUY or SELL signals above 60% strength\n- Always use stop loss — no exceptions\n- Scale out at TP1, TP2, TP3\n- Trailing stop locks in profits automatically\n\nRISK WARNING\nHigher risk means larger drawdowns are possible.\nOnly use with real money after profitable demo period."}},
    {label:"NEXUS Apex",s:{name:"NEXUS Apex",riskPct:1,maxTrades:2,minRR:3,minStrength:80,sessionFilter:true,correlationFilter:true,volatilityFilter:true,mtfFilter:true,regimeFilter:true,autoTrail:true,trailPct:1.2,sizingMode:"kelly",maxKellyRisk:3,dailyLossLimit:3,description:"NEXUS APEX — Maximum Confluence Strategy\n\nPHILOSOPHY\nThis is the most selective, most demanding strategy NEXUS can run. It requires nearly every analytical system in the app to agree before it will even consider a trade — regime, multi-timeframe trend, session timing, volatility, correlation, and a very high combined signal score. Most days it will find zero trades. That is by design, not a flaw.\n\nHONEST EXPECTATIONS\nNo strategy — this one included — can guarantee a winning trade, and backtested performance never guarantees future results. Apex is built to stack the odds as far in your favour as the available data allows, and to refuse to trade when conditions aren't genuinely favourable. Treat it as a rigorous filter, not a promise.\n\nENTRY REQUIREMENTS\n- Signal strength minimum 80% — one of the highest confluence bars in the app\n- R:R minimum 1:3 — only takes asymmetric setups\n- Regime must be tradeable — no ranging, choppy or volatile conditions\n- Multi-timeframe (15m/1h/4h) must agree\n- Correct trading session only\n- Correlation filter active — won't stack correlated pairs at once\n- Volatility filter active — avoids abnormal ATR conditions\n\nPOSITION SIZING\nUses Kelly Criterion once you have 10+ closed trades, calculated from your actual win rate and R:R — capped at 3% max per trade for safety. Before that, falls back to a flat 1% risk.\n\nBEFORE TRUSTING THIS WITH REAL MONEY\nRun Walk-Forward and Monte Carlo simulation (Backtest tab) on this exact strategy first, then apply the results. If consistency comes back low or ruin risk comes back high, NEXUS will automatically reduce size or pause auto-trading on this strategy until you've reworked it — that safety net exists specifically so a strategy this selective doesn't get blind trust it hasn't earned yet.\n\nMINDSET\nFewer trades. Higher quality. No guarantees — just genuinely stacked odds."}},
    {label:"Small Account",s:{name:"Small Account $100",riskPct:3,maxTrades:2,minRR:3,minStrength:75,sessionFilter:true,correlationFilter:true,volatilityFilter:true,mtfFilter:true,regimeFilter:true,autoTrail:true,trailPct:1,description:"SMALL ACCOUNT GROWTH — $100 to $1,000\n\nDesigned for accounts starting at $100-$500 using futures with 5x leverage.\n\nSETTINGS\n- Risk 3% per trade\n- Maximum 2 trades per day\n- Minimum R:R 1:3\n- Minimum signal strength 75%\n- All smart filters enabled\n- Auto trailing stop at 1%\n\nPAIRS TO TRADE\nBTC/USDT, ETH/USDT, SOL/USDT only\n\nLEVERAGE\nUse 5x maximum on futures. Never higher.\nStop loss is not optional — it is your protection.\n\nGROWTH TARGET (50% win rate, 1:3 R:R)\nMonth 1: $100 → ~$180\nMonth 3: ~$580\nMonth 6: ~$3,400\n\nRULES\n- Only trade London or NY session\n- Stop after any loss — max 1 loss per day\n- Reinvest all profits for compound growth\n- Never add to a losing position"}},
  ];

  const TABS=[
    {id:"dashboard",label:"MARKETS",icon:"◈"},
    {id:"trades",label:"TRADES",icon:"⇄"},
    {id:"portfolio",label:"PORTFOLIO",icon:"◉"},
    {id:"strategy",label:"STRATEGY",icon:"◆"},
    {id:"screener",label:"SCAN",icon:"⊞"},
    {id:"intelligence",label:"INTELLIGENCE",icon:"◎"},
    {id:"analytics",label:"ANALYTICS",icon:"▲"},
    {id:"settings",label:"SETTINGS",icon:"⚙"},
    {id:"guide",label:"GUIDE",icon:"?"},{id:"aichat",label:"AI CHAT",icon:"◈"},{id:"dca",label:"DCA",icon:"◆"},{id:"tools",label:"TOOLS",icon:"⊞"},
  ];

  const css=`*{box-sizing:border-box;margin:0;padding:0}html{height:100%;overscroll-behavior:none}body{height:100%;overflow-y:auto;overflow-x:hidden;overscroll-behavior-y:none;overscroll-behavior-x:none;-webkit-overflow-scrolling:touch;position:relative}#root{min-height:100vh}input[type=range]{appearance:none;height:3px;background:#1A2232;border-radius:2px}input[type=range]::-webkit-slider-thumb{appearance:none;width:14px;height:14px;border-radius:50%;background:#00C8FF;cursor:pointer}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:#060A0E}::-webkit-scrollbar-thumb{background:#1E2D42;border-radius:2px}@keyframes pulse{from{opacity:.3;transform:scale(.8)}to{opacity:1;transform:scale(1.3)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}@keyframes glow{0%,100%{box-shadow:0 0 4px #00C8FF44}50%{box-shadow:0 0 14px #00C8FF88}}@keyframes slideIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}select{color-scheme:dark}@supports(padding:max(0px)){body{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}}@media(max-width:900px){.nexus-main-grid{grid-template-columns:1fr!important}.nexus-right-col{display:none!important}}@media(max-width:600px){.nexus-pair-col{max-height:160px!important;overflow-x:auto!important}}`;

  return(
    <div style={{background:C.bg0,minHeight:"100vh",fontFamily:"monospace",color:C.white,display:"flex",flexDirection:"column",width:"100%",maxWidth:"100vw",overflowX:"hidden"}}>
      <style>{css}</style>
      <AutoTradeEngine isDemo={isDemo} autoMode={strategy.autoMode} signals={signals} prices={prices} strategy={strategy} openOrders={openOrders} candleData={candleData} onPlaceOrder={placeOrder} onCloseOrder={closeOrder} onLog={addAutoLog} balance={currentBalance} tradeHistory={tradeHistory}/>
      <AlertsEngine prices={prices} signals={signals} alerts={alerts} onAlert={handleAlert}/>

      {/* Toasts */}
      {notifications.length>0&&<div style={{position:"fixed",top:60,right:16,zIndex:8888,display:"flex",flexDirection:"column",gap:6}}>
        {notifications.map((n,i)=>(
          <div key={i} onClick={()=>setNotifications(prev=>prev.filter((_,j)=>j!==i))} style={{background:C.bg1,border:"1px solid "+C.gold,borderRadius:8,padding:"10px 14px",animation:"slideIn 0.3s ease",boxShadow:"0 4px 20px #000",cursor:"pointer"}}>
            <div style={{color:C.gold,fontSize:10,fontWeight:700}}>🔔 ALERT</div>
            <div style={{color:C.white,fontSize:11}}>{n.pair} — {n.type?.replace("_"," ")} {n.value}</div>
            <div style={{color:C.dimText,fontSize:9}}>{n.firedAt} · tap to dismiss</div>
          </div>
        ))}
      </div>}

      {/* Header */}
      <div style={{background:C.bg1,borderBottom:"1px solid "+C.border,padding:"0 14px",flexShrink:0}}>
        <div style={{maxWidth:1500,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:50,gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <div style={{color:C.cyan,fontSize:18,fontWeight:700,letterSpacing:"-0.02em"}}>◈ NEXUS</div>
            <div style={{width:1,height:16,background:C.border}}/>
            <DataBadge status={dataStatus}/>
            {dbSyncing&&<span style={{color:C.dimText,fontSize:9}}>↑</span>}
            {sig?.regime&&<Badge color={sig.regime.color||C.slate} small>{sig.regime.icon} {(sig.regime.regime||"").replace("_"," ")}</Badge>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div onClick={()=>setIsDemo(!isDemo)} style={{width:38,height:20,borderRadius:10,background:isDemo?C.purple:C.bg3,border:"1px solid "+(isDemo?C.purple:C.border),cursor:"pointer",position:"relative",flexShrink:0}}>
              <div style={{position:"absolute",top:2,left:isDemo?20:2,width:14,height:14,borderRadius:"50%",background:isDemo?C.white:C.slate,transition:"all 0.2s"}}/>
            </div>
            {isDemo?<Badge color={C.purple} small>DEMO</Badge>:<Badge color={C.green} small>LIVE</Badge>}
            {isDemo&&strategy.autoMode!=="OFF"&&<><Badge color={strategy.autoMode==="FULL-AUTO"?C.red:C.cyan} small>{strategy.autoMode}</Badge><div style={{width:6,height:6,borderRadius:"50%",background:strategy.autoMode==="FULL-AUTO"?C.red:C.cyan,animation:"blink 1.5s infinite"}}/></>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{textAlign:"right"}}>
              <div style={{color:isDemo?C.purple:C.green,fontSize:13,fontWeight:700}}>{isDemo?"D: ":"L: "}{liveBalance===0&&!isDemo?"No balance set":("$"+fmt(currentBalance))}</div>
              <div style={{color:C.dimText,fontSize:9}}>{isDemo?"Demo Mode":"Live Mode"}</div>
            </div>
            <button onClick={handleSignOut} title="Sign Out" style={{background:C.bg3,border:"1px solid "+C.border,color:C.slate,padding:"5px 10px",borderRadius:4,cursor:"pointer",fontSize:9}}>ðŸšª</button>
          </div>
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{background:C.bg1,borderBottom:"1px solid "+C.border,padding:"0 14px",flexShrink:0,overflowX:"auto"}}>
        <div style={{display:"flex",minWidth:"max-content",gap:0,width:"100%"}}>
          {TABS.map(({id,label,icon})=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:"9px 11px",background:"none",border:"none",borderBottom:"2px solid "+(tab===id?C.cyan:"transparent"),color:tab===id?C.cyan:C.slate,cursor:"pointer",fontFamily:"monospace",fontSize:9,letterSpacing:"0.08em",display:"flex",alignItems:"center",gap:3,whiteSpace:"nowrap"}}>{icon} {label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,width:"100%",maxWidth:"100%",padding:"12px 10px",boxSizing:"border-box"}}>

        {/* ── DASHBOARD ────────────────────────────────────────── */}
        {tab==="dashboard"&&(
          <div className="nexus-main-grid" style={{display:"grid",gridTemplateColumns:"230px 1fr 260px",gap:12,alignItems:"start"}}>
            {/* Left — pair list */}
            <div className="nexus-pair-col" style={{display:"flex",flexDirection:"column",gap:6}}>
              <div style={{display:"flex",gap:5}}>
                <input value={pairSearch} onChange={e=>setPairSearch(e.target.value)} placeholder="Search..." style={{flex:1,background:C.bg2,border:"1px solid "+C.border,borderRadius:5,color:C.white,padding:"6px 10px",fontFamily:"monospace",fontSize:11,outline:"none"}}/>
                <button onClick={()=>setShowAddPair(true)} style={{background:C.cyanDim,border:"1px solid "+C.cyan,color:C.cyan,padding:"6px 12px",borderRadius:5,cursor:"pointer",fontWeight:700,fontSize:14}}>+</button>
              </div>
              <div style={{maxHeight:"calc(100vh - 200px)",overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
                {filteredPairs.map(p=>{
                  const px=prices[p]||BASE_PRICES[p]||1;
                  const cs=candleData[p]||[];
                  const prev=cs&&cs.length>1?cs.at(-2).close:px;
                  const chg=((px-prev)/prev)*100;
                  const s=signals[p];
                  const isSel=p===selectedPair;
                  const hasAuto=openOrders.some(o=>o.pair===p&&o.isDemo&&o.autoPlaced);
                  const hasOpen=openOrders.some(o=>o.pair===p);
                  return(
                    <div key={p} onClick={()=>setSelectedPair(p)} style={{background:isSel?C.bg4:C.bg1,border:"1px solid "+(isSel?C.cyan:hasAuto?C.purple:hasOpen?C.gold:C.border),borderRadius:6,padding:"7px 9px",cursor:"pointer"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                        <div style={{display:"flex",gap:4,alignItems:"center"}}>
                          <span style={{color:C.white,fontSize:11,fontWeight:700}}>{p}</span>
                          {hasAuto&&<div style={{width:5,height:5,borderRadius:"50%",background:C.purple,animation:"blink 1.5s infinite"}}/>}
                          {hasOpen&&!hasAuto&&<div style={{width:5,height:5,borderRadius:"50%",background:C.gold}}/>}
                        </div>
                        <div style={{display:"flex",gap:3,alignItems:"center"}}>
                          {s&&<SignalBadge direction={s.direction}/>}
                          {!DEFAULT_PAIRS.includes(p)&&<button onClick={e=>{e.stopPropagation();removePair(p);}} style={{background:"none",border:"none",color:C.dimText,cursor:"pointer",fontSize:10}}>✕</button>}
                        </div>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{color:C.white,fontSize:12,fontWeight:700}}>{fmtUSD(px)}</span>
                        <span style={{color:chg>=0?C.green:C.red,fontSize:10}}>{fmtPct(chg)}</span>
                      </div>
                      {s&&<>
                        <div style={{marginTop:4,background:C.bg0,borderRadius:2,height:2}}><div style={{height:"100%",borderRadius:2,width:s.strength+"%",background:s.direction.includes("BUY")?C.green:s.direction==="NEUTRAL"?C.slate:C.red}}/></div>
                        {s.regime&&<div style={{marginTop:2,fontSize:8,color:s.regime.color}}>{s.regime.icon} {s.regime.regime?.replace("_"," ")}</div>}
                        {(s.divergence?.bullish||s.divergence?.bearish)&&<div style={{fontSize:8,color:s.divergence.bullish?C.green:C.red}}>⚡ {s.divergence.bullish?"Bull":"Bear"} div</div>}
                        {s.patternData?.patterns?.length>0&&<div style={{fontSize:8,color:C.gold}}>⬟ {s.patternData.patterns[0].name}</div>}
                      </>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center — chart + subtabs */}
            <div style={{display:"flex",flexDirection:"column",gap:12,minWidth:0}}>
              <AutoLog logs={autoLog} autoMode={strategy.autoMode} isDemo={isDemo} onClear={()=>setAutoLog([])}/>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{color:C.white,fontSize:20,fontWeight:700}}>{selectedPair}</span>
                    <span style={{color:C.white,fontSize:18,fontWeight:700}}>{fmtUSD(price)}</span>
                    {sig&&<SignalBadge direction={sig.direction}/>}
                    {sig?.isTradingSession&&<Badge color={C.green} small>SESSION ACTIVE</Badge>}
                    {sig?.divergence?.bullish&&<Badge color={C.green} small>⚡ BULL DIV</Badge>}
                    {sig?.divergence?.bearish&&<Badge color={C.red} small>⚡ BEAR DIV</Badge>}
                    {sig?.patternData?.patterns?.map(p=><Badge key={p.name} color={p.type==="bullish"?C.green:p.type==="bearish"?C.red:C.slate} small>⬟ {p.name}</Badge>)}
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <div style={{position:"relative",display:"inline-block"}}>
                      <button onClick={()=>setShowAlertsModal(true)} style={{background:C.bg3,border:"1px solid "+C.border,color:C.gold,padding:"7px 10px",borderRadius:5,cursor:"pointer",fontSize:11}}>🔔</button>
                      {notifications2.length>0&&<div style={{position:"absolute",top:-4,right:-4,background:C.red,color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{notifications2.length}</div>}
                    </div>
                    <button onClick={()=>setShowOrderModal(true)} style={{background:C.cyanDim,border:"1px solid "+C.cyan,color:C.cyan,padding:"8px 16px",borderRadius:5,cursor:"pointer",fontSize:12,fontWeight:700,animation:"glow 2s infinite"}}>+ TRADE</button>
                  </div>
                </div>
                {/* Subtabs */}
                <div style={{display:"flex",gap:3,marginBottom:10,borderBottom:"1px solid "+C.border,paddingBottom:8,overflowX:"auto"}}>
                  {[["chart","CHART"],["signals","SIGNALS"],["indicators","INDICATORS"],["patterns","PATTERNS"],["analysis","AI ANALYSIS"],["backtest","BACKTEST"],["news","NEWS"],["replay","REPLAY"]].map(([t,l])=>(
                    <button key={t} onClick={()=>setSubTab(t)} style={{padding:"4px 9px",borderRadius:4,border:"none",cursor:"pointer",background:subTab===t?C.cyanDim:"none",color:subTab===t?C.cyan:C.slate,fontFamily:"monospace",fontSize:9,whiteSpace:"nowrap"}}>{l}</button>
                  ))}
                </div>

                {subTab==="chart"&&<>
                  <CandleChart
                    candles={candleData[selectedPair]}
                    signal={sig}
                    timeframe={timeframe}
                    onTimeframeChange={setTimeframe}
                    openOrders={openOrders}
                    pair={selectedPair}
                    prices={prices}
                    onCloseOrder={closeOrder}
                    onMoveStop={moveStopToBreakeven}
                  />
                  {sig&&<div style={{display:"flex",gap:8,marginTop:10,paddingTop:10,borderTop:"1px solid "+C.border,flexWrap:"wrap",alignItems:"flex-start"}}>
                    <Gauge value={sig.rsi} label="RSI" color={sig.rsi<35?C.green:sig.rsi>70?C.red:C.gold}/>
                    <Gauge value={sig.stochRSI} label="STOCH" color={sig.stochRSI<20?C.green:sig.stochRSI>80?C.red:C.gold}/>
                    <Gauge value={sig.strength} label="STRENGTH" color={sig.direction.includes("BUY")?C.green:sig.direction==="NEUTRAL"?C.slate:C.red}/>
                    <Gauge value={Math.min(100,sig.adx.adx)} label="ADX" color={sig.adx.adx>25?C.cyan:C.dimText}/>
                    <Gauge value={Math.min(100,sig.volRatio*50)} label="VOLUME" color={C.purple}/>
                    <div style={{flex:1,minWidth:120}}>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:6}}>
                        {[["MACD",sig.hist>0?C.green:C.red,fmt(sig.hist,4)],["CCI",sig.cci<-100?C.green:sig.cci>100?C.red:C.white,fmt(sig.cci,0)],["MFI",sig.mfi<20?C.green:sig.mfi>80?C.red:C.white,fmt(sig.mfi,1)],["W%R",sig.williamsR<-80?C.green:sig.williamsR>-20?C.red:C.white,fmt(sig.williamsR,0)]].map(([k,c,v])=>(
                          <div key={k}><div style={{color:C.dimText,fontSize:8,marginBottom:2}}>{k}</div><div style={{color:c,fontSize:10,fontWeight:700}}>{v}</div></div>
                        ))}
                      </div>
                      {sig.regime&&<div style={{background:sig.regime.color+"22",border:"1px solid "+sig.regime.color+"44",borderRadius:4,padding:"4px 8px"}}>
                        <div style={{color:sig.regime.color,fontSize:9,fontWeight:700}}>{sig.regime.icon} {sig.regime.regime?.replace("_"," ").toUpperCase()}</div>
                        <div style={{color:C.dimText,fontSize:8,marginTop:1}}>{sig.regime.desc}</div>
                      </div>}
                    </div>
                  </div>}
                </>}

                {subTab==="signals"&&sig&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>{sig.reasons.map((r,i)=><div key={i} style={{background:C.bg2,borderRadius:5,padding:"6px 9px",border:"1px solid "+(r.weight==="positive"?C.green+"55":r.weight==="negative"?C.red+"55":C.border),display:"flex",gap:6,alignItems:"center"}}><span style={{color:r.weight==="positive"?C.green:r.weight==="negative"?C.red:C.slate,fontSize:10}}>•</span><span style={{color:r.weight==="positive"?C.green:r.weight==="negative"?C.red:C.slate,fontSize:10}}>{r.text}</span></div>)}</div>}

                {subTab==="patterns"&&sig&&<div>
                  {sig.regime&&<div style={{background:sig.regime.color+"22",border:"1px solid "+sig.regime.color+"44",borderRadius:8,padding:14,marginBottom:12}}>
                    <div style={{color:sig.regime.color,fontSize:12,fontWeight:700,marginBottom:4}}>{sig.regime.icon} REGIME: {sig.regime.regime?.replace("_"," ").toUpperCase()}</div>
                    <div style={{color:C.white,fontSize:11,marginBottom:4}}>{sig.regime.desc}</div>
                    <div style={{color:C.slate,fontSize:10}}>Strategy: {sig.regime.strategy?.replace("_"," ").toUpperCase()} · Confidence: {Math.round(sig.regime.confidence)}%</div>
                    <div style={{marginTop:6,height:4,background:C.bg0,borderRadius:2}}><div style={{width:sig.regime.confidence+"%",height:"100%",background:sig.regime.color,borderRadius:2}}/></div>
                  </div>}
                  <div style={{color:C.cyan,fontSize:10,fontWeight:700,marginBottom:8}}>DETECTED PATTERNS</div>
                  {sig.patternData?.patterns?.length>0?sig.patternData.patterns.map((p,i)=>(
                    <div key={i} style={{background:C.bg2,borderRadius:6,padding:10,marginBottom:8,border:"1px solid "+(p.type==="bullish"?C.green+"44":p.type==="bearish"?C.red+"44":C.border)}}>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}><span style={{color:p.type==="bullish"?C.green:p.type==="bearish"?C.red:C.slate,fontSize:12}}>⬟</span><span style={{color:C.white,fontSize:12,fontWeight:700}}>{p.name}</span><Badge color={p.type==="bullish"?C.green:p.type==="bearish"?C.red:C.slate} small>{p.type.toUpperCase()}</Badge></div>
                      <div style={{color:C.slate,fontSize:10}}>{p.desc}</div>
                    </div>
                  )):<div style={{color:C.dimText,fontSize:11,textAlign:"center",padding:20}}>No significant patterns detected</div>}
                  {sig.patternData?.srZones?.length>0&&<div style={{marginTop:10}}>
                    <div style={{color:C.gold,fontSize:10,fontWeight:700,marginBottom:8}}>SUPPORT & RESISTANCE</div>
                    {sig.patternData.srZones.slice(0,6).map((z,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+C.border+"22"}}><span style={{color:z.type==="support"?C.green:C.red,fontSize:10}}>{z.type.toUpperCase()}</span><span style={{color:C.white,fontSize:11,fontWeight:700}}>{fmtUSD(z.level)}</span></div>
                    ))}
                  </div>}
                </div>}

                {subTab==="indicators"&&sig&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                  {[{l:"RSI",v:fmt(sig.rsi,1),c:sig.rsi<35?C.green:sig.rsi>70?C.red:C.white,s:sig.rsi<35?"OVERSOLD":sig.rsi>70?"OVERBOUGHT":"NEUTRAL"},{l:"StochRSI",v:fmt(sig.stochRSI,1),c:sig.stochRSI<20?C.green:sig.stochRSI>80?C.red:C.white,s:sig.stochRSI<20?"OVERSOLD":sig.stochRSI>80?"OVERBOUGHT":"NEUTRAL"},{l:"Stochastic",v:fmt(sig.stoch.k,1),c:sig.stoch.k<20?C.green:sig.stoch.k>80?C.red:C.white,s:sig.stoch.k<20?"OVERSOLD":sig.stoch.k>80?"OVERBOUGHT":"NEUTRAL"},{l:"MACD",v:fmt(sig.hist,4),c:sig.hist>0?C.green:C.red,s:sig.hist>0?"BULLISH":"BEARISH"},{l:"Williams %R",v:fmt(sig.williamsR,1),c:sig.williamsR<-80?C.green:sig.williamsR>-20?C.red:C.white,s:sig.williamsR<-80?"OVERSOLD":sig.williamsR>-20?"OVERBOUGHT":"NEUTRAL"},{l:"CCI",v:fmt(sig.cci,0),c:sig.cci<-100?C.green:sig.cci>100?C.red:C.white,s:sig.cci<-100?"OVERSOLD":sig.cci>100?"OVERBOUGHT":"NEUTRAL"},{l:"MFI",v:fmt(sig.mfi,1),c:sig.mfi<20?C.green:sig.mfi>80?C.red:C.white,s:sig.mfi<20?"OUTFLOW":sig.mfi>80?"INFLOW":"NEUTRAL"},{l:"ADX",v:fmt(sig.adx.adx,1),c:sig.adx.adx>25?C.cyan:C.slate,s:sig.adx.adx>25?(sig.adx.pdi>sig.adx.mdi?"STRONG UP":"STRONG DOWN"):"WEAK"},{l:"Supertrend",v:sig.supertrend.trend.toUpperCase(),c:sig.supertrend.trend==="up"?C.green:C.red,s:sig.supertrend.trend==="up"?"BULLISH":"BEARISH"},{l:"PSAR",v:fmtUSD(sig.psar.sar),c:sig.psar.trend==="up"?C.green:C.red,s:sig.psar.trend==="up"?"BULLISH":"BEARISH"},{l:"VWAP",v:fmtUSD(sig.vwap),c:price>sig.vwap?C.green:C.red,s:price>sig.vwap?"ABOVE":"BELOW"},{l:"Divergence",v:sig.divergence.bullish?"BULLISH":sig.divergence.bearish?"BEARISH":"NONE",c:sig.divergence.bullish?C.green:sig.divergence.bearish?C.red:C.slate,s:sig.divergence.bullish?"BULL DIV":sig.divergence.bearish?"BEAR DIV":"NONE"}].map(({l,v,c,s})=>(
                    <div key={l} style={{background:C.bg2,borderRadius:5,padding:"7px 9px",border:"1px solid "+C.border}}><div style={{color:C.dimText,fontSize:8,marginBottom:3}}>{l}</div><div style={{color:c,fontSize:10,fontWeight:700,marginBottom:2}}>{v}</div><div style={{color:c,fontSize:8,opacity:0.7}}>{s}</div></div>
                  ))}
                  <div style={{gridColumn:"1/-1",background:C.bg2,borderRadius:5,padding:"9px 10px",border:"1px solid "+C.border}}>
                    <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                      <div><div style={{color:C.dimText,fontSize:9,marginBottom:5}}>PIVOT POINTS</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{[["S2",sig.pivot.s2,C.red],["S1",sig.pivot.s1,C.red],["PP",sig.pivot.pp,C.slate],["R1",sig.pivot.r1,C.green],["R2",sig.pivot.r2,C.green]].map(([l,v,c])=><div key={l}><div style={{color:C.dimText,fontSize:8}}>{l}</div><div style={{color:c,fontSize:9,fontWeight:700}}>{fmtUSD(v)}</div></div>)}</div></div>
                      <div><div style={{color:C.dimText,fontSize:9,marginBottom:5}}>FIB LEVELS</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{[["0.382",sig.fib.r382],["0.500",sig.fib.r500],["0.618",sig.fib.r618]].map(([l,v])=><div key={l}><div style={{color:C.dimText,fontSize:8}}>{l}</div><div style={{color:C.gold,fontSize:9,fontWeight:700}}>{fmtUSD(v)}</div></div>)}</div></div>
                    </div>
                  </div>
                </div>}

                {subTab==="analysis"&&<AIAnalysisPanel pair={selectedPair} signal={sig} price={price} timeframe={timeframe} isDemo={isDemo} apiKey={apiKey}/>}
                {subTab==="backtest"&&<BacktestPanel candles={candleData[selectedPair]||[]} strategy={strategy} pair={selectedPair} setStrategy={setStrategy}/>}
                {subTab==="news"&&<div style={{display:"flex",flexDirection:"column",gap:7}}>
                  <div style={{background:C.bg2,borderRadius:6,padding:10,marginBottom:4,border:"1px solid "+C.border}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{color:C.slate,fontSize:10}}>Overall News Sentiment</span>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <div style={{width:80,height:4,background:C.bg0,borderRadius:2}}><div style={{width:newsSentimentScore+"%",height:"100%",background:newsSentimentScore>=60?C.green:newsSentimentScore>=40?C.gold:C.red,borderRadius:2}}/></div>
                        <span style={{color:newsSentimentScore>=60?C.green:newsSentimentScore>=40?C.gold:C.red,fontSize:11,fontWeight:700}}>{newsSentimentScore}/100</span>
                      </div>
                    </div>
                  </div>
                  {NEWS.map((n,i)=>(
                    <div key={i} style={{background:C.bg2,borderRadius:5,padding:"9px 12px",border:"1px solid "+(n.sentiment==="bullish"?C.green+"33":C.red+"33")}}>
                      <div style={{color:C.white,fontSize:11,lineHeight:1.5,marginBottom:5}}>{n.headline}</div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <Badge color={n.sentiment==="bullish"?C.green:C.red} small>{n.sentiment==="bullish"?"▲ BULLISH":"▼ BEARISH"}</Badge>
                        <Badge color={n.impact==="HIGH"?C.red:n.impact==="MED"?C.gold:C.slate} small>{n.impact}</Badge>
                        <span style={{color:C.dimText,fontSize:9,marginLeft:"auto"}}>{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>}
                {subTab==="replay"&&<ReplayPanel candles={candleData[selectedPair]||[]} pair={selectedPair}/>}
              </div>
            </div>

            {/* Right — trade levels + open positions */}
            <div className="nexus-right-col" style={{display:"flex",flexDirection:"column",gap:12}}>
              {sig&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:14}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:12,fontWeight:700}}>◈ TRADE LEVELS</div>
                {[{label:"ENTRY",value:fmtUSD(sig.entry),color:C.cyan,icon:"→"},{label:"STOP LOSS",value:fmtUSD(sig.stopLoss),color:C.red,icon:"✕"},{label:"TP 1 (40%)",value:fmtUSD(sig.tp1),color:C.green,icon:"✓"},{label:"TP 2 (40%)",value:fmtUSD(sig.tp2),color:C.green,icon:"✓"},{label:"TP 3 (20%)",value:fmtUSD(sig.tp3),color:C.gold,icon:"★"},{label:"TP 4 (trail)",value:fmtUSD(sig.tp4),color:C.orange,icon:"∞"}].map(({label,value,color,icon})=>(
                  <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5,padding:"6px 8px",background:C.bg2,borderRadius:5,border:"1px solid "+color+"22"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color,fontSize:10}}>{icon}</span><span style={{color:C.slate,fontSize:9}}>{label}</span></div>
                    <span style={{color,fontSize:11,fontWeight:700}}>{value}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",padding:"7px 9px",background:C.bg2,borderRadius:5,marginTop:4,marginBottom:10}}>
                  <span style={{color:C.slate,fontSize:10}}>Risk / Reward</span>
                  <span style={{color:sig.riskReward>=2?C.green:C.gold,fontSize:13,fontWeight:700}}>1 : {fmt(sig.riskReward,1)}</span>
                </div>
                {sig.regime&&<div style={{padding:"6px 9px",background:sig.regime.color+"11",borderRadius:5,marginBottom:10,border:"1px solid "+sig.regime.color+"33"}}>
                  <div style={{color:sig.regime.color,fontSize:9,fontWeight:700}}>{sig.regime.icon} {sig.regime.regime?.replace("_"," ").toUpperCase()}</div>
                  <div style={{color:C.dimText,fontSize:8,marginTop:1}}>Strategy: {sig.regime.strategy?.replace("_"," ")}</div>
                </div>}
                <button onClick={()=>setShowOrderModal(true)} style={{width:"100%",padding:"11px 0",borderRadius:5,border:"none",cursor:"pointer",background:sig.direction.includes("BUY")?C.green:sig.direction==="NEUTRAL"?C.bg3:C.red,color:sig.direction==="NEUTRAL"?C.slate:"#000",fontWeight:700,fontSize:12,fontFamily:"monospace",opacity:sig.direction==="NEUTRAL"?0.4:1}}>
                  {isDemo?"[DEMO] ":""}{sig.direction==="NEUTRAL"?"AWAITING SIGNAL":"EXECUTE "+sig.direction}
                </button>
              </div>}

              {openOrders.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:14}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:10,fontWeight:700}}>◈ OPEN POSITIONS ({openOrders.length})</div>
                {openOrders.map(o=>{
                  const cur=getPrice(o.pair);
                  const pnl=calcPnl(o);
                  const pnlPct=calcPnlPct(o);
                  return(
                    <div key={o.id} style={{background:C.bg2,borderRadius:6,padding:10,marginBottom:7,border:"1px solid "+(pnl>=0?C.green:C.red)+"33"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
                          <span style={{color:C.white,fontSize:11,fontWeight:700}}>{o.pair}</span>
                          {o.isDemo&&<Badge color={C.purple} small>D</Badge>}
                          {o.autoPlaced&&<Badge color={C.orange} small>AUTO</Badge>}{o.twapGroupId&&<Badge color={C.blue} small>TWAP {o.twapLeg}/{o.twapTotalLegs}</Badge>}{o.icebergGroupId&&<Badge color={C.blue} small>ICE {o.icebergLeg}/{o.icebergTotalLegs}</Badge>}
                          {o.tp1Hit&&<Badge color={C.cyan} small>BE</Badge>}
                          {o.useTrail&&<Badge color={C.gold} small>T</Badge>}
                        </div>
                        <span style={{color:o.side==="BUY"?C.green:C.red,fontSize:10,fontWeight:700}}>{o.side}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{color:C.slate,fontSize:10}}>{o.qty} @ {fmtUSD(o.price)}</span>
                        <div>
                          <span style={{color:pnl>=0?C.green:C.red,fontSize:11,fontWeight:700}}>{pnl>=0?"+":""}{fmtUSD(pnl)}</span>
                          <span style={{color:pnlPct>=0?C.green:C.red,fontSize:9,marginLeft:4}}>{fmtPct(pnlPct)}</span>
                        </div>
                      </div>
                      {o.sl&&<div style={{display:"flex",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                        <span style={{color:C.red,fontSize:9}}>SL: {fmtUSD(o.sl)}</span>
                        {o.tp&&<span style={{color:C.green,fontSize:9}}>TP1: {fmtUSD(o.tp)}</span>}
                        {o.tp2&&<span style={{color:C.green,fontSize:9}}>TP2: {fmtUSD(o.tp2)}</span>}
                      </div>}
                      <div style={{display:"flex",gap:5}}>
                        <button onClick={()=>moveStopToBreakeven(o.id,o.price)} style={{flex:1,padding:"4px 0",borderRadius:3,border:"1px solid "+C.cyan,background:"none",color:C.cyan,cursor:"pointer",fontSize:9}}>→ BE</button>
                        <button onClick={()=>closeOrder(o.id)} style={{flex:1,padding:"4px 0",borderRadius:3,border:"1px solid "+C.red,background:C.redDim,color:C.red,cursor:"pointer",fontSize:9,fontWeight:700}}>CLOSE</button>
                      </div>
                    </div>
                  );
                })}
              </div>}
            </div>
          </div>
        )}

        {tab==="trades"&&(
          <div>
            {/* Live chart for selected pair on trades page */}
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:14,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{color:C.white,fontSize:16,fontWeight:700}}>{selectedPair}</span>
                  <span style={{color:C.white,fontSize:14,fontWeight:700}}>{fmtUSD(price)}</span>
                  {sig&&<SignalBadge direction={sig.direction}/>}
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {activePairs.filter(p=>openOrders.some(o=>o.pair===p)).map(p=>(
                    <button key={p} onClick={()=>setSelectedPair(p)} style={{padding:"4px 10px",borderRadius:4,border:"1px solid "+(selectedPair===p?C.gold:C.border),background:selectedPair===p?C.goldDim:C.bg3,color:selectedPair===p?C.gold:C.slate,cursor:"pointer",fontSize:10,fontFamily:"monospace"}}>{p}</button>
                  ))}
                  <button onClick={()=>setShowOrderModal(true)} style={{background:C.cyanDim,border:"1px solid "+C.cyan,color:C.cyan,padding:"5px 12px",borderRadius:4,cursor:"pointer",fontSize:10,fontWeight:700}}>+ TRADE</button>
                </div>
              </div>
              <CandleChart
                candles={candleData[selectedPair]}
                signal={sig}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                openOrders={openOrders}
                pair={selectedPair}
                prices={prices}
                onCloseOrder={closeOrder}
                onMoveStop={moveStopToBreakeven}
              />
            </div>
            {(()=>{
              const th=tradeHistory;
              const modeOrders=openOrders.filter(o=>o.isDemo===isDemo);
                const openPnlCalc=modeOrders.reduce((sum,o)=>{const cur=getPrice(o.pair);return sum+(cur-o.price)*o.qty*(o.side==="SELL"?-1:1)*(o.leverage||1);},0);
              const wins=th.filter(t=>t.pnl>0);
              const losses=th.filter(t=>t.pnl<=0);
              const totalPnl=th.reduce((a,t)=>a+(t.pnl||0),0);
              const totalWon=wins.reduce((a,t)=>a+(t.pnl||0),0);
              const totalLost=Math.abs(losses.reduce((a,t)=>a+(t.pnl||0),0));
              const wr=th.length>0?Math.round((wins.length/th.length)*100):0;
              const pf=totalLost>0?Math.round((totalWon/totalLost)*100)/100:totalWon>0?99:0;
              const best=th.length>0?Math.max(...th.map(t=>t.pnl||0)):0;
              const worst=th.length>0?Math.min(...th.map(t=>t.pnl||0)):0;
              const openPnl=modeOrders.reduce((sum,o)=>{const cur=getPrice(o.pair);return sum+(cur-o.price)*o.qty*(o.side==="SELL"?-1:1)*(o.leverage||1);},0);
              return(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:14}}>
                {[
                  {l:"Closed P&L",v:fmtUSD(totalPnl),s:isDemo?"Demo":"Live",c:totalPnl>=0?C.green:C.red},
                  {l:"Open P&L",v:fmtUSD(modeOrders.reduce((s,o)=>{const c=getPrice(o.pair);return s+(c-o.price)*o.qty*(o.side==="SELL"?-1:1)*(o.leverage||1);},0)),s:modeOrders.length+" positions",c:C.green},
                  {l:"Win Rate",v:wr+"%",s:wins.length+"W / "+losses.length+"L",c:wr>=50?C.green:C.red},
                  {l:"Profit Factor",v:fmt(pf,2)+"x",s:"wins÷losses",c:pf>=1.5?C.green:pf>=1?C.gold:C.red},
                  {l:"Total Trades",v:th.length,s:modeOrders.length+" open",c:C.white},
                  {l:"Best Trade",v:th.length>0?fmtUSD(best):"-",s:"single",c:C.gold},
                  {l:"Worst Trade",v:th.length>0?fmtUSD(worst):"-",s:"single",c:C.red},
                  {l:"Balance",v:fmtUSD(isDemo?demoBalance:livePortfolio.balance),s:isDemo?"Demo":"Live",c:isDemo?C.purple:C.green},
                ].map(({l,v,s,c})=>(
                  <div key={l} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:14}}>
                    <div style={{color:C.slate,fontSize:9,marginBottom:6}}>{l}</div>
                    <div style={{color:c,fontSize:18,fontWeight:700}}>{v}</div>
                    <div style={{color:C.dimText,fontSize:9,marginTop:3}}>{s}</div>
                  </div>
                ))}
              </div>
              );
            })()}
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <span style={{color:C.cyan,fontSize:11,fontWeight:700}}>◈ {isDemo?"DEMO":"LIVE"} TRADE HISTORY — {tradeHistory.length} {isDemo?"demo":"live"} trades</span>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {isDemo?<Badge color={C.purple} small>DEMO DATA</Badge>:<Badge color={C.green} small>LIVE DATA</Badge>}
                  <span style={{color:C.green,fontSize:10}}>☁ Supabase</span>
                </div>
              </div>
              {tradeHistory.length===0&&openOrders.length===0&&<div style={{color:C.dimText,fontSize:11,textAlign:"center",padding:40}}>No {isDemo?"demo":"live"} trades yet.</div>}
              {openOrders.length>0&&<div style={{padding:"10px 16px",background:C.bg2,borderBottom:"1px solid "+C.border}}><span style={{color:C.gold,fontSize:10,fontFamily:"monospace"}}>◈ {openOrders.filter(o=>o.isDemo===isDemo).length} OPEN {isDemo?"DEMO":"LIVE"} POSITION{openOrders.length>1?"S":""} — live P&L</span></div>}
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:750}}>
                  <thead><tr style={{background:C.bg2}}>{["PAIR","MODE","SIDE","QTY","ENTRY","EXIT","P&L","P&L%","LEV","STATUS","TIME"].map(h=><th key={h} style={{padding:"8px 10px",color:C.slate,fontSize:9,textAlign:"left",fontWeight:400,borderBottom:"1px solid "+C.border,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {openOrders.filter(o=>o.isDemo===isDemo).map((o,i)=>{
                      const cur=getPrice(o.pair);
                  const pnl=calcPnl(o);
                  const pnlPct=calcPnlPct(o);
                      return(
                        <tr key={"open_"+o.id} style={{borderBottom:"1px solid "+C.border+"22",background:C.green+"08"}}>
                          <td style={{padding:"8px 10px",color:C.white,fontSize:11,fontWeight:700}}>{o.pair}</td>
                          <td style={{padding:"8px 10px"}}><Badge color={C.cyan} small>{(o.mode||"SPOT").toUpperCase()}</Badge></td>
                          <td style={{padding:"8px 10px",color:o.side==="BUY"?C.green:C.red,fontSize:10,fontWeight:700}}>{o.side}</td>
                          <td style={{padding:"8px 10px",color:C.white,fontSize:10}}>{o.qty}</td>
                          <td style={{padding:"8px 10px",color:C.white,fontSize:10}}>{fmtUSD(o.price)}</td>
                          <td style={{padding:"8px 10px",color:C.cyan,fontSize:10}}>LIVE {fmtUSD(cur)}</td>
                          <td style={{padding:"8px 10px",color:pnl>=0?C.green:C.red,fontSize:11,fontWeight:700}}>{pnl>=0?"+":""}{fmtUSD(pnl)}</td>
                          <td style={{padding:"8px 10px",color:pnlPct>=0?C.green:C.red,fontSize:10}}>{fmtPct(pnlPct)}</td>
                          <td style={{padding:"8px 10px",color:C.slate,fontSize:10}}>{o.leverage||1}x</td>
                          <td style={{padding:"8px 10px"}}><Badge color={C.gold} small>OPEN</Badge></td>
                          <td style={{padding:"8px 10px"}}><button onClick={()=>closeOrder(o.id)} style={{background:C.redDim,border:"1px solid "+C.red,color:C.red,padding:"3px 8px",borderRadius:3,cursor:"pointer",fontSize:9,fontFamily:"monospace"}}>CLOSE</button></td>
                        </tr>
                      );
                    })}
                    {tradeHistory.map((t,i)=>(
                    <tr key={t.id||i} style={{borderBottom:"1px solid "+C.border+"22",background:i%2===0?C.bg0+"44":"none"}}>
                      <td style={{padding:"8px 10px",color:C.white,fontSize:11,fontWeight:700}}>{t.pair}</td>
                      <td style={{padding:"8px 10px"}}><Badge color={t.mode==="FUTURES"?C.orange:C.cyan} small>{(t.mode||"SPOT").toUpperCase()}</Badge></td>
                      <td style={{padding:"8px 10px",color:t.side==="BUY"?C.green:C.red,fontSize:10,fontWeight:700}}>{t.side}</td>
                      <td style={{padding:"8px 10px",color:C.white,fontSize:10}}>{t.qty}</td>
                      <td style={{padding:"8px 10px",color:C.white,fontSize:10}}>{fmtUSD(t.price)}</td>
                      <td style={{padding:"8px 10px",color:C.white,fontSize:10}}>{fmtUSD(t.closePrice)}</td>
                      <td style={{padding:"8px 10px",color:t.pnl>=0?C.green:C.red,fontSize:11,fontWeight:700}}>{t.pnl>=0?"+":""}{fmtUSD(t.pnl)}</td>
                      <td style={{padding:"8px 10px",color:t.pnlPct>=0?C.green:C.red,fontSize:10}}>{fmtPct(t.pnlPct)}</td>
                      <td style={{padding:"8px 10px",color:C.slate,fontSize:10}}>{t.leverage||1}x</td>
                      <td style={{padding:"8px 10px"}}>{t.autoPlaced?<Badge color={C.orange} small>AUTO</Badge>:<Badge color={C.slate} small>MANUAL</Badge>}</td>
                      <td style={{padding:"8px 10px",color:C.dimText,fontSize:9,whiteSpace:"nowrap"}}>{t.time}</td>
                    </tr>
                  ))}
                    </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab==="portfolio"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",fontWeight:700}}>◈ {isDemo?"DEMO":"LIVE"} PORTFOLIO</div>
                <div onClick={()=>setIsDemo(!isDemo)} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",background:C.bg2,padding:"5px 10px",borderRadius:6,border:"1px solid "+C.border}}>
                  <span style={{color:C.dimText,fontSize:9}}>Switch to</span>
                  <Badge color={isDemo?C.green:C.purple} small>{isDemo?"LIVE":"DEMO"}</Badge>
                </div>
              </div>
              <div style={{color:C.dimText,fontSize:9,marginBottom:6}}>{user.email}</div>
              <div style={{background:isDemo?C.purpleDim:C.greenDim,borderRadius:8,padding:"14px 16px",marginBottom:14,border:"2px solid "+(isDemo?C.purple:C.green)}}>
                <div style={{color:isDemo?C.purple:C.green,fontSize:10,marginBottom:4,fontWeight:700}}>{isDemo?"DEMO BALANCE":"LIVE BALANCE"}</div>
                <div style={{color:isDemo?C.purple:C.green,fontSize:26,fontWeight:700}}>{fmtUSD(isDemo?demoBalance:liveBalance)}</div>
                {!isDemo&&liveBalance===0&&<div style={{marginTop:8}}>
                  <div style={{color:C.dimText,fontSize:9,marginBottom:4}}>Enter your Binance balance:</div>
                  <div style={{display:"flex",gap:6}}>
                    <input type="number" placeholder="e.g. 100.00" onBlur={e=>{if(e.target.value){setLiveBalance(parseFloat(e.target.value));lSave("live_bal_"+uid,parseFloat(e.target.value));}}} style={{flex:1,background:C.bg3,border:"1px solid "+C.green,borderRadius:4,color:C.white,padding:"6px 10px",fontFamily:"monospace",fontSize:12,outline:"none"}}/>
                    <span style={{color:C.dimText,fontSize:9,alignSelf:"center"}}>USDT</span>
                  </div>
                </div>}
              </div>
              {openOrders.length>0&&(()=>{
                const openPnl=openOrders.filter(o=>o.isDemo===isDemo).reduce((sum,o)=>{const cur=getPrice(o.pair);return sum+(cur-o.price)*o.qty*(o.side==="SELL"?-1:1)*(o.leverage||1);},0);
                return(
                  <div style={{background:openPnl>=0?C.greenDim:C.redDim,border:"1px solid "+(openPnl>=0?C.green:C.red)+"44",borderRadius:6,padding:"10px 12px",marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{color:C.slate,fontSize:10}}>{openOrders.length} Open Position{openOrders.length>1?"s":""} — Live P&L</span>
                      <span style={{color:openPnl>=0?C.green:C.red,fontSize:16,fontWeight:700}}>{openPnl>=0?"+":""}{fmtUSD(openPnl)}</span>
                    </div>
                    <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                      {openOrders.map(o=>{
                        const cur=prices[o.pair]||o.price;
                        const pnl=(cur-o.price)*o.qty*(o.side==="SELL"?-1:1)*(o.leverage||1);
                        return <span key={o.id} style={{color:pnl>=0?C.green:C.red,fontSize:9}}>{o.pair} {pnl>=0?"+":""}{fmtUSD(pnl)}</span>;
                      })}
                    </div>
                  </div>
                );
              })()}
{(()=>{
                const th=tradeHistory;
                const tw=th.filter(t=>t.pnl>0);
                const tl=th.filter(t=>t.pnl<=0);
                const tp=th.reduce((a,t)=>a+t.pnl,0);
                const two=tw.reduce((a,t)=>a+t.pnl,0);
                const tlo=Math.abs(tl.reduce((a,t)=>a+t.pnl,0));
                const wr=th.length>0?Math.round((tw.length/th.length)*100):0;
                const pf=tlo>0?Math.round((two/tlo)*100)/100:two>0?99:0;
                const openPnl=openOrders.reduce((sum,o)=>{const cur=getPrice(o.pair);return sum+(cur-o.price)*o.qty*(o.side==="SELL"?-1:1)*(o.leverage||1);},0);
                const stats=[
                  
                  {l:"Open P&L (live)",v:fmtUSD(openOrders.filter(o=>o.isDemo===isDemo).reduce((s,o)=>{const c=getPrice(o.pair);return s+(c-o.price)*o.qty*(o.side==="SELL"?-1:1)*(o.leverage||1);},0)),c:C.green},
                  {l:"Closed P&L",v:fmtUSD(tp),c:tp>=0?C.green:C.red},
                  {l:"Combined P&L",v:fmtUSD(tp+openOrders.filter(o=>o.isDemo===isDemo).reduce((s,o)=>{const c=getPrice(o.pair);return s+(c-o.price)*o.qty*(o.side==="SELL"?-1:1)*(o.leverage||1);},0)),c:C.green},
                  {l:"Total Trades",v:th.length,c:C.white},
                  {l:"Open Positions",v:openOrders.length,c:openOrders.length>0?C.gold:C.slate},
                  {l:"Win Rate",v:wr+"%",c:wr>=50?C.green:C.red},
                  {l:"Wins / Losses",v:tw.length+" / "+tl.length,c:C.white},
                  {l:"Profit Factor",v:fmt(pf,2)+"x",c:pf>=1.5?C.green:pf>=1?C.gold:C.red},
                  {l:"Best Trade",v:th.length>0?fmtUSD(Math.max(...th.map(t=>t.pnl))):"-",c:C.gold},
                  {l:"Worst Trade",v:th.length>0?fmtUSD(Math.min(...th.map(t=>t.pnl))):"-",c:C.red},
                  {l:"Avg Win",v:tw.length>0?fmtUSD(two/tw.length):"-",c:C.green},
                  {l:"Avg Loss",v:tl.length>0?fmtUSD(tlo/tl.length):"-",c:C.red},
                  {l:"Expectancy",v:th.length>0?fmtUSD(tp/th.length):"-",c:tp>=0?C.green:C.red},
                ];
                return stats;
              })().map(({l,v,c})=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+C.border+"22"}}><span style={{color:C.slate,fontSize:11}}>{l}</span><span style={{color:c,fontSize:12,fontWeight:700}}>{v}</span></div>
              ))}
              <button onClick={syncToSupabase} style={{width:"100%",padding:"9px 0",borderRadius:4,border:"1px solid "+C.cyan,background:C.cyanDim,color:C.cyan,cursor:"pointer",fontFamily:"monospace",fontSize:11,fontWeight:700,marginTop:14}}>↑ SYNC TO DATABASE</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:12,fontWeight:700}}>◈ OPEN POSITIONS</div>
                {openOrders.filter(o=>o.isDemo===isDemo).length===0&&<div style={{color:C.dimText,fontSize:11,textAlign:"center",padding:20}}>No {isDemo?"demo":"live"} open positions</div>}
                {openOrders.filter(o=>o.isDemo===isDemo).map(o=>{
                  const cur=getPrice(o.pair);
                  const pnl=calcPnl(o);
                  const pnlPct=calcPnlPct(o);
                  return(
                    <div key={o.id} style={{background:C.bg2,borderRadius:6,padding:12,marginBottom:8,border:"1px solid "+(pnl>=0?C.green:C.red)+"44"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
                          <span style={{color:C.white,fontWeight:700,fontSize:12}}>{o.pair}</span>
                          <span style={{color:o.side==="BUY"?C.green:C.red,fontSize:10,fontWeight:700}}>{o.side}</span>
                          {o.autoPlaced&&<Badge color={C.orange} small>AUTO</Badge>}{o.twapGroupId&&<Badge color={C.blue} small>TWAP {o.twapLeg}/{o.twapTotalLegs}</Badge>}{o.icebergGroupId&&<Badge color={C.blue} small>ICE {o.icebergLeg}/{o.icebergTotalLegs}</Badge>}
                          {o.tp1Hit&&<Badge color={C.cyan} small>BE</Badge>}
                          {o.useTrail&&<Badge color={C.gold} small>TRAIL</Badge>}
                          {o.isDemo&&<Badge color={C.purple} small>DEMO</Badge>}
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{color:pnl>=0?C.green:C.red,fontSize:14,fontWeight:700}}>{pnl>=0?"+":""}{fmtUSD(pnl)}</div>
                          <div style={{color:pnlPct>=0?C.green:C.red,fontSize:10}}>{fmtPct(pnlPct)}</div>
                        </div>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{color:C.slate,fontSize:10}}>{o.qty} @ {fmtUSD(o.price)}</span>
                        <span style={{color:C.cyan,fontSize:10}}>Now: {fmtUSD(cur)}</span>
                      </div>
                      {o.sl&&<div style={{display:"flex",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                        <span style={{color:C.red,fontSize:9}}>SL: {fmtUSD(o.sl)}</span>
                        {o.tp&&<span style={{color:C.green,fontSize:9}}>TP1: {fmtUSD(o.tp)}</span>}
                        {o.tp2&&<span style={{color:C.green,fontSize:9}}>TP2: {fmtUSD(o.tp2)}</span>}
                        {o.tp3&&<span style={{color:C.gold,fontSize:9}}>TP3: {fmtUSD(o.tp3)}</span>}
                      </div>}
                      <div style={{display:"flex",gap:5}}>
                        <button onClick={()=>moveStopToBreakeven(o.id,o.price)} style={{flex:1,padding:"5px 0",borderRadius:3,border:"1px solid "+C.cyan,background:"none",color:C.cyan,cursor:"pointer",fontSize:9,fontFamily:"monospace"}}>→ BREAKEVEN</button>
                        <button onClick={()=>closeOrder(o.id)} style={{flex:1,padding:"5px 0",borderRadius:3,border:"1px solid "+C.red,background:C.redDim,color:C.red,cursor:"pointer",fontSize:9,fontFamily:"monospace",fontWeight:700}}>CLOSE TRADE</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:12,fontWeight:700}}>◈ AUTO TRADING</div>
                {[["Mode",strategy.autoMode,strategy.autoMode==="FULL-AUTO"?C.red:strategy.autoMode==="SEMI-AUTO"?C.cyan:C.slate],["Auto Opens",autoLog.filter(l=>l.type==="OPEN"&&(isDemo?l.isDemo!==false:l.isDemo===false)).length,C.white],["TP Hits",autoLog.filter(l=>l.type?.startsWith("TP")&&(isDemo?l.isDemo!==false:l.isDemo===false)).length,C.green],["SL Hits",autoLog.filter(l=>l.type==="SL"&&(isDemo?l.isDemo!==false:l.isDemo===false)).length,C.red],["Session",isTradingSession()?"Active":"Closed",isTradingSession()?C.green:C.slate]].map(([k,v,c])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+C.border+"22"}}><span style={{color:C.slate,fontSize:11}}>{k}</span><span style={{color:c,fontSize:11,fontWeight:700}}>{v}</span></div>
                ))}
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:14,fontWeight:700}}>◈ KELLY CRITERION</div>
                {(()=>{
                  const th=isDemo?lLoad("demo_history_"+(user?.id||""),[]):lLoad("live_history_"+(user?.id||""),[]);
                  const wins=th.filter(t=>t.pnl>0).length;
                  const winRate=th.length>0?(wins/th.length)*100:50;
                  const kelly=calcKellySize(winRate,parseFloat(strategy.minRR)||2.5,currentBalance,5);
                  return(
                    <div>
                      {[["Win Rate (actual)",Math.round(winRate)+"%",winRate>=50?C.green:C.red],
                        ["R:R Setting",fmt(strategy.minRR||2.5,1)+"x",C.white],
                        ["Full Kelly",fmt(kelly.kelly*100,1)+"%",kelly.kelly>0?C.green:C.red],
                        ["Half Kelly (safe)",fmt(kelly.halfKelly*100,1)+"%",kelly.halfKelly>0?C.green:C.red],
                        ["Recommended Risk",fmt(kelly.riskPct,1)+"%",kelly.recommended?C.green:C.red],
                        ["Risk Amount",fmtUSD(kelly.riskAmount),kelly.recommended?C.green:C.slate],
                        ["Based on",th.length+" closed trades",C.slate],
                      ].map(([l,v,c])=>(
                        <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+C.border+"22"}}>
                          <span style={{color:C.slate,fontSize:10}}>{l}</span>
                          <span style={{color:c,fontSize:11,fontWeight:700}}>{v}</span>
                        </div>
                      ))}
                      <div style={{background:C.goldDim,border:"1px solid "+C.gold+"33",borderRadius:5,padding:"8px 10px",marginTop:10}}>
                        <div style={{color:C.gold,fontSize:9,lineHeight:1.6}}>Kelly Criterion uses your actual win rate and R:R to calculate mathematically optimal position size. Half-Kelly is recommended for safety and reduces variance.</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:12,fontWeight:700}}>◈ CORRELATION MATRIX</div>
                <div style={{color:C.dimText,fontSize:9,marginBottom:10}}>Red {">"} 0.7 = highly correlated — avoid trading both. Green = inverse.</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{borderCollapse:"collapse",fontSize:8,width:"100%",minWidth:300}}>
                    <thead>
                      <tr>
                        <th style={{padding:"4px 6px",color:C.dimText,textAlign:"left",fontSize:8}}></th>
                        {activePairs.slice(0,6).map(p=><th key={p} style={{padding:"4px 6px",color:C.slate,textAlign:"center",fontSize:8,fontFamily:"monospace"}}>{p.split("/")[0]}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {activePairs.slice(0,6).map(pA=>(
                        <tr key={pA}>
                          <td style={{padding:"4px 6px",color:C.slate,fontWeight:700,fontSize:8,fontFamily:"monospace"}}>{pA.split("/")[0]}</td>
                          {activePairs.slice(0,6).map(pB=>{
                            if(pA===pB)return <td key={pB} style={{padding:"4px 6px",background:C.bg3,textAlign:"center",color:C.dimText,fontSize:8}}>1.00</td>;
                            const pA_closes=(candleData[pA]||[]).map(c=>c.close);
                            const pB_closes=(candleData[pB]||[]).map(c=>c.close);
                            const corr=calcPairCorrelation(pA_closes,pB_closes);
                            const col=corr>0.7?C.red:corr>0.4?C.gold:corr<-0.3?C.green:C.slate;
                            return <td key={pB} style={{padding:"4px 6px",background:col+"22",textAlign:"center",color:col,fontWeight:700,fontSize:8}}>{fmt(corr,2)}</td>;
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{display:"flex",gap:12,marginTop:8,flexWrap:"wrap"}}>
                  {[[">0.7",C.red,"Avoid"],[">0.4",C.gold,"Caution"],["<-0.3",C.green,"Inverse"],["~0",C.slate,"Independent"]].map(([l,c,d])=>(
                    <div key={l} style={{display:"flex",gap:4,alignItems:"center"}}>
                      <span style={{color:c,fontSize:8,fontWeight:700}}>{l}</span>
                      <span style={{color:C.dimText,fontSize:8}}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="strategy"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20,gridColumn:"1 / -1"}}>
              <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:4,fontWeight:700}}>◈ SIGNAL QUALIFICATION</div>
              <div style={{color:C.dimText,fontSize:9,marginBottom:12}}>Which active pairs currently meet this strategy's minimum strength and R:R to actually trade.</div>
              {(()=>{
                const minStrength=parseFloat(strategy.minStrength)||72;
                const minRR=parseFloat(strategy.minRR)||2.5;
                const rows=activePairs.map(p=>{
                  const s=signals[p];
                  const pairOv=strategy.pairOverrides&&strategy.pairOverrides[p];
                  const effMinStrength=pairOv&&pairOv.minStrength!==undefined?pairOv.minStrength:minStrength;
                  const effMinRR=pairOv&&pairOv.minRR!==undefined?pairOv.minRR:minRR;
                  const strengthOk=s&&s.strength>=effMinStrength;
                  const rrOk=s&&s.riskReward>=effMinRR;
                  const directionOk=s&&s.direction!=="NEUTRAL";
                  const qualifies=!!(s&&strengthOk&&rrOk&&directionOk);
                  return{pair:p,sig:s,strengthOk,rrOk,directionOk,qualifies,effMinStrength,effMinRR};
                });
                const qualifyCount=rows.filter(r=>r.qualifies).length;
                return(<>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,background:C.bg2,borderRadius:6,padding:"10px 14px"}}>
                    <div style={{color:qualifyCount>0?C.green:C.slate,fontSize:22,fontWeight:700}}>{qualifyCount}</div>
                    <div style={{color:C.slate,fontSize:11}}>of {activePairs.length} active pairs currently qualify to trade under this strategy</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:280,overflowY:"auto"}}>
                    {rows.map(r=>(
                      <div key={r.pair} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 10px",background:r.qualifies?C.greenDim:C.bg2,borderRadius:5,border:"1px solid "+(r.qualifies?C.green+"44":C.border)}}>
                        <span style={{color:C.white,fontSize:10,fontWeight:700,minWidth:90}}>{r.pair}</span>
                        {!r.sig?<span style={{color:C.dimText,fontSize:9}}>loading…</span>:<>
                          <div style={{display:"flex",alignItems:"center",gap:4,minWidth:110}}>
                            <div style={{width:50,height:5,background:C.bg0,borderRadius:2}}><div style={{width:Math.min(100,r.sig.strength)+"%",height:"100%",background:r.strengthOk?C.green:C.red,borderRadius:2}}/></div>
                            <span style={{color:r.strengthOk?C.green:C.red,fontSize:9}}>{Math.round(r.sig.strength)}%</span>
                          </div>
                          <span style={{color:r.rrOk?C.green:C.red,fontSize:9,minWidth:55}}>R:R {fmt(r.sig.riskReward,1)}</span>
                          <span style={{color:r.directionOk?C.white:C.slate,fontSize:9,minWidth:70}}>{r.sig.direction}</span>
                          <Badge color={r.qualifies?C.green:C.red} small>{r.qualifies?"QUALIFIES":"NO"}</Badge>
                        </>}
                      </div>
                    ))}
                  </div>
                </>);
              })()}
            </div>
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
              <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:14,fontWeight:700}}>◈ STRATEGY PRESETS</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
                {[{n:"NEXUS Prime",s:{name:"NEXUS Prime",riskPct:1.5,maxTrades:3,minRR:2.5,minStrength:72,sessionFilter:true,correlationFilter:true,regimeFilter:true,volatilityFilter:true,mtfFilter:true,autoMode:"FULL-AUTO",useTrail:false,useBE:true,tp1Pct:40,tp2Pct:40,tp3Pct:20,dailyLoss:5,sizingMode:"kelly",maxKellyRisk:2}},
                  {n:"Trend Rider",s:{name:"NEXUS Trend Rider",riskPct:2,maxTrades:3,minRR:2,minStrength:65,sessionFilter:false,correlationFilter:true,regimeFilter:true,volatilityFilter:false,mtfFilter:true,autoMode:"FULL-AUTO",useTrail:true,trailType:"ATR",trailAtr:2,useBE:true,tp1Pct:30,tp2Pct:30,tp3Pct:40,dailyLoss:6}},
                  {n:"Aggressive",s:{name:"Aggressive",riskPct:3,maxTrades:5,minRR:2,minStrength:60,sessionFilter:false,correlationFilter:false,regimeFilter:false,volatilityFilter:false,mtfFilter:false,autoMode:"FULL-AUTO",useTrail:false,useBE:false,tp1Pct:40,tp2Pct:40,tp3Pct:20,dailyLoss:10}},
                  {n:"Small Account",s:{name:"Small Account $100",riskPct:3,maxTrades:2,minRR:3,minStrength:75,sessionFilter:false,correlationFilter:true,regimeFilter:true,volatilityFilter:false,mtfFilter:false,autoMode:"SEMI-AUTO",useTrail:true,trailType:"ATR",trailAtr:1.5,useBE:true,tp1Pct:40,tp2Pct:30,tp3Pct:30,dailyLoss:6}},
                  {n:"NEXUS Apex",s:{name:"NEXUS Apex",riskPct:1,maxTrades:2,minRR:3,minStrength:80,sessionFilter:true,correlationFilter:true,regimeFilter:true,volatilityFilter:true,mtfFilter:true,autoMode:"SEMI-AUTO",useTrail:true,trailType:"ATR",trailAtr:1.5,useBE:true,tp1Pct:40,tp2Pct:40,tp3Pct:20,dailyLoss:3,sizingMode:"kelly",maxKellyRisk:3}},
                ].map(({n,s})=>(
                  <button key={n} onClick={()=>setStrategy(prev=>({...prev,...s}))} style={{padding:"8px 6px",borderRadius:5,border:"1px solid "+(strategy.name===s.name?C.cyan:C.border),background:strategy.name===s.name?C.cyanDim:C.bg2,color:strategy.name===s.name?C.cyan:C.slate,cursor:"pointer",fontSize:9,fontFamily:"monospace",fontWeight:strategy.name===s.name?700:400}}>{n}</button>
                ))}
              </div>
              <div style={{marginBottom:10}}>
                <div style={{color:C.slate,fontSize:9,marginBottom:4}}>Strategy Name</div>
                <input value={strategy.name||""} onChange={e=>setStrategy(s=>({...s,name:e.target.value}))} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"9px 12px",fontFamily:"monospace",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                {[["Min Strength %","minStrength",72],["Min R:R","minRR",2.5],["Risk per Trade %","riskPct",1.5],["Max Trades/Day","maxTrades",3],["Daily Loss Limit %","dailyLoss",5]].map(([l,k,d])=>(
                  <div key={k}>
                    <div style={{color:C.slate,fontSize:9,marginBottom:4}}>{l}</div>
                    <input type="number" step="0.5" value={strategy[k]||d} onChange={e=>setStrategy(s=>({...s,[k]:parseFloat(e.target.value)||d}))} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"8px 10px",fontFamily:"monospace",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                ))}
                <div>
                  <div style={{color:C.slate,fontSize:9,marginBottom:4}}>Auto Mode</div>
                  <select value={strategy.autoMode||"SEMI-AUTO"} onChange={e=>setStrategy(s=>({...s,autoMode:e.target.value}))} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,color:C.white,padding:"8px 10px",borderRadius:4,fontSize:11,fontFamily:"monospace"}}>
                    <option value="OFF">OFF</option>
                    <option value="SEMI-AUTO">SEMI-AUTO</option>
                    <option value="FULL-AUTO">FULL-AUTO</option>
                  </select>
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{color:C.cyan,fontSize:10,fontWeight:700,marginBottom:8}}>Position Sizing Mode</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                  {[["fixed","Fixed Risk %"],["kelly","Kelly Criterion"]].map(([m,l])=>(
                    <button key={m} onClick={()=>setStrategy(s=>({...s,sizingMode:m}))} style={{padding:"9px 0",borderRadius:5,border:"1px solid "+(strategy.sizingMode===m?C.gold:C.border),background:strategy.sizingMode===m?C.goldDim:C.bg2,color:strategy.sizingMode===m?C.gold:C.slate,cursor:"pointer",fontSize:10,fontFamily:"monospace",fontWeight:strategy.sizingMode===m?700:400}}>{l}</button>
                  ))}
                </div>
                {strategy.sizingMode==="kelly"&&<div style={{background:C.bg2,borderRadius:5,padding:10,marginBottom:8}}>
                  <div style={{color:C.slate,fontSize:9,marginBottom:4}}>Max Kelly Risk Cap %</div>
                  <input type="number" step="0.5" value={strategy.maxKellyRisk||5} onChange={e=>setStrategy(s=>({...s,maxKellyRisk:parseFloat(e.target.value)||5}))} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"7px 9px",fontFamily:"monospace",fontSize:11,outline:"none",boxSizing:"border-box"}}/>
                  <div style={{color:C.dimText,fontSize:8,marginTop:6,lineHeight:1.6}}>Position size will be calculated using half-Kelly from your actual win rate (min 10 trades needed, defaults to 60% assumed win rate until then), capped at this max %.</div>
                </div>}
              </div>
              <div style={{marginBottom:12}}>
                <div style={{color:C.cyan,fontSize:10,fontWeight:700,marginBottom:8}}>Trailing Stop & Take Profit</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                  <div onClick={()=>setStrategy(s=>({...s,useTrail:!s.useTrail}))} style={{background:strategy.useTrail?C.greenDim:C.bg2,border:"1px solid "+(strategy.useTrail?C.green:C.border),borderRadius:6,padding:"8px 10px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{color:strategy.useTrail?C.green:C.slate,fontSize:9,fontWeight:700}}>Trailing Stop</div><div style={{color:C.dimText,fontSize:8}}>Follows price</div></div>
                    <div style={{width:36,height:20,borderRadius:10,background:strategy.useTrail?C.green:C.bg3,position:"relative"}}><div style={{position:"absolute",top:3,left:strategy.useTrail?18:3,width:14,height:14,borderRadius:"50%",background:strategy.useTrail?C.white:C.slate,transition:"all 0.2s"}}/></div>
                  </div>
                  <div onClick={()=>setStrategy(s=>({...s,useBE:!s.useBE}))} style={{background:strategy.useBE?C.greenDim:C.bg2,border:"1px solid "+(strategy.useBE?C.green:C.border),borderRadius:6,padding:"8px 10px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{color:strategy.useBE?C.green:C.slate,fontSize:9,fontWeight:700}}>Breakeven at TP1</div><div style={{color:C.dimText,fontSize:8}}>SL moves to entry</div></div>
                    <div style={{width:36,height:20,borderRadius:10,background:strategy.useBE?C.green:C.bg3,position:"relative"}}><div style={{position:"absolute",top:3,left:strategy.useBE?18:3,width:14,height:14,borderRadius:"50%",background:strategy.useBE?C.white:C.slate,transition:"all 0.2s"}}/></div>
                  </div>
                </div>
                {strategy.useTrail&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                  <div>
                    <div style={{color:C.slate,fontSize:9,marginBottom:4}}>Trail Type</div>
                    <select value={strategy.trailType||"ATR"} onChange={e=>setStrategy(s=>({...s,trailType:e.target.value}))} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,color:C.white,padding:"6px 8px",borderRadius:4,fontSize:10,fontFamily:"monospace"}}>
                      <option value="ATR">ATR based</option>
                      <option value="PCT">Percentage</option>
                    </select>
                  </div>
                  <div>
                    <div style={{color:C.slate,fontSize:9,marginBottom:4}}>{strategy.trailType==="PCT"?"Trail %":"ATR Multiplier"}</div>
                    <input type="number" step="0.1" value={strategy.trailType==="PCT"?strategy.trailPct||1.5:strategy.trailAtr||2} onChange={e=>setStrategy(s=>({...s,[s.trailType==="PCT"?"trailPct":"trailAtr"]:parseFloat(e.target.value)}))} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,color:C.white,padding:"6px 8px",borderRadius:4,fontSize:12,fontFamily:"monospace",outline:"none",boxSizing:"border-box"}}/>
                  </div>
                </div>}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                  {[["TP1 Close %","tp1Pct",40],["TP2 Close %","tp2Pct",40],["Remainder %","tp3Pct",20]].map(([l,k,d])=>(
                    <div key={k}><div style={{color:C.slate,fontSize:8,marginBottom:3}}>{l}</div><input type="number" value={strategy[k]||d} onChange={e=>setStrategy(s=>({...s,[k]:parseFloat(e.target.value)}))} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,color:C.white,padding:"5px 6px",borderRadius:4,fontSize:11,fontFamily:"monospace",outline:"none",boxSizing:"border-box"}}/></div>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{color:C.cyan,fontSize:10,fontWeight:700,marginBottom:8}}>Smart Filters</div>
                {[{k:"sessionFilter",l:"Session Filter — London/NY/Asia"},{k:"correlationFilter",l:"Correlation Filter"},{k:"volatilityFilter",l:"Volatility Filter"},{k:"mtfFilter",l:"MTF Confirmation Required"},{k:"regimeFilter",l:"Regime Filter — trend only"}].map(({k,l})=>(
                  <div key={k} onClick={()=>setStrategy(s=>({...s,[k]:!s[k]}))} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:strategy[k]?C.cyanDim:C.bg3,borderRadius:5,marginBottom:5,cursor:"pointer",border:"1px solid "+(strategy[k]?C.cyan:C.border)}}>
                    <span style={{color:strategy[k]?C.cyan:C.slate,fontSize:10}}>{l}</span>
                    <div style={{width:36,height:20,borderRadius:10,background:strategy[k]?C.cyan:C.bg3,border:"1px solid "+(strategy[k]?C.cyan:C.border),position:"relative",flexShrink:0}}><div style={{position:"absolute",top:3,left:strategy[k]?18:3,width:14,height:14,borderRadius:"50%",background:strategy[k]?C.white:C.slate,transition:"all 0.2s"}}/></div>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:12}}>
                <div style={{color:C.cyan,fontSize:10,fontWeight:700,marginBottom:8}}>Active Pairs ({activePairs.length})</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                  {activePairs.map(p=><div key={p} onClick={()=>setActivePairs(prev=>prev.filter(x=>x!==p))} style={{padding:"3px 8px",borderRadius:4,background:C.bg2,border:"1px solid "+C.border,color:C.slate,fontSize:9,cursor:"pointer"}}>{p} ✕</div>)}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {DEFAULT_PAIRS.filter(p=>!activePairs.includes(p)).map(p=><div key={p} onClick={()=>setActivePairs(prev=>[...prev,p])} style={{padding:"3px 8px",borderRadius:4,background:C.bg3,border:"1px solid "+C.border+"66",color:C.dimText,fontSize:9,cursor:"pointer"}}>+ {p}</div>)}
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{color:C.cyan,fontSize:10,fontWeight:700,marginBottom:8}}>Per-Pair Strategy Overrides</div>
                <div style={{color:C.dimText,fontSize:9,marginBottom:8}}>Give any pair its own risk%, min strength, or min R:R instead of using the global strategy above.</div>
                {activePairs.map(p=>{
                  const ov=(strategy.pairOverrides||{})[p];
                  const enabled=!!ov;
                  return(
                    <div key={p} style={{background:C.bg2,borderRadius:5,padding:"8px 10px",marginBottom:6,border:"1px solid "+(enabled?C.gold:C.border)}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>{
                        setStrategy(s=>{
                          const po={...(s.pairOverrides||{})};
                          if(po[p])delete po[p];
                          else po[p]={riskPct:s.riskPct,minStrength:s.minStrength,minRR:s.minRR};
                          return{...s,pairOverrides:po};
                        });
                      }}>
                        <span style={{color:enabled?C.gold:C.white,fontSize:10,fontWeight:700}}>{p}</span>
                        <div style={{width:32,height:18,borderRadius:9,background:enabled?C.gold:C.bg3,border:"1px solid "+(enabled?C.gold:C.border),position:"relative"}}><div style={{position:"absolute",top:2,left:enabled?16:2,width:12,height:12,borderRadius:"50%",background:enabled?"#000":C.slate,transition:"all 0.2s"}}/></div>
                      </div>
                      {enabled&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:8}}>
                        {[["Risk %","riskPct"],["Min Str %","minStrength"],["Min R:R","minRR"]].map(([l,k])=>(
                          <div key={k}>
                            <div style={{color:C.dimText,fontSize:8,marginBottom:3}}>{l}</div>
                            <input type="number" step="0.1" value={ov[k]} onChange={e=>{
                              const val=parseFloat(e.target.value)||0;
                              setStrategy(s=>({...s,pairOverrides:{...(s.pairOverrides||{}),[p]:{...(s.pairOverrides||{})[p],[k]:val}}}));
                            }} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:3,color:C.white,padding:"4px 6px",fontFamily:"monospace",fontSize:10,outline:"none",boxSizing:"border-box"}}/>
                          </div>
                        ))}
                      </div>}
                    </div>
                  );
                })}
              </div>
              <button onClick={saveStrategy} style={{width:"100%",padding:"14px 0",borderRadius:6,border:savedMsg?"2px solid "+C.green:"none",cursor:"pointer",background:savedMsg?C.greenDim:C.cyan,color:savedMsg?C.green:"#000",fontWeight:700,fontFamily:"monospace",fontSize:14,transition:"all 0.15s"}}>{savedMsg?"✓ STRATEGY SAVED":"SAVE STRATEGY"}</button>
              {saveError&&<div style={{marginTop:8,padding:"8px 10px",background:C.redDim,border:"1px solid "+C.red+"44",borderRadius:5,color:C.red,fontSize:10}}>{saveError}</div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:14,fontWeight:700}}>◈ KELLY CRITERION</div>
                {(()=>{
                  const th=isDemo?lLoad("demo_history_"+(uid||""),[]):lLoad("live_history_"+(uid||""),[]);
                  const wins=th.filter(t=>t.pnl>0).length;
                  const winRate=th.length>0?(wins/th.length)*100:50;
                  const kelly=calcKellySize(winRate,parseFloat(strategy.minRR)||2.5,currentBalance,5);
                  return(
                    <div>
                      {[["Win Rate (actual)",Math.round(winRate)+"%",winRate>=50?C.green:C.red],["R:R Setting",fmt(strategy.minRR||2.5,1)+"x",C.white],["Full Kelly",fmt(kelly.kelly*100,1)+"%",kelly.kelly>0?C.green:C.red],["Half Kelly (safe)",fmt(kelly.halfKelly*100,1)+"%",kelly.halfKelly>0?C.green:C.red],["Recommended Risk",fmt(kelly.riskPct,1)+"%",kelly.recommended?C.green:C.red],["Risk Amount",fmtUSD(kelly.riskAmount),kelly.recommended?C.green:C.slate],["Based on",th.length+" trades",C.slate]].map(([l,v,c])=>(
                        <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+C.border+"22"}}><span style={{color:C.slate,fontSize:10}}>{l}</span><span style={{color:c,fontSize:11,fontWeight:700}}>{v}</span></div>
                      ))}
                      <div style={{background:C.goldDim,border:"1px solid "+C.gold+"33",borderRadius:5,padding:"8px 10px",marginTop:10}}>
                        <div style={{color:C.gold,fontSize:9,lineHeight:1.6}}>Kelly uses your actual win rate and R:R to calculate optimal position size. Half-Kelly reduces variance and is recommended for safety.</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:12,fontWeight:700}}>◈ CORRELATION MATRIX</div>
                <div style={{color:C.dimText,fontSize:9,marginBottom:10}}>Red {">"} 0.7 = highly correlated — avoid trading both simultaneously.</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{borderCollapse:"collapse",fontSize:8,width:"100%"}}>
                    <thead><tr><th style={{padding:"4px 6px",color:C.dimText,textAlign:"left"}}></th>{activePairs.slice(0,6).map(p=><th key={p} style={{padding:"4px 6px",color:C.slate,textAlign:"center"}}>{p.split("/")[0]}</th>)}</tr></thead>
                    <tbody>
                      {activePairs.slice(0,6).map(pA=>(
                        <tr key={pA}>
                          <td style={{padding:"4px 6px",color:C.slate,fontWeight:700}}>{pA.split("/")[0]}</td>
                          {activePairs.slice(0,6).map(pB=>{
                            if(pA===pB)return <td key={pB} style={{padding:"4px 6px",background:C.bg3,textAlign:"center",color:C.dimText}}>—</td>;
                            const corr=calcPairCorrelation((candleData[pA]||[]).map(c=>c.close),(candleData[pB]||[]).map(c=>c.close));
                            const col=corr>0.7?C.red:corr>0.4?C.gold:corr<-0.3?C.green:C.slate;
                            return <td key={pB} style={{padding:"4px 6px",background:col+"22",textAlign:"center",color:col,fontWeight:700}}>{fmt(corr,2)}</td>;
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:12,fontWeight:700}}>◈ LIVE SIGNAL STATUS</div>
                {[["Session",isTradingSession()?"ACTIVE":"CLOSED",isTradingSession()?C.green:C.slate],["Regime",(sig?.advRegime?.regime||"?").replace("_"," "),(sig?.advRegime?.tradeable)?C.green:C.red],["MTF",(sig?.mtfBias?.bias||"neutral").toUpperCase()+(sig?.mtfBias?.confirmed?" ✓":""),sig?.mtfBias?.confirmed?C.cyan:C.slate],["Signal",sig?.direction||"—",sig?.direction?.includes("BUY")?C.green:sig?.direction?.includes("SELL")?C.red:C.slate],["Strength",sig?Math.round(sig.strength)+"%":"—",sig?.strength>=70?C.green:sig?.strength>=50?C.gold:C.red],["Auto Mode",strategy.autoMode,strategy.autoMode==="FULL-AUTO"?C.green:strategy.autoMode==="SEMI-AUTO"?C.cyan:C.red],["Walk-Forward",strategy.walkForwardConsistency!==undefined?strategy.walkForwardConsistency+"% consistent":"Not tested",strategy.walkForwardConsistency===undefined?C.slate:strategy.walkForwardConsistency>=75?C.green:strategy.walkForwardConsistency>=50?C.gold:C.red],["Ruin Risk",strategy.monteCarloProbRuin!==undefined?strategy.monteCarloProbRuin+"%":"Not tested",strategy.monteCarloProbRuin===undefined?C.slate:strategy.monteCarloProbRuin<5?C.green:strategy.monteCarloProbRuin<15?C.gold:C.red]].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+C.border+"22"}}><span style={{color:C.slate,fontSize:10}}>{l}</span><span style={{color:c,fontSize:11,fontWeight:700}}>{v}</span></div>
                ))}
                {(strategy.walkForwardConsistency!==undefined||strategy.monteCarloProbRuin!==undefined)&&<div style={{background:C.purpleDim,border:"1px solid "+C.purple+"33",borderRadius:5,padding:"8px 10px",marginTop:10}}>
                  <div style={{color:C.purple,fontSize:9,lineHeight:1.6}}>Robustness scores are active — auto-trading will automatically reduce position size (or pause) when this strategy's Walk-Forward consistency or Monte Carlo ruin risk indicates it isn't reliable. Re-run and re-apply after any strategy changes.</div>
                </div>}
              </div>
            </div>
          </div>
        )}

        {tab==="aichat"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
            <AIChatPanel signals={signals} prices={prices} openOrders={openOrders} tradeHistory={isDemo?lLoad("demo_history_"+(uid||""),[]):lLoad("live_history_"+(uid||""),[])} portfolio={portfolio} isDemo={isDemo} selectedPair={selectedPair} strategy={strategy} apiKey={apiKey}/>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,fontWeight:700,marginBottom:12,letterSpacing:"0.1em"}}>◈ QUICK STATS FOR {selectedPair}</div>
                {sig&&[["Signal",sig.direction,sig.direction.includes("BUY")?C.green:sig.direction.includes("SELL")?C.red:C.slate],["Strength",Math.round(sig.strength)+"%",sig.strength>=70?C.green:sig.strength>=50?C.gold:C.red],["Regime",(sig.advRegime?.regime||"?").replace("_"," "),sig.advRegime?.tradeable?C.green:C.red],["MTF",(sig.mtfBias?.bias||"neutral").toUpperCase()+(sig.mtfBias?.confirmed?" ✓":""),sig.mtfBias?.confirmed?C.cyan:C.slate],["Session",sig.sessionProfile?.isHighProbability?"HOT 🔥":"Normal",sig.sessionProfile?.isHighProbability?C.gold:C.slate],["R:R",fmt(sig.riskReward||0,2)+"x",sig.riskReward>=2?C.green:C.gold],["Entry",fmtUSD(sig.entry),C.white],["Stop Loss",fmtUSD(sig.stopLoss),C.red],["TP1",fmtUSD(sig.tp1),C.green],["TP2",fmtUSD(sig.tp2),C.green]].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+C.border+"22"}}><span style={{color:C.slate,fontSize:10}}>{l}</span><span style={{color:c,fontSize:10,fontWeight:700}}>{v}</span></div>
                ))}
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,fontWeight:700,marginBottom:10}}>◈ SUGGESTED QUESTIONS</div>
                {["What's the best trade right now?","Analyse my open positions","Is now a good time to trade?","What's my win rate and expectancy?","Should I trade BTC right now?","What pairs should I avoid?","Explain the current market regime","How should I adjust my strategy?"].map((q,i)=>(
                  <div key={i} style={{color:C.slate,fontSize:10,padding:"5px 0",borderBottom:"1px solid "+C.border+"22",cursor:"pointer"}} onClick={()=>{}}>{i+1}. {q}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==="screener"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:8,marginBottom:14}}>
              {["STRONG BUY","BUY","NEUTRAL","SELL","STRONG SELL"].map(d=>{const count=activePairs.filter(p=>signals[p]?.direction===d).length;const color=d.includes("BUY")?C.green:d==="NEUTRAL"?C.slate:C.red;return<div key={d} style={{background:C.bg1,border:"1px solid "+color+"44",borderRadius:7,padding:12,textAlign:"center"}}><div style={{color,fontSize:22,fontWeight:700}}>{count}</div><div style={{color:C.slate,fontSize:9,marginTop:3}}>{d}</div></div>;})}
            </div>
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,overflow:"hidden"}}>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:1100}}>
                  <thead><tr style={{background:C.bg2}}>{["PAIR","PRICE","SIGNAL","STR%","R:R","REGIME","MTF","SESSION","SUPPORT","RESIST","DIV","TRADE"].map(h=><th key={h} style={{padding:"7px 8px",color:C.slate,fontSize:8,textAlign:"left",fontWeight:400,borderBottom:"1px solid "+C.border,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                  <tbody>{activePairs.map(p=>{
                    const px=prices[p]||BASE_PRICES[p]||1;const s=signals[p];if(!s)return null;
                    return(<tr key={p} onClick={()=>{setSelectedPair(p);setTab("dashboard");}} style={{borderBottom:"1px solid "+C.border+"22",cursor:"pointer"}}>
                      <td style={{padding:"7px 8px",color:C.white,fontSize:10,fontWeight:700}}>{p}</td>
                      <td style={{padding:"7px 8px",color:C.white,fontSize:9}}>{fmtUSD(px)}</td>
                      <td style={{padding:"7px 8px"}}><SignalBadge direction={s.direction}/></td>
                      <td style={{padding:"7px 8px"}}><div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:32,height:3,background:C.bg3,borderRadius:2}}><div style={{width:s.strength+"%",height:"100%",background:s.direction.includes("BUY")?C.green:s.direction==="NEUTRAL"?C.slate:C.red,borderRadius:2}}/></div><span style={{color:C.slate,fontSize:8}}>{Math.round(s.strength)}</span></div></td>
                      <td style={{padding:"7px 8px",color:s.rsi<35?C.green:s.rsi>70?C.red:C.white,fontSize:9}}>{fmt(s.rsi,1)}</td>
                      <td style={{padding:"7px 8px",color:s.adx.adx>25?C.cyan:C.slate,fontSize:9}}>{fmt(s.adx.adx,0)}</td>
                      <td style={{padding:"7px 8px",color:s.hist>0?C.green:C.red,fontSize:9}}>{s.hist>0?"▲":"▼"}</td>
                      <td style={{padding:"7px 8px",color:s.supertrend.trend==="up"?C.green:C.red,fontSize:9}}>{s.supertrend.trend==="up"?"▲":"▼"}</td>
                      <td style={{padding:"7px 8px",fontSize:9}}>{s.divergence.bullish?<span style={{color:C.green}}>⚡B</span>:s.divergence.bearish?<span style={{color:C.red}}>⚡S</span>:<span style={{color:C.dimText}}>-</span>}</td>
                      <td style={{padding:"7px 8px",color:C.gold,fontSize:8}}>{s.patternData?.patterns?.length>0?s.patternData.patterns[0].name.split(" ")[0]:"-"}</td>
                      <td style={{padding:"7px 8px"}}>{s.regime&&<span style={{color:s.regime.color,fontSize:8}}>{s.regime.icon} {s.regime.regime?.split("_")[0]}</span>}</td>
                      <td style={{padding:"7px 8px",color:s.riskReward>=2?C.green:C.gold,fontSize:9,fontWeight:700}}>1:{fmt(s.riskReward,1)}</td>
                      <td style={{padding:"7px 8px",color:C.cyan,fontSize:8}}>{fmtUSD(s.entry)}</td>
                      <td style={{padding:"7px 8px",color:C.red,fontSize:8}}>{fmtUSD(s.stopLoss)}</td>
                      <td style={{padding:"7px 8px",color:C.green,fontSize:8}}>{fmtUSD(s.tp1)}</td>
                      <td style={{padding:"7px 8px"}}><button onClick={e=>{e.stopPropagation();setSelectedPair(p);setShowOrderModal(true);}} style={{background:C.cyanDim,border:"1px solid "+C.cyan,color:C.cyan,padding:"3px 8px",borderRadius:3,cursor:"pointer",fontSize:9}}>TRADE</button></td>
                    </tr>);
                  })}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab==="intelligence"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
            <MarketIntelPanel signals={signals} prices={prices} activePairs={activePairs} candleData={candleData}/>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:12,fontWeight:700}}>◈ REGIME BREAKDOWN</div>
                {activePairs.map(p=>{const s=signals[p];if(!s?.regime)return null;return(
                  <div key={p} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid "+C.border+"22"}}>
                    <span style={{color:C.white,fontSize:11,fontWeight:700,minWidth:100}}>{p}</span>
                    <span style={{color:s.regime.color,fontSize:10}}>{s.regime.icon} {s.regime.regime?.replace("_"," ")}</span>
                    <div style={{width:50,height:3,background:C.bg3,borderRadius:2}}><div style={{width:s.regime.confidence+"%",height:"100%",background:s.regime.color,borderRadius:2}}/></div>
                  </div>
                );})}
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:12,fontWeight:700}}>◈ PATTERN SUMMARY</div>
                {activePairs.map(p=>{const s=signals[p];if(!s?.patternData?.patterns?.length)return null;return(
                  <div key={p} style={{marginBottom:8}}>
                    <span style={{color:C.white,fontSize:11,fontWeight:700}}>{p}: </span>
                    {s.patternData.patterns.map((pat,i)=>(<span key={i} style={{display:"inline-block",background:pat.type==="bullish"?C.greenDim:pat.type==="bearish"?C.redDim:C.bg3,border:"1px solid "+(pat.type==="bullish"?C.green:pat.type==="bearish"?C.red:C.border),color:pat.type==="bullish"?C.green:pat.type==="bearish"?C.red:C.slate,padding:"2px 8px",borderRadius:4,fontSize:9,marginRight:4,marginBottom:4}}>{pat.name}</span>))}
                  </div>
                );})}
                {activePairs.every(p=>!signals[p]?.patternData?.patterns?.length)&&<div style={{color:C.dimText,fontSize:11,textAlign:"center",padding:20}}>No patterns detected</div>}
              </div>
            </div>
          </div>
        )}

        {tab==="analytics"&&(()=>{
          const th=isDemo?lLoad("demo_history_"+(uid||""),[]):lLoad("live_history_"+(uid||""),[]);
          const modeOrders=openOrders.filter(o=>o.isDemo===isDemo);
          const wins=th.filter(t=>t.pnl>0);
          const losses=th.filter(t=>t.pnl<=0);
          const totalPnl=th.reduce((a,t)=>a+(t.pnl||0),0);
          const totalWon=wins.reduce((a,t)=>a+(t.pnl||0),0);
          const totalLost=Math.abs(losses.reduce((a,t)=>a+(t.pnl||0),0));
          const winRate=th.length>0?Math.round((wins.length/th.length)*100):0;
          const profitFactor=totalLost>0?Math.round((totalWon/totalLost)*100)/100:totalWon>0?99:0;
          const openPnl=modeOrders.reduce((sum,o)=>{const cur=getPrice(o.pair);return sum+(cur-o.price)*o.qty*(o.side==="SELL"?-1:1)*(o.leverage||1);},0);
          const sharpe=calcSharpeRatio(th);
          const sortino=calcSortinoRatio(th);
          const maxDD=calcMaxDrawdown(th);
          const streaks=calcStreaks(th);
          const curve=buildEquityCurve(th,isDemo?50000:liveBalance||1000);
          const risk=checkRiskLimits(openOrders,th,currentBalance,strategy,isDemo);
          const portfolioVaR=calcPortfolioVaR(openOrders,candleData,currentBalance,isDemo);
          const kelly=calcKellySize(winRate||50,parseFloat(strategy.minRR)||2.5,currentBalance,5);
          const autoTrades=th.filter(t=>t.autoPlaced);
          const avgWin=wins.length>0?totalWon/wins.length:0;
          const avgLoss=losses.length>0?totalLost/losses.length:0;
          const expectancy=th.length>0?totalPnl/th.length:0;
          const curveMin=curve.length>1?Math.min(...curve.map(c=>c.y)):0;
          const curveMax=curve.length>1?Math.max(...curve.map(c=>c.y)):currentBalance;
          const curveRange=curveMax-curveMin||1;
          return(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {risk.warnings.length>0&&<div style={{background:C.redDim,border:"1px solid "+C.red+"44",borderRadius:8,padding:12}}>
                <div style={{color:C.red,fontSize:11,fontWeight:700,marginBottom:6}}>⚠ RISK ALERTS</div>
                {risk.warnings.map((w,i)=><div key={i} style={{color:C.gold,fontSize:10,marginBottom:3}}>{w}</div>)}
              </div>}
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:16}}>
                <div style={{color:C.cyan,fontSize:11,fontWeight:700,marginBottom:12,letterSpacing:"0.1em"}}>◈ EQUITY CURVE</div>
                {curve.length>1?(
                  <svg width="100%" height={120} viewBox={"0 0 300 120"} style={{display:"block"}}>
                    <defs><linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={totalPnl>=0?C.green:C.red} stopOpacity={0.3}/><stop offset="100%" stopColor={totalPnl>=0?C.green:C.red} stopOpacity={0}/></linearGradient></defs>
                    {curve.map((p,i)=>{
                      if(i===0)return null;
                      const x1=(i-1)/(curve.length-1)*280+10;
                      const x2=i/(curve.length-1)*280+10;
                      const y1=100-((curve[i-1].y-curveMin)/curveRange)*90;
                      const y2=100-((p.y-curveMin)/curveRange)*90;
                      const col=p.pnl>=0?C.green:C.red;
                      return<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={1.5} opacity={0.9}/>;
                    })}
                    <line x1={10} x2={290} y1={100-((currentBalance-curveMin)/curveRange)*90} y2={100-((currentBalance-curveMin)/curveRange)*90} stroke={C.cyan} strokeWidth={0.5} strokeDasharray="3,3" opacity={0.5}/>
                    <text x={10} y={112} fill={C.dimText} fontSize={7} fontFamily="monospace">Start</text>
                    <text x={230} y={112} fill={totalPnl>=0?C.green:C.red} fontSize={7} fontFamily="monospace">{totalPnl>=0?"+":""}{fmtUSD(totalPnl)}</text>
                  </svg>
                ):<div style={{color:C.dimText,fontSize:10,textAlign:"center",padding:20}}>Complete trades to see equity curve</div>}
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:16}}>
                <div style={{color:C.cyan,fontSize:11,fontWeight:700,marginBottom:12,letterSpacing:"0.1em"}}>◈ PERFORMANCE STATS</div>
                {[
                  ["Total Trades",th.length,C.white],
                  ["Win Rate",winRate+"%",winRate>=50?C.green:C.red],
                  ["Profit Factor",fmt(profitFactor,2)+"x",profitFactor>=1.5?C.green:profitFactor>=1?C.gold:C.red],
                  ["Sharpe Ratio",fmt(sharpe,2),sharpe>=1?C.green:sharpe>=0?C.gold:C.red],
                  ["Sortino Ratio",fmt(sortino,2),sortino>=1?C.green:sortino>=0?C.gold:C.red],
                  ["Max Drawdown",fmtUSD(maxDD),maxDD<currentBalance*0.1?C.green:maxDD<currentBalance*0.2?C.gold:C.red],
                  ["Total P&L",fmtUSD(totalPnl),totalPnl>=0?C.green:C.red],
                  ["Open P&L",fmtUSD(openPnl),openPnl>=0?C.green:C.red],
                  ["Avg Win",avgWin>0?fmtUSD(avgWin):"-",C.green],
                  ["Avg Loss",avgLoss>0?fmtUSD(avgLoss):"-",C.red],
                  ["Expectancy per Trade",th.length>0?fmtUSD(expectancy):"-",expectancy>=0?C.green:C.red],
                  ["Best Win Streak",streaks.bestWin+" trades",streaks.bestWin>=3?C.green:C.slate],
                  ["Worst Loss Streak",streaks.worstLoss+" trades",streaks.worstLoss>=3?C.red:C.slate],
                  ["Current Streak",streaks.currentWin>0?"+"+streaks.currentWin+" wins":streaks.currentLoss>0?"-"+streaks.currentLoss+" losses":"—",streaks.currentWin>0?C.green:streaks.currentLoss>0?C.red:C.slate],
                  ["Auto Trade %",th.length>0?Math.round(autoTrades.length/th.length*100)+"%":"—",C.orange],
                  ["Kelly Risk",fmt(kelly.riskPct,1)+"%",kelly.recommended?C.green:C.slate],
                ].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+C.border+"22"}}>
                    <span style={{color:C.slate,fontSize:10}}>{l}</span>
                    <span style={{color:c,fontSize:11,fontWeight:700}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:16}}>
                <div style={{color:C.cyan,fontSize:11,fontWeight:700,marginBottom:12,letterSpacing:"0.1em"}}>◈ RISK MANAGER</div>
                {[
                  ["Daily P&L",fmtUSD(risk.dailyPnl),risk.dailyPnl>=0?C.green:C.red],
                  ["Daily Loss Limit",fmtUSD(risk.dailyLossLimit),C.slate],
                  ["Daily Loss Used",fmt(Math.abs(risk.dailyPnl)/risk.dailyLossLimit*100,0)+"%",Math.abs(risk.dailyPnl)/risk.dailyLossLimit>0.8?C.red:C.green],
                  ["Open Positions",risk.openPositions+"/"+strategy.maxTrades,risk.openPositions>=(strategy.maxTrades-1)?C.gold:C.green],
                  ["Account Exposure",fmt(risk.exposurePct,0)+"%",risk.exposurePct>60?C.red:risk.exposurePct>30?C.gold:C.green],
                  ["Daily Loss Limit Hit",risk.dailyLossHit?"YES — TRADING PAUSED":"NO",risk.dailyLossHit?C.red:C.green],
                ].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+C.border+"22"}}>
                    <span style={{color:C.slate,fontSize:10}}>{l}</span>
                    <span style={{color:c,fontSize:11,fontWeight:700}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:16}}>
                <div style={{color:C.cyan,fontSize:11,fontWeight:700,marginBottom:4,letterSpacing:"0.1em"}}>◈ PORTFOLIO VALUE AT RISK</div>
                <div style={{color:C.dimText,fontSize:9,marginBottom:12}}>Historical simulation using real price returns from your open pairs — not a hypothetical model.</div>
                {portfolioVaR.insufficientData&&<div style={{color:C.dimText,fontSize:11,textAlign:"center",padding:16}}>Not enough candle history yet to calculate VaR for open positions.</div>}
                {!portfolioVaR.insufficientData&&portfolioVaR.positions===0&&<div style={{color:C.dimText,fontSize:11,textAlign:"center",padding:16}}>No open positions — VaR is $0.</div>}
                {!portfolioVaR.insufficientData&&portfolioVaR.positions>0&&<>
                  {[
                    ["VaR (95% confidence)",fmtUSD(portfolioVaR.var95)+" ("+fmt(portfolioVaR.varPct95,1)+"%)",portfolioVaR.varPct95>15?C.red:portfolioVaR.varPct95>7?C.gold:C.green],
                    ["VaR (99% confidence)",fmtUSD(portfolioVaR.var99)+" ("+fmt(portfolioVaR.varPct99,1)+"%)",portfolioVaR.varPct99>20?C.red:portfolioVaR.varPct99>10?C.gold:C.green],
                    ["Worst Historical Scenario",fmtUSD(portfolioVaR.worstCase),C.red],
                    ["Based on",portfolioVaR.scenarioCount+" historical candles",C.slate],
                  ].map(([l,v,c])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+C.border+"22"}}>
                      <span style={{color:C.slate,fontSize:10}}>{l}</span>
                      <span style={{color:c,fontSize:11,fontWeight:700}}>{v}</span>
                    </div>
                  ))}
                  <div style={{background:C.goldDim,border:"1px solid "+C.gold+"33",borderRadius:5,padding:"8px 10px",marginTop:10}}>
                    <div style={{color:C.gold,fontSize:9,lineHeight:1.6}}>95% VaR means: based on how these pairs have actually moved historically, there's a 95% chance your portfolio won't lose more than {fmtUSD(portfolioVaR.var95)} in one candle period. The remaining 5% of the time, losses could exceed this.</div>
                  </div>
                </>}
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:16}}>
                <div style={{color:C.cyan,fontSize:11,fontWeight:700,marginBottom:12,letterSpacing:"0.1em"}}>◈ SIGNAL HEATMAP</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
                  {activePairs.map(p=>{
                    const s=signals[p];const px=prices[p]||BASE_PRICES[p];
                    const col=s?.direction.includes("BUY")?C.green:s?.direction.includes("SELL")?C.red:C.slate;
                    const opacity=s?Math.max(0.2,s.strength/100):0.1;
                    return(
                      <div key={p} onClick={()=>{setSelectedPair(p);setTab("dashboard");}} style={{background:col,opacity,borderRadius:4,padding:"6px 4px",textAlign:"center",cursor:"pointer",border:"1px solid "+col}}>
                        <div style={{color:"#000",fontSize:8,fontWeight:700,opacity:1/opacity}}>{p.split("/")[0]}</div>
                        <div style={{color:"#000",fontSize:7,opacity:1/opacity}}>{s?Math.round(s.strength)+"%":"—"}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:10,marginTop:8,justifyContent:"center"}}>
                  {[[C.green,"BUY"],[C.slate,"NEUTRAL"],[C.red,"SELL"]].map(([c,l])=>(
                    <div key={l} style={{display:"flex",gap:4,alignItems:"center"}}><div style={{width:10,height:10,borderRadius:2,background:c}}/><span style={{color:C.dimText,fontSize:8}}>{l}</span></div>
                  ))}
                </div>
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:16}}>
                <div style={{color:C.cyan,fontSize:11,fontWeight:700,marginBottom:12,letterSpacing:"0.1em"}}>◈ PAIR PERFORMANCE</div>
                {(()=>{
                  const pairStats={};
                  th.forEach(t=>{
                    if(!pairStats[t.pair])pairStats[t.pair]={pair:t.pair,pnl:0,trades:0,wins:0};
                    pairStats[t.pair].pnl+=t.pnl||0;
                    pairStats[t.pair].trades++;
                    if(t.pnl>0)pairStats[t.pair].wins++;
                  });
                  return Object.values(pairStats).sort((a,b)=>b.pnl-a.pnl).slice(0,8).map(ps=>(
                    <div key={ps.pair} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid "+C.border+"22"}}>
                      <span style={{color:C.white,fontSize:10,fontWeight:700,minWidth:90}}>{ps.pair}</span>
                      <span style={{color:C.slate,fontSize:9}}>{ps.trades}t {Math.round(ps.wins/ps.trades*100)}%wr</span>
                      <span style={{color:ps.pnl>=0?C.green:C.red,fontSize:11,fontWeight:700}}>{ps.pnl>=0?"+":""}{fmtUSD(ps.pnl)}</span>
                    </div>
                  ));
                })()}
                {th.length===0&&<div style={{color:C.dimText,fontSize:10,textAlign:"center",padding:10}}>No trades yet</div>}
              </div>
            </div>
          </div>
          );
        })()}

        {tab==="settings"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:14,fontWeight:700}}>◈ ANTHROPIC API KEY</div>
                <div style={{color:C.slate,fontSize:11,lineHeight:1.6,marginBottom:12}}>Required for live AI analysis. Get free at <span style={{color:C.cyan}}>console.anthropic.com</span></div>
                <input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="sk-ant-..." style={{width:"100%",background:C.bg3,border:"1px solid "+(apiKey?C.green:C.border),borderRadius:4,color:C.white,padding:"8px 12px",fontFamily:"monospace",fontSize:12,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
                {apiKey&&<div style={{color:C.green,fontSize:9,marginBottom:8}}>✓ API key entered</div>}
                <button onClick={saveApiKey} style={{width:"100%",padding:"10px 0",borderRadius:4,border:"1px solid "+C.cyan,background:C.cyanDim,color:C.cyan,cursor:"pointer",fontFamily:"monospace",fontSize:12,fontWeight:700,marginBottom:6}}>SAVE API KEY PERMANENTLY</button>
                {keySaved&&<div style={{textAlign:"center",color:C.green,fontSize:11}}>✓ Saved permanently to device</div>}
                <div style={{background:C.bg2,borderRadius:6,padding:10,marginTop:8,border:"1px solid "+C.gold+"44"}}><div style={{color:C.gold,fontSize:10,marginBottom:4}}>ℹ No API key?</div><div style={{color:C.slate,fontSize:10,lineHeight:1.6}}>Enable Demo Mode for free offline AI analysis. All signals, charts and indicators work without any key.</div></div>
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:14,fontWeight:700}}>◈ EXCHANGE CONNECTIONS</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                  {Object.entries(EXCHANGES).map(([key,ex])=>(
                    <div key={key} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 8px",borderRadius:4,background:exchangeKeys[key]?.apiKey?C.greenDim:C.bg2,border:"1px solid "+(exchangeKeys[key]?.apiKey?C.green:C.border)}}>
                      <span>{ex.logo}</span>
                      <span style={{color:exchangeKeys[key]?.apiKey?C.green:C.dimText,fontSize:9}}>{ex.name}</span>
                      {exchangeKeys[key]?.apiKey&&<span style={{color:C.green,fontSize:9}}>✓</span>}
                    </div>
                  ))}
                </div>
                <button onClick={()=>setShowExchangeModal(true)} style={{width:"100%",padding:"10px 0",borderRadius:4,border:"1px solid "+C.cyan,background:C.cyanDim,color:C.cyan,cursor:"pointer",fontFamily:"monospace",fontSize:11,fontWeight:700}}>MANAGE EXCHANGE CONNECTIONS</button>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:14,fontWeight:700}}>◈ ACCOUNT STATUS</div>
                {[["Account",user.email,C.white],["Database","Supabase — Permanent",C.green],["Auto Sync","Every 30 seconds",C.cyan],["Demo Mode",isDemo?"ON":"OFF",isDemo?C.purple:C.slate],["Auto Mode",strategy.autoMode,strategy.autoMode==="FULL-AUTO"?C.red:strategy.autoMode==="SEMI-AUTO"?C.cyan:C.slate],["Data Source",dataStatus,dataStatus==="binance"?C.green:dataStatus==="coingecko"?C.gold:C.slate],["Session",isTradingSession()?"Active":"Closed",isTradingSession()?C.green:C.slate],["Active Pairs",activePairs.length+" pairs",C.white],["Connected Exchanges",Object.values(exchangeKeys).filter(e=>e?.apiKey).length+" / "+Object.keys(EXCHANGES).length,C.cyan]].map(([k,v,c])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+C.border+"22"}}><span style={{color:C.slate,fontSize:11}}>{k}</span><span style={{color:c,fontSize:11,fontWeight:700,maxWidth:200,textAlign:"right",wordBreak:"break-all"}}>{v}</span></div>
                ))}
                <div style={{display:"flex",gap:8,marginTop:14}}>
                  <button onClick={syncToSupabase} style={{flex:1,padding:"9px 0",borderRadius:4,border:"1px solid "+C.cyan,background:C.cyanDim,color:C.cyan,cursor:"pointer",fontFamily:"monospace",fontSize:11,fontWeight:700}}>↑ SYNC</button>
                  <button onClick={handleSignOut} style={{flex:1,padding:"9px 0",borderRadius:4,border:"1px solid "+C.red,background:C.redDim,color:C.red,cursor:"pointer",fontFamily:"monospace",fontSize:11,fontWeight:700}}>SIGN OUT</button>
                </div>
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:12,fontWeight:700}}>◈ PAIRS & ALERTS</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,maxHeight:100,overflowY:"auto",marginBottom:10}}>
                  {activePairs.map(p=><div key={p} style={{display:"flex",alignItems:"center",gap:4,background:C.bg2,border:"1px solid "+C.border,borderRadius:4,padding:"3px 8px"}}><span style={{color:C.white,fontSize:9}}>{p}</span>{!DEFAULT_PAIRS.includes(p)&&<button onClick={()=>removePair(p)} style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:9}}>✕</button>}</div>)}
                </div>
                <button onClick={()=>setShowAddPair(true)} style={{width:"100%",padding:"8px 0",borderRadius:4,border:"1px solid "+C.cyan,background:C.cyanDim,color:C.cyan,cursor:"pointer",fontFamily:"monospace",fontSize:11,fontWeight:700,marginBottom:8}}>+ ADD PAIR</button>
                <button onClick={()=>setShowAlertsModal(true)} style={{width:"100%",padding:"8px 0",borderRadius:4,border:"1px solid "+C.gold,background:C.goldDim,color:C.gold,cursor:"pointer",fontFamily:"monospace",fontSize:11,fontWeight:700}}>🔔 MANAGE ALERTS ({alerts.length})</button>
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:14,fontWeight:700}}>◈ SERVER BOT — 24/7 Trading</div>
                <div style={{background:serverBot.enabled?C.greenDim:C.bg2,border:"1px solid "+(serverBot.enabled?C.green:C.border),borderRadius:8,padding:14,marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div>
                      <div style={{color:serverBot.enabled?C.green:C.white,fontSize:13,fontWeight:700}}>
                        {serverBot.enabled?"● BOT ACTIVE — Running 24/7":"○ BOT INACTIVE"}
                      </div>
                      <div style={{color:C.dimText,fontSize:9,marginTop:2}}>
                        {serverBot.lastRun?"Last run: "+new Date(serverBot.lastRun).toLocaleTimeString():"Never run"}
                      </div>
                    </div>
                    <div onClick={()=>toggleServerBot(!serverBot.enabled)} style={{width:52,height:28,borderRadius:14,background:serverBot.enabled?C.green:C.bg3,border:"1px solid "+(serverBot.enabled?C.green:C.border),cursor:"pointer",position:"relative",transition:"all 0.3s"}}>
                      <div style={{position:"absolute",top:3,left:serverBot.enabled?26:3,width:20,height:20,borderRadius:"50%",background:serverBot.enabled?C.white:C.slate,transition:"all 0.3s",boxShadow:"0 2px 4px rgba(0,0,0,0.3)"}}/>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={runBotNow} disabled={botRunning} style={{flex:1,padding:"8px 0",borderRadius:4,border:"1px solid "+C.cyan,background:botRunning?C.bg3:C.cyanDim,color:botRunning?C.slate:C.cyan,cursor:botRunning?"not-allowed":"pointer",fontFamily:"monospace",fontSize:10,fontWeight:700}}>{botRunning?"RUNNING...":"▶ RUN NOW"}</button>
                    <button onClick={()=>{supabase.from("server_trades").select("*").eq("user_id",uid).order("created_at",{ascending:false}).limit(50).then(({data})=>{if(data)setServerTrades(data);});}} style={{flex:1,padding:"8px 0",borderRadius:4,border:"1px solid "+C.border,background:C.bg3,color:C.slate,cursor:"pointer",fontFamily:"monospace",fontSize:10}}>↻ REFRESH</button>
                  </div>
                </div>
                <div style={{background:C.bg2,borderRadius:6,padding:10,marginBottom:12,border:"1px solid "+C.gold+"44"}}>
                  <div style={{color:C.gold,fontSize:10,fontWeight:700,marginBottom:6}}>◈ SERVER BOT STATUS</div>
                  {[
                    ["Bot Status",serverBot.enabled?"ENABLED":"DISABLED",serverBot.enabled?C.green:C.slate],
                    ["Exchange",activeExchange,C.cyan],
                    ["Active Pairs",activePairs.length+" pairs",C.white],
                    ["Strategy",strategy.name||"NEXUS Prime",C.white],
                    ["Min Strength",strategy.minStrength+"%",C.gold],
                    ["Server Trades",serverTrades.length+" total",C.white],
                    ["Open Server",serverTrades.filter(t=>t.status==="OPEN").length+" positions",serverTrades.filter(t=>t.status==="OPEN").length>0?C.gold:C.slate],
                    ["Notifications",notifications2.length+" unread",notifications2.length>0?C.gold:C.slate],
                  ].map(([k,v,c])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+C.border+"22"}}>
                      <span style={{color:C.slate,fontSize:10}}>{k}</span>
                      <span style={{color:c,fontSize:10,fontWeight:700}}>{v}</span>
                    </div>
                  ))}
                  {notifications2.length>0&&<button onClick={markNotifsRead} style={{width:"100%",padding:"6px 0",borderRadius:3,border:"1px solid "+C.gold,background:C.goldDim,color:C.gold,cursor:"pointer",fontFamily:"monospace",fontSize:9,marginTop:8}}>MARK ALL READ</button>}
                </div>
                {serverTrades.length>0&&<>
                  <div style={{color:C.cyan,fontSize:10,fontWeight:700,marginBottom:8}}>SERVER TRADE HISTORY</div>
                  <div style={{maxHeight:200,overflowY:"auto"}}>
                    {serverTrades.map(t=>{
                      const livePnl=t.status==="OPEN"
                        ?(getPrice(t.pair)-t.entry_price)*t.qty*(t.side==="BUY"?1:-1)
                        :(t.pnl||0);
                      return(
                        <div key={t.id} style={{background:C.bg2,borderRadius:5,padding:"8px 10px",marginBottom:5,border:"1px solid "+(t.status==="OPEN"?C.gold:livePnl>=0?C.green:C.red)+"33"}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                            <div style={{display:"flex",gap:6,alignItems:"center"}}>
                              <span style={{color:C.white,fontWeight:700,fontSize:11}}>{t.pair}</span>
                              <span style={{color:t.side==="BUY"?C.green:C.red,fontSize:10}}>{t.side}</span>
                              <Badge color={t.status==="OPEN"?C.gold:t.status.startsWith("TP")?C.green:t.status==="SL"?C.red:C.slate} small>{t.status}</Badge>
                            </div>
                            <span style={{color:livePnl>=0?C.green:C.red,fontSize:11,fontWeight:700}}>{livePnl>=0?"+":""}{fmtUSD(livePnl)}</span>
                          </div>
                          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                            <span style={{color:C.slate,fontSize:9}}>{t.qty} @ {fmtUSD(t.entry_price)}</span>
                            <span style={{color:C.dimText,fontSize:9}}>{t.signal_direction} {t.signal_strength}%</span>
                            <span style={{color:C.dimText,fontSize:9}}>{new Date(t.created_at).toLocaleTimeString()}</span>
                            {t.status==="OPEN"&&<span style={{color:C.cyan,fontSize:9}}>Now: {fmtUSD(getPrice(t.pair))}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>}
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:12,fontWeight:700}}>◈ DATA MANAGEMENT</div>
                <div style={{color:C.slate,fontSize:10,lineHeight:1.7,marginBottom:10}}>Clear all trading history and reset balances. This cannot be undone.</div>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <button onClick={()=>{if(window.confirm("Clear all DEMO trade history? Cannot be undone.")){setDemoTradeHistory([]);lSave("demo_history_"+uid,[]);setDemoBalance(50000);lSave("demo_bal_"+uid,50000);setDemoPortfolio({balance:50000,pnl:0,pnlPct:0,totalTrades:0,wins:0,losses:0,winRate:0,bestTrade:0,worstTrade:0,profitFactor:0,totalWinAmount:0,totalLossAmount:0});lSave("demo_port_"+uid,{balance:50000,pnl:0,pnlPct:0,totalTrades:0,wins:0,losses:0,winRate:0,bestTrade:0,worstTrade:0,profitFactor:0,totalWinAmount:0,totalLossAmount:0});setAutoLog([]);(async()=>{try{await supabase.from("trades").delete().eq("user_id",uid).eq("is_demo",true);}catch(e){}})();}}} style={{flex:1,padding:"8px 0",borderRadius:4,border:"1px solid "+C.purple,background:C.purpleDim,color:C.purple,cursor:"pointer",fontFamily:"monospace",fontSize:10,fontWeight:700}}>RESET DEMO DATA</button>
                  <button onClick={()=>{if(window.confirm("Clear all LIVE trade history? Cannot be undone.")){setLiveTradeHistory([]);lSave("live_history_"+uid,[]);setLiveBalance(0);lSave("live_bal_"+uid,0);setLivePortfolio({balance:0,pnl:0,pnlPct:0,totalTrades:0,wins:0,losses:0,winRate:0,bestTrade:0,worstTrade:0,profitFactor:0,totalWinAmount:0,totalLossAmount:0});lSave("live_port_"+uid,{balance:0,pnl:0,pnlPct:0,totalTrades:0,wins:0,losses:0,winRate:0,bestTrade:0,worstTrade:0,profitFactor:0,totalWinAmount:0,totalLossAmount:0});(async()=>{try{await supabase.from("trades").delete().eq("user_id",uid).eq("is_demo",false);}catch(e){}})();}}} style={{flex:1,padding:"8px 0",borderRadius:4,border:"1px solid "+C.red,background:C.redDim,color:C.red,cursor:"pointer",fontFamily:"monospace",fontSize:10,fontWeight:700}}>RESET LIVE DATA</button>
                </div>
                <div style={{background:C.goldDim,border:"1px solid "+C.gold+"44",borderRadius:4,padding:"8px 10px"}}>
                  <div style={{color:C.gold,fontSize:9}}>⚠ Resetting demo data gives you a fresh $50,000 demo balance. Resetting live data clears all live trade history.</div>
                </div>
              </div>
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
                <div style={{color:C.cyan,fontSize:11,letterSpacing:"0.1em",marginBottom:10,fontWeight:700}}>◈ PHONE & PWA</div>
                <div style={{color:C.slate,fontSize:11,lineHeight:1.9}}>
                  <div><span style={{color:C.gold}}>iPhone:</span> Safari → Share → Add to Home Screen</div>
                  <div><span style={{color:C.gold}}>Android:</span> Chrome → Menu → Install App</div>
                  <div><span style={{color:C.gold}}>Landscape:</span> Rotate for wider chart view</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alerts Modal */}
        {tab==="dca"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{color:C.cyan,fontSize:11,fontWeight:700,letterSpacing:"0.1em"}}>◈ DCA CALCULATOR</div>
                <select value={selectedPair} onChange={e=>setSelectedPair(e.target.value)} style={{background:C.bg3,border:"1px solid "+C.cyan,color:C.cyan,padding:"4px 8px",borderRadius:4,fontSize:10,fontFamily:"monospace"}}>
                  {activePairs.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{color:C.dimText,fontSize:10,marginBottom:14}}>Dollar Cost Average — automatically calculate entry levels for scaling into a position safely.</div>
              {(()=>{
                // DCA state moved to parent - use simple local vars
                const dcaEntry=prices[selectedPair]||BASE_PRICES[selectedPair]||1;
                const dcaDrop=5;const dcaLevels=5;const dcaAmount=100;
                const levels=calcDCALevels(dcaEntry,dcaDrop,dcaLevels,dcaAmount);
                // Uses selectedPair — change pair from the left panel or pair selector
                return(
                  <div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                      <div><div style={{color:C.slate,fontSize:9,marginBottom:4}}>Entry Price</div><div style={{color:C.cyan,fontSize:14,fontWeight:700,padding:"7px 0"}}>{fmtUSD(dcaEntry)}</div></div>
                      <div><div style={{color:C.slate,fontSize:9,marginBottom:4}}>Drop % per level</div><div style={{color:C.white,fontSize:14,fontWeight:700,padding:"7px 0"}}>{dcaDrop}%</div></div>
                      <div><div style={{color:C.slate,fontSize:9,marginBottom:4}}>Levels</div><div style={{color:C.white,fontSize:14,fontWeight:700,padding:"7px 0"}}>{dcaLevels}</div></div>
                      <div><div style={{color:C.slate,fontSize:9,marginBottom:4}}>Base Amount</div><div style={{color:C.white,fontSize:14,fontWeight:700,padding:"7px 0"}}>${dcaAmount}</div></div>
                    </div>
                    <div style={{overflowX:"auto"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:9}}>
                        <thead><tr style={{background:C.bg2}}>{["Level","Price","Amount","Units","Avg Price","Total Invested"].map(h=><th key={h} style={{padding:"6px 8px",color:C.dimText,textAlign:"left"}}>{h}</th>)}</tr></thead>
                        <tbody>
                          {levels.map(l=>(
                            <tr key={l.level} style={{borderBottom:"1px solid "+C.border+"22",background:l.level===1?C.cyanDim:"transparent"}}>
                              <td style={{padding:"6px 8px",color:l.level===1?C.cyan:C.white,fontWeight:700}}>#{l.level}</td>
                              <td style={{padding:"6px 8px",color:C.white}}>{fmtUSD(l.price)}</td>
                              <td style={{padding:"6px 8px",color:C.gold}}>${fmt(l.amount,0)}</td>
                              <td style={{padding:"6px 8px",color:C.slate}}>{fmt(l.units,4)}</td>
                              <td style={{padding:"6px 8px",color:C.cyan}}>{fmtUSD(l.avgPrice)}</td>
                              <td style={{padding:"6px 8px",color:C.white}}>${fmt(l.totalInvested,0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {levels.length>0&&<div style={{background:C.cyanDim,border:"1px solid "+C.cyan+"44",borderRadius:6,padding:"10px 12px",marginTop:10}}>
                      <div style={{color:C.cyan,fontSize:10,fontWeight:700}}>Final average entry: {fmtUSD(levels.at(-1)?.avgPrice||0)}</div>
                      <div style={{color:C.slate,fontSize:9,marginTop:3}}>Total invested: ${fmt(levels.at(-1)?.totalInvested||0,0)} over {dcaLevels} levels</div>
                    </div>}
                  </div>
                );
              })()}
            </div>
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
              <div style={{color:C.cyan,fontSize:11,fontWeight:700,marginBottom:14,letterSpacing:"0.1em"}}>◈ TRADE JOURNAL</div>
              <div style={{color:C.dimText,fontSize:10,marginBottom:12}}>Add notes to your recent trades to track your thinking and improve over time.</div>
              {(isDemo?lLoad("demo_history_"+(uid||""),[]):lLoad("live_history_"+(uid||""),[]) ).slice(0,5).map((t,i)=>(
                <div key={i} style={{background:C.bg2,borderRadius:6,padding:10,marginBottom:8,border:"1px solid "+C.border}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{color:C.white,fontWeight:700,fontSize:10}}>{t.pair}</span>
                      <span style={{color:t.side==="BUY"?C.green:C.red,fontSize:9}}>{t.side}</span>
                      <span style={{color:t.pnl>=0?C.green:C.red,fontSize:10,fontWeight:700}}>{t.pnl>=0?"+":""}{fmtUSD(t.pnl||0)}</span>
                    </div>
                    <span style={{color:C.dimText,fontSize:8}}>{t.time}</span>
                  </div>
                  <textarea placeholder="Add your notes about this trade — what worked, what didn't..." rows={2} defaultValue={lLoad("journal_"+t.id+"_"+uid,"")} onChange={e=>lSave("journal_"+t.id+"_"+uid,e.target.value)} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"6px 8px",fontFamily:"monospace",fontSize:9,outline:"none",resize:"none",boxSizing:"border-box",lineHeight:1.5}}/>
                </div>
              ))}
              {(isDemo?lLoad("demo_history_"+(uid||""),[]):lLoad("live_history_"+(uid||""),[])).length===0&&<div style={{color:C.dimText,fontSize:11,textAlign:"center",padding:20}}>Complete some trades to start journaling</div>}
            </div>
          </div>
        )}


        {tab==="tools"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{color:C.cyan,fontSize:11,fontWeight:700,letterSpacing:"0.1em"}}>◈ POSITION SIZE CALCULATOR</div>
                <select value={selectedPair} onChange={e=>setSelectedPair(e.target.value)} style={{background:C.bg3,border:"1px solid "+C.cyan,color:C.cyan,padding:"4px 8px",borderRadius:4,fontSize:10,fontFamily:"monospace"}}>
                  {activePairs.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{color:C.dimText,fontSize:9,marginBottom:12}}>Calculate exact position size based on your risk tolerance. Never risk more than you can afford to lose.</div>
              {(()=>{
                const entry=sig?.entry||prices[selectedPair]||BASE_PRICES[selectedPair]||1;
                const sl=sig?.stopLoss||entry*0.97;
                const calc=calcPositionSize(currentBalance,parseFloat(strategy.riskPct)||1.5,entry,sl,1);
                return(
                  <div>
                    <div style={{background:C.bg2,borderRadius:6,padding:12,marginBottom:12}}>
                      <div style={{color:C.white,fontSize:10,fontWeight:700,marginBottom:8}}>Using {selectedPair} signal levels</div>
                      {[["Account Balance",fmtUSD(currentBalance),C.white],["Risk %",fmt(strategy.riskPct||1.5,1)+"%",C.gold],["Risk Amount",fmtUSD(calc.riskAmount),C.red],["Entry Price",fmtUSD(entry),C.white],["Stop Loss",fmtUSD(sl),C.red],["SL Distance",fmtUSD(calc.slDistance)+" ("+fmt(calc.slPct,2)+"%)",C.orange],["Position Size",fmt(calc.positionSize,4)+" units",C.cyan],["Position Value",fmtUSD(calc.positionValue),C.cyan],["Max Safe Leverage",calc.maxLeverage+"x",calc.maxLeverage>=10?C.red:calc.maxLeverage>=5?C.gold:C.green]].map(([l,v,c])=>(
                        <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+C.border+"22"}}><span style={{color:C.slate,fontSize:10}}>{l}</span><span style={{color:c,fontSize:10,fontWeight:700}}>{v}</span></div>
                      ))}
                    </div>
                    <div style={{background:C.goldDim,border:"1px solid "+C.gold+"44",borderRadius:5,padding:"8px 10px"}}>
                      <div style={{color:C.gold,fontSize:9}}>⚠ Always verify position size before placing a trade. This is calculated from your current signal levels for {selectedPair}.</div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
              <div style={{color:C.cyan,fontSize:11,fontWeight:700,marginBottom:14,letterSpacing:"0.1em"}}>◈ P&L CALENDAR</div>
              <div style={{color:C.dimText,fontSize:9,marginBottom:12}}>Your trading performance by day. Green = profitable, Red = loss day.</div>
              {(()=>{
                const th=isDemo?lLoad("demo_history_"+(uid||""),[]):lLoad("live_history_"+(uid||""),[]);
                const calendar=buildPnLCalendar(th);
                const maxPnl=calendar.length>0?Math.max(...calendar.map(d=>Math.abs(d.pnl))):1;
                const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
                return(
                  <div>
                    {calendar.length===0&&<div style={{color:C.dimText,fontSize:11,textAlign:"center",padding:20}}>Complete trades to see your P&L calendar</div>}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:8}}>
                      {days.map(d=><div key={d} style={{color:C.dimText,fontSize:7,textAlign:"center"}}>{d}</div>)}
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                      {calendar.slice(-49).map((d,i)=>{
                        const intensity=Math.min(1,Math.abs(d.pnl)/maxPnl);
                        const col=d.pnl>=0?C.green:C.red;
                        return(
                          <div key={i} title={d.date+": "+fmtUSD(d.pnl)+" ("+d.trades+" trades)"} style={{width:28,height:28,borderRadius:3,background:col,opacity:0.2+intensity*0.8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                            <span style={{color:"#000",fontSize:6,fontWeight:700,opacity:1/Math.max(0.2,0.2+intensity*0.8)}}>{d.pnl>=0?"+":""}{Math.round(d.pnl)}</span>
                          </div>
                        );
                      })}
                    </div>
                    {calendar.length>0&&<div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                      {[["Best Day",fmtUSD(Math.max(...calendar.map(d=>d.pnl))),C.green],["Worst Day",fmtUSD(Math.min(...calendar.map(d=>d.pnl))),C.red],["Win Days",calendar.filter(d=>d.pnl>0).length+"/"+calendar.length,C.gold]].map(([l,v,c])=>(
                        <div key={l} style={{background:C.bg2,borderRadius:5,padding:"8px 10px",textAlign:"center"}}><div style={{color:C.dimText,fontSize:8}}>{l}</div><div style={{color:c,fontSize:12,fontWeight:700,marginTop:3}}>{v}</div></div>
                      ))}
                    </div>}
                  </div>
                );
              })()}
            </div>
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{color:C.cyan,fontSize:11,fontWeight:700,letterSpacing:"0.1em"}}>◈ SMC ANALYSIS — {selectedPair}</div>
                <select value={selectedPair} onChange={e=>setSelectedPair(e.target.value)} style={{background:C.bg3,border:"1px solid "+C.cyan,color:C.cyan,padding:"4px 8px",borderRadius:4,fontSize:10,fontFamily:"monospace"}}>
                  {activePairs.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {sig?.smc?(
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                    <div style={{background:C.greenDim,border:"1px solid "+C.green+"44",borderRadius:5,padding:"8px 10px",textAlign:"center"}}><div style={{color:C.dimText,fontSize:8}}>Bull BOS</div><div style={{color:C.green,fontSize:20,fontWeight:700}}>{sig.smc.bullishBOS}</div></div>
                    <div style={{background:C.redDim,border:"1px solid "+C.red+"44",borderRadius:5,padding:"8px 10px",textAlign:"center"}}><div style={{color:C.dimText,fontSize:8}}>Bear BOS</div><div style={{color:C.red,fontSize:20,fontWeight:700}}>{sig.smc.bearishBOS}</div></div>
                  </div>
                  {sig.smc.lastCHoCH&&<div style={{background:sig.smc.lastCHoCH.type==="bullish"?C.greenDim:C.redDim,border:"1px solid "+(sig.smc.lastCHoCH.type==="bullish"?C.green:C.red)+"44",borderRadius:6,padding:"10px 12px",marginBottom:10}}>
                    <div style={{color:sig.smc.lastCHoCH.type==="bullish"?C.green:C.red,fontWeight:700,fontSize:11}}>CHoCH: {sig.smc.lastCHoCH.type.toUpperCase()} REVERSAL</div>
                    <div style={{color:C.slate,fontSize:9,marginTop:3}}>Change of Character at {fmtUSD(sig.smc.lastCHoCH.price)}</div>
                  </div>}
                  <div style={{color:C.cyan,fontSize:10,fontWeight:700,marginBottom:6}}>Fair Value Gaps ({sig.smc.fvg.length} unfilled)</div>
                  {sig.smc.fvg.slice(0,4).map((f,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 8px",background:f.type==="bullish"?C.greenDim:C.redDim,borderRadius:4,marginBottom:4,border:"1px solid "+(f.type==="bullish"?C.green:C.red)+"33"}}>
                      <span style={{color:f.type==="bullish"?C.green:C.red,fontSize:9,fontWeight:700}}>{f.type.toUpperCase()} FVG</span>
                      <span style={{color:C.white,fontSize:9}}>{fmtUSD(f.bottom)} — {fmtUSD(f.top)}</span>
                    </div>
                  ))}
                  <div style={{color:C.cyan,fontSize:10,fontWeight:700,marginBottom:6,marginTop:8}}>Order Blocks ({sig.smc.orderBlocks.length})</div>
                  {sig.smc.orderBlocks.slice(0,4).map((ob,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 8px",background:ob.type==="bullish"?C.greenDim:C.redDim,borderRadius:4,marginBottom:4,border:"1px solid "+(ob.type==="bullish"?C.green:C.red)+"33"}}>
                      <span style={{color:ob.type==="bullish"?C.green:C.red,fontSize:9,fontWeight:700}}>{ob.type.toUpperCase()} OB</span>
                      <span style={{color:C.white,fontSize:9}}>{fmtUSD(ob.bottom)} — {fmtUSD(ob.top)}</span>
                    </div>
                  ))}
                  <div style={{marginTop:10}}>
                    <div style={{color:C.cyan,fontSize:10,fontWeight:700,marginBottom:6}}>Liquidation Zones</div>
                    {sig.liqLevels?.nearestBull&&<div style={{color:C.red,fontSize:9,marginBottom:3}}>Long Liq: {fmtUSD(sig.liqLevels.nearestBull.price)} ({sig.liqLevels.nearestBull.leverage}x)</div>}
                    {sig.liqLevels?.nearestBear&&<div style={{color:C.green,fontSize:9}}>Short Liq: {fmtUSD(sig.liqLevels.nearestBear.price)} ({sig.liqLevels.nearestBear.leverage}x)</div>}
                    <div style={{color:C.slate,fontSize:9,marginTop:4}}>Funding: {fmt(sig.fundingRate?.rate||0,4)}% ({sig.fundingRate?.sentiment})</div>
                  </div>
                </div>
              ):<div style={{color:C.dimText,fontSize:11,textAlign:"center",padding:20}}>Loading SMC data...</div>}
            </div>
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20}}>
              <div style={{color:C.cyan,fontSize:11,fontWeight:700,marginBottom:14,letterSpacing:"0.1em"}}>◈ ALERTS</div>
              <div style={{color:C.dimText,fontSize:9,marginBottom:12}}>Set price alerts, or build compound conditions that must ALL be true to trigger.</div>
              <div style={{display:"flex",gap:6,marginBottom:12}}>
                {[["simple","Simple"],["compound","Compound"]].map(([m,l])=>(
                  <button key={m} onClick={()=>setAlertMode(m)} style={{flex:1,padding:"7px 0",borderRadius:5,border:"1px solid "+(alertMode===m?C.gold:C.border),background:alertMode===m?C.goldDim:C.bg2,color:alertMode===m?C.gold:C.slate,cursor:"pointer",fontSize:10,fontFamily:"monospace",fontWeight:alertMode===m?700:400}}>{l}</button>
                ))}
              </div>
              {alertMode==="simple"&&<>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                <div>
                  <div style={{color:C.slate,fontSize:9,marginBottom:4}}>Pair</div>
                  <select value={newAlert?.pair||"BTC/USDT"} onChange={e=>setNewAlert(a=>({...a,pair:e.target.value}))} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,color:C.white,padding:"6px 8px",borderRadius:4,fontSize:10,fontFamily:"monospace"}}>
                    {activePairs.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{color:C.slate,fontSize:9,marginBottom:4}}>Type</div>
                  <select value={newAlert?.type||"price_above"} onChange={e=>setNewAlert(a=>({...a,type:e.target.value}))} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,color:C.white,padding:"6px 8px",borderRadius:4,fontSize:10,fontFamily:"monospace"}}>
                    <option value="price_above">Price Above</option>
                    <option value="price_below">Price Below</option>
                    <option value="signal_buy">Signal: BUY</option>
                    <option value="signal_sell">Signal: SELL</option>
                    <option value="strength_above">Strength Above 70%</option>
                  </select>
                </div>
              </div>
              {(newAlert?.type==="price_above"||newAlert?.type==="price_below")&&<div style={{marginBottom:10}}>
                <div style={{color:C.slate,fontSize:9,marginBottom:4}}>Target Price</div>
                <input type="number" value={newAlert?.value||""} onChange={e=>setNewAlert(a=>({...a,value:e.target.value}))} placeholder="Enter price..." style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"7px 10px",fontFamily:"monospace",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              </div>}
              <button onClick={()=>{if(!newAlert?.pair)return;setAlerts(prev=>[...prev,{...newAlert,id:Date.now(),active:true,triggered:false,createdAt:new Date().toLocaleTimeString()}]);setNewAlert({pair:"BTC/USDT",type:"price_above",value:""});}} style={{width:"100%",padding:"8px 0",borderRadius:5,border:"1px solid "+C.green,background:C.greenDim,color:C.green,cursor:"pointer",fontFamily:"monospace",fontSize:10,fontWeight:700,marginBottom:12}}>+ ADD ALERT</button>
              </>}
              {alertMode==="compound"&&<>
                <div style={{marginBottom:10}}>
                  <div style={{color:C.slate,fontSize:9,marginBottom:4}}>Pair</div>
                  <select value={compoundPair} onChange={e=>setCompoundPair(e.target.value)} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,color:C.white,padding:"6px 8px",borderRadius:4,fontSize:10,fontFamily:"monospace"}}>
                    {activePairs.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{color:C.slate,fontSize:9,marginBottom:6}}>ALL conditions below must be true (AND logic)</div>
                {compoundConditions.map((c,ci)=>(
                  <div key={ci} style={{display:"grid",gridTemplateColumns:"1fr 60px 1fr 28px",gap:5,marginBottom:6,alignItems:"center"}}>
                    <select value={c.field} onChange={e=>setCompoundConditions(cs=>cs.map((x,i)=>i===ci?{...x,field:e.target.value}:x))} style={{background:C.bg3,border:"1px solid "+C.border,color:C.white,padding:"5px 6px",borderRadius:4,fontSize:9,fontFamily:"monospace"}}>
                      <option value="rsi">RSI</option>
                      <option value="price">Price</option>
                      <option value="strength">Strength</option>
                      <option value="adx">ADX</option>
                      <option value="riskReward">R:R</option>
                      <option value="regime">Regime</option>
                      <option value="direction">Direction</option>
                      <option value="mtfBias">MTF Bias</option>
                    </select>
                    {["regime","direction","mtfBias"].includes(c.field)?
                      <div style={{color:C.dimText,fontSize:8,textAlign:"center"}}>=</div>:
                      <select value={c.op} onChange={e=>setCompoundConditions(cs=>cs.map((x,i)=>i===ci?{...x,op:e.target.value}:x))} style={{background:C.bg3,border:"1px solid "+C.border,color:C.white,padding:"5px 4px",borderRadius:4,fontSize:9,fontFamily:"monospace"}}>
                        <option value="<">{"<"}</option>
                        <option value=">">{">"}</option>
                        <option value="<=">{"<="}</option>
                        <option value=">=">{">="}</option>
                        <option value="=">=</option>
                      </select>
                    }
                    {c.field==="regime"?
                      <select value={c.value} onChange={e=>setCompoundConditions(cs=>cs.map((x,i)=>i===ci?{...x,value:e.target.value}:x))} style={{background:C.bg3,border:"1px solid "+C.border,color:C.white,padding:"5px 6px",borderRadius:4,fontSize:9,fontFamily:"monospace"}}>
                        <option value="trending_bull">trending_bull</option>
                        <option value="trending_bear">trending_bear</option>
                        <option value="ranging">ranging</option>
                        <option value="volatile">volatile</option>
                        <option value="squeeze">squeeze</option>
                      </select>
                    :c.field==="direction"?
                      <select value={c.value} onChange={e=>setCompoundConditions(cs=>cs.map((x,i)=>i===ci?{...x,value:e.target.value}:x))} style={{background:C.bg3,border:"1px solid "+C.border,color:C.white,padding:"5px 6px",borderRadius:4,fontSize:9,fontFamily:"monospace"}}>
                        <option value="STRONG BUY">STRONG BUY</option>
                        <option value="BUY">BUY</option>
                        <option value="NEUTRAL">NEUTRAL</option>
                        <option value="SELL">SELL</option>
                        <option value="STRONG SELL">STRONG SELL</option>
                      </select>
                    :c.field==="mtfBias"?
                      <select value={c.value} onChange={e=>setCompoundConditions(cs=>cs.map((x,i)=>i===ci?{...x,value:e.target.value}:x))} style={{background:C.bg3,border:"1px solid "+C.border,color:C.white,padding:"5px 6px",borderRadius:4,fontSize:9,fontFamily:"monospace"}}>
                        <option value="bullish">bullish</option>
                        <option value="bearish">bearish</option>
                        <option value="neutral">neutral</option>
                      </select>
                    :
                      <input type="number" value={c.value} onChange={e=>setCompoundConditions(cs=>cs.map((x,i)=>i===ci?{...x,value:e.target.value}:x))} style={{background:C.bg3,border:"1px solid "+C.border,color:C.white,padding:"5px 6px",borderRadius:4,fontSize:9,fontFamily:"monospace",width:"100%",boxSizing:"border-box"}}/>
                    }
                    <button onClick={()=>setCompoundConditions(cs=>cs.filter((_,i)=>i!==ci))} style={{background:"none",border:"1px solid "+C.red,color:C.red,borderRadius:3,cursor:"pointer",fontSize:9,padding:"4px 0"}}>✕</button>
                  </div>
                ))}
                <button onClick={()=>setCompoundConditions(cs=>[...cs,{field:"rsi",op:"<",value:"30"}])} style={{width:"100%",padding:"5px 0",borderRadius:4,border:"1px dashed "+C.border,background:"none",color:C.dimText,cursor:"pointer",fontSize:9,marginBottom:10}}>+ ADD CONDITION</button>
                <button onClick={()=>{
                  setAlerts(prev=>[...prev,{pair:compoundPair,type:"compound",conditions:compoundConditions,id:Date.now(),active:true,triggered:false,createdAt:new Date().toLocaleTimeString()}]);
                  setCompoundConditions([{field:"rsi",op:"<",value:"30"}]);
                }} style={{width:"100%",padding:"8px 0",borderRadius:5,border:"1px solid "+C.gold,background:C.goldDim,color:C.gold,cursor:"pointer",fontFamily:"monospace",fontSize:10,fontWeight:700,marginBottom:12}}>+ ADD COMPOUND ALERT</button>
              </>}
              <div style={{background:C.bg2,borderRadius:6,padding:10,marginBottom:12,border:"1px solid "+C.border}}>
                <div style={{color:C.cyan,fontSize:9,fontWeight:700,marginBottom:6}}>DISCORD WEBHOOK</div>
                <input value={webhookUrl} onChange={e=>setWebhookUrl(e.target.value)} placeholder="Paste Discord webhook URL..." style={{width:"100%",background:C.bg3,border:"1px solid "+(webhookUrl?C.green:C.border),borderRadius:4,color:C.white,padding:"6px 8px",fontFamily:"monospace",fontSize:10,outline:"none",boxSizing:"border-box",marginBottom:6}}/>
                <div style={{color:C.dimText,fontSize:8,lineHeight:1.6}}>Server Settings → Integrations → Webhooks → paste URL here.</div>
              </div>
              <div style={{background:C.bg2,borderRadius:6,padding:10,marginBottom:12,border:"1px solid "+C.border}}>
                <div style={{color:C.cyan,fontSize:9,fontWeight:700,marginBottom:6}}>TELEGRAM BOT ALERTS</div>
                <input value={telegramBotToken} onChange={e=>setTelegramBotToken(e.target.value)} placeholder="Bot token from @BotFather..." style={{width:"100%",background:C.bg3,border:"1px solid "+(telegramBotToken?C.green:C.border),borderRadius:4,color:C.white,padding:"6px 8px",fontFamily:"monospace",fontSize:10,outline:"none",boxSizing:"border-box",marginBottom:6}}/>
                <input value={telegramChatId} onChange={e=>setTelegramChatId(e.target.value)} placeholder="Your chat ID..." style={{width:"100%",background:C.bg3,border:"1px solid "+(telegramChatId?C.green:C.border),borderRadius:4,color:C.white,padding:"6px 8px",fontFamily:"monospace",fontSize:10,outline:"none",boxSizing:"border-box",marginBottom:6}}/>
                <div style={{color:C.dimText,fontSize:8,lineHeight:1.6}}>1. Message @BotFather on Telegram, send /newbot, copy the token. 2. Message @userinfobot to get your chat ID. 3. Message your new bot once (any text) so it's allowed to reply to you.</div>
                <button onClick={()=>sendWebhookAlert({pair:"TEST",type:"price_above",value:"test"})} style={{width:"100%",padding:"6px 0",borderRadius:4,border:"1px solid "+C.cyan,background:C.cyanDim,color:C.cyan,cursor:"pointer",fontSize:9,fontFamily:"monospace",marginTop:6}}>SEND TEST ALERT</button>
              </div>
              <div style={{maxHeight:200,overflowY:"auto"}}>
                {alerts.map((a,i)=>{
                  const cur=prices[a.pair]||BASE_PRICES[a.pair]||0;
                  const triggered=a.type==="compound"?(Array.isArray(a.conditions)&&a.conditions.every(c=>evalAlertCondition(c,signals[a.pair],cur))):a.type==="price_above"?cur>=parseFloat(a.value||0):a.type==="price_below"?cur<=parseFloat(a.value||0):a.type==="signal_buy"?signals[a.pair]?.direction.includes("BUY"):a.type==="signal_sell"?signals[a.pair]?.direction.includes("SELL"):signals[a.pair]?.strength>=70;
                  return(
                    <div key={a.id} style={{background:triggered?C.goldDim:C.bg2,border:"1px solid "+(triggered?C.gold:C.border),borderRadius:5,padding:"8px 10px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{color:triggered?C.gold:C.white,fontSize:10,fontWeight:700}}>{a.pair} — {a.type==="compound"?"COMPOUND ("+a.conditions.length+" conditions)":a.type.replace("_"," ").toUpperCase()}</div>
                        {a.type==="compound"&&<div style={{color:C.slate,fontSize:8}}>{a.conditions.map(c=>c.field+" "+c.op+" "+c.value).join(" AND ")}</div>}
                        {a.value&&a.type!=="compound"&&<div style={{color:C.slate,fontSize:9}}>Target: {fmtUSD(a.value)}</div>}
                        {triggered&&<div style={{color:C.gold,fontSize:9,fontWeight:700}}>🔔 TRIGGERED!</div>}
                      </div>
                      <button onClick={()=>setAlerts(prev=>prev.filter((_,j)=>j!==i))} style={{background:"none",border:"1px solid "+C.red,color:C.red,padding:"2px 6px",borderRadius:3,cursor:"pointer",fontSize:9}}>✕</button>
                    </div>
                  );
                })}
                {alerts.length===0&&<div style={{color:C.dimText,fontSize:10,textAlign:"center",padding:10}}>No alerts set</div>}
              </div>
            </div>
          </div>
        )}


        {tab==="guide"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
            {[
              {title:"◈ GETTING STARTED",color:C.cyan,items:[
                {h:"1. Create Account",b:"Sign up with email and password. Set a 4-6 digit PIN for quick daily access. PIN is always required — Samsung Pass cannot bypass it."},
                {h:"2. Choose Mode",b:"Toggle DEMO or LIVE using the switch top right or in Portfolio. Demo uses real Binance prices with $50,000 fake money. Always test in Demo first before going live."},
                {h:"3. Set Strategy",b:"Go to Strategy tab. Click a preset (NEXUS Apex, NEXUS Prime, Trend Rider, Aggressive, Small Account or Custom) or adjust settings manually. Click SAVE STRATEGY. Settings persist permanently — you'll see a clear ✓ STRATEGY SAVED confirmation."},
                {h:"4. Enable Auto Trading",b:"Set Auto Mode to FULL-AUTO in Strategy tab. Save. Make sure Demo Mode is ON. Watch the Auto Trade Log on the Markets page for trades firing as signals qualify."},
                {h:"5. Server Bot",b:"Go to Settings → Server Bot. Enable the toggle. The server runs 24/7 even when the app is closed. Requires Binance API key with trade permissions whitelisted to IP: 3.39.214.69."},
                {h:"6. Going Live",b:"Run demo profitably for 2+ weeks. Go to Settings → RESET LIVE DATA for a clean start. Enter your exchange balance on the Portfolio page. Create a Binance trading API key whitelisted to 3.39.214.69."},
              ]},
              {title:"◈ DASHBOARD — MARKETS",color:C.cyan,items:[
                {h:"Pair List",b:"Left column shows all active trading pairs with live prices, signal direction and strength bars. Tap any pair to load its chart."},
                {h:"Chart",b:"Candle chart with all indicators. Drag left/right to scroll history. Use + / - buttons to zoom. Toggle overlays with the buttons above."},
                {h:"Open Trade Lines",b:"When you have an open position the entry, SL and all TP levels appear as coloured lines on the chart with live P&L badge."},
                {h:"Signal Levels",b:"Right panel shows entry, stop loss and three take profit levels calculated from ATR. R:R ratio shown below."},
              ]},
              {title:"◈ AUTO TRADING",color:C.purple,items:[
                {h:"NEXUS Apex",b:"The strictest preset — min 80% strength, 1:3 R:R, every filter ON, multi-timeframe agreement required. Expect very few trades. Best used after running Walk-Forward + Monte Carlo and applying the results."},
                {h:"FULL-AUTO",b:"Bot monitors all pairs every 3 seconds. Automatically opens trades, moves SL to breakeven at TP1, closes at TP2, applies trailing stops."},
                {h:"SEMI-AUTO",b:"Monitors open positions only — applies trailing stops and breakeven. Does not open new trades automatically."},
                {h:"Filters",b:"Session filter restricts to London/NY/Sydney/Asia hours. Correlation filter prevents trading correlated pairs simultaneously. Regime filter trades with the market trend only."},
              ]},
              {title:"◈ STRATEGY SETTINGS",color:C.gold,items:[
                {h:"Min Strength",b:"Minimum signal strength percentage required to open a trade. Higher = fewer but better quality trades. NEXUS Prime uses 72%, TEST uses 20%."},
                {h:"Min R:R",b:"Minimum risk to reward ratio. 2.5 means you risk $1 to make $2.50. At 1:2.5 you only need 30% win rate to be profitable."},
                {h:"Risk per Trade",b:"Percentage of account to risk per trade. 1.5% is conservative, 3% is aggressive. Never risk more than 5% on a single trade."},
                {h:"Daily Loss Limit",b:"Auto trading stops for the day if total losses exceed this percentage. Protects your account from runaway losses."},
              ]},
              {title:"◈ INDICATORS GUIDE",color:C.green,items:[
                {h:"RSI",b:"Relative Strength Index. Below 30 = oversold (bullish), above 70 = overbought (bearish). Best used with other confirmation."},
                {h:"MACD",b:"Moving Average Convergence Divergence. Histogram above zero = bullish momentum. Crossover signals trend changes."},
                {h:"Supertrend",b:"Trend following indicator. Green = uptrend (buy), Red = downtrend (sell). Very reliable in trending markets."},
                {h:"ADX",b:"Average Directional Index. Above 25 = strong trend. Below 25 = ranging market. Tells you HOW strong the trend is, not direction."},
                {h:"Bollinger Bands",b:"Price at lower band = oversold, upper band = overbought. Band squeeze predicts big moves coming."},
                {h:"Divergence",b:"When price makes new lows but RSI makes higher lows = bullish divergence (strong buy signal). One of the most powerful signals."},
              ]},
              {title:"◈ CHART TYPES",color:C.gold,items:[
                {h:"Candlestick",b:"Shows open, high, low and close for each period. Green candle = price went up. Red = price went down. Most popular chart type."},
                {h:"Heikin Ashi",b:"Smoothed candles that filter noise. Makes trends easier to see. Better for trend-following strategies."},
                {h:"Line",b:"Simple closing price line. Good for seeing overall trend direction without candle noise."},
                {h:"Bar",b:"Traditional OHLC bar chart. Each bar shows open (left tick), high, low and close (right tick)."},
              ]},
              {title:"◈ EXCHANGE SETUP",color:C.orange,items:[
                {h:"Getting API Keys",b:"Log into your exchange → Account → API Management → Create API. Enable Read and Trade permissions only. NEVER enable Withdrawals — this is dangerous."},
                {h:"IP Whitelisting",b:"Whitelist NEXUS server IP 3.39.214.69 on Binance when creating a trading API key. This is required — Binance deletes trading keys without a static IP after a period of time."},
                {h:"Supported Exchanges",b:"Binance, Bybit, OKX, Kraken, Coinbase, Bitfinex, KuCoin, Gate.io, and Custom. For Custom exchange enter your REST API base URL and WebSocket URL in Settings → Manage Exchange Connections."},
                {h:"Server Bot IP",b:"The NEXUS server runs on Supabase at static IP 3.39.214.69. Whitelist this on Binance when creating your trading API key. This enables 24/7 automated trading even when the app is closed."},
                {h:"Multi-User",b:"Each user enters their own exchange API key. The server trades each account independently. 200 Binance users all work fine — each API key only accesses its own account."},
              ]},
              {title:"◈ STRATEGY BUILDER",color:C.gold,items:[
                {h:"NEXUS Apex",b:"The most selective strategy in the app. Min 80% signal strength, 1:3 R:R minimum, every filter ON, requires multi-timeframe agreement. Uses Kelly Criterion sizing capped at 3%. Most days it finds zero trades — that's by design. Run Walk-Forward + Monte Carlo (Backtest tab) and apply the results before trusting it — no strategy is guaranteed to win, this one is just held to the highest bar the app can enforce."},
                {h:"NEXUS Prime",b:"High probability conservative strategy. Min 72% signal strength. All filters ON. Uses Kelly Criterion sizing capped at 2% once you have 10+ trades (falls back to flat 1.5% before that). 2-3 quality trades per day. Best for accounts over $1000."},
                {h:"NEXUS Trend Rider",b:"Trend following with trailing stop. 65% strength, regime + multi-timeframe + correlation filters ON. Closes 30% at TP1 (stop moves to breakeven), 30% at TP2, 40% trails 2x ATR indefinitely. Session and volatility filters stay off deliberately since real trends don't wait for a specific session. Best strategy for letting winners run — a trade that goes 5x or 10x stays open the whole way."},
                {h:"Aggressive",b:"Higher frequency at 60% strength. More trades, lower average quality. No filters. Suitable for experienced traders in trending markets."},
                {h:"Small Account $100",b:"Optimised for under $500. 75% strength, 3:1 minimum R:R. Only 2 trades per day. Trailing stop ON. Compound all profits slowly."},
                {h:"Custom Strategy",b:"Adjust all settings, write your description, save with your own name. Settings saved permanently to Supabase — same on all devices."},
                {h:"Walk-Forward & Monte Carlo",b:"In Backtest tab, run a normal backtest first, then Walk-Forward (splits history into 4 periods, checks consistency) and Monte Carlo (reshuffles your actual trades 1,000 times to reveal realistic best/worst case outcomes). Click APPLY TO AUTO-TRADING to save the scores — auto-trading will then automatically reduce position size or pause entirely if the strategy's consistency is low or ruin risk is high."},
                {h:"Trailing Stop",b:"In Strategy tab toggle Trailing Stop ON. Choose ATR (adjusts to volatility) or Percentage. Set Trail ATR Mult (2 = trails 2x ATR below peak). Set TP1/TP2/Remain % split — Remain portion stays open following price indefinitely until reversal."},
                {h:"Breakeven",b:"Toggle Breakeven at TP1 ON in Strategy tab. When TP1 is hit the stop loss automatically moves to your entry price — the trade becomes risk-free. The → BE button on open positions does this manually anytime."},
                {h:"Indicator Settings",b:"Chart → IND SETTINGS tab. Toggle Custom ON to set your own RSI, MACD, EMA, BB, ATR, ADX, Supertrend and other periods. Toggle OFF to use AI-optimised defaults. Auto trades always use AI defaults regardless."},
                {h:"Before Going Live",b:"Run demo profitably for 2+ weeks. Settings → RESET LIVE DATA. Enter real balance on Portfolio page. Create Binance API key with IP 3.39.214.69 whitelisted. Enable server bot."},
              ]},
              {title:"◈ RISK MANAGEMENT",color:C.red,items:[
                {h:"Never Risk More Than 3%",b:"A single trade should never risk more than 3% of your account. At 1.5% you can lose 66 trades in a row before losing everything."},
                {h:"Always Use Stop Loss",b:"The stop loss is not optional. Without it one bad trade can wipe your account. NEXUS places SL at 1.5x ATR from entry by default."},
                {h:"Kelly Criterion",b:"Mathematically optimal position size based on your win rate and R:R. Found in Intelligence tab. Use half-Kelly for safety."},
                {h:"Small Account Growth",b:"With $100 and 5x futures leverage: risk 3% per trade, min R:R 3.0, max 2 trades per day, compound all profits. See Small Account preset."},
              ]},
              {title:"◈ DEMO vs LIVE",color:C.purple,items:[
                {h:"Demo Mode",b:"Real live Binance prices, fake $50,000 balance. Signals, charts, indicators and execution logic are identical to live — only the money is fake. Demo results are a genuine preview of live performance."},
                {h:"Live Mode",b:"Real prices, real money on your exchange. Enter your actual exchange balance on the Portfolio page when you first switch to Live mode."},
                {h:"Completely Separate",b:"Demo and Live trade history, portfolios, balances and stats are stored completely separately. Switching modes shows only that mode's data — no crossover."},
                {h:"Resetting Data",b:"Settings → RESET DEMO DATA gives a fresh $50,000 demo balance. RESET LIVE DATA clears live history for a clean start. Always reset live data before going live for the first time."},
                {h:"When to Go Live",b:"Run demo profitably for at least 2 weeks. Check win rate above 40% and profit factor above 1.2. Start live with a small amount — $100-500 — and scale up gradually."},
                {h:"Server Bot",b:"The server bot trades in demo mode by default. Switch it to live by creating a Binance trading API key whitelisted to 3.39.214.69 and entering it in Settings → Exchange Connections."},
              ]},
            ].map(({title,color,items})=>(
              <div key={title} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:20,marginBottom:0}}>
                <div style={{color,fontSize:11,letterSpacing:"0.1em",marginBottom:14,fontWeight:700}}>{title}</div>
                {items.map(({h,b})=>(
                  <div key={h} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid "+C.border+"22"}}>
                    <div style={{color:C.white,fontSize:11,fontWeight:700,marginBottom:4}}>{h}</div>
                    <div style={{color:C.slate,fontSize:10,lineHeight:1.7}}>{b}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

      {showAlertsModal&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.88)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}} onClick={e=>{if(e.target===e.currentTarget)setShowAlertsModal(false);}}>
          <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,width:"min(440px,95vw)",maxHeight:"85vh",overflowY:"auto",margin:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{background:C.bg2,padding:"14px 18px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"12px 12px 0 0",position:"sticky",top:0}}>
              <span style={{color:C.gold,fontSize:14,fontWeight:700}}>🔔 PRICE ALERTS</span>
              <button onClick={()=>setShowAlertsModal(false)} style={{background:C.bg3,border:"1px solid "+C.border,color:C.white,width:30,height:30,borderRadius:6,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{padding:18}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                <div><div style={{color:C.slate,fontSize:10,marginBottom:4}}>Pair</div>
                  <select value={newAlert.pair} onChange={e=>setNewAlert({...newAlert,pair:e.target.value})} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"8px",fontFamily:"monospace",fontSize:10,outline:"none",colorScheme:"dark"}}>
                    {activePairs.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div><div style={{color:C.slate,fontSize:10,marginBottom:4}}>Type</div>
                  <select value={newAlert.type} onChange={e=>setNewAlert({...newAlert,type:e.target.value})} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"8px",fontFamily:"monospace",fontSize:10,outline:"none",colorScheme:"dark"}}>
                    <option value="price_above">Price Above</option>
                    <option value="price_below">Price Below</option>
                    <option value="signal">Signal Fires</option>
                  </select>
                </div>
                <div><div style={{color:C.slate,fontSize:10,marginBottom:4}}>{newAlert.type==="signal"?"Signal":"Price"}</div>
                  {newAlert.type==="signal"?
                    <select value={newAlert.value} onChange={e=>setNewAlert({...newAlert,value:e.target.value})} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"8px",fontFamily:"monospace",fontSize:10,outline:"none",colorScheme:"dark"}}>
                      {["STRONG BUY","BUY","SELL","STRONG SELL"].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>:
                    <input value={newAlert.value} onChange={e=>setNewAlert({...newAlert,value:e.target.value})} placeholder={fmtUSD(prices[newAlert.pair]||0)} style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:4,color:C.white,padding:"8px",fontFamily:"monospace",fontSize:11,outline:"none"}}/>
                  }
                </div>
              </div>
              <button onClick={()=>{if(newAlert.value||newAlert.type==="signal"){setAlerts(prev=>[...prev,{...newAlert,id:Date.now()}]);setNewAlert({pair:"BTC/USDT",type:"price_above",value:""});}}} style={{width:"100%",padding:"9px 0",borderRadius:5,border:"1px solid "+C.gold,background:C.goldDim,color:C.gold,cursor:"pointer",fontFamily:"monospace",fontSize:12,fontWeight:700,marginBottom:14}}>+ ADD ALERT</button>
              {alerts.length===0&&<div style={{color:C.dimText,fontSize:11,textAlign:"center",padding:20}}>No alerts set.</div>}
              {alerts.map(a=>(
                <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:C.bg2,borderRadius:5,marginBottom:6,border:"1px solid "+C.border}}>
                  <div><span style={{color:C.white,fontSize:11,fontWeight:700}}>{a.pair}</span><span style={{color:C.slate,fontSize:10,marginLeft:8}}>{a.type?.replace("_"," ")} {a.value}</span></div>
                  <button onClick={()=>setAlerts(prev=>prev.filter(x=>x.id!==a.id))} style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:14}}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showOrderModal&&<OrderModal pair={selectedPair} signal={sig} price={price} isDemo={isDemo} balance={currentBalance} strategy={strategy} onClose={()=>setShowOrderModal(false)} onPlace={placeOrder}/>}
      {showAddPair&&<AddPairModal activePairs={activePairs} onAdd={addPair} onClose={()=>setShowAddPair(false)}/>}
      {showExchangeModal&&<ExchangeManagerModal onClose={()=>setShowExchangeModal(false)} exchanges={exchangeKeys} onSave={keys=>{setExchangeKeys(keys);lSave("exchkeys_"+uid,keys);}}/>}
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    setLoading(false);
    let subscription;
    try{
      const result=supabase.auth.onAuthStateChange((event,session)=>{
        if(event==="SIGNED_OUT"){setUser(null);}
      });
      subscription=result.data?.subscription;
    }catch(e){console.log("Auth listener error:",e);}
    return()=>{try{subscription?.unsubscribe();}catch(e){}};
  },[]);
  if(loading)return(
    <div style={{background:"#060A0E",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace"}}>
      <div style={{textAlign:"center"}}>
        <div style={{color:"#00C8FF",fontSize:36,fontWeight:700,marginBottom:16,letterSpacing:"-0.02em"}}>◈ NEXUS</div>
        <div style={{display:"flex",gap:5,justifyContent:"center"}}>{[0,1,2,3,4].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#00C8FF",animation:`pulse ${0.7+i*0.15}s ease-in-out infinite alternate`}}/>)}</div>
        <style>{"@keyframes pulse{from{opacity:.2;transform:scale(.7)}to{opacity:1;transform:scale(1.2)}}"}</style>
      </div>
    </div>
  );
  if(!user)return <ErrorBoundary><AuthScreen onAuth={setUser}/></ErrorBoundary>;
  return <ErrorBoundary><TradingApp user={user} onSignOut={()=>setUser(null)}/></ErrorBoundary>;
}
