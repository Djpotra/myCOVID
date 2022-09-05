import axios from 'axios'

let geoRequests = axios.create({
    baseURL:'/api/geo',
    timeout:0,
}); 

let dataRequests = axios.create({
    baseURL:'/api/data',
    timeout:0,
});

geoRequests.interceptors.response.use(res=>res.data);

export {
    geoRequests,
    dataRequests
} 