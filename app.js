(() => {
  const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;
  const TRANSLIT = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
    J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
    S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  };
  const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

  const YEAR_CODES = {
    A: [1980, 2010], B: [1981, 2011], C: [1982, 2012], D: [1983, 2013],
    E: [1984, 2014], F: [1985, 2015], G: [1986, 2016], H: [1987, 2017],
    J: [1988, 2018], K: [1989, 2019], L: [1990, 2020], M: [1991, 2021],
    N: [1992, 2022], P: [1993, 2023], R: [1994, 2024], S: [1995, 2025],
    T: [1996, 2026], V: [1997, 2027], W: [1998, 2028], X: [1999, 2029],
    Y: [2000, 2030], "1": [2001, 2031], "2": [2002, 2032], "3": [2003, 2033],
    "4": [2004, 2034], "5": [2005, 2035], "6": [2006, 2036], "7": [2007, 2037],
    "8": [2008, 2038], "9": [2009, 2039],
  };

  const COUNTRY = {
    "1": "United States", "4": "United States", "5": "United States",
    "2": "Canada", "3": "Mexico",
    "J": "Japan", "K": "South Korea", "L": "China",
    "S": "United Kingdom", "T": "Czechia / Hungary / Switzerland",
    "V": "France / Spain", "W": "Germany", "X": "Russia / Europe",
    "Y": "Sweden / Finland / Norway", "Z": "Italy",
    "6": "Australia", "7": "New Zealand / United States (late WMIs)",
    "8": "Argentina / Chile", "9": "Brazil",
  };

  const WMI = {
    "1G1": "Chevrolet (USA)",
    "1GC": "Chevrolet Truck (USA)",
    "1FA": "Ford (USA)",
    "1FT": "Ford Truck (USA)",
    "1FM": "Ford MPV (USA)",
    "1HG": "Honda (USA)",
    "1C4": "Chrysler / Jeep (USA)",
    "1C6": "Ram (USA)",
    "1N4": "Nissan (USA)",
    "2HG": "Honda (Canada)",
    "2T1": "Toyota (Canada)",
    "3VW": "Volkswagen (Mexico)",
    "4T1": "Toyota (USA)",
    "5YJ": "Tesla — Fremont, CA",
    "5UX": "BMW SUV (USA)",
    "7SA": "Tesla — Austin, TX (MPV)",
    "7G2": "Tesla — Austin, TX (Cybertruck / Semi)",
    "JN1": "Nissan (Japan)",
    "JTD": "Toyota (Japan)",
    "JM1": "Mazda (Japan)",
    "JF1": "Subaru (Japan)",
    "JHM": "Honda (Japan)",
    "KMH": "Hyundai (Korea)",
    "KNA": "Kia (Korea)",
    "LRW": "Tesla — Shanghai",
    "SAL": "Land Rover (UK)",
    "SAJ": "Jaguar (UK)",
    "WBA": "BMW (Germany)",
    "WBS": "BMW M (Germany)",
    "WDB": "Mercedes-Benz (Germany)",
    "WDD": "Mercedes-Benz (Germany)",
    "WVW": "Volkswagen (Germany)",
    "WAU": "Audi (Germany)",
    "WP0": "Porsche (Germany)",
    "XP7": "Tesla — Berlin",
    "YV1": "Volvo (Sweden)",
    "ZFF": "Ferrari (Italy)",
  };

  const TESLA_WMI = new Set(["5YJ", "7SA", "7G2", "LRW", "XP7"]);

  const TESLA_LINE = {
    S: "Model S",
    "3": "Model 3",
    X: "Model X",
    Y: "Model Y",
    C: "Cybertruck",
    R: "Roadster",
    T: "Semi",
  };

  const TESLA_BODY = {
    A: "Hatchback 5-door / LHD",
    B: "Hatchback 5-door / RHD",
    C: "Class E MPV / 5-door / LHD",
    E: "Sedan 4-door / LHD",
    F: "Sedan 4-door / RHD",
    G: "Class D MPV / 5-door / LHD",
    H: "Class D MPV / 5-door / RHD",
  };

  const TESLA_RESTRAINT = {
    A: "Type 2 belts FR / SR*3 / TR*2, front airbags, PODS, side + knee",
    B: "Type 2 belts FR / SR*2 / TR*2, front airbags, PODS, side + knee",
    C: "Type 2 belts FR / SR*3, front airbags, PODS, side",
    D: "Type 2 belts FR / SR*3, front airbags, PODS, side + knee",
  };

  const TESLA_FUEL = {
    E: "Electric (NCA / ternary Li-ion on many plants)",
    F: "Electric — LFP (lithium iron phosphate)",
  };

  const TESLA_DRIVE = {
    A: "Single motor",
    B: "Dual motor",
    D: "Single motor — Standard / Performance (Y)",
    E: "Dual motor — Standard",
    F: "Dual motor — Performance",
    J: "Single motor — Standard",
    K: "Dual motor — Standard",
    L: "Dual motor — Performance",
    R: "Single motor — Standard",
    S: "Single motor — Standard",
    P: "Tri motor / Plaid-class",
  };

  const TESLA_PLANT = {
    F: "Fremont, California",
    A: "Austin, Texas (Giga Texas)",
    B: "Berlin-Brandenburg (Giga Berlin)",
    C: "Shanghai (Giga Shanghai)",
    P: "Fremont / other US plant code",
    N: "Reno / related Tesla plant code",
  };

  const POS_LABEL = [
    "Country / region",
    "Manufacturer",
    "Vehicle type / division",
    "Model / line",
    "Body / restraint / GVWR",
    "Restraint / series",
    "Engine / fuel / battery",
    "Motor / transmission / drive",
    "Check digit",
    "Model year",
    "Assembly plant",
    "Serial",
    "Serial",
    "Serial",
    "Serial",
    "Serial",
    "Serial",
  ];

  const BREAKDOWN_LABEL = [
    "Country",
    "Manufact",
    "Division",
    "Line",
    "Body",
    "Restraint",
    "Engine",
    "Drive",
    "Check digit",
    "Year",
    "Plant",
    "Serial",
  ];

  const NHTSA_FIELDS = [
    ["Make", "Make"],
    ["Model", "Model"],
    ["ModelYear", "Year"],
    ["Trim", "Trim"],
    ["Series", "Series"],
    ["BodyClass", "Body"],
    ["VehicleType", "Type"],
    ["Doors", "Doors"],
    ["DriveType", "Drive"],
    ["ElectrificationLevel", "Electrification"],
    ["FuelTypePrimary", "Fuel"],
    ["EVDriveUnit", "EV drive unit"],
    ["OtherEngineInfo", "Powertrain note"],
    ["EngineModel", "Engine"],
    ["EngineCylinders", "Cylinders"],
    ["DisplacementL", "Displacement (L)"],
    ["EngineHP", "Horsepower"],
    ["TransmissionStyle", "Transmission"],
    ["GVWR", "GVWR"],
    ["PlantCity", "Plant city"],
    ["PlantState", "Plant state"],
    ["PlantCountry", "Plant country"],
    ["Manufacturer", "Manufactr"],
    ["SteeringLocation", "Steering"],
    ["Seats", "Seats"],
    ["SeatRows", "Seat rows"],
    ["BatteryKWh", "Battery kWh"],
    ["BatteryType", "Battery type"],
    ["BasePrice", "Base price (USD)"],
  ];

  const vinInput = document.getElementById("vin");
  const decodeBtn = document.getElementById("decode");
  const slots = document.getElementById("slots");
  const statusEl = document.getElementById("status");
  const hero = document.getElementById("hero");
  const anatomy = document.getElementById("anatomy");
  const anatomyGrid = document.getElementById("anatomy-grid");
  const breakdown = document.getElementById("breakdown");
  const breakdownBody = document.querySelector("#breakdown-table tbody");
  const teslaPanel = document.getElementById("tesla");
  const teslaCards = document.getElementById("tesla-cards");
  const specs = document.getElementById("specs");
  const specCards = document.getElementById("spec-cards");
  const nhtsaNote = document.getElementById("nhtsa-note");
  const allBody = document.querySelector("#all-fields tbody");

  for (let i = 0; i < 17; i += 1) {
    const d = document.createElement("div");
    d.className = "slot";
    d.dataset.i = String(i);
    slots.appendChild(d);
  }

  const VPIC_HREF = "https://vpic.nhtsa.dot.gov/api/";

  function nhtsaAnchor() {
    return `<a class="nhtsa-link" href="${VPIC_HREF}" target="_blank" rel="noopener noreferrer">NHTSA vPIC API Documentation</a>`;
  }

  function setNhtsaNote(extra) {
    const note = String(extra || "").trim();
    nhtsaNote.innerHTML = note
      ? `${nhtsaAnchor()}<span class="nhtsa-api-note">Notes: ${note}</span>`
      : nhtsaAnchor();
  }

  function normalize(value) {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
  }

  function checkDigit(vin) {
    let sum = 0;
    for (let i = 0; i < 17; i += 1) {
      const ch = vin[i];
      const n = /\d/.test(ch) ? Number(ch) : TRANSLIT[ch] ?? 0;
      sum += n * WEIGHTS[i];
    }
    const rem = sum % 11;
    return rem === 10 ? "X" : String(rem);
  }

  function knownMake(vin) {
    return isTesla(vin) || Boolean(WMI[vin.slice(0, 3)]);
  }

  function yearInfo(vin) {
    const pair = YEAR_CODES[vin[9]];
    if (!pair) return { year: "Unknown", footnote: "" };
    const cap = new Date().getFullYear() + 1;
    const opts = pair.filter((y) => y <= cap);
    if (!opts.length) return { year: String(pair[0]), footnote: "" };
    const year = String(opts[opts.length - 1]);
    const prior = opts.length > 1 ? opts[0] : null;
    const footnote = !knownMake(vin) && prior != null
      ? `also ${prior} · same letter on the previous 30-year cycle`
      : "";
    return { year, footnote };
  }

  function yearGuess(vin) {
    return yearInfo(vin).year;
  }

  function wmiName(wmi) {
    return WMI[wmi] || `${COUNTRY[wmi[0]] || "Unknown region"} manufacturer`;
  }

  function isTesla(vin) {
    return TESLA_WMI.has(vin.slice(0, 3));
  }

  function paintSlots(vin) {
    [...slots.children].forEach((el, i) => {
      el.textContent = vin[i] || "";
      el.classList.toggle("filled", Boolean(vin[i]));
    });
  }

  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.className = `status ${kind || ""}`;
  }

  function card(label, value) {
    const wrap = document.createElement("div");
    wrap.className = "card";
    wrap.innerHTML = `<dt>${label}</dt><dd>${value || "—"}</dd>`;
    return wrap;
  }

  function yearLabel(vin) {
    const info = yearInfo(vin);
    if (!info.footnote) return info.year;
    return `${info.year}<span class="year-note">${info.footnote}</span>`;
  }

  function pair(code, meaning) {
    if (!meaning || meaning === code) return `<span class="code">${code}</span>`;
    return `<span class="code">${code}</span>${meaning}`;
  }

  function rowGroup(index) {
    if (index < 3) return "wmi";
    if (index < 8) return "vds";
    if (index === 8) return "chk";
    return "vis";
  }

  function positionMeaning(vin, index) {
    const ch = vin[index];
    const tesla = isTesla(vin);
    switch (index) {
      case 0:
        return pair(ch, COUNTRY[ch] || "Region unknown");
      case 1:
      case 2:
        return pair(ch, index === 2 ? wmiName(vin.slice(0, 3)) : wmiName(vin.slice(0, 3)).split(" —")[0]);
      case 3:
        return pair(ch, tesla ? TESLA_LINE[ch] : "Manufacturer line code");
      case 4:
        return pair(ch, tesla ? TESLA_BODY[ch] : "Body / GVWR code");
      case 5:
        return pair(ch, tesla ? TESLA_RESTRAINT[ch] : "Restraint / series code");
      case 6:
        return pair(ch, tesla ? TESLA_FUEL[ch] : "Engine / fuel code");
      case 7:
        return pair(ch, tesla ? TESLA_DRIVE[ch] : "Drive / transmission code");
      case 8: {
        const expected = checkDigit(vin);
        const ok = expected === ch;
        return pair(ch, ok ? "Valid (49 CFR 565)" : `Mismatch — expected ${expected}`);
      }
      case 9:
        return pair(ch, yearLabel(vin));
      case 10:
        return pair(ch, tesla ? (TESLA_PLANT[ch] || "Plant code") : "Assembly plant code");
      default:
        return pair(vin.slice(11), "Production sequence");
    }
  }

  function renderBreakdown(vin) {
    breakdown.classList.remove("hidden");
    breakdownBody.innerHTML = "";
    for (let i = 0; i < 11; i += 1) {
      const tr = document.createElement("tr");
      tr.className = rowGroup(i);
      tr.innerHTML = `<td>${i + 1}</td><td>${BREAKDOWN_LABEL[i]}</td><td>${positionMeaning(vin, i)}</td>`;
      breakdownBody.appendChild(tr);
    }
    const serial = document.createElement("tr");
    serial.className = "vis";
    serial.innerHTML = `<td>12–17</td><td>${BREAKDOWN_LABEL[11]}</td><td>${positionMeaning(vin, 11)}</td>`;
    breakdownBody.appendChild(serial);
  }

  function renderLocal(vin) {
    const expected = checkDigit(vin);
    const valid = expected === vin[8];
    const wmi = vin.slice(0, 3);
    const year = yearGuess(vin);
    const makeGuess = isTesla(vin)
      ? "Tesla"
      : (WMI[wmi] || "").split("—")[0].split("(")[0].trim() || "See WMI";

    hero.classList.remove("hidden");
    hero.innerHTML = `
      <article class="hero-card">
        <p class="kicker">${wmi} · ${COUNTRY[vin[0]] || "Region unknown"}</p>
        <h2>${makeGuess}${isTesla(vin) && TESLA_LINE[vin[3]] ? " " + TESLA_LINE[vin[3]] : ""}</h2>
        <p class="sub">${wmiName(wmi)} · model year code ${vin[9]} → ${year}${yearInfo(vin).footnote ? ` <span class=\"year-note\">${yearInfo(vin).footnote}</span>` : ""} · plant ${vin[10]} · serial ${vin.slice(11)}</p>
        <div class="pill-row">
          <span class="pill">WMI ${wmi}</span>
          <span class="pill">Year ${year}</span>
          <span class="pill">Plant ${vin[10]}</span>
          <span class="pill">Serial ${vin.slice(11)}</span>
        </div>
      </article>
      <article class="check-card ${valid ? "valid" : "invalid"}">
        <p class="kicker">Check digit</p>
        <p class="big">${vin[8]}</p>
        <p class="sub">${valid ? "Matches 49 CFR 565 calculation." : `Expected ${expected}. North American VINs should match; some EU VINs skip this rule.`}</p>
      </article>
    `;

    anatomy.classList.remove("hidden");
    anatomyGrid.innerHTML = "";
    [...vin].forEach((ch, i) => {
      const cell = document.createElement("div");
      cell.className = `cell ${rowGroup(i)}`;
      cell.title = `Position ${i + 1}: ${POS_LABEL[i]}`;
      cell.innerHTML = `<span class="pos">${i + 1}</span><span class="ch">${ch}</span><span class="mean">${POS_LABEL[i]}</span>`;
      anatomyGrid.appendChild(cell);
    });

    renderBreakdown(vin);

    if (isTesla(vin)) {
      teslaPanel.classList.remove("hidden");
      teslaCards.innerHTML = "";
      const rows = [
        ["WMI", wmiName(wmi)],
        ["Line", TESLA_LINE[vin[3]] || vin[3]],
        ["Body", TESLA_BODY[vin[4]] || vin[4]],
        ["Battery / fuel", TESLA_FUEL[vin[6]] || vin[6]],
        ["Drive unit", TESLA_DRIVE[vin[7]] || vin[7]],
        ["Model year", year],
        ["Plant", TESLA_PLANT[vin[10]] || vin[10]],
        ["Sequence", vin.slice(11)],
      ];
      rows.forEach(([k, v]) => teslaCards.appendChild(card(k, v)));
    } else {
      teslaPanel.classList.add("hidden");
      teslaCards.innerHTML = "";
    }
  }

  function renderNhtsa(result) {
    specs.classList.remove("hidden");
    specCards.innerHTML = "";
    allBody.innerHTML = "";
    const code = String(result.ErrorCode || "").trim();
    const text = String(result.ErrorText || "").trim();
    const apiNote = (code && code !== "0") ? (text || code) : "";
    setNhtsaNote(apiNote);

    NHTSA_FIELDS.forEach(([key, label]) => {
      const value = (result[key] || "").trim();
      if (value) specCards.appendChild(card(label, value));
    });

    Object.keys(result)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        const value = String(result[key] ?? "").trim();
        if (!value) return;
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${key}</td><td>${value}</td>`;
        allBody.appendChild(tr);
      });
  }

  async function lookupNhtsa(vin) {
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NHTSA HTTP ${res.status}`);
    const data = await res.json();
    const row = data.Results && data.Results[0];
    if (!row) throw new Error("Empty NHTSA response");
    return row;
  }

  async function decode(raw) {
    const vin = normalize(raw);
    vinInput.value = vin;
    paintSlots(vin);

    if (vin.length !== 17) {
      setStatus(`${vin.length} / 17 characters`, vin.length ? "bad" : "");
      hero.classList.add("hidden");
      anatomy.classList.add("hidden");
      breakdown.classList.add("hidden");
      teslaPanel.classList.add("hidden");
      specs.classList.add("hidden");
      return;
    }
    if (!VIN_RE.test(vin)) {
      setStatus("Invalid characters — I, O and Q are not allowed.", "bad");
      return;
    }

    renderLocal(vin);
    setStatus("Structure decoded. Fetching NHTSA specs…");
    decodeBtn.disabled = true;
    try {
      const row = await lookupNhtsa(vin);
      renderNhtsa(row);
      const make = row.Make || "";
      const model = row.Model || "";
      const year = row.ModelYear || "";
      setStatus(
        [year, make, model].filter(Boolean).join(" ") || "NHTSA decode complete.",
        "ok"
      );
    } catch (err) {
      specs.classList.remove("hidden");
      specCards.innerHTML = "";
      specCards.appendChild(
        card(
          "Official specs unavailable",
          "The NHTSA request was blocked or offline. Local structure above is still valid. Serve this folder over http:// if you opened the file directly."
        )
      );
      setNhtsaNote(String(err.message || err));
      setStatus("Local decode only — NHTSA lookup failed.", "bad");
    } finally {
      decodeBtn.disabled = false;
    }
  }

  vinInput.addEventListener("input", () => {
    const vin = normalize(vinInput.value);
    vinInput.value = vin;
    paintSlots(vin);
    if (vin.length === 17 && VIN_RE.test(vin)) setStatus("Ready to decode.");
    else setStatus(vin.length ? `${vin.length} / 17` : "");
  });

  vinInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") decode(vinInput.value);
  });

  decodeBtn.addEventListener("click", () => decode(vinInput.value));

  document.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => decode(btn.dataset.vin));
  });

  paintSlots("");
})();
