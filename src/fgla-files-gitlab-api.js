// Copyright pushMe-pullYou authors. MIT license.
// jshint esversion: 6
// jshint loopfunc: true
/* globals FGAdivFolders, FGAdivFiles, FGAdivBreadcrumbs */

"use strict";

const FGA = {};

FGA.urlSourceCodeImage = "src/gitlab-solid-red.svg";
FGA.iconInfo = `<img src="${FGA.urlSourceCodeImage}"  alt="GitLab logo" height=18 style=opacity:0.5 >`;
FGA.pathPrevious = "";

FGA.getMenuFilesGitLabApi = function() {
	window.addEventListener("hashchange", FGA.onHashChange, false);

	const htm = `
		<div id = "FGAdivBreadcrumbs" ></div>

		<details open class=details__secondary >

			<summary class=summary__secondary >Folders</summary>

			<div id = "FGAdivFolders" class=nav-menu-div ></div>

		</details>

		<details open  class=details__secondary >

			<summary  class=summary__secondary >Files</summary>

			<div id = "FGAdivFiles" class=nav-menu-div></div>

		</details>

	`;

	return htm;
};

FGA.onHashChange = function() {
	const url = !location.hash ? "" : location.hash.slice(1);

	FGA.path = url.lastIndexOf("/") > 0 ? url.slice(0, url.lastIndexOf("/")) : COR.pathRepo;

	//if (FGA.path === FGA.pathPrevious && FGAdivFiles.innerHTML !== "") {
	//	return;
	//}

	console.log('path', FGA.path );
	FGA.fetchTree(FGA.path);

	FGA.pathPrevious = FGA.path;
};

FGA.fetchTree = function(path = "") {
	FGA.setBreadcrumbs(path);

	//console.log('path', path );
	const prefix = (path.startsWith("public") === false ) ? "public/" : ""
	const url = `https://gitlab.com/api/v4/projects/${COR.groupId}/repository/tree?path=${ prefix }${path}`;
	//console.log('url', url);

	fetch(new Request(url))
		.then(response => response.json())
		.then(json => {
			//console.log('json', json);
			FGA.callbackGitlabPathFileNames(json)
		} );
};

FGA.setBreadcrumbs = function(path) {
	let folders = path ? path.split("/") : [];

	if (folders[0] === "public") {
		folders = folders.slice(1);
	}
	//console.log("folders", folders);

	const htmFolders = folders
		.map((folder, i) => {
			//console.log('folder', folder);
			const str = folders.slice(0, i + 1).join("/");
			//console.log( 'str', str );

			return `<a href="#${str}/"); >${decodeURI(folder)}</a> &raquo; `;
		})
		.join("");

	FGAdivBreadcrumbs.innerHTML = `
		<div style="margin:0.2rem 1rem;" >
			<b>
				<a href=# title="Click to return to home folder" >
					<span style=font-size:28px >&#x2302</span>
				</a> &raquo;
				${htmFolders}
			</b>
		</div>
	`;
};

FGA.callbackGitlabPathFileNames = function(items) {
	//console.log( "items", items );

	if (items.message) {
		//console.log("error", items.message);
		return;
	}

	items = Array.isArray(items) ? items : [items];

	FGAdivFolders.innerHTML = FGA.getFolders(items);

	FGAdivFiles.innerHTML = FGA.getFiles(items);

	let name = location.hash
		? location.hash
				.slice(1)
				.split("/")
				.pop()
		: "README.md";

	name = name ? name : "README.md";
	//console.log( "name", name );

	const divs = FGAdivFiles.querySelectorAll("div.FGAitem");

	divs.forEach(
		dv =>
			(dv.parentElement.style.backgroundColor =
				dv.innerText.trim() === name ? "lightgreen" : "")
	);
};

FGA.getFolders = function(items) {
	const htm = items
		.filter(item => item.type === "tree" && !COR.ignoreFolders.includes(item.name))
		.map(
			item => `
			<div style="margin:0.2rem 1rem;" title="Click to open the folder">
				<a href="#${item.path.replace( /public\//, "")}/"; >
					&#x1f4c1; ${item.name}
				</a>
			</div>
		`
		)
		.join("");

	return htm;
};

FGA.getFiles = function (items = []) {

	//console.log('item', items);
	const htm = items
		.filter(item => item.type === "blob" && !COR.ignoreFiles.includes(item.name))
		.map(item => {
			//console.log( 'item', item );

			FGA.urlGitlabSource = `https://gitlab.com/${COR.group}/${COR.repo}/blob/${FGA.branch}/${item.path}`;

			const urlGitlabPage = `${item.path.slice(COR.pathRepo.length + 1)}`;

			const url = `https://${COR.repo}/${COR.urlGitlabPage}`;

			const str = item.path.endsWith("html")
				? `<a href="${url}"
			title="Open file in new tab" target="_blank" >&#x2750;</a>`
				: "";

			return `
				<div style="margin:0.5rem 1rem"; >
					<div style=display:inline-block; >
					<a href="${FGA.urlGitlabSource}"
							target=_top title="View or edit source code" >
							${FGA.iconInfo}
						</a>
					</div>
					<div style=display:inline-block; class=FGAitem >
					<a href=${location.href.replace(location.hash, "")}#${urlGitlabPage}
						title="Click to view file" >${item.name}
						</a>
					</div>
					<div style=display:inline-block; >${str}</div>
				</div>
			`;
		})
		.join("");

	return htm;
};

FGA.test = function() {
	const links = FGAdivFiles.querySelectorAll("a");
	console.log("links", links);

	let i = 1;

	nextLink();

	function nextLink() {
		links[i].click();

		if (i < links.length - 1) {
			i += 2;

			setTimeout(nextLink, 1000);
		}
	}
};
