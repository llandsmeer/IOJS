let neuron = mkneuron()
const W = 800
const H = 400

function setup() {
  createCanvas(800, 400);
  setFrameRate(30)

  background(255, 200, 128);
}

//    let dVs_dt = (-(I_CaL + I_ds + I_as + I_Na_s + I_ls + I_Kdr_s + I_K_s + I_amp + I_gab_soma) ) / C_m;
//    let dVd_dt = (-(I_CaH + I_sd + I_ld + I_K_Ca + I_cx36 + I_h + I_gab_dend + I_amp_dend) + I_app ) / C_m;
//    let dVa_dt = (-(I_K_a + I_sa + I_la + I_Na_a) ) / C_m;

// for clickable channels
let channelPositions = []

function channels(comp, h, l, w) {
  let keys = Object.keys(comp)
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === 'disabled') continue
    let I = -comp[keys[i]]
    if (I > 0) {
      fill(255 - I * 128, max(255 - I * 64, 128), 255)
    } else {
      fill(255, max(128, 255 + I * 64), 255 + I * 128)
    }
    let x = l + w / (keys.length - 1) * i;
    let y = h - I * 10
    channelPositions.push({
      x: x,
      y: y,
      y0: h,
      comp: comp,
      key: keys[i]
    })
    if (comp.disabled[keys[i]]) {
      fill('red')
      stroke('red')
      line(x-5, h-5, x+5, h+5)
      line(x+5, h-5, x-5, h+5)
      noStroke()
    } else {
      circle(x, y, 12)
    }
    fill('black')
    textAlign(CENTER, BOTTOM);
    text(keys[i].substr(2), x, h - 10)
  }
}

let Vmin = 0;
let Vmax = 1;

function fillV(V) {
  Vmin = min(V, Vmin)
  Vmax = max(V, Vmax)
  let x = (V - Vmin) / (Vmax - Vmin)
  fill(x * 100, x * x * 300, x * 400)
}

let Vs = []
let Va = []
let Vd = []
let ii = 0;

function draw() {
  noStroke()
  for (let i = 0; i < 1333 / 10; i++) {
    timestep(neuron, 0.025)
    if (mouseIsPressed && getCompAtMouse() === false) {
      neuron.V_dend += mouseX / W * 0.025 * 20
    }
    neuron.I_app += random(-1, 1) * 0.025 - neuron.I_app * 0.025 * 0.1
    ii += 1
    if (ii % 20 == 0) {
      Vs[ii / 20 % W] = neuron.V_soma
      Vd[ii / 20 % W] = neuron.V_dend
      Va[ii / 20 % W] = neuron.V_axon
    }
  }


  background(255, 200, 128);
  fillV(neuron.V_dend)
  rect(W * 0.1, H / 5 * 2, W * 0.2, H / 5)


  fillV(neuron.V_axon)
  rect(W * 0.7, H / 7 * 2, W * 0.2, H / 7 * 3)
  fillV(neuron.V_soma)
  rect(W * 0.3, H / 5, W * 0.4, H / 5 * 3)

  channelPositions = []
  channels(neuron.dend, H / 5 * 2, W * 0.125, W * 0.15)
  channels(neuron.soma, H / 5, W * 0.35, W * 0.3)
  channels(neuron.axon, H / 7 * 2, W * 0.725, W * 0.15)

  textAlign(CENTER, CENTER);
  fill(255)
  text('Axon\n' + neuron.V_axon.toFixed(1) + 'mV', W * 0.8, H / 2)
  text('Soma\n' + neuron.V_soma.toFixed(1) + 'mV', W / 2, H / 2)
  text('Dend\n' + neuron.V_dend.toFixed(1) + 'mV\n'
       + 'Ca2Plus ' + neuron.Ca2Plus.toFixed(2), W * 0.2, H / 2)
  fill(0)
  text((neuron.t / 1000).toFixed(2) + 's', 0 + 40, H - 40)

  stroke(0)
  strokeWeight(2)
  for (let i = 0; i < W; i++) {
    stroke(255)
    point(i, ((Va[i] || Vmin) - Vmin) / (Vmax - Vmin) * -H * 0.3 + H)
    stroke(255, 0, 0)
    point(i, ((Vd[i] || Vmin) - Vmin) / (Vmax - Vmin) * -H * 0.3 + H)
    stroke(0)
    point(i, ((Vs[i] || Vmin) - Vmin) / (Vmax - Vmin) * -H * 0.3 + H)
  }
  noStroke()
  fill(127)
  text("Click on channels to disable them,\nclick anywhere else to add " + (mouseX / W * 20).toFixed(2) + 'mV/s to dend', W / 2, 20)
}

