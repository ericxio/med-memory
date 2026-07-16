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

	}
	
	else {
		document.getElementById("uploadstatus").innerHTML = "upload failed"
	}
	
	

}

function showpreview(fileid) {
	let previewelement = document.getElementById("preview");
	previewelement.src = "/uploads/"+ fileid;
	
	previewelement.style.display="block";
	
	

	
}

document.getElementById("uploader-button").addEventListener("click", uploadhandler)
