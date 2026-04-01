                                                                       import { Html5QrcodeScanner } from 'html5-qrcode';
import { db } from './firebase.js';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

let scanner = null;
let currentEmail = null;
let itemImage = null;
let currentSession = null; // 'STORE' | 'RETRIEVE'

export const renderPortal = (container) => {
  const state = {
    step: 'start', // 'start' | 'scan-id' | 'capture-item' | 'success'
  };

  const clearScanner = async () => {
    if (scanner) {
      try {
        await scanner.clear();
        scanner = null;
      } catch (err) {
        console.error("Scanner clear error", err);
      }
    }
  };

  const triggerHardwareLock = async () => {
    try {
      // Station01 command bridge - ESP listens to this document
      await setDoc(doc(db, "stations", "station01"), {
        lockStatus: "OPEN_REQUESTED",
        lastAction: currentSession,
        userEmail: currentEmail,
        timestamp: serverTimestamp()
      });
      console.log("Hardware Lock Signal: OPEN_REQUESTED [Station 01]");
    } catch (e) {
      console.error("Lock trigger error: ", e);
    }
  };

  const saveToInventory = async () => {
    try {
      await addDoc(collection(db, "inventory"), {
        email: currentEmail,
        image: itemImage,
        type: currentSession,
        timestamp: serverTimestamp(),
        stationId: "station01"
      });
    } catch (e) {
      console.error("Firebase Storage Error: ", e);
    }
  };

  const renderStart = () => {
    container.innerHTML = `
      <header class="header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <div class="logo-text">
            <h1>SmartStation</h1>
            <p>Campus Utility Hub</p>
          </div>
        </div>
        <div class="nav-icons">
          <a href="#/"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></a>
          <a href="#/qr"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h1"/><path d="M7 11h1"/><path d="M7 15h1"/><path d="M11 7h1"/><path d="M11 11h1"/><path d="M11 15h1"/><path d="M15 7h1"/><path d="M15 11h1"/><path d="M15 15h1"/></svg></a>
          <a href="#/dashboard"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></a>
        </div>
      </header>

      <div class="portal-container">
        <button id="btn-retrieve-init" class="btn-portal">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
            RETRIEVE ITEM
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>

        <section class="glass card" style="border-left: 4px solid var(--cyan-primary); padding: 1.5rem; border-radius: 8px;">
          <h2 class="font-head">STORE ITEM</h2>
          <p style="color: var(--text-dim); font-size: 0.9rem; margin: 1rem 0;">
            Found an item? Initialize your session with a Student ID scan followed by an item photo.
          </p>
          <button id="btn-store-init" class="btn btn-cyan" style="width: 100%; font-family: var(--font-head); font-weight: 700;">INITIALIZE STORAGE SEQUENCE</button>
        </section>
      </div>

      <footer class="footer">
        <p style="margin-top: 2rem; font-size: 0.8rem; opacity: 0.6; text-align: center;">©️ 2026 SmartStation. Powered by advanced IoT technology.</p>
      </footer>
    `;

    document.getElementById('btn-retrieve-init').addEventListener('click', () => {
      currentSession = 'RETRIEVE';
      state.step = 'scan-id';
      renderScanID();
    });

    document.getElementById('btn-store-init').addEventListener('click', () => {
      currentSession = 'STORE';
      state.step = 'scan-id';
      renderScanID();
    });
  };

  const renderScanID = () => {
    container.innerHTML = `
      <header class="header">
        <div class="logo-container">
          <div class="logo-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
          <div class="logo-text"><h1>SmartStation</h1><p>${currentSession === 'STORE' ? 'Storage Hub' : 'Retrieval Hub'}</p></div>
        </div>
      </header>

      <div class="portal-container" style="text-align: center; display: flex; flex-direction: column; height: calc(100vh - 100px);">
        <div style="margin-bottom: 2rem;">
          <h2 class="font-head" style="color: var(--cyan-primary); margin-bottom: 0.5rem;">STEP 1: VERIFY IDENTITY</h2>
          <p style="color: var(--text-dim); font-size: 0.8rem;">Align your Student ID QR within the frame.</p>
        </div>
        
        <div class="scanner-viewfinder" id="reader" style="flex: 1; min-height: 250px;">
          <div class="scan-line"></div>
          <div class="scanner-overlay"></div>
        </div>

        <div style="padding-top: 1.5rem;">
          <button id="btn-cancel-scan" class="btn-portal" style="border-color: var(--purple-secondary); color: var(--purple-secondary);">
            <div style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              CANCEL SESSION
            </div>
          </button>
        </div>
      </div>
    `;

    try {
      scanner = new Html5QrcodeScanner("reader", { fps: 15, qrbox: 250 });
      scanner.render(async (decodedText) => {
        currentEmail = decodedText;
        await clearScanner();
        
        if (currentSession === 'STORE') {
          state.step = 'capture-item';
          renderCaptureItem();
        } else {
          state.step = 'success';
          renderSuccess();
        }
      });
    } catch (e) {
      console.error("Scanner init error", e);
    }

    document.getElementById('btn-cancel-scan').addEventListener('click', async () => {
      await clearScanner();
      state.step = 'start';
      renderStart();
    });
  };

  const renderCaptureItem = () => {
    container.innerHTML = `
      <header class="header">
        <div class="logo-container">
          <div class="logo-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
          <div class="logo-text"><h1>SmartStation</h1><p>Item Documentation</p></div>
        </div>
      </header>

      <div class="portal-container" style="text-align: center; display: flex; flex-direction: column; height: calc(100vh - 100px);">
        <div style="margin-bottom: 2rem;">
          <h2 class="font-head" style="color: var(--cyan-primary); margin-bottom: 0.5rem;">STEP 2: CAPTURE ITEM</h2>
          <p style="color: var(--text-dim); font-size: 0.8rem;">Hold the item in front of the camera.</p>
        </div>
        
        <div class="scanner-viewfinder" style="flex: 1; min-height: 250px; background: #000;">
          <video id="item-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
          <div style="position: absolute; inset: 0; border: 2px solid var(--cyan-primary); box-shadow: inset 0 0 50px var(--cyan-glow); pointer-events: none;"></div>
        </div>

        <canvas id="item-canvas" style="display: none;"></canvas>

        <div style="padding-top: 1.5rem;">
          <button id="btn-capture" class="btn btn-cyan" style="width: 100%; font-family: var(--font-head); height: 50px; margin-bottom: 1rem;">CAPTURE SNAPSHOT</button>
          <button id="btn-abort-capture" class="btn-portal" style="border-color: var(--purple-secondary); color: var(--purple-secondary); height: 50px;">
            ABORT SESSION
          </button>
        </div>
      </div>
    `;

    const video = document.getElementById('item-video');
    const canvas = document.getElementById('item-canvas');
    let stream = null;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => {
        stream = s;
        video.srcObject = s;
      })
      .catch(err => console.error("Video error", err));

    const stopStream = () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };

    document.getElementById('btn-capture').addEventListener('click', () => {
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      itemImage = canvas.toDataURL('image/png');
      stopStream();
      state.step = 'success';
      renderSuccess();
    });

    document.getElementById('btn-abort-capture').addEventListener('click', () => {
      stopStream();
      state.step = 'start';
      renderStart();
    });
  };

  const renderSuccess = async () => {
    // 1. Write Log and Take Photo to Archive
    await saveToInventory();

    // 2. TRIGGER PHYSICAL HARDWARE LOCK
    await triggerHardwareLock();

    container.innerHTML = `
      <div class="portal-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 85vh; text-align: center;">
        <div style="width: 80px; height: 80px; background: var(--green-status); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 class="font-head" style="color: var(--green-status); font-size: 1.5rem; margin-bottom: 0.5rem;">ACCESS GRANTED</h2>
        <p style="color: var(--cyan-primary); font-weight: bold; margin-bottom: 1rem; border: 1px solid var(--cyan-primary); padding: 4px 12px; border-radius: 4px;">LOCK STATUS: OPEN</p>
        
        <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 2rem; width: 100%;">
          <p style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Identity Verified</p>
          <p style="color: #fff; font-weight: bold;">${currentEmail || 'Station User'}</p>
        </div>

        <p style="color: var(--text-dim); font-size: 0.85rem; margin-bottom: 2.5rem; max-width: 280px;">
          The hardware box is now unlocked. Please complete your transaction and close the lid securely.
        </p>

        <button id="btn-finish" class="btn btn-cyan" style="width: 100%;">LOCK & FINISH SESSION</button>
      </div>
    `;

    document.getElementById('btn-finish').addEventListener('click', async () => {
      // Clear the lock command
      await setDoc(doc(db, "stations", "station01"), {
        lockStatus: "IDLE",
        timestamp: serverTimestamp()
      }, { merge: true });
      
      state.step = 'start';
      renderStart();
    });
  };

  if (state.step === 'start') renderStart();
};