function getCompAtMouse() {
  for (let i = 0; i < channelPositions.length; i++) {
    let c = channelPositions[i];
    let dx = c.x - mouseX
    let dy = c.y - mouseY
    let dy0 = c.y0 - mouseY
    if (dx*dx + dy*dy < 200 || dx*dx + dy0*dy0 < 200) {
      return c;
    }
  }
  return false;
}

function mouseClicked() {
  let c = getCompAtMouse()
  if (c === false) return;
  circle(mouseX, mouseY, 100)
  c.comp.disabled[c.key] = !c.comp.disabled[c.key]
}

function mkneuron() {
  return {
    V_soma: -60,
    V_dend: -60,
    V_axon: -60,
    Ca2Plus: 3.7152,
    I_CaH: 0.5,

    Sodium_h: 0.3596066,
    Potassium_n: 0.2369847,
    Potassium_x_s: 0.1,
    Calcium_k: 0.7423159,
    Calcium_l: 0.0321349,
    Calcium_r: 0.0113,
    Potassium_s: 0.0049291,
    Hcurrent_q: 0.0337836,
    Sodium_h_a: 0.9,
    Potassium_x_a: 0.2369847,

    // params
    g_CaL: 1.1, // Calcium T - (CaV 3.1) (0.7)
    g_int: 0.13, // Cell internal conductance  -- now a parameter (0.13)
    g_h: 0.12, // H current (HCN) (0.4996)
    g_K_Ca: 35, // Potassium  (KCa v1.1 - BK) (35)
    //float g_ld     =   0.016;   // Leak dendrite (0.016)
    g_la: 0.016, // Leak axon (0.016)
    g_ls: 0.016, // Leak soma (0.016)

    I_app: 0,
    V_app: 0,
    I_cx36: 0,
    /* gap current */
    t: 0,

    soma: {disabled:{}},
    axon: {disabled:{}},
    dend: {disabled:{}}

  }
}

