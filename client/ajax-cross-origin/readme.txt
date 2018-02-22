jQuery AJAX Cross Origin 
========================
jQuery plugin to bypass Same-origin_policy using Google Apps Script. 

(http://www.ajax-cross-origin.com) 

Licensed under the Creative Commons Attribution 3.0 Unported License. 
For details, see http://creativecommons.org/licenses/by/3.0/. 
  
(c) 2014, Writen by Erez Ninio. site: www.dealhotelbook.com


Install:
(http://www.ajax-cross-origin.com/install.html)

Download ajax-cross-origin.zip from: http://www.ajax-cross-origin.com
Extract the script file js/jquery.ajax-cross-origin.min.js and copy to your javascript folder (e.g /js).

Add the following to your header page:
<script type="text/javascript" src="[your javascript folder]/jquery.ajax-cross-origin.min.js"></script>


Usage:

	$.ajax({
	  crossOrigin: true,
	  url: url,
	  //dataType: "json", //no need. if you use crossOrigin, the dataType will be override with "json"
	  context: {},
	  success: function(data) {
		  //your code here
		}
	})
 
	OR:
	
	//before the use of $.getJSON you need to set {crossOrigin: true} through $.ajaxSetup
	
	$.ajaxSetup({
		crossOrigin: true
	});
	
	$.getJSON(url, null, function(data) {
		//your code here
	});
