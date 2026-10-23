
// ===== Auth: attach the token to every /api call, and bounce to login on 401 =====
const _rawfetch = window.fetch.bind(window);
window.fetch = function (url, opts) {
    opts = opts || {};
    const u = (typeof url === "string") ? url : (url && url.url) || "";
    const isapi = u.startsWith("/api");
    const isauthendpoint = u.startsWith("/api/auth/login") || u.startsWith("/api/auth/register");
    if (isapi && !isauthendpoint) {
       const token = localStorage.getItem("token");
       if (token) {
          opts.headers = Object.assign({}, opts.headers, { Authorization: "Bearer " + token });
       }
    }
    return _rawfetch(url, opts).then(function (res) {
       if (res.status === 401 && isapi && !u.startsWith("/api/auth")) {
          localStorage.removeItem("token");
          showauth();
       }
       return res;
    });
};

let currentfileid = null;

let currentcardid = null;

async function uploadhandler() {
    let input = document.getElementById("photo");
    
    if (input.files.length == 0) {
       alert("no file selected");
       return;
    }
    
    let formdataobject = new FormData();
    formdataobject.append("file", input.files[0]);
    
    document.getElementById("uploadstatus").innerHTML = "uploading..."
    
    let responce = await fetch("/api/upload",{
       method:"POST",
       body:formdataobject
       
    })
    
    let data = await responce.json();
    
    console.log(data);
    
    let statusmessage = data.message;
    
    
    
    if(statusmessage == 'success') {
       document.getElementById("uploadstatus").innerHTML = "success";
       showpreview(data.fileid);

       document.getElementById("ocr").style.display = "block"


       currentfileid = data.fileid;

       document.getElementById("form-imagepath").value = data.fileid;

    }
    
    else {
       document.getElementById("uploadstatus").innerHTML = "upload failed"
    }
    
    

}

function showpreview(fileid) {
    let previewelement = document.getElementById("preview");
    previewelement.src = "/uploads/"+ fileid;
    
    previewelement.style.display="block";
    
    document.getElementById("ocr").style.display = "block";
    
       document.getElementById("ocr-result").value = "";
             document.getElementById("ocr-status").textContent = "";
                   document.getElementById("ocr-confidence").textContent = "";



    
    

    
}

async function ocrhandler() {
    ocrbutton = document.getElementById("ocr-button");
    
    ocrbutton.disabled = true;
    ocrbutton.textContent = "WORKING..."
    
    document.getElementById("ocr-status").textContent = "processing...";
    
    
    try {
       
       let responce = await fetch("/api/ocr", {
            method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ filename: currentfileid })
          })
       
    let data = await responce.json();
    
    console.log(data);
    
    showpreview(data.fileid);
    document.getElementById("ocr-result").value = data.text;
    document.getElementById("form-ocrtext").value = data.text;
    
    document.getElementById("form-imagepath").value = data.fileid;
    
    document.getElementById("ocr-confidence").textContent = "confidence: " + Math.round(data.confidence * 100) + "%";
    
    console.log("lines: " + data.lines);
    
             document.getElementById("ocr-status").textContent = "ocr success";


          document.getElementById("ocr-button").disabled = false;
          document.getElementById("ocr-button").textContent = "GET TEXT";

    
    

    

    

    }
    
    catch(error){
          document.getElementById("ocr-status").textContent = "ERROR: " + error;
          
          document.getElementById("ocr-button").disabled = false;
          document.getElementById("ocr-button").textContent = "GET TEXT";
          

    }


    
    
    
}


function tabswitcher(tab) {
    stopspeaking();
    const sections = document.querySelectorAll(".myfClass");
    
    document.querySelectorAll(".section").forEach(element => {
    element.hidden = false;
    });

    document.querySelectorAll(".section:not(#"+tab+")").forEach(element => {
    element.hidden = true;
    });
}

function tabswitcher2(tab) {
    const sections = document.querySelectorAll(".myClass");
    
    document.querySelectorAll(".section").forEach(element => {
    element.hidden = false;
    });

    document.querySelectorAll(".section:not(#"+tab+")").forEach(element => {
    element.hidden = true;
    });
}



