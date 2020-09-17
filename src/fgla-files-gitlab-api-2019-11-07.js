/* globals FGAdivBreadcrumbs, FGAdivFolders, FGAdivFiles, FGAdivFooter */
// jshint esversion: 6
// jshint loopfunc: true

"use strict";

const FGA = {};

FGA.pathPrevious = "";

FGA.urlSourceCodeImage = "src/gitlab-solid-red.svg";
FGA.iconInfo = `<img src="${FGA.urlSourceCodeImage}" height=18 style=opacity:0.5 >`;

FGA.getMenuFilesGitLabApi = function() {
	window.addEventListener("hashchange", FGA.onHashChange, false);

	// FGA.accessToken = localStorage.getItem('gitlabAccessToken') || '';

	const htm = `

			<div id = "FGAdivBreadcrumbs" ></div>

			<details open style=margin-top:1rem; >

				<summary>Folders</summary>

				<div id = "FGAdivFolders" ></div>

			</details>

			<details open style=margin-top:1rem; >

				<summary>Files</summary>

				<div id = "FGAdivFiles" ></div>

				<div id = "FGAdivFooter" ></div>

			</details>

		`;

	return htm;
};

FGA.onHashChange = function() {
	const url = !location.hash ? "" : location.hash.slice(1);

	FGA.path = url.lastIndexOf("/") > 0 ? url.slice(0, url.lastIndexOf("/")) : COR.pathRepo;

	//if (FGA.path === FGA.pathPrevious && FGAdivFiles.innerHTML !== "" ) { return; }

	FGA.fetchTree(FGA.path);

	//FGA.pathPrevious = FGA.path;
};

FGA.fetchTree = function(path = "") {
	FGA.setBreadcrumbs(path);

	FGA.urlGitlabApiContents = `https://gitlab.com/api/v4/projects/${COR.groupId}/repository/tree?path=${path}`;

	fetch(new Request(FGA.urlGitlabApiContents))
		.then(response => response.json())
		.then(json => {
			console.log("js1", json);
			FGA.callbackGitlabPathFileNames(json);
		});
};

FGA.setBreadcrumbs = function(path) {
	const folders = path ? path.split("/") : [];
	console.log("folders", folders);

	// why not location hash??
	const htmFolders = folders
		.slice(1)
		.map(
			(folder, i) =>
				`<a href=JavaScript:FGA.fetchTree("${folders
					.slice(0, i + 2)
					.join("/")}"); >${folder}</a> &raquo; `
		)
		.join("");

	FGAdivBreadcrumbs.innerHTML = `<div>
		<b>
			<a href=JavaScript:FGA.fetchTree(COR.pathRepo); title="home folder" >
				<span style=font-size:28px >&#x2302</span>
			</a> &raquo;
		</b>
		${htmFolders}
	</div>`;
};

FGA.callbackGitlabPathFileNames = function(json) {
	FGAdivFolders.innerHTML = FGA.getFolders(json);

	FGAdivFiles.innerHTML = FGA.getFiles(json);

	FGA.urlSourceCode = `https://gitlab.com/${COR.group}/${FGA.COR}`;

	const name = location.hash
		? location.hash
				.slice(1)
				.split("/")
				.pop()
		: "README.md";
	//console.log( "name", name );

	const divs = FGAdivFiles.querySelectorAll("div.FGAitem");

	divs.forEach(
		dv =>
			(dv.parentElement.style.backgroundColor =
				dv.innerText.trim() === name ? "lightgreen" : "")
	);

	//FGA.onHashChange();
};

FGA.getFolders = function(items) {
	const htm = items
		.filter(item => item.type === "tree" && !COR.ignoreFolders.includes(item.name))
		.map(
			item => `
			<div style=margin-top:0.2rem; >
				<a href=JavaScript:FGA.fetchTree("${item.path}"); >
					&#x1f4c1; ${item.name}
				</a>
			</div>
		`
		)
		.join("");

	return htm;
};

FGA.getFiles = function(items = []) {
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
			<div style=margin-top:0.5rem; >
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
