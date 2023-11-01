const axios = require('axios');

async function runCacher() {
  axios.get('https://kidosys.kidoschools.com/api/leads/refresh/redis/data')
    .then((response) => {
      console.log('Cron ran successfully.');
      console.log(response.data);
    });
};

runCacher();