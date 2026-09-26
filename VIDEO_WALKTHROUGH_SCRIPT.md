# 🎬 Bhowanee Platform — Functionality Walkthrough Script (3–4 Minutes)

**Event:** Smart India Hackathon 2026 Presentation  
**Project:** Bhowanee — Unified Agricultural Commerce & Fintech Ecosystem  
**Team:** Team Nexus  
**Target Video Duration:** 3:30 – 3:45 Minutes (Maximum 4:00 Minutes)  
**Total Word Count:** ~485 Words (Paced at 125–130 words/minute)  
**Tone & Style:** Professional, functionality-first, concise, spoken in first-person plural (*"we"*, *"our platform"*).  
**Strict Focus:** Zero narration of decorative UI, colors, or animations. Strictly one concise line per implemented functionality.

---

## 📋 Comprehensive System Inventory (Implemented Capabilities)

| User Role / Portal | Implemented Features & Actions Covered |
| :--- | :--- |
| **Authentication & Core** (`index.html`, `auth.js`) | Multilingual toggle (EN, MR, HI); Phone + 6-digit SMS / Voice IVR OTP (Farmer & Block Admin); Email + Password + SMS OTP (Buyer, Logistics, Storage, Investor); Staff credentials + Authenticator MFA (Super Admin). |
| **Farmer Dashboard** (`farmer.html`) | Mandi price benchmark comparison; Ask price stepper control; Market tolerance dynamic alerts; "Set my price" listing commit; Live SVG bid board; One-click "Accept best offer" into escrow; Parcel-linked soil & weather telemetry; One-click Block Admin IVR call; Historical escrow settlement log. |
| **Block Administrator** (`block.html`) | Digitized GIS Cadastral Revenue Map (Dindori, Nashik); Satellite aerial vs. vector boundary toggle; Survey Gat number search & quick chips; Parcel distance measurement tool; 7/12 Land Record (Satbara) inspection; Agronomy task certification (sowing, irrigation, harvest); Farm input cost accounting; Farmer directory. |
| **Institutional Buyer** (`buyer.html`) | Commodity & grade lot filtering; Mandi benchmark comparison; Certified quality lab test sheets (QC-ON-118); Forward Demand Planner registration; Live Bid Board with automated price-matching lock; 4-stage Delivery Tracker; Escrow settlement balance & tax invoices. |
| **Logistics Partner** (`logistics.html`) | Multi-truck fleet registry & quintal capacity tracking; Route allotment engine with waypoint sequencing; Scheduled farm-gate pickup windows; Digital Proof of Handoff with weighbridge receipt upload; Transit loss audit log. |
| **Storage & Warehouse** (`storage.html`) | Real-time chamber fill gauges & climate telemetry (❄️ 2°C / humidity); Facility registration form with physical inspection request stepper; Electronic Warehouse Receipts (e-NWR); Multi-chamber batch holding timeline; Direct escrow rental disbursements. |
| **Investor Portal** (`investor.html`) | Direct Agricultural Production Plans evaluation; Side-by-side plan comparison; Portfolio IRR and capital allocation tracking; Automated yield re-investment switch; Taluka-level block risk analytics. |
| **Super Admin Control Room** (`admin.html`) | Statewide Cadastral GIS oversight; Farmland lease contract pipeline; Aggregated supply vs. demand matrix; Master SBI escrow ledger & transaction velocity; Dispute arbitration queue; Platform compliance & audit trail. |

---

## 🎬 Master Timestamped Demonstration Script