function timestep(neuron, delta) {
  neuron.t += delta;
  /* Capacitance */
  const C_m = 1; // uF/cm^2

  /* Somatic conductances (mS/cm2) */
  const g_Na_s = 150; // Sodium  - (Na v1.6 )
  const g_Kdr_s = 9.0; // Potassium - (K v4.3)
  const g_K_s = 5; // Potassium - (K v3.4)

  /* Dendritic conductances (mS/cm2) */
  const g_CaH = 4.5; // High-threshold calcium -- Ca V2.1

  /* Axon hillock conductances (mS/cm2) */
  const g_Na_a = 240; // Sodium
  const g_K_a = 240; // Potassium (20)

  /* Cell morphology */
  const p1 = 0.25; // Cell surface ratio soma/dendrite
  const p2 = 0.15; // Cell surface ratio axon(hillock)/soma

  /* Reversal potentials */
  const V_Na = 55; // Sodium
  const V_K = -75; // Potassium
  const V_Ca = 120; // Calcium
  const V_h = -43; // H current
  const V_l = 10; // Leak

  const V_gaba_dend = -70; // from Devor and Yarom, 2002
  const V_gaba_soma = -63; // from Devor and Yarom, 2002
  const V_ampa = 0;

  const arbitrary = 1;

  const g_ampa = 0;
  const g_gaba_soma = 0;
  const g_gaba_dend = 0;
  const g_ampa_dend = 0;
  const gbar_ampa = 0.1;
  const gbar_ampa_dend = 0.1;
  const gbar_gaba_soma = 0.5;
  const gbar_gaba_dend = 0.25;
  const g_Ld = 0.01532;

  let V_soma = neuron.V_soma;
  let V_dend = neuron.V_dend;
  let V_axon = neuron.V_axon;
  let Ca2Plus =  neuron.dend.disabled.I_CaH ? 0 : neuron.Ca2Plus;
  let I_app = neuron.I_app;
  let V_app = neuron.V_app;
  let I_CaH = neuron.I_CaH;
  let I_cx36 = 0; //neuron.I_cx36;
  let Sodium_h = neuron.Sodium_h;
  let Potassium_n = neuron.Potassium_n;
  let Potassium_x_s = neuron.Potassium_x_s;
  let Calcium_k = neuron.Calcium_k;
  let Calcium_l = neuron.Calcium_l;
  let Calcium_r = neuron.Calcium_r;
  let Potassium_s = neuron.Potassium_s;
  let Hcurrent_q = neuron.Hcurrent_q;
  let Sodium_h_a = neuron.Sodium_h_a;
  let Potassium_x_a = neuron.Potassium_x_a;
  let g_CaL = neuron.g_CaL;
  let g_int = neuron.g_int;
  let g_h = neuron.g_h;
  let g_K_Ca = neuron.g_K_Ca;
  let g_la = neuron.g_la;
  let g_ls = neuron.g_ls;

  let k_inf = (1 / (1. + Math.exp(-1. * (V_soma + 61.0) / 4.2)));
  let l_inf = (1 / (1. + Math.exp((V_soma + 85.5) / 8.5)));

  let tau_k = 1;
  let tau_l = ((20. * Math.exp((V_soma + 160.) / 30) / (1 + Math.exp((V_soma + 84) / 7.3))) + 35);

  let dk_dt = (k_inf - Calcium_k) / tau_k;
  let dl_dt = (l_inf - Calcium_l) / tau_l;

  let k = delta * dk_dt + Calcium_k;
  let l = delta * dl_dt + Calcium_l;

  let m_inf = 1 / (1 + (Math.exp((-30 - V_soma) / 5.5)));
  let h_inf = 1 / (1 + (Math.exp((-70 - V_soma) / -5.8)));
  let tau_h = 3 * Math.exp((-40 - V_soma) / 33);

  let dh_dt = (h_inf - Sodium_h) / tau_h;

  let m = m_inf;
  let h = Sodium_h + delta * dh_dt;

  let n_inf = 1 / (1 + Math.exp((-3 - V_soma) / 10));
  let tau_n = 5 + (47 * Math.exp(-(-50. - V_soma) / 900));
  let dn_dt = (n_inf - Potassium_n) / tau_n;
  let n = delta * dn_dt + Potassium_n;

  let alpha_x_s = 0.13 * (V_soma + 25) / (1 - Math.exp(-(V_soma + 25) / 10));
  let beta_x_s = 1.69 * Math.exp(-0.0125 * (V_soma + 35));

  let x_inf_s = alpha_x_s / (alpha_x_s + beta_x_s);
  let tau_x_s = 1 / (alpha_x_s + beta_x_s);

  let dx_dt_s = (x_inf_s - Potassium_x_s) / tau_x_s;
  let x_s = delta * dx_dt_s + Potassium_x_s;

  let q_inf = 1 / (1 + Math.exp((V_dend + 80) / 4));
  let tau_q = 1 / (Math.exp(-0.086 * V_dend - 14.6) + Math.exp(0.070 * V_dend - 1.87));
  let dq_dt = (q_inf - Hcurrent_q) / tau_q;
  let q = delta * dq_dt + Hcurrent_q;

  let alpha_r = 1.7 / (1 + Math.exp(-(V_dend - 5) / 13.9));
  let beta_r = 0.02 * (V_dend + 8.5) / (Math.exp((V_dend + 8.5) / 5) - 1);
  let r_inf = alpha_r / (alpha_r + beta_r);
  let tau_r = 5 / (alpha_r + beta_r);
  let dr_dt = (r_inf - Calcium_r) / tau_r;
  let r = delta * dr_dt + Calcium_r;

  let alpha_s = (0.00002 * Ca2Plus) * (0.00002 * Ca2Plus < 0.01) + 0.01 * ((0.00002 * Ca2Plus) > 0.01);
  if (neuron.dend.disabled.I_CaH) alpha_s = 0
  let beta_s = 0.015;
  let s_inf = alpha_s / (alpha_s + beta_s);
  let tau_s = 1 / (alpha_s + beta_s);
  let ds_dt = (s_inf - Potassium_s) / tau_s;
  let s = delta * ds_dt + Potassium_s;

  let dCa_dt = -3 * I_CaH - 0.075 * Ca2Plus;

  let m_inf_a = 1 / (1 + (Math.exp((-30 - V_axon) / 5.5)));
  let h_inf_a = 1 / (1 + (Math.exp((-60 - V_axon) / -5.8)));
  let tau_h_a = 1.5 * Math.exp((-40 - V_axon) / 33);
  let dh_dt_a = (h_inf_a - Sodium_h_a) / tau_h_a;
  let m_a = m_inf_a;
  let h_a = Sodium_h_a + delta * dh_dt_a;

  let alpha_x_a = 0.13 * (V_axon + 25) / (1 - Math.exp(-(V_axon + 25) / 10));
  let beta_x_a = 1.69 * Math.exp(-0.0125 * (V_axon + 35));
  let x_inf_a = alpha_x_a / (alpha_x_a + beta_x_a);
  let tau_x_a = 1 / (alpha_x_a + beta_x_a);
  let dx_dt_a = (x_inf_a - Potassium_x_a) / tau_x_a;
  let x_a = delta * dx_dt_a + Potassium_x_a;

  let I_ds = (g_int / p1) * (V_soma - V_dend);
  let I_CaL = g_CaL * k * k * k * l * (V_soma - V_Ca);
  let I_Na_s = g_Na_s * m * m * m * h * (V_soma - V_Na);
  let I_ls = g_ls * (V_soma - V_l);
  let I_Kdr_s = g_Kdr_s * n * n * n * n * (V_soma - V_K);
  let I_K_s = g_K_s * Math.pow(x_s, 4) * (V_soma - V_K);
  let I_as = (g_int / (1 - p2)) * (V_soma - V_axon);
  let I_amp = gbar_ampa * g_ampa * (V_dend - V_ampa);
  let I_gab_soma = gbar_gaba_soma * g_gaba_soma * (V_soma - V_gaba_soma);

  let I_sd = (g_int / (1 - p1)) * (V_dend - V_soma);
  I_CaH = g_CaH * r * r * (V_dend - V_Ca);
  let I_K_Ca = g_K_Ca * s * (V_dend - V_K);
  let I_ld = g_Ld * (V_dend - V_l);
  let I_h = g_h * q * (V_dend - V_h);
  let I_gab_dend = gbar_gaba_dend * g_gaba_dend * (V_dend - V_gaba_dend);
  let I_amp_dend = gbar_ampa_dend * g_ampa_dend * (V_dend - V_ampa);

  let I_Na_a = g_Na_a * m_a * m_a * m_a * h_a * (V_axon - V_Na);
  let I_la = g_la * (V_axon - V_l);
  let I_sa = (g_int / p2) * (V_axon - V_soma);
  let I_K_a = g_K_a * Math.pow(x_a, 4) * (V_axon - V_K);

  let dVs_dt = (-(
    (neuron.soma.disabled.I_CaL?0:I_CaL) +
    (neuron.soma.disabled.I_ds?0:I_ds) +
    (neuron.soma.disabled.I_as?0:I_as) +
    (neuron.soma.disabled.I_Na_s?0:I_Na_s) +
    (neuron.soma.disabled.I_ls?0:I_ls) +
    (neuron.soma.disabled.I_Kdr_s?0:I_Kdr_s) +
    (neuron.soma.disabled.I_K_s?0:I_K_s) 
     
    )) / C_m;
  let dVd_dt = (-(
    (neuron.dend.disabled.I_CaH?0:I_CaH) +
    (neuron.dend.disabled.I_sd?0:I_sd) +
    (neuron.dend.disabled.I_ld?0:I_ld) +
    (neuron.dend.disabled.I_K_Ca?0:I_K_Ca) +
    I_cx36 +
    (neuron.dend.disabled.I_h?0:I_h) +
    I_gab_dend +
    I_amp_dend) + I_app) / C_m;
  let dVa_dt = (-(
    (neuron.axon.disabled.I_K_a?0:I_K_a) +
    (neuron.axon.disabled.I_sa?0: I_sa) +
    (neuron.axon.disabled.I_la?0:I_la) +
    (neuron.axon.disabled.I_Na_a?0:I_Na_a))) / C_m;

  neuron.Ca2Plus = neuron.dend.disabled.I_CaH ? 0 : delta * dCa_dt + Ca2Plus;
  neuron.V_soma = delta * dVs_dt + V_soma;
  neuron.V_dend = delta * dVd_dt + V_dend;
  neuron.V_axon = delta * dVa_dt + V_axon;
  neuron.I_CaH = I_CaH;
  neuron.Sodium_h = h;
  neuron.Potassium_n = n;
  neuron.Potassium_x_s = x_s;
  neuron.Calcium_k = k;
  neuron.Calcium_l = l;
  neuron.Calcium_r = r;
  neuron.Potassium_s = s;
  neuron.Hcurrent_q = q;
  neuron.Sodium_h_a = h_a;
  neuron.Potassium_x_a = x_a;

  neuron.soma.I_CaL = I_CaL
  neuron.soma.I_ds = I_ds
  neuron.soma.I_as = I_as
  neuron.soma.I_Na_s = I_Na_s
  neuron.soma.I_ls = I_ls
  neuron.soma.I_Kdr_s = I_Kdr_s
  neuron.soma.I_K_s = I_K_s

  neuron.axon.I_K_a = I_K_a
  neuron.axon.I_sa = I_sa
  neuron.axon.I_la = I_la
  neuron.axon.I_Na_a = I_Na_a

  neuron.dend.I_CaH = I_CaH
  neuron.dend.I_sd = I_sd
  neuron.dend.I_ld = I_ld
  neuron.dend.I_K_Ca = I_K_Ca
  neuron.dend.I_h = I_h
}