function showcardform() {
    tabswitcher("cardform-section")
    
    console.log("showing card form");

    // show the photo taken in the SCAN step as a thumbnail on the form
    let imgpath = document.getElementById("form-imagepath").value;
    let formpreview = document.getElementById("form-preview");
    if (imgpath) {
       formpreview.src = "/uploads/" + imgpath;
       formpreview.style.display = "block";
    } else {
       formpreview.style.display = "none";
    }
    
    //document.getElementById("form-ocrtext").value = document.getElementById("ocr-result").value;
    
    document.getElementById("form-profile").value = "default";
    document.getElementById("form-productname").value = "";
    document.getElementById("form-frequency").value = "";
    document.getElementById("form-instructions").value = "";
    
    document.getElementById("form-status").innerHTML = " ";

    
    
}

async function savecard() {
    let profile =  document.getElementById("form-profile").value || "default";
    let productname = document.getElementById("form-productname").value;
    let frequency = document.getElementById("form-frequency").value;
    let instructions  = document.getElementById("form-instructions").value;
    let warnings = document.getElementById("form-warnings").value;

    if (productname == "") {
       document.getElementById("form-status").innerHTML = "error: product name missing";

       return;
    }
    if (!frequency || parseInt(frequency) < 1) {
       document.getElementById("form-status").innerHTML = "error: please enter how many times per day";

       return;
    }

    let send = {
              profile_name: profile,
              product_name: productname,
              frequency: parseInt(frequency),
              directions: instructions,
            warnings: warnings,
              ocr_text: document.getElementById("form-ocrtext").value,
              image_path: document.getElementById("form-imagepath").value
          }
         
    document.getElementById("form-status").innerHTML = "saving..."
    
    fetch("/api/cards/" ,{
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(send)
          })
         
    document.getElementById("form-status").innerHTML = "card saved";
    
    await setTimeout(showcardlist, 1000);
    
    



}

function cancelform() {
    tabswitcher("cards-section");
    
}

async function showcardlist() {
    tabswitcher("cards-section");
    let container = document.getElementById("card-list-container");
    
    container.innerHTML = "";
    
    let data = await fetch("/api/cards/"
              
             
          )
         
    cards = await data.json();
       console.log(cards)

    
    if (cards.length == 0) document.getElementById("card-list-empty").value = "no cards :(";
    
    else{
       document.getElementById("card-list-empty").value = "";
       for (let i of cards) {
          container.innerHTML += rendercard(i);
          
          

          
       }
       
       for (let i of cards) {
          let e = "card-list-"+i.id;

          
          document.getElementById(e).addEventListener("click", () => {
             showcarddetail(i.id, true)
             })

          
       }
    }
    
    
    
}

function rendercard(card) {
    let html = "";
    
    html += "<div class=\"card-list-item\" id=\"card-list-"+card.id+"\">";
    if (card.image_path) {
       html += "<img class=\"card-list-image\" src=\"/uploads/" + card.image_path + "\" alt=\"\">";
    }
    html += "<h1>" + card.product_name + "</h1>";
    html += "</div>";
    
    //console.log(html);
    // console.log("card-list-"+card.id);

    


    
    return html;
}

async function loadreminders() {
              const response = await fetch("/api/cards");
        const cards = await response.json();
       
       const cardswithusage = await Promise.all(
              cards.map(async (card) => {
                  const responce2 = await fetch(`/api/cards/${card.id}/usage-summary`);
                  const usage = await responce2.json();
                  return { ...card, ...usage };
              })
          );
         
         let listDIV = document.getElementById("senior-reminders-list");
    if (!cardswithusage.length) {
    listDIV.innerHTML = "no medicines set up"
    return;
}

    
         listDIV.innerHTML = cardswithusage.map(card => reminderitem(card)).join("");
         


}