| Time | Screen & Presenter Action | Spoken Voice-Over Script (Exact Narration) |
| :--- | :--- | :--- |
| **0:00–0:25** | **Screen:** [`index.html`](file:///c:/Users/mohit/OneDrive/Documents/Bhowanee/index.html) *(Sign-in Page)*<br><br>**Action:**<br>1. Show the sign-in screen and Bhowanee header.<br>2. Click language buttons: **मराठी**, **हिन्दी**, then back to **English**.<br>3. Click **Farmer** role; enter mobile `9822114455`, click *Send code*, and show OTP field.<br>4. Point to role list to show commercial credential and staff MFA modes. | *"Welcome to Bhowanee, developed by Team Nexus for Smart India Hackathon 2026. Bhowanee is a unified agricultural commerce and fintech platform eliminating intermediary exploitation through verified farm procurement and automated escrow settlements.<br><br>The platform supports English, Marathi, and Hindi, featuring role-based authentication with mobile OTP, credential logins, and staff multi-factor security."* |
| **0:25–0:55** | **Screen:** [`farmer.html`](file:///c:/Users/mohit/OneDrive/Documents/Bhowanee/farmer.html) *(Farmer Portal - Prakash Sonawane)*<br><br>**Action:**<br>1. **Sell Tab:** Show lot details (*12 Qt Onion, Gat 118*) and Mandi price (*₹1,880*).<br>2. Click `+10` stepper twice to set ₹2,100, trigger market tolerance prompt, and click **Set my price**.<br>3. **Offers Tab:** Click Offers tab; point to the live bid curve and hover over **Accept best offer**.<br>4. **Field Tab:** Click Field tab; scroll past NPK, soil moisture, and weather forecast.<br>5. **Call Tab:** Click Call tab; point to **Call block administrator** and escrow payment log. | *"In the Farmer Portal, farmers manage produce valuation, buyer offers, and farm telemetry.<br><br>The Sell tab displays verified lot specifications alongside live APMC Mandi benchmark rates.<br><br>Farmers set ask prices using numeric steppers with dynamic market tolerance guidance.<br><br>The Offers tab visualizes live buyer bids, enabling one-click acceptance into escrow.<br><br>The Field tab streams soil NPK and micro-climate data, while the Call tab logs payment receipts."* |
| **0:55–1:25** | **Screen:** [`block.html`](file:///c:/Users/mohit/OneDrive/Documents/Bhowanee/block.html) *(Block Administrator - Dindori, Nashik)*<br><br>**Action:**<br>1. **Block Map:** Pan across Leaflet cadastral map; toggle between **Satellite Aerial** and **Cadastral Vector**.<br>2. Click quick chip **Gat 125**; activate **Measurement Tools** on the bottom toolbar.<br>3. Open right panel for Gat 125; display the **7/12 Land Record (Satbara)** card.<br>4. In the drawer, check off an agronomic task checkbox (*Irrigation / Sowing*).<br>5. Click **Cost log** in sidenav to show input expense ledger. | *"The Block Administrator dashboard provides hyper-local land verification and agronomic governance.<br><br>Administrators navigate interactive cadastral maps, switching between satellite aerial and vector boundaries.<br><br>Search tools and quick chips pinpoint individual Gat survey numbers to measure parcel distances.<br><br>Selecting a parcel reveals verified 7/12 land records detailing ownership, soil type, and crop stages.<br><br>Admins certify agronomy checklists—from sowing to harvest—and audit seasonal input expenses."* |
| **1:25–2:00** | **Screen:** [`buyer.html`](file:///c:/Users/mohit/OneDrive/Documents/Bhowanee/buyer.html) *(Institutional Buyer - Fresh Mart Supply Co.)*<br><br>**Action:**<br>1. **Browse Lots:** Select commodity *Onion* and grade *Grade A*; show KPI cards and Mandi benchmark.<br>2. **Quality Reports:** Click Quality Reports; view Certificate *#QC-ON-118* with lab test specs.<br>3. **Demand Planner:** Click Demand Planner; show volume requirement form (*250 Qt, dock slot*).<br>4. **Live Bid Board:** Click Live Bid Board; step bid to ₹2,100, show auto-close notification, and click **Place Verified Bid**.<br>5. **Delivery Tracker & Invoices:** Click Delivery Tracker to view 4-stage milestones; click Invoices to show settled escrow account. | *"The Institutional Buyer portal streamlines commercial procurement, bidding, and contract fulfillment.<br><br>Browse Lots filters verified produce by commodity and grade against market price benchmarks.<br><br>Quality Reports provide certified laboratory test sheets detailing moisture, size uniformity, and pesticide compliance.<br><br>The Demand Planner registers forward procurement quotas, aligning farm sowing with corporate demand.<br><br>The Live Bid Board facilitates real-time auctions that auto-close when bids match farmer ask prices.<br><br>The Delivery Tracker and Escrow Ledger monitor milestones and automated dock disbursements."* |
| **2:00–2:30** | **Screen:** [`logistics.html`](file:///c:/Users/mohit/OneDrive/Documents/Bhowanee/logistics.html) *(Logistics Partner Dashboard)*<br><br>**Action:**<br>1. **Vehicle Fleet:** Scroll table showing 4 registered trucks, capacities (*118 Qt total*), and driver details.<br>2. **Route Allotment & Schedule:** Click tab; highlight Vehicle 1 timeline (*25th Sep & 30th Sep pickups*) and green **Route Optimization** badge.<br>3. **Farm Gate Pickups:** Click tab; view pending farm collection windows.<br>4. **Proof of Handoff:** Click tab; show digital custody form with weighbridge slip upload.<br>5. **Transit Loss Log:** Click tab; show zero-loss transit record. | *"The Logistics Partner portal coordinates rural transport, scheduled collections, and custody verification.<br><br>Vehicle Fleet registers transport trucks, payload capacities in quintals, and driver assignments.<br><br>The Route Allotment engine sequences multi-farm waypoints into optimized collection corridors, preventing deadhead mileage.<br><br>Farm Gate Pickups coordinates field collection windows and active transit volumes.<br><br>The Proof of Handoff tool validates custody transfers through weighbridge receipts and photo verification.<br><br>A transit loss log audits zero-loss delivery compliance."* |
| **2:30–2:55** | **Screen:** [`storage.html`](file:///c:/Users/mohit/OneDrive/Documents/Bhowanee/storage.html) *(Storage & Warehouse Partner)*<br><br>**Action:**<br>1. **My Facilities & Capacity:** Show cold storage card with live temperature telemetry (*❄️ 2°C Optimal*) and capacity gauges.<br>2. **List Facility & Verification:** Click tab; scroll down facility registration form and Bhowanee 4-step audit stepper.<br>3. **Storage Orders:** Click tab; view electronic warehouse receipts (*e-NWR*) and stored volumes.<br>4. **Holding Timeline & Ledger:** Click Rent & Escrow Ledger; show automated monthly rental settlement (*₹64,350 via SBI Escrow*). | *"The Storage and Warehouse portal manages crop preservation and collateralized inventory.<br><br>Facilities displays live storage fill gauges, temperature telemetry, and humidity sensors.<br><br>Warehouse operators list new facilities and request physical on-site verification from Bhowanee field auditors.<br><br>The Storage Orders tab issues electronic warehouse receipts for inward crop batches.<br><br>Operators track chamber rotation timelines and receive monthly rental disbursements directly through escrow."* |
| **2:55–3:20** | **Screen:** [`investor.html`](file:///c:/Users/mohit/OneDrive/Documents/Bhowanee/investor.html) & [`admin.html`](file:///c:/Users/mohit/OneDrive/Documents/Bhowanee/admin.html)<br><br>**Action:**<br>1. In `investor.html`: On Open Plans, sort plans by IRR; click **Compare Selected**.<br>2. On My Investments: Show crop diversification bar chart and auto-reinvest toggle.<br>3. Switch to `admin.html`: Show statewide cadastral map and Farmland Leases pipeline.<br>4. In `admin.html`: Click Settlement Ledger and Dispute Queue in sidenav. | *"The Investor and Administrator dashboards deliver capital deployment analytics and statewide governance.<br><br>The Investor portal compares agricultural production plans funding verified farm seasons against pre-sold demand.<br><br>Investors monitor portfolio IRR, crop diversification, and automated dividend payouts.<br><br>In the Super Admin Control Room, administrators oversee statewide operations, tracking active land leases and district crop health.<br><br>Platform staff audit master escrow balances, track contract velocity, and resolve dispute tickets."* |
| **3:20–3:45** | **Screen:** Return to [`index.html`](file:///c:/Users/mohit/OneDrive/Documents/Bhowanee/index.html) *(Overview Summary)*<br><br>**Action:**<br>1. Show the complete platform integration context.<br>2. Center on the Bhowanee emblem and mission statement. | *"Bhowanee connects these roles into an unbroken, transparent loop:<br><br>Field sowing is verified on cadastral maps; farmers price their harvest autonomously; buyers secure volumes through forward plans or spot auctions; logistics and cold storage preserve produce quality; and verified dock weighments trigger automated, direct escrow payments to farmers.<br><br>By replacing fragmented middlemen with verifiable data and escrow security, Bhowanee empowers Indian agriculture from field to fork. Thank you."* |

---

## 🎬 Ordered Recording Checklist

Follow this exact sequence during your screen capture session:

- [ ] **1. Sign-in & Authentication (`index.html`):**
  - [ ] Start on sign-in card with full viewport visible.
  - [ ] Click language toggle: **मराठी**, **हिन्दी**, then return to **English**.
  - [ ] Select **Farmer** role; input phone `9822114455`, click **Send code**, enter OTP `123456`.
- [ ] **2. Farmer Portal (`farmer.html`):**
  - [ ] Open **Sell** tab: Point to Mandi price (`₹1,880`), click `+10` stepper twice to `₹2,100`, click **Set my price**.
  - [ ] Open **Offers** tab: Point to the live bid curve and hover on **Accept best offer**.
  - [ ] Open **Field** tab: Scroll to show soil NPK, pH, and weather telemetry.
  - [ ] Open **Call** tab: Point to **Call block administrator** button and payment history list.
- [ ] **3. Block Administrator Dashboard (`block.html`):**
  - [ ] Open **Block map**: Toggle from **Satellite Aerial** to **Cadastral Vector**.
  - [ ] Click quick chip **Gat 125**; click **Measurement Tools** on the bottom bar.
  - [ ] Open right drawer: View **7/12 Land Record** card, check an agronomy task checkbox.
  - [ ] Open **Cost log** tab in sidenav to show input expenditure tracking.
- [ ] **4. Institutional Buyer Dashboard (`buyer.html`):**
  - [ ] Open **Browse Lots**: Select commodity filter **Onion** and grade **Grade A**.
  - [ ] Open **Quality Reports**: View lab certificate `#QC-ON-118`.
  - [ ] Open **Demand Planner**: Scroll through the projected volume registration form.
  - [ ] Open **Live Bid Board**: Adjust counter-bid stepper to `₹2,100`, show auto-close alert.
  - [ ] Open **Delivery Tracker**: Point to the 4-step delivery milestones; view **Invoices & Escrow**.
- [ ] **5. Logistics Partner Dashboard (`logistics.html`):**
  - [ ] Open **Vehicle Fleet**: Scroll through the 4-vehicle fleet table and capacities.
  - [ ] Open **Route Allotment & Schedule**: Show Vehicle 1 route timeline (*25th Sep & 30th Sep*) and green optimization badge.
  - [ ] Open **Farm Gate Pickups**: Show pending collection table.
  - [ ] Open **Proof of Handoff**: Show digital custody transfer form and weighbridge slip upload area.
- [ ] **6. Storage & Warehouse Dashboard (`storage.html`):**
  - [ ] Open **My Facilities & Capacity**: Show temperature telemetry (`❄️ 2°C Optimal`) and fill gauges.
  - [ ] Open **List Facility & Verification**: Scroll through registration fields and 4-step audit stepper.
  - [ ] Open **Storage Orders**: Show electronic warehouse receipts (`e-NWR`).
  - [ ] Open **Rent & Escrow Ledger**: Show monthly rental settlement ledger (`₹64,350`).
- [ ] **7. Investor & Admin Portals (`investor.html` & `admin.html`):**
  - [ ] In `investor.html`: Open **Open Plans**, sort by IRR, click **Compare Selected**.
  - [ ] Open **My Investments**: Show crop diversification bar chart and auto-reinvest switch.
  - [ ] In `admin.html`: Show statewide cadastral GIS map, lease pipeline, and **Settlement Ledger**.
- [ ] **8. Closing Summary (`index.html`):**
  - [ ] Return to main overview and hold cursor steadily on Bhowanee header as you deliver the concluding remarks.

---
*Ready-to-record walkthrough script prepared for Smart India Hackathon 2026 presentation.*
