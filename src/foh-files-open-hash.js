// copyright pushMe-pullYou authors. MIT license.
// jshint esversion: 6
/* jshint loopfunc: true */
/* globals showdown */

"use strict";

const FOH = {};

FOH.urlDefaultFile = "README.md";

FOH.regexImages = /\.(jpe?g|png|gif|webp|ico|svg|bmp)$/i;
FOH.regexHtml = /\.(htm?l)$/i;

FOH.onHashChange = function() { // to be simplified

	const url = !location.hash ? FOH.urlDefaultFile : location.hash.slice( 1 );

	//console.log('url', url);

	const file = url.endsWith("/") ? "README.md" : "";

	FOH.urlPath = ""; // `https://${COR.repo}/`;

	FOH.requestFileDecider( FOH.urlPath + url + file );

};

window.addEventListener ( 'hashchange', FOH.onHashChange, false );


FOH.requestFileDecider = function( url ) { // from a button
	//console.log( 'url', url );

	if ( !url ) { return; }

	FOH.fileName = url.split( '/').pop();

	if ( FOH.regexHtml.test( url ) ) {

		FOH.target.innerHTML = `<iframe src=${ url } style="${ FOH.contentsCss }" ></iframe>`;

	} else if ( FOH.regexImages.test( url )  ) {

		FOH.target.innerHTML = `<img src=${ url } >`;

	} else if (FOH.fileName.toLowerCase().endsWith('.zip')) {

		alert("not implemented here");

		//FOH.xhrRequestFileZip( url, FOH.callbackUrlUtf16 );

	} else {

		FOH.requestFileText( url );

	}

};



FOH.requestFileText = function( url ) {

	if ( !url ) { return; }

	FOH.timeStart = performance.now();

	const xhr = new XMLHttpRequest();
	xhr.open( 'GET', url, true );
	xhr.onerror = function( xhr ) { console.log( 'error:', xhr  ); };
	//xhr.onprogress = function (xhr) { console.log('loaded', xhr.loaded ); };
	xhr.onload = function( xhr ) { FOH.callbackDecider( xhr ); };
	xhr.send( null );

};


FOH.callbackDecider = function ( xhr ) {
	//console.log( 'xhr', xhr );

	FOH.text = xhr.target.response;

	const ulc = xhr.target.responseURL.toLowerCase();

	if ( ulc.endsWith( '.md' ) ) {

		FOH.setTargetWithMarkdownAsHtml( xhr.target.response );

	} else {

		FOH.callbackOtherToTextarea( xhr.target.response );

	}

};



FOH.setTargetWithMarkdownAsHtml = function( markdown ) {

	showdown.setFlavor('github');
	const converter = new showdown.Converter();
	const html = converter.makeHtml( markdown );

	FOH.target.innerHTML = html;
	window.scrollTo( 0, 0 );

};


FOH.callbackOtherToTextarea = function( text ){

	FOH.contentsCss = `border: 1px solid #888; height: ${ window.innerHeight - 4 }px; margin: 0; padding:0; width:100%;`;

	FOH.target.innerHTML = `<textarea style="${ FOH.contentsCss }" >${ text }</textarea>`;

};
