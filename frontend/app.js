let currentfileid = null;


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
	
	fetch("/api/cards/" + send.image_path, {
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
	}
	
	
	
}

function rendercard(card) {
	let html = "";
	
	html += "<div class=\"card-list-item\" onclick=showcard("+card+")>";
	html += "<h1>" + card.product_name + "</h1>";
		html += "<p>" + card.profile_name + "</p>";

	html += "<p>" + card.strength + "</p>";
	
	html += "</div>";
	
	
	
	return html;
}


	
async function showcarddetail(cardid) {
	tabswitcher2("card-detail");
	try{
		let data = await fetch("/api/cards/"
              
             
          )
		  
	card = await data.json();
	
	rendercarddetail(card);
	}
	
	catch(e) {
		return;
	}
	
	
	
	
}

function rendercarddetail(card) {
	document.getElementById("card-detail").innerHTML = 
	`<h2>${card.product_name}</h2>
	<p>strength: ${card.strength}</p>
	
     <p>${card.directions || "[no instructions]"}</p>
	 <p>notes: ${card.personal_notes}</p>
	 <p>warnings: ${card.warnings}</p>
	 <p>time: ${card.reminder_times}</p>
	 `
	 
	 if (card.image_path != null) {
		 document.getElementById("detail-image").hidden = false;
		 document.getElementById("detail-image").src = card.image_path;
	 }
	 
	 else {
		 		 document.getElementById("detail-image").hidden = true;

	 }
}

function editcard() {
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

async function editcard(cardid) {
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
              strength: strength,    
              directions: instructions,
			  warnings: warnings,
              personal_notes: notes,
              reminder_times: time,
              ocr_text: document.getElementById("form-ocrtext").value,
              image_path: document.getElementById("form-imagepath").value
          }
		  
	document.getElementById("form-status").innerHTML = "saving..."
	
	fetch(`/api/cards/${cardid}` + send.image_path, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(send)
          })
		  
	document.getElementById("form-status").innerHTML = "card saved";
	
	
	



}

async function deletecard(cardid) {
	if (!confirm("are you sure you want to recycle this card")) return;
	
	fetch(`/api/cards/${cardid}`, { method: "DELETE" })
	
	showcardlist();
	
	return;

	
	
}
	

tabswitcher("upload")


document.getElementById("uploader-button").addEventListener("click", uploadhandler);
document.getElementById("ocr-button").addEventListener("click", ocrhandler)

document.getElementById("topbar-scan").addEventListener("click", () => {tabswitcher("upload")})
document.getElementById("topbar-cards").addEventListener("click", () => {tabswitcher("cards");
showcardlist()})


document.getElementById("form-submit").addEventListener("click", savecard);
document.getElementById("form-cancel").addEventListener("click", cancelform);

document.getElementById("createnewcard").addEventListener("click", showcardform);

 document.getElementById("close-detail").addEventListener("click", showcardlist)
 document.getElementById("card-edit").addEventListener("click", editcard)
 document.getElementById("card-yeet").addEventListener("click", deletecard)




