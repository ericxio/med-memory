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
	const sections = document.querySelectorAll(".myClass");
	
	document.querySelectorAll(".section").forEach(element => {
    element.hidden = false;
	});

	document.querySelectorAll(".section:not(#"+tab+"-section)").forEach(element => {
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
	tabswitcher("cardform")
	
	console.log("showing card form");
	
	//document.getElementById("form-ocrtext").value = document.getElementById("ocr-result").value;
	
	document.getElementById("form-profile").value = "";
	document.getElementById("form-productname").value = "";
	document.getElementById("form-strength").value = "";
	document.getElementById("form-instructions").value = "";
	document.getElementById("form-notes").value = "";
	document.getElementById("form-time").value = "";
	
	document.getElementById("form-status").innerHTML = " ";

	
	
}

async function savecard() {
	let profile = 	document.getElementById("form-profile").value;
	let productname = document.getElementById("form-productname").value;
	let strength = document.getElementById("form-strength").value;
	let instructions  = document.getElementById("form-instructions").value;
	let notes = document.getElementById("form-notes").value;
	let time = document.getElementById("form-time").value;
	let warnings = document.getElementById("form-warnings").value;
	
	if (profile == "" || productname == "") {
		document.getElementById("form-status").innerHTML = "error: profile or product name missing";
		
		return;
	}
	
	let send = {
              profile_name: profile,
              product_name: productname,
              strength: strength,        // empty string becomes null
              directions: instructions,
			  warnings: warnings,
              personal_notes: notes,
              reminder_times: time,
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
	tabswitcher("cards");
	
}

async function showcardlist() {
	tabswitcher("cards");
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
				showcarddetail(i.id)
				})

			
		}
	}
	
	
	
}

function rendercard(card) {
	let html = "";
	
	html += "<div class=\"card-list-item\" id=\"card-list-"+card.id+"\">";
	html += "<h1>" + card.product_name + "</h1>";
		html += "<p>" + card.profile_name + "</p>";

	html += "<p>" + card.strength + "</p>";
	
	html += "</div>";
	
	//console.log(html);
	//	console.log("card-list-"+card.id);

	


	
	return html;
}


	
async function showcarddetail(cardid) {
	currentcardid = cardid;
	document.getElementById("overlay").style.display="block";
	document.getElementById("card-detail").style.display="block";
	document.getElementById("card-detail").hidden=false;
	

	try{
		let data = await fetch(`/api/cards/${cardid}`);
		  
	card = await data.json();
	console.log(card);
	
	rendercarddetail(card);
	
	}
	
	catch(e) {
		return e;
	}
	
	
	
	
}