function reminderitem(card) {
    return "<p>work in progress</p>"
}



    
async function loadtodaystatus(cardid) {
    const div = document.getElementById("usage-summary");
    div.textContent = "";
    try {
        const res = await fetch(`/api/cards/${cardid}/usage-summary`);
        const data = await res.json();
        const n = data.taken_today || 0;
        div.textContent = (n === 0)
            ? "Not taken yet today"
            : `Taken today: ${n} time${n !== 1 ? "s" : ""}`;

        // if already taken enough times today, warn (shown in warnings + read aloud)
        const freq = window.card && window.card.frequency;
        if (freq && n >= freq) {
            const msg = `You have already taken this medicine ${n} time${n !== 1 ? "s" : ""} today. You have reached today's limit — please do not take any more today.`;
            const warnEl = document.getElementById("detail-warnings");
            if (warnEl && !warnEl.value.includes("do not take any more")) {
                warnEl.value = (warnEl.value.trim() ? warnEl.value.trim() + "\n\n" : "") + msg;
                // grow the box so the full warning is visible (no scrolling for seniors)
                warnEl.style.height = "auto";
                warnEl.style.height = warnEl.scrollHeight + "px";
            }
            if (window.card && !String(window.card.warnings || "").includes("do not take any more")) {
                window.card.warnings = (String(window.card.warnings || "").trim() ? window.card.warnings.trim() + " " : "") + msg;
            }
        }
    } catch (e) {
        console.error("today status failed:", e);
    }
}

async function showcarddetail(cardid, editmode) {
    currentcardid = cardid;
    document.getElementById("overlay").style.display="block";
    document.getElementById("card-detail").style.display="block";
    document.getElementById("card-detail").hidden=false;


    try{
       let data = await fetch(`/api/cards/${cardid}`);

    card = await data.json();
    console.log(card);

    rendercarddetail(card);

    if (editmode) {
        editcard();
        document.getElementById("usage-summary").textContent = "";   // no status while editing
    } else {
        canceledit();
        loadtodaystatus(cardid);   // show today's intake status in the view
    }

    }

    catch(e) {
       return e;
    }
    
    
    
    
}

function clean(v) {
    // treat null / undefined / the literal string "undefined" as empty
    return (v == null || v === "undefined") ? "" : v;
}

function rendercarddetail(card) {
    console.log(card);
    let html =     `<label class="form-label" for="detail-name">product name</label>
    <input id="detail-name" class="card-name" value="${clean(card.product_name)}" readonly>

    <label class="form-label" for="detail-frequency">times per day</label>
    <input id="detail-frequency" type="number" min="1" step="1" class="card-volatile" value="${card.frequency || ""}" readonly>

    <label class="form-label" for="detail-instructions">instructions</label>
    <textarea id="detail-instructions" class="card-instructions" rows="3" readonly>${clean(card.directions) || "[no instructions]"}</textarea>

    <label class="form-label" for="detail-warnings">warnings</label>
    <textarea id="detail-warnings" rows="2" class="card-warnings" readonly>${clean(card.warnings)}</textarea>

     `
     
     document.getElementById("card-detail-content").innerHTML = html; 

     
     if (card.image_path != null) {
        document.getElementById("detail-image").hidden = false;
        document.getElementById("detail-image").src = "/uploads/"+card.image_path;
     }
     
     else {
              document.getElementById("detail-image").hidden = true;

     }
}

function editcard2() { //unused
    tabswitcher("cardform-section")
    
    //document.getElementById("form-ocrtext").value = document.getElementById("ocr-result").value;
    
    document.getElementById("form-profile").value = "default";
    document.getElementById("form-productname").value = "";
    document.getElementById("form-frequency").value = "";
    document.getElementById("form-instructions").value = "";
    
    document.getElementById("form-status").innerHTML = " ";

    
    
}

function editcard() {
    let inputlist = ["warnings", "instructions", "name", "frequency"];
    
       for (let i of inputlist ) {
          document.getElementById("detail-"+i).readOnly=false;
          document.getElementById("detail-"+i).classList.toggle("editing", true);
          

          //console.log(i);
    
    }
    
    document.getElementById("edit-submit").style.display = "inline-flex";
    document.getElementById("edit-cancel").style.display = "inline-flex";
    document.getElementById("card-edit").style.display = "none";
    // keep RECYCLE (delete) available while editing, in caregiver mode only
    document.getElementById("card-yeet").style.display = (currentmode == "unsenior") ? "inline-flex" : "none";

}

