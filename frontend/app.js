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





document.getElementById("uploader-button").addEventListener("click", uploadhandler);
document.getElementById("ocr-button").addEventListener("click", ocrhandler)

