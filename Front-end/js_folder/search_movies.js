var client_votes = [];
var ids = [];
var warnText = "";
var infoText = "";
var client = new Object();

/*The function show_movies() takes the client's input, makes a POST and shows the response to the client.*/

function show_movies() {
	
	//Create and send the POST request to the server.
	var ajax = new XMLHttpRequest();
	ajax.open('POST', 'http://35.195.237.186:8010/movie');
	ajax.setRequestHeader('Content-Type', 'application/json');
	var textbox = document.getElementById("text_search").value;

	/*Check the client's input, and shows some hints*/
	if (textbox == "" || textbox == " "){
		warnText = document.getElementById("warnings");
	    warnText.innerHTML = "You have to enter a movie title for search.";
	}
	else {
		infoText = document.getElementById("movie_votes");
	    infoText.innerHTML = "You can vote some movies to get recommendations.";
	    closestUser = [-1, -1];
	    movie_titles = [];

	    //Send the input to the server
		ajax.send(JSON.stringify({keyword:textbox}));

		ajax.onload = function() {
			if (ajax.readyState == 4 && ajax.status == 200) {

				var search_data = JSON.parse(ajax.responseText);
				//console.log(search_data.length);

				//If the response is empty, warn the user
				if (search_data.length == 0) {
					warnText = document.getElementById("warnings");
	    			warnText.innerHTML = "Unable to find a movie title.. Please try something else.";
				}			        
		    	else{
		    		/*Create a dynamic table with 4 columns and rows as the returned data length. The first column has the 
		    		MovieIds, the second the Titles, the third the Genres and the fourth contains a form with radio buttons 
		    		for the client's ratings*/

		    		//warnText.innerHTML ="";
		    		//Creates the table
		    		var table = document.createElement("table");

		    		//Create a row for the headers
		    		var header = document.createElement("tr");

		    		var thd1 = document.createElement("td");
		    		var thd2 = document.createElement("td");
		    		var thd3 = document.createElement("td");
		    		var thd4 = document.createElement("td");

					var thText1 = document.createTextNode("Movie Id");
					var thText2 = document.createTextNode("Title");
					var thText3 = document.createTextNode("Genres");
					var thText4 = document.createTextNode("Rating");

					thd1.appendChild(thText1);
					thd2.appendChild(thText2);
					thd3.appendChild(thText3);
					thd4.appendChild(thText4);

					header.appendChild(thd1);
					header.appendChild(thd2);
					header.appendChild(thd3);
					header.appendChild(thd4);

					table.appendChild(header);						

					//Create the rows and the cells with the data from the server.
					for (var i = 0; i < search_data.length; i++) {
			        	var tr = document.createElement("tr");				        	
			        	
		        		var td1 = document.createElement("td");
		        		var td2 = document.createElement("td");
		        		var td3 = document.createElement("td");
		        		var td4 = document.createElement("td");
		        		var td1Text = document.createTextNode(search_data[i].movieId);
		        		var td2Text = document.createTextNode(search_data[i].title);
		        		var td3Text = document.createTextNode(search_data[i].genres);

		        		td1.appendChild(td1Text);
		        		td2.appendChild(td2Text);
		        		td3.appendChild(td3Text);

		        		/*Creates the form with the radio buttons, also adds an Event Listener to get the value from the
		        		radio buttons when one is clicked.*/
		        		var formx = document.createElement("form");
		        		formx.setAttribute("id", "aform");
		        		for (var j = 0; j < 5; j++) {
		        			var radx = document.createElement("input");
		        			radx.addEventListener("change", get_ratings);
							radx.setAttribute("type", "radio");
							radx.setAttribute("id", search_data[i].movieId);
							radx.setAttribute("name","radio-group");
							radx.setAttribute("value",j+1);
							
							formx.appendChild(radx);
						}

		        		td4.appendChild(formx);

			        	tr.appendChild(td1);
		        		tr.appendChild(td2);
		        		tr.appendChild(td3);
		        		tr.appendChild(td4);
		        		//Append all the collected data to the table.
			        	table.appendChild(tr);				        				        	
			        }
			        //Show the table with the data to the client.
			    	var dataTable = document.getElementById("contentArea");
			        dataTable.innerHTML = "";
					
					//If there is a table with recommendations, cleant it.
			        var newTab = document.getElementById("contentArea2");
			        newTab.innerHTML = "";

			        dataTable.appendChild(table);

			        /*A function for the Event listener, to get the pair of the voted movie Id and its rate. Stores them in
			        two arrays*/
			        function get_ratings(){
			        	var value = parseInt(this.attributes["value"].value);
			        	var id = parseInt(this.attributes["id"].value);
			        	client_votes.push(value);
			        	ids.push(id)
			        	//console.log(client_votes, ids);
					}
					

				}
		    }
				
		}
	}
};