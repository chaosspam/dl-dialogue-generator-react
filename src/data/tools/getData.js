async function fetchBackgroundImages() {
	try {
		let response = await fetch("https://dragalialost.wiki/api.php?action=query&prop=images&titles=Category:Background_Art&imlimit=500&format=json&origin=*", {mode: 'cors'});
		if(response.ok) {
		let json = await response.json();
		let imageTitles = json.query.pages[Object.keys(json.query.pages)[0]].images.map(e => e.title);
		let imagesrc = [];
		for(let i = 0; i < imageTitles.length; i++) {
			let imageResponse = await fetch(`https://dragalialost.wiki/api.php?action=query&prop=imageinfo&iiprop=url&format=json&origin=*&titles=${imageTitles[i]}`, {mode: 'cors'});
			if(imageResponse.ok) {
			let imageJson = await imageResponse.json();
			imagesrc.push({"url": imageJson.query.pages[Object.keys(imageJson.query.pages)[0]].imageinfo[0].url});
			} else {
			console.error(response.code);
			}
		}
		console.log(imagesrc);

		} else {
		console.error(response.code);
		}
	} catch (e) {
		console.error(e);
	}
}