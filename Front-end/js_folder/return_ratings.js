var movie_data;
var rest_user_Ratings = [];
var userCorrelations = [];
var closestUser = [-1, -1];



/*The function show_ratings() takes the movie ids that the user has voted and makes a POST to the server.
The response of the server contains data about other users who have rated the same movies. Because of the format of the JSON
array, the data are independed for each client and each movie [{movieId: rating: timestamp: userId: }]. Using a hash map creates
a two dimensional array for the received data with the format [[userIdA: ,rating1: ,rating2: ,..], [userIdB: ,rating1: ,rating2: ,..],..].
In other words from the independed received data creating an array with the ratings for each client.*/

function show_ratings() {
	//Check if the client clicked the button to vote without rating any movie.
	if (ids.length == 0){
		infoText = document.getElementById("movie_votes");
    	infoText.innerHTML = "You haven't voted any movie. Please rate some movies!";
	}
	else {
		//Create an object to store the client's voted movies and his/her rates.
		client.movieId = ids;
		client.ratings = client_votes;
		//console.log(client);

		//Show the movieIds and the ratings the client has voted.
		infoText = document.getElementById("movie_votes");
	    infoText.innerHTML = "You have voted the movies with Ids "+ client.movieId + " with " + client.ratings;
	    warnText = "";

	    //Create and send the POST request to the server.
		var ajax = new XMLHttpRequest();
		ajax.open('POST', 'http://35.195.237.186:8010/ratings');
		ajax.setRequestHeader('Content-Type', 'application/json');
		var jsonArray = {movieList: ids};
		ajax.send(JSON.stringify(jsonArray));

		//Inform the client that the request has been sent to wait for the response.
		warnText = document.getElementById("warnings");
		warnText.innerHTML = "Calculating.. please wait.";
		
		ajax.onload = function() {
			if (ajax.readyState == 4 && ajax.status == 200) {

				//Receive the data from the server.
				movie_data = JSON.parse(ajax.responseText);
				//console.log (movie_data);
				
				/*Insert the received data to the hash map. Most times depending the number of the movies the client has rated
				and the popularity of the movie, the received data are enormous. Inserting all these data to the hash map makes
				the browser freezing and finally it crashes, so only the first 5000 entries of the response are going througth
				the hash map. "How to create hashmap from object by manipulating specific keys", 
				Source: [https://stackoverflow.com/questions/47569647/how-to-create-hashmap-from-object-by-manipulating-specific-keys]*/ 

				let paired_data = []
				movie_data.slice(0,5000).forEach((item) => {
				  if (paired_data.length === 0) {
					paired_data.push({[[item.userId]]: [item.rating]})
				  }else {
					let index = -1;
					paired_data.some((obj, i) => {
					  if (Number(Object.keys(obj)[0]) === item.userId) {
						index = i
						return true;
					  }
					  return false;
					})
					if (index !== -1) {
					  paired_data[index][item.userId].push(item.rating)
					} else {
					  paired_data.push({[item.userId]: [item.rating]})	
					}
				  }
				})

				/*The hash map returns an array with objects. The following code replaces the curly brackets and other symbols
				in order to create a two dimensional array from these data.*/
				var paired_dataStr = JSON.stringify(paired_data);
				var data_array = paired_dataStr.replace(/{"/g, "[").replace(/":\[/g, ",").replace(/}/g, "");
				var userVotes = JSON.parse(data_array);

				//Keep only users who have voted at least 3 movies, in order to get correlation.
				for (var i = 0; i < userVotes.length; i++) {
	                if (userVotes[i].length > 3) { 
	                    rest_user_Ratings.push(userVotes[i]);
	                }
	            }

	            /*Call the function to calculate the correllation between the votes of the client of the web page (client.ratings)
	            and the other users (rest_user_Ratings) who have voted for the same movies*/
				getPearsonCorrelation(client.ratings,rest_user_Ratings);
	    	}
		}
	}
}

/*The function getPearsonCorrelation(x,y) gets two arguments, the array with the client's ratings and the two dimensional array
with ratings of the other users. Stores in a variable the id of the user who's ratings are comparing with the client's and
calculate the correlation between them. Stores the result (answer) in an array with the id of that user. Repeats this for every
user in the rest_user_Ratings array, if there is any better correlation, replace the user id and the result with the new one.
"A JavaScript function to return a Pearson correlation coefficient", Source: [https://memory.psych.mun.ca/tech/js/correlation.shtml]*/

function getPearsonCorrelation(x,y) {

	//Send for calculation each time an array of the two dimensional array. [[userIdA: ,rating1: ,rating2: ,..], [userIdB: ,rating1: ,rating2: ,..],..]
	for (var j = 0; j < y.length; j++){ //Now y = [userIdA: ,rating1: ,rating2: ]

		//Remove from the array and store in a variable the id of the user.
		var currentUser = y[j].shift(); //Now y = [rating1: ,rating2: ,..]
		//console.log(x,y[j]);

		//The following code is the same from the web page i got it.
	    var shortestArrayLength = 0;
	     
	    if(x.length == y[j].length) {
	        shortestArrayLength = x.length;
	    } else if(x.length > y[j].length) {
	        shortestArrayLength = y[j].length;
	    } else {
	        shortestArrayLength = x.length;
	    }
	  
	    var xy = [];
	    var x2 = [];
	    var y2 = [];
	  
	    for(var i=0; i<shortestArrayLength; i++) {
	        xy.push(x[i] * y[j][i]);
	        x2.push(x[i] * x[i]);
	        y2.push(y[j][i] * y[j][i]);
	    }
	  
	    var sum_x = 0;
	    var sum_y = 0;
	    var sum_xy = 0;
	    var sum_x2 = 0;
	    var sum_y2 = 0;
	  
	    for(var i=0; i< shortestArrayLength; i++) {
	        sum_x += x[i];
	        sum_y += y[j][i];
	        sum_xy += xy[i];
	        sum_x2 += x2[i];
	        sum_y2 += y2[i];
	    }
	  
	    var step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
	    var step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
	    var step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
	    var step4 = Math.sqrt(step2 * step3);
	    var answer = step1 / step4;
	  
	  	//Sometimes the answer get the value NaN, so ignore it.
		if (answer !== NaN){
			userCorrelations.push([currentUser,answer]);
	  	}

	  	/*Check if the correlation between the last user and the user who is being examinate now, is greater than the current.
	  	If so replace the userId and the correlation with the new.*/
	    if (answer > closestUser[1]) {
	    	closestUser = [currentUser, answer];
	    }
	}

	/*Inform the client if the Pearson Correlation function has found any other user similar to his/her preferences, in order
	to click the Recommendations button and view the suggested movies according his/her rates. In the other hand, if the
	function could not match the client with any other, inform him/her to make a new search or vote more movies*/
	if (closestUser[1] != -1){
		warnText = document.getElementById("warnings");
    	warnText.innerHTML = "Double click the button to view some recommendations.";
	}
	else {
		warnText = document.getElementById("warnings");
    	warnText.innerHTML = "Oops.. unable to find any movie to recommend you. Please click Search to start again or search for another title!";
	}
	//console.log(userCorrelations);

	//Clear the two arrays with store the votes and the movieIds, which the client has selected.
	client_votes = [];
	ids = [];
	//console.log(closestUser);

}