function canceledit() {
    let inputlist = ["warnings", "instructions", "name", "frequency"];
    
       for (let i of inputlist ) {
          document.getElementById("detail-"+i).readOnly=true;
          document.getElementById("detail-"+i).classList.toggle("editing", false);
          

          //console.log(i);
    
    }
    
    document.getElementById("edit-submit").style.display = "none";
    document.getElementById("edit-cancel").style.display = "none";
    // EDIT / RECYCLE only for caregiver (main app), never for the senior view
    const showedit = (currentmode == "unsenior") ? "inline-flex" : "none";
    document.getElementById("card-edit").style.display = showedit;
    document.getElementById("card-yeet").style.display = showedit;

}



async function submitedit() {
    
    
    //let profile =    document.getElementById("form-profile").value;
    let productname = document.getElementById("detail-name").value;
    let frequency = document.getElementById("detail-frequency").value;
    let instructions  = document.getElementById("detail-instructions").value;
    let warnings = document.getElementById("detail-warnings").value;

    if (productname == "") {
       return;
    }
    if (!frequency || parseInt(frequency) < 1) {
       document.getElementById("form-status").innerHTML = "error: times per day is required";
       return;
    }

    let send = {
              product_name: productname,
              frequency: parseInt(frequency),
              directions: instructions,
            warnings: warnings,
              // personal_notes omitted: notes are not shown/edited on the card page,
              // and the backend (exclude_none=True) preserves the card's existing notes
              // ocr_text intentionally omitted: the edit form doesn't touch it,
              // and the backend (exclude_none=True) preserves the card's existing ocr_text
          }
         
         console.log(send);
         
    //document.getElementById("form-status").innerHTML = "saving..."
    
    await fetch(`/api/cards/${currentcardid}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(send)
          });

    // close the modal (hides the overlay too) and go back to the refreshed cards list
    canceledit();
    closedetail();
    showcardlist();
}

async function deletecard() {
    if (!confirm("are you sure you want to recycle this card")) return;
    
    fetch(`/api/cards/${currentcardid}`, { method: "DELETE" })
    
    showcardlist();
    
    return;

    
    
}

async function handleautofill() {
    const ocrtext = document.getElementById("ocr-result").value;
    document.getElementById("autocreatenewcard").disabled = true;
    document.getElementById("autocreatenewcard").innerHTML = "PROCESSING...";
    
    try {
       let data =  await  fetch("/api/structure-label", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ocr_text: ocrtext })
          })
         
        let result = await data.json();
        
        showcardform();
        
    //document.getElementById("form-profile").value = result.;
    document.getElementById("form-productname").value = result.product_name || "";
    document.getElementById("form-instructions").value = result.directions || "";
    document.getElementById("form-warnings").value = result.warnings || "";
    }
    
    catch(e) {
       console.log("error: " +e);
    }
    
    finally {document.getElementById("autocreatenewcard").disabled = false;
       document.getElementById("autocreatenewcard").innerHTML = "AUTOFILL CARD";
}
    
    document.getElementById("autocreatenewcard").addEventListener("click", handleautofill)



}
    
    const has = (val) => val !== null && val !== undefined && val !== "";

function closedetail() {
    document.getElementById("overlay").style.display="none";
    document.getElementById("card-detail").style.display="none";
    
}

async function handlematching(file) {
    try{
          document.getElementById("identify-photo-button").disabled=true;

       
    if (file == undefined) {
          document.getElementById("identify-photo-button").disabled=false;

       return;
    }

    // fresh result page: hide any previous result and show the loading spinner
    document.getElementById("identify-result").style.display = "none";
    document.getElementById("identify-status").textContent = "";
    document.getElementById("identify-spinner").style.display = "block";

           const formdata = new FormData();
         formdata.append("file", file);
         const uploadresponce = await fetch("/api/upload", {
             method: "POST",
              body: formdata
          });
         
                 const uploaddata = await uploadresponce.json();
               console.log(uploaddata);
          const filename = uploaddata.fileid;
         
         console.log(filename);
         
         const matchresponce = await fetch("/api/match", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ filename: filename })
          });
         
         const data = await matchresponce.json()
          console.log(data);
         
         document.getElementById("identify-spinner").style.display = "none";

                   if (data.matched) {
              // auto-log a "scanned" event, then open the full medicine card
              fetch(`/api/cards/${data.card_id}/log`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ event_type: "scanned" }),
              });
              showcarddetail(data.card_id);
          }
         else {
              dontshowmatchresult(data);
          }
    }
    catch (err) {
       console.error("match failed:", err);
       document.getElementById("identify-spinner").style.display = "none";
       document.getElementById("identify-status").textContent = "something went wrong, please try again";
    }

    document.getElementById("identify-photo-button").disabled=false;
       document.getElementById("identify-input").value="";
         

}

function showmatchresult(data) {
    document.getElementById("identify-result").style.display="block";
    
    document.getElementById("identify-result").innerHTML = `
    <h2>match found: ${data.product_name}</h2>
    <h2>confidence: ${Math.round(data.score)}%</h2>
    
    <button id="showmatchresult-button">show card</button>
    `
document.getElementById("showmatchresult-button").addEventListener("click", () => {showcarddetail(data.card_id)});

    
    
}

function dontshowmatchresult(data) {
    document.getElementById("identify-result").style.display="block";
    
    document.getElementById("identify-result").innerHTML = `
    <h2>match not found :(</h2>

    
    <button id="tryagain-button">try again</button>
    `
    console.log(data);
document.getElementById("tryagain-button").addEventListener("click", () => {
    document.getElementById("identify-result").style.display="none";
    document.getElementById("identify-input").value="";
    
});

    
    
}

function buildtts(card) {
    console.log(card);
    let parts = [];
    
    let intro = "";
    
    if (card.product_name) {
       intro +=   `now reading instructions for ${card.product_name}.`;
       
       
    }
    
    parts.push(intro);
    
    if (card.directions) parts.push(card.directions);
    
    if (has(card.warnings)) {
              parts.push(`warning: ${card.warnings}`);
         }

        return parts;   // array of items; spoken one by one with a pause between

        
}

let avaliblevoices = []
function loadvoices() {
    avaliblevoices = speechSynthesis.getVoices();
    
    if (avaliblevoices.length == 0) {
       speechSynthesis.addEventListener("voiceschanged", () => {
                 availablevoices = speechSynthesis.getVoices();
              });
          }
         
         

    }
    



function selectvoice() {
    let englishvoices = availablevoices.filter(
              v => v.lang.startsWith("en")
          );
         
         const preferred = ["Google US English", "Samantha", 
                             "Microsoft Zira"];
                       
                       for (let i of preferred) {
                          let  found = englishvoices.find(v => v.name == name);
              if (found) return found;

                       }
                       
                       return englishvoices[0] || undefined;


}

let isreading = false;
let isspeaking = false;
let currentmode = "senior";

let ttspausetimer = null;
const TTS_PAUSE_MS = 1000;   // pause between each item (1 s)

function handletts() {
    // button is a toggle: if already reading, stop
    if (isspeaking) { stopspeaking(); return; }

    const card = window.card;
    if (!card) return;

    const parts = buildtts(card);   // array of items
    speechSynthesis.cancel();
    const voice = selectvoice();

    isspeaking = true;
    updatereadaloudbutton(true);

    let i = 0;
    function speaknext() {
        if (!isspeaking) return;                 // stopped by the user
        if (i >= parts.length) {                 // finished all items
            isspeaking = false;
            updatereadaloudbutton(false);
            return;
        }
        const u = new SpeechSynthesisUtterance(parts[i]);
        u.rate = 0.9;
        if (voice) u.voice = voice;
        i++;
        u.onend = () => { ttspausetimer = setTimeout(speaknext, TTS_PAUSE_MS); };
        u.onerror = (event) => {
            console.error("tts error:", event.error);
            isspeaking = false;
            updatereadaloudbutton(false);
        };
        speechSynthesis.speak(u);
    }
    speaknext();
}

function stopspeaking(){
     speechSynthesis.cancel();
     if (ttspausetimer) { clearTimeout(ttspausetimer); ttspausetimer = null; }
    isspeaking = false;
    updatereadaloudbutton(false);
                       //document.getElementById("card-readaloud").addEventListener("click", handletts);

}

function updatereadaloudbutton(speaking){
 let btn = document.getElementById("card-readaloud");
       if (speaking) {
           btn.innerHTML = '<span class="btn-icon">&#9209;</span>Stop';
           btn.classList.add("stopreadaloud");
           btn.classList.remove("readaloud");
       }
       else {
           btn.innerHTML = '<span class="btn-icon">&#128266;</span>Read aloud';
           btn.classList.remove("stopreadaloud");
           btn.classList.add("readaloud");
}}



    
async  function handletaken() {
    const cardid = currentcardid;
    if (!cardid)return;

    await fetch(`/api/cards/${cardid}/log`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ event_type: "taken" })
          });

    // close the card and show the medication history so the senior sees it recorded
    closedetail();
    tabswitcher("history-section");
    loadhistory();
}

async function loadusagesummary(cardid) {
              const response = await fetch(`/api/cards/${cardid}/usage-summary`);
         const data = await response.json();
        
        let summarydiv = document.getElementById("usage-summary");
        
        

          let html = "";
    
          if (data.last_taken_at) {
              html += `<p>last taken ${formattime(data.last_taken_at)}</p>`;
          }
          if (data.last_scanned_at) {
              html += `<p>last scanned ${formattime(data.last_scanned_at)}</p>`;
          }
          if (!data.last_taken_at && !data.last_scanned_at) {
              html = `<p>no usage recorded</p>`;
          }


summarydiv.innerHTML = html;


}


function formattime(ts) {
    let date = new Date(ts);
    let now = Date.now();
    
    let diffms = now - date;
    let diffmins = Math.floor(diffms / 60000); //difference in mins
    
    
    if (diffmins < 1) return "just now"
    if (diffmins < 60) return `${diffmins} minute${diffmins !== 1 ? 's' : ''} ago`
    if (diffmins < 1440) return `${Math.floor(diffmins/60)} hour${Math.floor(diffmins/60) !== 1 ? 's' : ''} ago`

    let days = Math.floor(diffmins / 1440);
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

function initmode() {
const savedmode = localStorage.getItem("appmode");
if (savedmode == "senior" || savedmode == "unsenior") {
    currentmode = savedmode;
}

applymode(currentmode);

gotohome();

}

function gotohome() {
    if (currentmode == "senior") {
       tabswitcher("senior-home-section");
    } else {
       tabswitcher("cards-section");
       showcardlist();
    }
}

function switchmode() {
    currentmode = (currentmode == "senior") ? "unsenior" : "senior";
    localStorage.setItem("appmode", currentmode);
    applymode(currentmode);
    gotohome();
}

function applymode(mode) {
              const senior = document.getElementById("senior-nav");
          const unsenior = document.getElementById("unsenior-nav");

    if (mode == "senior") {
       senior.style.display = "flex";
       unsenior.style.display = "none";
       
    }
    else {
       senior.style.display = "none";
       unsenior.style.display = "flex";
       
    }
    
    document.querySelectorAll(".unsenior-only").forEach(el => {el.style.display = mode == "unsenior" ? "" : "none";});
       document.querySelectorAll(".senior-only").forEach(el => {el.style.display = mode == "senior" ? "" : "none";});

    // top-right toggle shows the view you can switch TO
    const modetoggle = document.getElementById("mode-toggle");
    if (modetoggle) modetoggle.textContent = (mode == "senior") ? "Caregiver View" : "Senior View";
}

function back() {
    if (currentmode == "senior") tabswitcher("senior-home-section");

    else tabswitcher("cards-section");

    return  "success";
}


async function loadhistory() {
   const listdiv = document.getElementById("history-list");
    listdiv.innerHTML = "";
    document.getElementById("history-empty").textContent = "loading...";
    try {
        const res = await fetch("/api/history");
        const items = await res.json();
        if (!items.length) {
            document.getElementById("history-empty").textContent = "no history yet";
            return;
        }
        document.getElementById("history-empty").textContent = "";
        listdiv.innerHTML = renderhistory(items);
    } catch (err) {
        console.error("history failed:", err);
        document.getElementById("history-empty").textContent = "could not load history";
    }
}



function daylabel(ts) {
    const d = new Date(ts), now = new Date();
    const sameday = (a, b) => a.toDateString() === b.toDateString();
    const yest = new Date(now); yest.setDate(now.getDate() - 1);
    if (sameday(d, now)) return "Today";
    if (sameday(d, yest)) return "Yesterday";
    return d.toLocaleDateString();
}

function renderhistory(items) {
    let html = "";
    let currentday = null;
    for (const i of items) {
       let day = daylabel(i.timestamp);
       if (day != currentday) {
              html += `<h2 class="history-day">${day}</h2>`;
             currentday = day;
             
             
       }
       
       let badge = i.event_type == "taken"
            ? `<span class="badge badge-taken">taken</span>`
            : `<span class="badge badge-scanned">scanned</span>`;
        html += `<div class="history-item">
                   <span class="history-name">${i.product_name}</span>
                   ${badge}
                   <span class="history-time">${formattime(i.timestamp)}</span>
                 </div>`;

    }

    return html;
}



document.getElementById("uploader-button").addEventListener("click", uploadhandler);
document.getElementById("ocr-button").addEventListener("click", ocrhandler)

document.getElementById("form-submit").addEventListener("click", savecard);
document.getElementById("form-cancel").addEventListener("click", cancelform);

document.getElementById("createnewcard").addEventListener("click", showcardform);


 document.getElementById("close-detail").addEventListener("click", closedetail);
 document.getElementById("card-edit").addEventListener("click", editcard);
 document.getElementById("card-yeet").addEventListener("click", () => {deletecard();canceledit();closedetail()});


document.getElementById("edit-submit").addEventListener("click", submitedit);
document.getElementById("edit-cancel").addEventListener("click", () => {
    canceledit();      // reset the edit UI for next time
    closedetail();     // close the modal + overlay
    showcardlist();    // back to the cards list
});

    document.getElementById("autocreatenewcard").addEventListener("click", handleautofill)

document.getElementById("identify-photo-button").addEventListener("click", () => {
     document.getElementById("identify-input").click() });

 // document.getElementById("identify-commence").addEventListener("click", ()=>{handlematching()})
    
document.getElementById("identify-input").addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
        handlematching(file);
    }
});

document.getElementById("identify-input-alt").addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
        handlematching(file);
    }
});

loadvoices();

document.getElementById("card-readaloud").addEventListener("click", handletts);

// "I took this" logs a taken event for the open card
document.getElementById("card-taken").addEventListener("click", handletaken);

// result page "Back" returns to the senior home
document.getElementById("identify-back").addEventListener("click", () => tabswitcher("senior-home-section"));

// mode switching (works from both the header button and the senior-home orb)
document.getElementById("mode-toggle").addEventListener("click", switchmode);

// ===== Camera capture (live webcam) =====
let camerastream = null;

async function opencamera() {
	// needs a secure context (https or localhost); otherwise fall back to a file picker
	if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
		document.getElementById("senior-file-input").click();
		return;
	}
	try {
		camerastream = await navigator.mediaDevices.getUserMedia({
			video: { facingMode: "environment" },
			audio: false,
		});
		const video = document.getElementById("camera-stream");
		video.srcObject = camerastream;
		document.getElementById("camera-view").hidden = false;
	} catch (err) {
		console.error("camera unavailable:", err);
		// no camera, or permission denied -> fall back to uploading a file
		document.getElementById("senior-file-input").click();
	}
}

function closecamera() {
	if (camerastream) {
		camerastream.getTracks().forEach(t => t.stop());
		camerastream = null;
	}
	document.getElementById("camera-view").hidden = true;
}

function capturephoto() {
	const video = document.getElementById("camera-stream");
	const canvas = document.getElementById("camera-canvas");
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	canvas.getContext("2d").drawImage(video, 0, 0);
	canvas.toBlob(function (blob) {
		closecamera();
		if (!blob) return;
		const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
		tabswitcher("identify-section");
		handlematching(file);
	}, "image/jpeg", 0.9);
}

// senior-mode photo button -> open the webcam (falls back to a file picker)
document.getElementById("senior-photo-btn").addEventListener("click", opencamera);
document.getElementById("camera-capture").addEventListener("click", capturephoto);
document.getElementById("camera-cancel").addEventListener("click", closecamera);

// fallback path: if the file picker is used instead, still run the match
document.getElementById("senior-file-input").addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        tabswitcher("identify-section");
        handlematching(file);
    }
});


// ===== Auth UI =====
let authmode = "login";   // "login" | "register"

function setauthmode(mode) {
    authmode = mode;
    document.getElementById("auth-error").textContent = "";
    if (mode === "login") {
       document.getElementById("auth-subtitle").textContent = "Log in to your account";
       document.getElementById("auth-submit").textContent = "Log in";
       document.getElementById("auth-toggle-text").textContent = "No account?";
       document.getElementById("auth-toggle-link").textContent = "Sign up";
       document.getElementById("auth-password").setAttribute("autocomplete", "current-password");
    } else {
       document.getElementById("auth-subtitle").textContent = "Create an account";
       document.getElementById("auth-submit").textContent = "Sign up";
       document.getElementById("auth-toggle-text").textContent = "Already have an account?";
       document.getElementById("auth-toggle-link").textContent = "Log in";
       document.getElementById("auth-password").setAttribute("autocomplete", "new-password");
    }
}

function showauth() {
    document.getElementById("auth-gate").hidden = false;
    document.getElementById("auth-password").value = "";
    setauthmode("login");
}

function startapp() {
    document.getElementById("auth-gate").hidden = true;
    initmode();
}

async function submitauth() {
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    const errorel = document.getElementById("auth-error");
    errorel.textContent = "";
    if (!email || !password) { errorel.textContent = "enter your email and password"; return; }

    const submitbtn = document.getElementById("auth-submit");
    submitbtn.disabled = true;
    try {
       let res;
       if (authmode === "register") {
          res = await fetch("/api/auth/register", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ email: email, password: password }),
          });
       } else {
          const form = new URLSearchParams();
          form.set("username", email);     // OAuth2 form uses "username" for the email
          form.set("password", password);
          res = await fetch("/api/auth/login", {
             method: "POST",
             headers: { "Content-Type": "application/x-www-form-urlencoded" },
             body: form,
          });
       }

       if (!res.ok) {
          let msg = (authmode === "register") ? "could not sign up" : "incorrect email or password";
          if (res.status === 400) msg = "email already registered";
          if (res.status === 422) msg = "password must be at least 8 characters";
          errorel.textContent = msg;
          return;
       }
       const data = await res.json();
       localStorage.setItem("token", data.access_token);
       startapp();
    } catch (err) {
       console.error("auth failed:", err);
       errorel.textContent = "network error, please try again";
    } finally {
       submitbtn.disabled = false;
    }
}

function dologout() {
    localStorage.removeItem("token");
    showauth();
}

// boot: decide whether to show the app or the login gate
async function bootauth() {
    const token = localStorage.getItem("token");
    if (!token) { showauth(); return; }
    try {
       const res = await fetch("/api/auth/me");   // wrapper attaches the token
       if (res.ok) { startapp(); } else { showauth(); }
    } catch (err) {
       showauth();
    }
}

document.getElementById("auth-submit").addEventListener("click", submitauth);
document.getElementById("auth-password").addEventListener("keydown", function (e) {
    if (e.key === "Enter") submitauth();
});
document.getElementById("auth-toggle-link").addEventListener("click", function (e) {
    e.preventDefault();
    setauthmode(authmode === "login" ? "register" : "login");
});
document.getElementById("auth-logout").addEventListener("click", dologout);

bootauth(); //init auth, then the app