/**
 * EcoTrace – data.js
 * All static data: emission factors, tips, actions, achievements
 */
const loginForm = document.getElementById("loginForm");
const loginPage = document.getElementById("loginPage");
const dashboard = document.getElementById("dashboard");

loginForm.addEventListener("submit", function(e){

    e.preventDefault();

    loginPage.style.display = "none";

    dashboard.style.display = "block";

});

// ── Emission Factors (kg CO₂e per unit) ─────────────────────────────────────
const EMISSION_FACTORS = {
  transport: {
    car_petrol:  { label: 'Petrol Car',    factor: 0.192, unit: 'km' },
    car_diesel:  { label: 'Diesel Car',    factor: 0.171, unit: 'km' },
    car_hybrid:  { label: 'Hybrid Car',    factor: 0.105, unit: 'km' },
    car_electric:{ label: 'Electric Car',  factor: 0.053, unit: 'km' },
    bus:         { label: 'Bus',           factor: 0.089, unit: 'km' },
    train:       { label: 'Train',         factor: 0.041, unit: 'km' },
    motorbike:   { label: 'Motorbike',     factor: 0.114, unit: 'km' },
    taxi:        { label: 'Taxi/Cab',      factor: 0.149, unit: 'km' },
    bicycle:     { label: 'Bicycle/Walk',  factor: 0.000, unit: 'km' },
  },
  home: {
    electricity: { label: 'Electricity',   factor: 0.233, unit: 'kWh' },
    natural_gas: { label: 'Natural Gas',   factor: 0.202, unit: 'kWh' },
    lpg:         { label: 'LPG / Cooking', factor: 0.214, unit: 'kWh' },
    coal:        { label: 'Coal',          factor: 0.341, unit: 'kWh' },
    solar:       { label: 'Solar Energy',  factor: 0.000, unit: 'kWh' },
  },
  food: {
    beef:        { label: 'Beef',          factor: 27.0,  unit: 'kg' },
    lamb:        { label: 'Lamb',          factor: 24.0,  unit: 'kg' },
    pork:        { label: 'Pork',          factor:  7.6,  unit: 'kg' },
    chicken:     { label: 'Chicken',       factor:  6.9,  unit: 'kg' },
    fish:        { label: 'Fish/Seafood',  factor:  5.4,  unit: 'kg' },
    dairy:       { label: 'Dairy',         factor:  3.2,  unit: 'kg' },
    vegetables:  { label: 'Vegetables',    factor:  0.4,  unit: 'kg' },
    fruits:      { label: 'Fruits',        factor:  0.5,  unit: 'kg' },
  },
  shopping: {
    clothing:    { label: 'Clothing',      factor: 10.0,  unit: 'item' },
    electronics: { label: 'Electronics',   factor: 70.0,  unit: 'item' },
    furniture:   { label: 'Furniture',     factor: 50.0,  unit: 'item' },
    books:       { label: 'Books/Paper',   factor:  1.5,  unit: 'item' },
    plastic:     { label: 'Plastic Goods', factor:  3.0,  unit: 'item' },
  },
  flight: {
    short_haul:  { label: 'Short Haul (<3h)',  factor: 0.255, unit: 'km' },
    medium_haul: { label: 'Medium Haul (3–6h)',factor: 0.195, unit: 'km' },
    long_haul:   { label: 'Long Haul (>6h)',   factor: 0.150, unit: 'km' },
  }
};

// ── Category Icons ────────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  transport: '🚗',
  home:      '🏠',
  food:      '🥗',
  shopping:  '🛍️',
  flight:    '✈️',
};

