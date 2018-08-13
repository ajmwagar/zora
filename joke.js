const axios = require( "axios" );
const jokeApi = axios.create( {
    baseURL: "https://icanhazdadjoke.com",
    headers: {
        Accept: "application/json"
    }
} );


jokeApi.get("/").then(res => {console.log(res.data.joke)})
