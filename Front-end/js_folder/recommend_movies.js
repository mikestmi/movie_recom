var movies_recom;
var movie_titles = [];
var movie_genres = [];
var recom_data;

/*The function get_recommendations() takes the userId who has the best correlation with the client, makes a GET request to the server
with that Id. The respond is a JSON array with the movies and ratings which that user has voted. Then, the function stores
in an array the movies with the highest rate (5). From these movies take the first 7 and recommend them to the client.*/

function get_recommendations(){
	//Clears the warning field.
	warnText = document.getElementById("warnings");
	warnText.innerHTML = "";

	//Check if the user has voted any movie first. In order to get recommendations a user has to rate at least 3 movies. 
	if (closestUser[1] == -1){
		warnText = document.getElementById("warnings");
	    warnText.innerHTML = "First vote at least 3 movies!";
	        
	}
	else {
				
		//Create and send the GET request to the server, with the userId of the best correlated user.
		var ajax = new XMLHttpRequest();
		console.log(closestUser[0]);
		ajax.open('GET', 'http://35.195.237.186:8010/ratings/' + closestUser[0], true);
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.send();

		movies_recom = [];

		ajax.onload = function() {
			if (ajax.readyState == 4 && ajax.status == 200) {

				//Store the response in a variable user_data.
				var user_data = JSON.parse(ajax.responseText);
				//console.log(user_data);

				//From the response (user_data) collect only the movies with rating 5 in an array (movies_recom[]).
				for (var i = 0; i < user_data.length; i++) {
						if (user_data[i].rating == 5){
							movies_recom.push(user_data[i].movieId);
						}
				}
				//console.log(movies_recom);
			
				//Call getMovie() function with a movieId of the 5 star-rated movies array as an argumen, take the first 7 movies.
				for (var i = 0; i < 7; i++) {
					//console.log(movies_recom[i]);
					getMovie(movies_recom[i]);
					
				}
				console.log(movie_titles, movie_genres);
				
				//Call show_data () function to create a table with the recommended movies and present them to the client.
				show_data(movie_titles, movie_genres);
				
			}
		}
	}
}

//This function takes a movieId as parameter and send a GET request to the server.
function getMovie(movie){
	
	var ajax = new XMLHttpRequest();
	ajax.open('GET', 'http://35.195.237.186:8010/movie/' + movie, true);
	ajax.setRequestHeader('Content-Type', 'application/json');
	ajax.send();

	ajax.onload = function() {
		if (ajax.readyState == 4 && ajax.status == 200) {
			
			//Store the response in a variable recom_data. It contains details about the movie.
			recom_data = JSON.parse(ajax.responseText);
			//console.log(data[0].title);
			movie_titles.push(recom_data[0].title);
			movie_genres.push(recom_data[0].genres);
		}
	}	
}

//This function when is called, creates a table with the collected data about the movies, to recommend the to the client.
function show_data(titles, genres){
	var table = document.createElement("table");						
				var header = document.createElement("th");
				var thText = document.createTextNode("Recommendations");
				header.appendChild(thText);
				table.appendChild(header);
				
				for (var i = 0; i < titles.length; i++) {
		        	var tr = document.createElement("tr");    	
	        		var td1 = document.createElement("td");
	        		var td2 = document.createElement("td");
	        		var td1Text = document.createTextNode(titles[i]);
	        		var td2Text = document.createTextNode(genres[i]);
	        		td1.appendChild(td1Text);
	        		td2.appendChild(td2Text);
		        	tr.appendChild(td1);
		        	tr.appendChild(td2);

		        	table.appendChild(tr);				        				        	
		        }
		        
		    	var divContainer = document.getElementById("contentArea2");
		        divContainer.innerHTML = "";
		        divContainer.appendChild(table);
}