// ── Tips (personalized pool) ──────────────────────────────────────────────────
const TIPS = [
  { icon:'🚴', title:'Bike or Walk Short Trips', desc:'Replacing car trips under 5km with cycling cuts transport emissions by up to 80%.', impact:'Save up to 120 kg CO₂/yr' },
  { icon:'🌱', title:'Try Meatless Mondays', desc:'Skipping meat one day/week can save over 100kg CO₂ per year.', impact:'Save ~104 kg CO₂/yr' },
  { icon:'💡', title:'Switch to LED Lighting', desc:'LED bulbs use 75% less energy than incandescent bulbs.', impact:'Save ~40 kg CO₂/yr' },
  { icon:'♻️', title:'Reduce Fast Fashion', desc:'Buying 5 fewer garments per year saves significant textile emissions.', impact:'Save ~50 kg CO₂/yr' },
  { icon:'🌡️', title:'Adjust Your Thermostat', desc:'Lowering heating by 1°C saves about 10% on your heating bill.', impact:'Save ~200 kg CO₂/yr' },
  { icon:'🚿', title:'Take Shorter Showers', desc:'A 2-minute shorter shower saves ~0.3 kg CO₂ each time.', impact:'Save ~35 kg CO₂/yr' },
  { icon:'🛒', title:'Shop Local & Seasonal', desc:'Local produce has far less transport emissions than imported goods.', impact:'Save ~60 kg CO₂/yr' },
  { icon:'⚡', title:'Unplug Idle Devices', desc:'Standby power can account for 10% of home electricity use.', impact:'Save ~80 kg CO₂/yr' },
  { icon:'🌳', title:'Plant a Tree', desc:'One mature tree absorbs about 22 kg of CO₂ per year.', impact:'Offset 22 kg CO₂/yr' },
  { icon:'🧺', title:'Line-Dry Your Laundry', desc:'Air-drying instead of tumble-drying saves significant energy.', impact:'Save ~150 kg CO₂/yr' },
  { icon:'🥦', title:'Eat More Whole Foods', desc:'Heavily processed foods have 2–3x the carbon footprint of whole foods.', impact:'Save ~70 kg CO₂/yr' },
  { icon:'🚆', title:'Take the Train, Not the Plane', desc:'Rail travel emits ~80% less CO₂ than flying for the same journey.', impact:'Save 100s of kg CO₂' },
];

// ── Actions (gamified eco-actions) ────────────────────────────────────────────
const ACTIONS = [
  { id:'a1',  icon:'🚴', title:'Cycle to Work',       desc:'Replace your regular commute with a bike ride for a week.', impact:'Save 9 kg CO₂', effort:'easy',   filter:['easy','high'],  category:'transport' },
  { id:'a2',  icon:'🥩', title:'Go Vegetarian for a Week', desc:'Cut out meat for 7 days and track the difference.',  impact:'Save 14 kg CO₂', effort:'medium', filter:['medium','high'], category:'food' },
  { id:'a3',  icon:'💡', title:'Switch to LED Bulbs', desc:'Replace all incandescent bulbs in your home.',            impact:'Save 3 kg CO₂',  effort:'easy',   filter:['easy'],          category:'home' },
  { id:'a4',  icon:'🧴', title:'Zero-Waste Shopping', desc:'Use reusable bags, containers for your next grocery run.',impact:'Save 1 kg CO₂',  effort:'easy',   filter:['easy'],          category:'shopping' },
  { id:'a5',  icon:'✈️', title:'Offset Your Last Flight', desc:'Purchase a verified carbon offset for your recent trip.', impact:'Offset up to 500 kg', effort:'easy', filter:['easy','high'], category:'flight' },
  { id:'a6',  icon:'🌞', title:'Install Solar Panels', desc:'Switch to solar energy for your home electricity.',      impact:'Save 1.5t CO₂',  effort:'high',   filter:['high'],          category:'home' },
  { id:'a7',  icon:'🚌', title:'Use Public Transport', desc:'Swap car trips for bus or train for an entire week.',    impact:'Save 20 kg CO₂', effort:'easy',   filter:['easy','high'],  category:'transport' },
  { id:'a8',  icon:'🌡️', title:'Lower Your Thermostat', desc:'Drop heating by 1°C — you\'ll barely notice the difference.', impact:'Save 17 kg CO₂', effort:'easy', filter:['easy','high'], category:'home' },
  { id:'a9',  icon:'🥦', title:'Eat Local for a Month', desc:'Source all produce from local farmers markets.',        impact:'Save 5 kg CO₂',  effort:'medium', filter:['medium'],        category:'food' },
  { id:'a10', icon:'👕', title:'Buy Second-Hand',      desc:'Purchase your next clothing item from a thrift store.', impact:'Save 8 kg CO₂',  effort:'easy',   filter:['easy'],          category:'shopping' },
  { id:'a11', icon:'⚡', title:'Home Energy Audit',   desc:'Get a professional audit to find efficiency improvements.', impact:'Save up to 300 kg', effort:'medium', filter:['medium','high'], category:'home' },
  { id:'a12', icon:'🌱', title:'Start Composting',    desc:'Compost food scraps to reduce methane from landfills.',  impact:'Save 60 kg CO₂', effort:'medium', filter:['medium'],        category:'food' },
];