function rendercarddetail(card) {
	console.log(card);
	let html = 	`<input id="detail-name" class="card-name" value="${card.product_name}" readonly></input>
	<input id="detail-strength"  class="card-volatile" value = "${card.strength}" readonly></input>
	
     <textarea id="detail-instructions" class="card-instructions" rows="3" readonly>${card.directions || "[no instructions]"}</textarea>
	<textarea id="detail-notes" rows="3" class="card-notes" readonly>${card.personal_notes}</textarea>
	<textarea id="detail-warnings"  rows="2" class="card-warnings" readonly>${card.warnings}</textarea>
	<input id="detail-time" type="time" value = "${card.reminder_times}" readonly></input>
	
	 
	 
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
	tabswitcher("cardform")
	
	//document.getElementById("form-ocrtext").value = document.getElementById("ocr-result").value;
	
	document.getElementById("form-profile").value = "";
	document.getElementById("form-productname").value = "";
	document.getElementById("form-strength").value = "";
	document.getElementById("form-instructions").value = "";
	document.getElementById("form-notes").value = "";
	document.getElementById("form-time").value = "";
	
	document.getElementById("form-status").innerHTML = " ";

	
	
}

function editcard() {
	let inputlist = ["notes", "warnings", "instructions", "strength", "name", "time"];
	
		for (let i of inputlist ) {
			document.getElementById("detail-"+i).readOnly=false;
			document.getElementById("detail-"+i).classList.toggle("editing", true);
			

			//console.log(i);
	
	}
	
	document.getElementById("edit-submit").style.display = "inline";
	document.getElementById("edit-cancel").style.display = "inline";
	document.getElementById("card-edit").style.display = "none";
	document.getElementById("card-yeet").style.display = "none";
	
}

function canceledit() {
	let inputlist = ["notes", "warnings", "instructions", "strength", "name", "time"];
	
		for (let i of inputlist ) {
			document.getElementById("detail-"+i).readOnly=true;
			document.getElementById("detail-"+i).classList.toggle("editing", false);
			

			//console.log(i);
	
	}
	
	document.getElementById("edit-submit").style.display = "none";
	document.getElementById("edit-cancel").style.display = "none";
	document.getElementById("card-edit").style.display = "inline";
	document.getElementById("card-yeet").style.display = "inline";
	
}



async function submitedit() {
	
	
	//let profile = 	document.getElementById("form-profile").value;
	let productname = document.getElementById("detail-name").value;
	let strength = document.getElementById("detail-strength").value;
	let instructions  = document.getElementById("detail-instructions").value;
	let notes = document.getElementById("detail-notes").value;
	let time = document.getElementById("detail-time").value;
	let warnings = document.getElementById("detail-warnings").value;
	
	if (productname == "") {
		//document.getElementById("form-status").innerHTML = "error: profile or product name missing";
		
		return;
	}
	
	let send = {
              //profile_name: profile,
              product_name: productname,
              strength: strength,    
              directions: instructions,
			  warnings: warnings,
              personal_notes: notes,
              reminder_times: time,
              ocr_text: document.getElementById("form-ocrtext").value,
          }
		  
		  console.log(send);
		  
	//document.getElementById("form-status").innerHTML = "saving..."
	
	fetch(`/api/cards/${currentcardid}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(send)
          })
		  
	//document.getElementById("form-status").innerHTML = "card saved";
	
	
	canceledit();



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
	document.getElementById("form-productname").value = result.product_name;
	document.getElementById("form-strength").value = result.strength;
	document.getElementById("form-instructions").value = result.directions;
	//document.getElementById("form-notes").value = result.personal_notes;
	//document.getElementById("form-time").value;
	document.getElementById("form-warnings").value = result.warnings;
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

		  
		            if (data.matched) {
              showmatchresult(data);
          } 
		  else {
              dontshowmatchresult(data);
          }
	}
	catch {
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
		intro += 	`now reading instructions for ${card.product_name}`
		
		if (card.strength) intro +=` 	, ${card.strength}.`;
		
		else intro += ".";
		
		
	}
	
	parts.push(intro);
	
	if (card.directions) parts.push(card.directions);
	
	if (has(card.warnings)) {
              parts.push(`warning: ${card.warnings}`);
         }
		 
		 if (has(card.personal_notes)) {
              parts.push(`note: ${card.personal_notes}`);
         }
		 
		           if (has(card.reminder_times)) {
					   let realremindertimeformatted = new Date(`1970-01-01T${card.reminder_times}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
})
              parts.push(`your reminder is set for ${card.realremindertimeformatted}.`);
			  console.log(card.realremindertimeformatted);
          }
		  
		  //if (has(card.last_taken_at)) {
    //          parts.push(`you last took ts at ${formatTimeAgo(card.last_taken_at)}.`);
    //      }
		 
		 return parts.join(" ");

		 
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
function handletts() {
	console.log("reading...");
	if (isreading) {
		stoptts();
		return;
	}
	
	const card = window.card;
	if (!card) return;
	
	const script = buildtts(card);
	
	speechSynthesis.cancel();
	
	const utterance = new SpeechSynthesisUtterance(script);
	utterance.rate = 0.9;

const voice = selectvoice();
          if (voice) utterance.voice = voice;
		  
		            utterance.onstart = () => {
              isspeaking = true;
              updatereadaloudbutton(true);
          };
          utterance.onend = () => {
              isspeaking = false;
              updatereadaloudbutton(false);
          };
          utterance.onerror = (event) => {
              console.error("error:", event.error);
              isspeaking = false;
              updatereadaloudbutton(false);
			  stopspeaking();
          };
			console.log("speech has officially started")
          speechSynthesis.speak(utterance);
		  
		  


	
}

function stopspeaking(){
     speechSynthesis.cancel();
    isspeaking = false;
    updatereadaloudbutton(false);
			   		   //document.getElementById("card-readaloud").addEventListener("click", handletts);

}

function updatereadaloudbutton(speaking){
 let btn = document.getElementById("card-readaloud");
       if (speaking) {
           btn.textContent = "STOP";
           btn.classList.add("stopreadaloud");
           btn.classList.remove("readaloud");
		   //document.getElementById("card-readaloud").addEventListener("click", stopspeaking);

       } 
		else {
           btn.textContent = "READ ALOUD";
           btn.classList.remove("stopreadaloud");
           btn.classList.add("readaloud");
		   		   //document.getElementById("card-readaloud").addEventListener("click", handletts);

}}



	
function handletaken() {
	const cardid = currentcardid;
	if (!cardid)return;
	
	let responce = await fetch(`/api/cards/${cardId}/log`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ event_type: "taken" })
          });
		  
		            const data = await response.json();
          const time = formatTime(data.timestamp);
			loadusagesummary(cardid);


	 
}

function loadusagesummary(cardid) {
	          const response = await fetch(`/api/cards/${cardId}/usage-summary`);
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
	if (diffmins < 60) return `${diffmins} minute${diffMins !== 1 ? 's' : ''} ago`
	if (diffmins < 1440) return `${Math.floor(diffmins/60)} hour${diffMins !== 1 ? 's' : ''} ago`

	
	
}

tabswitcher("identify")


document.getElementById("uploader-button").addEventListener("click", uploadhandler);
document.getElementById("ocr-button").addEventListener("click", ocrhandler)

document.getElementById("topbar-scan").addEventListener("click", () => {tabswitcher("upload")})
document.getElementById("topbar-cards").addEventListener("click", () => {tabswitcher("cards");
showcardlist()})


document.getElementById("form-submit").addEventListener("click", savecard);
document.getElementById("form-cancel").addEventListener("click", cancelform);

document.getElementById("createnewcard").addEventListener("click", showcardform);
document.getElementById("createnewcard2").addEventListener("click", showcardform);


 document.getElementById("close-detail").addEventListener("click", closedetail);
 document.getElementById("card-edit").addEventListener("click", editcard);
 document.getElementById("card-yeet").addEventListener("click", () => {deletecard();canceledit();closedetail()});


document.getElementById("edit-submit").addEventListener("click", () => {submitedit();showcardlist()});
document.getElementById("edit-cancel").addEventListener("click", canceledit);

	document.getElementById("autocreatenewcard").addEventListener("click", handleautofill)

document.getElementById("identify-photo-button").addEventListener("click", () => {
     document.getElementById("identify-input").click() });

 //	document.getElementById("identify-commence").addEventListener("click", ()=>{handlematching()})
	
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
