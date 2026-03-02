const API="f9761f21a86949ad4372ab55b11b7e3e";

const cityEl=document.getElementById("city");
const tempEl=document.getElementById("temp");
const descEl=document.getElementById("desc");
const humidityEl=document.getElementById("humidity");
const windEl=document.getElementById("wind");
const visibilityEl=document.getElementById("visibility");
const cloudsEl=document.getElementById("clouds");
const forecastEl=document.getElementById("forecast");

const input=document.getElementById("cityInput");
const btn=document.getElementById("searchBtn");
const savedBox=document.getElementById("savedCities");

/* ================= WEATHER ================= */

async function loadWeather(city){

const res=await fetch(
`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API}&units=metric&lang=vi`
);

const data=await res.json();

updateUI(data);
loadForecast(city);
saveCity(city);
setEffect(data.weather[0].main);
}

function updateUI(d){
cityEl.textContent=d.name;
tempEl.textContent=Math.round(d.main.temp)+"°";
descEl.textContent=d.weather[0].description;
humidityEl.textContent=d.main.humidity;
windEl.textContent=Math.round(d.wind.speed*3.6);
visibilityEl.textContent=d.visibility/1000;
cloudsEl.textContent=d.clouds.all;
}

/* ================= FORECAST ================= */

async function loadForecast(city){

const res=await fetch(
`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API}&units=metric&lang=vi`
);

const data=await res.json();

forecastEl.innerHTML="";

data.list.filter(x=>x.dt_txt.includes("12:00"))
.slice(0,5)
.forEach(d=>{
const date=new Date(d.dt_txt);

forecastEl.innerHTML+=`
<div>
<p>${date.toLocaleDateString("vi",{weekday:"short"})}</p>
<p>${Math.round(d.main.temp)}°</p>
</div>`;
});
}

/* ================= SAVE CITY ================= */

function saveCity(city){
let cities=JSON.parse(localStorage.getItem("cities")||"[]");

if(!cities.includes(city)){
cities.unshift(city);
cities=cities.slice(0,5);
localStorage.setItem("cities",JSON.stringify(cities));
}

renderSaved();
}

function renderSaved(){
savedBox.innerHTML="";
let cities=JSON.parse(localStorage.getItem("cities")||"[]");

cities.forEach(c=>{
const b=document.createElement("button");
b.textContent=c;
b.onclick=()=>loadWeather(c);
savedBox.appendChild(b);
});
}

/* ================= SEARCH ================= */

btn.onclick=()=>loadWeather(input.value);
input.addEventListener("keypress",e=>{
if(e.key==="Enter") btn.click();
});

/* ================= GPS ================= */

navigator.geolocation.getCurrentPosition(async pos=>{
const {latitude,longitude}=pos.coords;

const res=await fetch(
`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API}&units=metric&lang=vi`
);

const data=await res.json();
updateUI(data);
loadForecast(data.name);
});

/* ================= WEATHER EFFECT ================= */

const canvas=document.getElementById("weatherCanvas");
const ctx=canvas.getContext("2d");
canvas.width=innerWidth;
canvas.height=innerHeight;

let particles=[];

function setEffect(type){

particles=[];

if(type==="Rain"){
for(let i=0;i<200;i++)
particles.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height});
}

animate(type);
}

function animate(type){

ctx.clearRect(0,0,canvas.width,canvas.height);

if(type==="Rain"){
ctx.strokeStyle="rgba(255,255,255,0.5)";
particles.forEach(p=>{
ctx.beginPath();
ctx.moveTo(p.x,p.y);
ctx.lineTo(p.x,p.y+10);
ctx.stroke();
p.y+=8;
if(p.y>canvas.height)p.y=0;
});
}

requestAnimationFrame(()=>animate(type));
}

/* ================= INIT ================= */

renderSaved();

/* PWA */
if("serviceWorker" in navigator){
navigator.serviceWorker.register("sw.js");
                               }