// ── Achievements ──────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { emoji:'🌱', name:'First Step',   desc:'Log your first activity',           locked: false },
  { emoji:'🚴', name:'Commuter',     desc:'Log 10 cycling/walking trips',       locked: false },
  { emoji:'🥗', name:'Herbivore',    desc:'Log 5 vegetarian meals in a row',    locked: false },
  { emoji:'💡', name:'Energy Saver', desc:'Reduce home energy 3 weeks running', locked: true  },
  { emoji:'🌍', name:'Globalist',    desc:'Offset a long-haul flight',          locked: true  },
  { emoji:'♻️', name:'Zero Waster',  desc:'Complete 5 zero-waste actions',      locked: true  },
  { emoji:'🏆', name:'Champion',     desc:'Keep footprint below 3t for a year', locked: true  },
  { emoji:'🌳', name:'Planter',      desc:'Plant or sponsor 10 trees',          locked: true  },
];

// ── Monthly trend data ────────────────────────────────────────────────────────
const MONTHLY_DATA = {
  labels:   ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  thisYear: [420, 390, 360, 350, 330, 310, 340, 320, 300, 290, 280, 270],
  lastYear: [480, 470, 460, 440, 450, 430, 410, 420, 400, 390, 380, 370],
};

// ── Category breakdown ────────────────────────────────────────────────────────
const BREAKDOWN_DATA = {
  labels: ['Transport','Home','Food','Shopping','Flights'],
  values: [1800, 1100, 900, 400, 0],
  colors: ['#F59E0B','#52B788','#2D6A4F','#74C69D','#1B4332'],
};

// ── Comparison data ───────────────────────────────────────────────────────────
const COMPARISON_DATA = {
  labels: ['You', 'Your City', 'National Avg', 'Global Avg', 'Paris Target'],
  values: [4.2, 5.1, 6.3, 4.7, 2.0],
  colors: ['#52B788', '#74C69D', '#F59E0B', '#CBD5E1', '#1B4332'],
};

// ── Goals template ────────────────────────────────────────────────────────────
const DEFAULT_GOALS = [
  { name:'Reduce Annual Footprint', target:'3.5t CO₂', current:4.2, max:6, unit:'t', progress:30 },
  { name:'Weekly Low-Carbon Days',   target:'4 days/wk', current:2.5, max:7, unit:'days', progress:36 },
  { name:'Plant Trees This Year',    target:'12 trees', current:4, max:12, unit:'', progress:33 },
  { name:'Reduce Meat Consumption',  target:'3x/week',  current:5, max:7, unit:'times', progress:57 },
];

// ── Insight story ─────────────────────────────────────────────────────────────
const STORY_TEXT = `Your carbon footprint is <strong>4.2 tonnes CO₂e/year</strong>, which is <strong>11% below</strong> the global average of 4.7t.
<br/><br/>
Your biggest opportunity is <strong>transport</strong>, which makes up 43% of your emissions. Swapping just two car commutes per week for cycling or public transit could save over <strong>200 kg CO₂</strong> annually.
<br/><br/>
You're doing great with <strong>food choices</strong> — your diet-related emissions are 22% below average. Keep it up! If you can cut your home energy use by 10%, you'd be well on your way to the <strong>Paris Agreement target of 2t/year</strong>.`;

// ── Profile form fields ───────────────────────────────────────────────────────
const PROFILE_FIELDS = [
  { id:'pf-name',    label:'Your Name',          type:'text',   placeholder:'e.g. Alex Green', value:'Eco Warrior' },
  { id:'pf-country', label:'Country',            type:'select', options:['India','USA','UK','Germany','Australia','Canada','France','Japan','Brazil','Other'], value:'India' },
  { id:'pf-vehicle', label:'Primary Vehicle',    type:'select', options:['None / Walk','Bicycle','Motorcycle','Petrol Car','Diesel Car','Hybrid Car','Electric Car','Public Transport Only'], value:'None / Walk' },
  { id:'pf-diet',    label:'Diet Type',          type:'select', options:['Vegan','Vegetarian','Flexitarian','Omnivore','Heavy Meat Eater'], value:'Vegetarian' },
  { id:'pf-home',    label:'Home Energy Source', type:'select', options:['Renewable / Solar','Mostly Renewable','Mix','Mostly Fossil Fuels','Coal-Heavy Grid'], value:'Mostly Renewable' },
];